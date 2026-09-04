const DISCORD_MESAJ_LIMITI = 2000;

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

  return `${index + 1}. ${hedef.ad} - ${hedef.puan} puan - ${durum}`;
}

function sabitHedefSatirlariOlustur(hedefler) {
  if (hedefler.length === 0) {
    return ['Henüz görev eklenmemiş.'];
  }

  return hedefler.map((hedef, index) => {
    const durum = hedef.tamamlayanId
      ? `✅ ~~${hedef.ad}~~ — **${hedef.puan}p** • <@${hedef.tamamlayanId}>`
      : `⬜ ${hedef.ad} — **${hedef.puan}p**`;

    return `${index + 1}. ${durum}`;
  });
}

function liderSatirlariOlustur(puanTablosu, secenekler = {}) {
  return [
    ...(secenekler.baslikEkle === false ? [] : ['**🏆 Liderler**']),
    ...(puanTablosu.length > 0
      ? puanTablosu.map(
        (kayit, index) => `${index + 1}. <@${kayit.kullaniciId}> — **${kayit.puan} puan**`,
      )
      : ['Yeni ligde henüz katılımcı yok.']),
  ].filter((satir) => satir !== null && satir !== undefined);
}

module.exports = {
  mesajlariBol,
  hedefSatiriOlustur,
  liderSatirlariOlustur,
  sabitHedefSatirlariOlustur,
  tamamlanmaTarihiniFormatla,
};
