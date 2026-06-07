# Fantasy Matchday - UI/UX Design Guidelines

This document outlines the design principles, visual style, layout guidelines, and user experience patterns for Fantasy Matchday. All UI decisions should reference this document to ensure consistency across the platform.

---

## Design Philosophy

### Core Principles

1. **Simplicity First**: Users should accomplish tasks with minimal steps
2. **Speed & Performance**: Instant feedback, smooth animations, fast page loads
3. **Mobile-First**: Design for mobile, enhance for desktop
4. **Accessibility**: Readable for all ages, WCAG 2.1 AA compliant
5. **Cultural Sensitivity**: Respect Saudi cultural preferences, proper Arabic support
6. **Gamification**: Make every interaction rewarding and engaging

### User Experience Goals

- **Registration to First Match**: < 3 minutes
- **Build Lineup**: < 2 minutes for experienced users
- **Find Information**: < 2 clicks to any major feature
- **Page Load Time**: < 2 seconds on 4G
- **Animation Frame Rate**: Consistent 60fps

---

## Visual Identity

### Color Palette

**Primary Colors** (Saudi Pro League Theme)

```css
/* Primary Brand Colors */
--color-primary: #00A651;        /* Saudi Green */
--color-primary-dark: #008040;   /* Darker Green */
--color-primary-light: #33B86E;  /* Lighter Green */

/* Secondary Colors */
--color-secondary: #FFD700;      /* Gold (for highlights, achievements) */
--color-secondary-dark: #E6C200; /* Darker Gold */

/* Accent Colors */
--color-accent-blue: #0066CC;    /* For links, info */
--color-accent-red: #DC3545;     /* For errors, red cards */
--color-accent-orange: #FF6B35;  /* For warnings, alerts */
```

**Neutral Colors**

```css
/* Light Mode */
--color-background: #FFFFFF;
--color-surface: #F8F9FA;
--color-surface-hover: #E9ECEF;
--color-border: #DEE2E6;
--color-text-primary: #212529;
--color-text-secondary: #6C757D;
--color-text-tertiary: #ADB5BD;

/* Dark Mode */
--color-background-dark: #121212;
--color-surface-dark: #1E1E1E;
--color-surface-hover-dark: #2A2A2A;
--color-border-dark: #3A3A3A;
--color-text-primary-dark: #FFFFFF;
--color-text-secondary-dark: #B0B0B0;
--color-text-tertiary-dark: #808080;
```

**Semantic Colors**

```css
/* Status Colors */
--color-success: #28A745;    /* Goals, wins, positive actions */
--color-warning: #FFC107;    /* Yellow cards, warnings */
--color-danger: #DC3545;     /* Red cards, errors, negative */
--color-info: #17A2B8;       /* Information, neutral highlights */

/* Match Status Colors */
--color-match-scheduled: #6C757D;  /* Gray */
--color-match-live: #DC3545;       /* Red (pulsing) */
--color-match-halftime: #FFC107;   /* Yellow */
--color-match-completed: #28A745;  /* Green */
```

### Typography

**Font Families**

```css
/* English Text */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Arabic Text */
--font-arabic: 'Cairo', 'Tajawal', 'Noto Sans Arabic', sans-serif;

/* Numbers & Stats */
--font-numbers: 'Roboto Mono', 'SF Mono', monospace;
```

**Font Sizes**

```css
/* Headings */
--text-h1: 2.5rem;    /* 40px - Page titles */
--text-h2: 2rem;      /* 32px - Section headers */
--text-h3: 1.5rem;    /* 24px - Card headers */
--text-h4: 1.25rem;   /* 20px - Subsections */

/* Body Text */
--text-base: 1rem;    /* 16px - Default body text */
--text-sm: 0.875rem;  /* 14px - Secondary text */
--text-xs: 0.75rem;   /* 12px - Captions, labels */

/* Large Display */
--text-display: 3.5rem;  /* 56px - Hero numbers, scores */
--text-points: 2rem;     /* 32px - Points display */
```

**Font Weights**

```css
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

**Line Heights**

```css
--line-height-tight: 1.2;   /* Headings */
--line-height-normal: 1.5;  /* Body text */
--line-height-relaxed: 1.75; /* Long-form content */
```

### Spacing System

```css
/* Spacing Scale (based on 4px) */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

