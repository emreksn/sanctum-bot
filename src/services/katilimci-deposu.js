const fs = require('node:fs');
const path = require('node:path');

const dataKlasoru = path.join(process.cwd(), 'data');
const katilimciDosyasi = path.join(dataKlasoru, 'liderlik-katilimcilari.json');

function katilimcilariOku() {
  if (!fs.existsSync(katilimciDosyasi)) {
    return [];
  }

  const icerik = fs.readFileSync(katilimciDosyasi, 'utf8').trim();

  if (!icerik) {
    return [];
  }

  return JSON.parse(icerik);
}

function katilimcilariYaz(katilimcilar) {
  fs.mkdirSync(dataKlasoru, { recursive: true });
  fs.writeFileSync(katilimciDosyasi, `${JSON.stringify(katilimcilar, null, 2)}\n`);
}

function guildKatilimcileriniGetir(guildId) {
  return katilimcilariOku().filter((katilimci) => katilimci.guildId === guildId);
}

function liderligeKatil({ guildId, kullanici }) {
  const katilimcilar = katilimcilariOku();
  const kullaniciAdi = kullanici.globalName || kullanici.username;
  const mevcut = katilimcilar.find(
    (katilimci) => katilimci.guildId === guildId && katilimci.kullaniciId === kullanici.id,
  );

  if (mevcut) {
    if (mevcut.kullaniciAdi !== kullaniciAdi) {
      mevcut.kullaniciAdi = kullaniciAdi;
      mevcut.guncellenmeTarihi = new Date().toISOString();
      katilimcilariYaz(katilimcilar);
    }

    return {
      katilimci: mevcut,
      zatenVardi: true,
    };
  }

  const katilimci = {
    guildId,
    kullaniciId: kullanici.id,
    kullaniciAdi,
    katilimTarihi: new Date().toISOString(),
  };

  katilimcilar.push(katilimci);
  katilimcilariYaz(katilimcilar);

  return {
    katilimci,
    zatenVardi: false,
  };
}

function puanTablosunaKatilimcilariEkle(puanTablosu, katilimcilar) {
  const katilimSirasi = new Map(katilimcilar.map((katilimci, index) => [katilimci.kullaniciId, index]));
  const puanlar = new Map(
    puanTablosu.map((kayit) => [
      kayit.kullaniciId,
      {
        ...kayit,
        katilimTarihi: katilimcilar.find((katilimci) => katilimci.kullaniciId === kayit.kullaniciId)?.katilimTarihi || null,
      },
    ]),
  );

  for (const katilimci of katilimcilar) {
    if (puanlar.has(katilimci.kullaniciId)) {
      continue;
    }

    puanlar.set(katilimci.kullaniciId, {
      kullaniciId: katilimci.kullaniciId,
      kullaniciAdi: katilimci.kullaniciAdi,
      puan: 0,
      katilimTarihi: katilimci.katilimTarihi,
    });
  }

  return [...puanlar.values()].sort((a, b) => {
    if (b.puan !== a.puan) {
      return b.puan - a.puan;
    }

    const aSira = katilimSirasi.has(a.kullaniciId) ? katilimSirasi.get(a.kullaniciId) : Number.MAX_SAFE_INTEGER;
    const bSira = katilimSirasi.has(b.kullaniciId) ? katilimSirasi.get(b.kullaniciId) : Number.MAX_SAFE_INTEGER;

    if (aSira !== bSira) {
      return aSira - bSira;
    }

    return a.kullaniciAdi.localeCompare(b.kullaniciAdi);
  });
}

function guildPuanTablosunaKatilimcilariEkle(guildId, puanTablosu) {
  return puanTablosunaKatilimcilariEkle(puanTablosu, guildKatilimcileriniGetir(guildId));
}

module.exports = {
  guildKatilimcileriniGetir,
  guildPuanTablosunaKatilimcilariEkle,
  katilimcilariOku,
  liderligeKatil,
  puanTablosunaKatilimcilariEkle,
};
