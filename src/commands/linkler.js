const { MessageFlags, SlashCommandBuilder } = require('discord.js');

const linkler = [
  {
    ad: 'PoB2',
    link: 'https://pathofbuilding.community/',
  },
  {
    ad: 'PoE2 Trade Sitesi',
    link: 'https://www.pathofexile.com/trade2',
  },
  {
    ad: 'PoE2 Item Filter Sitesi',
    link: 'https://www.filterblade.xyz/?game=Poe2',
  },
  {
    ad: 'PoE2DB',
    link: 'https://poe2db.tw/',
  },
  {
    ad: 'PoE2 Craft Sitesi',
    link: 'https://www.craftofexile.com/?game=poe2',
  },
  {
    ad: 'PoE2 Ninja Builds',
    link: 'https://poe.ninja/poe2/builds',
  },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('linkler')
    .setDescription('PoE2 için faydalı site linklerini gösterir.'),

  async execute(interaction) {
    const satirlar = linkler.map((kayit) => `${kayit.ad}: <${kayit.link}>`);

    await interaction.reply({
      content: ['**PoE2 Faydalı Linkler**', '', ...satirlar].join('\n'),
      flags: MessageFlags.SuppressEmbeds,
    });
  },
};