### Border Radius

```css
--radius-sm: 4px;    /* Small elements (badges, tags) */
--radius-md: 8px;    /* Cards, buttons */
--radius-lg: 12px;   /* Large cards, modals */
--radius-xl: 16px;   /* Hero sections */
--radius-full: 9999px; /* Pills, avatars */
```

### Shadows

```css
/* Elevation Shadows */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);

/* Colored Shadows (for emphasis) */
--shadow-primary: 0 4px 12px rgba(0, 166, 81, 0.3);
--shadow-gold: 0 4px 12px rgba(255, 215, 0, 0.4);
```

---

## Layout & Grid System

### Responsive Breakpoints

```css
/* Mobile First Approach */
--breakpoint-sm: 640px;   /* Small tablets */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Small laptops */
--breakpoint-xl: 1280px;  /* Desktops */
--breakpoint-2xl: 1536px; /* Large desktops */
```

### Container Widths

```css
/* Max widths for content containers */
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-full: 100%;
```

### Grid System

**Desktop Layout (3-column)**
```
┌─────────────────────────────────────────┐
│  Sidebar  │    Main Content   │  Aside  │
│  (240px)  │      (fluid)      │ (280px) │
└─────────────────────────────────────────┘
```

**Tablet Layout (2-column)**
```
┌───────────────────────────────┐
│    Main Content   │   Aside   │
│      (fluid)      │  (280px)  │
└───────────────────────────────┘
```

**Mobile Layout (1-column)**
```
┌─────────────────┐
│  Main Content   │
│     (100%)      │
└─────────────────┘
```

---

## Component Design Patterns

### Buttons

**Primary Button**
```css
.btn-primary {
  background: var(--color-primary);
  color: white;
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-semibold);
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-primary:active {
  transform: translateY(0);
}
```

**Button Sizes**
- Small: `padding: 8px 16px; font-size: 14px;`
- Medium (default): `padding: 12px 24px; font-size: 16px;`
- Large: `padding: 16px 32px; font-size: 18px;`

**Button Variants**
- Primary: Green background, white text
- Secondary: White background, green border, green text
- Danger: Red background, white text
- Ghost: Transparent background, colored text
- Icon: Square, icon only, no text

### Cards

**Match Card**
```
┌──────────────────────────────────┐
│  [Team Logo] vs [Team Logo]      │
│  Al-Hilal    vs    Al-Nassr      │
│                                   │
│  📍 King Fahd Stadium             │
│  🕐 Friday, 8:00 PM               │
│                                   │
│  [Select Match Button]            │
└──────────────────────────────────┘
```

**Design Specs:**
- Border radius: `var(--radius-lg)`
- Padding: `24px`
- Background: `var(--color-surface)`
- Border: `1px solid var(--color-border)`
- Hover: Lift effect with shadow
- Live matches: Pulsing red border

**Player Card**
```
┌──────────────────────┐
│   [Player Photo]     │
│                      │
│   Player Name        │
│   Team • Position    │
│                      │
│   Form: ● ● ● ○ ○   │
│   Avg: 8.5 pts       │
│                      │
│   [Select Button]    │
└──────────────────────┘
```

**Design Specs:**
- Aspect ratio: 3:4
- Border radius: `var(--radius-md)`
- Selected state: Green border, checkmark overlay
- Drag handle: Visible on hover (for lineup building)

**Leaderboard Card**
```
┌────────────────────────────────────┐
│  #1  [Avatar] Username      1,245  │
│  #2  [Avatar] Username      1,198  │
│  #3  [Avatar] Username      1,156  │
│  ... (you)                          │
│  #47 [Avatar] Your Name       892  │
│  ...                                │
└────────────────────────────────────┘
```

**Design Specs:**
- Highlight user's row with subtle background
- Top 3 get gold/silver/bronze indicators
- Position changes shown with ↑↓ arrows
- Sticky header when scrolling

### Forms & Inputs

**Text Input**
```css
.input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 166, 81, 0.1);
}
```

**Form Layout**
- Label above input
- Error messages below input (red text)
- Helper text in gray, smaller font
- Required fields marked with asterisk

### Modals & Dialogs

