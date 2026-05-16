const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { hedefTamamla } = require('../services/hedef-deposu');
const { hedefRolleriniGuncelle } = require('../services/hedef-rol-servisi');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hedef-tamamla')
    .setDescription('Listedeki bir hedefi seçilen kişi için tamamlandı olarak işaretler.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addIntegerOption((option) =>
      option
        .setName('sira')
        .setDescription('/hedefler listesindeki hedef numarası.')
        .setRequired(true)
        .setMinValue(1),
    )
    .addUserOption((option) =>
      option
        .setName('kisi')
        .setDescription('Hedefi tamamlayan kişi.')
        .setRequired(true),
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const sira = interaction.options.getInteger('sira', true);
    const kullanici = interaction.options.getUser('kisi', true);
    const sonuc = hedefTamamla({
      guildId: interaction.guildId,
      sira,
      kullanici,
    });

    if (sonuc.hata === 'bulunamadi') {
      await interaction.editReply({
        content: `#${sira} sırasında bir hedef yok. Güncel numaraları /hedefler ile görebilirsin.`,
      });
      return;
    }

    if (sonuc.hata === 'tamamlanmis') {
      await interaction.editReply({
        content: `#${sira} zaten <@${sonuc.hedef.tamamlayanId}> tarafından tamamlanmış.`,
        allowedMentions: { users: [] },
      });
      return;
    }

    const rolSonucu = await hedefRolleriniGuncelle(interaction.guild);
    const rolSatirlari = [
      rolSonucu.bigDaddy ? `👑 Big Daddy: <@${rolSonucu.bigDaddy.kullaniciId}> (${rolSonucu.bigDaddy.puan} Big Daddy puanı)` : null,
      rolSonucu.lilSlut ? `💄 Lil Slut: <@${rolSonucu.lilSlut.kullaniciId}> (${rolSonucu.lilSlut.puan} Big Daddy puanı)` : null,
      ...(rolSonucu.uyarilar || []),
    ].filter(Boolean);

    await interaction.editReply({
      content: [
        `<@${kullanici.id}> **${sonuc.hedef.ad}** hedefini tamamladı ve ${sonuc.hedef.puan} Big Daddy puanı kazandı.`,
        rolSatirlari.length > 0 ? '' : null,
        ...rolSatirlari,
      ].filter(Boolean).join('\n'),
      allowedMentions: { users: [kullanici.id] },
    });
  },
};
