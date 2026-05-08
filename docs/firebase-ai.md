# Firebase AI Backend

NextSelf can run its AI backend on Firebase Cloud Functions so real users can scan from their phones without your PC running.

## Architecture

- The Expo app sends scan requests to `EXPO_PUBLIC_AI_API_URL`.
- Firebase hosts an HTTPS function at `/ai`.
- The Firebase function calls Gemini with the private `GEMINI_API_KEY` secret.
- The app never contains the Gemini key.

## Setup

1. Create a Firebase project.
2. Copy `.firebaserc.example` to `.firebaserc` and replace `your-firebase-project-id`.
3. Install the Firebase CLI.
4. From `functions/`, run `npm install`.
5. Add the Gemini key as a Firebase secret:

```bash
firebase functions:secrets:set GEMINI_API_KEY
```

6. Deploy:

```bash
firebase deploy --only functions
```

7. Set the app URL to the deployed function base:

```bash
EXPO_PUBLIC_AI_API_URL=https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/ai
```

## Notes

Firebase Functions may still require a billing-enabled Firebase project for deployment, even when usage stays inside the free tier. The Gemini key should stay in Firebase secrets only.

## Firebase AI Logic Client Option

If you want to stay on the Spark plan during early testing, use Firebase AI Logic instead of Cloud Functions.

1. In Firebase Console, open **AI services > Firebase AI Logic**.
2. Choose the **Gemini Developer API** provider.
3. Finish the setup wizard for the `nextself-93b1a` Web app.
4. In the Expo `.env` file, switch:

```bash
EXPO_PUBLIC_AI_PROVIDER=firebase
```

The Firebase Web config is already wired through `src/config/firebase.js`. Firebase config values are client identifiers, not private Gemini secrets, but production usage should still enable Firebase App Check and conservative per-user rate limits.
