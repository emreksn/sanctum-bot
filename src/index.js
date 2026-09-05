const { Client, GatewayIntentBits } = require('discord.js');
const { config } = require('./config/env');
const { loadCommands } = require('./handlers/command-handler');
const { loadEvents } = require('./handlers/event-handler');

const ILK_GIRIS_BEKLEMESI_MS = 5000;
const MAKSIMUM_GIRIS_BEKLEMESI_MS = 60000;

function bekle(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function discordGirisiniBaslat() {
  let deneme = 0;

  while (true) {
    const client = new Client({
      intents: [GatewayIntentBits.Guilds],
    });

    client.commands = loadCommands();
    loadEvents(client);

    try {
      await client.login(config.discordToken);
      return;
    } catch (error) {
      deneme += 1;
      const beklemeSuresi = Math.min(
        ILK_GIRIS_BEKLEMESI_MS * (2 ** (deneme - 1)),
        MAKSIMUM_GIRIS_BEKLEMESI_MS,
      );

      console.error(
        `[discord] Giriş başarısız (${error.code || error.message}). ` +
        `${beklemeSuresi / 1000} saniye sonra tekrar denenecek.`,
      );
      await bekle(beklemeSuresi);
    }
  }
}

void discordGirisiniBaslat();
