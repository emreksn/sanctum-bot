const fs = require('node:fs');
const path = require('node:path');

const dataKlasoru = path.join(process.cwd(), 'data');
const rolDosyasi = path.join(dataKlasoru, 'hedef-rolleri.json');

function rolleriOku() {
  if (!fs.existsSync(rolDosyasi)) {
    return [];
  }

  const icerik = fs.readFileSync(rolDosyasi, 'utf8').trim();

  if (!icerik) {
    return [];
  }

  return JSON.parse(icerik);
}

function rolleriYaz(kayitlar) {
  fs.mkdirSync(dataKlasoru, { recursive: true });
  fs.writeFileSync(rolDosyasi, `${JSON.stringify(kayitlar, null, 2)}\n`);
}

function guildRolAyariGetir(guildId) {
  return rolleriOku().find((kayit) => kayit.guildId === guildId) || null;
}

function tumRolAyarlariGetir() {
  return rolleriOku();
}

function guildRolAyariKaydet({ guildId, bigDaddyRolId, lilSlutRolId }) {
  const kayitlar = rolleriOku();
  const mevcut = kayitlar.find((kayit) => kayit.guildId === guildId);

  if (mevcut) {
    if (bigDaddyRolId) {
      mevcut.bigDaddyRolId = bigDaddyRolId;
    }

    if (lilSlutRolId) {
      mevcut.lilSlutRolId = lilSlutRolId;
    }

    mevcut.guncellenmeTarihi = new Date().toISOString();
    rolleriYaz(kayitlar);
    return mevcut;
  }

  const yeniKayit = {
    guildId,
    bigDaddyRolId: bigDaddyRolId || null,
    lilSlutRolId: lilSlutRolId || null,
    olusturulmaTarihi: new Date().toISOString(),
  };

  kayitlar.push(yeniKayit);
  rolleriYaz(kayitlar);
  return yeniKayit;
}

function guildRolAtamalariniKaydet({ guildId, aktifBigDaddyKullaniciId, aktifLilSlutKullaniciId }) {
  const kayitlar = rolleriOku();
  const mevcut = kayitlar.find((kayit) => kayit.guildId === guildId);

  if (!mevcut) {
    return null;
  }

  mevcut.aktifBigDaddyKullaniciId = aktifBigDaddyKullaniciId || null;
  mevcut.aktifLilSlutKullaniciId = aktifLilSlutKullaniciId || null;
  mevcut.guncellenmeTarihi = new Date().toISOString();
  rolleriYaz(kayitlar);
  return mevcut;
}

module.exports = {
  guildRolAtamalariniKaydet,
  guildRolAyariGetir,
  guildRolAyariKaydet,
  tumRolAyarlariGetir,
};
