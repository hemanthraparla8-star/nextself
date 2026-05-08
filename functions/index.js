const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const Busboy = require('busboy');
const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');

const geminiApiKey = defineSecret('GEMINI_API_KEY');
const DEFAULT_GEMINI_MODEL = 'gemini-2.0-flash';

const app = express();
app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json({ limit: '8mb' }));

const skincarePrompt = `
You are NextSelf's supportive skincare routine assistant.
Analyze the face image only for general, non-medical skincare guidance.
Do not diagnose disease, identify the person, infer sensitive traits, or rate attractiveness.
Return JSON only with: skinScore, skinType, sensitivity, confidence, hydration, texture, tone, oilBalance, barrier, detectedConcerns, morningRoutine, nightRoutine, productRecommendations.
Recommend product categories and ingredients, not invented brand links.
`.trim();

const glowupPrompt = `
You are NextSelf's supportive personal presentation coach.
Analyze the image only for non-medical, non-sensitive presentation advice.
Do not rate attractiveness, identify the person, or infer sensitive traits.
Return JSON only as an array of exactly four cards with id, category, icon, color, and tips.
`.trim();

const starterProducts = [
  {
    id: 'cerave-hydrating-cleanser',
    brand: 'CeraVe',
    name: 'Hydrating Facial Cleanser',
    category: 'Cleanser',
    productType: 'Cream cleanser',
    skinTypes: ['Dry', 'Normal', 'Sensitive', 'Combination'],
    concerns: ['hydration', 'barrier', 'dryness'],
    ingredients: ['ceramides', 'hyaluronic acid', 'glycerin'],
    avoid: ['harsh sulfates'],
    officialUrl: 'https://www.cerave.com/skincare/cleansers/hydrating-facial-cleanser',
    amazonUrl: 'https://www.amazon.com/s?k=CeraVe+Hydrating+Facial+Cleanser',
    why: 'A gentle cleanser option when the scan suggests dryness or barrier support needs.',
  },
  {
    id: 'eltamd-uv-clear-spf46',
    brand: 'EltaMD',
    name: 'UV Clear Broad-Spectrum SPF 46',
    category: 'SPF',
    productType: 'Daily face sunscreen',
    skinTypes: ['Sensitive', 'Oily', 'Combination', 'Normal'],
    concerns: ['tone', 'redness', 'sensitivity', 'oil'],
    ingredients: ['zinc oxide', 'niacinamide', 'hyaluronic acid'],
    avoid: ['tanning oils'],
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
    concerns: ['oil', 'pores', 'texture'],
    ingredients: ['niacinamide', 'zinc PCA'],
    avoid: ['layering with too many strong actives at once'],
    officialUrl: 'https://theordinary.com/en-us/niacinamide-10-zinc-1-serum-100436.html',
    amazonUrl: 'https://www.amazon.com/s?k=The+Ordinary+Niacinamide+10%25+Zinc+1%25',
    why: 'Useful when the scan suggests oil balance, visible pores, or uneven texture.',
  },
];

function parseJsonText(text) {
  const cleaned = String(text || '').replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (_) {
    const start = cleaned.search(/[\[{]/);
    const end = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    throw new Error(`Gemini returned non-JSON text: ${cleaned.slice(0, 200)}`);
  }
}

async function analyzeWithGemini({ imageUrl, imageData, prompt }) {
  const key = geminiApiKey.value();
  if (!key) throw new Error('Missing GEMINI_API_KEY secret');

  let inlineData;
  if (imageData) {
    inlineData = imageData;
  } else if (imageUrl) {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) throw new Error(`Could not fetch image: ${imageResponse.status}`);
    inlineData = {
      mimeType: imageResponse.headers.get('content-type') || 'image/jpeg',
      data: Buffer.from(await imageResponse.arrayBuffer()).toString('base64'),
    };
  } else {
    throw new Error('Provide imageUrl or imageData');
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }, { inlineData }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.4 },
    }),
  });

  if (!response.ok) throw new Error(`Gemini request failed: ${response.status} ${await response.text()}`);
  const result = await response.json();
  const text = (result.candidates?.[0]?.content?.parts || []).map((part) => part.text || '').join('\n');
  return parseJsonText(text);
}

function imageInputFromRequest(req) {
  if (req.body?.imageData) return Promise.resolve({ imageData: req.body.imageData });
  if (req.body?.imageUrl || req.body?.imageUri) {
    return Promise.resolve({ imageUrl: req.body.imageUrl || req.body.imageUri });
  }

  if (!String(req.headers['content-type'] || '').includes('multipart/form-data')) {
    return Promise.resolve({});
  }

  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers });
    let resolved = false;

    busboy.on('file', (fieldname, file, info) => {
      if (fieldname !== 'image') {
        file.resume();
        return;
      }

      const chunks = [];
      file.on('data', (chunk) => chunks.push(chunk));
      file.on('end', () => {
        resolved = true;
        resolve({
          imageData: {
            mimeType: info.mimeType || 'image/jpeg',
            data: Buffer.concat(chunks).toString('base64'),
          },
        });
      });
    });

    busboy.on('field', (fieldname, value) => {
      if (!resolved && (fieldname === 'imageUrl' || fieldname === 'imageUri')) {
        resolved = true;
        resolve({ imageUrl: value });
      }
    });

    busboy.on('error', reject);
    busboy.on('finish', () => {
      if (!resolved) resolve({});
    });

    busboy.end(req.rawBody);
  });
}

function matchProducts(analysis) {
  const skinType = analysis.skinType;
  const terms = JSON.stringify(analysis.detectedConcerns || []).toLowerCase();
  return starterProducts
    .map((product) => {
      let score = product.skinTypes.includes(skinType) ? 4 : 0;
      product.concerns.forEach((concern) => {
        if (terms.includes(concern)) score += 3;
      });
      if ((analysis.hydration || 100) < 72 && product.concerns.includes('hydration')) score += 2;
      if ((analysis.oilBalance || 100) < 72 && product.concerns.includes('oil')) score += 2;
      if (product.category === 'SPF') score += 1;
      return { ...product, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ score, ...product }, index) => ({
      ...product,
      match: index === 0 ? 'Best match' : score >= 7 ? 'Strong match' : 'Good option',
    }));
}

function withMeta(result) {
  return {
    mode: 'firebase-gemini',
    model: process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
    analyzedAt: new Date().toISOString(),
    result,
  };
}

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    aiMode: 'live',
    provider: 'firebase-gemini',
    model: process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
  });
});

app.post('/api/analyze/glowup', async (req, res, next) => {
  try {
    const imageInput = await imageInputFromRequest(req);
    const result = await analyzeWithGemini({ ...imageInput, prompt: glowupPrompt });
    res.json(withMeta(result));
  } catch (error) {
    next(error);
  }
});

app.post('/api/analyze/skincare', async (req, res, next) => {
  try {
    const imageInput = await imageInputFromRequest(req);
    const result = await analyzeWithGemini({ ...imageInput, prompt: skincarePrompt });
    res.json(withMeta({ ...result, productRecommendations: matchProducts(result) }));
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'AI analysis failed', message: error.message });
});

exports.ai = onRequest(
  {
    region: 'us-central1',
    timeoutSeconds: 60,
    memory: '512MiB',
    secrets: [geminiApiKey],
  },
  app
);
