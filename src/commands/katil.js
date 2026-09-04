const { SlashCommandBuilder } = require('discord.js');
const { liderligeKatil } = require('../services/katilimci-deposu');
const { liderlikMesajiniSessizceGuncelle } = require('../services/liderlik-mesaji-servisi');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('katıl')
    .setDescription('Yeni lig liderlik tablosuna katılırsın.'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const sonuc = liderligeKatil({
      guildId: interaction.guildId,
      kullanici: interaction.user,
    });
    await liderlikMesajiniSessizceGuncelle(interaction);

    await interaction.editReply({
      content: sonuc.zatenVardi
        ? 'Zaten liderlik tablosundasın.'
        : 'Liderlik tablosuna katıldın. Yeni ligde bol şans!',
      allowedMentions: { users: [] },
    });
  },
};
