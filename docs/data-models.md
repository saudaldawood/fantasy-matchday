# Fantasy Matchday - Data Models

This document defines the TypeScript interfaces for all data entities in the Fantasy Matchday platform. These models represent the structure of data stored in the database (Firestore or PostgreSQL).

---

## User & Authentication

### UserProfile

Represents a registered user's profile and account information.

```typescript
interface UserProfile {
  // Identity
  id: string; // Unique user identifier (Firebase UID or UUID)
  email: string;
  displayName: string;
  avatarUrl?: string; // URL to user's profile picture
  
  // Preferences
  language: 'en' | 'ar'; // User's preferred language
  favoriteTeam?: string; // Team ID of user's favorite team
  notificationSettings: NotificationSettings;
  
  // Statistics
  totalPoints: number; // Cumulative points across all matches
  matchesPlayed: number; // Total number of matches participated in
  averagePointsPerMatch: number; // Calculated average
  bestMatchScore: number; // Highest points in a single match
  worstMatchScore: number; // Lowest points in a single match
  
  // Credits & Monetization
  credits: number; // Current credit balance
  isPremium: boolean; // Premium subscription status
  premiumExpiresAt?: Date; // Premium expiration date
  
  // Gamification
  level: number; // User level (based on XP or matches played)
  achievements: string[]; // Array of achievement IDs unlocked
  badges: string[]; // Array of badge IDs earned
  loginStreak: number; // Consecutive days logged in
  lastLoginDate: Date;
  
  // Social
  friends: string[]; // Array of friend user IDs
  leagues: string[]; // Array of league IDs user is member of
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
  isActive: boolean; // Account status
  isBanned: boolean;
  banReason?: string;
}

interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  matchReminders: boolean; // Lineup deadline reminders
  matchResults: boolean; // Post-match performance notifications
  rankChanges: boolean; // Leaderboard position changes
  achievements: boolean; // Achievement unlock notifications
  leagueUpdates: boolean; // League invitations and updates
  marketing: boolean; // Promotional messages
}
```

---

## Match & Player Data

### Match

Represents a single football match in the Saudi Pro League.

```typescript
interface Match {
  // Identity
  id: string; // Unique match identifier
  externalApiId?: string; // ID from sports API (API-FOOTBALL)
  
  // Match Details
  homeTeam: Team;
  awayTeam: Team;
  venue: string; // Stadium name
  matchDate: Date; // Scheduled kickoff time
  round: number; // Matchday/round number
  season: string; // e.g., "2024-2025"
  
  // Status
  status: MatchStatus;
  currentMinute?: number; // Current match minute (for live matches)
  
  // Scores
  homeScore: number;
  awayScore: number;
  
  // Fantasy Metadata
  lineupDeadline: Date; // When lineups lock (usually kickoff time)
  totalParticipants: number; // Number of users who created lineups
  isActive: boolean; // Available for fantasy participation
  
  // API Sync
  lastApiSync: Date; // Last time data was fetched from API
  apiSyncStatus: 'pending' | 'syncing' | 'completed' | 'error';
  
  // Admin Overrides
  manualOverride: boolean; // If admin manually adjusted data
  overrideReason?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

type MatchStatus = 
  | 'scheduled'   // Match not yet started
  | 'live'        // Match in progress
  | 'halftime'    // Halftime break
  | 'completed'   // Match finished
  | 'postponed'   // Match postponed
  | 'cancelled';  // Match cancelled

interface Team {
  id: string;
  name: string;
  nameAr: string; // Arabic name
  logo: string; // URL to team logo
  shortName: string; // e.g., "ALH" for Al-Hilal
}
```

### Player

Represents a real-world football player.

