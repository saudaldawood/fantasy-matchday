/**
 * Leagues Service
 * Handles league creation, joining, and management
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    arrayUnion,
    arrayRemove,
    Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Types
export interface League {
    id: string;
    name: string;
    nameAr?: string;
    description: string;
    descriptionAr?: string;
    type: 'public' | 'private';
    scope: 'single_match' | 'weekly' | 'monthly' | 'season' | 'all_matches';
    inviteCode?: string;
    creatorId: string;
    adminIds: string[];
    memberCount: number;
    maxMembers: number;
    status: 'active' | 'archived';
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface LeagueMembership {
    id: string;
    leagueId: string;
    userId: string;
    displayName: string;
    avatarUrl?: string;
    status: 'active' | 'pending' | 'banned';
    totalPoints: number;
    weeklyPoints: number;
    leagueRank: number;
    previousLeagueRank?: number;
    leagueRankChange: number;
    joinedAt: Timestamp;
}

export interface CreateLeagueInput {
    name: string;
    nameAr?: string;
    description?: string;
    descriptionAr?: string;
    type?: 'public' | 'private';
    scope?: 'single_match' | 'weekly' | 'monthly' | 'season' | 'all_matches';
    maxMembers?: number;
}

/**
 * Generate a unique invite code
 */
function generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

/**
 * Create a new league
 */
export async function createLeague(
    userId: string,
    userDisplayName: string,
    input: CreateLeagueInput
): Promise<League> {
    const leagueId = doc(collection(db, 'leagues')).id;
    const inviteCode = generateInviteCode();

    const league: League = {
        id: leagueId,
        name: input.name,
        nameAr: input.nameAr,
        description: input.description || '',
        descriptionAr: input.descriptionAr,
        type: input.type || 'private',
        scope: input.scope || 'all_matches',
        inviteCode,
        creatorId: userId,
        adminIds: [userId],
        memberCount: 1,
        maxMembers: input.maxMembers || 50,
        status: 'active',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    };

    // Create league document
    await setDoc(doc(db, 'leagues', leagueId), league);

    // Add creator as first member
    const membershipId = `${leagueId}_${userId}`;
    const membership: LeagueMembership = {
        id: membershipId,
        leagueId,
        userId,
        displayName: userDisplayName,
        status: 'active',
        totalPoints: 0,
        weeklyPoints: 0,
        leagueRank: 1,
        leagueRankChange: 0,
        joinedAt: Timestamp.now(),
    };

    await setDoc(doc(db, 'leagueMemberships', membershipId), membership);

    return league;
}

/**
 * Join a league by invite code
 */
export async function joinLeagueByCode(
    userId: string,
    userDisplayName: string,
    userAvatarUrl: string | undefined,
    inviteCode: string
): Promise<{ success: boolean; league?: League; error?: string }> {
    // Find league by invite code
    const leaguesQuery = query(
        collection(db, 'leagues'),
        where('inviteCode', '==', inviteCode.toUpperCase()),
        where('status', '==', 'active'),
        limit(1)
    );

    const leaguesSnapshot = await getDocs(leaguesQuery);

    if (leaguesSnapshot.empty) {
        return { success: false, error: 'Invalid invite code' };
    }

    const leagueDoc = leaguesSnapshot.docs[0];
    const league = leagueDoc.data() as League;

    // Check if already a member
    const membershipId = `${league.id}_${userId}`;
    const existingMembership = await getDoc(doc(db, 'leagueMemberships', membershipId));

    if (existingMembership.exists()) {
        const membershipData = existingMembership.data();
        if (membershipData.status === 'banned') {
            return { success: false, error: 'You are banned from this league' };
        }
        return { success: false, error: 'You are already a member of this league' };
    }

    // Check if league is full
    if (league.memberCount >= league.maxMembers) {
        return { success: false, error: 'This league is full' };
    }

    // Add membership
    const membership: LeagueMembership = {
        id: membershipId,
        leagueId: league.id,
        userId,
        displayName: userDisplayName,
        avatarUrl: userAvatarUrl,
        status: 'active',
        totalPoints: 0,
        weeklyPoints: 0,
        leagueRank: league.memberCount + 1,
        leagueRankChange: 0,
        joinedAt: Timestamp.now(),
    };

    await setDoc(doc(db, 'leagueMemberships', membershipId), membership);

    // Update league member count
    await updateDoc(doc(db, 'leagues', league.id), {
        memberCount: league.memberCount + 1,
        updatedAt: serverTimestamp(),
    });

    return { success: true, league };
}

