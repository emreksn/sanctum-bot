const dns = require('node:dns').promises;

const ISTEK_ZAMAN_ASIMI_MS = 10000;

function hataKodu(error) {
  return error?.cause?.code || error?.code || error?.message || 'bilinmeyen-hata';
}

async function httpKontrolu(ad, url, options = {}) {
  try {
    const cevap = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(ISTEK_ZAMAN_ASIMI_MS),
    });

    console.log(`[network-check] ${ad}: HTTP ${cevap.status}`);
    return cevap;
  } catch (error) {
    console.error(`[network-check] ${ad}: ${hataKodu(error)}`);
    return null;
  }
}

async function discordAginiKontrolEt({ discordToken, discordClientId }) {
  console.log('[network-check] Discord bağlantı teşhisi başlıyor.');

  try {
    const adresler = await dns.lookup('discord.com', { all: true });
    const ozet = adresler.map((kayit) => `${kayit.address} (IPv${kayit.family})`).join(', ');
    console.log(`[network-check] discord.com DNS: ${ozet}`);
  } catch (error) {
    console.error(`[network-check] discord.com DNS: ${hataKodu(error)}`);
  }

  await httpKontrolu('Genel HTTPS', 'https://example.com');
  await httpKontrolu('Discord public API', 'https://discord.com/api/v10/gateway');

  const temizToken = String(discordToken || '').replace(/^Bot\s+/i, '');
  const kimlikCevabi = await httpKontrolu(
    'Discord bot token',
    'https://discord.com/api/v10/users/@me',
    { headers: { authorization: `Bot ${temizToken}` } },
  );

  if (kimlikCevabi?.ok) {
    const bot = await kimlikCevabi.json();
    console.log(
      `[network-check] Bot kimliği: ${bot.username} (${bot.id}); ` +
      `DISCORD_CLIENT_ID eşleşiyor: ${bot.id === discordClientId ? 'evet' : 'hayır'}`,
    );
  }

  console.log('[network-check] Discord bağlantı teşhisi tamamlandı.');
}

module.exports = { discordAginiKontrolEt };