```typescript
interface Player {
  // Identity
  id: string; // Unique player identifier
  externalApiId?: string; // ID from sports API
  
  // Basic Info
  name: string;
  nameAr: string; // Arabic name
  photo?: string; // URL to player photo
  jerseyNumber: number;
  
  // Team & Position
  teamId: string; // Current team ID
  position: PlayerPosition;
  
  // Fantasy Stats
  fantasyPrice?: number; // If using budget system (optional for MVP)
  selectedByPercent: number; // % of users who selected this player
  
  // Performance Stats (updated after each match)
  totalPoints: number; // Season total fantasy points
  averagePoints: number; // Average points per match
  form: number[]; // Last 5 match points [12, 8, 15, 6, 10]
  
  // Real-World Stats (current season)
  matchesPlayed: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  yellowCards: number;
  redCards: number;
  
  // Availability
  isAvailable: boolean; // Available for selection
  injuryStatus?: 'healthy' | 'doubtful' | 'injured' | 'suspended';
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

type PlayerPosition = 'GK' | 'DEF' | 'MID' | 'FWD';
```

### PlayerMatchPerformance

Represents a player's performance in a specific match (used for points calculation).

```typescript
interface PlayerMatchPerformance {
  // Identity
  id: string;
  playerId: string;
  matchId: string;
  
  // Match Participation
  started: boolean; // Started in lineup
  minutesPlayed: number;
  
  // Performance Stats
  goals: number;
  assists: number;
  cleanSheet: boolean; // For GK/DEF (team didn't concede)
  penaltySaves: number; // For GK
  saves: number; // For GK
  yellowCards: number;
  redCards: number;
  
  // Bonus Stats
  manOfTheMatch: boolean;
  hatTrick: boolean; // 3+ goals
  
  // Fantasy Points
  pointsBreakdown: PointsBreakdown; // Detailed points calculation
  totalPoints: number; // Final fantasy points for this match
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

interface PointsBreakdown {
  goalsPoints: number;
  assistsPoints: number;
  cleanSheetPoints: number;
  penaltySavePoints: number;
  savesPoints: number;
  minutesPlayedPoints: number;
  manOfTheMatchPoints: number;
  hatTrickPoints: number;
  yellowCardPoints: number; // Negative
  redCardPoints: number; // Negative
  total: number;
}
```

---

## Lineup & Gameplay

### Lineup

Represents a user's fantasy lineup for a specific match.

```typescript
interface Lineup {
  // Identity
  id: string;
  userId: string;
  matchId: string;
  
  // Lineup Composition
  entries: LineupEntry[]; // Array of selected players
  formation: string; // e.g., "4-4-2", "3-5-2"
  captainPlayerId: string; // Player ID receiving 2x points
  
  // Power-Ups Applied
  powerUps: AppliedPowerUp[];
  
  // Points & Ranking
  totalPoints: number; // Total points earned (calculated after match)
  livePoints: number; // Current points during live match
  rank: number; // User's rank for this match (global)
  
  // Status
  status: LineupStatus;
  submittedAt: Date; // When user submitted lineup
  lockedAt: Date; // When lineup was locked (deadline)
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

interface LineupEntry {
  playerId: string;
  position: PlayerPosition;
  isCaptain: boolean; // 2x points multiplier
  isBench: boolean; // Bench player (doesn't score unless Bench Boost used)
  multiplier: number; // Points multiplier (default 1, captain 2, triple captain 3)
  pointsEarned: number; // Points earned by this player in this match
}

interface AppliedPowerUp {
  powerUpId: string; // Reference to PowerUp definition
  appliedToPlayerId?: string; // If power-up targets specific player
  cost: number; // Credits spent
  appliedAt: Date;
}

type LineupStatus = 
  | 'draft'       // User is building lineup
  | 'submitted'   // User submitted, waiting for deadline
  | 'locked'      // Deadline passed, lineup locked
  | 'live'        // Match in progress, points updating
  | 'completed';  // Match finished, final points calculated
```

---

## Leagues & Competition

### League

Represents a fantasy league (public or private).

