# Fantasy Matchday - Gameplay Rules

This document defines all gameplay rules, scoring systems, credit mechanics, power-ups, and league types for Fantasy Matchday. These rules are structured to be easily implemented in code.

---

## Scoring System

### Position-Based Scoring Rules

The scoring system is position-dependent, with different point values for Goalkeepers/Defenders, Midfielders, and Forwards.

```json
{
  "scoringRules": {
    "GK": {
      "cleanSheet": 4,
      "goalScored": 6,
      "assist": 3,
      "penaltySave": 5,
      "threePlusSaves": 2,
      "yellowCard": -1,
      "redCard": -3
    },
    "DEF": {
      "cleanSheet": 4,
      "goalScored": 6,
      "assist": 3,
      "penaltySave": 0,
      "threePlusSaves": 0,
      "yellowCard": -1,
      "redCard": -3
    },
    "MID": {
      "cleanSheet": 1,
      "goalScored": 5,
      "assist": 3,
      "penaltySave": 0,
      "threePlusSaves": 0,
      "yellowCard": -1,
      "redCard": -3
    },
    "FWD": {
      "cleanSheet": 0,
      "goalScored": 4,
      "assist": 3,
      "penaltySave": 0,
      "threePlusSaves": 0,
      "yellowCard": -1,
      "redCard": -3
    }
  }
}
```

### Bonus Points (All Positions)

These bonus points apply to all player positions.

```json
{
  "bonusPoints": {
    "manOfTheMatch": 3,
    "hatTrick": 5,
    "sixtyPlusMinutes": 2
  }
}
```

**Explanation:**
- **Man of the Match**: Awarded to the official MOTM (from API or admin selection)
- **Hat-trick**: Player scores 3 or more goals in a single match
- **60+ Minutes Played**: Player plays 60 minutes or more

### Scoring Calculation Logic

**Algorithm:**

```typescript
function calculatePlayerPoints(
  performance: PlayerMatchPerformance,
  position: PlayerPosition
): PointsBreakdown {
  const rules = scoringRules[position];
  const breakdown: PointsBreakdown = {
    goalsPoints: 0,
    assistsPoints: 0,
    cleanSheetPoints: 0,
    penaltySavePoints: 0,
    savesPoints: 0,
    minutesPlayedPoints: 0,
    manOfTheMatchPoints: 0,
    hatTrickPoints: 0,
    yellowCardPoints: 0,
    redCardPoints: 0,
    total: 0
  };

  // Goals
  breakdown.goalsPoints = performance.goals * rules.goalScored;

  // Assists
  breakdown.assistsPoints = performance.assists * rules.assist;

  // Clean Sheet (only if player played 60+ minutes)
  if (performance.cleanSheet && performance.minutesPlayed >= 60) {
    breakdown.cleanSheetPoints = rules.cleanSheet;
  }

  // Penalty Saves (GK only)
  breakdown.penaltySavePoints = performance.penaltySaves * rules.penaltySave;

  // 3+ Saves bonus (GK only)
  if (performance.saves >= 3) {
    breakdown.savesPoints = rules.threePlusSaves;
  }

  // Minutes Played bonus
  if (performance.minutesPlayed >= 60) {
    breakdown.minutesPlayedPoints = bonusPoints.sixtyPlusMinutes;
  }

  // Man of the Match
  if (performance.manOfTheMatch) {
    breakdown.manOfTheMatchPoints = bonusPoints.manOfTheMatch;
  }

  // Hat-trick
  if (performance.goals >= 3) {
    breakdown.hatTrickPoints = bonusPoints.hatTrick;
  }

  // Yellow Cards (negative)
  breakdown.yellowCardPoints = performance.yellowCards * rules.yellowCard;

  // Red Cards (negative)
  breakdown.redCardPoints = performance.redCards * rules.redCard;

  // Calculate total
  breakdown.total = 
    breakdown.goalsPoints +
    breakdown.assistsPoints +
    breakdown.cleanSheetPoints +
    breakdown.penaltySavePoints +
    breakdown.savesPoints +
    breakdown.minutesPlayedPoints +
    breakdown.manOfTheMatchPoints +
    breakdown.hatTrickPoints +
    breakdown.yellowCardPoints +
    breakdown.redCardPoints;

  return breakdown;
}
```

