const { ChannelType, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { liderlikMesajiniGuncelle } = require('../services/liderlik-mesaji-servisi');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hedef-skor')
    .setDescription('Sabit liderlik tablosunu gösterir.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .addChannelOption((option) =>
      option
        .setName('kanal')
        .setDescription('Liderlik tablosunu oluşturacağın veya taşıyacağın kanal.')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(false),
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const secilenKanal = interaction.options.getChannel('kanal');
    const sonuc = await liderlikMesajiniGuncelle({
      client: interaction.client,
      guildId: interaction.guildId,
      hedefKanal: secilenKanal || interaction.channel,
      kanaliDegistir: Boolean(secilenKanal),
    });

    if (sonuc.tasimaHatasi) {
      await interaction.editReply(
        'Liderlik tablosu taşınamadı. Botun seçilen kanalda Mesaj Gönder, Bağlantı Yerleştir ve Mesajları Yönet izinlerini kontrol et.',
      );
      return;
    }

    await interaction.editReply([
      sonuc.tasindi
        ? `Liderlik tablosu <#${sonuc.mesaj.channelId}> kanalına taşındı: ${sonuc.mesaj.url}`
        : `Liderlik tablosu burada: ${sonuc.mesaj.url}`,
      sonuc.sabitlemeHatasi
        ? 'Mesaj oluşturuldu ancak sabitlenemedi. Bot rolüne Mesajları Yönet izni verip komutu tekrar çalıştır.'
        : null,
    ].filter(Boolean).join('\n'));
  },
};
