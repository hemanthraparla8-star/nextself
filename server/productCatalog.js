const productCatalog = [
  {
    id: 'cerave-hydrating-cleanser',
    brand: 'CeraVe',
    name: 'Hydrating Facial Cleanser',
    category: 'Cleanser',
    productType: 'Cream cleanser',
    skinTypes: ['Dry', 'Normal', 'Sensitive', 'Combination'],
    concerns: ['hydration', 'barrier', 'sensitivity', 'dryness'],
    ingredients: ['ceramides', 'hyaluronic acid', 'glycerin'],
    avoid: ['harsh sulfates'],
    region: 'Global',
    officialUrl: 'https://www.cerave.com/skincare/cleansers/hydrating-facial-cleanser',
    amazonUrl: 'https://www.amazon.com/s?k=CeraVe+Hydrating+Facial+Cleanser',
    why: 'A gentle cleanser option when the scan suggests dryness, dehydration, or barrier support needs.',
  },
  {
    id: 'la-roche-posay-toleriane-purifying',
    brand: 'La Roche-Posay',
    name: 'Toleriane Purifying Foaming Face Wash',
    category: 'Cleanser',
    productType: 'Foaming cleanser',
    skinTypes: ['Oily', 'Combination', 'Sensitive'],
    concerns: ['oil', 'pores', 'congestion', 'texture'],
    ingredients: ['niacinamide', 'ceramide-3', 'thermal spring water'],
    avoid: ['heavy cleansing balms for morning oil control'],
    region: 'Global',
    officialUrl: 'https://www.laroche-posay.us/our-products/face/face-wash/toleriane-purifying-foaming-face-wash-tolerianepurifyingfoamingfacialwash.html',
    amazonUrl: 'https://www.amazon.com/s?k=La+Roche+Posay+Toleriane+Purifying+Foaming+Face+Wash',
    why: 'A better cleanser match when the scan detects oil balance or T-zone congestion.',
  },
  {
    id: 'neutrogena-hydro-boost-water-gel',
    brand: 'Neutrogena',
    name: 'Hydro Boost Water Gel',
    category: 'Moisturizer',
    productType: 'Gel moisturizer',
    skinTypes: ['Normal', 'Combination', 'Oily'],
    concerns: ['hydration', 'dehydration', 'oil'],
    ingredients: ['hyaluronic acid', 'glycerin'],
    avoid: ['very heavy occlusive daytime layers'],
    region: 'Global',
    officialUrl: 'https://www.neutrogena.com/products/skincare/neutrogena-hydro-boost-water-gel-with-hyaluronic-acid/6811047',
    amazonUrl: 'https://www.amazon.com/s?k=Neutrogena+Hydro+Boost+Water+Gel',
    why: 'Lightweight hydration for scans that show dehydration without needing a rich cream.',
  },
  {
    id: 'eltamd-uv-clear-spf46',
    brand: 'EltaMD',
    name: 'UV Clear Broad-Spectrum SPF 46',
    category: 'SPF',
    productType: 'Daily face sunscreen',
    skinTypes: ['Sensitive', 'Oily', 'Combination', 'Normal'],
    concerns: ['tone', 'redness', 'sensitivity', 'oil', 'acne-prone'],
    ingredients: ['zinc oxide', 'niacinamide', 'hyaluronic acid'],
    avoid: ['tanning oils'],
    region: 'US / Online',
    officialUrl: 'https://eltamd-skincare.com/products/uv-clear-broad-spectrum-spf-46',
    amazonUrl: 'https://www.amazon.com/s?k=EltaMD+UV+Clear+Broad+Spectrum+SPF+46',
    why: 'A strong SPF match when the scan suggests sensitivity, uneven tone, or breakout-prone oil balance.',
  },
  {
    id: 'the-ordinary-niacinamide-zinc',
    brand: 'The Ordinary',
    name: 'Niacinamide 10% + Zinc 1%',
    category: 'Serum',
    productType: 'Niacinamide serum',
    skinTypes: ['Oily', 'Combination', 'Normal'],
    concerns: ['oil', 'pores', 'texture', 'blemish-prone'],
    ingredients: ['niacinamide', 'zinc PCA'],
    avoid: ['layering with too many strong actives at once'],
    region: 'Global',
    officialUrl: 'https://theordinary.com/en-us/niacinamide-10-zinc-1-serum-100436.html',
    amazonUrl: 'https://www.amazon.com/s?k=The+Ordinary+Niacinamide+10%25+Zinc+1%25',
    why: 'Useful when the scan suggests oil balance, visible pores, or uneven texture.',
  },
  {
    id: 'paulas-choice-2-bha',
    brand: "Paula's Choice",
    name: 'Skin Perfecting 2% BHA Liquid Exfoliant',
    category: 'Exfoliant',
    productType: 'Salicylic acid exfoliant',
    skinTypes: ['Oily', 'Combination', 'Normal'],
    concerns: ['pores', 'texture', 'congestion', 'oil'],
    ingredients: ['salicylic acid', 'green tea'],
    avoid: ['daily use at first', 'combining with multiple exfoliants'],
    region: 'Global / Online',
    officialUrl: 'https://www.paulaschoice.com/skin-perfecting-2pct-bha-liquid-exfoliant/201.html',
    amazonUrl: 'https://www.amazon.com/s?k=Paula%27s+Choice+Skin+Perfecting+2%25+BHA+Liquid+Exfoliant',
    why: 'A targeted option when the scan points to clogged pores, rough texture, or oily T-zone.',
  },
  {
    id: 'cosrx-snail-96',
    brand: 'COSRX',
    name: 'Advanced Snail 96 Mucin Power Essence',
    category: 'Essence',
    productType: 'Hydrating essence',
    skinTypes: ['Dry', 'Normal', 'Combination', 'Sensitive'],
    concerns: ['hydration', 'barrier', 'texture', 'dryness'],
    ingredients: ['snail secretion filtrate', 'betaine', 'panthenol'],
    avoid: ['use if allergic or reactive to snail mucin'],
    region: 'Global / Online',
    officialUrl: 'https://www.cosrx.com/products/advanced-snail-96-mucin-power-essence',
    amazonUrl: 'https://www.amazon.com/s?k=COSRX+Advanced+Snail+96+Mucin+Power+Essence',
    why: 'A hydration and barrier-support match when the scan suggests dehydration or surface roughness.',
  },
];

