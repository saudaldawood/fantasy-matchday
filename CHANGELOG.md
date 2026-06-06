# Fantasy Matchday - Development Changelog

A detailed breakdown of every commit, what was changed, why, and which files were affected.

---

## Commit `ae90286` — February 13, 2026
### Fix 5 bugs: team names on lineup page, Start Playing redirect, payment modal separate fields, league detail page 404, draft lineups in My Matches

**8 files changed, 624 insertions, 36 deletions**

This commit addresses 5 user-reported bugs in a single batch:

#### Bug 1: Team names instead of Match ID on submitted lineup page
- **Problem:** When a user submitted a lineup and viewed it, the page showed "Match #1436109" instead of the actual team names like "Al-Ahli vs Al-Hilal".
- **Fix:** Added `matchDisplayName` state. When fixture details are fetched (to get team IDs), the team names are now extracted and stored. The submitted lineup banner and My Matches cards now display proper team names.
- **Files:** `src/app/[locale]/lineup/page.tsx`

#### Bug 2: "Start Playing" button redirect when logged in
- **Problem:** The "Start Playing" button in the ReadyToWin section at the bottom of the homepage always linked to `/register`, even when the user was already logged in.
- **Fix:** Added `useAuth()` hook to `ReadyToWin.tsx`. The link now conditionally goes to `/lineup` if logged in, `/register` if not — matching the Hero component's behavior.
- **Files:** `src/components/features/ReadyToWin/ReadyToWin.tsx`

#### Bug 3: Payment modal — separate card fields + zip code
- **Problem:** The payment modal used Stripe's single `CardElement` which combines card number, expiry, and CVC into one field. The client wanted them separated, plus a zip/postal code field.
- **Fix:** Replaced `CardElement` with three separate Stripe elements: `CardNumberElement`, `CardExpiryElement`, `CardCvcElement`. Added a custom zip code input field. The zip code is sent as `billing_details.address.postal_code` during payment confirmation.
- **Files:** `src/components/features/PaymentModal/PaymentModal.tsx`, `src/components/features/PaymentModal/PaymentModal.module.css`

#### Bug 4: League detail page 404
- **Problem:** Clicking on a league card (e.g., "MB" league) navigated to `/leagues/{leagueId}` which returned a 404 because the page didn't exist.
- **Fix:** Created a new dynamic route page at `src/app/[locale]/leagues/[leagueId]/page.tsx` with full league detail view including: league header with name/description/type, invite code with copy button, leaderboard showing all members ranked by points, and a "Leave League" action button.
- **Files:** `src/app/[locale]/leagues/[leagueId]/page.tsx` (new), `src/app/[locale]/leagues/[leagueId]/page.module.css` (new)

#### Bug 5: Saved draft lineup not showing in My Matches
- **Problem:** When a user saved a draft lineup, it didn't appear in the "My Matches" section because the `getUserLineups` query filtered only for `submitted`, `locked`, and `completed` statuses.
- **Fix:** Added `'draft'` to the status filter in `getUserLineups()`. Updated the UI to show draft cards with a "📝 Draft" label and an "Edit Lineup" button instead of "View Lineup".
- **Files:** `src/services/lineups.ts`, `src/app/[locale]/lineup/page.tsx`, `src/app/[locale]/lineup/page.module.css`

---

## Commit `8ff557b` — February 13, 2026
### Fix: Simplify Firestore queries to avoid composite index requirement

**1 file changed, 28 insertions, 17 deletions**

- **Problem:** Firestore queries in `lineups.ts` used multiple `where()` clauses combined with `orderBy()`, which requires pre-built composite indexes. Without these indexes, the queries silently failed, causing the "My Matches" section to appear empty.
- **Fix:** Simplified three functions (`getUserLineupForMatch`, `getMatchLineups`, `getUserLineups`) to use only a single `where()` filter. Sorting and additional filtering are now done client-side after fetching. Added error handling with try/catch blocks.
- **Files:** `src/services/lineups.ts`

---

## Commit `1e3d1ee` — February 12, 2026
### Fix: Auth state showing register when logged in, submitted lineup confirmation view, My Matches section

**4 files changed, 413 insertions, 14 deletions**

This commit addresses three related UX issues:

#### Fix 1: Navbar auth detection
- **Problem:** The Navbar only showed the user menu when a Firestore profile was loaded. If the profile fetch failed or was slow, logged-in users saw the "Register/Login" buttons.
- **Fix:** Changed the auth check to use Firebase Auth `user` presence instead of requiring a Firestore `profile`. Added fallbacks for `displayName` and `email` when profile is null.
- **Files:** `src/components/ui/Navbar/Navbar.tsx`

#### Fix 2: Submitted lineup confirmation
- **Problem:** After submitting a lineup, there was no clear confirmation. The user was left on the same page with no visual feedback.
- **Fix:** Added a submitted lineup confirmation view that shows when a lineup is already submitted for a match. Displays a green banner with "Lineup Submitted!", the match name, status, all selected players with captain badge, and total points.
- **Files:** `src/app/[locale]/lineup/page.tsx`, `src/app/[locale]/lineup/page.module.css`