/**
 * Get user's leagues
 */
export async function getUserLeagues(userId: string): Promise<League[]> {
    const membershipsQuery = query(
        collection(db, 'leagueMemberships'),
        where('userId', '==', userId),
        where('status', '==', 'active')
    );

    const membershipsSnapshot = await getDocs(membershipsQuery);
    const leagueIds = membershipsSnapshot.docs.map(doc => doc.data().leagueId);

    if (leagueIds.length === 0) return [];

    // Fetch league details
    const leagues: League[] = [];
    for (const leagueId of leagueIds) {
        const leagueDoc = await getDoc(doc(db, 'leagues', leagueId));
        if (leagueDoc.exists() && leagueDoc.data().status === 'active') {
            leagues.push(leagueDoc.data() as League);
        }
    }

    return leagues;
}

/**
 * Get league details
 */
export async function getLeague(leagueId: string): Promise<League | null> {
    const leagueDoc = await getDoc(doc(db, 'leagues', leagueId));
    if (!leagueDoc.exists()) return null;
    return leagueDoc.data() as League;
}

/**
 * Get league leaderboard
 */
export async function getLeagueLeaderboard(
    leagueId: string,
    limitCount: number = 50
): Promise<LeagueMembership[]> {
    const membershipsQuery = query(
        collection(db, 'leagueMemberships'),
        where('leagueId', '==', leagueId),
        where('status', '==', 'active'),
        orderBy('totalPoints', 'desc'),
        limit(limitCount)
    );

    const membershipsSnapshot = await getDocs(membershipsQuery);
    return membershipsSnapshot.docs.map(doc => doc.data() as LeagueMembership);
}

/**
 * Leave a league
 */
export async function leaveLeague(
    leagueId: string,
    userId: string
): Promise<{ success: boolean; error?: string }> {
    const membershipId = `${leagueId}_${userId}`;
    const leagueDoc = await getDoc(doc(db, 'leagues', leagueId));

    if (!leagueDoc.exists()) {
        return { success: false, error: 'League not found' };
    }

    const league = leagueDoc.data() as League;

    // Creator cannot leave (they should delete the league)
    if (league.creatorId === userId) {
        return { success: false, error: 'Creator cannot leave. Delete the league instead.' };
    }

    // Delete membership
    await deleteDoc(doc(db, 'leagueMemberships', membershipId));

    // Update league member count and admin list
    await updateDoc(doc(db, 'leagues', leagueId), {
        memberCount: league.memberCount - 1,
        adminIds: arrayRemove(userId),
        updatedAt: serverTimestamp(),
    });

    return { success: true };
}

/**
 * Update league settings (admin only)
 */
export async function updateLeagueSettings(
    leagueId: string,
    userId: string,
    updates: Partial<Pick<League, 'name' | 'nameAr' | 'description' | 'descriptionAr' | 'type' | 'maxMembers'>>
): Promise<{ success: boolean; error?: string }> {
    const leagueDoc = await getDoc(doc(db, 'leagues', leagueId));

    if (!leagueDoc.exists()) {
        return { success: false, error: 'League not found' };
    }

    const league = leagueDoc.data() as League;

    if (!league.adminIds.includes(userId)) {
        return { success: false, error: 'Only admins can update league settings' };
    }

    await updateDoc(doc(db, 'leagues', leagueId), {
        ...updates,
        updatedAt: serverTimestamp(),
    });

    return { success: true };
}

/**
 * Add admin to league
 */
