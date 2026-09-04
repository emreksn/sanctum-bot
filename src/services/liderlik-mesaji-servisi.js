const { EmbedBuilder } = require('discord.js');
const { guildHedefleriniGetir, puanTablosuOlustur } = require('./hedef-deposu');
const { liderSatirlariOlustur } = require('./hedef-mesajlari');
const { guildPuanTablosunaKatilimcilariEkle } = require('./katilimci-deposu');
const {
  guildLiderlikMesajiGetir,
  guildLiderlikMesajiKaydet,
  liderlikMesajlariniOku,
} = require('./liderlik-mesaji-deposu');

const GUNCELLEME_ARALIGI_MS = 24 * 60 * 60 * 1000;
const EMBED_ACIKLAMA_LIMITI = 4096;
const EMBED_TOPLAM_LIMITI = 5900;
const guncellemeKuyruklari = new Map();

function liderlikEmbedleriniOlustur(guildId) {
  const hedefler = guildHedefleriniGetir(guildId);
  const puanTablosu = guildPuanTablosunaKatilimcilariEkle(
    guildId,
    puanTablosuOlustur(hedefler),
  );
  const satirlar = liderSatirlariOlustur(puanTablosu, {
    baslikEkle: false,
  });
  const aciklamalar = [];
  let aktif = '';
  let toplamUzunluk = 0;

  for (let index = 0; index < satirlar.length; index += 1) {
    const satir = satirlar[index];
    const eklenecek = aktif ? `\n${satir}` : satir;

    if (toplamUzunluk + eklenecek.length > EMBED_TOPLAM_LIMITI) {
      const kalan = satirlar.length - index;
      const ozet = `\n\n…ve ${kalan} satır daha.`;
      aktif = `${aktif.slice(0, EMBED_ACIKLAMA_LIMITI - ozet.length)}${ozet}`;
      break;
    }

    if (aktif && aktif.length + eklenecek.length > EMBED_ACIKLAMA_LIMITI) {
      aciklamalar.push(aktif);
      aktif = satir;
    } else {
      aktif += eklenecek;
    }

    toplamUzunluk += eklenecek.length;
  }

  if (aktif) {
    aciklamalar.push(aktif);
  }

  return aciklamalar.map((aciklama, index) => {
    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setDescription(aciklama);

    if (index === 0) {
      embed
        .setTitle('🏆 Liderlik Tablosu')
        .setFooter({ text: 'Yeni lig: 4 Eylül 2026, 22:00 GMT+2 • Otomatik güncellenir' })
        .setTimestamp();
    }

    return embed;
  });
}

async function liderlikMesajiniGuncelle({ client, guildId, hedefKanal = null }) {
  const oncekiIslem = guncellemeKuyruklari.get(guildId) || Promise.resolve();
  const islem = oncekiIslem.catch(() => null).then(async () => {
    const ayar = guildLiderlikMesajiGetir(guildId);
    let kanalId = ayar?.kanalId || hedefKanal?.id;

    if (!kanalId) {
      return { atlandi: true, sebep: 'liderlik-mesaji-yok' };
    }

    let kanal = hedefKanal?.id === kanalId
      ? hedefKanal
      : await client.channels.fetch(kanalId).catch(() => null);

    if ((!kanal?.isTextBased() || !kanal.messages || typeof kanal.send !== 'function') && hedefKanal) {
      kanal = hedefKanal;
      kanalId = hedefKanal.id;
    }

    if (!kanal?.isTextBased() || !kanal.messages || typeof kanal.send !== 'function') {
      throw new Error('Liderlik mesajı kanalı bulunamadı veya bu kanala mesaj gönderilemiyor.');
    }

    const embeds = liderlikEmbedleriniOlustur(guildId);
    let mesaj = null;
    let yenidenOlusturuldu = false;
    let sabitlemeHatasi = null;

    if (ayar?.mesajId && ayar.kanalId === kanal.id) {
      try {
        mesaj = await kanal.messages.edit(ayar.mesajId, {
          content: null,
          embeds,
          allowedMentions: { parse: [] },
        });
      } catch (error) {
        if (Number(error.code) !== 10008) {
          throw error;
        }
      }
    }

    if (!mesaj) {
      mesaj = await kanal.send({ embeds, allowedMentions: { parse: [] } });
      yenidenOlusturuldu = Boolean(ayar?.mesajId);
      guildLiderlikMesajiKaydet({ guildId, kanalId: kanal.id, mesajId: mesaj.id });
    }

    if (hedefKanal && !mesaj.pinned) {
      await mesaj.pin().catch((error) => {
        sabitlemeHatasi = error;
        console.warn(`[liderlik-mesaji] Mesaj sabitlenemedi (${guildId}): ${error.message}`);
      });
    }

    return { mesaj, yenidenOlusturuldu, sabitlemeHatasi };
  });

  guncellemeKuyruklari.set(guildId, islem);

  try {
    return await islem;
  } finally {
    if (guncellemeKuyruklari.get(guildId) === islem) {
      guncellemeKuyruklari.delete(guildId);
    }
  }
}

async function tumLiderlikMesajlariniGuncelle(client) {
  for (const ayar of liderlikMesajlariniOku()) {
    await liderlikMesajiniGuncelle({ client, guildId: ayar.guildId }).catch((error) => {
      console.warn(`[liderlik-mesaji] ${ayar.guildId} güncellenemedi: ${error.message}`);
    });
  }
}

function liderlikMesajiGuncellemeleriniBaslat(client) {
  void tumLiderlikMesajlariniGuncelle(client);
  setInterval(() => void tumLiderlikMesajlariniGuncelle(client), GUNCELLEME_ARALIGI_MS);
}

async function liderlikMesajiniSessizceGuncelle(interaction) {
  return liderlikMesajiniGuncelle({
    client: interaction.client,
    guildId: interaction.guildId,
  }).catch((error) => {
    console.warn(`[liderlik-mesaji] ${interaction.guildId} güncellenemedi: ${error.message}`);
    return { hata: error };
  });
}

module.exports = {
  liderlikEmbedleriniOlustur,
  liderlikMesajiGuncellemeleriniBaslat,
  liderlikMesajiniGuncelle,
  liderlikMesajiniSessizceGuncelle,
  tumLiderlikMesajlariniGuncelle,
};
