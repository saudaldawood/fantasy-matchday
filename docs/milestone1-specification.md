# Project Specification Document
## Fantasy Matchday - Milestone 1 Deliverable

**Project:** Fantasy Matchday - Saudi Pro League Fantasy Football Platform  
**Client:** [Client Name]  
**Milestone:** 1 of 5 - Requirements Gathering & Wireframing  
**Document Type:** Project Specification (Final)  
**Date:** November 23, 2025  
**Version:** 1.0  
**Status:** Ready for Client Approval

---

## Executive Summary

Fantasy Matchday is a next-generation fantasy football platform designed specifically for Saudi Pro League fans. Unlike traditional season-long fantasy games, our platform offers match-based gameplay that allows users to participate in individual matches, earn points based on real-world player performance, and compete through global and private leaderboards.

### Project Vision
To become the premier fantasy sports platform in Saudi Arabia by delivering:
- **Engaging match-based gameplay** for quick, accessible experiences
- **Full bilingual support** (Arabic primary, English secondary) with RTL implementation
- **Real-time scoring** with live updates and instant feedback
- **Social competition** through private leagues and achievements
- **Scalable architecture** ready for future expansion to mobile apps and additional sports

### Key Differentiators
1. **Match-Based vs Season-Long:** Lower commitment, higher engagement
2. **Saudi-Focused:** Tailored for Saudi Pro League with cultural sensitivity
3. **Bilingual by Design:** Not an afterthought, built from ground up
4. **Real-Time Experience:** Live updates every 2-3 minutes during matches
5. **Gamification:** Credits, power-ups, achievements, and levels

---

## 1. Project Scope

### 1.1 In-Scope for MVP

#### Core Features
- ✅ User authentication (email/password, Google OAuth)
- ✅ User profiles with customization
- ✅ Match selection and discovery
- ✅ Lineup builder (drag-drop desktop, position selection mobile)
- ✅ Real-time points calculation and updates
- ✅ Global and league leaderboards
- ✅ Private league creation and management
- ✅ Credits system with earning and spending
- ✅ Power-ups (Captain Boost, Triple Captain, Bench Boost, Wild Card)
- ✅ Achievements and gamification
- ✅ Notifications (push, in-app, email)
- ✅ Admin dashboard with full management tools
- ✅ Bilingual support (Arabic + English) with RTL
- ✅ Responsive design (mobile, tablet, desktop)

#### Technical Infrastructure
- ✅ Next.js 14 frontend with TypeScript
- ✅ Firebase backend (Auth, Firestore, Functions, Storage)
- ✅ API-FOOTBALL integration for match data
- ✅ Payment gateway (Stripe/PayPal) for credit purchases
- ✅ Real-time data synchronization
- ✅ Progressive Web App (PWA) capability

### 1.2 Out of Scope for MVP (Future Phases)

#### Phase 2 (Post-MVP, 1-2 months)
- Friend lists and friend requests
- Enhanced social sharing
- League chat functionality
- Public user profiles
- Video highlights integration

#### Phase 3 (3-6 months)
- Additional sports (Basketball, Volleyball)
- Sport-specific scoring rules
- Multi-sport dashboard
- Advanced analytics and insights

#### Phase 4 (6-9 months)
- Native mobile apps (iOS/Android)
- App Store presence
- Native push notifications
- Camera and GPS features

#### Phase 5 (12+ months)
- AI-powered lineup suggestions
- Live streaming partnerships
- International leagues (EPL, La Liga)
- Loyalty programs and sponsorships

---

## 2. Target Audience

### 2.1 Primary Users

**Demographics:**
- Age: 18-45 years old
- Location: Saudi Arabia (primary), GCC countries (secondary)
- Languages: Arabic (70%), English (30%)
- Device Usage: Mobile (70%), Desktop (30%)
- Football Interest: Saudi Pro League fans

**User Segments:**
1. **Casual Fans (40%):** Play occasionally, simple interface preference
2. **Passionate Fans (35%):** Play every match, detailed stats interest
3. **Social Players (15%):** League-focused, friend competition
4. **Competitive Players (10%):** Global rankings, optimization-focused

### 2.2 User Personas

