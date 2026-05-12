const { Client, GatewayIntentBits } = require('discord.js');
const { config } = require('./config/env');
const { loadCommands } = require('./handlers/command-handler');
const { loadEvents } = require('./handlers/event-handler');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = loadCommands();
loadEvents(client);

client.login(config.discordToken);
