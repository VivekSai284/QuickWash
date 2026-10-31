const mongoose = require('mongoose');

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

const serviceSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      enum: SERVICE_IDS,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    desc: {
      type: String,
      default: '',
      trim: true,
    },
    eta: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const pricesSchema = new mongoose.Schema(
  {
    wash_fold: { type: Number, min: 0, default: null },
    wash_iron: { type: Number, min: 0, default: null },
    dry_clean: { type: Number, min: 0, default: null },
    iron: { type: Number, min: 0, default: null },
  },
  { _id: false }
);

const itemSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      enum: ITEM_IDS,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    emoji: {
      type: String,
      default: '',
    },
    prices: {
      type: pricesSchema,
      required: true,
    },
  },
  { _id: false }
);

const feesSchema = new mongoose.Schema(
  {
    freeAbove: { type: Number, required: true, min: 0 },
    delivery: { type: Number, required: true, min: 0 },
    express: { type: Number, required: true, min: 0 },
    partnerShare: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
  },
  { _id: false }
);

const storeSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'main',
      immutable: true,
    },
    services: {
      type: [serviceSchema],
      required: true,
    },
    items: {
      type: [itemSchema],
      required: true,
    },
    fees: {
      type: feesSchema,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  'StoreSettings',
  storeSettingsSchema
);