#### Persona 1: Ahmed - The Casual Fan
- **Age:** 28
- **Occupation:** Marketing Manager
- **Team:** Al-Hilal supporter
- **Behavior:** Plays 2-3 matches per week, mobile-only
- **Goals:** Quick lineup creation, follow favorite team
- **Pain Points:** Complex interfaces, time-consuming setup
- **Needs:** Simple UI, fast lineup building, clear scoring

#### Persona 2: Khalid - The Passionate Fan
- **Age:** 22
- **Occupation:** University Student
- **Team:** Follows all SPL teams
- **Behavior:** Plays every match, joins multiple leagues
- **Goals:** Top rankings, detailed statistics
- **Pain Points:** Lack of analytics, limited league options
- **Needs:** Advanced stats, flexible leagues, power-ups

#### Persona 3: Fatima - The Social Player
- **Age:** 25
- **Occupation:** HR Specialist
- **Team:** Al-Nassr supporter
- **Behavior:** Creates leagues with friends and colleagues
- **Goals:** Beat friends, social interaction
- **Pain Points:** Difficult league setup, no social features
- **Needs:** Easy league creation, friend comparison, sharing

#### Persona 4: Omar - The Competitive Player
- **Age:** 32
- **Occupation:** Business Owner
- **Team:** Neutral, strategy-focused
- **Behavior:** Optimizes every lineup, uses all power-ups
- **Goals:** Global top 10, perfect lineups
- **Pain Points:** Limited strategic options, basic scoring
- **Needs:** Power-ups, detailed analytics, competitive features

---

## 3. Functional Requirements

### 3.1 User Authentication & Profiles

**Requirements:**
- FR-001: System shall support email/password registration
- FR-002: System shall support Google OAuth authentication
- FR-003: Users shall create profiles with display name, avatar, favorite team
- FR-004: Users shall select language preference (Arabic/English)
- FR-005: System shall display user statistics (points, rank, matches played)
- FR-006: Users shall reset passwords via email
- FR-007: System shall enforce password requirements (8+ chars, mixed case, numbers)

**Acceptance Criteria:**
- Registration completes in <2 minutes
- OAuth completes in <30 seconds
- Profile updates save instantly
- Password reset email arrives within 1 minute

### 3.2 Match Selection & Discovery

**Requirements:**
- FR-008: System shall display upcoming Saudi Pro League matches
- FR-009: Match cards shall show teams, date, time, venue, status
- FR-010: Users shall filter matches by date (today, week, month)
- FR-011: Users shall filter matches by team
- FR-012: System shall show lineup deadline countdown
- FR-013: System shall display number of submitted lineups per match
- FR-014: System shall update match schedules automatically 24 hours in advance

**Acceptance Criteria:**
- Matches load in <1 second
- Filters apply instantly
- Deadline countdown updates every minute
- Match status updates in real-time

### 3.3 Lineup Builder

**Requirements:**
- FR-015: Users shall select 11 starting players per match
- FR-016: Users shall select 4 bench players
- FR-017: Users shall select one captain (2x points multiplier)
- FR-018: System shall enforce formation rules (1 GK, 3-5 DEF, 3-5 MID, 1-3 FWD)
- FR-019: System shall enforce team limit (max 3 players per team)
- FR-020: Desktop users shall use drag-and-drop interface
- FR-021: Mobile users shall use position selection interface
- FR-022: System shall validate lineup before submission
- FR-023: System shall auto-save draft every 30 seconds
- FR-024: System shall lock lineup at match kickoff
- FR-025: Users shall view player stats (form, average points)

**Acceptance Criteria:**
- Drag-and-drop operates at 60fps
- Validation provides clear error messages
- Auto-save works reliably
- Lineup locks exactly at kickoff time
- Player stats display accurately

### 3.4 Real-Time Points & Scoring

**Requirements:**
- FR-026: System shall calculate points based on player position
- FR-027: System shall update points every 2-3 minutes during matches
- FR-028: System shall apply captain multiplier (2x or 3x with power-up)
- FR-029: System shall display points breakdown per player
- FR-030: System shall lock final points after match completion
- FR-031: System shall sync points to all users in real-time
- FR-032: System shall show notifications for goals/assists/cards

