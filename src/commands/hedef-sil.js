const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { hedefSil } = require('../services/hedef-deposu');
const { liderlikMesajiniSessizceGuncelle } = require('../services/liderlik-mesaji-servisi');

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

    await liderlikMesajiniSessizceGuncelle(interaction);
    const silinenHedefSatiri = sonuc.hedef.tamamlayanId
      ? `Silinen hedef <@${sonuc.hedef.tamamlayanId}> tarafından tamamlanmıştı, ${sonuc.hedef.puan} puan tablodan düşüldü.`
      : 'Silinen hedef tamamlanmamıştı, puan tablosu değişmedi.';

    await interaction.editReply({
      content: [
        `#${sira} silindi: **${sonuc.hedef.ad}**`,
        silinenHedefSatiri,
        '',
        'Kalan hedefler /hedefler içinde yeniden numaralandırıldı.',
      ].join('\n'),
      allowedMentions: { users: [] },
    });
  },
};