```typescript
interface League {
  // Identity
  id: string;
  name: string;
  description?: string;
  
  // League Settings
  type: LeagueType;
  privacy: 'public' | 'private' | 'invite-only';
  inviteCode?: string; // Unique code for joining (for private leagues)
  
  // Scope
  scope: LeagueScope;
  startDate: Date; // When league starts
  endDate?: Date; // When league ends (null for ongoing)
  matchIds: string[]; // Specific matches included (if scope is 'custom')
  
  // Admin
  creatorId: string; // User ID of league creator
  adminIds: string[]; // User IDs with admin privileges
  
  // Membership
  memberCount: number;
  maxMembers?: number; // Maximum allowed members (null for unlimited)
  
  // Scoring
  scoringMultiplier: number; // Custom multiplier for league (default 1.0)
  
  // Rewards
  prizePool?: number; // Credits awarded to winners
  prizeDistribution?: PrizeDistribution;
  
  // Social
  chatEnabled: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

type LeagueType = 
  | 'standard'      // Cumulative points over time
  | 'head-to-head'  // 1v1 matchups each week
  | 'weekly'        // Resets each week
  | 'monthly';      // Resets each month

type LeagueScope = 
  | 'single-match'  // One match only
  | 'weekly'        // Single matchday/round
  | 'monthly'       // 4-5 matchdays
  | 'season'        // Entire season
  | 'custom';       // Admin-defined match selection

interface PrizeDistribution {
  firstPlace: number; // Credits
  secondPlace: number;
  thirdPlace: number;
  topTen?: number; // Credits for top 10 finishers
}
```

### LeagueMembership

Represents a user's membership in a league.

```typescript
interface LeagueMembership {
  // Identity
  id: string;
  leagueId: string;
  userId: string;
  
  // Status
  status: 'active' | 'left' | 'removed';
  isAdmin: boolean;
  
  // Performance
  totalPoints: number; // Total points in this league
  rank: number; // Current rank in league
  matchesPlayed: number; // Matches played in this league
  
  // Metadata
  joinedAt: Date;
  leftAt?: Date;
  updatedAt: Date;
}
```

---

## Credits & Monetization

### CreditTransaction

Represents a credit earning or spending event.

```typescript
interface CreditTransaction {
  // Identity
  id: string;
  userId: string;
  
  // Transaction Details
  type: TransactionType;
  amount: number; // Positive for earning, negative for spending
  balanceBefore: number;
  balanceAfter: number;
  
  // Context
  reason: string; // Human-readable description
  relatedEntityType?: 'match' | 'league' | 'achievement' | 'power-up' | 'purchase';
  relatedEntityId?: string; // ID of related entity
  
  // Payment (for purchases)
  paymentMethod?: 'stripe' | 'paypal' | 'apple-pay' | 'google-pay';
  paymentId?: string; // External payment gateway transaction ID
  amountUSD?: number; // Amount in USD (if purchased)
  
  // Metadata
  createdAt: Date;
}

type TransactionType = 
  | 'earned_daily_login'
  | 'earned_match_participation'
  | 'earned_weekly_ranking'
  | 'earned_achievement'
  | 'earned_league_win'
  | 'earned_referral'
  | 'spent_power_up'
  | 'spent_lineup_change'
  | 'spent_profile_customization'
  | 'spent_premium_league'
  | 'purchased'
  | 'refunded'
  | 'admin_adjustment';
```

### PowerUp

Defines a power-up that users can purchase with credits.

```typescript
interface PowerUp {
  // Identity
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  
  // Pricing
  cost: number; // Credits required
  
  // Effect
  effect: PowerUpEffect;
  
  // Restrictions
  usageLimit?: UsageLimit; // How often can be used
  expiresAfter?: number; // Hours until power-up expires (if not used)
  
  // Availability
  isActive: boolean; // Available for purchase
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

type PowerUpEffect = 
  | { type: 'captain_boost'; multiplier: 2 }           // 2x points for captain
  | { type: 'triple_captain'; multiplier: 3 }          // 3x points for captain
  | { type: 'bench_boost'; applyToBench: true }        // Bench players score
  | { type: 'wild_card'; unlimitedTransfers: true }    // Unlimited lineup changes
  | { type: 'free_hit'; oneMatchUnlimited: true };     // One-match unlimited changes

interface UsageLimit {
  period: 'match' | 'week' | 'month' | 'season';
  maxUses: number;
}
```

