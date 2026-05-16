const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { abonelikleriKontrolEt } = require('../services/youtube-takip-servisi');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('youtube-kontrol')
    .setDescription('Bu sunucudaki YouTube aboneliklerini hemen kontrol eder.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const sonuc = await abonelikleriKontrolEt(interaction.client, {
      guildId: interaction.guildId,
    });

    if (sonuc.calisiyor) {
      await interaction.editReply('YouTube kontrolu zaten calisiyor. Biraz sonra tekrar dene.');
      return;
    }

    await interaction.editReply(`${sonuc.kontrolEdilen} YouTube aboneligi kontrol edildi.`);
  },
};
