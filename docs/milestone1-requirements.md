# Milestone 1: Requirements Gathering & Wireframing
## Fantasy Matchday - Complete Requirements Document

**Project:** Fantasy Matchday - Saudi Pro League Fantasy Football Platform  
**Milestone:** 1 of 5  
**Duration:** Days 1-5  
**Status:** In Progress  
**Date:** November 23, 2025

---

## Executive Summary

Fantasy Matchday is a match-based fantasy football platform focused on the Saudi Pro League. Unlike traditional season-long fantasy games, users select players for individual matches, earn points based on real-world performance, and compete through leagues and leaderboards. This document outlines the complete requirements, MVP features, and specifications for the platform.

### Project Vision
To create the premier fantasy football experience for Saudi Pro League fans, offering:
- **Match-based gameplay** for quick, engaging experiences
- **Bilingual support** (Arabic + English) with full RTL implementation
- **Real-time updates** with live scoring and leaderboards
- **Social competition** through leagues and achievements
- **Scalable architecture** for future expansion

---

## 1. Client Requirements Review

### 1.1 Primary Objectives
Based on existing documentation and project analysis:

1. **Build MVP for soft launch** targeting Saudi Pro League fans
2. **Deliver responsive web platform** optimized for mobile and desktop
3. **Provide bilingual experience** with Arabic as primary language
4. **Enable real-time gameplay** with automatic points calculation
5. **Create scalable foundation** for future mobile apps and additional leagues

### 1.2 Target Audience

#### Primary Users
- **Demographics:** Saudi Pro League fans (ages 18-45)
- **Languages:** Arabic (primary), English (secondary)
- **Devices:** Mobile-first (70%), Desktop (30%)
- **Behavior:** Prefer quick, match-based engagement over season-long commitment

#### User Personas

**Persona 1: Casual Fan - Ahmed**
- Age: 28, works full-time
- Plays occasionally, focuses on favorite team (Al-Hilal)
- Prefers simple interface, minimal time investment
- Uses mobile device exclusively
- Needs: Easy lineup creation, clear scoring, minimal complexity

**Persona 2: Passionate Fan - Khalid**
- Age: 22, university student
- Plays every match, joins multiple leagues
- Tracks detailed statistics and player performance
- Uses both mobile and desktop
- Needs: Advanced analytics, league management, competitive features

**Persona 3: Social Player - Fatima**
- Age: 25, marketing professional
- Creates leagues with friends and colleagues
- Enjoys competition and social interaction
- Uses mobile primarily
- Needs: Easy league creation, social sharing, friend comparison

**Persona 4: Competitive Player - Omar**
- Age: 32, business owner
- Focuses on global rankings and optimization
- Uses power-ups strategically
- Desktop user for lineup building
- Needs: Detailed stats, power-ups, leaderboard tracking

### 1.3 Business Requirements

#### Revenue Model
1. **Freemium Model**
   - Core features free to play
   - Optional credit purchases for power-ups
   - Premium features unlock with credits

2. **Monetization Streams**
   - Credit purchases ($1 = 100 credits)
   - Premium subscriptions (future phase)
   - Sponsored leagues (future phase)
   - Advertising (minimal, non-intrusive)

#### Success Metrics
- **User Acquisition:** 10,000 users in first 3 months
- **Engagement:** 60% weekly active users
- **Retention:** 40% Day-30 retention
- **Monetization:** 5% conversion rate for credit purchases
- **Performance:** <2s page load time, 99.9% uptime

---

## 2. MVP Feature Definition

### 2.1 Core MVP Features (Must-Have)

#### Feature 1: User Authentication & Profiles
**Priority:** P0 (Critical)  
**Status:** ✅ Implemented

**Requirements:**
- Email/password registration and login
- Google OAuth integration
- User profile creation with:
  - Avatar upload
  - Display name
  - Favorite team selection
  - Language preference (AR/EN)
- Profile statistics dashboard
- Password reset functionality

**Acceptance Criteria:**
- [ ] User can register with email/password
- [ ] User can login with Google
- [ ] User can upload profile avatar
- [ ] User can select favorite team
- [ ] User can switch language preference
- [ ] Profile displays user statistics

