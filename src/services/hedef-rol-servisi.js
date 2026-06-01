const { guildHedefleriniGetir, puanTablosuOlustur } = require('./hedef-deposu');
const {
  guildRolAtamalariniKaydet,
  guildRolAyariGetir,
  tumRolAyarlariGetir,
} = require('./hedef-rol-deposu');
const { guildPuanTablosunaKatilimcilariEkle } = require('./katilimci-deposu');
const { lilSlutAktifMi } = require('./poe2-sezon');

const BIG_DADDY_MINIMUM_PUAN = 10;
const GUNLUK_KONTROL_ARALIGI_MS = 24 * 60 * 60 * 1000;

function bigDaddyAdayiGetir(puanTablosu) {
  const lider = puanTablosu[0];

  if (!lider || lider.puan < BIG_DADDY_MINIMUM_PUAN) {
    return null;
  }

  return lider;
}

function kayitSirasiKarsilastir(a, b) {
  const aKatilim = a.katilimTarihi ? new Date(a.katilimTarihi).getTime() : Number.MAX_SAFE_INTEGER;
  const bKatilim = b.katilimTarihi ? new Date(b.katilimTarihi).getTime() : Number.MAX_SAFE_INTEGER;

  if (aKatilim !== bKatilim) {
    return aKatilim - bKatilim;
  }

  return a.kullaniciAdi.localeCompare(b.kullaniciAdi);
}

function lilSlutAdayiGetir(
  puanTablosu,
  simdi = new Date(),
  mevcutLilSlutKullaniciId = null,
  mevcutLilSlutPuani = null,
) {
  if (!lilSlutAktifMi(simdi)) {
    return null;
  }

  const mevcutLilSlut = puanTablosu.find((kayit) => kayit.kullaniciId === mevcutLilSlutKullaniciId);
  const mevcutPuan = mevcutLilSlut?.puan || 0;

  if (mevcutLilSlutKullaniciId && (mevcutLilSlutPuani === null || mevcutPuan <= mevcutLilSlutPuani)) {
    return mevcutLilSlut || {
      kullaniciId: mevcutLilSlutKullaniciId,
      kullaniciAdi: mevcutLilSlutKullaniciId,
      puan: mevcutPuan,
      katilimTarihi: null,
    };
  }

  const sifirPuanlilar = puanTablosu.filter((kayit) => kayit.puan === 0);

  if (sifirPuanlilar.length === 0) {
    return null;
  }

  return [...sifirPuanlilar].sort(kayitSirasiKarsilastir)[0];
}

async function rolAta(guild, rolId, hedefKullaniciId, oncekiKullaniciId) {
  if (!rolId) {
    return {
      aktifKullaniciId: null,
      uyarilar: [],
    };
  }

  const rol = await guild.roles.fetch(rolId).catch(() => null);

  if (!rol) {
    return {
      aktifKullaniciId: null,
      uyarilar: [`<@&${rolId}> rolü bulunamadı.`],
    };
  }

  const uyarilar = [];

  if (oncekiKullaniciId && oncekiKullaniciId !== hedefKullaniciId) {
    const oncekiUye = await guild.members.fetch(oncekiKullaniciId).catch(() => null);

    if (oncekiUye?.roles.cache.has(rol.id)) {
      await oncekiUye.roles.remove(rol).catch((error) => {
        uyarilar.push(`${rol.name} rolü ${oncekiUye.user.tag} üzerinden kaldırılamadı: ${error.message}`);
      });
    }
  }

  if (!hedefKullaniciId) {
    return {
      aktifKullaniciId: null,
      uyarilar,
    };
  }

  const hedefUye = await guild.members.fetch(hedefKullaniciId).catch(() => null);

  if (!hedefUye) {
    uyarilar.push(`<@${hedefKullaniciId}> sunucuda bulunamadı.`);
    return {
      aktifKullaniciId: null,
      uyarilar,
    };
  }

  let rolVerildi = true;

  if (!hedefUye.roles.cache.has(rol.id)) {
    await hedefUye.roles.add(rol).catch((error) => {
      rolVerildi = false;
      uyarilar.push(`${rol.name} rolü ${hedefUye.user.tag} için verilemedi: ${error.message}`);
    });
  }

  return {
    aktifKullaniciId: rolVerildi ? hedefKullaniciId : null,
    uyarilar,
  };
}

async function hedefRolleriniGuncelle(guild, simdi = new Date()) {
  const ayar = guildRolAyariGetir(guild.id);

  if (!ayar) {
    return {
      atlandi: true,
      sebep: 'rol-ayari-yok',
    };
  }

  const puanTablosu = guildPuanTablosunaKatilimcilariEkle(
    guild.id,
    puanTablosuOlustur(guildHedefleriniGetir(guild.id)),
  );
  const bigDaddy = bigDaddyAdayiGetir(puanTablosu);
  const lilSlut = lilSlutAdayiGetir(
    puanTablosu,
    simdi,
    ayar.aktifLilSlutKullaniciId || null,
    Number.isFinite(ayar.aktifLilSlutPuani) ? ayar.aktifLilSlutPuani : null,
  );
  const bigDaddyRolSonucu = await rolAta(
    guild,
    ayar.bigDaddyRolId,
    bigDaddy?.kullaniciId || null,
    ayar.aktifBigDaddyKullaniciId || null,
  );
  const lilSlutRolSonucu = await rolAta(
    guild,
    ayar.lilSlutRolId,
    lilSlut?.kullaniciId || null,
    ayar.aktifLilSlutKullaniciId || null,
  );
  const uyarilar = [...bigDaddyRolSonucu.uyarilar, ...lilSlutRolSonucu.uyarilar];

  guildRolAtamalariniKaydet({
    guildId: guild.id,
    aktifBigDaddyKullaniciId: bigDaddyRolSonucu.aktifKullaniciId,
    aktifLilSlutKullaniciId: lilSlutRolSonucu.aktifKullaniciId,
    aktifLilSlutPuani: lilSlutRolSonucu.aktifKullaniciId ? lilSlut?.puan || 0 : null,
  });

  return {
    bigDaddy,
    lilSlut,
    uyarilar,
  };
}

async function tumHedefRolleriniGuncelle(client) {
  for (const ayar of tumRolAyarlariGetir()) {
    const guild = await client.guilds.fetch(ayar.guildId).catch(() => null);

    if (!guild) {
      continue;
    }

    const sonuc = await hedefRolleriniGuncelle(guild).catch((error) => ({
      uyarilar: [`${guild.id} hedef rolleri güncellenemedi: ${error.message}`],
    }));

    for (const uyari of sonuc.uyarilar || []) {
      console.warn(`[hedef-rolleri] ${uyari}`);
    }
  }
}

function hedefRolKontrolunuBaslat(client) {
  tumHedefRolleriniGuncelle(client);
  setInterval(() => tumHedefRolleriniGuncelle(client), GUNLUK_KONTROL_ARALIGI_MS);
}

module.exports = {
  BIG_DADDY_MINIMUM_PUAN,
  bigDaddyAdayiGetir,
  hedefRolKontrolunuBaslat,
  hedefRolleriniGuncelle,
  lilSlutAdayiGetir,
};