**Acceptance Criteria:**
- Points calculate correctly per scoring rules
- Updates occur every 2-3 minutes
- Captain multiplier applies correctly
- Breakdown shows all point components
- Final points lock within 5 minutes of match end

### 3.5 Leaderboards & Rankings

**Requirements:**
- FR-033: System shall display global leaderboard (all users)
- FR-034: System shall display league leaderboards (league members)
- FR-035: System shall display friends leaderboard
- FR-036: System shall update rankings every 5 minutes during matches
- FR-037: System shall highlight user's position
- FR-038: System shall show position changes (↑↓)
- FR-039: Users shall search for specific users
- FR-040: Users shall filter by time period (week, month, season)
- FR-041: System shall paginate large leaderboards

**Acceptance Criteria:**
- Leaderboards load in <1 second
- Rankings update every 5 minutes
- User position highlights correctly
- Search returns results instantly
- Pagination loads smoothly

### 3.6 Leagues & Social Competition

**Requirements:**
- FR-042: Users shall create private leagues
- FR-043: System shall generate unique invite codes
- FR-044: Users shall join leagues via invite code
- FR-045: Users shall search and join public leagues
- FR-046: League admins shall manage members (add/remove)
- FR-047: System shall support league types (standard, head-to-head, weekly, monthly)
- FR-048: System shall support league scopes (single match, weekly, monthly, season)
- FR-049: Users shall view league leaderboards
- FR-050: Users shall view friends' lineups after match starts

**Acceptance Criteria:**
- League creation completes in <1 minute
- Invite codes are unique and shareable
- Join process completes in <30 seconds
- League leaderboards update in real-time
- Friends' lineups visible after kickoff

### 3.7 Credits & Power-Ups

**Requirements:**
- FR-051: Users shall earn credits for activities (login, participation, rankings)
- FR-052: Users shall spend credits on power-ups
- FR-053: Users shall purchase credits with real money
- FR-054: System shall support 4 power-ups (Captain Boost, Triple Captain, Bench Boost, Wild Card)
- FR-055: System shall enforce power-up usage limits
- FR-056: System shall apply power-ups to lineups correctly
- FR-057: System shall track credit transaction history

**Acceptance Criteria:**
- Credits earn automatically for activities
- Power-ups apply correctly to lineups
- Usage limits enforce properly
- Payments process securely
- Transaction history displays accurately

### 3.8 Achievements & Gamification

**Requirements:**
- FR-058: System shall track user achievements
- FR-059: System shall award badges for achievements
- FR-060: System shall implement level-up system
- FR-061: System shall track streaks (daily login, winning weeks)
- FR-062: System shall unlock profile customizations
- FR-063: System shall display celebration animations

**Acceptance Criteria:**
- Achievements unlock correctly
- Badges display on profile
- Level-up system works accurately
- Streaks track reliably
- Animations play smoothly

### 3.9 Notifications

**Requirements:**
- FR-064: System shall send push notifications (browser)
- FR-065: System shall send in-app notifications
- FR-066: System shall send email notifications (optional)
- FR-067: Users shall customize notification preferences
- FR-068: System shall send match starting notifications (30 min before)
- FR-069: System shall send deadline reminders (1 hour before)
- FR-070: System shall send match result notifications
- FR-071: System shall send rank change notifications
- FR-072: System shall send achievement unlock notifications

**Acceptance Criteria:**
- Notifications send instantly
- Preferences save correctly
- Notifications respect user settings
- Badge counts update in real-time
- Email notifications deliver within 1 minute

### 3.10 Admin Dashboard

**Requirements:**
- FR-073: Admins shall view all users
- FR-074: Admins shall search and filter users
- FR-075: Admins shall ban/suspend users
- FR-076: Admins shall add/edit matches
- FR-077: Admins shall manually adjust player points
- FR-078: Admins shall send broadcast notifications
- FR-079: Admins shall view analytics dashboard
- FR-080: System shall implement role-based access control
- FR-081: System shall log all admin actions

**Acceptance Criteria:**
- Admin dashboard loads in <2 seconds
- User management tools work correctly
- Match management updates in real-time
- Notifications send to targeted users
- Analytics display accurately
- Activity logs track all actions

---

## 4. Non-Functional Requirements

### 4.1 Performance

