const { Events } = require('discord.js');
const { liderlikMesajiGuncellemeleriniBaslat } = require('../services/liderlik-mesaji-servisi');
const { yeniLigiHazirla } = require('../services/yeni-lig-servisi');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`${client.user.tag} olarak giriş yapıldı.`);
    await yeniLigiHazirla(client);
    liderlikMesajiGuncellemeleriniBaslat(client);
  },
};
