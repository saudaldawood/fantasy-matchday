# Fantasy Matchday - Product Specification

## Overview

**Fantasy Matchday** is a match-based fantasy football platform focused on the Saudi Pro League. Unlike traditional season-long fantasy games, users select players for individual matches, earn points based on real-world performance, and compete through leagues and leaderboards. The platform is designed for both casual and passionate fans, delivering a simple, engaging, and regionally focused experience.

### Project Goals
- Build a minimum viable product (MVP) for user testing and soft launch
- Deliver a responsive web platform optimized for desktop and mobile browsers
- Provide bilingual support (Arabic + English) with proper RTL implementation
- Enable real-time gameplay with live score updates and automatic points calculation
- Create a scalable architecture for future expansion (mobile apps, additional leagues)

---

## Target Users

### Primary Audience
- Saudi Pro League fans (casual and passionate)
- Arabic and English-speaking users
- Mobile-first users who prefer browser-based experiences
- Users seeking quick, match-based fantasy gameplay vs. season-long commitment

### User Personas
1. **Casual Fan**: Plays occasionally, focuses on favorite teams, prefers simple interface
2. **Passionate Fan**: Plays every match, joins multiple leagues, tracks detailed statistics
3. **Social Player**: Creates leagues with friends, enjoys competition and banter
4. **Competitive Player**: Focuses on global rankings, optimizes lineups, uses power-ups strategically

---

## Core Features

### 1. User Authentication & Profiles
- Email/password registration and login via Firebase Authentication
- Social login options (Google, Apple, Facebook)
- User profile customization:
  - Avatar upload
  - Display name
  - Favorite team
  - Language preference (Arabic/English)
  - Notification settings
- Profile statistics dashboard:
  - Match-by-match performance history
  - Total points and average points per match
  - Best/worst performances
  - Win/loss record in leagues
  - Achievements and badges earned
  - Credit transaction history

### 2. Match Selection & Lineup Building
- **Match Discovery**:
  - Upcoming matches displayed as cards (team logos, time, venue)
  - Color-coded match status (upcoming/live/completed)
  - Filter by date, team, or league round
  - Automatic match schedule updates 24 hours in advance

- **Lineup Creation**:
  - Select players per match (formation-based: e.g., 1 GK, 3-5 DEF, 3-5 MID, 1-3 FWD)
  - Player cards showing: name, team, position, recent form, price (if applicable)
  - Drag-and-drop interface for lineup building
  - Captain selection (2x points multiplier)
  - Bench players (substitutes)
  - Lineup deadline: match kickoff time
  - Save multiple lineup templates for quick selection

### 3. Real-Time Points & Scoring
- **Automatic Points Calculation**:
  - Live updates every 2-3 minutes during matches
  - Points calculated based on player position and performance
  - Real-time sync to user dashboards without page refresh
  - Final points locked after match completion

- **Scoring System** (customizable):
  - **Goalkeepers & Defenders**: Clean sheet +4, Goal +6, Assist +3, Penalty save +5, 3+ saves +2, Yellow -1, Red -3
  - **Midfielders**: Goal +5, Assist +3, Clean sheet +1, Yellow -1, Red -3
  - **Forwards**: Goal +4, Assist +3, Yellow -1, Red -3
  - **Bonus Points (All)**: Man of the Match +3, Hat-trick +5, 60+ minutes played +2

- **Live Dashboard**:
  - Your lineup with live points per player
  - Match events affecting your players (goals, assists, cards highlighted)
  - Total points counter
  - Player-by-player breakdown

### 4. Leaderboards & Rankings
- **Global Leaderboard**: All users ranked by points
- **League Leaderboards**: Private and public league rankings
- **Friends Comparison**: See how you rank against friends
- **Live Updates**: Rankings refresh every 5 minutes during matches
- **Visual Indicators**: Position changes (↑↓), highlighted user position
- **Search & Filter**: Find specific users, filter by league/friends
- **Top Performers**: Match-specific leaderboards showing best lineups

### 5. Leagues & Social Competition
- **Private Leagues**:
  - Create custom leagues with unique invite codes
  - Shareable links for easy invitations
  - Set league name, description, and rules
  - Choose scope: single match, weekly, monthly, or season-long
  - League admin controls (add/remove members, manage settings)

- **League Types**:
  - Weekly leagues (single matchday)
  - Monthly leagues (4-5 matchdays)
  - Season-long leagues
  - Head-to-head competitions