### Captain Multiplier

The user's selected captain receives a points multiplier.

```json
{
  "captainMultiplier": {
    "standard": 2,
    "tripleCapPowerUp": 3
  }
}
```

**Logic:**
- Standard captain: All points × 2
- Triple Captain power-up: All points × 3 (limited to once per month)

### Lineup Points Calculation

```typescript
function calculateLineupPoints(lineup: Lineup, performances: PlayerMatchPerformance[]): number {
  let totalPoints = 0;

  for (const entry of lineup.entries) {
    // Skip bench players unless Bench Boost power-up is active
    if (entry.isBench && !lineup.hasBenchBoostActive) {
      continue;
    }

    const performance = performances.find(p => p.playerId === entry.playerId);
    if (!performance) continue;

    const playerPoints = performance.totalPoints;
    const multiplier = entry.multiplier; // 1 for normal, 2 for captain, 3 for triple captain

    totalPoints += playerPoints * multiplier;
  }

  return totalPoints;
}
```

---

## Lineup Rules

### Formation Requirements

Users must select players according to formation constraints.

```json
{
  "lineupRules": {
    "totalPlayers": 11,
    "benchPlayers": 4,
    "positions": {
      "GK": { "min": 1, "max": 1 },
      "DEF": { "min": 3, "max": 5 },
      "MID": { "min": 3, "max": 5 },
      "FWD": { "min": 1, "max": 3 }
    },
    "captainRequired": true,
    "maxPlayersPerTeam": 3
  }
}
```

**Explanation:**
- **Total Players**: 11 starting players + 4 bench players = 15 total
- **Goalkeeper**: Exactly 1 required
- **Defenders**: 3-5 players
- **Midfielders**: 3-5 players
- **Forwards**: 1-3 players
- **Captain**: Must select 1 captain (receives 2x points)
- **Team Limit**: Maximum 3 players from the same team (prevents over-reliance on one team)

### Valid Formations

```json
{
  "validFormations": [
    "3-4-3",
    "3-5-2",
    "4-3-3",
    "4-4-2",
    "4-5-1",
    "5-3-2",
    "5-4-1"
  ]
}
```

### Lineup Deadline

```json
{
  "deadlineRules": {
    "defaultDeadline": "matchKickoff",
    "deadlineBuffer": 0,
    "allowLateChanges": false,
    "lateChangeCost": 50
  }
}
```

**Explanation:**
- **Default Deadline**: Lineups lock at match kickoff time
- **Buffer**: No buffer time (lineups lock exactly at kickoff)
- **Late Changes**: Not allowed by default (can be enabled with Wild Card power-up)
- **Late Change Cost**: 50 credits to make changes after deadline (if enabled)

### Validation Logic

```typescript
function validateLineup(lineup: Lineup): ValidationResult {
  const errors: string[] = [];

  // Count players by position
  const counts = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  const teamCounts: Record<string, number> = {};

  for (const entry of lineup.entries) {
    if (entry.isBench) continue; // Don't count bench in formation

    counts[entry.position]++;

    // Count players per team
    const player = getPlayer(entry.playerId);
    teamCounts[player.teamId] = (teamCounts[player.teamId] || 0) + 1;
  }

  // Validate position requirements
  const rules = lineupRules.positions;
  for (const [position, count] of Object.entries(counts)) {
    const rule = rules[position];
    if (count < rule.min || count > rule.max) {
      errors.push(`${position}: requires ${rule.min}-${rule.max} players, got ${count}`);
    }
  }

  // Validate total players
  const totalStarters = Object.values(counts).reduce((a, b) => a + b, 0);
  if (totalStarters !== lineupRules.totalPlayers) {
    errors.push(`Total starters must be ${lineupRules.totalPlayers}, got ${totalStarters}`);
  }

  // Validate captain
  const hasCaptain = lineup.entries.some(e => e.isCaptain);
  if (!hasCaptain) {
    errors.push('Captain must be selected');
  }

  // Validate max players per team
  for (const [teamId, count] of Object.entries(teamCounts)) {
    if (count > lineupRules.maxPlayersPerTeam) {
      errors.push(`Maximum ${lineupRules.maxPlayersPerTeam} players per team, team ${teamId} has ${count}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
