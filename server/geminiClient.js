const DEFAULT_GEMINI_MODEL = 'gemini-2.0-flash';

function getGeminiModel() {
  return process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
}

function parseDataUrl(dataUrl) {
  const match = /^data:([^;]+);base64,(.+)$/i.exec(dataUrl || '');
  if (!match) return null;
  return {
    mimeType: match[1],
    data: match[2],
  };
}

async function imagePartFromInput(imageData) {
  const parsed = parseDataUrl(imageData);
  if (parsed) {
    return {
      inlineData: {
        mimeType: parsed.mimeType,
        data: parsed.data,
      },
    };
  }

  const response = await fetch(imageData);
  if (!response.ok) throw new Error(`Could not fetch image URL: ${response.status}`);

  const contentType = response.headers.get('content-type') || 'image/jpeg';
  const buffer = Buffer.from(await response.arrayBuffer());

  return {
    inlineData: {
      mimeType: contentType,
      data: buffer.toString('base64'),
    },
  };
}

function extractJsonText(result) {
  const parts = result?.candidates?.[0]?.content?.parts || [];
  return parts.map((part) => part.text || '').join('\n').trim();
}

async function analyzeImageWithGemini({ imageData, prompt }) {
  if (!process.env.GEMINI_API_KEY) return null;

  const imagePart = await imagePartFromInput(imageData);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${getGeminiModel()}:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }, imagePart],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gemini request failed: ${response.status} ${text}`);
  }

  const result = await response.json();
  return JSON.parse(extractJsonText(result));
}

module.exports = {
  analyzeImageWithGemini,
  getGeminiModel,
};
