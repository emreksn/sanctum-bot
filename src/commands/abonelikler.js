const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { abonelikleriOku } = require('../services/abonelik-deposu');

const DISCORD_MESAJ_LIMITI = 2000;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('abonelikler')
    .setDescription('Bu sunucudaki YouTube aboneliklerini listeler.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const abonelikler = abonelikleriOku().filter((abonelik) => abonelik.guildId === interaction.guildId);

    if (abonelikler.length === 0) {
      await interaction.reply({
        content: 'Bu sunucuda henuz YouTube aboneligi yok.',
        ephemeral: true,
      });
      return;
    }

    const satirlar = abonelikler.map((abonelik, index) => {
      const sonVideolar = Array.isArray(abonelik.sonVideoGecmisi)
        ? abonelik.sonVideoGecmisi.map((video) => video.id).filter(Boolean).join(', ')
        : abonelik.sonVideoId || 'yok';

      return [
        `**${index + 1}. ${abonelik.youtubeKanalAdi}**`,
        `YouTube: ${abonelik.youtubeKanalLinki}`,
        `Discord: <#${abonelik.discordKanalId}>`,
        `Son gorulen: ${sonVideolar || 'yok'}`,
      ].join('\n');
    });
    const mesajlar = mesajlariBol(['**YouTube abonelikleri**', ...satirlar]);

    await interaction.reply({
      content: mesajlar[0],
      ephemeral: true,
      allowedMentions: { parse: [] },
    });

    for (const mesaj of mesajlar.slice(1)) {
      await interaction.followUp({
        content: mesaj,
        ephemeral: true,
        allowedMentions: { parse: [] },
      });
    }
  },
};

function mesajlariBol(bloklar) {
  const mesajlar = [];
  let mevcutMesaj = '';

  for (const blok of bloklar) {
    const sonrakiMesaj = mevcutMesaj ? `${mevcutMesaj}\n\n${blok}` : blok;

    if (sonrakiMesaj.length > DISCORD_MESAJ_LIMITI) {
      mesajlar.push(mevcutMesaj);
      mevcutMesaj = blok;
      continue;
    }

    mevcutMesaj = sonrakiMesaj;
  }

  if (mevcutMesaj) {
    mesajlar.push(mevcutMesaj);
  }

  return mesajlar;
}
