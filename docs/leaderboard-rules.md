# Leaderboard And Business Logic Rules

This document records the migrated leaderboard, lineup, credits, achievements, and progression logic for the role-based baseline owned by Abdulmohsen Binkhamis.

## Scope

This baseline consolidates the business logic currently represented in:

- `functions/src/calculatePoints.ts`
- `functions/src/updateLeaderboards.ts`
- `functions/src/lockLineups.ts`
- `functions/src/credits.ts`
- `functions/src/stripe.ts`
- `src/services/leaderboard.ts`
- `src/services/lineups.ts`
- `src/services/levels.ts`
- `src/services/achievements.ts`
- `src/services/credits.ts`
- `src/services/profile-stats.ts`
- `src/app/[locale]/leaderboard/`
- `src/app/[locale]/lineup/`
- `src/app/[locale]/achievements/`
- `src/app/[locale]/credits/`
- `src/app/[locale]/transactions/`
- `src/app/[locale]/prizes/`
- `src/types/`
- `src/data/`

## Global Leaderboard

The frontend global leaderboard reads users from Firestore ordered by `totalPoints` descending and displays a rank based on list position. It also displays user metadata such as display name, avatar, matches played, and weekly movement.

The scheduled Cloud Function `updateLeaderboards` runs every 5 minutes during live matches. It checks for at least one `matches` document with `status == "live"`, then orders all users by `totalPoints` descending and writes:

- `globalRank`
- `previousRank`
- `rankChange`
- `rankUpdatedAt`

During this scheduled update, users with equal `totalPoints` share the same rank. The next distinct score skips by the number of users tied at the previous rank.

## Match Leaderboard

The frontend match leaderboard reads `lineups` for a specific `matchId`, filters to submitted or completed lineups, orders by `totalPoints` descending, and displays the top entries. It fetches each lineup owner's user record for display name and avatar.

The lineup service also exposes `getMatchLineups`, which returns lineups for a match and sorts them client-side by `totalPoints` descending. It includes `submitted`, `locked`, and `completed` statuses.

## Weekly Leaderboard

The weekly leaderboard service computes the current week from Sunday 00:00 through Saturday 23:59:59.999. It reads completed lineups created in that window, aggregates `totalPoints` per user, sorts users by weekly points descending, and returns rank, user, points, and match count.

Weekly credit rewards run every Monday at 00:00 Asia/Riyadh. The Function reads the top 100 users ordered by `weeklyPoints` descending, awards credits by rank band, writes a `creditTransactions` record, and resets each rewarded user's `weeklyPoints` to 0.

## Lineup Submission Lifecycle

The frontend lineup service creates new lineups with:

- `status: "draft"`
- `entries`
- `formation`
- `captainPlayerId`
- `totalPoints: 0`
- `livePoints: 0`
- `rank: 0`

Drafts can be updated while they remain drafts. `submitLineup` changes the status to `submitted` and records `submittedAt`. After a lineup is no longer a draft, the frontend service prevents editing through `saveLineupDraft`.

## Lineup Locking

The `lockLineups` scheduled Function runs every minute in the Asia/Riyadh timezone. It finds upcoming matches whose `matchDate` is less than or equal to the current time. For each match, it finds draft lineups for that match.

Lineups with at least 11 players are changed to:

- `status: "locked"`
- `lockedAt: serverTimestamp()`

Incomplete lineups are changed to:

- `status: "missed"`
- `missedAt: serverTimestamp()`
- `missedReason: "Incomplete lineup"`

The Function also creates a notification for locked or missed lineups and updates the match to `status: "live"`.

Known confirmation item: the frontend submit flow uses `submitted`, while the locking Function currently queries only `draft` lineups. The intended production lifecycle should confirm whether submitted lineups should be locked, or whether the frontend should keep valid lineups as drafts until kickoff.

## Points Calculation

The `calculateLivePoints` scheduled Function runs every 2 minutes during live matches. For every live match, it fetches player statistics from API-FOOTBALL, reads locked lineups for that match, calculates each player's points, stores a `playerPoints` map, and updates lineup `totalPoints`.

When a match changes to `finished`, `finalizeMatchPoints` marks locked lineups as `completed` and increments each user's:

- `totalPoints`
- `matchesPlayed`

Clean sheets are calculated from the match score. Own goals are read from fixture events. The implementation has a `motm` scoring rule in the table, but current point calculation does not apply man-of-the-match points.

## Captain And Power-Ups

The captain multiplier is applied after base points are calculated.

- Normal captain: `2x`
- `triple_captain` on captain: `3x`
- `bench_boost`: adds bench player points with no captain multiplier

Power-up purchases are handled by credits. The Function validates the user, credits balance, lineup ownership, draft status, and duplicate use before deducting credits and adding the power-up to the lineup.

Known confirmation item: `captain_boost` and `wild_card` have configured credit costs, but the current scoring Function only applies `triple_captain` and `bench_boost`.

## Credits And Rewards

Credits affect gameplay because they can purchase power-ups. Credit rewards are configured as:

- Daily login: 10
- Match participation: 20
- Weekly top 10: 500
- Weekly top 50: 200
- Weekly top 100: 100
- Weekly participation fallback: 50
- League win: 500
- Achievement: 50
- Referral: 100

Power-up costs are configured as:

- `captain_boost`: 50
- `triple_captain`: 100
- `bench_boost`: 75
- `wild_card`: 150

## Achievements And Levels

Achievements define progression milestones across matches, points, ranks, social activity, and special actions. Each achievement has a requirement, tier, and credit reward.

Levels are based on total XP. XP sources include match participation, strong match ranks, points earned, daily login, weekly bonus, achievements, league actions, friend actions, referrals, and power-up usage. Level-ups can grant credits, badges, or unlocks.

## Known Edge Cases

- Scheduled global leaderboard updates handle tied `totalPoints`, but the match-finished `updateGlobalRanks` trigger currently assigns sequential ranks without tie handling.
- Frontend leaderboard rank display uses array position, which may not match stored tied `globalRank`.
- Match leaderboard filters include `submitted` and `completed`, while live scoring reads only `locked` lineups.
- Locking currently reads draft lineups, while frontend submission moves lineups to `submitted`.
- The scoring table includes `motm`, but the current calculation does not add it.
- Own goals depend on fixture event details matching `Own Goal`.
- Clean sheet logic applies from final/current match score and does not check minutes played beyond the separate 60-minute bonus.
- Weekly rewards rank users sequentially and do not currently document tied weekly reward handling.

## Tie-Breaker Rules To Confirm

- Whether equal global scores should always share rank across scheduled and final updates.
- Whether match leaderboard ties should share rank or use a secondary sort.
- Whether weekly leaderboard and weekly credit rewards should share rank for tied weekly points.
- Whether secondary tie-breakers should include matches played, earliest score time, fewer transfers/power-ups, or captain points.

## Ownership Checklist

- Can explain how fantasy points are calculated.
- Can explain how lineups are locked.
- Can explain how leaderboard rankings are updated.
- Can explain how credits/power-ups affect scoring.
- Can explain what happens when two users have the same score.
- Can explain which files are shared with backend/frontend owners.

## Shared Areas

The Cloud Functions files overlap with Saud's backend ownership because they run scheduled, callable, and Firestore-triggered backend logic. The frontend pages and service files overlap with Khalid's frontend/UI ownership because they render and fetch leaderboard, lineup, achievements, credits, transactions, and prizes data. They are included here because this role owns the business rules and needs these files for the domain to compile and make sense.
