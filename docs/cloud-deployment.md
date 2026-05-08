# Cloud Deployment

Users can only run real AI scans when the phone app can reach a hosted backend. Your PC does not need to stay on once the backend is deployed to a cloud service.

## Backend Deployment Shape

Deploy the backend in `server/index.js` as a web service.

Required environment variables:

```env
NODE_ENV=production
AI_SERVER_HOST=0.0.0.0
OPENAI_API_KEY=your_backend_only_key
AI_PROVIDER=gemini
GEMINI_API_KEY=your_google_ai_studio_key
GEMINI_MODEL=gemini-2.0-flash
NEXTSELF_USE_MOCK_AI=false
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=20
```

Most cloud hosts provide `PORT` automatically. The backend reads `PORT` first, then falls back to `AI_SERVER_PORT`.

## Render Setup

This repo includes `render.yaml`.

1. Push the repo to GitHub.
2. Create a new Render Blueprint from the repo.
3. Add `GEMINI_API_KEY` in Render's environment settings.
4. Deploy.
5. Confirm:

```bash
curl https://your-backend-url.onrender.com/health
```

The response should show:

```json
{ "ok": true, "mode": "openai" }
```

If it says `mock`, either `OPENAI_API_KEY` is missing or `NEXTSELF_USE_MOCK_AI=true`.

If it says `mock`, either the selected provider key is missing or `NEXTSELF_USE_MOCK_AI=true`.

## Docker Hosts

This repo includes a `Dockerfile`.

Build and run locally:

```bash
docker build -t nextself-ai-backend .
docker run -p 3001:3001 --env-file .env nextself-ai-backend
```

Deploy the same image to Fly.io, Railway, Google Cloud Run, AWS App Runner, Azure Container Apps, or another container host.

## Connect The Phone App

For production builds, set the public app API URL to your deployed HTTPS backend:

```env
EXPO_PUBLIC_AI_API_URL=https://your-backend-domain.com
```

Then build the app. Expo public env values are bundled at build time, so changing this after a production build requires a new build or update.

## App Store Readiness

Before public launch:

- Use HTTPS only.
- Keep `OPENAI_API_KEY` backend-only.
- Add user accounts or device auth before paid launch.
- Add stronger per-user rate limits.
- Add request logging without storing raw face images.
- Add a privacy policy explaining image processing.
- Add a delete-data path if any scan data is stored.
