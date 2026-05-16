const fs = require('node:fs');
const path = require('node:path');

const dataKlasoru = path.join(process.cwd(), 'data');
const hedefDosyasi = path.join(dataKlasoru, 'hedefler.json');

function hedefleriOku() {
  if (!fs.existsSync(hedefDosyasi)) {
    return [];
  }

  const icerik = fs.readFileSync(hedefDosyasi, 'utf8').trim();

  if (!icerik) {
    return [];
  }

  return JSON.parse(icerik);
}

function hedefleriYaz(hedefler) {
  fs.mkdirSync(dataKlasoru, { recursive: true });
  fs.writeFileSync(hedefDosyasi, `${JSON.stringify(hedefler, null, 2)}\n`);
}

function guildHedefleriniGetir(guildId) {
  return hedefleriOku().filter((hedef) => hedef.guildId === guildId);
}

function hedefiSirayaGoreBul(hedefler, guildId, sira) {
  let guildSirasi = 0;

  return hedefler.find((kayit) => {
    if (kayit.guildId !== guildId) {
      return false;
    }

    guildSirasi += 1;
    return guildSirasi === sira;
  });
}

function hedefEkle({ guildId, ad, puan }) {
  const hedefler = hedefleriOku();
  const ayniHedef = hedefler.find(
    (hedef) => hedef.guildId === guildId && hedef.ad.toLocaleLowerCase('tr') === ad.toLocaleLowerCase('tr'),
  );

  if (ayniHedef) {
    return {
      hedef: ayniHedef,
      zatenVardi: true,
    };
  }

  const hedef = {
    guildId,
    ad,
    puan,
    tamamlayanId: null,
    tamamlayanAdi: null,
    tamamlanmaTarihi: null,
    olusturulmaTarihi: new Date().toISOString(),
  };

  hedefler.push(hedef);
  hedefleriYaz(hedefler);

  return {
    hedef,
    zatenVardi: false,
  };
}

function hedefTamamla({ guildId, sira, kullanici }) {
  const hedefler = hedefleriOku();
  const hedef = hedefiSirayaGoreBul(hedefler, guildId, sira);

  if (!hedef) {
    return {
      hata: 'bulunamadi',
    };
  }

  if (hedef.tamamlayanId) {
    return {
      hedef,
      hata: 'tamamlanmis',
    };
  }

  hedef.tamamlayanId = kullanici.id;
  hedef.tamamlayanAdi = kullanici.globalName || kullanici.username;
  hedef.tamamlanmaTarihi = new Date().toISOString();
  hedefleriYaz(hedefler);

  return {
    hedef,
  };
}

function hedefGeriAl({ guildId, sira }) {
  const hedefler = hedefleriOku();
  const hedef = hedefiSirayaGoreBul(hedefler, guildId, sira);

  if (!hedef) {
    return {
      hata: 'bulunamadi',
    };
  }

  if (!hedef.tamamlayanId) {
    return {
      hedef,
      hata: 'tamamlanmamis',
    };
  }

  const oncekiTamamlayanId = hedef.tamamlayanId;
  hedef.tamamlayanId = null;
  hedef.tamamlayanAdi = null;
  hedef.tamamlanmaTarihi = null;
  hedefleriYaz(hedefler);

  return {
    hedef,
    oncekiTamamlayanId,
  };
}

function hedefAdiniDegistir({ guildId, sira, yeniAd }) {
  const hedefler = hedefleriOku();
  const hedef = hedefiSirayaGoreBul(hedefler, guildId, sira);

  if (!hedef) {
    return {
      hata: 'bulunamadi',
    };
  }

  const ayniAdliHedef = hedefler.find(
    (kayit) =>
      kayit !== hedef &&
      kayit.guildId === guildId &&
      kayit.ad.toLocaleLowerCase('tr') === yeniAd.toLocaleLowerCase('tr'),
  );

  if (ayniAdliHedef) {
    return {
      hedef: ayniAdliHedef,
      hata: 'zaten-var',
    };
  }

  const eskiAd = hedef.ad;
  hedef.ad = yeniAd;
  hedef.guncellenmeTarihi = new Date().toISOString();
  hedefleriYaz(hedefler);

  return {
    hedef,
    eskiAd,
  };
}

function hedefPuaniniDegistir({ guildId, sira, yeniPuan }) {
  const hedefler = hedefleriOku();
  const hedef = hedefiSirayaGoreBul(hedefler, guildId, sira);

  if (!hedef) {
    return {
      hata: 'bulunamadi',
    };
  }

  const eskiPuan = hedef.puan;
  hedef.puan = yeniPuan;
  hedef.guncellenmeTarihi = new Date().toISOString();
  hedefleriYaz(hedefler);

  return {
    hedef,
    eskiPuan,
  };
}

function hedefSil({ guildId, sira }) {
  const hedefler = hedefleriOku();
  let guildSirasi = 0;
  const hedefIndex = hedefler.findIndex((kayit) => {
    if (kayit.guildId !== guildId) {
      return false;
    }

    guildSirasi += 1;
    return guildSirasi === sira;
  });

  if (hedefIndex < 0) {
    return {
      hata: 'bulunamadi',
    };
  }

  const [hedef] = hedefler.splice(hedefIndex, 1);
  hedefleriYaz(hedefler);

  return {
    hedef,
  };
}

function puanTablosuOlustur(hedefler) {
  const puanlar = new Map();

  for (const hedef of hedefler) {
    if (!hedef.tamamlayanId) {
      continue;
    }

    const mevcut = puanlar.get(hedef.tamamlayanId) || {
      kullaniciId: hedef.tamamlayanId,
      kullaniciAdi: hedef.tamamlayanAdi,
      puan: 0,
    };

    mevcut.puan += hedef.puan;
    puanlar.set(hedef.tamamlayanId, mevcut);
  }

  return [...puanlar.values()].sort((a, b) => b.puan - a.puan || a.kullaniciAdi.localeCompare(b.kullaniciAdi));
}

module.exports = {
  guildHedefleriniGetir,
  hedefAdiniDegistir,
  hedefEkle,
  hedefGeriAl,
  hedefPuaniniDegistir,
  hedefSil,
  hedefTamamla,
  puanTablosuOlustur,
};