#### Fix 3: My Matches section
- **Problem:** Users had no way to see which matches they had already submitted lineups for.
- **Fix:** Added a "My Matches" section at the top of the lineup page. Created `getUserLineups()` function in `lineups.ts` to fetch all user lineups from Firestore. Each match card shows status (Submitted/Locked/Completed), points, player list, and a link to view the lineup.
- **Files:** `src/app/[locale]/lineup/page.tsx`, `src/app/[locale]/lineup/page.module.css`, `src/services/lineups.ts`

---

## Commit `a22b16d` — February 12, 2026
### Fix: 3-player selection, power-ups integration, 30-day match window, credits nav link

**5 files changed, 174 insertions, 146 deletions**

#### 3-Player Selection
- **Problem:** The lineup builder required 11 starters + 4 bench = 15 players, which was too complex for the initial MVP.
- **Fix:** Changed to a simplified 3-player selection model. Updated `MAX_PLAYERS` to 3, removed bench/formation logic, simplified validation to just check for exactly 3 players and 1 captain.
- **Files:** `src/app/[locale]/lineup/page.tsx`, `src/utils/lineup-validation.ts`

#### Power-Ups Integration
- **Fix:** Added a power-ups bar to the lineup page showing available power-ups (Captain Boost, Triple Captain, Bench Boost, Wild Card) with their credit costs. Users can activate one power-up per lineup.
- **Files:** `src/app/[locale]/lineup/page.tsx`, `src/app/[locale]/lineup/page.module.css`

#### 30-Day Match Window
- **Problem:** `getUpcomingMatches()` only fetched matches for the next 7 days, which was too narrow.
- **Fix:** Extended the window to 30 days so users can see and prepare lineups for matches further in advance.
- **Files:** `src/services/api-football.ts`

#### Credits Nav Link
- **Fix:** Updated the Navbar credits link to point to `/credits` page instead of a non-existent route.
- **Files:** `src/components/ui/Navbar/Navbar.tsx`

---

## Commit `813ecf5` — January 26, 2026
### Fix: Handle undefined avatar values in friend requests

**1 file changed, 4 insertions, 4 deletions**

- **Problem:** When sending friend requests, if a user had no profile photo (`photoURL` was undefined), the Firestore write would fail because Firestore doesn't accept `undefined` values.
- **Fix:** Added fallback to empty string (`|| ''`) for avatar URL fields in friend request creation.
- **Files:** `src/services/friends.ts`

---

## Commit `a31c606` — January 26, 2026
### Fix: Friends page auth detection and add 'friends' translation

**2 files changed, 2 insertions, 1 deletion**

- **Fix:** Fixed the Friends page to properly detect authenticated users. Added missing `'friends'` translation key to `messages/en.json`.
- **Files:** `src/app/[locale]/friends/page.tsx`, `messages/en.json`

---

## Commit `1d930fc` — January 26, 2026
### Feat: Add Friends link to navigation menu

**1 file changed, 1 insertion**

- **Fix:** Added a "Friends" link to the Navbar component so users can navigate to the friends page.
- **Files:** `src/components/ui/Navbar/Navbar.tsx`

---

## Commit `c8c2fea` — January 26, 2026
### Fix: Exclude functions folder from Next.js build (App Hosting fix)

**1 file changed, 3 insertions, 2 deletions**

- **Problem:** Firebase App Hosting was trying to compile the `functions/` folder (Cloud Functions) as part of the Next.js build, causing TypeScript errors.
- **Fix:** Added `functions` to the `exclude` array in `tsconfig.json`.
- **Files:** `tsconfig.json`

---

## Commit `356a528` — January 26, 2026
### Fix: Disable email functions temporarily (requires SendGrid API key)

**2 files changed, 14 insertions, 12 deletions**

- **Problem:** Cloud Functions that send emails via SendGrid were failing because no SendGrid API key was configured.
- **Fix:** Temporarily disabled email-related Cloud Functions and added TODO comments indicating they need a SendGrid API key to be re-enabled.
- **Files:** `functions/src/emails.ts`, `functions/src/index.ts`

---

## Commit `8130868` — January 26, 2026
### Feat: Add missing features — Live Match, Friends, Levels, Admin Broadcast

**21 files changed, 4,321 insertions, 133 deletions**

This is a major feature commit adding four new modules:

#### Live Match View
- Enhanced the match detail page (`/matches/[matchId]`) with real-time match tracking, live scores, events timeline, and lineup display.
- **Files:** `src/app/[locale]/matches/[matchId]/page.tsx`, `src/app/[locale]/matches/[matchId]/page.module.css`

#### Friends System
- Full friends feature: send/accept/reject friend requests, view friends list, search users, remove friends.
- Backend service with Firestore collections for friend requests and friendships.
- **Files:** `src/app/[locale]/friends/page.tsx`, `src/app/[locale]/friends/page.module.css`, `src/services/friends.ts`

#### Levels & XP System
- User leveling system with XP earned from activities (submitting lineups, winning, daily login, etc.).
- Level display component showing current level, XP progress bar, and next level requirements.
- **Files:** `src/components/features/LevelDisplay/LevelDisplay.tsx`, `src/components/features/LevelDisplay/LevelDisplay.module.css`, `src/services/levels.ts`

