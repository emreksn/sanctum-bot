const { SlashCommandBuilder } = require('discord.js');

const sezonBaslangicTarihi = new Date('2026-05-29T20:00:00.000Z');

function kalanSureyiFormatla(kalanMs) {
  const toplamSaniye = Math.max(0, Math.floor(kalanMs / 1000));
  const saat = Math.floor(toplamSaniye / 3600);
  const dakika = Math.floor((toplamSaniye % 3600) / 60);
  const saniye = toplamSaniye % 60;

  return `${saat} saat ${dakika} dakika ${saniye} saniye`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poe2-sezon')
    .setDescription('PoE2 0.5 Runes of Aldur sezonuna kalan süreyi gösterir.'),

  async execute(interaction) {
    const kalanMs = sezonBaslangicTarihi.getTime() - Date.now();

    if (kalanMs <= 0) {
      await interaction.reply('PoE2 0.5 Runes of Aldur sezonu başladı.');
      return;
    }

    await interaction.reply(
      `PoE2 0.5 Runes of Aldur sezonuna ${kalanSureyiFormatla(kalanMs)} kaldı.`,
    );
  },
};
