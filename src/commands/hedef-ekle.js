const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { hedefEkle } = require('../services/hedef-deposu');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hedef-ekle')
    .setDescription('Big Daddy puanı veren yeni bir hedef ekler.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((option) =>
      option
        .setName('ad')
        .setDescription('Hedef adı.')
        .setRequired(true)
        .setMaxLength(120),
    )
    .addIntegerOption((option) =>
      option
        .setName('puan')
        .setDescription('Hedef tamamlanınca verilecek Big Daddy puanı.')
        .setRequired(true)
        .setMinValue(1),
    ),

  async execute(interaction) {
    const ad = interaction.options.getString('ad', true).trim();
    const puan = interaction.options.getInteger('puan', true);

    if (!ad) {
      await interaction.reply({
        content: 'Hedef adı boş olamaz.',
        ephemeral: true,
      });
      return;
    }

    const sonuc = hedefEkle({
      guildId: interaction.guildId,
      ad,
      puan,
    });

    if (sonuc.zatenVardi) {
      await interaction.reply({
        content: `"${sonuc.hedef.ad}" hedefi zaten ekli.`,
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({
      content: `Hedef eklendi: **${sonuc.hedef.ad}** (${sonuc.hedef.puan} Big Daddy puanı)`,
      ephemeral: true,
    });
  },
};
