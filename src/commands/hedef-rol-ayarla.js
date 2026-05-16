const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { guildRolAyariKaydet } = require('../services/hedef-rol-deposu');
const { hedefRolleriniGuncelle } = require('../services/hedef-rol-servisi');

function rolUyarisiOlustur(interaction, rol) {
  if (!rol) {
    return null;
  }

  if (rol.managed) {
    return `<@&${rol.id}> harici bir entegrasyon tarafından yönetiliyor, bot bu rolü veremeyebilir.`;
  }

  const botUyesi = interaction.guild.members.me;

  if (botUyesi && botUyesi.roles.highest.position <= rol.position) {
    return `<@&${rol.id}> botun en yüksek rolünden yukarıda veya aynı seviyede. Botun bu rolü verebilmesi için bot rolünü yukarı taşı.`;
  }

  return null;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hedef-rol-ayarla')
    .setDescription('Hedef sistemi için Big Daddy ve Lil Slut rollerini ayarlar.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addRoleOption((option) =>
      option
        .setName('big_daddy')
        .setDescription('En yüksek puanlı kişiye verilecek rol.')
        .setRequired(false),
    )
    .addRoleOption((option) =>
      option
        .setName('lil_slut')
        .setDescription('Lig başlangıcından 4 gün sonra en düşük puanlı kişiye verilecek rol.')
        .setRequired(false),
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const bigDaddyRol = interaction.options.getRole('big_daddy');
    const lilSlutRol = interaction.options.getRole('lil_slut');

    if (!bigDaddyRol && !lilSlutRol) {
      await interaction.editReply('En az bir rol seçmelisin.');
      return;
    }

    const ayar = guildRolAyariKaydet({
      guildId: interaction.guildId,
      bigDaddyRolId: bigDaddyRol?.id || null,
      lilSlutRolId: lilSlutRol?.id || null,
    });
    const rolSonucu = await hedefRolleriniGuncelle(interaction.guild);
    const uyarilar = [
      rolUyarisiOlustur(interaction, bigDaddyRol),
      rolUyarisiOlustur(interaction, lilSlutRol),
      ...(rolSonucu.uyarilar || []),
    ].filter(Boolean);

    await interaction.editReply(
      [
        'Roller kaydedildi.',
        ayar.bigDaddyRolId ? `Big Daddy: <@&${ayar.bigDaddyRolId}>` : null,
        ayar.lilSlutRolId ? `Lil Slut: <@&${ayar.lilSlutRolId}>` : null,
        uyarilar.length > 0 ? '' : null,
        ...uyarilar,
      ].filter(Boolean).join('\n'),
    );
  },
};
