# Cloud Functions — Ownership & Reference

**Owner:** Saud Dawood  
**Domain:** Firebase Cloud Functions / Backend / API Integration  
**Entry Point:** `functions/src/index.ts`

---

## What Cloud Functions Are Used For

Firebase Cloud Functions provide the server-side backend for Fantasy Matchday. They handle all operations that must run securely outside the client: syncing live match data from external APIs, calculating fantasy points in real-time, locking lineups at kickoff, processing payments, sending push notifications, and enforcing admin access control.

All functions are deployed to Firebase and run on Node 20. They are organized into individual source files by domain, all exported from `functions/src/index.ts`.

---

## Function Files

### `syncMatches.ts` — Match Data Sync
- **`syncMatches`** (scheduled, every 6 hours): Fetches all Saudi Pro League fixtures for the current season from API-Football and writes them to the `matches` Firestore collection. Uses batched writes to stay within Firestore's 500-document batch limit.
- **`syncMatchData`** (callable): Syncs a single match by fixture ID. Used for live updates during active matches.

### `calculatePoints.ts` — Live Points Calculation (shared domain — see below)
- **`calculateLivePoints`** (scheduled, every 2 minutes): Runs while matches are live. Fetches per-player statistics and events from API-Football, applies position-based scoring rules, respects captain multiplier and power-ups (bench boost, triple captain), and writes `totalPoints` + `playerPoints` to each locked lineup.
- **`finalizeMatchPoints`** (Firestore trigger on `matches/{matchId}`): Fires when a match transitions to `finished`. Marks all locked lineups as `completed` and increments each user's `totalPoints` and `matchesPlayed`.

### `lockLineups.ts` — Lineup Locking (shared domain — see below)
- **`lockLineups`** (scheduled, every 1 minute): Checks for `upcoming` matches whose `matchDate` has passed. Locks lineups with ≥11 players, marks incomplete lineups as `missed`, sends in-app notifications, and transitions the match to `live`.

### `updateLeaderboards.ts` — Leaderboard Updates (shared domain — see below)
- **`updateLeaderboards`** (scheduled, every 5 minutes): Only runs when live matches exist. Re-ranks all users by `totalPoints`, calculates rank change, and updates all active league leaderboards via `leagueMemberships`.
- **`updateGlobalRanks`** (Firestore trigger on `matches/{matchId}`): Fires on match completion to do a final global rank recalculation.

### `credits.ts` — Credits System
- **`awardDailyLoginCredits`** (callable): Awards 10 credits for first login of the day. Prevents double-awards using `lastLoginReward` timestamp.
- **`awardMatchParticipationCredits`** (Firestore trigger on `lineups/{lineupId}`): Awards 20 credits when a lineup transitions from `draft` → `locked`.
- **`purchasePowerUp`** (callable): Validates credit balance, deducts cost, and activates a power-up (`captain_boost`, `triple_captain`, `bench_boost`, `wild_card`) on a lineup. All done in a Firestore transaction.
- **`awardWeeklyRewards`** (scheduled, Mondays at midnight): Distributes tiered credit rewards to the top 100 users by `weeklyPoints`, then resets `weeklyPoints` to 0.

### `stripe.ts` — Stripe Payment Integration
- **`createPaymentIntent`** (callable, requires `STRIPE_SECRET_KEY` secret): Creates a Stripe PaymentIntent for one of four credit packages (500/1200/2500/6000 credits). Stores a pending transaction in Firestore.
- **`handleStripeWebhook`** (HTTP endpoint, requires `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`): Receives Stripe webhook events. On `payment_intent.succeeded`, credits the user and creates a transaction record in a Firestore transaction. On failure, marks the transaction failed and notifies the user.
- **`getTransactionHistory`** (callable): Returns the calling user's credit transaction history from `creditTransactions`.

### `notifications.ts` — Push Notifications
- **`sendMatchReminders`** (scheduled, every 15 minutes): Sends FCM topic messages (`match_reminders`) for matches starting in 30–45 minutes.
- **`sendDeadlineReminders`** (scheduled, every 15 minutes): Sends FCM topic messages (`deadline_reminders`) for matches starting in 60–75 minutes (lineup deadline alert).

### `admin.ts` — Admin Role Management
- **`assignAdminRole`** (callable): Sets Firebase Auth custom claims (`admin: true`, `role`) on a target user. Restricted to `super_admin` callers.
- **`removeAdminRole`** (callable): Clears admin custom claims. Restricted to `super_admin`.
- **`banUserSecure`** (callable): Disables a user's Firebase Auth account and sets their Firestore status to `banned`. Requires `super_admin` or `user_admin` role.
- **`verifyAdminRole`** (helper, not exported as a function): Utility to check a user's role from other functions.

### `referrals.ts` — Referral System
- **`generateReferralCode`** (Firestore trigger on `users/{userId}` create): Auto-generates an 8-character alphanumeric code using `nanoid` and writes it to the user document and the `referralCodes` index collection.
- **`applyReferralCode`** (callable): Validates and applies a referral code. Rewards both the new user and the referrer with 100 credits each via a Firestore transaction. Prevents self-referral and double-application.

