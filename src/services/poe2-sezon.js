const sezonBaslangicTarihi = new Date('2026-05-29T20:00:00.000Z');
const lilSlutBaslangicTarihi = new Date(sezonBaslangicTarihi.getTime() + 4 * 24 * 60 * 60 * 1000);

function lilSlutAktifMi(simdi = new Date()) {
  return simdi.getTime() >= lilSlutBaslangicTarihi.getTime();
}

module.exports = {
  sezonBaslangicTarihi,
  lilSlutBaslangicTarihi,
  lilSlutAktifMi,
};