export async function addLeagueAdmin(
    leagueId: string,
    requestorId: string,
    targetUserId: string
): Promise<{ success: boolean; error?: string }> {
    const leagueDoc = await getDoc(doc(db, 'leagues', leagueId));

    if (!leagueDoc.exists()) {
        return { success: false, error: 'League not found' };
    }

    const league = leagueDoc.data() as League;

    // Only creator can add admins
    if (league.creatorId !== requestorId) {
        return { success: false, error: 'Only the creator can add admins' };
    }

    // Check if target is a member
    const membershipId = `${leagueId}_${targetUserId}`;
    const membershipDoc = await getDoc(doc(db, 'leagueMemberships', membershipId));

    if (!membershipDoc.exists() || membershipDoc.data().status !== 'active') {
        return { success: false, error: 'User is not an active member' };
    }

    await updateDoc(doc(db, 'leagues', leagueId), {
        adminIds: arrayUnion(targetUserId),
        updatedAt: serverTimestamp(),
    });

    return { success: true };
}

/**
 * Remove member from league (admin only)
 */
export async function removeMember(
    leagueId: string,
    adminId: string,
    targetUserId: string
): Promise<{ success: boolean; error?: string }> {
    const leagueDoc = await getDoc(doc(db, 'leagues', leagueId));

    if (!leagueDoc.exists()) {
        return { success: false, error: 'League not found' };
    }

    const league = leagueDoc.data() as League;

    if (!league.adminIds.includes(adminId)) {
        return { success: false, error: 'Only admins can remove members' };
    }

    // Cannot remove the creator
    if (league.creatorId === targetUserId) {
        return { success: false, error: 'Cannot remove the league creator' };
    }

    // Update membership status to banned
    const membershipId = `${leagueId}_${targetUserId}`;
    await updateDoc(doc(db, 'leagueMemberships', membershipId), {
        status: 'banned',
    });

    // Update league
    await updateDoc(doc(db, 'leagues', leagueId), {
        memberCount: league.memberCount - 1,
        adminIds: arrayRemove(targetUserId),
        updatedAt: serverTimestamp(),
    });

    return { success: true };
}

/**
 * Search public leagues
 */
export async function searchPublicLeagues(
    searchTerm?: string,
    limitCount: number = 20
): Promise<League[]> {
    let leaguesQuery = query(
        collection(db, 'leagues'),
        where('privacy', '==', 'public'),
        where('status', '==', 'active'),
        orderBy('memberCount', 'desc'),
        limit(limitCount)
    );

    const leaguesSnapshot = await getDocs(leaguesQuery);
    let leagues = leaguesSnapshot.docs.map(doc => doc.data() as League);

    // Filter by search term if provided (client-side for simplicity)
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        leagues = leagues.filter(
            league =>
                league.name.toLowerCase().includes(term) ||
                league.description.toLowerCase().includes(term)
        );
    }

    return leagues;
}

/**
 * Delete league (creator only)
 */
export async function deleteLeague(
    leagueId: string,
    userId: string
): Promise<{ success: boolean; error?: string }> {
    const leagueDoc = await getDoc(doc(db, 'leagues', leagueId));

    if (!leagueDoc.exists()) {
        return { success: false, error: 'League not found' };
    }

    const league = leagueDoc.data() as League;

    if (league.creatorId !== userId) {
        return { success: false, error: 'Only the creator can delete the league' };
    }

    // Mark league as archived (soft delete)
    await updateDoc(doc(db, 'leagues', leagueId), {
        status: 'archived',
        updatedAt: serverTimestamp(),
    });

    return { success: true };
}

/**
 * Regenerate invite code (admin only)
 */
export async function regenerateInviteCode(
    leagueId: string,
    userId: string
): Promise<{ success: boolean; inviteCode?: string; error?: string }> {
    const leagueDoc = await getDoc(doc(db, 'leagues', leagueId));

    if (!leagueDoc.exists()) {
        return { success: false, error: 'League not found' };
    }

    const league = leagueDoc.data() as League;

    if (!league.adminIds.includes(userId)) {
        return { success: false, error: 'Only admins can regenerate the invite code' };
    }

    const newInviteCode = generateInviteCode();

    await updateDoc(doc(db, 'leagues', leagueId), {
        inviteCode: newInviteCode,
        updatedAt: serverTimestamp(),
    });

    return { success: true, inviteCode: newInviteCode };
}
