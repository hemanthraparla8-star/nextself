# NextSelf AI Backend

The app now has a local AI backend at `server/index.js`.

## Run Locally

```bash
npm run server
```

Health check:

```bash
curl http://localhost:3001/health
```

## Endpoints

`POST /api/analyze/glowup`

Returns general presentation feedback for the normal AI Analysis tab.

`POST /api/analyze/skincare`

Returns skincare metrics, detected focus areas, and AM/PM routine steps.

Both endpoints accept either:

- JSON: `{ "imageUrl": "https://..." }`
- Multipart form data: `image=<uploaded image file>`

## Mock Mode

By default, the backend runs in mock mode when no OpenAI API key is present.

```env
NEXTSELF_USE_MOCK_AI=true
```

This keeps the app usable during development.

## Real OpenAI Mode

Create `.env` from `.env.example`, then set:

```env
OPENAI_API_KEY=your_backend_only_key
OPENAI_MODEL=gpt-5.4-mini
NEXTSELF_USE_MOCK_AI=false
```

Never put `OPENAI_API_KEY` in Expo public variables or client code.

For phone testing, set the app API URL to your computer's LAN address:

```env
EXPO_PUBLIC_AI_API_URL=http://192.168.x.x:3001
```

For a published app, this must be a deployed HTTPS URL:

```env
EXPO_PUBLIC_AI_API_URL=https://api.yourdomain.com
```

See `docs/mobile-and-publishing.md` for the mobile deployment shape.

## Safety Boundaries

The prompts intentionally avoid:

- Medical diagnosis.
- Attractiveness ratings.
- Identity recognition.
- Sensitive trait inference.

Production work still needs rate limits, auth, image retention rules, request logging policies, and abuse monitoring.
