import {
    collection,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Lineup, LineupEntry, LineupStatus } from '@/types/app';

/**
 * Create a new lineup in Firestore
 */
export async function createLineup(
    userId: string,
    matchId: string,
    entries: LineupEntry[],
    formation: string,
    captainPlayerId: string
): Promise<string> {
    const lineupRef = doc(collection(db, 'lineups'));

    const lineup: Partial<Lineup> = {
        id: lineupRef.id,
        userId,
        matchId,
        entries,
        formation,
        captainPlayerId,
        totalPoints: 0,
        livePoints: 0,
        rank: 0,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    await setDoc(lineupRef, {
        ...lineup,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    return lineupRef.id;
}

/**
 * Update existing lineup
 */
export async function updateLineup(
    lineupId: string,
    updates: Partial<Lineup>
): Promise<void> {
    const lineupRef = doc(db, 'lineups', lineupId);

    await updateDoc(lineupRef, {
        ...updates,
        updatedAt: serverTimestamp(),
    });
}

/**
 * Submit lineup (change status from draft to submitted)
 */
export async function submitLineup(lineupId: string): Promise<void> {
    const lineupRef = doc(db, 'lineups', lineupId);

    await updateDoc(lineupRef, {
        status: 'submitted',
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

/**
 * Get user's lineup for a specific match
 */
export async function getUserLineupForMatch(
    userId: string,
    matchId: string
): Promise<Lineup | null> {
    const lineupsRef = collection(db, 'lineups');
    const q = query(
        lineupsRef,
        where('userId', '==', userId),
        where('matchId', '==', matchId)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return null;
    }

    // Sort client-side to get the latest one
    const lineups = snapshot.docs
        .map(d => ({ ...d.data(), id: d.id }) as Lineup)
        .sort((a, b) => {
            const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : new Date(a.createdAt).getTime();
            const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : new Date(b.createdAt).getTime();
            return dateB - dateA;
        });

    return lineups[0];
}

/**
 * Get lineup by ID
 */
export async function getLineupById(lineupId: string): Promise<Lineup | null> {
    const lineupRef = doc(db, 'lineups', lineupId);
    const snapshot = await getDoc(lineupRef);

    if (!snapshot.exists()) {
        return null;
    }

    return { ...snapshot.data(), id: snapshot.id } as Lineup;
}

/**
 * Get all lineups for a match (for leaderboard)
 */
export async function getMatchLineups(
    matchId: string,
    limitCount: number = 100
): Promise<Lineup[]> {
    const lineupsRef = collection(db, 'lineups');
    const q = query(
        lineupsRef,
        where('matchId', '==', matchId),
        limit(limitCount)
    );

    const snapshot = await getDocs(q);

    // Filter and sort client-side to avoid composite index requirement
    return snapshot.docs
        .map(d => ({ ...d.data(), id: d.id }) as Lineup)
        .filter(l => ['submitted', 'locked', 'completed'].includes(l.status))
        .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
}

/**
 * Save lineup draft (auto-save)
 */
export async function saveLineupDraft(
    userId: string,
    matchId: string,
    entries: LineupEntry[],
    formation: string,
    captainPlayerId: string | null
): Promise<string> {
    // Check if draft already exists
    const existing = await getUserLineupForMatch(userId, matchId);

    if (existing && existing.status === 'draft') {
        // Update existing draft
        await updateLineup(existing.id, {
            entries,
            formation,
            captainPlayerId: captainPlayerId || '',
        });
        return existing.id;
    } else if (existing && existing.status !== 'draft') {
        // Cannot update submitted lineup
        throw new Error('Cannot modify submitted lineup');
    } else {
        // Create new draft
        return await createLineup(
            userId,
            matchId,
            entries,
            formation,
            captainPlayerId || ''
        );
    }
}

/**
 * Get all lineups for a user (submitted, locked, completed)
 */
export async function getUserLineups(
    userId: string,
    limitCount: number = 50
): Promise<Lineup[]> {
    const lineupsRef = collection(db, 'lineups');
    // Simple query with only userId filter to avoid composite index requirement
    const q = query(
        lineupsRef,
        where('userId', '==', userId),
        limit(limitCount)
    );

    const snapshot = await getDocs(q);

    // Filter and sort client-side (include drafts too)
    const lineups = snapshot.docs
        .map(doc => ({ ...doc.data(), id: doc.id }) as Lineup)
        .filter(l => ['draft', 'submitted', 'locked', 'completed'].includes(l.status) && !(l as any).isDeleted)
        .sort((a, b) => {
            const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : new Date(a.createdAt).getTime();
            const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : new Date(b.createdAt).getTime();
            return dateB - dateA;
        });

    return lineups;
}

/**
 * Lock lineup when match starts
 */
export async function lockLineup(lineupId: string): Promise<void> {
    await updateDoc(doc(db, 'lineups', lineupId), {
        status: 'locked',
        lockedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

/**
 * Delete lineup (only drafts can be deleted)
 */
export async function deleteLineup(lineupId: string): Promise<void> {
    const lineup = await getLineupById(lineupId);

    if (!lineup) {
        throw new Error('Lineup not found');
    }

    if (lineup.status !== 'draft') {
        throw new Error('Can only delete draft lineups');
    }

    // Instead of deleting, mark as inactive (for history)
    await updateDoc(doc(db, 'lineups', lineupId), {
        status: 'draft',
        isDeleted: true,
        updatedAt: serverTimestamp(),
    });
}
