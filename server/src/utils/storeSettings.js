const StoreSettings = require('../models/StoreSettings');

const {
  services,
  items,
  fees,
} = require('../data/catalog');

async function getStoreSettings() {
  let settings = await StoreSettings.findOne({ key: 'main' });

  if (!settings) {
    settings = await StoreSettings.create({
      key: 'main',
      services,
      items,
      fees,
    });
  }

  return settings;
}

module.exports = getStoreSettings;