**Modal Structure**
```
┌─────────────────────────────────┐
│  [X]                            │
│  Modal Title                    │
│  ─────────────────────────────  │
│                                 │
│  Modal Content                  │
│                                 │
│  ─────────────────────────────  │
│  [Cancel]          [Confirm]    │
└─────────────────────────────────┘
```

**Design Specs:**
- Max width: `600px` (desktop), `90vw` (mobile)
- Backdrop: Semi-transparent black (`rgba(0,0,0,0.5)`)
- Animation: Fade in + scale up
- Close on backdrop click or ESC key
- Trap focus within modal

### Navigation

**Top Navigation Bar**
```
┌─────────────────────────────────────────────────┐
│  [Logo]  Matches  Leagues  Profile  [EN/AR] 🔔 │
└─────────────────────────────────────────────────┘
```

**Design Specs:**
- Height: `64px`
- Sticky on scroll
- Background: White (light mode), Dark (dark mode)
- Border bottom: `1px solid var(--color-border)`
- Logo: 40px height
- Active link: Green underline

**Mobile Navigation (Bottom)**
```
┌─────────────────────────────────────────────────┐
│  🏠 Home  ⚽ Matches  🏆 Leagues  👤 Profile    │
└─────────────────────────────────────────────────┘
```

**Design Specs:**
- Height: `56px`
- Fixed at bottom on mobile
- Icons with labels
- Active state: Green icon + text

---

## Page-Specific Layouts

### Homepage

