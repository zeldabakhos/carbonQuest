// Carbon Footprint Estimation Utility
// For Open Food Facts & Open Beauty Facts products
// Generic formula-based approach - no hardcoded brands

import { Product } from "./productApi";

export interface CarbonEstimate {
  value: number; // kg CO2e for this product
  valuePerKg: number; // kg CO2e per kg (normalized)
  confidence: "high" | "medium" | "low";
  source: "api" | "category" | "estimate";
  breakdown: {
    production: number;
    packaging: number;
    transport: number;
  };
  explanation: string;
  productWeight: number; // in kg
}

// ═══════════════════════════════════════════════════════════════════
// MAIN CALCULATION FUNCTION
// ═══════════════════════════════════════════════════════════════════

export function calculateCarbonFootprint(
  product: Product,
  opts?: { userCountryCode?: string }
): CarbonEstimate {
  // 1. Try to get actual data from API (Open Food Facts ecoscore_data)
  const apiData = extractApiCarbonData(product);
  if (apiData) return apiData; // keep as-is (Agribalyse already includes transport)

  // 2. Estimate based on product type
  if (product.source === "openfoodfacts") {
    return estimateFoodCarbonFootprint(product, opts);
  } else {
    return estimateBeautyCarbonFootprint(product, opts);
  }
}

// ═══════════════════════════════════════════════════════════════════
// API DATA EXTRACTION (HIGH CONFIDENCE)
// ═══════════════════════════════════════════════════════════════════