```

---

## Credits System

### Earning Credits

Users earn credits through various activities.

```json
{
  "creditEarning": {
    "dailyLogin": {
      "amount": 10,
      "description": "Login to the platform each day"
    },
    "matchParticipation": {
      "amount": 20,
      "description": "Submit a lineup for any match"
    },
    "weeklyRanking": {
      "top10": 500,
      "top50": 200,
      "top100": 100,
      "top500": 50,
      "description": "Based on weekly global ranking"
    },
    "achievementUnlock": {
      "common": 25,
      "rare": 50,
      "epic": 100,
      "legendary": 250,
      "description": "Unlock achievements"
    },
    "leagueWin": {
      "small": 200,
      "medium": 500,
      "large": 1000,
      "description": "Win a league (based on size: <10, 10-50, 50+ members)"
    },
    "referral": {
      "amount": 100,
      "description": "Refer a friend who creates an account"
    }
  }
}
```

### Spending Credits

Users can spend credits on various features.

```json
{
  "creditSpending": {
    "powerUps": {
      "captainBoost": 50,
      "tripleCaptain": 100,
      "benchBoost": 75,
      "wildCard": 150
    },
    "features": {
      "lateLineupChange": 50,
      "extraTransfer": 30,
      "premiumLeagueEntry": 100,
      "detailedAnalytics": 200
    },
    "customization": {
      "profileBadge": 50,
      "customAvatar": 75,
      "profileTheme": 100
    }
  }
}
```

### Credit Purchase Pricing

Users can purchase credits with real money.

```json
{
  "creditPurchase": {
    "packages": [
      {
        "credits": 500,
        "priceUSD": 4.99,
        "bonus": 0,
        "popular": false
      },
      {
        "credits": 1200,
        "priceUSD": 9.99,
        "bonus": 200,
        "popular": true
      },
      {
        "credits": 2500,
        "priceUSD": 19.99,
        "bonus": 500,
        "popular": false
      },
      {
        "credits": 6000,
        "priceUSD": 49.99,
        "bonus": 1500,
        "popular": false
      }
    ],
    "conversionRate": 100
  }
}
```

**Explanation:**
- Conversion rate: $1 USD = 100 credits (base rate)
- Larger packages include bonus credits
- "Popular" package highlighted in UI

---

## Power-Ups

### Available Power-Ups

```json
{
  "powerUps": [
    {
      "id": "captain_boost",
      "name": "Captain Boost",
      "nameAr": "تعزيز القائد",
      "description": "Your captain earns 2x points instead of the standard multiplier",
      "descriptionAr": "يحصل قائدك على ضعف النقاط بدلاً من المضاعف القياسي",
      "cost": 50,
      "effect": {
        "type": "captain_multiplier",
        "multiplier": 2
      },
      "usageLimit": {
        "period": "match",
        "maxUses": 1
      },
      "icon": "/icons/captain-boost.svg"
    },
    {
      "id": "triple_captain",
      "name": "Triple Captain",
      "nameAr": "القائد الثلاثي",
      "description": "Your captain earns 3x points for this match. Can only be used once per month.",
      "descriptionAr": "يحصل قائدك على ثلاثة أضعاف النقاط لهذه المباراة. يمكن استخدامه مرة واحدة فقط في الشهر.",
      "cost": 100,
      "effect": {
        "type": "captain_multiplier",
        "multiplier": 3
      },
      "usageLimit": {
        "period": "month",
        "maxUses": 1
      },
      "icon": "/icons/triple-captain.svg"
    },
    {
      "id": "bench_boost",
      "name": "Bench Boost",
      "nameAr": "تعزيز البدلاء",
      "description": "All your bench players earn points for this match",
      "descriptionAr": "جميع لاعبيك البدلاء يحصلون على نقاط لهذه المباراة",
      "cost": 75,
      "effect": {
        "type": "bench_scoring",
        "enabled": true
      },
      "usageLimit": {
        "period": "match",
        "maxUses": 1
      },
      "icon": "/icons/bench-boost.svg"
    },
    {
      "id": "wild_card",
      "name": "Wild Card",
      "nameAr": "البطاقة البرية",
      "description": "Make unlimited changes to your lineup for one matchday",
      "descriptionAr": "قم بإجراء تغييرات غير محدودة على تشكيلتك ليوم مباراة واحد",
      "cost": 150,
      "effect": {
        "type": "unlimited_transfers",
        "duration": "matchday"
      },
      "usageLimit": {
        "period": "month",
        "maxUses": 2
      },
      "icon": "/icons/wild-card.svg"
    }
  ]
}
```

### Power-Up Application Logic

```typescript
function applyPowerUp(lineup: Lineup, powerUp: PowerUp): Lineup {
  const updatedLineup = { ...lineup };

  switch (powerUp.effect.type) {
    case 'captain_multiplier':
      // Find captain and update multiplier
      const captainEntry = updatedLineup.entries.find(e => e.isCaptain);
      if (captainEntry) {
        captainEntry.multiplier = powerUp.effect.multiplier;
      }
      break;

    case 'bench_scoring':
      // Enable bench scoring for this lineup
      updatedLineup.hasBenchBoostActive = true;
      break;

    case 'unlimited_transfers':
      // Allow unlimited lineup changes for this matchday
      updatedLineup.hasWildCardActive = true;
      break;
  }

  // Record power-up application
  updatedLineup.powerUps.push({
    powerUpId: powerUp.id,
    cost: powerUp.cost,
    appliedAt: new Date()
  });

  return updatedLineup;
}
```

### Power-Up Usage Validation

```typescript
function canUsePowerUp(userId: string, powerUpId: string): boolean {
  const powerUp = getPowerUp(powerUpId);
  if (!powerUp) return false;

  // Check usage limit
  if (powerUp.usageLimit) {
    const usageCount = getUserPowerUpUsage(userId, powerUpId, powerUp.usageLimit.period);
    if (usageCount >= powerUp.usageLimit.maxUses) {
      return false; // Usage limit exceeded
    }
  }

  // Check if user has enough credits
  const user = getUser(userId);
  if (user.credits < powerUp.cost) {
    return false; // Insufficient credits
  }

  return true;
}
```

---

## League Types & Rules

### League Type Definitions

```json
{
  "leagueTypes": [
    {
      "type": "standard",
      "name": "Standard League",
      "nameAr": "دوري قياسي",
      "description": "Cumulative points over the league duration. Highest total wins.",
      "descriptionAr": "النقاط التراكمية على مدى مدة الدوري. أعلى إجمالي يفوز.",
      "scoringMethod": "cumulative"
    },
    {
      "type": "head-to-head",
      "name": "Head-to-Head League",
      "nameAr": "دوري المواجهات المباشرة",
      "description": "1v1 matchups each week. Win/loss record determines standings.",
      "descriptionAr": "مواجهات فردية كل أسبوع. سجل الفوز / الخسارة يحدد الترتيب.",
      "scoringMethod": "head_to_head"
    },
    {
      "type": "weekly",
      "name": "Weekly League",
      "nameAr": "دوري أسبوعي",
      "description": "Resets each week. Compete for weekly prizes.",
      "descriptionAr": "يعيد التعيين كل أسبوع. تنافس على جوائز أسبوعية.",
      "scoringMethod": "weekly_reset"
    },
    {
      "type": "monthly",
      "name": "Monthly League",
      "nameAr": "دوري شهري",
      "description": "Resets each month. 4-5 matchdays per cycle.",
      "descriptionAr": "يعيد التعيين كل شهر. 4-5 أيام مباريات لكل دورة.",
      "scoringMethod": "monthly_reset"
    }
  ]
}
```

### League Scope Definitions

```json
{
  "leagueScopes": [
    {
      "scope": "single-match",
      "name": "Single Match",
      "nameAr": "مباراة واحدة",
      "description": "Compete on one specific match only"
    },
    {
      "scope": "weekly",
      "name": "Weekly (Matchday)",
      "nameAr": "أسبوعي (يوم المباراة)",
      "description": "All matches in a single matchday/round"
    },
    {
      "scope": "monthly",
      "name": "Monthly",
      "nameAr": "شهري",
      "description": "All matches in a calendar month"
    },
    {
      "scope": "season",
      "name": "Full Season",
      "nameAr": "الموسم الكامل",
      "description": "Entire Saudi Pro League season"
    },
    {
      "scope": "custom",
      "name": "Custom Selection",
      "nameAr": "اختيار مخصص",
      "description": "Admin-defined match selection"
    }
  ]
}
```

### League Privacy Settings

```json
{
  "privacySettings": [
    {
      "privacy": "public",
      "name": "Public",
      "nameAr": "عام",
      "description": "Anyone can join",
      "requiresInvite": false,
      "visibleInSearch": true
    },
    {
      "privacy": "private",
      "name": "Private",
      "nameAr": "خاص",
      "description": "Invite code required to join",
      "requiresInvite": true,
      "visibleInSearch": false
    },
    {
      "privacy": "invite-only",
      "name": "Invite Only",
      "nameAr": "بالدعوة فقط",
      "description": "Admin must manually approve members",
      "requiresInvite": true,
      "requiresApproval": true,
      "visibleInSearch": false
    }
  ]
}
```

### League Ranking Logic

**Standard League (Cumulative):**

```typescript
function calculateStandardLeagueRankings(leagueId: string): LeagueRanking[] {
  const memberships = getLeagueMemberships(leagueId);
  
  // Sort by total points (descending)
  const rankings = memberships
    .map(m => ({
      userId: m.userId,
      totalPoints: m.totalPoints,
      matchesPlayed: m.matchesPlayed
    }))
    .sort((a, b) => {
      // Primary: Total points
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      // Tiebreaker: Fewer matches played (higher average)
      return a.matchesPlayed - b.matchesPlayed;
    });

  // Assign ranks
  return rankings.map((r, index) => ({
    ...r,
    rank: index + 1
  }));
}
```

**Head-to-Head League:**

```typescript
function calculateHeadToHeadRankings(leagueId: string): LeagueRanking[] {
  const memberships = getLeagueMemberships(leagueId);
  const matchups = getLeagueMatchups(leagueId);

  // Calculate win/loss/draw records
  const records = memberships.map(m => {
    const userMatchups = matchups.filter(
      mu => mu.user1Id === m.userId || mu.user2Id === m.userId
    );

    let wins = 0, losses = 0, draws = 0;
    let pointsFor = 0, pointsAgainst = 0;

    for (const matchup of userMatchups) {
      const isUser1 = matchup.user1Id === m.userId;
      const userPoints = isUser1 ? matchup.user1Points : matchup.user2Points;
      const opponentPoints = isUser1 ? matchup.user2Points : matchup.user1Points;

      pointsFor += userPoints;
      pointsAgainst += opponentPoints;

      if (userPoints > opponentPoints) wins++;
      else if (userPoints < opponentPoints) losses++;
      else draws++;
    }

    return {
      userId: m.userId,
      wins,
      losses,
      draws,
      pointsFor,
      pointsAgainst,
      pointsDiff: pointsFor - pointsAgainst
    };
  });

  // Sort by wins, then points difference
  const rankings = records.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.pointsDiff !== a.pointsDiff) return b.pointsDiff - a.pointsDiff;
    return b.pointsFor - a.pointsFor;
  });

  return rankings.map((r, index) => ({
    ...r,
    rank: index + 1
  }));
}
```

---

## Achievements

### Achievement Definitions

```json
{
  "achievements": [
    {
      "id": "first_match",
      "name": "First Steps",
      "nameAr": "الخطوات الأولى",
      "description": "Participate in your first match",
      "descriptionAr": "شارك في مباراتك الأولى",
      "criteria": { "type": "matches_played", "count": 1 },
      "creditReward": 25,
      "rarity": "common",
      "icon": "/achievements/first-match.svg"
    },
    {
      "id": "veteran",
      "name": "Veteran",
      "nameAr": "المخضرم",
      "description": "Participate in 50 matches",
      "descriptionAr": "شارك في 50 مباراة",
      "criteria": { "type": "matches_played", "count": 50 },
      "creditReward": 100,
      "rarity": "rare",
      "icon": "/achievements/veteran.svg"
    },
    {
      "id": "top_10",
      "name": "Elite Player",
      "nameAr": "لاعب نخبة",
      "description": "Finish in the top 10 globally",
      "descriptionAr": "أنهِ في المراكز العشرة الأولى عالمياً",
      "criteria": { "type": "top_rank", "rank": 10, "scope": "global" },
      "creditReward": 250,
      "rarity": "legendary",
      "icon": "/achievements/top-10.svg"
    },
    {
      "id": "perfect_lineup",
      "name": "Perfect Lineup",
      "nameAr": "التشكيلة المثالية",
      "description": "All 11 players in your lineup score points",
      "descriptionAr": "جميع اللاعبين الـ 11 في تشكيلتك يسجلون نقاطاً",
      "criteria": { "type": "perfect_lineup", "allPlayersScored": true },
      "creditReward": 100,
      "rarity": "epic",
      "icon": "/achievements/perfect-lineup.svg"
    },
    {
      "id": "winning_streak_5",
      "name": "On Fire",
      "nameAr": "مشتعل",
      "description": "Win 5 matches in a row",
      "descriptionAr": "اربح 5 مباريات متتالية",
      "criteria": { "type": "winning_streak", "wins": 5 },
      "creditReward": 100,
      "rarity": "epic",
      "icon": "/achievements/on-fire.svg"
    },
    {
      "id": "login_streak_7",
      "name": "Dedicated Fan",
      "nameAr": "مشجع مخلص",
      "description": "Login for 7 consecutive days",
      "descriptionAr": "سجل الدخول لمدة 7 أيام متتالية",
      "criteria": { "type": "login_streak", "days": 7 },
      "creditReward": 50,
      "rarity": "rare",
      "icon": "/achievements/dedicated-fan.svg"
    },
    {
      "id": "league_champion",
      "name": "League Champion",
      "nameAr": "بطل الدوري",
      "description": "Win a league",
      "descriptionAr": "اربح دورياً",
      "criteria": { "type": "league_wins", "count": 1 },
      "creditReward": 100,
      "rarity": "rare",
      "icon": "/achievements/league-champion.svg"
    },
    {
      "id": "social_butterfly",
      "name": "Social Butterfly",
      "nameAr": "اجتماعي",
      "description": "Refer 5 friends",
      "descriptionAr": "قم بدعوة 5 أصدقاء",
      "criteria": { "type": "referrals", "count": 5 },
      "creditReward": 250,
      "rarity": "epic",
      "icon": "/achievements/social-butterfly.svg"
    },
    {
      "id": "high_scorer",
      "name": "High Scorer",
      "nameAr": "الهداف",
      "description": "Earn 10,000 total points",
      "descriptionAr": "احصل على 10,000 نقطة إجمالية",
      "criteria": { "type": "total_points", "points": 10000 },
      "creditReward": 200,
      "rarity": "epic",
      "icon": "/achievements/high-scorer.svg"
    }
  ]
}
```

### Achievement Check Logic

```typescript
function checkAchievements(userId: string): string[] {
  const user = getUser(userId);
  const unlockedAchievements: string[] = [];

  for (const achievement of achievements) {
    // Skip if already unlocked
    if (user.achievements.includes(achievement.id)) {
      continue;
    }

    let isUnlocked = false;

    switch (achievement.criteria.type) {
      case 'matches_played':
        isUnlocked = user.matchesPlayed >= achievement.criteria.count;
        break;

      case 'total_points':
        isUnlocked = user.totalPoints >= achievement.criteria.points;
        break;

      case 'top_rank':
        const rank = getUserRank(userId, achievement.criteria.scope);
        isUnlocked = rank <= achievement.criteria.rank;
        break;

      case 'winning_streak':
        const streak = getUserWinningStreak(userId);
        isUnlocked = streak >= achievement.criteria.wins;
        break;

      case 'perfect_lineup':
        isUnlocked = checkPerfectLineup(userId);
        break;

      case 'login_streak':
        isUnlocked = user.loginStreak >= achievement.criteria.days;
        break;

      case 'league_wins':
        const leagueWins = getUserLeagueWins(userId);
        isUnlocked = leagueWins >= achievement.criteria.count;
        break;

      case 'referrals':
        const referrals = getUserReferralCount(userId);
        isUnlocked = referrals >= achievement.criteria.count;
        break;
    }

    if (isUnlocked) {
      unlockAchievement(userId, achievement.id);
      awardCredits(userId, achievement.creditReward, 'earned_achievement');
      unlockedAchievements.push(achievement.id);
    }
  }

  return unlockedAchievements;
}
```

---

## Match Update Frequency

### Real-Time Update Schedule

```json
{
  "updateSchedule": {
    "beforeMatch": {
      "interval": 1800,
      "description": "30 minutes - Fetch match data and lineups"
    },
    "duringMatch": {
      "interval": 150,
      "description": "2.5 minutes - Fetch live match events and update points"
    },
    "afterMatch": {
      "interval": 900,
      "description": "15 minutes - Continue updates for 15 min after match ends"
    },
    "leaderboardUpdate": {
      "interval": 300,
      "description": "5 minutes - Update leaderboard rankings"
    }
  }
}
```

**Implementation:**

```typescript
// Firebase Cloud Function (scheduled)
export const updateMatchData = functions.pubsub
  .schedule('every 2 minutes')
  .onRun(async (context) => {
    const liveMatches = await getLiveMatches();

    for (const match of liveMatches) {
      try {
        // Fetch latest data from API
        const apiData = await fetchMatchDataFromAPI(match.externalApiId);

        // Update match status and scores
        await updateMatch(match.id, {
          homeScore: apiData.homeScore,
          awayScore: apiData.awayScore,
          currentMinute: apiData.currentMinute,
          status: apiData.status
        });

        // Update player performances
        for (const playerData of apiData.players) {
          await updatePlayerPerformance(match.id, playerData);
        }

        // Recalculate points for all lineups
        await recalculateLineupPoints(match.id);

        // Update leaderboards
        await updateLeaderboards(match.id);

      } catch (error) {
        console.error(`Error updating match ${match.id}:`, error);
      }
    }
  });
```

---

## Summary

This gameplay rules document provides:

1. **Scoring System**: Position-based points, bonus points, captain multipliers
2. **Lineup Rules**: Formation requirements, validation logic
3. **Credits System**: Earning, spending, and purchasing mechanics
4. **Power-Ups**: Definitions, effects, and usage limits
5. **League Types**: Standard, head-to-head, weekly, monthly
6. **Achievements**: Unlockable achievements with criteria and rewards
7. **Update Schedule**: Real-time data synchronization intervals

All rules are structured in JSON format for easy implementation and can be adjusted via admin panel or configuration files.

---

*These rules form the core gameplay mechanics of Fantasy Matchday and should be referenced during development and testing.*