### `broadcast.ts` — Admin Broadcast Notifications
- **`sendBroadcastNotification`** (callable): Admin-only. Sends in-app notifications to targeted audiences (`all`, `premium`, `league`, `inactive`). Supports scheduled delivery.
- **`processScheduledBroadcasts`** (scheduled, every 15 minutes): Processes any pending scheduled broadcasts whose `scheduledFor` timestamp has passed.
- **`getBroadcastHistory`** (callable): Admin-only. Returns recent broadcast history from `broadcastHistory`.

### `emails.ts` — Email System (currently disabled)
Implements SendGrid-based emails: welcome email on signup, weekly summary, and league invitation. All exports are commented out in `index.ts` because `SENDGRID_API_KEY` is not yet configured. The file is kept in the repository for future activation.

---

## Scheduled vs Callable Functions

| Type | Description | Examples |
|------|-------------|---------|
| **Scheduled (pubsub)** | Run automatically on a cron schedule | `syncMatches`, `calculateLivePoints`, `lockLineups`, `updateLeaderboards`, `sendMatchReminders` |
| **Callable (https.onCall)** | Invoked directly from the client SDK | `awardDailyLoginCredits`, `purchasePowerUp`, `createPaymentIntent`, `applyReferralCode` |
| **Firestore trigger** | Fire when a document is created/updated | `generateReferralCode`, `awardMatchParticipationCredits`, `finalizeMatchPoints`, `updateGlobalRanks` |
| **HTTP endpoint** | Raw HTTP (not client SDK) | `handleStripeWebhook` |

---

## Firebase Admin SDK Usage

`firebase-admin` is initialized once per file with `if (!admin.apps.length)` guards to prevent double-initialization across function cold starts. The Admin SDK is used for:

- **Firestore** (`admin.firestore()`): All database reads and writes
- **Auth** (`admin.auth()`): Setting custom claims, disabling users
- **Messaging** (`admin.messaging()`): Sending FCM push notifications

---

## API-Football / API-Sports Integration

- Base URL: `https://v3.football.api-sports.io`
- League ID: `307` (Saudi Pro League)
- API key is stored in Firebase runtime config, set via:
  ```
  firebase functions:config:set apifootball.key="YOUR_KEY"
  ```
- Used in `syncMatches.ts` (fixture list) and `calculatePoints.ts` (player stats and events)

---

## Secrets and Runtime Config Required

These are **not committed** to the repository. They must be set before deploying:

| Secret / Config | How to set | Used by |
|----------------|-----------|---------|
| `apifootball.key` | `firebase functions:config:set apifootball.key="..."` | `syncMatches`, `calculatePoints` |
| `STRIPE_SECRET_KEY` | Firebase Secret Manager | `stripe.ts` |
| `STRIPE_WEBHOOK_SECRET` | Firebase Secret Manager | `stripe.ts` (webhook verification) |
| `SENDGRID_API_KEY` | Firebase Secret Manager | `emails.ts` (currently disabled) |

Stripe secrets use `defineSecret` from `firebase-functions/params` and are passed to functions via `.runWith({ secrets: [...] })`.

---

## Why `functions/node_modules` and `functions/lib` Are Not Committed

- **`node_modules`**: Installed from `package.json` by `npm install`. Including it would add hundreds of megabytes of generated files to Git and would break cross-platform installs.
- **`lib`**: The TypeScript compiler output directory. Generated by `npm run build` (runs `tsc`). Committing build artifacts causes merge conflicts and is unnecessary — the CI/CD pipeline or developer always rebuilds from source before deployment.

---

## Known Build Issue

Running `npm run build` currently fails with two TypeScript errors:

1. **`src/referrals.ts` — `nanoid` not found**: The `nanoid` package is imported but not listed in `functions/package.json` dependencies. Fix: `npm install nanoid`.
2. **`src/emails.ts` — `@sendgrid/mail` not found**: The SendGrid package is imported but not in `package.json`. The email exports are already disabled in `index.ts`. Fix: `npm install @sendgrid/mail`, or exclude `emails.ts` from compilation until the email feature is activated.

These are missing dependency entries in the original `package.json` — not structural backend problems. Both packages were used in the original local project but were not committed to the manifest.

---

## Files with Shared Domain Ownership

The following files are exported from `index.ts` and required to build the functions bundle, but their logic overlaps with Abdulmohsen's leaderboard/scoring domain:

| File | Exports | Note |
|------|---------|------|
| `calculatePoints.ts` | `calculateLivePoints`, `finalizeMatchPoints` | Scoring rules and points calculation — Abdulmohsen is the scoring domain owner |
| `updateLeaderboards.ts` | `updateLeaderboards`, `updateGlobalRanks` | Leaderboard ranking — Abdulmohsen is the leaderboard domain owner |
| `lockLineups.ts` | `lockLineups` | Triggers lineup locking which feeds into points calculation |

These files are included in this baseline because `index.ts` exports them and they are required for the functions bundle to compile. Backend deployment is a single unit. Saud owns the infrastructure and deployment of all functions; Abdulmohsen owns the business logic within `calculatePoints.ts` and `updateLeaderboards.ts`.

---

## Backend Ownership Checklist

- [x] Can explain each exported function
- [x] Can explain how functions are deployed (`firebase deploy --only functions`)
- [x] Can explain how Firestore is accessed from functions (Firebase Admin SDK, `admin.firestore()`)
- [x] Can explain what API keys are required (see Secrets table above)
- [x] Can explain why `functions/node_modules` and `functions/lib` are not committed (generated artifacts — see above)