**Technical Implementation:**
- Firebase Authentication
- Firestore for user profiles
- Firebase Storage for avatars

---

#### Feature 2: Match Selection & Discovery
**Priority:** P0 (Critical)  
**Status:** 🔄 Partial

**Requirements:**
- Display upcoming Saudi Pro League matches
- Match cards showing:
  - Team logos and names
  - Match date and time
  - Venue information
  - Match status (upcoming/live/completed)
- Filter matches by:
  - Date (today, this week, all)
  - Team
  - League round
- Color-coded match status indicators
- Automatic match schedule updates

**Acceptance Criteria:**
- [ ] Matches display in card format
- [ ] Match cards show all required information
- [ ] Users can filter matches by date
- [ ] Users can filter matches by team
- [ ] Live matches have pulsing indicator
- [ ] Matches update automatically

**Technical Implementation:**
- API-FOOTBALL integration for match data
- Firestore for match storage
- Cloud Functions for scheduled updates

---

#### Feature 3: Lineup Builder
**Priority:** P0 (Critical)  
**Status:** 🔄 Partial

**Requirements:**
- Formation-based player selection (1 GK, 3-5 DEF, 3-5 MID, 1-3 FWD)
- Player cards displaying:
  - Player photo
  - Name (Arabic + English)
  - Team and position
  - Recent form
  - Average points
- Drag-and-drop interface (desktop)
- Position-based selection (mobile)
- Captain selection (2x points)
- Bench player selection (4 players)
- Formation validation
- Team limit validation (max 3 players per team)
- Lineup deadline enforcement (match kickoff)
- Auto-save draft functionality

**Acceptance Criteria:**
- [ ] User can select 11 starting players
- [ ] User can select 4 bench players
- [ ] User can select captain
- [ ] Formation validation works correctly
- [ ] Team limit validation works correctly
- [ ] Lineup locks at match kickoff
- [ ] Draft auto-saves every 30 seconds
- [ ] Drag-and-drop works on desktop
- [ ] Mobile interface is touch-optimized

**Technical Implementation:**
- React DnD for drag-and-drop
- Firestore for lineup storage
- Real-time validation logic
- Cloud Functions for deadline enforcement

---

#### Feature 4: Real-Time Points & Scoring
**Priority:** P0 (Critical)  
**Status:** ❌ Not Started

**Requirements:**
- Automatic points calculation based on player performance
- Position-specific scoring rules:
  - **GK/DEF:** Clean sheet +4, Goal +6, Assist +3, Penalty save +5, 3+ saves +2
  - **MID:** Goal +5, Assist +3, Clean sheet +1
  - **FWD:** Goal +4, Assist +3
  - **All:** MOTM +3, Hat-trick +5, 60+ min +2, Yellow -1, Red -3
- Captain multiplier (2x points)
- Live points updates every 2-3 minutes
- Points breakdown display
- Final points lock after match completion

**Acceptance Criteria:**
- [ ] Points calculate correctly for all positions
- [ ] Captain receives 2x multiplier
- [ ] Points update every 2-3 minutes during match
- [ ] Points breakdown shows all components
- [ ] Final points lock after match ends
- [ ] Points sync to all users in real-time

**Technical Implementation:**
- Cloud Functions for points calculation
- API-FOOTBALL for match events
- Firestore real-time sync
- Scheduled functions for updates

---

#### Feature 5: Leaderboards & Rankings
**Priority:** P0 (Critical)  
**Status:** 🔄 Partial

**Requirements:**
- Global leaderboard (all users)
- League leaderboards (private leagues)
- Friends comparison
- Live ranking updates every 5 minutes
- Visual indicators for position changes (↑↓)
- User position highlighting
- Search and filter functionality
- Top performers display
- Match-specific leaderboards

**Acceptance Criteria:**
- [ ] Global leaderboard displays all users
- [ ] League leaderboards display league members
- [ ] Friends comparison works correctly
- [ ] Rankings update every 5 minutes
- [ ] User's position is highlighted
- [ ] Position changes show arrows
- [ ] Search functionality works
- [ ] Top 3 get special indicators

