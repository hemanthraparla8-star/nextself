require('dotenv').config();

const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');

const { analyzeImageWithPrompt, getModel } = require('./openaiClient');
const { glowupPrompt, skincarePrompt } = require('./prompts');
const { glowupAnalysis, skincareAnalysis, withMeta } = require('./mockResults');
const { imageInputFromRequest } = require('./imageInput');

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

const PORT = Number(process.env.PORT || process.env.AI_SERVER_PORT || 3001);
const HOST = process.env.AI_SERVER_HOST || '0.0.0.0';
const useMock = () => process.env.NEXTSELF_USE_MOCK_AI === 'true' || !process.env.OPENAI_API_KEY;
const scanLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000),
  limit: Number(process.env.RATE_LIMIT_MAX || 20),
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '12mb' }));

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    mode: useMock() ? 'mock' : 'openai',
    model: useMock() ? 'mock' : getModel(),
  });
});

app.post('/api/analyze/glowup', scanLimiter, upload.single('image'), async (req, res, next) => {
  try {
    const imageData = imageInputFromRequest(req);
    if (!imageData) {
      res.status(400).json({ error: 'image_required' });
      return;
    }

    if (useMock()) {
      res.json(withMeta(glowupAnalysis, 'mock'));
      return;
    }

    const result = await analyzeImageWithPrompt({ imageData, prompt: glowupPrompt });
    res.json(withMeta(result, 'openai'));
  } catch (error) {
    next(error);
  }
});

app.post('/api/analyze/skincare', scanLimiter, upload.single('image'), async (req, res, next) => {
  try {
    const imageData = imageInputFromRequest(req);
    if (!imageData) {
      res.status(400).json({ error: 'image_required' });
      return;
    }

    if (useMock()) {
      res.json(withMeta(skincareAnalysis, 'mock'));
      return;
    }

    const result = await analyzeImageWithPrompt({ imageData, prompt: skincarePrompt });
    res.json(withMeta(result, 'openai'));
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    error: 'analysis_failed',
    message: process.env.NODE_ENV === 'production' ? 'Analysis failed' : error.message,
  });
});

app.listen(PORT, HOST, () => {
  console.log(`NextSelf AI server running on http://${HOST}:${PORT}`);
  console.log(`Local URL: http://localhost:${PORT}`);
  console.log(`AI mode: ${useMock() ? 'mock' : 'openai'} (${useMock() ? 'no API key or mock forced' : getModel()})`);
});
