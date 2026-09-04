# Sanctum Leaderboard Bot

`discord.js` v14 ile hazırlanmış kalıcı liderlik tablosu ve hedef botu.

## Kurulum

1. `.env.example` dosyasından `.env` oluştur.
2. `DISCORD_TOKEN` ve `DISCORD_CLIENT_ID` değerlerini doldur.
3. Slash komutlarını kaydet:

```bash
npm run deploy
```

4. Botu başlat:

```bash
npm start
```

## Liderlik tablosu

Sunucu yöneticisi `/hedef-skor` komutunu takip panosunun bulunacağı kanalda bir kez çalıştırır. Bot görevlerin durumunu ve liderlik tablosunu birlikte gösteren tek bir embed mesajı oluşturur ve sabitler. Görev veya puan değiştiğinde iki bölüm de aynı mesaj üzerinde otomatik güncellenir. Komut tekrar çalıştırılırsa yeni mesaj göndermek yerine mevcut mesaja özel bir bağlantı döndürür.

Tabloyu daha sonra başka bir kanala taşımak için `/hedef-skor kanal:#yeni-kanal` kullanılır. Bot yeni mesajı oluşturup sabitledikten sonra eski mesajı kaldırır.

Tablo şu işlemlerden sonra otomatik güncellenir:

- Bir oyuncunun `/katıl` ile liderliğe katılması
- Bir hedefin tamamlanması veya geri alınması
- Tamamlanmış bir hedefin puanının değiştirilmesi
- Bir hedefin silinmesi
- Botun yeniden başlatılması ve günlük kontrol

Mesaj silinirse bir sonraki güncellemede aynı kanalda yeniden oluşturulur. Kanal silinirse bir yönetici `/hedef-skor` komutunu yeni kanalda çalıştırarak tabloyu yeniden oluşturabilir.

Botun hedef kanalda Mesajları Görüntüle, Mesaj Gönder, Bağlantı Yerleştir ve Mesajları Yönet izinlerine ihtiyacı vardır.

## Komutlar

```text
/hedef-skor
/katıl
/hedefler
/hedef-ekle ad:"İlk divine orb düşürme" puan:5
/hedef-tamamla sira:1 kisi:@kullanici
/hedef-geri-al sira:1
/hedef-duzenle sira:1 alan:name yeni_ad:"Yeni hedef adı"
/hedef-duzenle sira:1 alan:point yeni_puan:10
/hedef-sil sira:1
```

`/katıl`, 0 puanlı bir oyuncuyu da liderlik tablosuna ekler. Puan kazanan oyuncular katıl komutunu kullanmamış olsalar bile tabloda görünür.

Yeni lig 4 Eylül 2026 saat 22:00'de (GMT+2) başlar. Önceki ligin hedefleri, katılımcıları ve puanları ilk açılışta bir kez sıfırlanır. Eski Big Daddy ve Lil Slut rolleri Discord sunucusundan silinir; yeni sistem herhangi bir puan rolü vermez.

Yeni lig challenge listesi `src/config/yeni-lig-hedefleri.json` dosyasında tutulur ve ilgili deployment'ın ilk açılışında sunucular için otomatik oluşturulur.

## Docker

Bu bot bir worker process olarak çalışır ve port açmaz. Kalıcı liderlik, hedef ve rol kayıtlarının deployment sonrasında korunması için Dokploy üzerinde `/app/data` dizinine volume bağla.

```bash
docker build -t sanctum-bot .
docker run --env-file .env sanctum-bot
```

## Yapı

```text
src/
  commands/       Liderlik ve hedef slash komutları
  config/         Ortam ayarları
  events/         Discord olayları
  handlers/       Komut ve olay yükleyicileri
  services/       Liderlik, hedef, katılımcı ve rol servisleri
  index.js        Bot giriş noktası
scripts/
  deploy-commands.js
data/             Kalıcı çalışma verileri
```
