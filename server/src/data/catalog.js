const services = [
  {
    id: "wash_fold",
    label: "Wash & Fold",
    desc: "Everyday wear, neatly folded",
    eta: "48 hrs",
  },
  {
    id: "wash_iron",
    label: "Wash & Iron",
    desc: "Washed, pressed, ready to wear",
    eta: "48 hrs",
  },
  {
    id: "dry_clean",
    label: "Dry Clean",
    desc: "Delicates, suits, silks, woollens",
    eta: "72 hrs",
  },
  {
    id: "iron",
    label: "Iron Only",
    desc: "Steam press, nothing else",
    eta: "24 hrs",
  },
];
const items = [
  {
    id: "shirt",
    name: "Shirt / T-shirt",
    emoji: "👔",
    prices: { wash_fold: 15, wash_iron: 20, dry_clean: 50, iron: 10 },
  },
  {
    id: "trouser",
    name: "Trousers / Jeans",
    emoji: "👖",
    prices: { wash_fold: 20, wash_iron: 25, dry_clean: 55, iron: 10 },
  },
  {
    id: "kurta",
    name: "Kurta / Kurti",
    emoji: "🥻",
    prices: { wash_fold: 20, wash_iron: 25, dry_clean: 60, iron: 10 },
  },
  {
    id: "saree",
    name: "Saree",
    emoji: "🧣",
    prices: { wash_fold: 30, wash_iron: 35, dry_clean: 80, iron: 15 },
  },
  {
    id: "dress",
    name: "Dress / Gown",
    emoji: "👗",
    prices: { wash_fold: 25, wash_iron: 30, dry_clean: 60, iron: 15 },
  },
  {
    id: "jacket",
    name: "Jacket / Blazer",
    emoji: "🧥",
    prices: { wash_fold: null, wash_iron: null, dry_clean: 80, iron: 40 },
  },
  {
    id: "suit",
    name: "Suit (2 pc)",
    emoji: "🤵",
    prices: { wash_fold: null, wash_iron: null, dry_clean: 80, iron: 50 },
  },
  {
    id: "sweater",
    name: "Sweater / Hoodie",
    emoji: "🧶",
    prices: { wash_fold: 30, wash_iron: 40, dry_clean: 60, iron: null },
  },
  {
    id: "bedsheet_s",
    name: "Bedsheet (single)",
    emoji: "🛏️",
    prices: { wash_fold: 35, wash_iron: 40, dry_clean: 100, iron: 25 },
  },
  {
    id: "bedsheet_d",
    name: "Bedsheet (double)",
    emoji: "🛌",
    prices: { wash_fold: 40, wash_iron: 45, dry_clean: 120, iron: 30 },
  },
  {
    id: "blanket",
    name: "Blanket / Quilt",
    emoji: "🧺",
    prices: { wash_fold: 50, wash_iron: null, dry_clean: 125, iron: null },
  },
  {
    id: "curtain",
    name: "Curtain (per panel)",
    emoji: "🪟",
    prices: { wash_fold: 10, wash_iron: 15, dry_clean: 30, iron: 10 },
  },
  {
    id: "towel",
    name: "Towel",
    emoji: "🧼",
    prices: { wash_fold: 15, wash_iron: null, dry_clean: null, iron: null },
  },
  {
    id: "innerwear",
    name: "Socks / Innerwear",
    emoji: "🧦",
    prices: { wash_fold: 5, wash_iron: null, dry_clean: null, iron: null },
  },
];
const slots = [
  { id: "8-10", label: "8 – 10 AM", start: 8 },
  { id: "10-12", label: "10 AM – 12 PM", start: 10 },
  { id: "12-14", label: "12 – 2 PM", start: 12 },
  { id: "16-18", label: "4 – 6 PM", start: 16 },
  { id: "18-20", label: "6 – 8 PM", start: 18 },
];
const fees = { freeAbove: 149, delivery: 5, express: 15, partnerShare: 0.85 };
const flow = [
  "requested",
  "accepted",
  "picked_up",
  "washing",
  "ready",
  "out_for_delivery",
  "delivered",
];
module.exports = { services, items, slots, fees, flow };