function normalize(text) {
  return String(text || '').toLowerCase();
}

function concernTerms(analysis) {
  const terms = new Set();
  for (const concern of analysis.detectedConcerns || []) {
    for (const value of [concern.id, concern.label, concern.area, concern.note]) {
      const normalized = normalize(value);
      for (const token of ['hydration', 'dehydration', 'dryness', 'texture', 'oil', 'pores', 'redness', 'barrier', 'sensitivity', 'congestion']) {
        if (normalized.includes(token)) terms.add(token);
      }
    }
  }
  return terms;
}

function scoreProduct(product, analysis) {
  const skinType = analysis.skinType;
  const terms = concernTerms(analysis);
  let score = 0;

  if (product.skinTypes.includes(skinType)) score += 4;

  for (const concern of product.concerns) {
    if (terms.has(concern)) score += 3;
  }

  if ((analysis.hydration || 100) < 72 && product.concerns.includes('hydration')) score += 2;
  if ((analysis.oilBalance || 100) < 72 && product.concerns.includes('oil')) score += 2;
  if ((analysis.texture || 100) < 80 && product.concerns.includes('texture')) score += 2;
  if ((analysis.barrier || 100) < 82 && product.concerns.includes('barrier')) score += 2;
  if (product.category === 'SPF') score += 1;

  return score;
}

function matchProductsForAnalysis(analysis, limit = 4) {
  const ranked = productCatalog
    .map((product) => ({ ...product, score: scoreProduct(product, analysis) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return ranked.map(({ score, ...product }, index) => ({
    ...product,
    match: index === 0 ? 'Best match' : score >= 7 ? 'Strong match' : 'Good option',
  }));
}

module.exports = {
  matchProductsForAnalysis,
  productCatalog,
};
