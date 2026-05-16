const { SlashCommandBuilder } = require('discord.js');
const { guildHedefleriniGetir, puanTablosuOlustur } = require('../services/hedef-deposu');
const { hedefSatiriOlustur, liderSatirlariOlustur, mesajlariBol } = require('../services/hedef-mesajlari');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hedefler')
    .setDescription('Tüm hedefleri, tamamlanma durumlarını ve puan tablosunu listeler.'),

  async execute(interaction) {
    const hedefler = guildHedefleriniGetir(interaction.guildId);

    if (hedefler.length === 0) {
      await interaction.reply('Henüz hedef eklenmemiş. /hedef-ekle ile ilk hedefi ekleyebilirsin.');
      return;
    }

    const puanTablosu = puanTablosuOlustur(hedefler);
    const satirlar = [
      '**Hedefler**',
      ...hedefler.map(hedefSatiriOlustur),
      '',
      ...liderSatirlariOlustur(puanTablosu),
    ];
    const mesajlar = mesajlariBol(satirlar);

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
