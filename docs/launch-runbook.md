# NextSelf Launch Runbook

This runbook keeps the app moving toward a paid public release without losing track of technical quality, user trust, or revenue focus.

## Current App Shape

NextSelf is an Expo React Native app for personal growth with four core loops:

- Home: daily score, streak, XP, stats, and next action.
- Scan: photo upload plus simulated AI feedback.
- Challenges: daily tasks, categories, XP, streaks, and badges.
- Progress: charts, achievements, activity log, and subscription CTA.

The current app is a strong prototype. The major launch gap is that the most valuable pieces are simulated: AI analysis, account state, personalized challenge generation, payments, and retention systems.

## Local Health Commands

Use these before and after meaningful changes:

```bash
npm run doctor
npm run web:local
npm run audit:prod
```

Known note: as of May 7, 2026, `npm audit --omit=dev` reports a moderate PostCSS advisory through Expo's Metro toolchain. The suggested `--force` fix would downgrade Expo to SDK 49, so do not apply it blindly. Track Expo SDK updates instead.

## First Release Definition

The first release should sell one clear promise:

"A kind AI coach that turns your selfie, habits, and goals into a daily glow-up plan."

MVP must include:

- Account onboarding with goal selection and comfort boundaries.
- One AI analysis flow with transparent consent and no harsh scoring language.
- Daily personalized challenge plan.
- Streak, XP, and progress tracking that persists.
- Paywall with real purchase flow.
- Privacy-first image handling with deletion policy.

Defer until after launch:

- Social feed.
- Public leaderboards.
- Complex avatar customization.
- Multiple AI scan modes.
- Deep analytics dashboards.

## Monetization

Recommended initial model:

- Free: 1 scan per day, limited daily plan, basic progress.
- Pro monthly: $7.99/month.
- Pro annual: $47.99/year with free trial.

High-value Pro features:

- Unlimited or expanded AI scans.
- Weekly AI coach report.
- Personalized challenges by goal.
- Progress photos and before/after timeline.
- Streak protection.
- Advanced style, grooming, posture, and routine suggestions.

Avoid selling "attractiveness scores" as the core product. It may convert curiosity, but it can harm trust, increase policy risk, and weaken long-term retention. Sell confidence, presentation, and daily improvement.

## Product Risks To Handle Early

- Image privacy: users need explicit consent, clear retention rules, and an easy delete path.
- Body image and self-esteem: copy must be supportive, non-shaming, and actionable.
- AI reliability: results should be framed as suggestions, not facts or diagnoses.
- App store review: avoid medical claims, protected-class inferences, or manipulative paywalls.
- Retention: users need a useful daily plan even when they do not scan.
- Backend availability: real AI scans require a deployed HTTPS backend; never ship OpenAI keys inside the mobile app.

## Build Phases

### Phase 1: Make The Prototype Stable

- Keep `expo-doctor` clean.
- Add web/native smoke checks.
- Replace placeholder icons and splash assets.
- Add a small seed data layer that is easy to swap for a backend.
- Make scan limits reset daily.

### Phase 2: Make It Real

- Add authentication.
- Add backend persistence for profile, challenges, scans, and purchases.
- Connect AI feedback to a real vision-capable model.
- Store only derived feedback by default; avoid retaining source photos unless the user opts in.
- Add RevenueCat or native in-app purchases.

### Phase 3: Make It Profitable

- Instrument onboarding, scan completion, paywall views, trials, subscriptions, and day-7 retention.
- A/B test paywall headline, trial length, and free scan limits.
- Add lifecycle notifications for streaks and weekly reports.
- Create short-form content around daily transformations and "one small upgrade today."

## Weekly Operating Rhythm

- Monday: pick one retention feature and one revenue feature.
- Tuesday to Thursday: implement, test, and polish.
- Friday: run the app end to end, review metrics, and cut scope for the next release.
- Weekend: collect user feedback from 5 to 10 people and turn patterns into tasks.
