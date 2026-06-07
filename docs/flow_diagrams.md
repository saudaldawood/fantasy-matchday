# Client Flow Diagrams

Here are the flow diagrams for the application based on the provided requirements.

## A) User Journey Flow (End-To-End)

```mermaid
graph LR
    Home --> Match
    Match --> MatchDetails["Match Details"]
    MatchDetails --> LineupBuilder["Lineup Builder"]
    LineupBuilder --> SaveTeam["Save Team"]
    SaveTeam --> Profile
    Profile --> Leagues
    Leagues --> Leaderboard
    Leaderboard --> Achievements
```

## B) Gameplay Flow

```mermaid
graph LR
    UpcomingMatches["Upcoming Matches"] --> MatchDetails["Match Details"]
    MatchDetails --> ChoosePlayer["Choose Player"]
    ChoosePlayer --> BuildLineup["Build Lineup"]
    BuildLineup --> CaptainSelection["Captain Selection"]
    CaptainSelection --> Confirm
    Confirm --> LivePoints["Live Points"]
```

## C) System Architecture Flow

```mermaid
graph LR
    Frontend --> Backend
    Backend --> API
    API --> Database
    Database --> Auth
    Auth --> Admin
```

## D) Authentication Flow

```mermaid
graph LR
    Signup --> EmailVerification["Email Verification"]
    EmailVerification --> Login
    Login --> Dashboard
```
