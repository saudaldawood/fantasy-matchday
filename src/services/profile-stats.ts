/**
 * Profile Statistics Service
 * Handles user performance analytics and match history
 */

import {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Lineup } from '@/types/app';

// Types
export interface MatchPerformance {
    matchId: string;
    matchDate: Date;
    homeTeam: string;
    awayTeam: string;
    score: string;
    points: number;
    rank: number;
    captainName: string;
    captainPoints: number;
}

export interface PerformanceStats {
    totalPoints: number;
    matchesPlayed: number;
    averagePoints: number;
    bestMatch: number;
    worstMatch: number;
    top10Finishes: number;
    top100Finishes: number;
    winningMatches: number;
    currentStreak: number;
    bestStreak: number;
    totalCaptainPoints: number;
    powerUpsUsed: number;
}

export interface WeeklyPerformance {
    weekNumber: number;
    weekStart: Date;
    points: number;
    matches: number;
    rank?: number;
}

/**
 * Get user's match history with performance data
 */
export async function getMatchHistory(
    userId: string,
    limitCount: number = 20
): Promise<MatchPerformance[]> {
    const lineupsQuery = query(
        collection(db, 'lineups'),
        where('userId', '==', userId),
        where('status', 'in', ['completed', 'locked']),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
    );

    const snapshot = await getDocs(lineupsQuery);
    const lineups = snapshot.docs.map(doc => doc.data() as Lineup);

    // Fetch match details for each lineup
    const performances: MatchPerformance[] = [];

    for (const lineup of lineups) {
        try {
            const matchDoc = await getDocs(
                query(collection(db, 'matches'), where('id', '==', lineup.matchId), limit(1))
            );

            if (!matchDoc.empty) {
                const match = matchDoc.docs[0].data();
                const captain = lineup.entries?.find(e => e.isCaptain);

                performances.push({
                    matchId: lineup.matchId,
                    matchDate: match.matchDate?.toDate?.() || new Date(),
                    homeTeam: match.homeTeam?.name || 'Home',
                    awayTeam: match.awayTeam?.name || 'Away',
                    score: `${match.homeScore || 0} - ${match.awayScore || 0}`,
                    points: lineup.totalPoints || 0,
                    rank: lineup.rank || 0,
                    captainName: 'Captain',
                    captainPoints: (captain?.pointsEarned || 0) * (captain?.multiplier || 1),
                });
            }
        } catch (error) {
            console.error('Error fetching match details:', error);
        }
    }

    return performances;
}

/**
 * Calculate performance statistics
 */
export async function getPerformanceStats(userId: string): Promise<PerformanceStats> {
    const lineupsQuery = query(
        collection(db, 'lineups'),
        where('userId', '==', userId),
        where('status', '==', 'completed')
    );

    const snapshot = await getDocs(lineupsQuery);
    const lineups = snapshot.docs.map(doc => doc.data() as Lineup);

    if (lineups.length === 0) {
        return {
            totalPoints: 0,
            matchesPlayed: 0,
            averagePoints: 0,
            bestMatch: 0,
            worstMatch: 0,
            top10Finishes: 0,
            top100Finishes: 0,
            winningMatches: 0,
            currentStreak: 0,
            bestStreak: 0,
            totalCaptainPoints: 0,
            powerUpsUsed: 0,
        };
    }

    const points = lineups.map(l => l.totalPoints || 0);
    const ranks = lineups.map(l => l.rank || 999);

    const totalPoints = points.reduce((a, b) => a + b, 0);
    const matchesPlayed = lineups.length;
    const averagePoints = Math.round(totalPoints / matchesPlayed);
    const bestMatch = Math.max(...points);
    const worstMatch = Math.min(...points);
    const top10Finishes = ranks.filter(r => r <= 10).length;
    const top100Finishes = ranks.filter(r => r <= 100).length;
    const winningMatches = ranks.filter(r => r === 1).length;

    // Calculate captain points
    let totalCaptainPoints = 0;
    let powerUpsUsed = 0;

    lineups.forEach(lineup => {
        const captain = lineup.entries?.find(e => e.isCaptain);
        if (captain) {
            totalCaptainPoints += (captain.pointsEarned || 0) * (captain.multiplier || 1);
        }
    });

    // Calculate streaks (simplified)
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    const sortedLineups = [...lineups].sort((a, b) => {
        const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : (a.createdAt as any)?.toDate?.()?.getTime() || 0;
        const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : (b.createdAt as any)?.toDate?.()?.getTime() || 0;
        return bTime - aTime;
    });

    sortedLineups.forEach((lineup, index) => {
        if (lineup.rank && lineup.rank <= 10) {
            tempStreak++;
            if (index === 0) currentStreak = tempStreak;
        } else {
            bestStreak = Math.max(bestStreak, tempStreak);
            tempStreak = 0;
        }
    });
    bestStreak = Math.max(bestStreak, tempStreak);

    return {
        totalPoints,
        matchesPlayed,
        averagePoints,
        bestMatch,
        worstMatch,
        top10Finishes,
        top100Finishes,
        winningMatches,
        currentStreak,
        bestStreak,
        totalCaptainPoints,
        powerUpsUsed,
    };
}

/**
 * Get weekly performance breakdown
 */
export async function getWeeklyPerformance(
    userId: string,
    weeks: number = 8
): Promise<WeeklyPerformance[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (weeks * 7));

    const lineupsQuery = query(
        collection(db, 'lineups'),
        where('userId', '==', userId),
        where('status', '==', 'completed'),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(lineupsQuery);
    const lineups = snapshot.docs.map(doc => doc.data() as Lineup);

    // Group by week
    const weeklyData: Map<number, { points: number; matches: number }> = new Map();

    lineups.forEach(lineup => {
        const createdAt = lineup.createdAt instanceof Date
            ? lineup.createdAt
            : (lineup.createdAt as any)?.toDate?.() || new Date();
        const weekNum = getWeekNumber(createdAt);
        const existing = weeklyData.get(weekNum) || { points: 0, matches: 0 };
        weeklyData.set(weekNum, {
            points: existing.points + (lineup.totalPoints || 0),
            matches: existing.matches + 1,
        });
    });

    // Convert to array
    const result: WeeklyPerformance[] = [];
    weeklyData.forEach((data, weekNum) => {
        result.push({
            weekNumber: weekNum,
            weekStart: getWeekStart(weekNum),
            points: data.points,
            matches: data.matches,
        });
    });

    return result.sort((a, b) => b.weekNumber - a.weekNumber);
}

/**
 * Get week number from date
 */
function getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Get week start date from week number
 */
function getWeekStart(weekNum: number): Date {
    const year = new Date().getFullYear();
    const simple = new Date(year, 0, 1 + (weekNum - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4) {
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }
    return ISOweekStart;
}

/**
 * Get position breakdown stats
 */
export function getPositionBreakdown(lineups: Lineup[]): Record<string, number> {
    const breakdown: Record<string, number> = {
        GK: 0,
        DEF: 0,
        MID: 0,
        FWD: 0,
    };

    lineups.forEach(lineup => {
        lineup.entries?.forEach(entry => {
            if (entry.position && breakdown[entry.position] !== undefined) {
                breakdown[entry.position] += entry.pointsEarned || 0;
            }
        });
    });

    return breakdown;
}
