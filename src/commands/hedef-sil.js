const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { hedefSil } = require('../services/hedef-deposu');
const { hedefRolleriniGuncelle } = require('../services/hedef-rol-servisi');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hedef-sil')
    .setDescription('Listedeki bir hedefi siler ve puan tablosunu günceller.')
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
    const sonuc = hedefSil({
      guildId: interaction.guildId,
      sira,
    });

    if (sonuc.hata === 'bulunamadi') {
      await interaction.editReply(`#${sira} sırasında bir hedef yok. Güncel numaraları /hedefler ile görebilirsin.`);
      return;
    }

    const rolSonucu = await hedefRolleriniGuncelle(interaction.guild);
    const silinenHedefSatiri = sonuc.hedef.tamamlayanId
      ? `Silinen hedef <@${sonuc.hedef.tamamlayanId}> tarafından tamamlanmıştı, ${sonuc.hedef.puan} Big Daddy puanı puan tablosundan düşüldü.`
      : 'Silinen hedef tamamlanmamıştı, puan tablosu değişmedi.';
    const rolSatirlari = rolSonucu.atlandi
      ? []
      : [
        rolSonucu.bigDaddy ? `👑 Big Daddy: <@${rolSonucu.bigDaddy.kullaniciId}> (${rolSonucu.bigDaddy.puan} Big Daddy puanı)` : '👑 Big Daddy: 10+ Big Daddy puanlı lider yok.',
        rolSonucu.lilSlut ? `💄 Lil Slut: <@${rolSonucu.lilSlut.kullaniciId}> (${rolSonucu.lilSlut.puan} Big Daddy puanı)` : null,
        ...(rolSonucu.uyarilar || []),
      ].filter(Boolean);

    await interaction.editReply({
      content: [
        `#${sira} silindi: **${sonuc.hedef.ad}**`,
        silinenHedefSatiri,
        '',
        'Kalan hedefler /hedefler içinde yeniden numaralandırıldı.',
        ...rolSatirlari,
      ].join('\n'),
      allowedMentions: { users: [] },
    });
  },
};