**Technical Implementation:**
- Firestore queries with sorting
- Real-time listeners for updates
- Indexed queries for performance
- Pagination for large datasets

---

#### Feature 6: Leagues & Social Competition
**Priority:** P1 (High)  
**Status:** ❌ Not Started

**Requirements:**
- Create private leagues with:
  - League name and description
  - Invite code generation
  - League type selection (standard/head-to-head/weekly/monthly)
  - League scope (single match/weekly/monthly/season)
  - Privacy settings (public/private/invite-only)
- Join leagues via:
  - Invite code
  - Public league search
  - Direct invitation
- League management:
  - Add/remove members (admin only)
  - Edit league settings
  - Delete league
- League features:
  - Private leaderboards
  - View friends' lineups after match starts
  - League achievements
  - League history

**Acceptance Criteria:**
- [ ] User can create private league
- [ ] User can join league with code
- [ ] User can search public leagues
- [ ] Admin can manage members
- [ ] League leaderboard displays correctly
- [ ] Users can view friends' lineups
- [ ] League achievements track correctly

**Technical Implementation:**
- Firestore for league data
- Cloud Functions for league logic
- Invite code generation
- Access control rules

---

#### Feature 7: Credits & Power-Ups
**Priority:** P1 (High)  
**Status:** ❌ Not Started

**Requirements:**
- Credit earning system:
  - Daily login: +10 credits
  - Match participation: +20 credits
  - Weekly ranking rewards: 50-500 credits
  - Achievement unlocks: 25-100 credits
  - League wins: 200-1000 credits
  - Referrals: +100 credits
- Credit spending:
  - Power-ups (50-150 credits)
  - Profile customization (50-100 credits)
  - Premium features (100-200 credits)
- Power-ups:
  - **Captain Boost** (50 credits): 2x captain points
  - **Triple Captain** (100 credits): 3x captain points (once/month)
  - **Bench Boost** (75 credits): Bench players score
  - **Wild Card** (150 credits): Unlimited transfers (twice/month)
- Credit purchase packages:
  - 500 credits: $4.99
  - 1200 credits: $9.99 (+200 bonus)
  - 2500 credits: $19.99 (+500 bonus)
  - 6000 credits: $49.99 (+1500 bonus)

**Acceptance Criteria:**
- [ ] Users earn credits for activities
- [ ] Users can spend credits on power-ups
- [ ] Power-ups apply correctly to lineups
- [ ] Usage limits enforce correctly
- [ ] Credit purchases process securely
- [ ] Transaction history displays

**Technical Implementation:**
- Firestore for credit transactions
- Cloud Functions for credit logic
- Stripe/PayPal integration
- Usage limit tracking

---

#### Feature 8: Achievements & Gamification
**Priority:** P2 (Medium)  
**Status:** ❌ Not Started

**Requirements:**
- Achievement system with badges:
  - First match participation
  - Winning streaks
  - Top 10 finishes
  - Perfect lineup (all players score)
  - Loyalty milestones
- Level-up system
- Streak counters (daily login, winning weeks)
- Profile customization unlocks
- Celebration animations

**Acceptance Criteria:**
- [ ] Achievements unlock correctly
- [ ] Badges display on profile
- [ ] Level-up system works
- [ ] Streaks track accurately
- [ ] Celebration animations play

**Technical Implementation:**
- Firestore for achievements
- Cloud Functions for tracking
- Achievement unlock logic

---

#### Feature 9: Notifications System
**Priority:** P2 (Medium)  
**Status:** ❌ Not Started

**Requirements:**
- Browser push notifications:
  - Match starting soon (30 min before)
  - Lineup deadline reminders (1 hour before)
  - Match results and performance summary
  - Rank changes
  - Achievement unlocks
  - League invitations
- In-app notifications:
  - Badge counts
  - Notification center
  - Customizable preferences
- Email notifications (optional):
  - Weekly summary
  - Important announcements
  - League invitations

