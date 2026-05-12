function xmlDegeriniAl(xml, etiket) {
  const eslesme = xml.match(new RegExp(`<${etiket}[^>]*>([\\s\\S]*?)<\\/${etiket}>`));
  return eslesme ? xmlMetniniCoz(eslesme[1].trim()) : null;
}

function xmlMetniniCoz(deger) {
  return deger
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'");
}

function kanalIdLinktenAl(youtubeLinki) {
  const eslesme = youtubeLinki.match(/youtube\.com\/channel\/(UC[a-zA-Z0-9_-]+)/);
  return eslesme ? eslesme[1] : null;
}

function kanalIdHtmlIcindekilerdenAl(html) {
  const feedEslesmesi = html.match(/youtube\.com\/feeds\/videos\.xml\?channel_id=(UC[a-zA-Z0-9_-]+)/);

  if (feedEslesmesi) {
    return feedEslesmesi[1];
  }

  const metaEslesmesi = html.match(/<meta itemprop="channelId" content="(UC[a-zA-Z0-9_-]+)">/);

  if (metaEslesmesi) {
    return metaEslesmesi[1];
  }

  const externalIdEslesmesi = html.match(/"externalId":"(UC[a-zA-Z0-9_-]+)"/);

  if (externalIdEslesmesi) {
    return externalIdEslesmesi[1];
  }

  return null;
}

async function youtubeKanaliCoz(youtubeLinki) {
  const temizLink = youtubeLinki.trim();
  const linktenKanalId = kanalIdLinktenAl(temizLink);

  if (linktenKanalId) {
    return youtubeKanalBilgisiGetir(linktenKanalId, temizLink);
  }

  const sayfaCevabi = await fetch(temizLink, {
    headers: {
      'user-agent': 'sanctum-bot/1.0',
    },
  }).catch(() => null);

  if (!sayfaCevabi?.ok) {
    return null;
  }

  const html = await sayfaCevabi.text();
  const kanalId = kanalIdHtmlIcindekilerdenAl(html);

  if (!kanalId) {
    return null;
  }

  return youtubeKanalBilgisiGetir(kanalId, temizLink);
}

async function youtubeKanalBilgisiGetir(kanalId, varsayilanLink) {
  const videolar = await youtubeSonVideolariGetir(kanalId);
  const kanalAdi = videolar[0]?.kanalAdi || kanalId;

  return {
    id: kanalId,
    ad: kanalAdi,
    link: varsayilanLink || `https://www.youtube.com/channel/${kanalId}`,
  };
}

async function youtubeSonVideolariGetir(kanalId) {
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(kanalId)}`;
  const cevap = await fetch(feedUrl, {
    headers: {
      'user-agent': 'sanctum-bot/1.0',
    },
  });

  if (!cevap.ok) {
    throw new Error(`YouTube feed okunamadı: ${cevap.status}`);
  }

  const xml = await cevap.text();
  const kanalAdi = xmlDegeriniAl(xml, 'title') || kanalId;
  const entryParcalari = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((eslesme) => eslesme[1]);

  return entryParcalari.map((entry) => {
    const id = xmlDegeriniAl(entry, 'yt:videoId');
    const baslik = xmlDegeriniAl(entry, 'title');
    const yayinTarihi = xmlDegeriniAl(entry, 'published');

    return {
      id,
      baslik,
      yayinTarihi,
      kanalAdi,
      link: `https://www.youtube.com/watch?v=${id}`,
    };
  }).filter((video) => video.id);
}

module.exports = {
  youtubeKanaliCoz,
  youtubeSonVideolariGetir,
};
