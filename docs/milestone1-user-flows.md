# User Flow Diagrams
## Fantasy Matchday - Primary User Journeys

**Project:** Fantasy Matchday  
**Milestone:** 1 - Requirements Gathering & Wireframing  
**Document:** User Flow Diagrams  
**Date:** November 23, 2025

---

## Overview

This document outlines all primary user journeys for Fantasy Matchday, including registration, match selection, lineup creation, leaderboard viewing, and league management. Each flow is designed to be simple, intuitive, and optimized for both mobile and desktop experiences.

---

## 1. Registration & Onboarding Flow

### 1.1 New User Registration (Email/Password)

```mermaid
flowchart TD
    Start([User visits site]) --> LandingPage[Landing Page]
    LandingPage --> ClickSignUp[Click 'Sign Up' button]
    ClickSignUp --> SignUpForm[Sign Up Form]
    
    SignUpForm --> EnterEmail[Enter email address]
    EnterEmail --> EnterPassword[Enter password]
    EnterPassword --> ConfirmPassword[Confirm password]
    ConfirmPassword --> ValidateForm{Form valid?}
    
    ValidateForm -->|No| ShowErrors[Show validation errors]
    ShowErrors --> SignUpForm
    
    ValidateForm -->|Yes| SubmitForm[Submit registration]
    SubmitForm --> CreateAccount{Account created?}
    
    CreateAccount -->|Error| ShowError[Show error message]
    ShowError --> SignUpForm
    
    CreateAccount -->|Success| ProfileSetup[Profile Setup Page]
    
    ProfileSetup --> EnterDisplayName[Enter display name]
    EnterDisplayName --> SelectFavoriteTeam[Select favorite team]
    SelectFavoriteTeam --> UploadAvatar[Upload avatar optional]
    UploadAvatar --> SelectLanguage[Select language preference]
    SelectLanguage --> CompleteProfile[Complete profile]
    
    CompleteProfile --> Dashboard[Redirect to Dashboard]
    Dashboard --> End([User onboarded])
```

**Key Steps:**
1. User lands on homepage
2. Clicks "Sign Up" button
3. Fills registration form (email, password, confirm password)
4. System validates input
5. Account created in Firebase
6. User completes profile setup (name, team, avatar, language)
7. Redirected to dashboard

**Success Criteria:**
- Registration completes in <2 minutes
- Clear error messages for validation
- Profile setup is intuitive
- Language preference applies immediately

---

### 1.2 Social Login (Google OAuth)

```mermaid
flowchart TD
    Start([User visits site]) --> LandingPage[Landing Page]
    LandingPage --> ClickGoogle[Click 'Sign in with Google']
    ClickGoogle --> GoogleAuth[Google OAuth popup]
    
    GoogleAuth --> UserConsent{User grants permission?}
    
    UserConsent -->|No| CancelAuth[Cancel authentication]
    CancelAuth --> LandingPage
    
    UserConsent -->|Yes| AuthSuccess[Authentication successful]
    AuthSuccess --> CheckProfile{Profile exists?}
    
    CheckProfile -->|Yes| Dashboard[Redirect to Dashboard]
    Dashboard --> End([User logged in])
    
    CheckProfile -->|No| ProfileSetup[Profile Setup Page]
    ProfileSetup --> SelectFavoriteTeam[Select favorite team]
    SelectFavoriteTeam --> SelectLanguage[Select language]
    SelectLanguage --> CompleteProfile[Complete profile]
    CompleteProfile --> Dashboard
```

**Key Steps:**
1. User clicks "Sign in with Google"
2. Google OAuth popup appears
3. User grants permission
4. System checks if profile exists
5. If new user, complete profile setup
6. Redirected to dashboard

**Success Criteria:**
- OAuth completes in <30 seconds
- Seamless profile creation for new users
- Existing users skip profile setup

---

## 2. Match Selection Flow

### 2.1 Browse and Select Match

