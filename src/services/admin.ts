/**
 * Admin Service
 * Handles admin dashboard operations
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    addDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    serverTimestamp,
    Timestamp,
    getCountFromServer
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Types
export interface AdminUser {
    id: string;
    email: string;
    displayName: string;
    avatarUrl?: string;
    credits: number;
    totalPoints: number;
    matchesPlayed: number;
    globalRank?: number;
    isAdmin: boolean;
    isPremium: boolean;
    status: 'active' | 'suspended' | 'banned';
    createdAt: Timestamp;
    lastLoginAt?: Timestamp;
}

export interface AdminMatch {
    id: string;
    fixtureId: number;
    homeTeam: {
        id: number;
        name: string;
        logo: string;
    };
    awayTeam: {
        id: number;
        name: string;
        logo: string;
    };
    homeScore: number | null;
    awayScore: number | null;
    matchDate: Timestamp;
    status: 'upcoming' | 'live' | 'finished' | 'postponed';
    participantCount?: number;
}

export interface DashboardStats {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    totalMatches: number;
    liveMatches: number;
    matchesPlayed: number;
    totalRevenue: number;
    totalCreditsInCirculation: number;
    creditsInCirculation: number;
    averagePointsPerMatch: number;
    retentionRate: number;
}

/**
 * Check if user is admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return false;
    return userDoc.data().isAdmin === true;
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
    // Get user counts
    const usersCollection = collection(db, 'users');
    const totalUsersSnapshot = await getCountFromServer(usersCollection);
    const totalUsers = totalUsersSnapshot.data().count;

    // Active users in last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const activeUsersQuery = query(
        usersCollection,
        where('lastLoginAt', '>=', Timestamp.fromDate(weekAgo))
    );
    const activeUsersSnapshot = await getCountFromServer(activeUsersQuery);
    const activeUsers = activeUsersSnapshot.data().count;

    // New users today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersQuery = query(
        usersCollection,
        where('createdAt', '>=', Timestamp.fromDate(today))
    );
    const newUsersSnapshot = await getCountFromServer(newUsersQuery);
    const newUsersToday = newUsersSnapshot.data().count;

    // Match counts
    const matchesCollection = collection(db, 'matches');
    const totalMatchesSnapshot = await getCountFromServer(matchesCollection);
    const totalMatches = totalMatchesSnapshot.data().count;

    const liveMatchesQuery = query(
        matchesCollection,
        where('status', '==', 'live')
    );
    const liveMatchesSnapshot = await getCountFromServer(liveMatchesQuery);
    const liveMatches = liveMatchesSnapshot.data().count;

    // Revenue (sum of credit purchases)
    const purchasesQuery = query(
        collection(db, 'creditTransactions'),
        where('type', '==', 'purchase')
    );
    const purchasesSnapshot = await getDocs(purchasesQuery);
    let totalRevenue = 0;
    purchasesSnapshot.docs.forEach(doc => {
        totalRevenue += doc.data().amountPaid || 0;
    });

    // Total credits in circulation
    const usersSnapshot = await getDocs(usersCollection);
    let totalCreditsInCirculation = 0;
    usersSnapshot.docs.forEach(doc => {
        totalCreditsInCirculation += doc.data().credits || 0;
    });

    return {
        totalUsers,
        activeUsers,
        newUsersToday,
        totalMatches,
        liveMatches,
        matchesPlayed: totalMatches, // Will be updated with actual played count
        totalRevenue,
        totalCreditsInCirculation,
        creditsInCirculation: totalCreditsInCirculation,
        averagePointsPerMatch: 45, // Placeholder - calculate from actual data
        retentionRate: 68, // Placeholder - calculate from actual data
    };
}

/**
 * Get paginated user list
 */
export async function getUsers(
    pageSize: number = 20,
    lastUserId?: string,
    searchTerm?: string,
    statusFilter?: 'active' | 'suspended' | 'banned'
): Promise<{ users: AdminUser[]; hasMore: boolean }> {
    let usersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc'),
        limit(pageSize + 1)
    );

    if (statusFilter) {
        usersQuery = query(
            collection(db, 'users'),
            where('status', '==', statusFilter),
            orderBy('createdAt', 'desc'),
            limit(pageSize + 1)
        );
    }

    if (lastUserId) {
        const lastDoc = await getDoc(doc(db, 'users', lastUserId));
        if (lastDoc.exists()) {
            usersQuery = query(
                collection(db, 'users'),
                orderBy('createdAt', 'desc'),
                startAfter(lastDoc),
                limit(pageSize + 1)
            );
        }
    }

    const usersSnapshot = await getDocs(usersQuery);
    let users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    } as AdminUser));

    // Client-side search filter
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        users = users.filter(
            user =>
                user.email?.toLowerCase().includes(term) ||
                user.displayName?.toLowerCase().includes(term)
        );
    }

    const hasMore = users.length > pageSize;
    if (hasMore) users.pop();

    return { users, hasMore };
}

/**
 * Update user status (ban/suspend/activate)
 */