**Acceptance Criteria:**
- [ ] Push notifications work on all browsers
- [ ] Notification preferences save correctly
- [ ] Badge counts update in real-time
- [ ] Email notifications send correctly
- [ ] Users can opt-out of notifications

**Technical Implementation:**
- Firebase Cloud Messaging
- Cloud Functions for triggers
- Email service (SendGrid/Mailgun)
- Notification preferences storage

---

#### Feature 10: Admin Dashboard
**Priority:** P1 (High)  
**Status:** ❌ Not Started

**Requirements:**
- User management:
  - View all users
  - Search and filter
  - Ban/suspend users
  - View user activity
- Match management:
  - Add/edit matches
  - Manually adjust player points
  - Override match results
  - Add bonus points
  - Pause/resume calculations
- Content management:
  - Send broadcast notifications
  - Targeted messaging
  - Schedule messages
  - Update announcements
- Analytics dashboard:
  - User metrics (total, active, retention)
  - Match participation stats
  - Revenue tracking
  - System health monitoring
- Multi-admin system:
  - Role-based access control
  - Activity logs
  - Audit trails

**Acceptance Criteria:**
- [ ] Admins can view all users
- [ ] Admins can manage matches
- [ ] Admins can send notifications
- [ ] Analytics display correctly
- [ ] Role-based access works
- [ ] Activity logs track all actions

**Technical Implementation:**
- Separate admin interface
- Firestore security rules
- Admin role management
- Analytics integration

---

### 2.2 Features Out of Scope for MVP

The following features are planned for future phases:

#### Phase 2 Features (Post-MVP)
- Friend lists and friend requests
- Enhanced social sharing
- League chat functionality
- Public user profiles
- Video highlights integration

#### Phase 3 Features (3-6 months)
- Additional sports (Basketball, Volleyball)
- Sport-specific scoring rules
- Multi-sport dashboard
- Advanced analytics and insights

#### Phase 4 Features (6-9 months)
- Native mobile apps (iOS/Android)
- App Store presence
- Native push notifications
- Camera and GPS features

#### Phase 5 Features (12+ months)
- AI-powered lineup suggestions
- Live streaming partnerships
- International leagues (EPL, La Liga)
- Loyalty programs and sponsorships

---

## 3. Technical Requirements

### 3.1 Technology Stack

#### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **State Management:** TanStack React Query
- **Internationalization:** next-intl
- **UI Components:** Custom component library

#### Backend
- **Authentication:** Firebase Authentication
- **Database:** Cloud Firestore
- **Storage:** Firebase Storage
- **Functions:** Firebase Cloud Functions
- **Hosting:** Firebase Hosting / Vercel

#### External Services
- **Sports API:** API-FOOTBALL (RapidAPI)
- **Payment:** Stripe / PayPal
- **Email:** SendGrid / Mailgun
- **Analytics:** Firebase Analytics, Google Analytics
- **Monitoring:** Sentry, Firebase Performance

### 3.2 Performance Requirements

- **Page Load Time:** <2 seconds on 4G
- **API Response Time:** <500ms
- **Real-time Updates:** 2-3 minute intervals during matches
- **Uptime:** 99.9% availability
- **Concurrent Users:** Support 10,000+ concurrent users
- **Animation Frame Rate:** Consistent 60fps

### 3.3 Security Requirements

- **Authentication:** Secure password requirements (8+ chars, mixed case, numbers)
- **Data Protection:** Firestore security rules, encrypted storage
- **Payment Security:** PCI DSS compliance via Stripe/PayPal
- **API Security:** Rate limiting, API key protection
- **User Privacy:** GDPR compliance, data export/deletion

### 3.4 Accessibility Requirements

- **WCAG 2.1 AA Compliance**
- **Keyboard Navigation:** Full keyboard support
- **Screen Reader Support:** ARIA labels and semantic HTML
- **Color Contrast:** Minimum 4.5:1 ratio
- **Text Scaling:** Support up to 200% zoom
- **Focus Indicators:** Clear focus states

---

## 4. Bilingual & RTL Requirements

### 4.1 Language Support

#### Supported Languages
- **Arabic (ar):** Primary language, full RTL support
- **English (en):** Secondary language, LTR layout