**Desktop Layout**
```
┌─────────────────────────────────────────────────┐
│  Navigation Bar                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  Hero Section                                   │
│  "Welcome back, [Name]!"                        │
│  Your Stats: 1,245 pts • Rank #47              │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  Upcoming Matches (Grid)                        │
│  [Match Card] [Match Card] [Match Card]        │
│  [Match Card] [Match Card] [Match Card]        │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  Your Leagues                                   │
│  [League Card] [League Card]                    │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Mobile Layout**
```
┌─────────────────┐
│  Navigation     │
├─────────────────┤
│  Hero Section   │
│  (Condensed)    │
├─────────────────┤
│  Quick Actions  │
│  [View Matches] │
│  [My Leagues]   │
├─────────────────┤
│  Live Matches   │
│  [Match Card]   │
│  [Match Card]   │
├─────────────────┤
│  Bottom Nav     │
└─────────────────┘
```

### Match Selection Page

**Filter Bar**
```
┌─────────────────────────────────────────────────┐
│  [All] [Today] [This Week] [Team Filter ▼]     │
└─────────────────────────────────────────────────┘
```

**Match Grid**
- Desktop: 3 columns
- Tablet: 2 columns
- Mobile: 1 column
- Sort by: Date (default), Popularity, Participation

### Lineup Builder Page

**Desktop Layout (Drag & Drop)**
```
┌─────────────────────────────────────────────────┐
│  Al-Hilal vs Al-Nassr • Deadline: 2h 15m       │
├─────────────────────────────────────────────────┤
│                                                 │
│  Player Pool (Left)     |    Pitch (Right)     │
│                         |                       │
│  [Search Players]       |      [FWD] [FWD]     │
│                         |                       │
│  [Player Card]          |  [MID] [MID] [MID]   │
│  [Player Card]          |                       │
│  [Player Card]          |  [DEF] [DEF] [DEF]   │
│  [Player Card]          |                       │
│  ...                    |        [GK]           │
│                         |                       │
│                         |  Bench: [P] [P] [P]  │
│                         |                       │
│                         |  [Submit Lineup]      │
└─────────────────────────────────────────────────┘
```

**Mobile Layout (Swipe)**
```
┌─────────────────┐
│  Match Info     │
│  Deadline: 2h   │
├─────────────────┤
│  Formation      │
│  [4-4-2 ▼]      │
├─────────────────┤
│  GK Position    │
│  [Player Card]  │
│  [Select ▼]     │
├─────────────────┤
│  DEF Position   │
│  [Player] [+]   │
│  [Player] [+]   │
│  [Player] [+]   │
│  [Player] [+]   │
├─────────────────┤
│  ... (scroll)   │
├─────────────────┤
│  [Submit]       │
└─────────────────┘
```

**Design Guidelines:**
- Visual feedback when dragging players
- Highlight valid drop zones
- Show formation constraints (e.g., "Need 1 more DEF")
- Captain badge: Gold star icon
- Bench players: Grayed out, smaller
- Auto-save draft every 30 seconds

### Leaderboard Page

**Tabs**
```
[Global] [Friends] [Leagues]
```

**Leaderboard Table**
```
┌────┬──────────────────┬────────┬────────┐
│ #  │ User             │ Points │ Change │
├────┼──────────────────┼────────┼────────┤
│ 1  │ [Avatar] User1   │ 1,245  │ ↑ 3    │
│ 2  │ [Avatar] User2   │ 1,198  │ ↓ 1    │
│ 3  │ [Avatar] User3   │ 1,156  │ -      │
│... │ ...              │ ...    │ ...    │
│ 47 │ [Avatar] You     │  892   │ ↑ 12   │
└────┴──────────────────┴────────┴────────┘
```

**Design Guidelines:**
- Sticky header row
- Highlight user's row (subtle green background)
- Top 3: Gold/silver/bronze medals
- Infinite scroll or pagination
- Search bar at top
- Filter by time period (week/month/season)

### Profile Page

**Layout**
```
┌─────────────────────────────────────────────────┐
│  [Avatar]  Username                             │
│            Level 12 • 1,245 Total Points        │
│                                                 │
│  [Edit Profile]                                 │
├─────────────────────────────────────────────────┤
│  Stats                                          │
│  ┌─────────┬─────────┬─────────┬─────────┐    │
│  │ Matches │ Avg Pts │  Rank   │ Credits │    │
│  │   47    │  8.5    │  #47    │  1,250  │    │
│  └─────────┴─────────┴─────────┴─────────┘    │
├─────────────────────────────────────────────────┤
│  Achievements (Grid)                            │
│  [Badge] [Badge] [Badge] [Badge]                │
│  [Badge] [Badge] [Locked] [Locked]              │
├─────────────────────────────────────────────────┤
│  Match History                                  │
│  [Match Card] [Match Card] [Match Card]         │
└─────────────────────────────────────────────────┘
```

### Admin Dashboard

**Sidebar Navigation**
```
┌─────────────────┐
│  Dashboard      │
│  Matches        │
│  Users          │
│  Leagues        │
│  Notifications  │
│  Analytics      │
│  Settings       │
└─────────────────┘
```

**Dashboard Overview**
```
┌─────────────────────────────────────────────────┐
│  Key Metrics (Cards)                            │
│  ┌──────────┬──────────┬──────────┬──────────┐ │
│  │ Total    │ Active   │ Matches  │ Revenue  │ │
│  │ Users    │ Users    │ Today    │ (Month)  │ │
│  │ 12,450   │ 3,892    │    8     │ $2,450   │ │
│  └──────────┴──────────┴──────────┴──────────┘ │
├─────────────────────────────────────────────────┤
│  Charts                                         │
│  [User Growth Chart]                            │
│  [Engagement Chart]                             │
├─────────────────────────────────────────────────┤
│  Recent Activity                                │
│  • User123 joined league "Friends League"       │
│  • Match "Al-Hilal vs Al-Nassr" started         │
│  • Admin adjusted points for Match #45          │
└─────────────────────────────────────────────────┘
```

**Design Guidelines:**
- Clean, data-focused layout
- Color-coded metrics (green for positive, red for negative)
- Charts: Line charts for trends, bar charts for comparisons
- Quick actions: Prominent buttons for common tasks
- Search everything: Global search bar
- Confirmation dialogs for destructive actions

---

## Bilingual & RTL Support

### Language Switcher

**Location**: Top right corner of navigation bar

**Design**:
```
[EN | AR]  or  [🌐 English ▼]
```

**Behavior**:
- One-click toggle between languages
- Saves preference to user profile
- Instant UI update (no page reload)
- Smooth transition animation

### RTL Layout Transformation

**English (LTR)**
```
┌─────────────────────────────────────┐
│  [Logo]  Menu  Menu  Menu  [Profile]│
└─────────────────────────────────────┘
```

**Arabic (RTL)**
```
┌─────────────────────────────────────┐
│[Profile]  Menu  Menu  Menu  [Logo]  │
└─────────────────────────────────────┘
```

**CSS Implementation**:
```css
/* Automatic RTL flipping */
[dir="rtl"] {
  direction: rtl;
}

