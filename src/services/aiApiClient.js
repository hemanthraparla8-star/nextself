const DEFAULT_API_URL = 'http://localhost:3001';
const REQUEST_TIMEOUT_MS = 30000;

export function getAiApiUrl() {
  return process.env.EXPO_PUBLIC_AI_API_URL || DEFAULT_API_URL;
}

function isRemoteUrl(uri) {
  return typeof uri === 'string' && /^https?:\/\//i.test(uri);
}

function getFilename(uri, fallback) {
  if (!uri) return fallback;
  const clean = uri.split('?')[0];
  return clean.split('/').pop() || fallback;
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function postImageAnalysis(endpoint, imageUri) {
  const url = `${getAiApiUrl()}${endpoint}`;

  if (isRemoteUrl(imageUri)) {
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl: imageUri }),
    });

    if (!response.ok) throw new Error(`AI request failed: ${response.status}`);
    return response.json();
  }

  const form = new FormData();
  form.append('image', {
    uri: imageUri,
    name: getFilename(imageUri, 'scan.jpg'),
    type: 'image/jpeg',
  });

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    body: form,
  });

  if (!response.ok) throw new Error(`AI request failed: ${response.status}`);
  return response.json();
}

export async function analyzeGlowupImage(imageUri) {
  return postImageAnalysis('/api/analyze/glowup', imageUri);
}

export async function analyzeSkincareImage(imageUri) {
  return postImageAnalysis('/api/analyze/skincare', imageUri);
}

export async function getAiBackendHealth() {
  const response = await fetchWithTimeout(`${getAiApiUrl()}/health`, {
    method: 'GET',
  });

  if (!response.ok) throw new Error(`AI health failed: ${response.status}`);
  return response.json();
}
