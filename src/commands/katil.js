const { SlashCommandBuilder } = require('discord.js');
const { hedefRolleriniGuncelle } = require('../services/hedef-rol-servisi');
const { liderligeKatil } = require('../services/katilimci-deposu');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('katıl')
    .setDescription('Big Daddy liderliğine katılır ve Lil Slut riskini kabul edersin.'),

  async execute(interaction) {
    await interaction.deferReply();

    const sonuc = liderligeKatil({
      guildId: interaction.guildId,
      kullanici: interaction.user,
    });
    const rolSonucu = await hedefRolleriniGuncelle(interaction.guild);
    const rolSatirlari = rolSonucu.atlandi
      ? []
      : [
        rolSonucu.bigDaddy ? `Big Daddy: <@${rolSonucu.bigDaddy.kullaniciId}> (${rolSonucu.bigDaddy.puan} Big Daddy puanı)` : null,
        rolSonucu.lilSlut ? `Lil Slut: <@${rolSonucu.lilSlut.kullaniciId}> (${rolSonucu.lilSlut.puan} Big Daddy puanı)` : null,
        ...(rolSonucu.uyarilar || []),
      ].filter(Boolean);

    await interaction.editReply({
      content: [
        sonuc.zatenVardi
          ? 'Zaten liderliğe katılmıştın. 0 puanda kalırsan Lil Slut riski devam eder.'
          : 'Liderliğe katıldın. Artık Big Daddy puanı toplayabilir ve 0 puanda kalırsan Lil Slut olabilirsin.',
        rolSatirlari.length > 0 ? '' : null,
        ...rolSatirlari,
      ].filter(Boolean).join('\n'),
      allowedMentions: { users: [] },
    });
  },
};