/* Use logical properties */
.card {
  margin-inline-start: 16px; /* Left in LTR, Right in RTL */
  padding-inline: 24px;      /* Horizontal padding */
  border-inline-start: 2px solid green; /* Left border in LTR */
}

/* Icons that shouldn't flip */
.icon-no-flip {
  transform: scaleX(1) !important;
}
```

### Arabic Typography

**Font Selection**:
- Primary: Cairo (modern, clean)
- Alternative: Tajawal (traditional)
- Fallback: Noto Sans Arabic

**Font Sizes** (slightly larger for Arabic):
```css
[lang="ar"] {
  font-size: 1.05em; /* 5% larger */
  line-height: 1.6;  /* More line height */
}
```

**Number Display**:
- Use Western Arabic numerals (1, 2, 3) for scores and stats
- Use Eastern Arabic numerals (١, ٢, ٣) for dates (optional)
- Consistent across the platform

### Content Translation

**Player Names**:
- Display both English and Arabic names
- Primary language name shown larger
- Secondary language in parentheses or smaller text

**Dates & Times**:
- English: "Friday, Nov 17, 2025 • 8:00 PM"
- Arabic: "الجمعة، ١٧ نوفمبر ٢٠٢٥ • ٨:٠٠ مساءً"
- Option to show Hijri calendar dates

---

## Animations & Micro-Interactions

### Page Transitions

**Route Changes**:
```css
.page-enter {
  opacity: 0;
  transform: translateY(20px);
}

.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: all 0.3s ease-out;
}
```

### Button Interactions

**Hover Effect**:
- Lift: `transform: translateY(-2px)`
- Shadow increase: `box-shadow: var(--shadow-md)`
- Duration: `0.2s`

**Click Effect**:
- Scale down: `transform: scale(0.98)`
- Duration: `0.1s`

**Loading State**:
- Spinner inside button
- Button disabled with reduced opacity
- Text changes to "Loading..."

### Match Events

**Goal Scored** (affecting user's player):
```
┌─────────────────────────────┐
│  ⚽ GOAL!                    │
│  Ronaldo scored!            │
│  +4 points                  │
└─────────────────────────────┘
```

**Animation**:
- Slide in from top
- Confetti animation
- Green pulse effect
- Auto-dismiss after 3 seconds

**Rank Change**:
```
┌─────────────────────────────┐
│  🎉 You moved up!            │
│  Rank: #52 → #47            │
└─────────────────────────────┘
```

**Animation**:
- Number count-up animation
- Green highlight
- Subtle bounce effect

### Achievement Unlocked

**Modal**:
```
┌─────────────────────────────┐
│  🏆 Achievement Unlocked!   │
│                             │
│  [Large Badge Icon]         │
│                             │
│  First Steps                │
│  Participate in first match │
│                             │
│  +25 Credits Earned         │
│                             │
│  [Awesome!]                 │
└─────────────────────────────┘
```

**Animation**:
- Zoom in + rotate
- Confetti burst
- Sound effect (optional)
- Haptic feedback on mobile

### Loading States

**Skeleton Screens**:
```
┌─────────────────────────────┐
│  ▮▮▮▮▮▮▮▮                   │
│  ▮▮▮▮▮ ▮▮▮▮▮                │
│                             │
│  ▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮            │
│  ▮▮▮▮▮▮▮▮                   │
└─────────────────────────────┘
```

**Design**:
- Gray placeholder blocks
- Shimmer animation (left to right)
- Match actual content layout
- Show immediately (no delay)

**Progress Indicators**:
- Linear progress bar for file uploads
- Circular spinner for general loading
- Percentage display for long operations

### Live Match Indicator

**Pulsing Effect**:
```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
}

