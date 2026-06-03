/**
 * Leaderboard Service
 * Handles fetching and managing leaderboard data from Firestore
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

// Types
export interface LeaderboardEntry {
    rank: number;
    userId: string;
    displayName: string;
    avatarUrl?: string;
    points: number;
    matchesPlayed: number;
    weeklyChange?: number; // +/- positions
}

export interface MatchLeaderboard {
    matchId: string;
    homeTeam: string;
    awayTeam: string;
    homeTeamLogo?: string;
    awayTeamLogo?: string;
    matchDate: Date;
    status: 'upcoming' | 'live' | 'finished';
    homeScore?: number;
    awayScore?: number;
    participantCount: number;
    topPlayers: LeaderboardEntry[];
}

export interface WeeklyLeaderboard {
    weekNumber: number;
    startDate: Date;
    endDate: Date;
    entries: LeaderboardEntry[];
    totalParticipants: number;
}

/**
 * Get global leaderboard (all-time rankings)
 */
export async function getGlobalLeaderboard(limitCount: number = 50): Promise<LeaderboardEntry[]> {
    try {
        const usersQuery = query(
            collection(db, 'users'),
            orderBy('totalPoints', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(usersQuery);

        return snapshot.docs.map((doc, index) => {
            const data = doc.data();
            return {
                rank: index + 1,
                userId: doc.id,
                displayName: data.displayName || 'Unknown Player',
                avatarUrl: data.avatarUrl,
                points: data.totalPoints || 0,
                matchesPlayed: data.matchesPlayed || 0,
                weeklyChange: data.weeklyRankChange || 0,
            };
        });
    } catch (error) {
        console.error('Error fetching global leaderboard:', error);
        return [];
    }
}

/**
 * Get leaderboard for a specific match
 */
export async function getMatchLeaderboard(
    matchId: string,
    limitCount: number = 50
): Promise<LeaderboardEntry[]> {
    try {
        const lineupsQuery = query(
            collection(db, 'lineups'),
            where('matchId', '==', matchId),
            where('status', 'in', ['submitted', 'completed']),
            orderBy('totalPoints', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(lineupsQuery);

        const entries: LeaderboardEntry[] = [];

        for (const [index, doc] of snapshot.docs.entries()) {
            const data = doc.data();

            // Get user info
            try {
                const userDoc = await getDocs(
                    query(collection(db, 'users'), where('__name__', '==', data.userId), limit(1))
                );

                if (!userDoc.empty) {
                    const userData = userDoc.docs[0].data();
                    entries.push({
                        rank: index + 1,
                        userId: data.userId,
                        displayName: userData.displayName || 'Unknown',
                        avatarUrl: userData.avatarUrl,
                        points: data.totalPoints || 0,
                        matchesPlayed: 1,
                    });
                }
            } catch {
                // Skip if user not found
            }
        }

        return entries;
    } catch (error) {
        console.error('Error fetching match leaderboard:', error);
        return [];
    }
}

/**
 * Get weekly leaderboard
 */
export async function getWeeklyLeaderboard(
    weekStart?: Date,
    limitCount: number = 50
): Promise<WeeklyLeaderboard> {
    const now = weekStart || new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    try {
        // Get all completed lineups for this week
        const lineupsQuery = query(
            collection(db, 'lineups'),
            where('status', '==', 'completed'),
            where('createdAt', '>=', Timestamp.fromDate(startOfWeek)),
            where('createdAt', '<=', Timestamp.fromDate(endOfWeek))
        );

        const snapshot = await getDocs(lineupsQuery);

        // Aggregate points per user
        const userPoints: Map<string, { points: number; matches: number }> = new Map();

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            const existing = userPoints.get(data.userId) || { points: 0, matches: 0 };
            userPoints.set(data.userId, {
                points: existing.points + (data.totalPoints || 0),
                matches: existing.matches + 1,
            });
        });

        // Get user details and create entries
        const entries: LeaderboardEntry[] = [];
        const sortedUsers = [...userPoints.entries()].sort((a, b) => b[1].points - a[1].points);

        for (const [index, [userId, stats]] of sortedUsers.slice(0, limitCount).entries()) {
            try {
                const userDoc = await getDocs(
                    query(collection(db, 'users'), where('__name__', '==', userId), limit(1))
                );

                if (!userDoc.empty) {
                    const userData = userDoc.docs[0].data();
                    entries.push({
                        rank: index + 1,
                        userId,
                        displayName: userData.displayName || 'Unknown',
                        avatarUrl: userData.avatarUrl,
                        points: stats.points,
                        matchesPlayed: stats.matches,
                    });
                }
            } catch {
                // Skip if user not found
            }
        }

        return {
            weekNumber: getWeekNumber(startOfWeek),
            startDate: startOfWeek,
            endDate: endOfWeek,
            entries,
            totalParticipants: userPoints.size,
        };
    } catch (error) {
        console.error('Error fetching weekly leaderboard:', error);
        return {
            weekNumber: getWeekNumber(startOfWeek),
            startDate: startOfWeek,
            endDate: endOfWeek,
            entries: [],
            totalParticipants: 0,
        };
    }
}

/**
 * Get recent matches with leaderboard summary
 */
export async function getRecentMatchesWithRankings(
    days: number = 7,
    limitCount: number = 10
): Promise<MatchLeaderboard[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
        const matchesQuery = query(
            collection(db, 'matches'),
            where('matchDate', '>=', Timestamp.fromDate(startDate)),
            orderBy('matchDate', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(matchesQuery);

        const matchLeaderboards: MatchLeaderboard[] = [];

        for (const doc of snapshot.docs) {
            const match = doc.data();

            // Get top 3 players for this match
            const topPlayers = await getMatchLeaderboard(doc.id, 3);

            // Count participants
            const participantsQuery = query(
                collection(db, 'lineups'),
                where('matchId', '==', doc.id),
                where('status', 'in', ['submitted', 'completed'])
            );
            const participantsSnapshot = await getDocs(participantsQuery);

            matchLeaderboards.push({
                matchId: doc.id,
                homeTeam: match.homeTeam?.name || 'Home',
                awayTeam: match.awayTeam?.name || 'Away',
                homeTeamLogo: match.homeTeam?.logo,
                awayTeamLogo: match.awayTeam?.logo,
                matchDate: match.matchDate?.toDate?.() || new Date(),
                status: match.status || 'upcoming',
                homeScore: match.homeScore,
                awayScore: match.awayScore,
                participantCount: participantsSnapshot.size,
                topPlayers,
            });
        }

        return matchLeaderboards;
    } catch (error) {
        console.error('Error fetching recent matches:', error);
        return [];
    }
}

/**
 * Get user's rank in global leaderboard
 */
export async function getUserGlobalRank(userId: string): Promise<number | null> {
    try {
        // Get the user's points
        const userDoc = await getDocs(
            query(collection(db, 'users'), where('__name__', '==', userId), limit(1))
        );

        if (userDoc.empty) return null;

        const userPoints = userDoc.docs[0].data().totalPoints || 0;

        // Count users with more points
        const higherRankedQuery = query(
            collection(db, 'users'),
            where('totalPoints', '>', userPoints)
        );

        const higherSnapshot = await getDocs(higherRankedQuery);
        return higherSnapshot.size + 1;
    } catch (error) {
        console.error('Error fetching user rank:', error);
        return null;
    }
}

/**
 * Helper: Get week number from date
 */
function getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
