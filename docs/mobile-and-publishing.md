# Mobile And Publishing Notes

## Can The AI Backend Work On A Phone Without A Server?

No. The phone app can run its UI without a backend, but real OpenAI analysis needs a reachable backend service.

Do not put `OPENAI_API_KEY` inside the Expo app. Anything shipped to a phone can be extracted. The safe production shape is:

1. Phone app captures or uploads an image.
2. Phone app sends the image to your backend over HTTPS.
3. Backend calls Gemini with `GEMINI_API_KEY`.
4. Backend returns only the structured analysis JSON the app needs.

## Development Phone Testing

For a physical phone on the same Wi-Fi:

1. Start the backend:

```bash
npm run server
```

2. Find your computer's LAN IP, then set:

```env
EXPO_PUBLIC_AI_API_URL=http://192.168.x.x:3001
```

3. Start Expo and open the app on the phone.

`localhost` means "this device", so a real phone cannot use `http://localhost:3001` to reach your computer.

## Published App Setup

Before App Store / Play Store release:

- Deploy `server/index.js` to a backend host.
- Put `GEMINI_API_KEY` only in the backend environment.
- Use HTTPS only.
- Set `EXPO_PUBLIC_AI_API_URL=https://api.yourdomain.com` before building the production app.
- Add authentication before allowing paid/production usage.
- Add rate limits and abuse monitoring.
- Define image retention rules and a delete path.
- Add privacy policy language for image processing and AI analysis.

## Offline Behavior

Offline mode can only support:

- Existing cached plans.
- Mock/demo analysis.
- Previously saved progress.

Offline mode cannot do real OpenAI image analysis unless you add a separate on-device model, which would be much less capable and much harder to ship well.