.match-live {
  animation: pulse 2s ease-in-out infinite;
  border-color: var(--color-danger);
}
```

**Live Badge**:
```
[🔴 LIVE]
```
- Red dot pulsing
- Red text
- Prominent placement

---

## Mobile-Specific UX

### Touch Interactions

**Tap Targets**:
- Minimum size: `44px × 44px` (Apple HIG)
- Spacing between targets: `8px` minimum
- Larger targets for primary actions

**Swipe Gestures**:
- Swipe left/right: Navigate between tabs
- Swipe down: Refresh content (pull-to-refresh)
- Swipe up: Reveal more details
- Long press: Show context menu

### Mobile Navigation

**Bottom Tab Bar** (Fixed):
```
┌─────────────────────────────────────┐
│  🏠      ⚽      🏆      👤         │
│  Home   Matches Leagues Profile    │
└─────────────────────────────────────┘
```

**Design**:
- Always visible (sticky)
- Active tab: Green icon + text
- Badge for notifications
- Smooth transitions

### Mobile Forms

**Input Optimization**:
- Large input fields (min 48px height)
- Proper keyboard types (`type="email"`, `type="tel"`)
- Auto-focus on first field
- Next/Done buttons on keyboard
- Inline validation (real-time feedback)

**Dropdown Alternatives**:
- Use native `<select>` for better mobile UX
- Or custom bottom sheet for complex selections

### Mobile Modals

**Bottom Sheet** (instead of centered modal):
```
┌─────────────────────────────────────┐
│  [Drag Handle]                      │
│  Modal Title                        │
│  ─────────────────────────────────  │
│  Content...                         │
│  ...                                │
│  [Action Button]                    │
└─────────────────────────────────────┘
```

**Behavior**:
- Slides up from bottom
- Drag to dismiss
- Backdrop tap to dismiss
- Smooth spring animation

### One-Thumb Operation

**Key Actions in Reach**:
- Primary buttons: Bottom 1/3 of screen
- Navigation: Bottom or top (within thumb reach)
- Avoid: Middle of large screens (hard to reach)

**Thumb Zone Heatmap**:
```
┌─────────────────┐
│  🟢 Easy        │  Green: Easy to reach
│  🟡 Stretch     │  Yellow: Requires stretch
│  🔴 Hard        │  Red: Hard to reach
│                 │
│      🔴🔴🔴      │
│    🟡🟡🟡🟡🟡    │
│  🟢🟢🟢🟢🟢🟢🟢  │
└─────────────────┘
```

---

## Gamification Elements

### Visual Feedback

**Success Actions**:
- Green checkmark animation
- Confetti burst
- Positive sound effect
- Haptic feedback (mobile)
- "+X Credits" floating text

**Progress Indicators**:
- Progress bars for achievements
- XP bars for leveling up
- Completion percentages
- Visual milestones

### Celebration Screens

**League Win**:
```
┌─────────────────────────────────────┐
│                                     │
│         🏆                          │
│    Congratulations!                 │
│                                     │
│  You won "Friends League"           │
│                                     │
│  +500 Credits                       │
│  🥇 League Champion Badge           │
│                                     │
│  [Share] [View League]              │
│                                     │
└─────────────────────────────────────┘
```

**Animation**:
- Trophy scales up
- Confetti animation
- Gold shimmer effect
- Celebration sound

### Streak Indicators

**Login Streak**:
```
🔥 7 Day Streak
```

**Design**:
- Fire emoji + number
- Progress bar to next milestone
- Streak count in large, bold text
- Warning if streak is about to break

### Leaderboard Animations

**Rank Change**:
- Smooth position transitions
- Number count-up/down
- Highlight row briefly
- Arrow indicators (↑↓)

**Climbing Animation**:
- User's row moves up smoothly
- Other rows shift down
- Green highlight trail

---

## Accessibility

### Color Contrast

**WCAG AA Compliance**:
- Normal text: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- UI components: 3:1 minimum

**Color Blindness**:
- Don't rely on color alone
- Use icons + text labels
- Patterns for different states

### Keyboard Navigation

**Tab Order**:
- Logical flow (top to bottom, left to right)
- Skip links for main content
- Focus visible on all interactive elements

**Focus Indicators**:
```css
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### Screen Reader Support

**Semantic HTML**:
- Use proper heading hierarchy (`<h1>` to `<h6>`)
- Landmark regions (`<nav>`, `<main>`, `<aside>`)
- Button vs. link (use correctly)

**ARIA Labels**:
```html
<button aria-label="Close modal">
  <XIcon />
</button>

<div role="status" aria-live="polite">
  Points updated: 1,245
</div>
```