- NFR-001: Page load time shall be <2 seconds on 4G
- NFR-002: API response time shall be <500ms
- NFR-003: Real-time updates shall occur every 2-3 minutes
- NFR-004: System shall support 10,000+ concurrent users
- NFR-005: Animations shall run at 60fps
- NFR-006: Database queries shall complete in <100ms

### 4.2 Security

- NFR-007: System shall use HTTPS for all connections
- NFR-008: System shall enforce password requirements
- NFR-009: System shall implement Firestore security rules
- NFR-010: System shall protect API keys
- NFR-011: System shall implement rate limiting
- NFR-012: System shall comply with PCI DSS for payments
- NFR-013: System shall implement CSRF protection

### 4.3 Reliability

- NFR-014: System uptime shall be 99.9%
- NFR-015: System shall handle API failures gracefully
- NFR-016: System shall implement data backup (daily)
- NFR-017: System shall recover from errors automatically
- NFR-018: System shall log all errors to Sentry

### 4.4 Scalability

- NFR-019: System shall scale to 100,000 users
- NFR-020: Database shall support 1M+ documents
- NFR-021: System shall implement CDN for static assets
- NFR-022: System shall use database indexing for queries
- NFR-023: System shall implement pagination for large datasets

### 4.5 Usability

- NFR-024: System shall be mobile-first
- NFR-025: System shall support touch gestures
- NFR-026: System shall provide clear error messages
- NFR-027: System shall implement loading states
- NFR-028: System shall support keyboard navigation
- NFR-029: System shall comply with WCAG 2.1 AA

### 4.6 Internationalization

- NFR-030: System shall support Arabic and English
- NFR-031: System shall implement RTL layout for Arabic
- NFR-032: System shall use proper Arabic typography
- NFR-033: System shall allow language switching without reload
- NFR-034: System shall save language preference to profile

---

## 5. Technical Architecture

### 5.1 Technology Stack

#### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **State Management:** TanStack React Query
- **Internationalization:** next-intl
- **UI Components:** Custom component library
- **Drag-and-Drop:** React DnD
- **Charts:** Recharts

#### Backend
- **Authentication:** Firebase Authentication
- **Database:** Cloud Firestore
- **Storage:** Firebase Storage
- **Functions:** Firebase Cloud Functions
- **Hosting:** Firebase Hosting / Vercel
- **Analytics:** Firebase Analytics

#### External Services
- **Sports API:** API-FOOTBALL (RapidAPI)
- **Payment:** Stripe / PayPal
- **Email:** SendGrid / Mailgun
- **Monitoring:** Sentry
- **Performance:** Firebase Performance Monitoring

### 5.2 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Desktop    │  │    Tablet    │  │    Mobile    │      │
│  │   Browser    │  │   Browser    │  │   Browser    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Application                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  App Router │ React Components │ TanStack Query     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Services                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │Firestore │  │ Storage  │  │Functions │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    External APIs                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ API-FOOTBALL │  │    Stripe    │  │   SendGrid   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Data Flow

#### Match Data Flow
```
API-FOOTBALL → Cloud Functions (every 2-3 min) → Firestore → Real-time Sync → Client
```

#### Points Calculation Flow
```
Match Events → Cloud Function → Calculate Points → Update Firestore → Sync to Users
```

#### User Action Flow
```
User Action → Next.js → Firebase Auth/Firestore → Real-time Update → All Clients
```

---

## 6. Data Models

### 6.1 Core Entities

Based on `data-models.md`, the system includes:

- **User:** Profile, preferences, statistics
- **Match:** Teams, date, venue, status
- **Player:** Name, team, position, stats
- **Lineup:** User's selected players, formation, captain
- **League:** Name, members, settings, rankings
- **Achievement:** Name, description, unlock criteria
- **Notification:** Type, content, recipient, status
- **CreditTransaction:** User, amount, type, timestamp

### 6.2 Relationships

```
User ──┬── has many ──→ Lineups
       ├── has many ──→ LeagueMemberships
       ├── has many ──→ Achievements
       ├── has many ──→ Notifications
       └── has many ──→ CreditTransactions

Match ──── has many ──→ Lineups
      └─── has many ──→ Players

League ──── has many ──→ LeagueMemberships
       └─── has one ───→ User (admin)

Lineup ──── belongs to ──→ User
       ├─── belongs to ──→ Match
       └─── has many ───→ LineupEntries

LineupEntry ──── belongs to ──→ Player
```