---

## Achievements & Gamification

### Achievement

Defines an unlockable achievement.

```typescript
interface Achievement {
  // Identity
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  
  // Visual
  icon: string; // URL to achievement icon
  badge?: string; // URL to badge image
  
  // Unlock Criteria
  criteria: AchievementCriteria;
  
  // Rewards
  creditReward: number; // Credits awarded upon unlock
  xpReward?: number; // Experience points (if using XP system)
  
  // Rarity
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  
  // Stats
  unlockedByCount: number; // How many users unlocked this
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

type AchievementCriteria = 
  | { type: 'matches_played'; count: number }
  | { type: 'total_points'; points: number }
  | { type: 'top_rank'; rank: number; scope: 'global' | 'league' }
  | { type: 'winning_streak'; wins: number }
  | { type: 'perfect_lineup'; allPlayersScored: true }
  | { type: 'login_streak'; days: number }
  | { type: 'league_wins'; count: number }
  | { type: 'referrals'; count: number };
```

### UserAchievement

Tracks when a user unlocks an achievement.

```typescript
interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: Date;
  progress?: number; // For progressive achievements (e.g., 7/10 matches played)
}
```

---

## Notifications

### Notification

Represents a notification sent to a user.

```typescript
interface Notification {
  // Identity
  id: string;
  userId: string; // Recipient user ID (null for broadcast)
  
  // Content
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  
  // Type & Priority
  type: NotificationType;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  // Delivery
  channels: NotificationChannel[]; // Where to send
  scheduledFor?: Date; // Scheduled send time (null for immediate)
  sentAt?: Date;
  
  // Interaction
  isRead: boolean;
  readAt?: Date;
  clickedAt?: Date;
  
  // Action
  actionUrl?: string; // Deep link or URL to navigate to
  actionLabel?: string; // Button text (e.g., "View Lineup")
  
  // Context
  relatedEntityType?: 'match' | 'league' | 'achievement' | 'lineup';
  relatedEntityId?: string;
  
  // Metadata
  createdAt: Date;
  expiresAt?: Date; // When notification should be removed
}

type NotificationType = 
  | 'match_reminder'
  | 'lineup_deadline'
  | 'match_started'
  | 'match_completed'
  | 'rank_change'
  | 'achievement_unlocked'
  | 'league_invitation'
  | 'league_update'
  | 'friend_request'
  | 'credit_earned'
  | 'admin_announcement'
  | 'system_update';

type NotificationChannel = 'push' | 'in-app' | 'email' | 'sms';
```

---

## Admin & Management

### AdminUser

Represents an admin user with elevated privileges.

```typescript
interface AdminUser {
  // Identity
  id: string;
  email: string;
  displayName: string;
  
  // Role & Permissions
  role: AdminRole;
  permissions: AdminPermission[];
  
  // Security
  twoFactorEnabled: boolean;
  lastLoginAt: Date;
  lastLoginIp?: string;
  
  // Status
  isActive: boolean;
  
  // Metadata
  createdAt: Date;
  createdBy: string; // Admin ID who created this admin
  updatedAt: Date;
}

type AdminRole = 
  | 'super_admin'    // Full control
  | 'match_admin'    // Match and player data management
  | 'user_admin'     // User account management
  | 'content_admin'; // Notifications and content

type AdminPermission = 
  // User Management
  | 'users.view'
  | 'users.edit'
  | 'users.ban'
  | 'users.delete'
  // Match Management
  | 'matches.view'
  | 'matches.edit'
  | 'matches.create'
  | 'matches.delete'
  | 'matches.adjust_points'
  // Content Management
  | 'notifications.send'
  | 'achievements.manage'
  | 'content.edit'
  // Admin Management
  | 'admins.view'
  | 'admins.create'
  | 'admins.edit'
  | 'admins.delete'
  // Analytics
  | 'analytics.view'
  | 'analytics.export'
  // Financial
  | 'financial.view'
  | 'financial.refund';
```

