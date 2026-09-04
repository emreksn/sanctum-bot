const fs = require('node:fs');
const path = require('node:path');

const dataKlasoru = path.join(process.cwd(), 'data');
const liderlikMesajiDosyasi = path.join(dataKlasoru, 'liderlik-mesajlari.json');

function liderlikMesajlariniOku() {
  if (!fs.existsSync(liderlikMesajiDosyasi)) {
    return [];
  }

  const icerik = fs.readFileSync(liderlikMesajiDosyasi, 'utf8').trim();
  return icerik ? JSON.parse(icerik) : [];
}

function liderlikMesajlariniYaz(ayarlar) {
  fs.mkdirSync(dataKlasoru, { recursive: true });
  fs.writeFileSync(liderlikMesajiDosyasi, `${JSON.stringify(ayarlar, null, 2)}\n`);
}

function guildLiderlikMesajiGetir(guildId) {
  return liderlikMesajlariniOku().find((ayar) => ayar.guildId === guildId) || null;
}

function guildLiderlikMesajiKaydet({ guildId, kanalId, mesajId }) {
  const ayarlar = liderlikMesajlariniOku();
  const mevcut = ayarlar.find((ayar) => ayar.guildId === guildId);
  const yeniAyar = {
    guildId,
    kanalId,
    mesajId,
    guncellenmeTarihi: new Date().toISOString(),
  };

  if (mevcut) {
    Object.assign(mevcut, yeniAyar);
  } else {
    ayarlar.push(yeniAyar);
  }

  liderlikMesajlariniYaz(ayarlar);
  return yeniAyar;
}

module.exports = {
  guildLiderlikMesajiGetir,
  guildLiderlikMesajiKaydet,
  liderlikMesajlariniOku,
};