- **League Features**:
  - Private leaderboards
  - View friends' lineups after match starts
  - League achievements and trophies
  - League history and past champions
  - Social sharing (Twitter, Instagram, Facebook)

### 6. Credits & Monetization System
- **In-Platform Currency**: "Credits"

- **Earning Credits**:
  - Daily login bonus: 10 credits
  - Match participation: 20 credits
  - Weekly ranking rewards: 50-500 credits
  - Achievement unlocks: 25-100 credits
  - Winning leagues: 200-1000 credits
  - Referral bonuses: 100 credits per friend

- **Using Credits**:
  - Unlock power-ups
  - Extra lineup changes after deadline
  - Special badges and profile customization
  - Entry to premium leagues
  - Unlock detailed player analytics

- **Power-Ups**:
  - **Captain Boost** (50 credits): 2x points for selected player
  - **Triple Captain** (100 credits): 3x points (once per month limit)
  - **Bench Boost** (75 credits): All bench players score points
  - **Wild Card** (150 credits): Unlimited transfers for one matchday

- **Monetization**:
  - Optional credit purchases ($1 = 100 credits)
  - Premium subscription for exclusive benefits
  - All core features remain free to play

### 7. Achievements & Gamification
- Achievement system with unlockable badges:
  - First match participation
  - Winning streaks
  - Top 10 finishes
  - Perfect lineup (all players score)
  - Loyalty milestones (matches played)
- Level-up system with visual rewards
- Streak counters (daily login, winning weeks)
- Profile customization unlocks
- Celebration animations for achievements

### 8. Notifications System
- **Push Notifications** (browser/mobile):
  - Match starting soon (30 min before)
  - Lineup deadline reminders (1 hour before)
  - Match results and performance summary
  - Rank changes and achievements unlocked
  - League invitations and updates

- **In-App Notifications**:
  - Badge counts for unread messages
  - Notification center with history
  - Customizable notification preferences

- **Email Notifications** (optional):
  - Weekly summary emails
  - Important announcements
  - League invitations

### 9. Admin Dashboard
- **User Management**:
  - View all registered users
  - User search and filtering
  - Ban/suspend users
  - View user activity and statistics
  - Handle support tickets

- **Match Management**:
  - Add/edit match details
  - Manually adjust player points
  - Override match results
  - Add bonus points for special events
  - Pause/resume point calculation
  - Import custom player data
  - CSV import/export functionality

- **Content Management**:
  - Send broadcast notifications
  - Targeted messaging (user groups, leagues, regions)
  - Schedule messages in advance
  - Update announcements and FAQs
  - Manage achievements

- **Analytics Dashboard**:
  - Total/active users (daily/weekly/monthly)
  - User retention and engagement metrics
  - Top performing players and positions
  - Match participation statistics
  - Credit purchases and revenue tracking
  - System health monitoring (API response times, error rates)
  - Export reports (Excel/PDF)

- **Multi-Admin System**:
  - Role-based access control:
    - **Super Admin**: Full control, manage other admins
    - **Match Admin**: Match and player data management
    - **User Admin**: User account management
    - **Content Admin**: Notifications and content updates
  - Activity logs and audit trails
  - Admin collaboration features

### 10. Payment Gateway Integration
- Secure payment processing for credit purchases
- Supported gateways: Stripe, PayPal (or regional alternatives)
- Transaction history for users
- Refund management through admin panel
- Financial reporting and analytics

---

## Tech Stack

### Frontend
- **Framework**: Next.js (React) with TypeScript
  - Server-side rendering for SEO
  - Fast page loads and routing
  - Built-in internationalization (i18n)
- **Styling**: Tailwind CSS
  - Responsive design utilities
  - Custom design system
  - Dark mode support
- **State Management**: React Query + Context API
  - Efficient data fetching and caching
  - Real-time data synchronization
- **UI Components**: Custom component library
  - Reusable, accessible components
  - Consistent design language

### Backend (Recommended: Firebase)
- **Authentication**: Firebase Authentication
  - Email/password, social logins
  - Secure session management
- **Database**: Cloud Firestore
  - Real-time NoSQL database
  - Automatic scaling
  - Offline support
- **Cloud Functions**: Firebase Cloud Functions
  - Automated points calculation
  - Scheduled match data updates
  - API integrations
