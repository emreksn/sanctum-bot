const DISCORD_MESAJ_LIMITI = 2000;
const { bigDaddyAdayiGetir, lilSlutAdayiGetir } = require('./hedef-rol-servisi');
const { lilSlutBaslangicTarihi, lilSlutAktifMi, sezonBaslangicTarihi } = require('./poe2-sezon');

function kalanSureyiFormatla(hedefTarih, simdi = new Date()) {
  const kalanMs = Math.max(0, hedefTarih.getTime() - simdi.getTime());
  const toplamSaat = Math.ceil(kalanMs / (60 * 60 * 1000));
  const gun = Math.floor(toplamSaat / 24);
  const saat = toplamSaat % 24;

  if (gun > 0 && saat > 0) {
    return `${gun} gün ${saat} saat`;
  }

  if (gun > 0) {
    return `${gun} gün`;
  }

  return `${saat} saat`;
}

function tamamlanmaTarihiniFormatla(tarihDegeri) {
  if (!tarihDegeri) {
    return null;
  }

  const tarih = new Date(tarihDegeri);

  if (Number.isNaN(tarih.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Europe/Istanbul',
  }).format(tarih);
}

function mesajlariBol(satirlar) {
  const mesajlar = [];
  let aktifMesaj = '';

  for (const satir of satirlar) {
    const sonrakiMesaj = aktifMesaj ? `${aktifMesaj}\n${satir}` : satir;

    if (sonrakiMesaj.length > DISCORD_MESAJ_LIMITI) {
      mesajlar.push(aktifMesaj);
      aktifMesaj = satir;
    } else {
      aktifMesaj = sonrakiMesaj;
    }
  }

  if (aktifMesaj) {
    mesajlar.push(aktifMesaj);
  }

  return mesajlar;
}

function hedefSatiriOlustur(hedef, index) {
  const tamamlanmaTarihi = tamamlanmaTarihiniFormatla(hedef.tamamlanmaTarihi);
  const durum = hedef.tamamlayanId
    ? `✅ Tamamlandı: <@${hedef.tamamlayanId}>${tamamlanmaTarihi ? ` ${tamamlanmaTarihi}` : ''}`
    : '🔴 Tamamlanmadı';

  return `${index + 1}. ${hedef.ad} - ${hedef.puan} Big Daddy puanı - ${durum}`;
}

function liderSatirlariOlustur(puanTablosu, secenekler = {}) {
  const bigDaddy = bigDaddyAdayiGetir(puanTablosu);
  const lilSlut = lilSlutAdayiGetir(
    puanTablosu,
    new Date(),
    secenekler.mevcutLilSlutKullaniciId || null,
    Number.isFinite(secenekler.mevcutLilSlutPuani) ? secenekler.mevcutLilSlutPuani : null,
  );
  const sezonBasladiMi = Date.now() >= sezonBaslangicTarihi.getTime();
  const bigDaddyBeklemeSatiri = sezonBasladiMi
    ? '👑 Big Daddy: 10+ Big Daddy puanlı lider yok.'
    : `👑 Big Daddy: ${kalanSureyiFormatla(sezonBaslangicTarihi)} sonra aktif olacak.`;
  const lilSlutBeklemeSatiri = lilSlutAktifMi()
    ? null
    : `💄 Lil Slut: ${kalanSureyiFormatla(lilSlutBaslangicTarihi)} sonra aktif olacak.`;

  return [
    '**🏆 Liderler**',
    ...(puanTablosu.length > 0
      ? puanTablosu.map(
        (kayit, index) => `${index + 1}. <@${kayit.kullaniciId}> - ${kayit.puan} Big Daddy puanı`,
      )
      : ['Henüz puan alan yok.']),
    '',
    bigDaddy ? `👑 Big Daddy: <@${bigDaddy.kullaniciId}> (${bigDaddy.puan} Big Daddy puanı)` : bigDaddyBeklemeSatiri,
    lilSlut ? `💄 Lil Slut: <@${lilSlut.kullaniciId}> (${lilSlut.puan} Big Daddy puanı)` : lilSlutBeklemeSatiri,
  ];
}

module.exports = {
  kalanSureyiFormatla,
  mesajlariBol,
  hedefSatiriOlustur,
  liderSatirlariOlustur,
  tamamlanmaTarihiniFormatla,
};
