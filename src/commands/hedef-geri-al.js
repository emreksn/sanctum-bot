const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { hedefGeriAl } = require('../services/hedef-deposu');
const { hedefRolleriniGuncelle } = require('../services/hedef-rol-servisi');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hedef-geri-al')
    .setDescription('Tamamlanmış bir hedefi tekrar tamamlanmadı durumuna alır.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addIntegerOption((option) =>
      option
        .setName('sira')
        .setDescription('/hedefler listesindeki hedef numarası.')
        .setRequired(true)
        .setMinValue(1),
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const sira = interaction.options.getInteger('sira', true);
    const sonuc = hedefGeriAl({
      guildId: interaction.guildId,
      sira,
    });

    if (sonuc.hata === 'bulunamadi') {
      await interaction.editReply(`#${sira} sırasında bir hedef yok. Güncel numaraları /hedefler ile görebilirsin.`);
      return;
    }

    if (sonuc.hata === 'tamamlanmamis') {
      await interaction.editReply(`#${sira} zaten tamamlanmamış durumda: **${sonuc.hedef.ad}**`);
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
        `#${sira} tekrar tamamlanmadı yapıldı: **${sonuc.hedef.ad}**`,
        `<@${sonuc.oncekiTamamlayanId}> üzerinden ${sonuc.hedef.puan} Big Daddy puanı düşüldü.`,
        ...rolSatirlari,
      ].join('\n'),
      allowedMentions: { users: [] },
    });
  },
};