- **Storage**: Firebase Storage
  - User avatars and media files
- **Hosting**: Firebase Hosting
  - Fast, secure CDN delivery
  - Automatic SSL certificates

### Alternative Backend (Node.js)
- **Server**: Node.js + Express
- **Database**: PostgreSQL or MongoDB
- **Hosting**: AWS, DigitalOcean, or Vercel
- **Note**: Slower development time, higher maintenance costs

### External APIs
- **Primary**: API-FOOTBALL (RapidAPI)
  - Saudi Pro League coverage
  - Real-time match data and player stats
  - Pricing: $10-30/month (MVP), $50-150/month (production)
- **Backup**: SportMonks API
  - Alternative data source for redundancy

### DevOps & Monitoring
- **Hosting**: Vercel (frontend) + Firebase (backend)
- **Monitoring**: Firebase Analytics, Sentry (error tracking)
- **Performance**: Lighthouse CI, Web Vitals tracking
- **CI/CD**: GitHub Actions or Vercel automatic deployments

---

## Gameplay & Scoring

### Match-Based Gameplay Flow
1. **Pre-Match**:
   - User browses upcoming matches
   - Selects a match to participate in
   - Builds lineup from available players
   - Selects captain (2x points)
   - Applies power-ups (optional)
   - Submits lineup before match kickoff

2. **During Match**:
   - Live points update every 2-3 minutes
   - User watches points accumulate in real-time
   - Leaderboards update live
   - Match events highlighted (goals, assists, cards)

3. **Post-Match**:
   - Final points calculated and locked
   - Rankings finalized
   - Credits and achievements awarded
   - Notifications sent with performance summary
   - User can view detailed breakdown

### Data Update Flow
```
Sports API → Firebase Cloud Functions (every 2-3 min) 
→ Process match events → Calculate points 
→ Update Firestore → Real-time sync to all users
```

### Lineup Rules
- Formation-based selection (e.g., 1 GK, 4 DEF, 4 MID, 2 FWD)
- Minimum/maximum players per position
- Budget constraint (optional for MVP)
- Captain selection required (2x points)
- Bench players (3-5 substitutes)
- Deadline: match kickoff time
- No changes after deadline (unless Wild Card power-up used)

---

## Bilingual & RTL Support

### Language Features
- **Supported Languages**: Arabic (primary), English
- **Language Switcher**: One-click toggle in header (top right)
- **User Preference**: Language choice saved to profile
- **Auto-Detection**: Browser/location-based language detection on first visit

### RTL Implementation
- **Complete Layout Mirroring**: All UI elements flip for Arabic
- **Typography**: Arabic-optimized fonts for readability
- **Numbers & Dates**: Proper Arabic numeral display, Hijri calendar option
- **Player Names**: Displayed in both Arabic and English
- **Forms & Inputs**: RTL text input behavior

### Content Coverage
- All interface labels and buttons
- Match descriptions and notifications
- Player and team names
- Rules, FAQs, and help documentation
- Error messages and confirmations
- Admin dashboard

### Technical Implementation
- Next.js i18n routing (`/en/...` and `/ar/...`)
- Separate JSON translation files per language
- RTL CSS utilities via Tailwind directives
- Easy to add more languages in future

---

## Admin Panel

### Dashboard Overview
- Single-page summary with key metrics
- Quick action buttons for common tasks
- Visual charts and graphs (user growth, engagement)
- Recent activity feed
- Alerts for issues requiring attention

### Key Admin Workflows

**Workflow 1: Update Match Data**
1. Navigate to "Matches" section
2. Search/filter to find specific match
3. Click "Edit" button
4. Modify score, player stats, or match details
5. Click "Save" → Changes reflected immediately

**Workflow 2: Send Notification**
1. Navigate to "Messages" section
2. Click "New Broadcast"
3. Compose message (rich text, images, links)
4. Select audience (all users, specific league, user group)
5. Choose "Send Now" or "Schedule"
6. Track delivery and open rates

**Workflow 3: Adjust User Points**
1. Navigate to "Users" section
2. Search for specific user
3. View user's match history
4. Click "Adjust Points" for specific match
5. Enter adjustment reason and amount
6. Confirm → Audit log created

### Admin Security
- Role-based permissions
- Activity logs for all actions
- Two-factor authentication for Super Admins
- IP whitelisting (optional)
- Automatic logout after inactivity

