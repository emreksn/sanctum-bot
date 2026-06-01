const { SlashCommandBuilder } = require('discord.js');
const { guildHedefleriniGetir, puanTablosuOlustur } = require('../services/hedef-deposu');
const { liderSatirlariOlustur, mesajlariBol } = require('../services/hedef-mesajlari');
const { guildRolAyariGetir } = require('../services/hedef-rol-deposu');
const { guildPuanTablosunaKatilimcilariEkle } = require('../services/katilimci-deposu');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hedef-skor')
    .setDescription('Big Daddy puanı lider tablosunu listeler.'),

  async execute(interaction) {
    const hedefler = guildHedefleriniGetir(interaction.guildId);
    const puanTablosu = guildPuanTablosunaKatilimcilariEkle(
      interaction.guildId,
      puanTablosuOlustur(hedefler),
    );
    const rolAyari = guildRolAyariGetir(interaction.guildId);
    const mesajlar = mesajlariBol(liderSatirlariOlustur(puanTablosu, {
      mevcutLilSlutKullaniciId: rolAyari?.aktifLilSlutKullaniciId || null,
      mevcutLilSlutPuani: Number.isFinite(rolAyari?.aktifLilSlutPuani) ? rolAyari.aktifLilSlutPuani : null,
    }));

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
