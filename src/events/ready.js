const { Events } = require('discord.js');
const { hedefRolKontrolunuBaslat } = require('../services/hedef-rol-servisi');
const { youtubeTakipServisiniBaslat } = require('../services/youtube-takip-servisi');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`${client.user.tag} olarak giriş yapıldı.`);
    youtubeTakipServisiniBaslat(client);
    hedefRolKontrolunuBaslat(client);
  },
};