function extractApiCarbonData(product: Product): CarbonEstimate | null {
  const raw = product.raw;
  if (!raw) return null;

  // Open Food Facts includes Agribalyse LCA data in ecoscore_data
  const ecoscore = raw.ecoscore_data;
  if (ecoscore?.agribalyse?.co2_total) {
    const co2PerKg = ecoscore.agribalyse.co2_total; // kg CO2e per kg
    const weight = parseProductWeight(product);

    const agri = ecoscore.agribalyse;
    const breakdown = {
      production: (agri.co2_agriculture || co2PerKg * 0.6) * weight,
      packaging:
        (agri.co2_packaging ||
          ecoscore.adjustments?.packaging?.value ||
          0.05) * weight,
      transport: (agri.co2_transportation || co2PerKg * 0.1) * weight,
    };

    return {
      value: co2PerKg * weight,
      valuePerKg: co2PerKg,
      confidence: "high",
      source: "api",
      breakdown,
      explanation: `Agribalyse LCA data: ${
        agri.name_en || agri.name_fr || "matched product"
      }`,
      productWeight: weight,
    };
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════
// WEIGHT/VOLUME PARSING
// ═══════════════════════════════════════════════════════════════════

function parseProductWeight(product: Product): number {
  const quantity = (product.quantity || "").toLowerCase().trim();

  if (!quantity) return 1; // Default 1kg if unknown

  let totalWeight = 0;
  let multiplier = 1;

  // Check for multiplier (e.g., "6 x 500ml")
  const multiMatch = quantity.match(/(\d+)\s*[x×]\s*/i);
  if (multiMatch) {
    multiplier = parseInt(multiMatch[1]);
  }

  // Parse weight/volume
  const patterns = [
    { regex: /(\d+[.,]?\d*)\s*kg/i, factor: 1 },
    { regex: /(\d+[.,]?\d*)\s*g(?!a)/i, factor: 0.001 }, // g but not "gallon"
    { regex: /(\d+[.,]?\d*)\s*l(?:itre|iter)?s?\b/i, factor: 1 }, // L, litre, liter
    { regex: /(\d+[.,]?\d*)\s*ml/i, factor: 0.001 },
    { regex: /(\d+[.,]?\d*)\s*cl/i, factor: 0.01 },
    { regex: /(\d+[.,]?\d*)\s*fl\.?\s*oz/i, factor: 0.0296 }, // fluid ounces
    { regex: /(\d+[.,]?\d*)\s*oz/i, factor: 0.0283 }, // ounces (weight)
    { regex: /(\d+[.,]?\d*)\s*lb/i, factor: 0.453 }, // pounds
  ];

  for (const { regex, factor } of patterns) {
    const match = quantity.match(regex);
    if (match) {
      totalWeight = parseFloat(match[1].replace(",", ".")) * factor;
      break;
    }
  }

  // Apply multiplier
  totalWeight *= multiplier;

  // Sanity check: return reasonable default if parsing failed
  return totalWeight > 0 && totalWeight < 100 ? totalWeight : 1;
}

// ═══════════════════════════════════════════════════════════════════
// WATER CONTENT ESTIMATION
// Products with high water content have lower production footprint
// ═══════════════════════════════════════════════════════════════════

function estimateWaterContent(product: Product): number {
  const ingredients = (product.ingredients_text || "").toLowerCase();
  const categories = (product.categories || "").toLowerCase();
  const name = (product.name || "").toLowerCase();

  // High water content (70-95%)
  const highWaterKeywords = [
    "water",
    "aqua",
    "eau",
    "mineral water",
    "spring water",
    "sparkling water",
    "soda",
    "soft drink",
    "juice",
    "milk",
    "beer",
    "beverage",
    "drink",
    "boisson",
    "getränk",
    "soup",
    "broth",
    "stock",
    "yogurt",
    "yaourt",
  ];

  // Medium water content (30-70%)
  const mediumWaterKeywords = [
    "sauce",
    "ketchup",
    "mayonnaise",
    "dressing",
    "cream",
    "ice cream",
    "gelato",
    "pudding",
    "custard",
    "mousse",
    "jam",
    "jelly",
    "compote",
    "fruit",
    "vegetable",
    "légume",
  ];

  // Check ingredients first (most reliable)
  if (
    ingredients.startsWith("water") ||
    ingredients.startsWith("aqua") ||
    ingredients.startsWith("eau")
  ) {
    return 0.85; // 85% water
  }

  // Check categories and name
  for (const kw of highWaterKeywords) {
    if (categories.includes(kw) || name.includes(kw)) {
      return 0.8;
    }
  }

  for (const kw of mediumWaterKeywords) {
    if (categories.includes(kw) || name.includes(kw)) {
      return 0.5;
    }
  }

  // Default: assume moderate water content for food
  return 0.3;
}

// ═══════════════════════════════════════════════════════════════════
// PACKAGING ESTIMATION
// ═══════════════════════════════════════════════════════════════════

function estimatePackagingCO2(product: Product, productWeight: number): number {
  const packaging = (product.packaging || "").toLowerCase();
  const categories = (product.categories || "").toLowerCase();

  // Base packaging CO2 per kg of packaging material
  const MATERIAL_CO2: Record<string, number> = {
    glass: 0.85,
    verre: 0.85,
    plastic: 2.0,
    plastique: 2.0,
    pet: 2.5,
    hdpe: 1.8,
    pp: 1.9,
    aluminum: 8.0,
    aluminium: 8.0,
    metal: 2.5,
    tin: 2.5,
    steel: 1.8,
    cardboard: 0.8,
    carton: 0.8,
    paper: 0.7,
    papier: 0.7,
    tetra: 1.2,
    composite: 1.5,
  };

  // Estimate packaging weight as fraction of product weight
  let packagingFraction = 0.05; // Default 5%

  const isBeverage =
    categories.includes("beverage") ||
    categories.includes("drink") ||
    categories.includes("water") ||
    categories.includes("juice") ||
    categories.includes("soda") ||
    categories.includes("boisson");

  if (isBeverage) {
    packagingFraction = 0.1;
  }

  // Find material and calculate
  let materialCO2Factor = 1.5; // Default composite
  for (const [material, co2] of Object.entries(MATERIAL_CO2)) {
    if (packaging.includes(material)) {
      materialCO2Factor = co2;
      break;
    }
  }

  const packagingWeight = productWeight * packagingFraction;
  return packagingWeight * materialCO2Factor;
}

// ═══════════════════════════════════════════════════════════════════
// TRANSPORT ESTIMATION (UPDATED: Level 2 user country)
// Uses origin country from API if available, adjusted by user country
// ═══════════════════════════════════════════════════════════════════

// Small mapping for common countries (extend anytime)
const COUNTRY_NAME_TO_ISO2: Record<string, string> = {
  france: "FR",
  fr: "FR",
  "united kingdom": "GB",
  uk: "GB",
  gb: "GB",
  england: "GB",
  germany: "DE",
  deutschland: "DE",
  de: "DE",
  spain: "ES",
  españa: "ES",
  es: "ES",
  italy: "IT",
  italia: "IT",
  it: "IT",
  poland: "PL",
  pl: "PL",
  netherlands: "NL",
  holland: "NL",
  nl: "NL",
  belgium: "BE",
  be: "BE",
  switzerland: "CH",
  ch: "CH",
  usa: "US",
  "united states": "US",
  us: "US",
  america: "US",
  china: "CN",
  cn: "CN",
  india: "IN",
  in: "IN",
  brazil: "BR",
  br: "BR",
  australia: "AU",
  au: "AU",
  "new zealand": "NZ",
  nz: "NZ",
  japan: "JP",
  jp: "JP",
};

function extractLikelyOriginISO2(product: Product): string | undefined {
  const raw: any = product.raw || {};

  // Prefer origins/manufacturing first
  const originText = `${raw.origins || ""} ${raw.manufacturing_places || ""} ${
    raw.origin || ""
  }`.toLowerCase();

  // OFF often has tags like ["en:france", "fr:italie"]
  const originTags: string[] = Array.isArray(raw.origins_tags)
    ? raw.origins_tags
    : [];
  const countryTags: string[] = Array.isArray(raw.countries_tags)
    ? raw.countries_tags
    : [];

  // 1) Try tags (most structured)
  const allTags = [...originTags, ...countryTags].map((t) => String(t).toLowerCase());
  for (const t of allTags) {
    const token = t.includes(":") ? t.split(":").pop()! : t;

    if (COUNTRY_NAME_TO_ISO2[token]) return COUNTRY_NAME_TO_ISO2[token];

    // Sometimes token is an ISO2 directly (rare but possible)
    if (token.length === 2) {
      const iso = token.toUpperCase();
      // accept if it's a plausible ISO2 (A-Z)
      if (/^[A-Z]{2}$/.test(iso)) return iso;
    }
  }

  // 2) Try free text
  for (const [name, iso2] of Object.entries(COUNTRY_NAME_TO_ISO2)) {
    if (originText.includes(name)) return iso2;
  }

  // 3) Fallback: raw.countries string
  const countriesText = `${raw.countries || ""}`.toLowerCase();
  for (const [name, iso2] of Object.entries(COUNTRY_NAME_TO_ISO2)) {
    if (countriesText.includes(name)) return iso2;
  }

  return undefined;
}

function estimateTransportCO2(
  product: Product,
  productWeight: number,
  userCountryCode?: string
): number {
  const raw: any = product.raw || {};

  // Original origin text (keep, used for fallback)
  const origins = (
    raw.origins ||
    raw.origin ||
    raw.manufacturing_places ||
    raw.countries ||
    ""
  ).toLowerCase();

  // CO2 per kg per km (truck transport average)
  const CO2_PER_KG_KM_TRUCK = 0.0001; // ~100g per tonne-km
  const CO2_PER_KG_KM_SHIP = 0.00001; // ~10g per tonne-km (for overseas)

  // Default: regional (500km)
  let estimatedKm = 500;
  let transportMode: "truck" | "ship" = "truck";

  // NEW: Level 2 adjustment when we know user country + origin
  const originISO2 = extractLikelyOriginISO2(product);
  const userISO2 = userCountryCode?.toUpperCase();

  if (originISO2 && userISO2) {
    if (originISO2 === userISO2) {
      // Local
      estimatedKm = 200;
      transportMode = "truck";
    } else {
      // Imported: simple regional vs overseas decision
      const EUROPE = new Set([
        "FR",
        "GB",
        "DE",
        "ES",
        "IT",
        "PL",
        "NL",
        "BE",
        "CH",
      ]);
      const userInEurope = EUROPE.has(userISO2);
      const originInEurope = EUROPE.has(originISO2);

      if (userInEurope && originInEurope) {
        estimatedKm = 1200; // intra-Europe
        transportMode = "truck";
      } else {
        estimatedKm = 8000; // overseas
        transportMode = "ship";
      }
    }
  } else {
    // Fallback: your existing keyword heuristic (keep)
    const localKeywords = [
      "local",
      "france",
      "deutschland",
      "uk",
      "usa",
      "domestic",
    ];
    const europeanKeywords = [
      "europe",
      "eu",
      "italy",
      "spain",
      "germany",
      "poland",
      "netherlands",
    ];
    const overseasKeywords = [
      "asia",
      "china",
      "india",
      "usa",
      "america",
      "brazil",
      "australia",
      "fiji",
      "new zealand",
    ];

    if (localKeywords.some((kw) => origins.includes(kw))) {
      estimatedKm = 300;
    } else if (europeanKeywords.some((kw) => origins.includes(kw))) {
      estimatedKm = 1000;
    } else if (overseasKeywords.some((kw) => origins.includes(kw))) {
      estimatedKm = 8000;
      transportMode = "ship";
    }
  console.log("🚚 transport debug", {
    userCountryCode,
    rawOrigins: product.raw?.origins,
    rawCountries: product.raw?.countries,
    manufacturing: product.raw?.manufacturing_places,
  });

  }

  const co2PerKgKm =
    transportMode === "ship" ? CO2_PER_KG_KM_SHIP : CO2_PER_KG_KM_TRUCK;
  return productWeight * estimatedKm * co2PerKgKm;
}

// ═══════════════════════════════════════════════════════════════════
// CATEGORY-BASED PRODUCTION CO2
// ═══════════════════════════════════════════════════════════════════

// Base CO2 per kg for raw ingredient production (before processing)
const INGREDIENT_CO2: Record<string, number> = {
  // Animal products
  beef: 27.0,
  boeuf: 27.0,
  lamb: 24.0,
  agneau: 24.0,
  cheese: 13.5,
  fromage: 13.5,
  pork: 7.6,
  porc: 7.6,
  poultry: 6.9,
  chicken: 6.9,
  poulet: 6.9,
  fish: 6.0,
  poisson: 6.0,
  seafood: 6.0,
  eggs: 4.8,
  oeufs: 4.8,
  butter: 9.0,
  beurre: 9.0,
  cream: 5.0,
  "crème": 5.0,
  milk: 3.2,
  lait: 3.2,
  dairy: 3.5,
  yogurt: 2.5,
  yaourt: 2.5,

  // Plant proteins
  tofu: 2.0,
  legumes: 0.9,
  "légumes secs": 0.9,
  beans: 0.8,
  haricots: 0.8,
  lentils: 0.9,
  lentilles: 0.9,
  nuts: 2.3,
  noix: 2.3,
  peanut: 1.8,
  "cacahuète": 1.8,

  // Grains
  rice: 2.7,
  riz: 2.7,
  pasta: 1.3,
  "pâtes": 1.3,
  bread: 1.4,
  pain: 1.4,
  cereals: 1.2,
  "céréales": 1.2,
  flour: 1.1,
  farine: 1.1,
  wheat: 1.0,
  "blé": 1.0,
  oats: 0.9,
  avoine: 0.9,

  // Fruits & vegetables
  vegetables: 0.5,
  "légumes": 0.5,
  fruits: 0.7,
  potatoes: 0.3,
  "pommes de terre": 0.3,
  tomatoes: 1.4,
  tomates: 1.4,
  salad: 0.4,
  salade: 0.4,
  apple: 0.4,
  pomme: 0.4,
  banana: 0.7,
  banane: 0.7,
  orange: 0.5,
  berries: 1.1,

  // Beverages (excluding water - mainly production of concentrate/ingredients)
  coffee: 8.0,
  "café": 8.0,
  tea: 1.0,
  "thé": 1.0,
  cocoa: 4.5,
  cacao: 4.5,
  chocolate: 4.6,
  chocolat: 4.6,

  // Oils
  oil: 3.5,
  huile: 3.5,
  "olive oil": 4.0,
  "huile d'olive": 4.0,
  "palm oil": 7.6,
  "huile de palme": 7.6,
  sunflower: 2.5,
  tournesol: 2.5,
  rapeseed: 2.0,
  colza: 2.0,

  // Sweeteners
  sugar: 1.2,
  sucre: 1.2,
  honey: 1.5,
  miel: 1.5,

  // Other
  salt: 0.2,
  sel: 0.2,
  spices: 1.0,
  "épices": 1.0,
};

function findIngredientCO2(product: Product): { co2: number; matched: string } {
  const categories = (product.categories || "").toLowerCase();
  const name = (product.name || "").toLowerCase();
  const ingredients = (product.ingredients_text || "").toLowerCase();

  // Search in order: categories, name, ingredients
  const searchText = `${categories} ${name} ${ingredients}`;

  for (const [ingredient, co2] of Object.entries(INGREDIENT_CO2)) {
    if (searchText.includes(ingredient)) {
      return { co2, matched: ingredient };
    }
  }

  return { co2: 2.0, matched: "general food" }; // Default
}

// ═══════════════════════════════════════════════════════════════════
// FOOD CARBON ESTIMATION (GENERIC FORMULA)
// ═══════════════════════════════════════════════════════════════════

function estimateFoodCarbonFootprint(
  product: Product,
  opts?: { userCountryCode?: string }
): CarbonEstimate {
  const weight = parseProductWeight(product);
  const waterContent = estimateWaterContent(product);
  const { co2: ingredientCO2, matched: matchedIngredient } =
    findIngredientCO2(product);

  // PRODUCTION CO2
  const solidContent = 1 - waterContent;
  let productionCO2 = solidContent * ingredientCO2 * weight;

  // Apply NOVA processing multiplier
  const novaMultipliers: Record<number, number> = {
    1: 1.0,
    2: 1.1,
    3: 1.25,
    4: 1.4,
  };
  if (product.nova_group && novaMultipliers[product.nova_group]) {
    productionCO2 *= novaMultipliers[product.nova_group];
  }

  // Apply ecoscore adjustment
  const ecoscoreMultipliers: Record<string, number> = {
    a: 0.7,
    b: 0.85,
    c: 1.0,
    d: 1.2,
    e: 1.5,
  };
  if (
    product.ecoscore_grade &&
    ecoscoreMultipliers[product.ecoscore_grade.toLowerCase()]
  ) {
    productionCO2 *= ecoscoreMultipliers[product.ecoscore_grade.toLowerCase()];
  }

  // PACKAGING & TRANSPORT
  const packagingCO2 = estimatePackagingCO2(product, weight);
  const transportCO2 = estimateTransportCO2(
    product,
    weight,
    opts?.userCountryCode
  );

  // TOTAL
  const totalCO2 = productionCO2 + packagingCO2 + transportCO2;
  const co2PerKg = weight > 0 ? totalCO2 / weight : totalCO2;

  // Determine confidence
  let confidence: "medium" | "low" = "low";
  if (
    matchedIngredient !== "general food" ||
    product.ecoscore_grade ||
    product.nova_group
  ) {
    confidence = "medium";
  }

  // Build explanation
  const explanationParts: string[] = [];
  if (matchedIngredient !== "general food") {
    explanationParts.push(`Based on: ${matchedIngredient}`);
  }
  if (waterContent > 0.5) {
    explanationParts.push(`~${Math.round(waterContent * 100)}% water content`);
  }
  if (product.nova_group) {
    explanationParts.push(`NOVA ${product.nova_group}`);
  }
  if (product.ecoscore_grade) {
    explanationParts.push(`Eco-Score ${product.ecoscore_grade.toUpperCase()}`);
  }

  return {
    value: Math.round(totalCO2 * 1000) / 1000,
    valuePerKg: Math.round(co2PerKg * 100) / 100,
    confidence,
    source: matchedIngredient !== "general food" ? "category" : "estimate",
    breakdown: {
      production: Math.round(productionCO2 * 1000) / 1000,
      packaging: Math.round(packagingCO2 * 1000) / 1000,
      transport: Math.round(transportCO2 * 1000) / 1000,
    },
    explanation:
      explanationParts.length > 0
        ? explanationParts.join(" • ")
        : "General estimate",
    productWeight: weight,
  };
}

// ═══════════════════════════════════════════════════════════════════
// BEAUTY PRODUCT CARBON ESTIMATION
// Calculated PER UNIT (not per kg) because packaging dominates
// ═══════════════════════════════════════════════════════════════════

const BEAUTY_CATEGORY_CO2: Record<string, number> = {
  // Skincare (kg CO2e per kg of raw ingredients)
  moisturizer: 4.5,
  cream: 4.5,
  "crème": 4.5,
  lotion: 3.8,
  serum: 5.0,
  "sérum": 5.0,
  sunscreen: 4.2,
  solaire: 4.2,
  cleanser: 3.5,
  "face wash": 3.5,
  toner: 3.0,
  tonique: 3.0,
  mask: 4.0,
  masque: 4.0,

  // Hair care
  shampoo: 2.8,
  shampooing: 2.8,
  conditioner: 3.0,
  "après-shampooing": 3.0,
  "hair oil": 3.5,
  "hair spray": 6.0,
  laque: 6.0,
  "hair dye": 5.5,
  coloration: 5.5,

  // Body care
  "body wash": 2.5,
  "gel douche": 2.5,
  "shower gel": 2.5,
  soap: 1.8,
  savon: 1.8,
  deodorant: 3.5,
  "déodorant": 3.5,
  "body lotion": 3.2,

  // Cosmetics
  lipstick: 8.0,
  "rouge à lèvres": 8.0,
  mascara: 7.5,
  foundation: 6.5,
  "fond de teint": 6.5,
  makeup: 6.0,
  maquillage: 6.0,
  "nail polish": 7.0,
  vernis: 7.0,
  perfume: 12.0,
  parfum: 12.0,
  fragrance: 12.0,
  "eau de toilette": 10.0,

  // Oral care
  toothpaste: 2.0,
  dentifrice: 2.0,
  mouthwash: 1.8,
  "bain de bouche": 1.8,
};

interface PackagingProfile {
  baseWeight: number;
  perMlWeight: number;
  material: string;
  hasSecondaryBox: boolean;
}

const BEAUTY_PACKAGING_PROFILES: Record<string, PackagingProfile> = {
  // Glass jar products (heavy!)
  cream: { baseWeight: 0.08, perMlWeight: 0.001, material: "glass", hasSecondaryBox: true },
  moisturizer: { baseWeight: 0.08, perMlWeight: 0.001, material: "glass", hasSecondaryBox: true },
  serum: { baseWeight: 0.05, perMlWeight: 0.0008, material: "glass", hasSecondaryBox: true },
  mask: { baseWeight: 0.06, perMlWeight: 0.001, material: "glass", hasSecondaryBox: true },

  // Pump bottles
  lotion: { baseWeight: 0.04, perMlWeight: 0.0003, material: "plastic", hasSecondaryBox: false },
  cleanser: { baseWeight: 0.03, perMlWeight: 0.0003, material: "plastic", hasSecondaryBox: false },
  "body lotion": { baseWeight: 0.04, perMlWeight: 0.0002, material: "plastic", hasSecondaryBox: false },

  // Plastic bottles (shampoo, etc.)
  shampoo: { baseWeight: 0.025, perMlWeight: 0.0001, material: "plastic", hasSecondaryBox: false },
  conditioner: { baseWeight: 0.025, perMlWeight: 0.0001, material: "plastic", hasSecondaryBox: false },
  "body wash": { baseWeight: 0.025, perMlWeight: 0.0001, material: "plastic", hasSecondaryBox: false },
  "shower gel": { baseWeight: 0.025, perMlWeight: 0.0001, material: "plastic", hasSecondaryBox: false },

  // Tubes
  sunscreen: { baseWeight: 0.015, perMlWeight: 0.0002, material: "plastic", hasSecondaryBox: true },
  toothpaste: { baseWeight: 0.012, perMlWeight: 0.0001, material: "plastic", hasSecondaryBox: true },
  "face wash": { baseWeight: 0.015, perMlWeight: 0.0002, material: "plastic", hasSecondaryBox: false },

  // Aerosols
  deodorant: { baseWeight: 0.06, perMlWeight: 0.0003, material: "aluminum", hasSecondaryBox: false },
  "hair spray": { baseWeight: 0.08, perMlWeight: 0.0003, material: "aluminum", hasSecondaryBox: false },

  // Small cosmetics (lots of packaging per gram!)
  lipstick: { baseWeight: 0.025, perMlWeight: 0.002, material: "plastic", hasSecondaryBox: true },
  mascara: { baseWeight: 0.02, perMlWeight: 0.002, material: "plastic", hasSecondaryBox: true },
  foundation: { baseWeight: 0.04, perMlWeight: 0.001, material: "glass", hasSecondaryBox: true },
  "nail polish": { baseWeight: 0.03, perMlWeight: 0.002, material: "glass", hasSecondaryBox: true },

  // Fragrances (heavy glass bottles)
  perfume: { baseWeight: 0.15, perMlWeight: 0.002, material: "glass", hasSecondaryBox: true },
  fragrance: { baseWeight: 0.15, perMlWeight: 0.002, material: "glass", hasSecondaryBox: true },
  "eau de toilette": { baseWeight: 0.12, perMlWeight: 0.0015, material: "glass", hasSecondaryBox: true },

  // Solid products
  soap: { baseWeight: 0.005, perMlWeight: 0, material: "paper", hasSecondaryBox: false },
};

const DEFAULT_BEAUTY_PACKAGING: PackagingProfile = {
  baseWeight: 0.03,
  perMlWeight: 0.0003,
  material: "plastic",
  hasSecondaryBox: false,
};

const PACKAGING_MATERIAL_CO2: Record<string, number> = {
  glass: 0.85,
  plastic: 2.0,
  aluminum: 8.0,
  paper: 0.7,
  cardboard: 0.8,
};

function parseBeautyProductVolume(product: Product): number {
  const quantity = (product.quantity || "").toLowerCase().trim();

  if (!quantity) return 100; // Default 100ml for beauty products

  const patterns = [
    { regex: /(\d+[.,]?\d*)\s*ml/i, factor: 1 },
    { regex: /(\d+[.,]?\d*)\s*l(?:itre|iter)?s?\b/i, factor: 1000 },
    { regex: /(\d+[.,]?\d*)\s*cl/i, factor: 10 },
    { regex: /(\d+[.,]?\d*)\s*fl\.?\s*oz/i, factor: 29.6 },
    { regex: /(\d+[.,]?\d*)\s*oz/i, factor: 28.3 },
    { regex: /(\d+[.,]?\d*)\s*g(?!a)/i, factor: 1 }, // grams ≈ ml for most beauty products
  ];

  for (const { regex, factor } of patterns) {
    const match = quantity.match(regex);
    if (match) {
      return parseFloat(match[1].replace(",", ".")) * factor;
    }
  }

  return 100;
}

function estimateBeautyCarbonFootprint(
  product: Product,
  opts?: { userCountryCode?: string }
): CarbonEstimate {
  const volumeMl = parseBeautyProductVolume(product);
  const productWeightKg = volumeMl / 1000; // Approximate: 1ml ≈ 1g

  const waterContent = estimateWaterContent(product);

  // Find category match
  const categories = (product.categories || "").toLowerCase();
  const name = (product.name || "").toLowerCase();
  const searchText = `${categories} ${name}`;

  let baseCO2 = 4.0;
  let matchedCategory = "general beauty product";

  for (const [category, co2] of Object.entries(BEAUTY_CATEGORY_CO2)) {
    if (searchText.includes(category)) {
      baseCO2 = co2;
      matchedCategory = category;
      break;
    }
  }

  // 1. PRODUCTION CO2
  const solidContent = 1 - waterContent;
  const productionCO2 = solidContent * baseCO2 * productWeightKg;

  // 2. PACKAGING CO2
  let packagingProfile = DEFAULT_BEAUTY_PACKAGING;
  for (const [category, profile] of Object.entries(BEAUTY_PACKAGING_PROFILES)) {
    if (searchText.includes(category)) {
      packagingProfile = profile;
      break;
    }
  }

  const packagingField = (product.packaging || "").toLowerCase();
  let materialOverride: string | null = null;
  if (packagingField.includes("glass") || packagingField.includes("verre")) {
    materialOverride = "glass";
  } else if (
    packagingField.includes("plastic") ||
    packagingField.includes("plastique")
  ) {
    materialOverride = "plastic";
  } else if (packagingField.includes("alumin")) {
    materialOverride = "aluminum";
  }

  const material = materialOverride || packagingProfile.material;
  const materialCO2Factor = PACKAGING_MATERIAL_CO2[material] || 2.0;

  const primaryPackagingWeight =
    packagingProfile.baseWeight + packagingProfile.perMlWeight * volumeMl;
  const secondaryPackagingWeight = packagingProfile.hasSecondaryBox ? 0.02 : 0;

  const packagingCO2 =
    primaryPackagingWeight * materialCO2Factor +
    secondaryPackagingWeight * PACKAGING_MATERIAL_CO2["cardboard"];

  // 3. TRANSPORT CO2 (UPDATED)
  const totalWeight = productWeightKg + primaryPackagingWeight + secondaryPackagingWeight;
  const transportCO2 = estimateTransportCO2(product, totalWeight, opts?.userCountryCode);

  // TOTAL
  const totalCO2 = productionCO2 + packagingCO2 + transportCO2;
  const co2PerKg = productWeightKg > 0 ? totalCO2 / productWeightKg : totalCO2;

  const packagingPercent = Math.round((packagingCO2 / totalCO2) * 100);

  return {
    value: Math.round(totalCO2 * 1000) / 1000,
    valuePerKg: Math.round(co2PerKg * 100) / 100,
    confidence: matchedCategory !== "general beauty product" ? "medium" : "low",
    source: matchedCategory !== "general beauty product" ? "category" : "estimate",
    breakdown: {
      production: Math.round(productionCO2 * 1000) / 1000,
      packaging: Math.round(packagingCO2 * 1000) / 1000,
      transport: Math.round(transportCO2 * 1000) / 1000,
    },
    explanation: `${matchedCategory} (${volumeMl}ml) • ${material} packaging (${packagingPercent}% of footprint)`,
    productWeight: productWeightKg,
  };
}

// ═══════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

export function formatCarbonValue(estimate: CarbonEstimate): string {
  const { value } = estimate;

  if (value < 0.01) {
    return `${Math.round(value * 1000)}g CO₂e`;
  } else if (value < 1) {
    return `${Math.round(value * 1000)}g CO₂e`;
  } else {
    return `${value.toFixed(2)} kg CO₂e`;
  }
}

export function formatCarbonPerKg(
  estimate: CarbonEstimate,
  isBeauty: boolean = false
): string {
  if (isBeauty) {
    return "per unit";
  }

  const { valuePerKg } = estimate;
  if (valuePerKg < 1) {
    return `${Math.round(valuePerKg * 1000)}g CO₂e/kg`;
  }
  return `${valuePerKg.toFixed(1)} kg CO₂e/kg`;
}

export function getCarbonRating(
  estimate: CarbonEstimate,
  isBeauty: boolean = false
): {
  rating: "A" | "B" | "C" | "D" | "E";
  label: string;
  color: string;
} {
  if (isBeauty) {
    const value = estimate.value;
    if (value <= 0.1)
      return { rating: "A", label: "Very Low Impact", color: "#038141" };
    if (value <= 0.25)
      return { rating: "B", label: "Low Impact", color: "#85BB2F" };
    if (value <= 0.5)
      return { rating: "C", label: "Moderate Impact", color: "#FECB02" };
    if (value <= 1.0)
      return { rating: "D", label: "High Impact", color: "#EE8100" };
    return { rating: "E", label: "Very High Impact", color: "#E63E11" };
  }

  const value = estimate.valuePerKg;
  if (value <= 1)
    return { rating: "A", label: "Very Low Impact", color: "#038141" };
  if (value <= 3)
    return { rating: "B", label: "Low Impact", color: "#85BB2F" };
  if (value <= 6)
    return { rating: "C", label: "Moderate Impact", color: "#FECB02" };
  if (value <= 12)
    return { rating: "D", label: "High Impact", color: "#EE8100" };
  return { rating: "E", label: "Very High Impact", color: "#E63E11" };
}

export function getComparisonText(estimate: CarbonEstimate): string {
  const value = estimate.value;
  // 1 km of driving ≈ 0.21 kg CO2e (average car)
  const drivingKm = value / 0.21;

  if (drivingKm < 0.1) {
    return `≈ ${Math.round(drivingKm * 1000)}m of driving`;
  } else if (drivingKm < 1) {
    return `≈ ${Math.round(drivingKm * 1000)}m of driving`;
  } else {
    return `≈ ${drivingKm.toFixed(1)} km of driving`;
  }
}
