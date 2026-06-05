# Firestore Data Model

Owner: Fahad Alhomaidhi - Authentication, database, and security.

This document describes the Firestore collections, protected fields, rules, and indexes consolidated for the role-based baseline PR.

## Access model

`firestore.rules` defines three core helpers:

- `isAuthenticated()`: request has a Firebase Auth user.
- `isOwner(userId)`: request user id matches the document owner id.
- `isAdmin()`: authenticated user has `users/{uid}.isAdmin == true`.

The rules make public match/player/achievement reads available where needed, require authentication for user-owned gameplay data, and reserve sensitive writes for admins or trusted server flows.

## users

Purpose: app profile for each Firebase Auth user.

Important fields:

- `id`
- `email`
- `displayName`
- `avatarUrl`
- `language`
- `favoriteTeam`
- `notificationSettings`
- `totalPoints`
- `weeklyPoints`
- `matchesPlayed`
- `averagePointsPerMatch`
- `bestMatchScore`
- `worstMatchScore`
- `credits`
- `isPremium`
- `isAdmin`
- `level`
- `achievements`
- `badges`
- `loginStreak`
- `lastLoginDate`
- `lastActiveAt`
- `friends`
- `leagues`
- `globalRank`
- `previousRank`
- `rankChange`
- `isActive`
- `isBanned`
- `status`
- `statusReason`
- `createdAt`
- `updatedAt`

Access:

- Authenticated users can read user profiles.
- A user can create their own `users/{uid}` profile.
- A user can update their own profile except protected fields.
- Users cannot delete profiles.

Protected fields:

- `credits`
- `totalPoints`
- `isPremium`
- `isAdmin`

These are protected because they affect money-like balance, ranking, paid state, and authorization. They must be changed by trusted admin/server flows, not direct client edits.

## matches

Purpose: football match records used by lineup and scoring workflows.

Important fields:

- `id`
- `homeTeam`
- `awayTeam`
- `venue`
- `matchDate`
- `round`
- `season`
- `status`
- `currentMinute`
- `homeScore`
- `awayScore`
- `lineupDeadline`
- `totalParticipants`
- `isActive`

Access:

- Public read.
- Admin-only write.

The composite index on `status` and `matchDate` supports queries for upcoming/live/finished match lists ordered by date.

## players

Purpose: player catalog used to build lineups and calculate points.

Important fields:

- `id`
- `name`
- `nameAr`
- `photo`
- `jerseyNumber`
- `teamId`
- `position`
- `form`
- `totalPoints`
- `averagePoints`
- `isAvailable`

Access:

- Public read.
- Admin-only write.

## lineups

Purpose: user-submitted fantasy selections for a match.

Important fields:

- `id`
- `userId`
- `matchId`
- `entries`
- `formation`
- `captainPlayerId`
- `totalPoints`
- `livePoints`
- `rank`
- `status`
- `submittedAt`
- `lockedAt`
- `createdAt`
- `updatedAt`

Access:

- Authenticated read.
- Authenticated users can create lineups only for their own `userId`.
- Owners can update or delete only while the lineup status is `draft`.

Indexes:

- `matchId`, `status`, `totalPoints desc` supports match leaderboards and ranked lineup views.
- `userId`, `matchId`, `createdAt desc` supports user lineup history and lookups by match.

## leagues

Purpose: private or public competition groups.

Important fields:

- `id`
- `name`
- `creatorId`
- `adminIds`
- `privacy`
- `status`
- `memberCount`
- `createdAt`
- `updatedAt`

Access:

- Authenticated read.
- Authenticated users can create.
- League admins can update.
- Creator can delete.

Index:

- `privacy`, `status`, `memberCount`, document name supports league discovery and ordered league lists.

## leagueMemberships

Purpose: relation between users and leagues.

Important fields:

- `id`
- `leagueId`
- `userId`
- `status`
- `role`
- `totalPoints`
- `joinedAt`
- `updatedAt`

Access:

- Authenticated read.
- Users can create memberships only for themselves.
- Owners can update or delete their own membership.

Index:

- `leagueId`, `status`, `totalPoints desc` supports league standings.

## creditTransactions

Purpose: immutable credit ledger for purchases, rewards, and spending.

Important fields:

- `id`
- `userId`
- `type`
- `amount`
- `balanceAfter`
- `amountPaid`
- `currency`
- `description`
- `createdAt`

Access:

- Owner-only read.
- Client writes are denied.

Index:

- `userId`, `createdAt desc` supports transaction history ordered newest first.

## achievements

Purpose: global achievement definitions.

Important fields:

- `id`
- `name`
- `nameAr`
- `description`
- `type`
- `criteria`
- `reward`
- `isActive`

Access:

- Public read.
- Admin-only write.

## userAchievements

Purpose: awarded achievements for each user.

Important fields:

- `id`
- `userId`
- `achievementId`
- `earnedAt`
- `progress`
- `notified`

Access:

- Authenticated read.
- Client writes are denied.

Awards should be written through trusted server/admin logic.

## notifications

Purpose: per-user notification inbox and push/email tracking.

Important fields:

- `id`
- `userId`
- `type`
- `title`
- `body`
- `data`
- `isRead`
- `readAt`
- `createdAt`

Access:

- Owner-only read.
- Owners can update only `isRead` and `readAt`.
- Client writes are denied.

Index:

- `userId`, `isRead`, `createdAt desc` supports unread inbox queries ordered newest first.

## Why composite indexes are needed

Firestore requires composite indexes when a query combines multiple equality filters, range/order clauses, or ordered ranking fields. `firestore.indexes.json` supports the app's main query paths:

- Match leaderboard queries for lineups.
- User lineup history queries.
- League standings.
- Notification inbox queries.
- Credit transaction history.
- Match status/date queries.
- League discovery queries.

## What firestore.rules protects

`firestore.rules` protects:

- Authenticated-only profile and gameplay reads.
- Owner-only profile creation.
- Protected user fields: credits, points, premium, and admin.
- Draft-only lineup updates/deletes.
- Admin-only match/player/achievement writes.
- Server-only credit transactions, notifications, and user achievement writes.
- Owner-only notification reads and read-state updates.

## What firestore.indexes.json supports

`firestore.indexes.json` declares the composite indexes required for efficient and valid Firestore queries in the app. Without these indexes, Firestore would reject several multi-field ordered queries at runtime and return a missing-index error.
