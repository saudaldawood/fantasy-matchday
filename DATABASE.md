# Fantasy Matchday - Firestore Database Structure

## Collections Overview

### 1. **users** Collection
Stores user profile and statistics data.

**Document ID:** `{userId}` (Firebase Auth UID)

**Fields:**
```typescript
{
  email: string
  displayName: string
  avatarUrl?: string
  language: 'ar' | 'en'
  favoriteTeam?: string
  notificationSettings: {
    pushEnabled: boolean
    emailEnabled: boolean
    smsEnabled: boolean
    matchReminders: boolean
    matchResults: boolean
    rankChanges: boolean
    achievements: boolean
    leagueUpdates: boolean
    marketing: boolean
  }
  totalPoints: number
  matchesPlayed: number
  averagePointsPerMatch: number
  bestMatchScore: number
  worstMatchScore: number
  credits: number
  isPremium: boolean
  level: number
  achievements: string[]
  badges: string[]
  loginStreak: number
  lastLoginDate: Timestamp
  friends: string[]
  leagues: string[]
  isActive: boolean
  isBanned: boolean
  isAdmin: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
  lastActiveAt: Timestamp
}
```

---

### 2. **matches** Collection
Stores match information synced from API-Football.

**Document ID:** `{matchId}` (converted from API fixture ID)

**Fields:**
```typescript
{
  fixtureId: number
  homeTeam: {
    id: string
    name: string
    nameAr: string
    logo: string
  }
  awayTeam: {
    id: string
    name: string
    nameAr: string
    logo: string
  }
  venue: string
  matchDate: Timestamp
  round: number
  season: string
  status: 'scheduled' | 'live' | 'halftime' | 'completed'
  currentMinute?: number
  homeScore: number
  awayScore: number
  lineupDeadline: Timestamp
  totalParticipants: number
  isActive: boolean
  events: Array<{
    type: string
    minute: number
    playerId: string
    teamId: string
    detail: string
  }>
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

---

### 3. **players** Collection
Stores player information.

**Document ID:** Auto-generated or API player ID

**Fields:**
```typescript
{
  apiId: number
  name: string
  nameAr: string
  photo?: string
  jerseyNumber: number
  teamId: string
  position: 'GK' | 'DEF' | 'MID' | 'FWD'
  form: number[]
  totalPoints: number
  averagePoints: number
  isAvailable: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

---

### 4. **lineups** Collection
Stores user lineups for matches.

**Document ID:** Auto-generated

**Fields:**
```typescript
{
  userId: string
  matchId: string
  entries: Array<{
    playerId: string
    position: 'GK' | 'DEF' | 'MID' | 'FWD'
    isCaptain: boolean
    isBench: boolean
    multiplier: number
    pointsEarned: number
  }>
  formation: string
  captainPlayerId: string
  totalPoints: number
  livePoints: number
  rank: number
  status: 'draft' | 'submitted' | 'locked' | 'live' | 'completed'
  powerUpsUsed: string[]
  submittedAt?: Timestamp
  lockedAt?: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Indexes:**
- `matchId` + `status` + `totalPoints` (DESC)
- `userId` + `matchId` + `createdAt` (DESC)

---

### 5. **leagues** Collection
Stores league information.

**Document ID:** Auto-generated

**Fields:**
```typescript
{
  name: string
  description: string
  type: 'standard' | 'head-to-head'
  scope: 'single-match' | 'weekly' | 'monthly' | 'season'
  privacy: 'public' | 'private' | 'invite-only'
  inviteCode: string
  creatorId: string
  adminIds: string[]
  memberCount: number
  maxMembers?: number
  prizePool?: number
  rules: object
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

---

### 6. **leagueMemberships** Collection
Stores league membership data.

**Document ID:** Auto-generated

**Fields:**
```typescript
{
  leagueId: string
  userId: string
  status: 'active' | 'invited' | 'left'
  totalPoints: number
  rank: number
  matchesPlayed: number
  joinedAt: Timestamp
  updatedAt: Timestamp
}
```

**Indexes:**
- `leagueId` + `status` + `totalPoints` (DESC)

---

### 7. **creditTransactions** Collection
Tracks all credit transactions.

**Document ID:** Auto-generated

**Fields:**
```typescript
{
  userId: string
  type: 'earn' | 'spend' | 'purchase'
  amount: number
  balanceAfter: number
  source: string
  metadata: object
  createdAt: Timestamp
}
```

**Indexes:**
- `userId` + `createdAt` (DESC)

---

### 8. **achievements** Collection
Defines available achievements.

**Document ID:** Auto-generated

**Fields:**
```typescript
{
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  icon: string
  category: string
  criteria: object
  points: number
  creditReward: number
  isActive: boolean
  createdAt: Timestamp
}
```

---

### 9. **userAchievements** Collection
Tracks user achievement progress.

**Document ID:** Auto-generated

**Fields:**
```typescript
{
  userId: string
  achievementId: string
  progress: number
  isUnlocked: boolean
  unlockedAt?: Timestamp
  createdAt: Timestamp
}
```

---

### 10. **notifications** Collection
Stores user notifications.

**Document ID:** Auto-generated

**Fields:**
```typescript
{
  userId: string
  type: string
  title: string
  message: string
  data: object
  isRead: boolean
  readAt?: Timestamp
  createdAt: Timestamp
}
```

**Indexes:**
- `userId` + `isRead` + `createdAt` (DESC)

---

## Security Rules Summary

- **Public Read**: `matches`, `players`, `achievements`
- **Authenticated Read**: All user-specific collections
- **Owner Write**: `users` (limited), `lineups` (draft only), `leagueMemberships`
- **Server-Only Write**: `creditTransactions`, `userAchievements`, `notifications`
- **Admin Write**: `matches`, `players`, `achievements`

---

## Example Queries

### Get user's lineup for a match:
```typescript
const lineupQuery = query(
  collection(db, 'lineups'),
  where('userId', '==', userId),
  where('matchId', '==', matchId),
  orderBy('createdAt', 'desc'),
  limit(1)
);
```

### Get match leaderboard:
```typescript
const leaderboardQuery = query(
  collection(db, 'lineups'),
  where('matchId', '==', matchId),
  where('status', 'in', ['submitted', 'locked', 'completed']),
  orderBy('totalPoints', 'desc'),
  limit(100)
);
```

### Get user's credit history:
```typescript
const creditsQuery = query(
  collection(db, 'creditTransactions'),
  where('userId', '==', userId),
  orderBy('createdAt', 'desc'),
  limit(50)
);
```
