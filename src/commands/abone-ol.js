const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { abonelikEkle } = require('../services/abonelik-deposu');
const { youtubeKanaliCoz, youtubeSonVideolariGetir } = require('../services/youtube-servisi');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('abone-ol')
    .setDescription('Bir YouTube kanalinin yeni videolarini Discord kanalina bildirir.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((option) =>
      option
        .setName('youtube_linki')
        .setDescription('Takip edilecek YouTube kanal linki.')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('discord_kanal_id')
        .setDescription('Bildirimlerin gonderilecegi Discord metin kanali ID degeri.')
        .setRequired(true),
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const youtubeLinki = interaction.options.getString('youtube_linki', true);
    const discordKanalId = interaction.options.getString('discord_kanal_id', true).trim();
    const discordKanali = await interaction.client.channels.fetch(discordKanalId).catch(() => null);

    if (!discordKanali || !discordKanali.isTextBased()) {
      await interaction.editReply('Gecersiz Discord kanal ID degeri. Bir metin kanali ID degeri gir.');
      return;
    }

    const youtubeKanali = await youtubeKanaliCoz(youtubeLinki);

    if (!youtubeKanali) {
      await interaction.editReply('YouTube kanali bulunamadi. Kanal linkini kontrol edip tekrar dene.');
      return;
    }

    const sonVideolar = await youtubeSonVideolariGetir(youtubeKanali.id);
    const sonVideoId = sonVideolar[0]?.id || null;
    const sonuc = abonelikEkle({
      guildId: interaction.guildId,
      discordKanalId,
      youtubeKanalId: youtubeKanali.id,
      youtubeKanalAdi: youtubeKanali.ad,
      youtubeKanalLinki: youtubeKanali.link,
      sonVideoId,
    });

    if (sonuc.zatenVardi) {
      await interaction.editReply(
        `${youtubeKanali.ad} kanali zaten <#${discordKanalId}> kanalinda takip ediliyor.`,
      );
      return;
    }

    await interaction.editReply(
      `${youtubeKanali.ad} kanali <#${discordKanalId}> kanalinda takip edilecek.`,
    );
  },
};
