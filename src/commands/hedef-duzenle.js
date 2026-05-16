const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { hedefAdiniDegistir, hedefPuaniniDegistir } = require('../services/hedef-deposu');
const { hedefRolleriniGuncelle } = require('../services/hedef-rol-servisi');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hedef-duzenle')
    .setDescription('Listedeki bir hedefin adını veya puanını değiştirir.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addIntegerOption((option) =>
      option
        .setName('sira')
        .setDescription('/hedefler listesindeki hedef numarası.')
        .setRequired(true)
        .setMinValue(1),
    )
    .addStringOption((option) =>
      option
        .setName('alan')
        .setDescription('Düzenlenecek alan.')
        .setRequired(true)
        .addChoices(
          { name: 'name', value: 'name' },
          { name: 'point', value: 'point' },
        ),
    )
    .addStringOption((option) =>
      option
        .setName('yeni_ad')
        .setDescription('alan:name seçildiğinde hedefin yeni adı.')
        .setRequired(false)
        .setMaxLength(120),
    )
    .addIntegerOption((option) =>
      option
        .setName('yeni_puan')
        .setDescription('alan:point seçildiğinde hedefin yeni Big Daddy puanı.')
        .setRequired(false)
        .setMinValue(1),
    ),

  async execute(interaction) {
    const sira = interaction.options.getInteger('sira', true);
    const alan = interaction.options.getString('alan', true);

    if (alan === 'name') {
      const yeniAd = interaction.options.getString('yeni_ad')?.trim();

      if (!yeniAd) {
        await interaction.reply({
          content: 'name seçtiğinde yeni_ad değerini doldurmalısın.',
          ephemeral: true,
        });
        return;
      }

      const sonuc = hedefAdiniDegistir({
        guildId: interaction.guildId,
        sira,
        yeniAd,
      });

      if (sonuc.hata === 'bulunamadi') {
        await interaction.reply({
          content: `#${sira} sırasında bir hedef yok. Güncel numaraları /hedefler ile görebilirsin.`,
          ephemeral: true,
        });
        return;
      }

      if (sonuc.hata === 'zaten-var') {
        await interaction.reply({
          content: `"${sonuc.hedef.ad}" hedefi zaten ekli.`,
          ephemeral: true,
        });
        return;
      }

      await interaction.reply({
        content: `#${sira} hedef adı değiştirildi:\nEski: **${sonuc.eskiAd}**\nYeni: **${sonuc.hedef.ad}**`,
        ephemeral: true,
      });
      return;
    }

    const yeniPuan = interaction.options.getInteger('yeni_puan');

    if (!yeniPuan) {
      await interaction.reply({
        content: 'point seçtiğinde yeni_puan değerini doldurmalısın.',
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const sonuc = hedefPuaniniDegistir({
      guildId: interaction.guildId,
      sira,
      yeniPuan,
    });

    if (sonuc.hata === 'bulunamadi') {
      await interaction.editReply(`#${sira} sırasında bir hedef yok. Güncel numaraları /hedefler ile görebilirsin.`);
      return;
    }

    const rolSonucu = await hedefRolleriniGuncelle(interaction.guild);
    const rolSatirlari = rolSonucu.atlandi
      ? []
      : [
        rolSonucu.bigDaddy ? `👑 Big Daddy: <@${rolSonucu.bigDaddy.kullaniciId}> (${rolSonucu.bigDaddy.puan} Big Daddy puanı)` : '👑 Big Daddy: 10+ Big Daddy puanlı lider yok.',
        rolSonucu.lilSlut ? `💄 Lil Slut: <@${rolSonucu.lilSlut.kullaniciId}> (${rolSonucu.lilSlut.puan} Big Daddy puanı)` : null,
        ...(rolSonucu.uyarilar || []),
      ].filter(Boolean);

    await interaction.editReply({
      content: [
        `#${sira} hedef puanı değiştirildi: **${sonuc.hedef.ad}**`,
        `Eski: **${sonuc.eskiPuan}** Big Daddy puanı`,
        `Yeni: **${sonuc.hedef.puan}** Big Daddy puanı`,
        ...rolSatirlari,
      ].join('\n'),
      allowedMentions: { users: [] },
    });
  },
};