```mermaid
flowchart TD
    Start([User on Dashboard]) --> MatchesTab[Click 'Matches' tab]
    MatchesTab --> MatchesPage[Matches Page]
    
    MatchesPage --> ViewMatches[View upcoming matches]
    ViewMatches --> FilterOptions{Want to filter?}
    
    FilterOptions -->|Yes| ApplyFilters[Apply filters]
    ApplyFilters --> FilterByDate[Filter by date]
    FilterByDate --> FilterByTeam[Filter by team optional]
    FilterByTeam --> FilteredResults[View filtered matches]
    FilteredResults --> SelectMatch
    
    FilterOptions -->|No| SelectMatch[Select a match]
    
    SelectMatch --> MatchDetail[Match Detail Page]
    MatchDetail --> ViewInfo[View match information]
    ViewInfo --> ViewPlayers[View available players]
    ViewPlayers --> CheckDeadline{Deadline passed?}
    
    CheckDeadline -->|Yes| ShowMessage[Show 'Lineup locked' message]
    ShowMessage --> ViewMatches
    
    CheckDeadline -->|No| CreateLineup[Click 'Create Lineup']
    CreateLineup --> LineupBuilder[Lineup Builder Page]
    LineupBuilder --> End([Building lineup])
```

**Key Steps:**
1. User navigates to Matches page
2. Views list of upcoming matches
3. Optionally applies filters (date, team)
4. Selects a match
5. Views match details and available players
6. Checks if deadline has passed
7. Clicks "Create Lineup" to start building

**Success Criteria:**
- Matches load in <1 second
- Filters work instantly
- Match details are comprehensive
- Deadline status is clear

---

## 3. Lineup Creation Flow

### 3.1 Build Lineup (Desktop - Drag & Drop)

```mermaid
flowchart TD
    Start([Lineup Builder Page]) --> ViewPitch[View football pitch layout]
    ViewPitch --> ViewPlayerPool[View player pool on left]
    
    ViewPlayerPool --> SearchPlayers{Want to search?}
    SearchPlayers -->|Yes| EnterSearch[Enter search query]
    EnterSearch --> FilteredPlayers[View filtered players]
    FilteredPlayers --> SelectPosition
    
    SearchPlayers -->|No| SelectPosition[Select position to fill]
    
    SelectPosition --> DragPlayer[Drag player from pool]
    DragPlayer --> DropPlayer[Drop player on pitch]
    DropPlayer --> ValidatePosition{Position valid?}
    
    ValidatePosition -->|No| ShowError[Show error message]
    ShowError --> SelectPosition
    
    ValidatePosition -->|Yes| PlayerAdded[Player added to lineup]
    PlayerAdded --> CheckComplete{All positions filled?}
    
    CheckComplete -->|No| SelectPosition
    
    CheckComplete -->|Yes| SelectCaptain[Select captain]
    SelectCaptain --> SelectBench[Select bench players]
    SelectBench --> ValidateLineup{Lineup valid?}
    
    ValidateLineup -->|No| ShowValidation[Show validation errors]
    ShowValidation --> FixIssues[Fix issues]
    FixIssues --> ValidateLineup
    
    ValidateLineup -->|Yes| ReviewLineup[Review lineup]
    ReviewLineup --> ApplyPowerUps{Apply power-ups?}
    
    ApplyPowerUps -->|Yes| SelectPowerUp[Select power-up]
    SelectPowerUp --> ConfirmPowerUp[Confirm purchase]
    ConfirmPowerUp --> SubmitLineup
    
    ApplyPowerUps -->|No| SubmitLineup[Submit lineup]
    SubmitLineup --> SaveSuccess[Lineup saved]
    SaveSuccess --> End([Lineup submitted])
```

**Key Steps:**
1. User views pitch layout and player pool
2. Optionally searches for specific players
3. Drags players from pool to pitch positions
4. System validates each placement
5. Fills all 11 starting positions
6. Selects captain (2x points)
7. Selects 4 bench players
8. System validates entire lineup
9. Optionally applies power-ups
10. Submits lineup

**Success Criteria:**
- Drag-and-drop is smooth (60fps)
- Validation is instant
- Clear error messages
- Auto-save every 30 seconds
- Formation constraints enforced

---

### 3.2 Build Lineup (Mobile - Position Selection)