---

## 7. User Interface Design

### 7.1 Design System

#### Color Palette
- **Primary:** #00A651 (Saudi Green)
- **Secondary:** #FFD700 (Gold)
- **Accent:** Blue (#0066CC), Red (#DC3545), Orange (#FF6B35)
- **Neutral:** Grays for backgrounds and text
- **Semantic:** Success, Warning, Danger, Info colors

#### Typography
- **English:** Inter font family
- **Arabic:** Cairo font family
- **Numbers:** Roboto Mono for statistics
- **Sizes:** H1 (40px), H2 (32px), H3 (24px), Body (16px)

#### Spacing
- **Base Unit:** 4px
- **Scale:** 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px

#### Components
- Buttons (Primary, Secondary, Danger, Ghost)
- Cards (Match, Player, Leaderboard)
- Forms (Inputs, Dropdowns, Checkboxes)
- Modals (Confirmation, Information)
- Navigation (Top nav, Bottom nav)

### 7.2 Responsive Design

#### Breakpoints
- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

#### Layout Strategy
- Mobile-first approach
- Touch-optimized controls
- Adaptive layouts
- Progressive enhancement

---

## 8. Testing Strategy

### 8.1 Testing Types

#### Unit Testing
- **Framework:** Jest
- **Coverage:** 80% minimum
- **Focus:** Utility functions, validation, calculations

#### Integration Testing
- **Framework:** React Testing Library
- **Focus:** Component interactions, API calls

#### End-to-End Testing
- **Framework:** Playwright
- **Focus:** User flows, critical paths

#### Performance Testing
- **Tools:** Lighthouse, Web Vitals
- **Metrics:** Load time, FCP, LCP, CLS, FID

### 8.2 Test Coverage

- ✅ User registration and login
- ✅ Match selection and filtering
- ✅ Lineup creation and validation
- ✅ Points calculation accuracy
- ✅ Leaderboard ranking logic
- ✅ League creation and joining
- ✅ Power-up application
- ✅ Credit transactions
- ✅ Notification delivery
- ✅ Admin dashboard functions

---

## 9. Deployment Plan

### 9.1 Environments

- **Development:** Local development server
- **Staging:** Firebase Hosting staging environment
- **Production:** Firebase Hosting / Vercel production

### 9.2 CI/CD Pipeline

```
Git Push → GitHub Actions → Run Tests → Build → Deploy to Staging → Manual Approval → Deploy to Production
```

### 9.3 Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Firebase security rules deployed
- [ ] Cloud Functions deployed
- [ ] Database indexes created
- [ ] API keys secured
- [ ] Monitoring enabled
- [ ] Backup configured

---

## 10. Success Metrics

### 10.1 User Metrics

- **User Acquisition:** 10,000 users in first 3 months
- **Daily Active Users (DAU):** 60% of registered users
- **Monthly Active Users (MAU):** 80% of registered users
- **Retention:** 40% Day-30 retention

### 10.2 Engagement Metrics

- **Average Session Duration:** 15+ minutes
- **Matches Played per User:** 3+ per week
- **League Participation:** 50%+ of users in at least one league
- **Power-Up Usage:** 20%+ of users use power-ups

### 10.3 Business Metrics

- **Credit Purchase Conversion:** 5%+ of users
- **Average Revenue Per User (ARPU):** $2+ per month
- **Customer Acquisition Cost (CAC):** <$5 per user
- **Lifetime Value (LTV):** >$24 per user

### 10.4 Technical Metrics

- **Page Load Time:** <2 seconds
- **API Response Time:** <500ms
- **Error Rate:** <0.1%
- **Uptime:** 99.9%

---

## 11. Timeline & Milestones

### 11.1 Overall Timeline

**Total Duration:** 25 days (5 milestones × 5 days)

### 11.2 Milestone Breakdown

#### ✅ Milestone 1 (Days 1-5): Requirements & Wireframing
- Requirements gathering and analysis
- MVP feature definition
- User flow diagrams
- Wireframes (desktop & mobile, bilingual)
- Project specification document
- **Status:** Complete

#### Milestone 2 (Days 6-10): UI/UX Design
- Design system creation
- High-fidelity mockups
- Component library design
- Bilingual design review
- Design approval

#### Milestone 3 (Days 11-15): Frontend Development
- Component implementation
- Page development
- State management
- Internationalization
- Responsive design

#### Milestone 4 (Days 16-20): Backend Development & API Integration
- Firebase setup
- Cloud Functions development
- API-FOOTBALL integration
- Payment gateway integration
- Real-time sync implementation

#### Milestone 5 (Days 21-25): Testing, QA & Deployment
- Unit and integration testing
- End-to-end testing
- Performance optimization
- Security audit
- Production deployment

---

## 12. Risks & Mitigation

### 12.1 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| API rate limits | High | Medium | Implement caching, use backup API |
| Real-time performance | High | Medium | Optimize queries, use indexes |
| Scalability issues | High | Low | Load testing, Firebase scaling |
| Payment integration | Medium | Low | Use established providers |

### 12.2 Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Low user adoption | High | Medium | Marketing campaign, referral program |
| Poor monetization | Medium | Medium | A/B testing, value-added features |
| Competition | Medium | High | Unique features, better UX |
| Regulatory changes | Low | Low | Legal consultation, compliance |

---

## 13. Deliverables

### 13.1 Milestone 1 Deliverables

- ✅ Requirements Document (`milestone1-requirements.md`)
- ✅ User Flow Diagrams (`milestone1-user-flows.md`)
- ✅ Wireframes (`milestone1-wireframes.md`)
- ✅ Project Specification Document (this document)
- ✅ Task Breakdown (`task.md`)

### 13.2 Final MVP Deliverables

- Fully functional web application
- Admin dashboard
- Technical documentation
- User documentation (bilingual)
- Design assets
- Source code repository
- Deployment guide

---

## 14. Approval & Sign-Off

### 14.1 Review Checklist

- [ ] All requirements reviewed and approved
- [ ] MVP features clearly defined
- [ ] User flows validated
- [ ] Wireframes approved (desktop & mobile)
- [ ] Bilingual requirements confirmed
- [ ] Technical architecture approved
- [ ] Timeline and budget confirmed
- [ ] Success metrics agreed upon

### 14.2 Stakeholder Approval

**Client Representative:**
- Name: ___________________________
- Signature: ________________________
- Date: ____________________________

**Project Manager:**
- Name: ___________________________
- Signature: ________________________
- Date: ____________________________

**Technical Lead:**
- Name: ___________________________
- Signature: ________________________
- Date: ____________________________

---

## 15. Next Steps

Upon approval of this specification:

1. **Immediate Actions:**
   - Schedule Milestone 2 kickoff meeting
   - Assign design team
   - Set up design tools (Figma/Adobe XD)
   - Prepare design system foundation

2. **Week 2 Goals:**
   - Complete design system
   - Create high-fidelity mockups
   - Component library design
   - Design review and approval

3. **Ongoing:**
   - Weekly stakeholder updates
   - Bi-weekly demos
   - Continuous feedback incorporation
   - Risk monitoring and mitigation

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
- **SPL:** Saudi Pro League

### Appendix B: References

- [spec.md](./spec.md) - Complete product specification
- [data-models.md](./data-models.md) - TypeScript data models
- [gameplay-rules.md](./gameplay-rules.md) - Scoring and gameplay rules
- [ui-ux-guidelines.md](./ui-ux-guidelines.md) - Design system and UX guidelines
- [milestone1-requirements.md](./milestone1-requirements.md) - Detailed requirements
- [milestone1-user-flows.md](./milestone1-user-flows.md) - User flow diagrams
- [milestone1-wireframes.md](./milestone1-wireframes.md) - Wireframes documentation

### Appendix C: Contact Information

**Project Team:**
- Project Manager: [To be assigned]
- Technical Lead: [To be assigned]
- Design Lead: [To be assigned]
- QA Lead: [To be assigned]

**Client:**
- Primary Contact: [To be provided]
- Email: [To be provided]
- Phone: [To be provided]

---

**Document End**

---

**Document Version:** 1.0  
**Last Updated:** November 23, 2025  
**Status:** Ready for Client Approval  
**Next Review:** Upon client feedback
