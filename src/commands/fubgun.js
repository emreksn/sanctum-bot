const { MessageFlags, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fubgun')
    .setDescription('Fubgun sosyal medya ve build linklerini gösterir.'),

  async execute(interaction) {
    await interaction.reply({
      content: [
        '**Fubgun Linkleri**',
        '',
        'YouTube: <https://www.youtube.com/@Fubgun>',
        'Twitch: <https://www.twitch.tv/fubgun>',
        'Build Dokümanı: <https://docs.google.com/spreadsheets/d/e/2PACX-1vR35NJkrhF1Zf9SZZOPlsdpqbTibL2AqOiZosya0NSjEN5A1Dx8a_MeQox9VDLQw3kB0ibZCNb_e6VJ/pubhtml#>',
      ].join('\n'),
      flags: MessageFlags.SuppressEmbeds,
    });
  },
};