#### Language Switcher
- **Location:** Top right corner of navigation
- **Design:** Toggle button or dropdown
- **Behavior:** Instant UI update without page reload
- **Persistence:** Save preference to user profile

### 4.2 RTL Implementation

#### Layout Transformation
- **Complete mirroring:** All UI elements flip for Arabic
- **Logical properties:** Use CSS logical properties (margin-inline-start, etc.)
- **Icon handling:** Some icons don't flip (arrows, chevrons)
- **Text alignment:** Right-aligned for Arabic, left-aligned for English

#### Typography
- **Arabic Font:** Cairo (primary), Tajawal (alternative), Noto Sans Arabic (fallback)
- **Font Sizing:** 5% larger for Arabic text
- **Line Height:** 1.6 for Arabic (vs 1.5 for English)
- **Number Display:** Western Arabic numerals (1, 2, 3) for scores and stats

### 4.3 Content Translation

#### Translation Coverage
- All interface labels and buttons
- Match descriptions and notifications
- Player and team names (bilingual display)
- Rules, FAQs, and help documentation
- Error messages and confirmations
- Admin dashboard

#### Translation Management
- JSON translation files per language
- Translation keys for all text
- Easy addition of new languages
- Professional translation review

---

## 5. Design Requirements

### 5.1 Design Principles

1. **Simplicity First:** Minimal steps to accomplish tasks
2. **Speed & Performance:** Fast page loads, smooth animations
3. **Mobile-First:** Design for mobile, enhance for desktop
4. **Accessibility:** Readable for all ages, WCAG 2.1 AA compliant
5. **Cultural Sensitivity:** Respect Saudi cultural preferences
6. **Gamification:** Make every interaction rewarding

### 5.2 Visual Identity

