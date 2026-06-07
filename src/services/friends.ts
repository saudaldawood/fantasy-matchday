/**
 * Friends Service
 * Handles friend requests, friendships, and social features
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
    Timestamp,
    arrayUnion,
    arrayRemove,
    onSnapshot,
    Unsubscribe
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Types
export interface FriendRequest {
    id: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string | null;
    receiverId: string;
    receiverName: string;
    receiverAvatar?: string | null;
    status: 'pending' | 'accepted' | 'declined';
    createdAt: Timestamp;
    respondedAt?: Timestamp;
}

export interface Friend {
    id: string;
    odisplayName: string;
    avatarUrl?: string;
    totalPoints: number;
    rank?: number;
    lastActiveAt?: Timestamp;
}

export interface FriendComparison {
    odisplayName: string;
    odisplayNameAr?: string;
    odisplayAvatarUrl?: string;
    matchPoints: number;
    weeklyPoints: number;
    totalPoints: number;
    rank: number;
}

/**
 * Send a friend request
 */
export async function sendFriendRequest(
    senderId: string,
    senderName: string,
    senderAvatar: string | undefined,
    receiverId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Check if users are already friends
        const senderDoc = await getDoc(doc(db, 'users', senderId));
        const senderData = senderDoc.data();

        if (senderData?.friends?.includes(receiverId)) {
            return { success: false, error: 'Already friends with this user' };
        }

        // Check for existing pending request
        const existingQuery = query(
            collection(db, 'friendRequests'),
            where('senderId', '==', senderId),
            where('receiverId', '==', receiverId),
            where('status', '==', 'pending')
        );
        const existingSnap = await getDocs(existingQuery);

        if (!existingSnap.empty) {
            return { success: false, error: 'Friend request already sent' };
        }

        // Get receiver info
        const receiverDoc = await getDoc(doc(db, 'users', receiverId));
        const receiverData = receiverDoc.data();

        if (!receiverDoc.exists()) {
            return { success: false, error: 'User not found' };
        }

        // Create friend request
        const requestRef = doc(collection(db, 'friendRequests'));
        const request: Omit<FriendRequest, 'id'> = {
            senderId,
            senderName,
            senderAvatar: senderAvatar || null,
            receiverId,
            receiverName: receiverData?.displayName || 'User',
            receiverAvatar: receiverData?.avatarUrl || null,
            status: 'pending',
            createdAt: Timestamp.now(),
        };

        await setDoc(requestRef, request);

        // Create notification for receiver
        await setDoc(doc(collection(db, 'notifications')), {
            userId: receiverId,
            type: 'friend_request',
            title: 'New Friend Request',
            titleAr: 'طلب صداقة جديد',
            message: `${senderName} sent you a friend request`,
            messageAr: `${senderName} أرسل لك طلب صداقة`,
            isRead: false,
            data: { requestId: requestRef.id, senderId },
            createdAt: serverTimestamp(),
        });

        return { success: true };
    } catch (error: any) {
        console.error('Error sending friend request:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Accept a friend request
 */
export async function acceptFriendRequest(
    requestId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const requestRef = doc(db, 'friendRequests', requestId);
        const requestSnap = await getDoc(requestRef);

        if (!requestSnap.exists()) {
            return { success: false, error: 'Request not found' };
        }

        const request = requestSnap.data() as FriendRequest;

        if (request.status !== 'pending') {
            return { success: false, error: 'Request already processed' };
        }

        // Update request status
        await updateDoc(requestRef, {
            status: 'accepted',
            respondedAt: serverTimestamp(),
        });

        // Add each user to the other's friends array
        await updateDoc(doc(db, 'users', request.senderId), {
            friends: arrayUnion(request.receiverId),
        });

        await updateDoc(doc(db, 'users', request.receiverId), {
            friends: arrayUnion(request.senderId),
        });

        // Notify sender
        await setDoc(doc(collection(db, 'notifications')), {
            userId: request.senderId,
            type: 'friend_accepted',
            title: 'Friend Request Accepted',
            titleAr: 'تم قبول طلب الصداقة',
            message: `${request.receiverName} accepted your friend request`,
            messageAr: `${request.receiverName} قبل طلب صداقتك`,
            isRead: false,
            data: { friendId: request.receiverId },
            createdAt: serverTimestamp(),
        });

        return { success: true };
    } catch (error: any) {
        console.error('Error accepting friend request:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Decline a friend request
 */
export async function declineFriendRequest(
    requestId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const requestRef = doc(db, 'friendRequests', requestId);

        await updateDoc(requestRef, {
            status: 'declined',
            respondedAt: serverTimestamp(),
        });

        return { success: true };
    } catch (error: any) {
        console.error('Error declining friend request:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get pending friend requests for a user
 */
export async function getPendingRequests(
    userId: string
): Promise<FriendRequest[]> {
    const requestsQuery = query(
        collection(db, 'friendRequests'),
        where('receiverId', '==', userId),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(requestsQuery);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as FriendRequest));
}

/**
 * Get sent friend requests
 */
export async function getSentRequests(
    userId: string
): Promise<FriendRequest[]> {
    const requestsQuery = query(
        collection(db, 'friendRequests'),
        where('senderId', '==', userId),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(requestsQuery);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as FriendRequest));
}

/**
 * Get user's friends list
 */
export async function getFriendsList(
    userId: string
): Promise<Friend[]> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();
    const friendIds = userData?.friends || [];

    if (friendIds.length === 0) {
        return [];
    }

    const friends: Friend[] = [];

    // Fetch friend details (in batches of 10 for Firestore limits)
    for (let i = 0; i < friendIds.length; i += 10) {
        const batch = friendIds.slice(i, i + 10);
        const friendsQuery = query(
            collection(db, 'users'),
            where('id', 'in', batch)
        );

        const snapshot = await getDocs(friendsQuery);
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            friends.push({
                id: doc.id,
                odisplayName: data.displayName || 'User',
                avatarUrl: data.avatarUrl,
                totalPoints: data.totalPoints || 0,
                rank: data.globalRank,
                lastActiveAt: data.lastActiveAt,
            });
        });
    }

    // Sort by total points descending
    return friends.sort((a, b) => b.totalPoints - a.totalPoints);
}

/**
 * Remove a friend
 */
export async function removeFriend(
    userId: string,
    friendId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Remove from both users' friends arrays
        await updateDoc(doc(db, 'users', userId), {
            friends: arrayRemove(friendId),
        });

        await updateDoc(doc(db, 'users', friendId), {
            friends: arrayRemove(userId),
        });

        return { success: true };
    } catch (error: any) {
        console.error('Error removing friend:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get friends leaderboard (comparison)
 */
export async function getFriendsLeaderboard(
    userId: string,
    matchId?: string
): Promise<FriendComparison[]> {
    const friends = await getFriendsList(userId);

    if (friends.length === 0) {
        return [];
    }

    const comparisons: FriendComparison[] = friends.map((friend, index) => ({
        odisplayName: friend.odisplayName,
        odisplayAvatarUrl: friend.avatarUrl,
        matchPoints: 0, // Will be filled if matchId provided
        weeklyPoints: 0,
        totalPoints: friend.totalPoints,
        rank: index + 1,
    }));

    // If matchId provided, fetch match-specific points
    if (matchId) {
        const friendIds = friends.map(f => f.id);

        for (let i = 0; i < friendIds.length; i += 10) {
            const batch = friendIds.slice(i, i + 10);
            const lineupsQuery = query(
                collection(db, 'lineups'),
                where('matchId', '==', matchId),
                where('userId', 'in', batch)
            );

            const snapshot = await getDocs(lineupsQuery);
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const compIndex = comparisons.findIndex(
                    c => friends.find(f => f.id === data.userId)?.odisplayName === c.odisplayName
                );
                if (compIndex !== -1) {
                    comparisons[compIndex].matchPoints = data.totalPoints || 0;
                }
            });
        }
    }

    // Sort by match points if available, otherwise by total points
    return comparisons.sort((a, b) =>
        matchId ? b.matchPoints - a.matchPoints : b.totalPoints - a.totalPoints
    ).map((c, index) => ({ ...c, rank: index + 1 }));
}

/**
 * Search users for friend requests
 */
export async function searchUsers(
    searchTerm: string,
    currentUserId: string,
    limitCount: number = 20
): Promise<{ id: string; displayName: string; avatarUrl?: string }[]> {
    // Search by display name (case-insensitive partial match is not supported in Firestore)
    // We'll do a prefix match instead
    const usersQuery = query(
        collection(db, 'users'),
        where('displayName', '>=', searchTerm),
        where('displayName', '<=', searchTerm + '\uf8ff'),
        limit(limitCount)
    );

    const [snapshot, currentUserDoc] = await Promise.all([
        getDocs(usersQuery),
        getDoc(doc(db, 'users', currentUserId)),
    ]);

    const friendIds: string[] = currentUserDoc.data()?.friends || [];

    return snapshot.docs
        .filter(d => d.id !== currentUserId && !friendIds.includes(d.id))
        .map(d => ({
            id: d.id,
            displayName: d.data().displayName || 'User',
            avatarUrl: d.data().avatarUrl,
        }));
}

/**
 * Subscribe to friend requests (real-time)
 */
export function subscribeToPendingRequests(
    userId: string,
    callback: (requests: FriendRequest[]) => void
): Unsubscribe {
    const requestsQuery = query(
        collection(db, 'friendRequests'),
        where('receiverId', '==', userId),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(requestsQuery, (snapshot) => {
        const requests = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as FriendRequest));
        callback(requests);
    });
}

/**
 * Get friend's lineup for a match (only visible after match starts)
 */
export async function getFriendLineup(
    userId: string,
    friendId: string,
    matchId: string
): Promise<any | null> {
    // Check if they are actually friends
    const userDoc = await getDoc(doc(db, 'users', userId));
    const friends = userDoc.data()?.friends || [];

    if (!friends.includes(friendId)) {
        return null;
    }

    // Check if match has started
    const matchDoc = await getDoc(doc(db, 'matches', matchId));
    const matchStatus = matchDoc.data()?.status;

    if (matchStatus !== 'live' && matchStatus !== 'finished') {
        return null; // Can only view after match starts
    }

    // Get friend's lineup
    const lineupQuery = query(
        collection(db, 'lineups'),
        where('userId', '==', friendId),
        where('matchId', '==', matchId),
        limit(1)
    );

    const snapshot = await getDocs(lineupQuery);

    if (snapshot.empty) {
        return null;
    }

    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}