```mermaid
flowchart TD
    Start([Lineup Builder Page]) --> SelectFormation[Select formation]
    SelectFormation --> ViewPositions[View positions list]
    
    ViewPositions --> SelectPosition[Tap position to fill]
    SelectPosition --> PlayerList[View players for position]
    
    PlayerList --> FilterPlayers{Want to filter?}
    FilterPlayers -->|Yes| ApplyFilter[Apply filter by team]
    ApplyFilter --> FilteredList[View filtered players]
    FilteredList --> SelectPlayer
    
    FilterPlayers -->|No| SelectPlayer[Tap player to select]
    
    SelectPlayer --> ValidateSelection{Selection valid?}
    
    ValidateSelection -->|No| ShowError[Show error message]
    ShowError --> PlayerList
    
    ValidateSelection -->|Yes| PlayerAdded[Player added]
    PlayerAdded --> CheckComplete{All positions filled?}
    
    CheckComplete -->|No| ViewPositions
    
    CheckComplete -->|Yes| SelectCaptain[Select captain]
    SelectCaptain --> SelectBench[Select bench players]
    SelectBench --> ReviewLineup[Review lineup]
    ReviewLineup --> SubmitLineup[Submit lineup]
    SubmitLineup --> End([Lineup submitted])
```

**Key Steps:**
1. User selects formation (4-4-2, 4-3-3, etc.)
2. Taps position to fill (GK, DEF, MID, FWD)
3. Views list of players for that position
4. Optionally filters by team
5. Taps player to select
6. System validates selection
7. Repeats for all positions
8. Selects captain and bench
9. Reviews and submits

**Success Criteria:**
- Touch-optimized interface
- Fast position switching
- Clear visual feedback
- Easy captain selection
- One-thumb operation

---

## 4. Live Match & Points Tracking Flow

### 4.1 Track Live Match Points

```mermaid
flowchart TD
    Start([Match kicks off]) --> MatchLive[Match status: LIVE]
    MatchLive --> UserDashboard[User views dashboard]
    
    UserDashboard --> LiveMatches[See live matches section]
    LiveMatches --> SelectMatch[Select live match]
    SelectMatch --> LiveView[Live Match View]
    
    LiveView --> ViewLineup[View your lineup]
    ViewLineup --> ViewPoints[View current points]
    ViewPoints --> PointsUpdate{Points update?}
    
    PointsUpdate -->|Every 2-3 min| FetchEvents[Fetch match events]
    FetchEvents --> CalculatePoints[Calculate new points]
    CalculatePoints --> UpdateDisplay[Update points display]
    UpdateDisplay --> ShowNotification{Goal/card for your player?}
    
    ShowNotification -->|Yes| DisplayNotif[Show notification]
    DisplayNotif --> ViewPoints
    
    ShowNotification -->|No| ViewPoints
    
    PointsUpdate -->|Match ends| FinalCalculation[Final points calculation]
    FinalCalculation --> LockPoints[Lock points]
    LockPoints --> UpdateRankings[Update leaderboards]
    UpdateRankings --> ShowSummary[Show match summary]
    ShowSummary --> End([Match complete])
```

**Key Steps:**
1. Match starts, status changes to LIVE
2. User views dashboard or live match page
3. Sees their lineup with current points
4. Points update every 2-3 minutes
5. System fetches match events from API
6. Calculates points based on events
7. Updates display in real-time
8. Shows notifications for goals/cards
9. Match ends, final calculation
10. Points locked, leaderboards updated

**Success Criteria:**
- Real-time updates without refresh
- Notifications for key events
- Clear points breakdown
- Smooth animations
- Final points lock correctly

---

## 5. Leaderboard Viewing Flow

### 5.1 View Global Leaderboard

```mermaid
flowchart TD
    Start([User on Dashboard]) --> LeaderboardTab[Click 'Leaderboard' tab]
    LeaderboardTab --> LeaderboardPage[Leaderboard Page]
    
    LeaderboardPage --> SelectTab{Which leaderboard?}
    
    SelectTab -->|Global| GlobalLeaderboard[Global Leaderboard]
    SelectTab -->|Friends| FriendsLeaderboard[Friends Leaderboard]
    SelectTab -->|League| LeagueLeaderboard[League Leaderboard]
    
    GlobalLeaderboard --> ViewRankings[View all users ranked]
    ViewRankings --> FindUser{Find specific user?}
    
    FindUser -->|Yes| SearchUser[Search for user]
    SearchUser --> ViewUserRank[View user's rank]
    ViewUserRank --> CompareStats
    
    FindUser -->|No| ScrollList[Scroll through list]
    ScrollList --> ViewYourRank[See your rank highlighted]
    ViewYourRank --> CompareStats[Compare with others]
    
    CompareStats --> FilterTime{Filter by time?}
    FilterTime -->|Yes| SelectPeriod[Select period]
    SelectPeriod --> UpdateRankings[Update rankings]
    UpdateRankings --> ViewRankings
    
    FilterTime -->|No| End([Viewing leaderboard])
```