export async function updateUserStatus(
    userId: string,
    status: 'active' | 'suspended' | 'banned',
    reason?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await updateDoc(doc(db, 'users', userId), {
            status,
            statusReason: reason || null,
            statusUpdatedAt: serverTimestamp(),
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating user status:', error);
        return { success: false, error: 'Failed to update user status' };
    }
}

/**
 * Get paginated match list
 */
export async function getMatches(
    pageSize: number = 20,
    statusFilter?: 'upcoming' | 'live' | 'finished' | 'postponed'
): Promise<AdminMatch[]> {
    let matchesQuery = query(
        collection(db, 'matches'),
        orderBy('matchDate', 'desc'),
        limit(pageSize)
    );

    if (statusFilter) {
        matchesQuery = query(
            collection(db, 'matches'),
            where('status', '==', statusFilter),
            orderBy('matchDate', 'desc'),
            limit(pageSize)
        );
    }

    const matchesSnapshot = await getDocs(matchesQuery);

    const matches: AdminMatch[] = [];

    for (const matchDoc of matchesSnapshot.docs) {
        const matchData = matchDoc.data();

        // Get participant count for each match
        const lineupsQuery = query(
            collection(db, 'lineups'),
            where('matchId', '==', matchDoc.id)
        );
        const lineupsSnapshot = await getCountFromServer(lineupsQuery);

        matches.push({
            id: matchDoc.id,
            ...matchData,
            participantCount: lineupsSnapshot.data().count,
        } as AdminMatch);
    }

    return matches;
}

/**
 * Manually adjust user points
 */
export async function adjustUserPoints(
    userId: string,
    adjustment: number,
    reason: string,
    adminId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            return { success: false, error: 'User not found' };
        }

        const currentPoints = userDoc.data().totalPoints || 0;
        const newPoints = currentPoints + adjustment;

        await updateDoc(userRef, {
            totalPoints: newPoints,
            pointsAdjustedAt: serverTimestamp(),
        });

        // Log the adjustment
        await addDoc(collection(db, 'adminActions'), {
            type: 'points_adjustment',
            targetUserId: userId,
            adminId,
            adjustment,
            previousPoints: currentPoints,
            newPoints,
            reason,
            createdAt: serverTimestamp(),
        });

        return { success: true };
    } catch (error) {
        console.error('Error adjusting user points:', error);
        return { success: false, error: 'Failed to adjust points' };
    }
}

/**
 * Send broadcast notification
 */
export async function sendBroadcastNotification(
    title: string,
    titleAr: string,
    message: string,
    messageAr: string,
    adminId: string,
    targetAudience: 'all' | 'premium' | 'active'
): Promise<{ success: boolean; sentCount?: number; error?: string }> {
    try {
        // Get target users
        let usersQuery;

        if (targetAudience === 'premium') {
            usersQuery = query(
                collection(db, 'users'),
                where('isPremium', '==', true)
            );
        } else if (targetAudience === 'active') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            usersQuery = query(
                collection(db, 'users'),
                where('lastLoginAt', '>=', Timestamp.fromDate(weekAgo))
            );
        } else {
            usersQuery = query(collection(db, 'users'));
        }

        const usersSnapshot = await getDocs(usersQuery);

        // Create notifications for each user
        // In production, this should be done in a Cloud Function for scalability
        let sentCount = 0;

        for (const userDoc of usersSnapshot.docs) {
            await addDoc(collection(db, 'notifications'), {
                userId: userDoc.id,
                type: 'broadcast',
                title,
                titleAr,
                message,
                messageAr,
                isRead: false,
                createdAt: serverTimestamp(),
            });
            sentCount++;
        }

        // Log the action
        await addDoc(collection(db, 'adminActions'), {
            type: 'broadcast_notification',
            adminId,
            title,
            message,
            targetAudience,
            sentCount,
            createdAt: serverTimestamp(),
        });

        return { success: true, sentCount };
    } catch (error) {
        console.error('Error sending broadcast:', error);
        return { success: false, error: 'Failed to send broadcast' };
    }
}

/**
 * Get admin activity log
 */
export async function getAdminActivityLog(
    limitCount: number = 50
): Promise<Array<{
    id: string;
    type: string;
    adminId: string;
    createdAt: Timestamp;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}>> {
    const actionsQuery = query(
        collection(db, 'adminActions'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
    );

    const actionsSnapshot = await getDocs(actionsQuery);
    return actionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    })) as Array<{ id: string; type: string; adminId: string; createdAt: Timestamp;[key: string]: any }>;
}

/**
 * Update match manually (for corrections)
 */
export async function updateMatch(
    matchId: string,
    updates: Partial<{
        homeScore: number;
        awayScore: number;
        status: 'upcoming' | 'live' | 'finished' | 'postponed';
    }>,
    adminId: string,
    reason: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const matchRef = doc(db, 'matches', matchId);
        const matchDoc = await getDoc(matchRef);

        if (!matchDoc.exists()) {
            return { success: false, error: 'Match not found' };
        }

        const previousData = matchDoc.data();

        await updateDoc(matchRef, {
            ...updates,
            manuallyUpdatedAt: serverTimestamp(),
            manuallyUpdatedBy: adminId,
        });

        // Log the action
        await addDoc(collection(db, 'adminActions'), {
            type: 'match_update',
            matchId,
            adminId,
            previousData,
            updates,
            reason,
            createdAt: serverTimestamp(),
        });

        return { success: true };
    } catch (error) {
        console.error('Error updating match:', error);
        return { success: false, error: 'Failed to update match' };
    }
}
