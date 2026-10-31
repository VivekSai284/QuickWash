const express = require('express');

const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const getStoreSettings = require('../utils/storeSettings');

const router = express.Router();

const SERVICE_IDS = [
  'wash_fold',
  'wash_iron',
  'dry_clean',
  'iron',
];

const ITEM_IDS = [
  'shirt',
  'trouser',
  'kurta',
  'saree',
  'dress',
  'jacket',
  'suit',
  'sweater',
  'bedsheet_s',
  'bedsheet_d',
  'blanket',
  'curtain',
  'towel',
  'innerwear',
];

const FEE_KEYS = [
  'freeAbove',
  'delivery',
  'express',
  'partnerShare',
];

function isValidText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasExactIds(list, expectedIds) {
  if (!Array.isArray(list) || list.length !== expectedIds.length) {
    return false;
  }

  const ids = list.map((entry) => entry?.id);

  return (
    ids.every((id) => typeof id === 'string') &&
    new Set(ids).size === expectedIds.length &&
    expectedIds.every((id) => ids.includes(id))
  );
}

function isValidNonNegativeNumber(value) {
  return typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= 0;
}

function validateCatalog({ services, items, fees }) {
  if (!hasExactIds(services, SERVICE_IDS)) {
    return 'Services must contain each supported service exactly once';
  }

  for (const service of services) {
    if (
      !isValidText(service.label) ||
      !isValidText(service.eta) ||
      (service.desc !== undefined && typeof service.desc !== 'string')
    ) {
      return `Invalid service details: ${service.id}`;
    }
  }

  if (!hasExactIds(items, ITEM_IDS)) {
    return 'Items must contain each supported item exactly once';
  }

  for (const item of items) {
    if (
      !isValidText(item.name) ||
      !item.prices ||
      typeof item.prices !== 'object' ||
      Array.isArray(item.prices)
    ) {
      return `Invalid item details: ${item.id}`;
    }

    const priceKeys = Object.keys(item.prices);

    if (
      priceKeys.length !== SERVICE_IDS.length ||
      !SERVICE_IDS.every((id) => priceKeys.includes(id))
    ) {
      return `Invalid price fields: ${item.id}`;
    }

    for (const serviceId of SERVICE_IDS) {
      const price = item.prices[serviceId];

      if (price !== null && !isValidNonNegativeNumber(price)) {
        return `Invalid ${serviceId} price for ${item.id}`;
      }
    }
  }

  if (
    !fees ||
    typeof fees !== 'object' ||
    Array.isArray(fees)
  ) {
    return 'Invalid delivery fees';
  }

  const suppliedFeeKeys = Object.keys(fees);

  if (
    suppliedFeeKeys.length !== FEE_KEYS.length ||
    !FEE_KEYS.every((key) => suppliedFeeKeys.includes(key))
  ) {
    return 'Invalid fee fields';
  }

  for (const key of FEE_KEYS) {
    if (!isValidNonNegativeNumber(fees[key])) {
      return `Invalid fee value: ${key}`;
    }
  }

  if (fees.partnerShare > 1) {
    return 'Partner share must be between 0 and 1';
  }

  return null;
}

// Every route in this file requires an authenticated admin.
router.use(auth, admin);

// Get current pricing configuration
router.get('/catalog', async (req, res, next) => {
  try {
    const settings = await getStoreSettings();

    res.json({
      services: settings.services,
      items: settings.items,
      fees: settings.fees,
    });
  } catch (error) {
    next(error);
  }
});

// Update pricing configuration
router.put('/catalog', async (req, res, next) => {
  try {
    const { services, items, fees } = req.body || {};

    const validationError = validateCatalog({
      services,
      items,
      fees,
    });

    if (validationError) {
      return res.status(400).json({
        error: validationError,
      });
    }

    const current = await getStoreSettings();

    current.services = services;
    current.items = items;
    current.fees = fees;

    await current.save();

    res.json({
      message: 'Pricing updated successfully',
      services: current.services,
      items: current.items,
      fees: current.fees,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Catalog validation failed',
        details: error.message,
      });
    }

    next(error);
  }
});

module.exports = router;