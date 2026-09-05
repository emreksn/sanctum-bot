const { REST, Routes } = require('discord.js');
const { config } = require('../src/config/env');
const { loadCommands } = require('../src/handlers/command-handler');

const MAKSIMUM_DENEME = 3;

function bekle(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function komutlariKaydet(rest, commands) {
  for (let deneme = 1; deneme <= MAKSIMUM_DENEME; deneme += 1) {
    try {
      await rest.put(
        Routes.applicationCommands(config.discordClientId),
        { body: commands },
      );
      return;
    } catch (error) {
      if (deneme === MAKSIMUM_DENEME) {
        throw error;
      }

      const beklemeSuresi = deneme * 3000;
      console.warn(
        `[deploy] Komut kaydı başarısız (${error.code || error.message}). ` +
        `${beklemeSuresi / 1000} saniye sonra tekrar denenecek (${deneme}/${MAKSIMUM_DENEME}).`,
      );
      await bekle(beklemeSuresi);
    }
  }
}

async function main() {
  const commands = loadCommands().map((command) => command.data.toJSON());
  const rest = new REST({ version: '10' }).setToken(config.discordToken);

  await komutlariKaydet(rest, commands);

  console.log(`${commands.length} global komut kaydedildi.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
