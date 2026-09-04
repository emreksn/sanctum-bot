const fs = require('node:fs');
const path = require('node:path');

const YENI_LIG_ID = '2026-09-04-22-gmt-plus-2-challenges-v1';
const dataKlasoru = path.join(process.cwd(), 'data');
const hedefSablonuDosyasi = path.join(__dirname, '..', 'config', 'yeni-lig-hedefleri.json');
const ligDurumuDosyasi = path.join(dataKlasoru, 'lig-durumu.json');
const eskiRolAyarlariDosyasi = path.join(dataKlasoru, 'hedef-rolleri.json');
const hedefDosyasi = path.join(dataKlasoru, 'hedefler.json');
const katilimciDosyasi = path.join(dataKlasoru, 'liderlik-katilimcilari.json');

function jsonOku(dosya, varsayilan) {
  if (!fs.existsSync(dosya)) {
    return varsayilan;
  }

  const icerik = fs.readFileSync(dosya, 'utf8').trim();
  return icerik ? JSON.parse(icerik) : varsayilan;
}

function jsonYaz(dosya, deger) {
  fs.mkdirSync(dataKlasoru, { recursive: true });
  fs.writeFileSync(dosya, `${JSON.stringify(deger, null, 2)}\n`);
}

async function eskiLiderlikRolleriniSil(client) {
  const ayarlar = jsonOku(eskiRolAyarlariDosyasi, []);
  let hataOlustu = false;

  for (const ayar of ayarlar) {
    const guild = await client.guilds.fetch(ayar.guildId).catch(() => null);

    if (!guild) {
      console.warn(`[yeni-lig] Sunucu bulunamadı, eski roller temizlenemedi: ${ayar.guildId}`);
      hataOlustu = true;
      continue;
    }

    const rolIdleri = [...new Set([ayar.bigDaddyRolId, ayar.lilSlutRolId].filter(Boolean))];

    for (const rolId of rolIdleri) {
      let rol;

      try {
        rol = await guild.roles.fetch(rolId);
      } catch (error) {
        if (Number(error.code) === 10011) {
          continue;
        }

        hataOlustu = true;
        console.warn(`[yeni-lig] ${rolId} rolü kontrol edilemedi: ${error.message}`);
        continue;
      }

      if (!rol) {
        continue;
      }

      await rol.delete('Yeni lig için puan rolleri kaldırıldı.').catch((error) => {
        hataOlustu = true;
        console.warn(`[yeni-lig] ${rol.name} rolü silinemedi: ${error.message}`);
      });
    }
  }

  if (!hataOlustu && fs.existsSync(eskiRolAyarlariDosyasi)) {
    fs.unlinkSync(eskiRolAyarlariDosyasi);
  }

  return !hataOlustu;
}

async function yeniLigiHazirla(client) {
  const ligDurumu = jsonOku(ligDurumuDosyasi, null);
  const zatenHazir = ligDurumu?.ligId === YENI_LIG_ID;

  if (!zatenHazir) {
    const hedefSablonlari = jsonOku(hedefSablonuDosyasi, []);
    const olusturulmaTarihi = new Date().toISOString();
    const hedefler = [...client.guilds.cache.keys()].flatMap((guildId) =>
      hedefSablonlari.map((hedef) => ({
        guildId,
        ad: hedef.ad,
        puan: hedef.puan,
        tamamlayanId: null,
        tamamlayanAdi: null,
        tamamlanmaTarihi: null,
        olusturulmaTarihi,
      })),
    );

    jsonYaz(hedefDosyasi, hedefler);
    jsonYaz(katilimciDosyasi, []);
    jsonYaz(ligDurumuDosyasi, {
      ligId: YENI_LIG_ID,
      baslangic: '2026-09-04T20:00:00.000Z',
      hazirlanmaTarihi: new Date().toISOString(),
    });
  }

  const rollerTemizlendi = await eskiLiderlikRolleriniSil(client);

  console.log(`[yeni-lig] Puanlar sıfırlandı: ${zatenHazir ? 'önceden' : 'şimdi'}. Eski roller temizlendi: ${rollerTemizlendi ? 'evet' : 'hayır'}.`);
  return { zatenHazir, rollerTemizlendi };
}

module.exports = { YENI_LIG_ID, yeniLigiHazirla };
