const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { hedefGeriAl } = require('../services/hedef-deposu');
const { liderlikMesajiniSessizceGuncelle } = require('../services/liderlik-mesaji-servisi');

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

    await liderlikMesajiniSessizceGuncelle(interaction);

    await interaction.editReply({
      content: [
        `#${sira} tekrar tamamlanmadı yapıldı: **${sonuc.hedef.ad}**`,
        `<@${sonuc.oncekiTamamlayanId}> üzerinden ${sonuc.hedef.puan} puan düşüldü.`,
      ].join('\n'),
      allowedMentions: { users: [] },
    });
  },
};