#### Admin Broadcast
- Admin panel page for sending broadcast notifications to all users.
- Cloud Functions for handling broadcasts, notifications, referrals, and emails.
- **Files:** `src/app/[locale]/admin/broadcast/page.tsx`, `src/app/[locale]/admin/broadcast/page.module.css`, `functions/src/broadcast.ts`, `functions/src/notifications.ts`, `functions/src/referrals.ts`, `functions/src/emails.ts`

#### Auth Provider
- Added a centralized `AuthProvider` component for managing authentication state across the app.
- **Files:** `src/providers/AuthProvider.tsx`

---

## Commit `0b5efad` — January 26, 2026
### Update to Pro API key for current season access

**2 files changed, 1 insertion, 1 deletion**

- **Problem:** The free API-Football key only had access to historical data, not the current 2025 season.
- **Fix:** Updated to the client's Pro API key in `apphosting.yaml`. Updated `.gitignore` to protect sensitive keys.
- **Files:** `apphosting.yaml`, `.gitignore`

---

## Commit `8b3d205` — January 26, 2026
### Fix: Update API configuration for 2025 season

**1 file changed, 88 insertions**

- **Fix:** Added a test script (`test-api-current.js`) to verify the API key works with the current 2025 season and returns valid fixture data.
- **Files:** `test-api-current.js`

---

## Commit `450db41` — January 21, 2026
### Remove hardcoded season, use auto-detection

**1 file changed, 2 deletions**

- **Fix:** Removed the hardcoded `NEXT_PUBLIC_SPL_SEASON=2024` from `apphosting.yaml` so the app uses the auto-detection function instead.
- **Files:** `apphosting.yaml`

---

## Commit `deaafcf` — January 21, 2026
### Auto-detect current football season for API calls

**1 file changed, 11 insertions, 1 deletion**

- **Problem:** The season was hardcoded to `2024`, causing the app to show old/no matches for the current 2025 season.
- **Fix:** Added `getCurrentSeason()` function that automatically determines the season based on the current date. Football seasons run Aug–Jul, so Jan–Jul = previous year, Aug–Dec = current year.
- **Files:** `src/services/api-football.ts`

---

## Commit `9c218de` — January 18, 2026
### Fix: Add caching and rate limit handling to prevent API quota exhaustion

**1 file changed, 34 insertions, 3 deletions**

- **Problem:** The app was making too many API calls, hitting the rate limit (10 requests/minute on free tier).
- **Fix:** Added `next: { revalidate: 1800 }` to cache API responses for 30 minutes. Added rate limit error detection and user-friendly error messages.
- **Files:** `src/services/api-football.ts`

---

## Commit `bb6bc95` — January 18, 2026
### Fix: Add validation and error handling for player data fetching

**2 files changed, 21 insertions, 1 deletion**

- **Fix:** Added validation to check if player data is available before rendering the lineup builder. Shows a helpful message if no players are found (e.g., "Player data not available for this match yet").
- **Files:** `src/app/[locale]/lineup/page.tsx`, `src/services/players.ts`

---

## Commit `b123f8e` — January 18, 2026
### Fix: Add logging to debug player fetching and improve error handling

**2 files changed, 26 insertions, 6 deletions**

- **Fix:** Added `console.log` statements throughout the player fetching pipeline to help debug issues where players weren't loading. Improved error messages.
- **Files:** `src/services/api-football.ts`, `src/services/players.ts`

---

## Commit `406c94e` — January 18, 2026
### Fix: Add missing Firestore index for leagues collection

**1 file changed, 22 insertions**

- **Problem:** Firestore queries for leagues required composite indexes that weren't defined.
- **Fix:** Added required composite index definitions to `firestore.indexes.json`.
- **Files:** `firestore.indexes.json`

---

## Commit `5cde5a1` — January 18, 2026
### Fix: Add missing properties to LineupEntry and fix validation call

**1 file changed, 24 insertions, 26 deletions**

- **Problem:** The `LineupEntry` objects created in the lineup page were missing required properties (`multiplier`, `pointsEarned`), causing TypeScript errors and potential runtime issues.
- **Fix:** Added default values for `multiplier: 1` and `pointsEarned: 0` when creating new lineup entries. Fixed the validation function call to pass the correct arguments.
- **Files:** `src/app/[locale]/lineup/page.tsx`

---

## Commit `b3cfd66` — January 18, 2026
### Fix: Add missing handleSave and handleSubmit functions to lineup page

**1 file changed, 111 insertions, 1 deletion**

- **Problem:** The lineup page had "Save Draft" and "Submit Lineup" buttons but the handler functions (`handleSave`, `handleSubmit`) were not implemented.
- **Fix:** Implemented both functions. `handleSave` creates/updates a draft in Firestore using `saveLineupDraft()`. `handleSubmit` validates the lineup, then calls `submitLineup()` to finalize it. Both include error handling and success feedback.
- **Files:** `src/app/[locale]/lineup/page.tsx`