### AdminActivityLog

Tracks all admin actions for audit purposes.

```typescript
interface AdminActivityLog {
  // Identity
  id: string;
  adminId: string;
  
  // Action Details
  action: string; // e.g., "updated_match_score", "banned_user"
  entityType: string; // e.g., "match", "user", "notification"
  entityId: string; // ID of affected entity
  
  // Changes
  changesBefore?: Record<string, any>; // State before change
  changesAfter?: Record<string, any>; // State after change
  reason?: string; // Admin's reason for action
  
  // Context
  ipAddress?: string;
  userAgent?: string;
  
  // Metadata
  createdAt: Date;
}
```

---

## Analytics & Reporting

### AnalyticsSnapshot

Stores periodic snapshots of key metrics for analytics dashboard.

```typescript
interface AnalyticsSnapshot {
  // Identity
  id: string;
  timestamp: Date;
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';
  
  // User Metrics
  totalUsers: number;
  activeUsers: number; // Active in this period
  newUsers: number; // Registered in this period
  
  // Engagement Metrics
  totalMatches: number;
  totalLineups: number;
  averageLineupsPerMatch: number;
  
  // League Metrics
  totalLeagues: number;
  activeLeagues: number;
  averageMembersPerLeague: number;
  
  // Financial Metrics
  creditsEarned: number; // Total credits earned by users
  creditsSpent: number; // Total credits spent
  creditsPurchased: number; // Credits purchased with money
  revenue: number; // Revenue in USD
  
  // Top Performers
  topUsers: Array<{ userId: string; points: number }>; // Top 10 users
  topPlayers: Array<{ playerId: string; selections: number }>; // Most selected
  
  // System Health
  apiResponseTime: number; // Average API response time (ms)
  errorRate: number; // Percentage of errors
  uptime: number; // Percentage uptime
  
  // Metadata
  createdAt: Date;
}
```

---

## Enums & Constants

### Common Enums

```typescript
// Match statuses
enum MatchStatus {
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  HALFTIME = 'halftime',
  COMPLETED = 'completed',
  POSTPONED = 'postponed',
  CANCELLED = 'cancelled'
}

// Player positions
enum PlayerPosition {
  GOALKEEPER = 'GK',
  DEFENDER = 'DEF',
  MIDFIELDER = 'MID',
  FORWARD = 'FWD'
}

// Languages
enum Language {
  ENGLISH = 'en',
  ARABIC = 'ar'
}

// Admin roles
enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  MATCH_ADMIN = 'match_admin',
  USER_ADMIN = 'user_admin',
  CONTENT_ADMIN = 'content_admin'
}
```

---

## Relationships Summary

```
UserProfile
  ├── has many → Lineup
  ├── has many → LeagueMembership
  ├── has many → CreditTransaction
  ├── has many → UserAchievement
  ├── has many → Notification
  └── has many → friends (UserProfile)

Match
  ├── has many → Lineup
  ├── has many → PlayerMatchPerformance
  └── belongs to → Team (home & away)

Player
  ├── belongs to → Team
  ├── has many → PlayerMatchPerformance
  └── has many → LineupEntry

Lineup
  ├── belongs to → UserProfile
  ├── belongs to → Match
  └── has many → LineupEntry

League
  ├── has many → LeagueMembership
  └── belongs to → UserProfile (creator)

LeagueMembership
  ├── belongs to → League
  └── belongs to → UserProfile

Achievement
  └── has many → UserAchievement

AdminUser
  └── has many → AdminActivityLog
```

---

*These data models form the foundation of the Fantasy Matchday database schema. All fields and relationships are based on the requirements outlined in the product specification.*

