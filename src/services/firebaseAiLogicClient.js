import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';

import { getFirebaseApp } from '../config/firebase';

const FIREBASE_AI_MODEL = process.env.EXPO_PUBLIC_FIREBASE_AI_MODEL || 'gemini-2.5-flash';

const glowupPrompt = `
You are NextSelf's supportive personal presentation coach.
Analyze the image only for non-medical, non-sensitive presentation advice.
Do not rate attractiveness, identify the person, or infer sensitive traits.
Return JSON only as an array of exactly four cards:
[
  {
    "id": "short-kebab-id",
    "category": "Grooming" | "Skincare" | "Posture & Presence" | "Style Tips",
    "icon": "single emoji",
    "color": "#hex",
    "tips": ["one sentence", "one sentence"]
  }
]
`.trim();

const skincarePrompt = `
You are NextSelf's supportive skincare routine assistant.
Analyze the face image only for general, non-medical skincare guidance.
Do not diagnose disease, acne severity, rashes, infections, or medical conditions.
Do not identify the person, infer sensitive traits, age, ethnicity, gender identity, or attractiveness.
Return JSON only with this shape:
{
  "skinScore": 0-100,
  "skinType": "Dry" | "Oily" | "Combination" | "Normal" | "Sensitive",
  "sensitivity": "Low" | "Medium" | "High",
  "confidence": 0-100,
  "hydration": 0-100,
  "texture": 0-100,
  "tone": 0-100,
  "oilBalance": 0-100,
  "barrier": 0-100,
  "detectedConcerns": [{ "id": "short-kebab-id", "label": "short label", "severity": "Mild" | "Medium" | "High", "area": "face area", "color": "#24C89A", "note": "one sentence" }],
  "morningRoutine": [{ "id": "short-kebab-id", "step": "short step", "product": "generic product type", "timing": "short usage", "why": "one sentence" }],
  "nightRoutine": [{ "id": "short-kebab-id", "step": "short step", "product": "generic product type", "timing": "short usage", "why": "one sentence" }],
  "productRecommendations": [{ "id": "short-kebab-id", "category": "Cleanser" | "Moisturizer" | "SPF" | "Serum" | "Exfoliant", "match": "short reason label", "productType": "generic product type", "ingredients": ["ingredient"], "avoid": ["ingredient/type to avoid"], "why": "one sentence" }]
}
Recommend product categories and ingredients, not specific brands, unless the app provides a vetted product catalog.
`.trim();

function getModel() {
  const ai = getAI(getFirebaseApp(), { backend: new GoogleAIBackend() });
  return getGenerativeModel(ai, {
    model: FIREBASE_AI_MODEL,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.4,
    },
  });
}

function parseJsonText(text) {
  const cleaned = String(text || '')
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (_) {
    const start = cleaned.search(/[\[{]/);
    const end = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    throw new Error(`Firebase AI returned non-JSON text: ${cleaned.slice(0, 180)}`);
  }
}

async function imagePartFromUri(imageUri) {
  const response = await fetch(imageUri);
  if (!response.ok) throw new Error(`Could not load scan image: ${response.status}`);

  const blob = await response.blob();
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  const match = /^data:([^;]+);base64,(.+)$/i.exec(dataUrl);
  if (!match) throw new Error('Could not convert scan image for Firebase AI');

  return {
    inlineData: {
      mimeType: match[1],
      data: match[2],
    },
  };
}

async function analyzeWithFirebaseAi({ imageUri, prompt, resultFallback }) {
  const model = getModel();
  const parts = [{ text: prompt }];

  if (imageUri) {
    parts.push(await imagePartFromUri(imageUri));
  }

  const result = await model.generateContent(parts);
  const text = result.response.text();

  return {
    mode: 'firebase-ai-logic',
    model: FIREBASE_AI_MODEL,
    analyzedAt: new Date().toISOString(),
    result: parseJsonText(text) || resultFallback,
  };
}

export function shouldUseFirebaseAiLogic() {
  return process.env.EXPO_PUBLIC_AI_PROVIDER === 'firebase';
}

export function analyzeGlowupWithFirebaseAi(imageUri) {
  return analyzeWithFirebaseAi({ imageUri, prompt: glowupPrompt });
}

export function analyzeSkincareWithFirebaseAi(imageUri) {
  return analyzeWithFirebaseAi({ imageUri, prompt: skincarePrompt });
}
