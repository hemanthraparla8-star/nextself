# NextSelf Technical Roadmap

## Immediate Fixes

- Add `react-dom`, `react-native-web`, `expo-font`, and `react-native-worklets` for Expo SDK 54 compatibility.
- Keep web startup available through `npm run web:local`.
- Treat `expo-doctor` as the baseline health gate.

## Next Engineering Tasks

1. Daily State

Add date-aware scan limits, streak updates, and challenge resets. Current values persist but do not reset by calendar day.

2. Onboarding

Create a first-run flow for name, goals, current habits, and preferred coaching tone. Store it locally first, then later migrate to backend storage.

3. AI Scan Boundary

Replace the simulated timeout with a service boundary like `src/services/analysisService.js`. The first version can still return mock results, but the UI should stop knowing whether results are fake or real.

4. Skincare Scan

The skincare tab now has a first service boundary at `src/services/skincareAnalysisService.js`. The UI calls this service after a camera capture and receives skin metrics, detected focus areas, and AM/PM routine steps. Replace the mock implementation with a backend vision call when account storage and image privacy rules are ready.

5. AI Backend

The backend AI service lives in `server/index.js` and exposes `/api/analyze/glowup` and `/api/analyze/skincare`. It supports mock mode for development and OpenAI Responses API mode when `OPENAI_API_KEY` is configured. See `docs/ai-backend.md`.

6. Paywall Boundary

Replace the empty subscription button handler with a purchase service boundary. For local development, simulate success and update `user.isPremium`.

7. Data Persistence

Persist stats, progress history, badges, last scan results, and completed challenge log. Current persistence only saves user and challenges.

8. Safety And Trust

Add consent copy before the first image upload, a delete-scan action, and a settings screen for privacy controls.

## Suggested Architecture

- `src/services/storageService.js`: versioned local persistence.
- `src/services/analysisService.js`: scan analysis abstraction.
- `src/services/purchaseService.js`: subscription abstraction.
- `src/services/challengeService.js`: daily challenge generation and reset logic.
- `src/screens/OnboardingScreen.js`: first-run setup.
- `src/screens/SettingsScreen.js`: privacy, account, and subscription controls.

## Pre-Publish Checklist

- `npm run doctor` passes.
- Native iOS and Android builds launch.
- Web smoke test launches through `npm run web:local`.
- Paywall purchase and restore flows are tested.
- Image permission, denial, upload, analysis, reset, and delete paths are tested.
- Empty states exist for no scans, no challenges, no progress, and expired subscription.
- App Store privacy labels match actual behavior.
- Terms, privacy policy, and support URL are ready.
