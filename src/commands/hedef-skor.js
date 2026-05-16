const { SlashCommandBuilder } = require('discord.js');
const { guildHedefleriniGetir, puanTablosuOlustur } = require('../services/hedef-deposu');
const { liderSatirlariOlustur, mesajlariBol } = require('../services/hedef-mesajlari');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hedef-skor')
    .setDescription('Big Daddy puanı lider tablosunu listeler.'),

  async execute(interaction) {
    const hedefler = guildHedefleriniGetir(interaction.guildId);
    const puanTablosu = puanTablosuOlustur(hedefler);
    const mesajlar = mesajlariBol(liderSatirlariOlustur(puanTablosu));

    await interaction.reply({
      content: mesajlar[0],
      allowedMentions: { users: [] },
    });

    for (const mesaj of mesajlar.slice(1)) {
      await interaction.followUp({
        content: mesaj,
        allowedMentions: { users: [] },
      });
    }
  },
};
