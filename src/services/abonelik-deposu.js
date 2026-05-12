const fs = require('node:fs');
const path = require('node:path');

const dataKlasoru = path.join(process.cwd(), 'data');
const abonelikDosyasi = path.join(dataKlasoru, 'abonelikler.json');

function abonelikleriOku() {
  if (!fs.existsSync(abonelikDosyasi)) {
    return [];
  }

  const icerik = fs.readFileSync(abonelikDosyasi, 'utf8').trim();

  if (!icerik) {
    return [];
  }

  return JSON.parse(icerik);
}

function abonelikleriYaz(abonelikler) {
  fs.mkdirSync(dataKlasoru, { recursive: true });
  fs.writeFileSync(abonelikDosyasi, `${JSON.stringify(abonelikler, null, 2)}\n`);
}

function abonelikEkle(yeniAbonelik) {
  const abonelikler = abonelikleriOku();
  const mevcutIndex = abonelikler.findIndex(
    (abonelik) =>
      (abonelik.youtubeKanalId === yeniAbonelik.youtubeKanalId ||
        abonelik.youtubeKanalLinki === yeniAbonelik.youtubeKanalLinki) &&
      abonelik.discordKanalId === yeniAbonelik.discordKanalId,
  );

  const kayit = {
    ...yeniAbonelik,
    olusturulmaTarihi: new Date().toISOString(),
  };

  if (mevcutIndex >= 0) {
    abonelikler[mevcutIndex] = {
      ...abonelikler[mevcutIndex],
      ...kayit,
      olusturulmaTarihi: abonelikler[mevcutIndex].olusturulmaTarihi,
      guncellenmeTarihi: new Date().toISOString(),
    };
  } else {
    abonelikler.push(kayit);
  }

  abonelikleriYaz(abonelikler);
  return {
    abonelik: mevcutIndex >= 0 ? abonelikler[mevcutIndex] : kayit,
    zatenVardi: mevcutIndex >= 0,
  };
}

function abonelikGuncelle(youtubeKanalId, discordKanalId, guncelAlanlar) {
  const abonelikler = abonelikleriOku();
  const abonelik = abonelikler.find(
    (kayit) => kayit.youtubeKanalId === youtubeKanalId && kayit.discordKanalId === discordKanalId,
  );

  if (!abonelik) {
    return null;
  }

  Object.assign(abonelik, guncelAlanlar);
  abonelikleriYaz(abonelikler);
  return abonelik;
}

module.exports = {
  abonelikleriOku,
  abonelikEkle,
  abonelikGuncelle,
};
