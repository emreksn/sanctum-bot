const { SlashCommandBuilder } = require('discord.js');
const { guildHedefleriniGetir, puanTablosuOlustur } = require('../services/hedef-deposu');
const { hedefSatiriOlustur, liderSatirlariOlustur, mesajlariBol } = require('../services/hedef-mesajlari');
const { guildRolAyariGetir } = require('../services/hedef-rol-deposu');
const { guildPuanTablosunaKatilimcilariEkle } = require('../services/katilimci-deposu');

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

    const puanTablosu = guildPuanTablosunaKatilimcilariEkle(
      interaction.guildId,
      puanTablosuOlustur(hedefler),
    );
    const rolAyari = guildRolAyariGetir(interaction.guildId);
    const satirlar = [
      '**Hedefler**',
      ...hedefler.map(hedefSatiriOlustur),
      '',
      ...liderSatirlariOlustur(puanTablosu, {
        mevcutLilSlutKullaniciId: rolAyari?.aktifLilSlutKullaniciId || null,
        mevcutLilSlutPuani: Number.isFinite(rolAyari?.aktifLilSlutPuani) ? rolAyari.aktifLilSlutPuani : null,
      }),
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
