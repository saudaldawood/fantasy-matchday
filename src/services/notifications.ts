/**
 * Notifications Service
 * Handles notification CRUD operations
 */

import {
    collection,
    doc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    onSnapshot,
    Unsubscribe
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Types
export interface Notification {
    id: string;
    userId: string;
    type: 'match_reminder' | 'lineup_locked' | 'points_update' | 'rank_change' |
    'achievement' | 'league_invite' | 'broadcast' | 'purchase_complete' |
    'purchase_failed' | 'weekly_reward';
    title: string;
    titleAr: string;
    message: string;
    messageAr: string;
    isRead: boolean;
    data?: Record<string, unknown>;
    createdAt: Timestamp;
}

/**
 * Get notifications for a user
 */
export async function getUserNotifications(
    userId: string,
    limitCount: number = 50,
    unreadOnly: boolean = false
): Promise<Notification[]> {
    let notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
    );

    if (unreadOnly) {
        notificationsQuery = query(
            collection(db, 'notifications'),
            where('userId', '==', userId),
            where('isRead', '==', false),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );
    }

    const snapshot = await getDocs(notificationsQuery);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    } as Notification));
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
    const unreadQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('isRead', '==', false)
    );

    const snapshot = await getDocs(unreadQuery);
    return snapshot.size;
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string): Promise<void> {
    await updateDoc(doc(db, 'notifications', notificationId), {
        isRead: true,
    });
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(userId: string): Promise<void> {
    const unreadQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('isRead', '==', false)
    );

    const snapshot = await getDocs(unreadQuery);

    const updates = snapshot.docs.map(doc =>
        updateDoc(doc.ref, { isRead: true })
    );

    await Promise.all(updates);
}

/**
 * Subscribe to real-time notifications
 */
export function subscribeToNotifications(
    userId: string,
    callback: (notifications: Notification[]) => void
): Unsubscribe {
    const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(20)
    );

    return onSnapshot(notificationsQuery, (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        } as Notification));
        callback(notifications);
    });
}

/**
 * Subscribe to unread count changes
 */
export function subscribeToUnreadCount(
    userId: string,
    callback: (count: number) => void
): Unsubscribe {
    const unreadQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('isRead', '==', false)
    );

    return onSnapshot(unreadQuery, (snapshot) => {
        callback(snapshot.size);
    });
}

/**
 * Get notification icon based on type
 */
export function getNotificationIcon(type: Notification['type']): string {
    switch (type) {
        case 'match_reminder': return '⏰';
        case 'lineup_locked': return '🔒';
        case 'points_update': return '📊';
        case 'rank_change': return '🏆';
        case 'achievement': return '🎖️';
        case 'league_invite': return '🤝';
        case 'broadcast': return '📢';
        case 'purchase_complete': return '✅';
        case 'purchase_failed': return '❌';
        case 'weekly_reward': return '🎁';
        default: return '🔔';
    }
}

/**
 * Format notification time
 */
export function formatNotificationTime(timestamp: Timestamp): string {
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
}
