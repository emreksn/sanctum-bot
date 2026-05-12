const { config } = require('../config/env');
const { abonelikleriOku, abonelikGuncelle } = require('./abonelik-deposu');
const { youtubeSonVideolariGetir } = require('./youtube-servisi');

let calisiyor = false;

async function abonelikleriKontrolEt(client) {
  if (calisiyor) {
    return;
  }

  calisiyor = true;

  try {
    const abonelikler = abonelikleriOku();

    for (const abonelik of abonelikler) {
      await abonelikKontrolEt(client, abonelik);
    }
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

    if (!abonelik.sonVideoId) {
      abonelikGuncelle(abonelik.youtubeKanalId, abonelik.discordKanalId, {
        sonVideoId: videolar[0].id,
      });
      return;
    }

    const sonGorulenIndex = videolar.findIndex((video) => video.id === abonelik.sonVideoId);
    const yeniVideolar = sonGorulenIndex === -1 ? [videolar[0]] : videolar.slice(0, sonGorulenIndex);

    if (yeniVideolar.length === 0) {
      return;
    }

    const discordKanali = await client.channels.fetch(abonelik.discordKanalId).catch(() => null);

    if (!discordKanali?.isTextBased()) {
      console.warn(`[youtube] Discord kanalı bulunamadı: ${abonelik.discordKanalId}`);
      return;
    }

    for (const video of yeniVideolar.reverse()) {
      await discordKanali.send(`${abonelik.youtubeKanalAdi} kanalı yeni bir video yükledi:\n${video.link}`);
    }

    abonelikGuncelle(abonelik.youtubeKanalId, abonelik.discordKanalId, {
      sonVideoId: videolar[0].id,
      sonKontrolTarihi: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`[youtube] Abonelik kontrol edilemedi: ${abonelik.youtubeKanalId}`, error);
  }
}

function youtubeTakipServisiniBaslat(client) {
  abonelikleriKontrolEt(client);

  setInterval(() => {
    abonelikleriKontrolEt(client);
  }, config.youtubeKontrolAraligiMs);

  console.log(`[youtube] Takip servisi başlatıldı. Kontrol aralığı: ${config.youtubeKontrolAraligiMs}ms.`);
}

module.exports = {
  youtubeTakipServisiniBaslat,
};
