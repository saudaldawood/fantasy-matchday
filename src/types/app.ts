// Application Types - Mapped from API-Football to our domain models
// Based on docs/data-models.md

export type PlayerPosition = 'GK' | 'DEF' | 'MID' | 'FWD';
export type MatchStatus = 'scheduled' | 'live' | 'halftime' | 'completed' | 'postponed' | 'cancelled';
export type LineupStatus = 'draft' | 'submitted' | 'locked' | 'live' | 'completed';

export interface Team {
    id: string;
    name: string;
    nameAr: string;
    logo: string;
    shortName: string;
}

export interface Match {
    id: string;
    homeTeam: Team;
    awayTeam: Team;
    venue: string;
    matchDate: Date;
    round: number;
    season: string;
    status: MatchStatus;
    currentMinute?: number;
    homeScore: number;
    awayScore: number;
    lineupDeadline: Date;
    totalParticipants: number;
    isActive: boolean;
}

export interface Player {
    id: string;
    name: string;
    nameAr: string;
    photo?: string;
    jerseyNumber: number;
    teamId: string;
    position: PlayerPosition;
    form: number[];
    totalPoints: number;
    averagePoints: number;
    isAvailable: boolean;
}

export interface PointsBreakdown {
    goalsPoints: number;
    assistsPoints: number;
    cleanSheetPoints: number;
    penaltySavePoints: number;
    savesPoints: number;
    minutesPlayedPoints: number;
    manOfTheMatchPoints: number;
    hatTrickPoints: number;
    yellowCardPoints: number;
    redCardPoints: number;
    total: number;
}

export interface PlayerMatchPerformance {
    id: string;
    playerId: string;
    matchId: string;
    minutesPlayed: number;
    goals: number;
    assists: number;
    cleanSheet: boolean;
    penaltySaves: number;
    saves: number;
    yellowCards: number;
    redCards: number;
    manOfTheMatch: boolean;
    hatTrick: boolean;
    pointsBreakdown: PointsBreakdown;
    totalPoints: number;
}

export interface LineupEntry {
    playerId: string;
    playerName?: string;
    jerseyNumber?: number;
    position: PlayerPosition;
    isCaptain: boolean;
    isBench: boolean;
    multiplier: number;
    pointsEarned: number;
}

export interface Lineup {
    id: string;
    userId: string;
    matchId: string;
    entries: LineupEntry[];
    formation: string;
    captainPlayerId: string;
    totalPoints: number;
    livePoints: number;
    rank: number;
    status: LineupStatus;
    submittedAt?: Date;
    lockedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface NotificationSettings {
    pushEnabled: boolean;
    emailEnabled: boolean;
    smsEnabled: boolean;
    matchReminders: boolean;
    matchResults: boolean;
    rankChanges: boolean;
    achievements: boolean;
    leagueUpdates: boolean;
    marketing: boolean;
}

export interface UserProfile {
    id: string;
    email: string;
    displayName: string;
    avatarUrl?: string;
    language: 'en' | 'ar';
    favoriteTeam?: string;
    notificationSettings: NotificationSettings;
    totalPoints: number;
    weeklyPoints?: number;
    matchesPlayed: number;
    averagePointsPerMatch: number;
    bestMatchScore: number;
    worstMatchScore: number;
    credits: number;
    isPremium: boolean;
    isAdmin?: boolean;
    level: number;
    achievements: string[];
    badges: string[];
    loginStreak: number;
    lastLoginDate: Date;
    lastActiveAt?: Date;
    lastLoginReward?: Date;
    friends?: string[];
    leagues?: string[];
    globalRank?: number;
    previousRank?: number;
    rankChange?: number;
    isActive: boolean;
    isBanned: boolean;
    status?: 'active' | 'suspended' | 'banned';
    statusReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface LeaderboardEntry {
    userId: string;
    displayName: string;
    avatarUrl?: string;
    points: number;
    rank: number;
    previousRank?: number;
    matchesPlayed: number;
}

export interface Formation {
    name: string;
    positions: {
        GK: number;
        DEF: number;
        MID: number;
        FWD: number;
    };
}

// Common formations
export const FORMATIONS: Formation[] = [
    { name: '4-4-2', positions: { GK: 1, DEF: 4, MID: 4, FWD: 2 } },
    { name: '4-3-3', positions: { GK: 1, DEF: 4, MID: 3, FWD: 3 } },
    { name: '3-5-2', positions: { GK: 1, DEF: 3, MID: 5, FWD: 2 } },
    { name: '3-4-3', positions: { GK: 1, DEF: 3, MID: 4, FWD: 3 } },
    { name: '5-3-2', positions: { GK: 1, DEF: 5, MID: 3, FWD: 2 } },
    { name: '4-5-1', positions: { GK: 1, DEF: 4, MID: 5, FWD: 1 } },
];