---

## Expansion Roadmap

### Phase 1: MVP Launch (Months 1-2)
- Core gameplay features
- Saudi Pro League only
- Basic leagues and leaderboards
- Credits and power-ups
- Admin dashboard
- PWA (Progressive Web App) capability

### Phase 2: Social Features (Month 2-3)
- Friend lists and friend requests
- Enhanced social sharing
- League chat (optional)
- User profiles (public view)

### Phase 3: Additional Sports (Month 3-6)
- Modular sport system
- Add Saudi Basketball, Volleyball, etc.
- Sport-specific scoring rules
- Multi-sport dashboard

### Phase 4: Mobile Apps (Month 6-9)
- React Native or Flutter development
- iOS and Android native apps
- App Store and Play Store presence
- Push notifications enhancement
- Native features (camera, GPS)

### Phase 5: Advanced Features (Month 12+)
- AI-powered lineup suggestions
- Advanced analytics and insights
- Video highlights integration
- Live streaming partnerships
- International leagues (EPL, La Liga)
- Loyalty programs and sponsorships

### Scalability Plan
- **Current MVP Capacity**: 5,000-10,000 concurrent users
- **10K-50K users**: No architecture changes needed
- **50K-500K users**: CDN implementation, database optimization
- **500K+ users**: Consider migration to dedicated servers, load balancing

### Multi-Sport Architecture
- Database structure supports multiple sports
- Sport-specific point systems configurable via admin
- Modular frontend design for sport-specific UI
- Separate leaderboards per sport
- Timeline: 1-2 weeks to add new sport

---

## Design Principles

### User Experience Goals
1. **Simplicity**: Users should register, select match, build lineup, and view points seamlessly
2. **Speed**: Page loads under 2 seconds on 4G, smooth 60fps animations
3. **Clarity**: Information hierarchy prioritizes key actions and data
4. **Engagement**: Gamification elements keep users coming back
5. **Accessibility**: WCAG 2.1 AA compliance, readable for all ages

### Visual Identity
- Modern, clean design with Saudi Pro League branding
- Vibrant color scheme matching football excitement
- Team colors and crests integrated throughout
- Dark mode option for comfortable viewing
- Consistent iconography and visual language

### Mobile-First Approach
- Touch-optimized controls
- Swipe gestures for navigation
- One-thumb operation wherever possible
- Progressive Web App (PWA) for installable experience
- Offline mode for viewing historical data

---

## Success Metrics

### User Engagement
- Daily Active Users (DAU) / Monthly Active Users (MAU)
- Average session duration
- Matches played per user per week
- League participation rate
- Retention rate (Day 1, Day 7, Day 30)

### Gameplay Metrics
- Average lineup submission time
- Power-up usage rate
- Achievement unlock rate
- Credit earning vs. spending ratio

### Business Metrics
- Credit purchase conversion rate
- Average revenue per user (ARPU)
- Customer acquisition cost (CAC)
- Lifetime value (LTV)

### Technical Metrics
- Page load time (target: <2s)
- API response time (target: <500ms)
- Error rate (target: <0.1%)
- Uptime (target: 99.9%)

---

## Documentation & Handoff

### Deliverables
1. Fully functional, responsive web platform
2. Backend with user data and match integration
3. Admin dashboard and testing environment
4. Technical documentation:
   - Architecture overview
   - API documentation
   - Database schema
   - Deployment guide
5. User documentation:
   - User guide (bilingual)
   - Admin manual
   - FAQs
6. Design assets:
   - Figma/Adobe XD files
   - Component library
   - Brand guidelines

### Future Development Support
- Code structured for easy mobile app conversion
- Modular architecture for feature additions
- Comprehensive inline code comments
- Git repository with clear commit history
- Environment setup documentation

---

## Timeline Summary

**5 Milestones × 5 Days = 25 Days Total**

1. **Milestone 1 (Days 1-5)**: Requirements & Wireframing
2. **Milestone 2 (Days 6-10)**: UI/UX Design
3. **Milestone 3 (Days 11-15)**: Frontend Development
4. **Milestone 4 (Days 16-20)**: Backend Development & API Integration
5. **Milestone 5 (Days 21-25)**: Testing, QA & Deployment

---

*This specification serves as the single source of truth for Fantasy Matchday development. All features, technical decisions, and design choices should reference this document.*

