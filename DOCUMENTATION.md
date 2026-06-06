# Fantasy Matchday — Full Project Documentation

> A real-time fantasy football web application for the Saudi Pro League (SPL), where users build lineups, compete in leagues, earn credits, and climb leaderboards.

**Project Type:** University Final Year Project
**Platform:** Web Application (Responsive)
**Live URL:** Deployed via Firebase App Hosting

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Project Structure](#4-project-structure)
5. [Database Design (Firestore)](#5-database-design-firestore)
6. [Authentication System](#6-authentication-system)
7. [Core Features](#7-core-features)
8. [API Integration (API-Football)](#8-api-integration-api-football)
9. [Cloud Functions (Backend)](#9-cloud-functions-backend)
10. [Payment System (Stripe)](#10-payment-system-stripe)
11. [Internationalization (i18n)](#11-internationalization-i18n)
12. [Routing & Navigation](#12-routing--navigation)
13. [State Management](#13-state-management)
14. [UI/UX Design](#14-uiux-design)
15. [Security Considerations](#15-security-considerations)
16. [Deployment & Hosting](#16-deployment--hosting)
17. [Setup & Installation](#17-setup--installation)
18. [Environment Variables](#18-environment-variables)
19. [Known Limitations & Future Work](#19-known-limitations--future-work)

---

## 1. Project Overview

### 1.1 Problem Statement

Fantasy football platforms like FPL (Fantasy Premier League) are hugely popular worldwide, but there is no dedicated, localized fantasy platform for the **Saudi Pro League (SPL)**. With the rapid growth of Saudi football (signing of global stars like Ronaldo, Neymar, Benzema), there is a clear demand for an SPL-specific fantasy experience.

### 1.2 Objectives

- Build a **real-time fantasy football platform** focused on the Saudi Pro League.
- Allow users to **select players, build lineups, and compete** against friends and the global community.
- Provide **live match tracking** with real-time score updates.
- Implement a **credits and power-ups economy** for enhanced gameplay.
- Support **Arabic and English** languages for the Saudi audience.
- Integrate **real payment processing** via Stripe for purchasing credits.
- Deploy as a **production-ready web application** accessible on all devices.

### 1.3 Target Audience

- Saudi Pro League football fans
- Fantasy football enthusiasts in the MENA region
- University students and young adults interested in competitive gaming

---

## 2. Technology Stack

### 2.1 Frontend

| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 14.2 | React framework with SSR, routing, and API routes |
| **React** | 18.3 | UI component library |
| **TypeScript** | 5.x | Type-safe JavaScript |
| **CSS Modules** | — | Scoped, component-level styling |
| **next-intl** | 4.5 | Internationalization (English + Arabic) |
| **Framer Motion** | 12.x | Animations and transitions |
| **Lucide React** | 0.554 | Icon library |
| **React Hot Toast** | 2.6 | Toast notifications |
| **TanStack React Query** | 5.90 | Server state management and caching |
| **clsx** | 2.1 | Conditional CSS class utility |

### 2.2 Backend / Services

| Technology | Purpose |
|---|---|
| **Firebase Authentication** | User registration, login (email + Google) |
| **Cloud Firestore** | NoSQL database for all app data |
| **Firebase Cloud Functions** | Serverless backend logic (points, payments, notifications) |
| **Firebase App Hosting** | Production deployment and hosting |

### 2.3 External APIs

| Service | Purpose |
|---|---|
| **API-Football (v3)** | Live match data, fixtures, player stats, team squads |
| **Stripe** | Credit card payment processing |

### 2.4 Development Tools

| Tool | Purpose |
|---|---|
| **ESLint** | Code linting |
| **Git / GitHub** | Version control |
| **VS Code** | IDE |

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│                                                                 │
│  Next.js 14 App (React 18 + TypeScript)                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │  Pages   │ │Components│ │  Hooks   │ │ Services │          │
│  │ (Routes) │ │ (UI/Feat)│ │(useAuth) │ │(API calls)│         │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘          │
│       │             │            │             │                │
│       └─────────────┴────────────┴─────────────┘                │
│                           │                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
   ┌──────────────┐ ┌─────────────┐ ┌──────────┐
   │   Firebase   │ │ API-Football│ │  Stripe  │
   │              │ │   (v3 API)  │ │ Payments │
   │ • Auth       │ │             │ │          │
   │ • Firestore  │ │ • Fixtures  │ │ • Intents│
   │ • Functions  │ │ • Players   │ │ • Confirm│
   │ • Hosting    │ │ • Live Data │ │ • Webhook│
   └──────────────┘ └─────────────┘ └──────────┘
```

### 3.1 Data Flow

1. **User opens app** → Next.js serves the page (SSR or CSR depending on route).
2. **Authentication** → Firebase Auth handles login/register. Auth state is provided globally via `AuthProvider`.
3. **Match data** → Fetched from API-Football, cached for 30 minutes to avoid rate limits.
4. **User actions** (save lineup, join league, etc.) → Written to Cloud Firestore via service functions.
5. **Background processing** → Cloud Functions handle points calculation, lineup locking, leaderboard updates, and payment webhooks.
6. **Payments** → Stripe creates a PaymentIntent, frontend confirms with card details, webhook updates Firestore credits.

---

## 4. Project Structure

```
fantasy-matchday/
├── functions/                    # Firebase Cloud Functions (backend)
│   └── src/
│       ├── index.ts              # Main entry — exports all functions
│       ├── calculatePoints.ts    # Live & final points calculation
│       ├── lockLineups.ts        # Auto-lock lineups at match kickoff
│       ├── syncMatches.ts        # Sync match data from API-Football
│       ├── updateLeaderboards.ts # Recalculate global & league rankings
│       ├── credits.ts            # Daily rewards, power-up purchases
│       ├── stripe.ts             # Payment intents & webhook handler
│       ├── notifications.ts      # Match reminders & deadline alerts
│       ├── broadcast.ts          # Admin broadcast notifications
│       ├── referrals.ts          # Referral code system
│       ├── emails.ts             # Email notifications (SendGrid)
│       └── admin.ts              # Admin role management
│
├── messages/                     # i18n translation files
│   ├── en.json                   # English translations
│   └── ar.json                   # Arabic translations
│
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   └── [locale]/             # Locale-based routing (en/ar)
│   │       ├── page.tsx          # Homepage
│   │       ├── layout.tsx        # Root layout (Navbar, Footer, Providers)
│   │       ├── (auth)/
│   │       │   ├── login/        # Login page
│   │       │   └── register/     # Registration page
│   │       ├── matches/
│   │       │   ├── page.tsx      # Match listing (upcoming + live)
│   │       │   └── [matchId]/    # Individual match detail (live view)
│   │       ├── lineup/           # Lineup builder & My Matches
│   │       ├── leaderboard/      # Global leaderboard
│   │       ├── leagues/
│   │       │   ├── page.tsx      # Leagues listing (my + discover)
│   │       │   └── [leagueId]/   # League detail & leaderboard
│   │       ├── credits/          # Credits store & power-ups
│   │       ├── friends/          # Friends system
│   │       ├── achievements/     # Badges & achievements
│   │       ├── profile/          # User profile
│   │       ├── players/          # Player database
│   │       ├── prizes/           # Prize information
│   │       ├── transactions/     # Transaction history
│   │       ├── admin/
│   │       │   ├── page.tsx      # Admin dashboard
│   │       │   ├── analytics/    # Admin analytics
│   │       │   ├── broadcast/    # Admin broadcast tool
│   │       │   ├── matches/      # Admin match management
│   │       │   └── users/        # Admin user management
│   │       ├── help/             # Help & FAQ
│   │       ├── contact/          # Contact page
│   │       ├── privacy/          # Privacy policy
│   │       ├── terms/            # Terms of service
│   │       └── reset-password/   # Password reset
│   │
│   ├── components/
│   │   ├── features/             # Feature-specific components
│   │   │   ├── Hero/             # Homepage hero section
│   │   │   ├── ReadyToWin/       # CTA section
│   │   │   ├── MatchCard/        # Match display card
│   │   │   ├── LeaderboardTable/ # Leaderboard table component
│   │   │   ├── PaymentModal/     # Stripe payment modal
│   │   │   ├── LevelDisplay/     # XP & level progress bar
│   │   │   ├── ProfileDashboard/ # User profile dashboard
│   │   │   ├── NotificationCenter/ # In-app notifications
│   │   │   ├── DraggableLineup/  # Drag-and-drop lineup builder
│   │   │   ├── AmazingPrizes/    # Prize showcase
│   │   │   ├── GameChanger/      # Feature highlight
│   │   │   ├── FeatureCard/      # Feature card component
│   │   │   └── WhyChoose/        # "Why choose us" section
│   │   │
│   │   └── ui/                   # Reusable UI components
│   │       ├── Navbar/           # Navigation bar
│   │       ├── Footer/           # Page footer
│   │       ├── Button/           # Button component
│   │       ├── Card/             # Card component
│   │       ├── Input/            # Input component
│   │       ├── LanguageSwitcher/ # EN/AR language toggle
│   │       └── LoadingSkeleton/  # Loading placeholder
│   │
│   ├── hooks/
│   │   ├── useAuth.tsx           # Authentication hook & AuthProvider
│   │   └── useQueries.ts        # React Query hooks for data fetching
│   │
│   ├── services/                 # Business logic & API calls
│   │   ├── api-football.ts       # API-Football integration
│   │   ├── auth.ts               # Firebase Auth operations
│   │   ├── lineups.ts            # Lineup CRUD operations
│   │   ├── players.ts            # Player data fetching
│   │   ├── leagues.ts            # League management
│   │   ├── leaderboard.ts        # Leaderboard queries
│   │   ├── credits.ts            # Credits & power-ups
│   │   ├── friends.ts            # Friends system
│   │   ├── achievements.ts       # Achievements & badges
│   │   ├── levels.ts             # XP & leveling system
│   │   ├── notifications.ts      # Notification management
│   │   ├── push-notifications.ts # Push notification setup
│   │   ├── profile-stats.ts      # Profile statistics
│   │   └── admin.ts              # Admin operations
│   │
│   ├── lib/
│   │   ├── firebase.ts           # Firebase app initialization
│   │   ├── firebase/             # Firebase config
│   │   └── stripe.ts             # Stripe client initialization
│   │
│   ├── types/
│   │   ├── app.ts                # Core app types (Match, Player, Lineup, etc.)
│   │   └── api-football.ts       # API-Football response types
│   │
│   ├── utils/
│   │   ├── lineup-validation.ts  # Lineup validation rules
│   │   └── api-transform.ts      # API data transformation utilities
│   │
│   ├── providers/                # React context providers
│   ├── data/                     # Static data files
│   ├── images/                   # Static images
│   ├── i18n.ts                   # i18n configuration
│   ├── navigation.ts             # next-intl navigation setup
│   └── middleware.ts             # Next.js middleware (locale routing)
│
├── apphosting.yaml               # Firebase App Hosting config
├── firestore.indexes.json        # Firestore composite index definitions
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
├── CHANGELOG.md                  # Detailed commit history
└── DOCUMENTATION.md              # This file
```

---

## 5. Database Design (Firestore)

Cloud Firestore is used as the primary database. It is a NoSQL document database organized into collections.

### 5.1 Collections Overview

| Collection | Purpose | Key Fields |
|---|---|---|
| `users` | User profiles | `uid`, `displayName`, `email`, `avatarUrl`, `credits`, `level`, `xp`, `createdAt` |
| `lineups` | User lineups per match | `userId`, `matchId`, `entries[]`, `captainPlayerId`, `status`, `totalPoints`, `formation` |
| `leagues` | User-created leagues | `name`, `type`, `inviteCode`, `creatorId`, `memberCount`, `maxMembers`, `scope` |
| `leagueMemberships` | League member records | `leagueId`, `userId`, `displayName`, `totalPoints`, `leagueRank` |
| `leaderboard` | Global rankings | `userId`, `displayName`, `totalPoints`, `globalRank`, `weeklyPoints` |
| `achievements` | User achievement progress | `userId`, `achievementId`, `progress`, `isCompleted`, `claimedReward` |
| `friendRequests` | Pending friend requests | `senderId`, `receiverId`, `status`, `senderName` |
| `friendships` | Confirmed friendships | `user1Id`, `user2Id`, `createdAt` |
| `notifications` | User notifications | `userId`, `type`, `title`, `message`, `read`, `createdAt` |
| `transactions` | Credit transactions | `userId`, `type`, `amount`, `description`, `createdAt` |
| `broadcasts` | Admin broadcast messages | `title`, `message`, `sentBy`, `status`, `scheduledAt` |

### 5.2 Lineup Document Structure

```typescript
interface Lineup {
    id: string;
    userId: string;
    matchId: string;              // API-Football fixture ID
    formation: string;            // e.g., "4-4-2"
    entries: LineupEntry[];       // Array of selected players
    captainPlayerId: string;
    status: 'draft' | 'submitted' | 'locked' | 'completed';
    totalPoints: number;
    activePowerUp?: string;       // e.g., "triple_captain"
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

interface LineupEntry {
    playerId: string;
    playerName: string;
    position: 'GK' | 'DEF' | 'MID' | 'FWD';
    isBench: boolean;
    isCaptain: boolean;
    multiplier: number;           // 1x normal, 2x captain, 3x triple captain
    pointsEarned: number;
}
```

### 5.3 Lineup Status Flow

```
draft → submitted → locked → completed
  │                    ▲
  │                    │ (auto-lock at kickoff)
  └────────────────────┘
```

- **draft**: User is still building the lineup, can edit freely.
- **submitted**: User has finalized the lineup, can still edit before match starts.
- **locked**: Match has started, lineup is frozen (done by Cloud Function).
- **completed**: Match is over, points have been calculated.

---

## 6. Authentication System

### 6.1 Methods Supported

1. **Email/Password Registration** — Standard sign-up with display name.
2. **Google Sign-In** — One-click OAuth via Google (popup or redirect).
3. **Password Reset** — Email-based password recovery.

### 6.2 Implementation

- **Firebase Authentication** handles all auth operations.
- `src/services/auth.ts` provides functions: `registerWithEmail()`, `loginWithEmail()`, `signInWithGoogle()`, `signOut()`, `resetPassword()`.
- `src/hooks/useAuth.tsx` provides the `AuthProvider` context and `useAuth()` hook, which exposes `{ user, profile, loading, error }` to all components.
- On registration, a Firestore document is created in the `users` collection with initial profile data (100 starting credits, level 1, 0 XP).

### 6.3 Auth State Flow

```
App loads → Firebase onAuthStateChanged listener
  ├── User exists → Fetch Firestore profile → Show authenticated UI
  └── No user → Show login/register buttons
```

### 6.4 Protected Routes

The Navbar conditionally renders navigation links and user menu based on auth state. Pages like `/lineup`, `/credits`, `/friends`, and `/leagues` check for `user` before allowing interactions.

---

## 7. Core Features

### 7.1 Match Browsing

**Page:** `/matches`
**Service:** `src/services/api-football.ts`

- Displays **upcoming matches** (next 30 days) and **live matches** from the Saudi Pro League.
- Each match card shows: team logos, team names, match date/time, venue, and status.
- Users can click a match to either view live details or build a lineup.
- Data is fetched from API-Football and cached for 30 minutes.

### 7.2 Live Match View

**Page:** `/matches/[matchId]`

- Real-time match tracking with live scores.
- Events timeline (goals, cards, substitutions).
- Team lineups display.
- Match statistics (possession, shots, corners, etc.).

### 7.3 Lineup Builder

**Page:** `/lineup`
**Services:** `src/services/lineups.ts`, `src/services/players.ts`

This is the core gameplay feature:

1. **Match Selection** — User selects an upcoming match from the list.
2. **Player Selection** — User picks 3 players from both teams' squads.
3. **Captain Assignment** — One player is designated as captain (earns 2x points).
4. **Power-Up Activation** — Optional: activate a power-up (costs credits).
5. **Save Draft** — Save progress without submitting.
6. **Submit Lineup** — Finalize the lineup for the match.

**Player data sources:**
- For live/completed matches: fetched from fixture lineup data.
- For upcoming matches: fetched from team squad data.

**Validation rules** (`src/utils/lineup-validation.ts`):
- Exactly 3 players must be selected.
- Exactly 1 captain must be assigned.
- Captain must be one of the selected players.
- No duplicate players.

### 7.4 My Matches

**Page:** `/lineup` (top section)

- Shows all matches where the user has a lineup (draft, submitted, locked, or completed).
- Displays team names, status badge, points earned, and player list.
- Draft lineups show "Edit Lineup" button; submitted lineups show "View Lineup".

### 7.5 Leaderboard

**Page:** `/leaderboard`
**Service:** `src/services/leaderboard.ts`

- Global ranking of all users by total points.
- Shows rank, display name, avatar, total points, and weekly points.
- Highlights the current user's position.
- Updated by Cloud Function after each match completes.

### 7.6 Leagues

**Pages:** `/leagues`, `/leagues/[leagueId]`
**Service:** `src/services/leagues.ts`

- **Create League** — Set name, description, type (public/private), max members.
- **Join by Code** — Enter a 6-character invite code to join a private league.
- **Discover** — Browse and join public leagues.
- **League Detail** — View league info, invite code, member leaderboard.
- **Leave League** — Members can leave; creators cannot.
- Each league has its own leaderboard ranked by member points.

### 7.7 Credits & Power-Ups

**Page:** `/credits`
**Service:** `src/services/credits.ts`

#### Credits
- In-app currency earned through gameplay or purchased with real money.
- **Earning methods:** Daily login reward, match participation, achievements, referrals.
- **Spending:** Purchase power-ups to boost lineup performance.

#### Credit Packages (purchasable via Stripe)
| Package | Credits | Bonus | Price |
|---|---|---|---|
| Starter | 100 | — | $0.99 |
| Popular | 500 | +50 | $3.99 |
| Pro | 1,200 | +200 | $7.99 |
| Ultimate | 3,000 | +750 | $14.99 |

#### Power-Ups
| Power-Up | Cost | Effect |
|---|---|---|
| Captain Boost | 50 credits | Captain earns 3x instead of 2x |
| Triple Captain | 100 credits | Captain earns 4x points |
| Bench Boost | 75 credits | Bench players also earn points |
| Wild Card | 150 credits | Change lineup after match starts |

### 7.8 Friends System

**Page:** `/friends`
**Service:** `src/services/friends.ts`

- **Search users** by display name.
- **Send friend requests** with accept/reject flow.
- **View friends list** with online status.
- **Remove friends**.
- Friend data stored in `friendRequests` and `friendships` Firestore collections.

### 7.9 Achievements & Badges

**Page:** `/achievements`
**Service:** `src/services/achievements.ts`

Gamification system with tiered achievements:

| Category | Examples |
|---|---|
| **Matches** | First Steps (1 match), Veteran (50 matches), Legend (200 matches) |
| **Points** | Century (100 pts), High Scorer (500 pts), Elite (2000 pts) |
| **Ranks** | Top 100, Top 10, Champion (#1) |
| **Social** | First Friend, Social Butterfly (20 friends), League Creator |
| **Special** | Perfect Score, Streak Master, Early Adopter |

Each achievement has 4 tiers: Bronze → Silver → Gold → Platinum, with increasing credit rewards.

### 7.10 Levels & XP

**Service:** `src/services/levels.ts`

- Users earn XP from activities (submitting lineups, winning, daily login).
- XP accumulates to level up (Level 1 → Level 50+).
- Each level requires progressively more XP.
- Level display component shows current level, XP bar, and progress to next level.

### 7.11 Notifications

**Service:** `src/services/notifications.ts`

- In-app notification center.
- Types: match reminders, deadline alerts, friend requests, achievement unlocks, admin broadcasts.
- Stored in Firestore `notifications` collection per user.

### 7.12 Admin Panel

**Pages:** `/admin`, `/admin/analytics`, `/admin/broadcast`, `/admin/matches`, `/admin/users`
**Service:** `src/services/admin.ts`

- **Dashboard** — Overview of app statistics.
- **User Management** — View, ban, or promote users.
- **Match Management** — Manual match data sync.
- **Broadcast** — Send notifications to all users (immediate or scheduled).
- **Analytics** — User activity and engagement metrics.
- Protected by admin role check (Firebase custom claims).

---

## 8. API Integration (API-Football)

### 8.1 Overview

**Provider:** API-Football v3 (via api-sports.io)
**File:** `src/services/api-football.ts`

The app uses the API-Football service to fetch real-time football data for the Saudi Pro League (League ID: 307).

### 8.2 Endpoints Used

| Endpoint | Purpose |
|---|---|
| `GET /fixtures` | Fetch match fixtures by date range, live status, or ID |
| `GET /fixtures/lineups` | Get team lineups for a specific match |
| `GET /players/squads` | Get full team squad (for upcoming matches) |

### 8.3 Key Functions

```typescript
getFixtures(options)        // Fetch fixtures with various filters
getLiveMatches()            // Get currently live SPL matches
getUpcomingMatches()        // Get matches in the next 30 days
getFixturePlayers(id)       // Get lineup data for a specific fixture
getTeamSquad(teamId)        // Get full squad for a team
```

### 8.4 Season Detection

The `getCurrentSeason()` function automatically determines the football season:
- **January–July** → Previous year (e.g., Jan 2026 = 2025 season)
- **August–December** → Current year (e.g., Sep 2025 = 2025 season)

### 8.5 Caching & Rate Limiting

- API responses are cached for **30 minutes** using Next.js `revalidate`.
- Rate limit errors are detected and shown as user-friendly messages.
- The Pro API key allows higher request limits than the free tier.

---

## 9. Cloud Functions (Backend)

Firebase Cloud Functions handle all server-side logic. They run on Google Cloud and are triggered by HTTP requests, Firestore events, or scheduled timers.

### 9.1 Functions Overview

| Function | Trigger | Purpose |
|---|---|---|
| `syncMatches` | Scheduled | Sync latest match data from API-Football |
| `syncMatchData` | HTTP | Manual match data sync (admin) |
| `calculateLivePoints` | Scheduled | Calculate points for live matches |
| `finalizeMatchPoints` | Scheduled | Final points calculation after match ends |
| `lockLineups` | Scheduled | Lock all lineups when match kicks off |
| `updateLeaderboards` | Firestore trigger | Recalculate rankings after points update |
| `updateGlobalRanks` | Scheduled | Recalculate global rankings |
| `awardDailyLoginCredits` | HTTP | Award daily login bonus |
| `awardMatchParticipationCredits` | Firestore trigger | Award credits for submitting lineup |
| `purchasePowerUp` | HTTP | Deduct credits and activate power-up |
| `awardWeeklyRewards` | Scheduled | Distribute weekly top-performer rewards |
| `createPaymentIntent` | HTTP | Create Stripe payment intent |
| `handleStripeWebhook` | HTTP | Process Stripe payment confirmation |
| `getTransactionHistory` | HTTP | Fetch user's transaction history |
| `sendMatchReminders` | Scheduled | Remind users before match deadline |
| `sendDeadlineReminders` | Scheduled | Alert users of approaching lineup deadline |
| `sendBroadcastNotification` | HTTP | Admin sends notification to all users |
| `processScheduledBroadcasts` | Scheduled | Send scheduled broadcast messages |
| `getBroadcastHistory` | HTTP | Fetch past broadcasts |
| `assignAdminRole` | HTTP | Grant admin privileges |
| `removeAdminRole` | HTTP | Revoke admin privileges |
| `banUserSecure` | HTTP | Ban a user account |
| `generateReferralCode` | HTTP | Create unique referral code |
| `applyReferralCode` | HTTP | Apply referral and award both users |

### 9.2 Points Calculation Logic

Points are calculated based on real match events:

| Event | Points |
|---|---|
| Goal scored | +6 (FWD), +7 (MID), +8 (DEF/GK) |
| Assist | +3 |
| Clean sheet | +4 (DEF/GK), +1 (MID) |
| Yellow card | -1 |
| Red card | -3 |
| Own goal | -2 |
| Penalty saved (GK) | +5 |
| Penalty missed | -2 |
| Minutes played (>60) | +2 |
| Minutes played (>0) | +1 |

Captain multiplier: **2x** (or 3x/4x with power-ups).

---

## 10. Payment System (Stripe)

### 10.1 Flow

```
User selects credit package
        │
        ▼
Frontend calls Cloud Function: createPaymentIntent(packageId)
        │
        ▼
Cloud Function creates Stripe PaymentIntent, returns clientSecret
        │
        ▼
Frontend uses Stripe Elements to collect card details
(Card Number, Expiry, CVC, Zip Code — all separate fields)
        │
        ▼
stripe.confirmCardPayment(clientSecret, { card, billing_details })
        │
        ▼
Stripe processes payment
        │
        ▼
Stripe sends webhook to handleStripeWebhook Cloud Function
        │
        ▼
Cloud Function updates user credits in Firestore
        │
        ▼
Frontend shows success and updates credit balance
```

### 10.2 Security

- Card details **never touch our server** — they go directly to Stripe via Stripe Elements.
- The `clientSecret` is generated server-side and is single-use.
- Webhook signature verification ensures only genuine Stripe events are processed.
- All payment amounts are validated server-side against the package definitions.

---

## 11. Internationalization (i18n)

### 11.1 Setup

- **Library:** `next-intl` v4.5
- **Supported locales:** English (`en`), Arabic (`ar`)
- **Translation files:** `messages/en.json`, `messages/ar.json`
- **Default locale:** English

### 11.2 How It Works

1. `src/middleware.ts` intercepts all requests and routes them through locale detection.
2. URLs are prefixed with locale: `/en/matches`, `/ar/matches`.
3. `src/navigation.ts` provides locale-aware `Link`, `useRouter`, `usePathname`.
4. Components use `useTranslations('Namespace')` to access translated strings.
5. Arabic pages render with `dir="rtl"` (right-to-left) on the `<html>` tag.

### 11.3 Language Switcher

The `LanguageSwitcher` component in the Navbar allows users to toggle between English and Arabic. It preserves the current page path when switching.

---

## 12. Routing & Navigation

### 12.1 Route Structure

All routes are under `src/app/[locale]/` using Next.js App Router with dynamic locale segment.

| Route | Page | Auth Required |
|---|---|---|
| `/` | Homepage | No |
| `/login` | Login | No |
| `/register` | Registration | No |
| `/reset-password` | Password reset | No |
| `/matches` | Match listing | No |
| `/matches/[matchId]` | Live match detail | No |
| `/lineup` | Lineup builder + My Matches | Yes |
| `/leaderboard` | Global leaderboard | No |
| `/leagues` | Leagues listing | Yes |
| `/leagues/[leagueId]` | League detail | Yes |
| `/credits` | Credits store | Yes |
| `/friends` | Friends system | Yes |
| `/achievements` | Achievements | Yes |
| `/profile` | User profile | Yes |
| `/players` | Player database | No |
| `/prizes` | Prize information | No |
| `/transactions` | Transaction history | Yes |
| `/admin/*` | Admin panel | Admin only |
| `/help` | Help & FAQ | No |
| `/contact` | Contact page | No |
| `/privacy` | Privacy policy | No |
| `/terms` | Terms of service | No |

### 12.2 Navigation Component

The `Navbar` component provides:
- Logo and app name
- Navigation links (Matches, Lineup, Leaderboard, Leagues, Achievements, Friends, Help)
- Language switcher (EN/AR)
- User menu (when logged in): profile, credits balance, transactions, logout
- Login/Register buttons (when logged out)
- Responsive mobile menu

---

## 13. State Management

### 13.1 Approach

The app uses a combination of state management strategies:

| Layer | Tool | Purpose |
|---|---|---|
| **Auth State** | React Context (`AuthProvider`) | Global user/profile state |
| **Server State** | TanStack React Query | Cached API data (matches, players) |
| **Local State** | React `useState` | Component-level UI state |
| **URL State** | Next.js `searchParams` | Match selection, filters |

### 13.2 React Query

`src/hooks/useQueries.ts` defines custom hooks:
- `useLiveMatches()` — Fetches live matches, refetches every 30 seconds.
- `useUpcomingMatches()` — Fetches upcoming matches, cached for 30 minutes.

### 13.3 Auth Context

The `useAuth()` hook provides:
```typescript
{
    user: User | null,        // Firebase Auth user object
    profile: UserProfile | null, // Firestore profile document
    loading: boolean,
    error: string | null
}
```

---

## 14. UI/UX Design

### 14.1 Design Principles

- **Dark theme** — Modern dark UI with green (#00a651) as the primary accent color.
- **Mobile-first** — Responsive design that works on all screen sizes.
- **RTL support** — Full right-to-left layout for Arabic.
- **Minimal loading states** — Skeleton loaders and spinners for async content.
- **Clear feedback** — Toast notifications, success banners, error messages.

### 14.2 Styling Approach

- **CSS Modules** — Each component has its own `.module.css` file for scoped styles.
- **CSS Variables** — Global theme variables (`--color-primary`, `--bg-primary`, etc.).
- **No external CSS framework** — Custom CSS for full design control.
- **Responsive breakpoints:** 640px (mobile), 768px (tablet), 1024px (desktop).

### 14.3 Component Architecture

Components are organized into two categories:

- **UI Components** (`src/components/ui/`) — Generic, reusable components (Button, Card, Input, Navbar, Footer, etc.).
- **Feature Components** (`src/components/features/`) — Domain-specific components (Hero, MatchCard, PaymentModal, LeaderboardTable, etc.).

---

## 15. Security Considerations

| Area | Implementation |
|---|---|
| **Authentication** | Firebase Auth with secure token management |
| **Authorization** | Firestore security rules + Cloud Function role checks |
| **API Keys** | Stored in environment variables, never exposed in client bundle (except `NEXT_PUBLIC_*`) |
| **Payments** | Stripe Elements — card data never touches our server |
| **XSS Prevention** | React's built-in escaping + no `dangerouslySetInnerHTML` |
| **CSRF** | Firebase Auth tokens are httpOnly and SameSite |
| **Input Validation** | Server-side validation in Cloud Functions |
| **Rate Limiting** | API-Football caching prevents excessive external calls |

---

## 16. Deployment & Hosting

### 16.1 Firebase App Hosting

The app is deployed using **Firebase App Hosting**, which provides:
- Automatic builds from the GitHub repository.
- CDN-backed global distribution.
- SSL certificates.
- Environment variable management via `apphosting.yaml`.

### 16.2 Deployment Configuration

`apphosting.yaml` contains:
- Firebase project configuration.
- API keys as environment variables.
- Build and runtime settings.

### 16.3 Cloud Functions Deployment

Cloud Functions are deployed separately using the Firebase CLI:
```bash
cd functions
npm run build
firebase deploy --only functions
```

---

## 17. Setup & Installation

### 17.1 Prerequisites

- **Node.js** 18+ and npm
- **Firebase CLI** (`npm install -g firebase-tools`)
- **Git**

### 17.2 Clone & Install

```bash
# Clone the repository
git clone https://github.com/Nasir650/fantasy-matchday.git
cd fantasy-matchday

# Install frontend dependencies
npm install

# Install Cloud Functions dependencies
cd functions
npm install
cd ..
```

### 17.3 Environment Setup

Create a `.env.local` file in the project root:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# API-Football Configuration
NEXT_PUBLIC_API_FOOTBALL_KEY=your_api_football_key
NEXT_PUBLIC_API_FOOTBALL_HOST=v3.football.api-sports.io
NEXT_PUBLIC_SPL_LEAGUE_ID=307

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 17.4 Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### 17.5 Build for Production

```bash
npm run build
npm start
```

---

## 18. Environment Variables

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase project API key | Yes |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Yes |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Yes |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Yes |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | Yes |
| `NEXT_PUBLIC_API_FOOTBALL_KEY` | API-Football API key | Yes |
| `NEXT_PUBLIC_API_FOOTBALL_HOST` | API-Football host URL | Yes |
| `NEXT_PUBLIC_SPL_LEAGUE_ID` | Saudi Pro League ID (307) | Yes |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key (Cloud Functions) | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Yes |

---

## 19. Known Limitations & Future Work

### 19.1 Current Limitations

- **Email notifications** are disabled (requires SendGrid API key configuration).
- **Push notifications** require Firebase Cloud Messaging setup on client devices.
- **Firestore composite indexes** must be manually created for some complex queries.
- **API-Football rate limits** may affect data freshness during peak usage.

### 19.2 Future Enhancements

- **Mobile app** — React Native version for iOS and Android.
- **Head-to-head mode** — Direct 1v1 matchups between friends.
- **Season-long leagues** — Full season fantasy competition (not just per-match).
- **Player statistics page** — Detailed player performance history and trends.
- **Social features** — Chat within leagues, share lineups on social media.
- **Advanced analytics** — AI-powered player recommendations and lineup suggestions.
- **Expanded leagues** — Support for other football leagues beyond SPL.
- **Reward marketplace** — Redeem credits for real prizes or merchandise.

---

## Appendix A: Key Type Definitions

```typescript
// src/types/app.ts

type PlayerPosition = 'GK' | 'DEF' | 'MID' | 'FWD';

type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled';

type LineupStatus = 'draft' | 'submitted' | 'locked' | 'completed';

interface Team {
    id: number;
    name: string;
    logo: string;
}

interface Match {
    id: string;
    fixtureId: number;
    homeTeam: Team;
    awayTeam: Team;
    date: string;
    status: MatchStatus;
    score?: { home: number; away: number };
    venue?: string;
}

interface Player {
    id: string;
    name: string;
    position: PlayerPosition;
    teamId: number;
    teamName: string;
    photo?: string;
    number?: number;
}

interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    avatarUrl?: string;
    credits: number;
    level: number;
    xp: number;
    totalPoints: number;
    globalRank?: number;
    createdAt: Timestamp;
}
```

---

## Appendix B: API-Football Response Types

```typescript
// src/types/api-football.ts

interface APIFixture {
    fixture: {
        id: number;
        date: string;
        status: { short: string; long: string; elapsed: number | null };
        venue: { name: string; city: string };
    };
    league: { id: number; name: string; season: number };
    teams: {
        home: { id: number; name: string; logo: string; winner: boolean | null };
        away: { id: number; name: string; logo: string; winner: boolean | null };
    };
    goals: { home: number | null; away: number | null };
    score: { fulltime: { home: number | null; away: number | null } };
}
```

---

*Document last updated: February 14, 2026*
*Project repository: https://github.com/Nasir650/fantasy-matchday*
