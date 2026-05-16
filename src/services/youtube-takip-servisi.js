const { config } = require('../config/env');
const { abonelikleriOku, abonelikGuncelle } = require('./abonelik-deposu');
const { youtubeSonVideolariGetir } = require('./youtube-servisi');

const VIDEO_GECMIS_LIMITI = 5;

let calisiyor = false;

async function abonelikleriKontrolEt(client, secenekler = {}) {
  if (calisiyor) {
    return {
      calisiyor: true,
      kontrolEdilen: 0,
    };
  }

  calisiyor = true;

  try {
    const abonelikler = abonelikleriOku().filter((abonelik) => {
      if (!secenekler.guildId) {
        return true;
      }

      return abonelik.guildId === secenekler.guildId;
    });
    let kontrolEdilen = 0;

    for (const abonelik of abonelikler) {
      await abonelikKontrolEt(client, abonelik);
      kontrolEdilen += 1;
    }

    return {
      calisiyor: false,
      kontrolEdilen,
    };
  } finally {
    calisiyor = false;
  }
}

async function abonelikKontrolEt(client, abonelik) {
  try {
    const videolar = await youtubeSonVideolariGetir(abonelik.youtubeKanalId);

    if (videolar.length === 0) {
      return;
    }

    const siraliVideolar = [...videolar].sort((a, b) => videoZamani(b) - videoZamani(a));
    const videoGecmisi = videoGecmisiniHazirla(abonelik, siraliVideolar);

    if (!abonelik.sonVideoId && videoGecmisi.length === 0) {
      abonelikGuncelle(abonelik.youtubeKanalId, abonelik.discordKanalId, {
        sonVideoId: siraliVideolar[0].id,
        sonVideoGecmisi: videoGecmisiniGuncelle([], siraliVideolar.slice(0, VIDEO_GECMIS_LIMITI)),
        sonKontrolTarihi: new Date().toISOString(),
      });
      return;
    }

    const gorulenVideoIdleri = new Set(videoGecmisi.map((video) => video.id));
    const sonGorulenZaman = videoGecmisi.reduce(
      (enYeni, video) => Math.max(enYeni, videoZamani(video)),
      0,
    );
    let yeniVideolar = siraliVideolar.filter(
      (video) => !gorulenVideoIdleri.has(video.id) && videoZamani(video) > sonGorulenZaman,
    );

    if (sonGorulenZaman === 0) {
      yeniVideolar = yeniVideolar.slice(0, 1);
    }

    if (yeniVideolar.length === 0) {
      abonelikGuncelle(abonelik.youtubeKanalId, abonelik.discordKanalId, {
        sonVideoId: siraliVideolar[0].id,
        sonVideoGecmisi: videoGecmisiniGuncelle(videoGecmisi, siraliVideolar.slice(0, VIDEO_GECMIS_LIMITI)),
        sonKontrolTarihi: new Date().toISOString(),
      });
      return;
    }

    const discordKanali = await client.channels.fetch(abonelik.discordKanalId).catch(() => null);

    if (!discordKanali?.isTextBased()) {
      console.warn(`[youtube] Discord kanalı bulunamadı: ${abonelik.discordKanalId}`);
      return;
    }

    for (const video of [...yeniVideolar].reverse()) {
      await discordKanali.send(`${abonelik.youtubeKanalAdi} kanalı yeni bir video yükledi:\n${video.link}`);
    }

    abonelikGuncelle(abonelik.youtubeKanalId, abonelik.discordKanalId, {
      sonVideoId: siraliVideolar[0].id,
      sonVideoGecmisi: videoGecmisiniGuncelle(
        videoGecmisi,
        [...yeniVideolar, ...siraliVideolar.slice(0, VIDEO_GECMIS_LIMITI)],
      ),
      sonKontrolTarihi: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`[youtube] Abonelik kontrol edilemedi: ${abonelik.youtubeKanalId}`, error);
  }
}

function videoZamani(video) {
  const zaman = Date.parse(video.yayinTarihi || '');
  return Number.isNaN(zaman) ? 0 : zaman;
}

function videoGecmisiniHazirla(abonelik, videolar) {
  const gecmis = Array.isArray(abonelik.sonVideoGecmisi) ? abonelik.sonVideoGecmisi : [];
  const videoHaritasi = new Map(videolar.map((video) => [video.id, video]));
  const adaylar = [];

  for (const kayit of gecmis) {
    if (typeof kayit === 'string') {
      const video = videoHaritasi.get(kayit);
      adaylar.push({ id: kayit, yayinTarihi: video?.yayinTarihi || null });
      continue;
    }

    if (kayit?.id) {
      const video = videoHaritasi.get(kayit.id);
      adaylar.push({
        id: kayit.id,
        yayinTarihi: kayit.yayinTarihi || video?.yayinTarihi || null,
      });
    }
  }

  if (abonelik.sonVideoId && !adaylar.some((video) => video.id === abonelik.sonVideoId)) {
    const video = videoHaritasi.get(abonelik.sonVideoId);
    adaylar.push({
      id: abonelik.sonVideoId,
      yayinTarihi: video?.yayinTarihi || null,
    });
  }

  return videoGecmisiniGuncelle([], adaylar);
}

function videoGecmisiniGuncelle(mevcutGecmis, yeniVideolar) {
  const benzersizVideolar = new Map();

  for (const video of [...mevcutGecmis, ...yeniVideolar]) {
    if (!video?.id || benzersizVideolar.has(video.id)) {
      continue;
    }

    benzersizVideolar.set(video.id, {
      id: video.id,
      yayinTarihi: video.yayinTarihi || null,
    });
  }

  return [...benzersizVideolar.values()]
    .sort((a, b) => videoZamani(b) - videoZamani(a))
    .slice(0, VIDEO_GECMIS_LIMITI);
}

function youtubeTakipServisiniBaslat(client) {
  abonelikleriKontrolEt(client);

  setInterval(() => {
    abonelikleriKontrolEt(client);
  }, config.youtubeKontrolAraligiMs);

  console.log(`[youtube] Takip servisi başlatıldı. Kontrol aralığı: ${config.youtubeKontrolAraligiMs}ms.`);
}

module.exports = {
  abonelikleriKontrolEt,
  youtubeTakipServisiniBaslat,
};