**Key Steps:**
1. User navigates to Leaderboard page
2. Selects tab (Global/Friends/League)
3. Views ranked list of users
4. Optionally searches for specific user
5. Sees own rank highlighted
6. Compares stats with others
7. Optionally filters by time period

**Success Criteria:**
- Leaderboard loads in <1 second
- User's rank is highlighted
- Search works instantly
- Position changes show arrows
- Pagination for large lists

---

## 6. League Management Flow

### 6.1 Create Private League

```mermaid
flowchart TD
    Start([User on Dashboard]) --> LeaguesTab[Click 'Leagues' tab]
    LeaguesTab --> LeaguesPage[Leagues Page]
    
    LeaguesPage --> CreateButton[Click 'Create League']
    CreateButton --> CreateForm[League Creation Form]
    
    CreateForm --> EnterName[Enter league name]
    EnterName --> EnterDescription[Enter description]
    EnterDescription --> SelectType[Select league type]
    SelectType --> SelectScope[Select league scope]
    SelectScope --> SelectPrivacy[Select privacy setting]
    SelectPrivacy --> ReviewSettings[Review settings]
    
    ReviewSettings --> SubmitCreate[Submit creation]
    SubmitCreate --> GenerateCode[Generate invite code]
    GenerateCode --> LeagueCreated[League created]
    
    LeagueCreated --> ShareOptions{Share league?}
    
    ShareOptions -->|Yes| ShareCode[Share invite code]
    ShareCode --> CopyCode[Copy code to clipboard]
    CopyCode --> ShareSocial[Share on social media]
    ShareSocial --> LeaguePage
    
    ShareOptions -->|No| LeaguePage[View league page]
    LeaguePage --> InviteMembers[Invite members]
    InviteMembers --> End([League active])
```

**Key Steps:**
1. User navigates to Leagues page
2. Clicks "Create League"
3. Fills league creation form:
   - League name
   - Description
   - Type (standard/head-to-head/weekly/monthly)
   - Scope (single match/weekly/monthly/season)
   - Privacy (public/private/invite-only)
4. Reviews settings
5. Submits creation
6. System generates unique invite code
7. User shares code with friends
8. League is active

**Success Criteria:**
- League creation in <1 minute
- Unique invite codes generated
- Easy sharing options
- Clear league settings

---

### 6.2 Join League

```mermaid
flowchart TD
    Start([User has invite code]) --> LeaguesPage[Leagues Page]
    LeaguesPage --> JoinButton[Click 'Join League']
    JoinButton --> JoinOptions{How to join?}
    
    JoinOptions -->|Invite Code| EnterCode[Enter invite code]
    EnterCode --> ValidateCode{Code valid?}
    
    ValidateCode -->|No| ShowError[Show error message]
    ShowError --> EnterCode
    
    ValidateCode -->|Yes| LeagueInfo[Show league info]
    LeagueInfo --> ConfirmJoin[Confirm join]
    ConfirmJoin --> JoinSuccess
    
    JoinOptions -->|Search Public| SearchLeagues[Search public leagues]
    SearchLeagues --> BrowseResults[Browse results]
    BrowseResults --> SelectLeague[Select league]
    SelectLeague --> LeagueInfo
    
    JoinSuccess[Joined successfully]
    JoinSuccess --> LeaguePage[View league page]
    LeaguePage --> ViewMembers[View members]
    ViewMembers --> ViewLeaderboard[View league leaderboard]
    ViewLeaderboard --> End([Member of league])
```

**Key Steps:**
1. User navigates to Leagues page
2. Clicks "Join League"
3. Chooses method:
   - Enter invite code
   - Search public leagues
4. System validates code or shows search results
5. User confirms join
6. Added to league
7. Views league page and leaderboard

**Success Criteria:**
- Join process in <30 seconds
- Clear validation messages
- Public league search works well
- Immediate access to league features

---

## 7. Credit & Power-Up Flow

### 7.1 Purchase and Use Power-Up

