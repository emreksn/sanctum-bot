const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gecikme')
    .setDescription('Bot gecikmesini gösterir.'),

  async execute(interaction) {
    const latency = Date.now() - interaction.createdTimestamp;

    await interaction.reply(`Pong. Gecikme: ${latency}ms.`);
  },
};
