const skincareAnalysis = {
  skinScore: 82,
  skinType: 'Combination',
  sensitivity: 'Low',
  confidence: 94,
  hydration: 68,
  texture: 76,
  tone: 84,
  oilBalance: 62,
  barrier: 79,
  detectedConcerns: [
    {
      id: 'hydration',
      label: 'Hydration dip',
      severity: 'Medium',
      area: 'Cheeks',
      color: '#00D9A3',
      note: 'Cheek zones look slightly dehydrated compared with the forehead and jawline.',
    },
    {
      id: 'texture',
      label: 'Uneven texture',
      severity: 'Mild',
      area: 'T-zone',
      color: '#8B7CF8',
      note: 'A gentle chemical exfoliant 2 nights weekly may help smooth surface texture.',
    },
    {
      id: 'oil',
      label: 'Oil balance',
      severity: 'Medium',
      area: 'Forehead',
      color: '#FFB020',
      note: 'Use lightweight hydration instead of stripping cleansers to regulate shine.',
    },
  ],
  morningRoutine: [
    {
      id: 'am-cleanse',
      step: 'Cleanse',
      product: 'Gentle gel cleanser',
      timing: '45 sec',
      why: 'Clears overnight oil without weakening the skin barrier.',
    },
    {
      id: 'am-serum',
      step: 'Treat',
      product: 'Niacinamide serum',
      timing: '2 drops',
      why: 'Supports oil balance, redness control, and smoother-looking pores.',
    },
    {
      id: 'am-moisturize',
      step: 'Hydrate',
      product: 'Lightweight moisturizer',
      timing: '1 layer',
      why: 'Adds water retention where cheeks are trending dry.',
    },
    {
      id: 'am-spf',
      step: 'Protect',
      product: 'Broad spectrum SPF 30+',
      timing: '2 fingers',
      why: 'Protects tone, texture, and long-term skin clarity.',
    },
  ],
  nightRoutine: [
    {
      id: 'pm-cleanse',
      step: 'Reset',
      product: 'Cream or gel cleanser',
      timing: '60 sec',
      why: 'Removes sunscreen, sweat, and surface oil before treatment.',
    },
    {
      id: 'pm-exfoliate',
      step: 'Smooth',
      product: 'BHA or gentle AHA',
      timing: '2x weekly',
      why: 'Targets T-zone texture without daily over-exfoliation.',
    },
    {
      id: 'pm-repair',
      step: 'Repair',
      product: 'Ceramide moisturizer',
      timing: '1-2 layers',
      why: 'Supports barrier recovery and improves hydration by morning.',
    },
  ],
  productRecommendations: [
    {
      id: 'gentle-cleanser',
      category: 'Cleanser',
      match: 'Best match',
      productType: 'Low-foam gentle gel cleanser',
      ingredients: ['glycerin', 'panthenol', 'green tea'],
      avoid: ['harsh sulfates', 'strong fragrance'],
      why: 'Cleans the T-zone without drying the cheeks.',
    },
    {
      id: 'barrier-moisturizer',
      category: 'Moisturizer',
      match: 'Barrier support',
      productType: 'Lightweight ceramide moisturizer',
      ingredients: ['ceramides', 'squalane', 'hyaluronic acid'],
      avoid: ['heavy petrolatum-only creams for daytime'],
      why: 'Supports hydration and barrier recovery without feeling greasy.',
    },
    {
      id: 'daily-spf',
      category: 'SPF',
      match: 'Daily essential',
      productType: 'Broad spectrum SPF 30+ lotion',
      ingredients: ['zinc oxide', 'avobenzone', 'niacinamide'],
      avoid: ['tanning oils'],
      why: 'Protects tone, texture, and long-term skin clarity.',
    },
  ],
};

const glowupAnalysis = [
  {
    id: 'grooming',
    category: 'Grooming',
    icon: '✂️',
    color: '#6C5CE7',
    tips: [
      'Keep facial hair edges intentional and even for a sharper first impression.',
      'A light matte styling product can add shape without looking stiff.',
    ],
  },
  {
    id: 'skincare',
    category: 'Skincare',
    icon: '✨',
    color: '#00D9A3',
    tips: [
      'Add SPF every morning to protect tone and texture improvements.',
      'Use a simple cleanser and moisturizer routine before adding stronger active products.',
    ],
  },
  {
    id: 'presence',
    category: 'Posture & Presence',
    icon: '🧍',
    color: '#FFB020',
    tips: [
      'Relax shoulders down and back slightly to look more open and confident.',
      'Hold the camera at eye level for a more balanced face and posture read.',
    ],
  },
  {
    id: 'style',
    category: 'Style Tips',
    icon: '👕',
    color: '#8B7CF8',
    tips: [
      'Prioritize fit around shoulders, chest, and sleeve length before buying new pieces.',
      'Use one clean accent color against neutral basics to make outfits feel intentional.',
    ],
  },
];

function withMeta(payload, mode) {
  return {
    mode,
    model: mode === 'mock' ? 'mock' : process.env.OPENAI_MODEL,
    analyzedAt: new Date().toISOString(),
    result: payload,
  };
}

module.exports = {
  glowupAnalysis,
  skincareAnalysis,
  withMeta,
};
