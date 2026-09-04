const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { liderlikMesajiniGuncelle } = require('../services/liderlik-mesaji-servisi');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hedef-skor')
    .setDescription('Sabit liderlik tablosunu gösterir.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const sonuc = await liderlikMesajiniGuncelle({
      client: interaction.client,
      guildId: interaction.guildId,
      hedefKanal: interaction.channel,
    });

    await interaction.editReply([
      `Liderlik tablosu burada: ${sonuc.mesaj.url}`,
      sonuc.sabitlemeHatasi
        ? 'Mesaj oluşturuldu ancak sabitlenemedi. Bot rolüne Mesajları Yönet izni verip komutu tekrar çalıştır.'
        : null,
    ].filter(Boolean).join('\n'));
  },
};