### Font Sizes

**Minimum Sizes**:
- Body text: 16px (1rem)
- Small text: 14px minimum
- Touch targets: 44px minimum

**Zoom Support**:
- Support up to 200% zoom
- No horizontal scrolling at 200% zoom
- Text doesn't overflow containers

---

## Dark Mode

### Color Adjustments

**Background Colors**:
- Background: `#121212` (pure black causes eye strain)
- Surface: `#1E1E1E`
- Elevated surface: `#2A2A2A`

**Text Colors**:
- Primary: `#FFFFFF` (high emphasis)
- Secondary: `#B0B0B0` (medium emphasis)
- Tertiary: `#808080` (low emphasis)

**Accent Colors**:
- Slightly desaturated in dark mode
- Maintain contrast ratios
- Avoid pure white on pure black

### Images & Media

**Adjustments**:
```css
@media (prefers-color-scheme: dark) {
  img {
    opacity: 0.9; /* Slightly dimmed */
  }
  
  .logo {
    filter: brightness(0.8);
  }
}
```

### Toggle Implementation

**Location**: Settings or navigation bar

**Design**:
```
☀️ Light  |  🌙 Dark  |  🖥️ System
```

**Behavior**:
- Instant toggle (no page reload)
- Smooth transition (0.3s)
- Save preference to user profile
- Respect system preference by default

---

## Performance Optimization

### Image Optimization

**Formats**:
- WebP with JPEG fallback
- SVG for icons and logos
- Lazy loading for below-fold images

**Sizes**:
- Responsive images with `srcset`
- Appropriate dimensions (don't load 4K for thumbnails)
- Compressed (80-85% quality)

### Code Splitting

**Route-Based**:
- Load only code for current page
- Prefetch next likely routes
- Lazy load heavy components

### Caching Strategy

**Static Assets**:
- Cache-Control: `max-age=31536000` (1 year)
- Versioned filenames (cache busting)

**API Responses**:
- Cache frequently accessed data
- Stale-while-revalidate for live data
- Optimistic UI updates

---

## Error States

### Error Messages

**Design**:
```
┌─────────────────────────────────────┐
│  ⚠️ Oops! Something went wrong      │
│                                     │
│  We couldn't load the match data.  │
│  Please try again.                  │
│                                     │
│  [Try Again]                        │
└─────────────────────────────────────┘
```

**Guidelines**:
- Clear, friendly language
- Explain what happened
- Provide actionable solution
- Avoid technical jargon
- Include error code for support

### Empty States

**No Matches**:
```
┌─────────────────────────────────────┐
│         ⚽                           │
│  No matches available               │
│                                     │
│  Check back soon for upcoming       │
│  matches!                           │
└─────────────────────────────────────┘
```

**Design**:
- Relevant illustration/icon
- Helpful message
- Suggest next action
- Not just "No data"

### Offline State

**Banner**:
```
┌─────────────────────────────────────┐
│  📡 You're offline                  │
│  Some features may not work         │
└─────────────────────────────────────┘
```

**Behavior**:
- Show cached data
- Queue actions for when online
- Clear indicator of offline state
- Auto-sync when reconnected

---

## Summary

This UI/UX guideline covers:

1. **Visual Identity**: Colors, typography, spacing, shadows
2. **Layout System**: Responsive breakpoints, grid system
3. **Component Patterns**: Buttons, cards, forms, modals, navigation
4. **Page Layouts**: Homepage, lineup builder, leaderboards, admin
5. **Bilingual Support**: Language switcher, RTL layout, Arabic typography
6. **Animations**: Transitions, micro-interactions, celebrations
7. **Mobile UX**: Touch interactions, gestures, one-thumb operation
8. **Gamification**: Visual feedback, celebrations, streaks
9. **Accessibility**: Contrast, keyboard nav, screen readers
10. **Dark Mode**: Color adjustments, toggle implementation
11. **Performance**: Image optimization, code splitting, caching
12. **Error Handling**: Error messages, empty states, offline state

All design decisions should reference these guidelines to maintain consistency and deliver an exceptional user experience.

---

*These guidelines are living documents and should be updated as the platform evolves and user feedback is incorporated.*

