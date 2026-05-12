# Sanctum Bot

`discord.js` v14 ile hazırlanmış organize Discord bot altyapısı.

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

## Komutlar

YouTube kanalı takip etmek için:

```text
/abone-ol youtube_linki:https://www.youtube.com/@kanal discord_kanal_id:123456789012345678
```

Bot yeni video gördüğünde hedef kanala şu formatta mesaj gönderir:

```text
Kanal Adı kanalı yeni bir video yükledi:
https://www.youtube.com/watch?v=...
```

## Dokploy / Docker

Projede minimal `node:22-alpine` Dockerfile bulunur.

Dokploy üzerinde bu environment variable değerlerini tanımla:

```text
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_application_client_id_here
YOUTUBE_KONTROL_ARALIGI_MS=300000
```

Bu bot HTTP uygulaması değil, worker process olarak çalışır. Port expose etmez.

Aboneliklerin deployment sonrasında kaybolmaması için Dokploy üzerinde `/app/data` için volume tanımla.

Lokal build:

```bash
docker build -t sanctum-bot .
```

Lokal çalıştırma:

```bash
docker run --env-file .env sanctum-bot
```

## Yapi

```text
src/
  commands/       Slash komut modülleri
  config/         Ortam ve runtime ayarları
  events/         Discord client event modülleri
  handlers/       Komut ve event yükleyiciler
  services/       YouTube takip ve veri servisleri
  index.js        Bot giris noktasi
scripts/
  deploy-commands.js
data/
  abonelikler.json
```

## Komut Ekleme

`src/commands` içinde bir dosya oluştur, `data` ve `execute` export et.

```js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('merhaba')
    .setDescription('Merhaba mesajı gönderir.'),

  async execute(interaction) {
    await interaction.reply('Merhaba.');
  },
};
```