#### Color Palette
- **Primary:** Saudi Green (#00A651)
- **Secondary:** Gold (#FFD700) for highlights
- **Accent:** Blue (#0066CC), Red (#DC3545), Orange (#FF6B35)
- **Neutral:** Grays for backgrounds and text
- **Semantic:** Success (green), Warning (yellow), Danger (red), Info (blue)

#### Typography
- **English:** Inter font family
- **Arabic:** Cairo font family
- **Numbers:** Roboto Mono for statistics

#### Spacing & Layout
- **Spacing Scale:** 4px base unit
- **Border Radius:** 4px (small), 8px (medium), 12px (large)
- **Shadows:** Elevation-based shadow system
- **Breakpoints:** Mobile (<640px), Tablet (640-1024px), Desktop (>1024px)

### 5.3 Component Design

#### Key Components
- **Buttons:** Primary, secondary, danger, ghost variants
- **Cards:** Match cards, player cards, leaderboard cards
- **Forms:** Text inputs, dropdowns, checkboxes, radio buttons
- **Modals:** Confirmation dialogs, information modals
- **Navigation:** Top nav (desktop), bottom nav (mobile)
- **Notifications:** Toast messages, push notifications

---

## 6. Data Requirements

### 6.1 Data Models

Based on `data-models.md`, the following entities are required:

#### Core Entities
- **User:** Profile, preferences, statistics
- **Match:** Teams, date, venue, status
- **Player:** Name, team, position, stats
- **Lineup:** User's selected players, formation, captain
- **League:** Name, members, settings, rankings
- **Achievement:** Name, description, unlock criteria
- **Notification:** Type, content, recipient, status
- **CreditTransaction:** User, amount, type, timestamp

### 6.2 Data Sources

#### Primary Data Source
- **API-FOOTBALL:** Match data, player stats, live updates
- **Update Frequency:** Every 2-3 minutes during matches
- **Backup Strategy:** Cache data in Firestore, fallback to SportMonks API

#### User-Generated Data
- **Lineups:** Stored in Firestore
- **Leagues:** Stored in Firestore
- **Profiles:** Stored in Firestore
- **Transactions:** Stored in Firestore with audit trail

---

## 7. Integration Requirements

### 7.1 External API Integration

#### API-FOOTBALL Integration
- **Endpoints Required:**
  - Matches (fixtures)
  - Players (statistics)
  - Live events
  - Team information
- **Rate Limits:** 100 requests/day (MVP), 500 requests/day (production)
- **Error Handling:** Retry logic, fallback data

#### Payment Gateway Integration
- **Stripe Integration:**
  - Credit card payments
  - Webhook handling
  - Refund processing
- **PayPal Integration (optional):**
  - Alternative payment method
  - Regional preference

### 7.2 Firebase Integration

#### Services Required
- **Authentication:** Email/password, Google OAuth
- **Firestore:** Real-time database
- **Storage:** User avatars, media files
- **Cloud Functions:** Automated tasks, API calls
- **Hosting:** Static site hosting
- **Analytics:** User behavior tracking
- **Performance Monitoring:** Performance metrics

---

## 8. Testing Requirements

### 8.1 Testing Strategy

#### Unit Testing
- **Framework:** Jest
- **Coverage:** 80% minimum
- **Focus:** Utility functions, validation logic, calculations

#### Integration Testing
- **Framework:** React Testing Library
- **Focus:** Component interactions, API calls, state management

#### End-to-End Testing
- **Framework:** Playwright
- **Focus:** User flows, critical paths, cross-browser compatibility

#### Performance Testing
- **Tools:** Lighthouse, Web Vitals
- **Metrics:** Page load time, FCP, LCP, CLS, FID

### 8.2 Test Cases

#### Critical User Flows
1. **Registration Flow:** Email signup → Profile creation → First login
2. **Match Selection Flow:** Browse matches → Select match → View details
3. **Lineup Creation Flow:** Select players → Set captain → Submit lineup
4. **Points Calculation Flow:** Match starts → Points update → Final calculation
5. **Leaderboard Flow:** View rankings → Search user → Compare with friends
6. **League Flow:** Create league → Invite friends → View league leaderboard

---

## 9. Deployment Requirements

### 9.1 Deployment Strategy

#### Environments
- **Development:** Local development server
- **Staging:** Firebase Hosting staging environment
- **Production:** Firebase Hosting / Vercel production

#### CI/CD Pipeline
- **Source Control:** Git (GitHub)
- **CI/CD:** GitHub Actions / Vercel automatic deployments
- **Build Process:** Automated builds on push to main
- **Testing:** Automated tests before deployment
- **Deployment:** Automatic deployment to staging, manual to production

### 9.2 Monitoring & Analytics

#### Monitoring Tools
- **Firebase Analytics:** User behavior, engagement metrics
- **Sentry:** Error tracking and reporting
- **Firebase Performance:** Performance monitoring
- **Google Analytics:** Traffic analysis

#### Key Metrics to Track
- **User Metrics:** DAU, MAU, retention rates
- **Engagement Metrics:** Session duration, matches played, lineup submissions
- **Performance Metrics:** Page load time, API response time, error rate
- **Business Metrics:** Credit purchases, conversion rate, ARPU

---

## 10. Documentation Requirements

### 10.1 Technical Documentation

#### Required Documentation
- **Architecture Overview:** System design, data flow
- **API Documentation:** Endpoints, request/response formats
- **Database Schema:** Collections, fields, relationships
- **Deployment Guide:** Setup instructions, environment variables
- **Security Guidelines:** Best practices, security rules

### 10.2 User Documentation

#### Required Documentation
- **User Guide:** How to play, features explanation (bilingual)
- **Admin Manual:** Admin dashboard usage, management tasks
- **FAQs:** Common questions and answers (bilingual)
- **Rules & Scoring:** Gameplay rules, scoring system (bilingual)

---

## 11. Success Criteria

### 11.1 Milestone 1 Success Criteria

This milestone is considered complete when:

- [x] All client requirements reviewed and documented
- [ ] MVP features defined with priorities
- [ ] User flow diagrams created for all primary journeys
- [ ] Wireframes created for all key pages (desktop & mobile)
- [ ] Bilingual and RTL requirements documented
- [ ] Project specification document completed
- [ ] Client approval obtained

### 11.2 Overall Project Success Criteria

The MVP is considered successful when:

- **User Acquisition:** 10,000+ registered users in first 3 months
- **Engagement:** 60%+ weekly active users
- **Retention:** 40%+ Day-30 retention
- **Performance:** <2s average page load time
- **Uptime:** 99.9%+ availability
- **Monetization:** 5%+ credit purchase conversion rate
- **User Satisfaction:** 4.5+ star rating (if applicable)

---

## 12. Risks & Mitigation

### 12.1 Technical Risks

#### Risk 1: API Rate Limits
- **Impact:** High
- **Probability:** Medium
- **Mitigation:** Implement caching, use backup API, optimize API calls

#### Risk 2: Real-time Performance
- **Impact:** High
- **Probability:** Medium
- **Mitigation:** Optimize Firestore queries, implement pagination, use indexes

#### Risk 3: Scalability Issues
- **Impact:** High
- **Probability:** Low
- **Mitigation:** Load testing, Firebase scaling, CDN implementation

### 12.2 Business Risks

#### Risk 1: Low User Adoption
- **Impact:** High
- **Probability:** Medium
- **Mitigation:** Marketing campaign, referral program, social media presence

#### Risk 2: Poor Monetization
- **Impact:** Medium
- **Probability:** Medium
- **Mitigation:** A/B testing pricing, value-added features, user feedback

#### Risk 3: Competition
- **Impact:** Medium
- **Probability:** High
- **Mitigation:** Unique features, better UX, Saudi-focused approach

---

## 13. Timeline & Milestones

### 13.1 Overall Timeline

**Total Duration:** 25 days (5 milestones × 5 days)

1. **Milestone 1 (Days 1-5):** Requirements & Wireframing ← **Current**
2. **Milestone 2 (Days 6-10):** UI/UX Design
3. **Milestone 3 (Days 11-15):** Frontend Development
4. **Milestone 4 (Days 16-20):** Backend Development & API Integration
5. **Milestone 5 (Days 21-25):** Testing, QA & Deployment

### 13.2 Milestone 1 Detailed Timeline

**Day 1-2:** Requirements gathering and analysis
- Review existing documentation
- Analyze current codebase
- Define MVP features
- Prioritize features

**Day 3:** User flow diagrams
- Create registration flow
- Create match selection flow
- Create lineup creation flow
- Create leaderboard flow

**Day 4:** Wireframe creation
- Homepage wireframes (desktop & mobile)
- Match selection wireframes
- Lineup builder wireframes
- Leaderboard wireframes

**Day 5:** Documentation and approval
- Compile project specification
- Review with stakeholders
- Get client approval
- Prepare for Milestone 2

---

## 14. Next Steps

Upon completion of Milestone 1:

1. **Client Review:** Present all deliverables to client
2. **Feedback Incorporation:** Address any client feedback
3. **Approval:** Obtain written approval to proceed
4. **Milestone 2 Kickoff:** Begin UI/UX design phase
5. **Design System Creation:** Develop comprehensive design system
6. **High-Fidelity Mockups:** Create detailed visual designs

---

## Appendices

### Appendix A: Glossary

- **MVP:** Minimum Viable Product
- **RTL:** Right-to-Left (text direction)
- **LTR:** Left-to-Right (text direction)
- **DAU:** Daily Active Users
- **MAU:** Monthly Active Users
- **ARPU:** Average Revenue Per User
- **WCAG:** Web Content Accessibility Guidelines
- **PWA:** Progressive Web App

### Appendix B: References

- [spec.md](./spec.md) - Complete product specification
- [data-models.md](./data-models.md) - TypeScript data models
- [gameplay-rules.md](./gameplay-rules.md) - Scoring and gameplay rules
- [ui-ux-guidelines.md](./ui-ux-guidelines.md) - Design system and UX guidelines

### Appendix C: Contact Information

- **Project Manager:** [To be assigned]
- **Technical Lead:** [To be assigned]
- **Design Lead:** [To be assigned]
- **Client Contact:** [To be provided]

---

**Document Version:** 1.0  
**Last Updated:** November 23, 2025  
**Status:** Draft - Pending Client Approval