```mermaid
flowchart TD
    Start([User building lineup]) --> ViewPowerUps[View available power-ups]
    ViewPowerUps --> SelectPowerUp[Select power-up]
    SelectPowerUp --> ViewDetails[View power-up details]
    
    ViewDetails --> CheckCredits{Enough credits?}
    
    CheckCredits -->|No| BuyCredits[Go to credit purchase]
    BuyCredits --> SelectPackage[Select credit package]
    SelectPackage --> PaymentGateway[Payment gateway]
    PaymentGateway --> PaymentSuccess{Payment successful?}
    
    PaymentSuccess -->|No| PaymentError[Show error message]
    PaymentError --> SelectPackage
    
    PaymentSuccess -->|Yes| CreditsAdded[Credits added to account]
    CreditsAdded --> ViewPowerUps
    
    CheckCredits -->|Yes| CheckUsageLimit{Usage limit reached?}
    
    CheckUsageLimit -->|Yes| ShowLimit[Show limit message]
    ShowLimit --> ViewPowerUps
    
    CheckUsageLimit -->|No| ConfirmPurchase[Confirm power-up purchase]
    ConfirmPurchase --> DeductCredits[Deduct credits]
    DeductCredits --> ApplyPowerUp[Apply power-up to lineup]
    ApplyPowerUp --> ShowConfirmation[Show confirmation]
    ShowConfirmation --> End([Power-up active])
```

**Key Steps:**
1. User views available power-ups
2. Selects desired power-up
3. Views details and cost
4. System checks credit balance
5. If insufficient, user purchases credits
6. System checks usage limits
7. User confirms purchase
8. Credits deducted
9. Power-up applied to lineup
10. Confirmation shown

**Success Criteria:**
- Clear power-up descriptions
- Secure payment processing
- Usage limits enforced
- Immediate power-up application
- Transaction history tracked

---

## 8. Notification Flow

### 8.1 Receive and View Notifications

```mermaid
flowchart TD
    Start([Trigger event]) --> EventType{Event type?}
    
    EventType -->|Match starting| MatchNotif[Match starting notification]
    EventType -->|Deadline soon| DeadlineNotif[Deadline reminder]
    EventType -->|Match result| ResultNotif[Match result notification]
    EventType -->|Rank change| RankNotif[Rank change notification]
    EventType -->|Achievement| AchievementNotif[Achievement unlocked]
    EventType -->|League invite| LeagueNotif[League invitation]
    
    MatchNotif --> SendNotification
    DeadlineNotif --> SendNotification
    ResultNotif --> SendNotification
    RankNotif --> SendNotification
    AchievementNotif --> SendNotification
    LeagueNotif --> SendNotification
    
    SendNotification[Send notification]
    SendNotification --> UserPrefs{Notifications enabled?}
    
    UserPrefs -->|No| InAppOnly[In-app notification only]
    InAppOnly --> UpdateBadge
    
    UserPrefs -->|Yes| PushNotif[Send push notification]
    PushNotif --> UpdateBadge[Update notification badge]
    
    UpdateBadge --> UserClick{User clicks notification?}
    
    UserClick -->|No| StayInApp[Notification in center]
    StayInApp --> End([Notification sent])
    
    UserClick -->|Yes| Navigate[Navigate to relevant page]
    Navigate --> MarkRead[Mark as read]
    MarkRead --> End
```

**Key Steps:**
1. Event triggers notification
2. System determines notification type
3. Checks user preferences
4. Sends push notification (if enabled)
5. Updates in-app notification badge
6. User clicks notification
7. Navigates to relevant page
8. Notification marked as read

**Success Criteria:**
- Notifications send instantly
- Respect user preferences
- Clear notification content
- Correct navigation on click
- Badge counts update

---

## Flow Summary

### Key User Journeys Covered

1. **Registration & Onboarding:** Email/password and Google OAuth flows
2. **Match Selection:** Browse, filter, and select matches
3. **Lineup Creation:** Desktop (drag-drop) and mobile (position selection)
4. **Live Match Tracking:** Real-time points updates and notifications
5. **Leaderboard Viewing:** Global, friends, and league leaderboards
6. **League Management:** Create and join leagues
7. **Power-Ups:** Purchase credits and use power-ups
8. **Notifications:** Receive and interact with notifications

### Design Principles Applied

- **Simplicity:** Minimal steps to accomplish tasks
- **Clarity:** Clear feedback at each step
- **Flexibility:** Multiple paths to achieve goals
- **Error Handling:** Graceful error messages and recovery
- **Mobile-First:** Optimized for touch interactions
- **Real-Time:** Live updates without page refresh

---

**Document Version:** 1.0  
**Last Updated:** November 23, 2025  
**Status:** Complete
