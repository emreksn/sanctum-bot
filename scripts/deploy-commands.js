const { REST, Routes } = require('discord.js');
const { config } = require('../src/config/env');
const { loadCommands } = require('../src/handlers/command-handler');

async function main() {
  const commands = loadCommands().map((command) => command.data.toJSON());
  const rest = new REST({ version: '10' }).setToken(config.discordToken);

  await rest.put(
    Routes.applicationCommands(config.discordClientId),
    { body: commands },
  );

  console.log(`${commands.length} global komut kaydedildi.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
