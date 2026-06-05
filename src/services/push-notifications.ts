/**
 * Push Notifications Service
 * Handles Firebase Cloud Messaging for push notifications
 */

import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

let messaging: Messaging | null = null;

/**
 * Initialize Firebase Messaging (browser only)
 */
export function initializeMessaging(): Messaging | null {
    if (typeof window === 'undefined') return null;

    try {
        const { getApp } = require('firebase/app');
        const app = getApp();
        messaging = getMessaging(app);
        return messaging;
    } catch (error) {
        console.error('Failed to initialize messaging:', error);
        return null;
    }
}

/**
 * Request notification permission and get FCM token
 */
export async function requestNotificationPermission(
    userId: string
): Promise<{ success: boolean; token?: string; error?: string }> {
    if (typeof window === 'undefined') {
        return { success: false, error: 'Not in browser environment' };
    }

    if (!('Notification' in window)) {
        return { success: false, error: 'Notifications not supported' };
    }

    try {
        const permission = await Notification.requestPermission();

        if (permission !== 'granted') {
            return { success: false, error: 'Permission denied' };
        }

        if (!messaging) {
            messaging = initializeMessaging();
        }

        if (!messaging) {
            return { success: false, error: 'Messaging not initialized' };
        }

        // Get FCM token
        const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
        });

        if (!token) {
            return { success: false, error: 'Failed to get FCM token' };
        }

        // Save token to user's document
        await saveTokenToDatabase(userId, token);

        return { success: true, token };
    } catch (error: any) {
        console.error('Error requesting notification permission:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Save FCM token to user's Firestore document
 */
async function saveTokenToDatabase(userId: string, token: string): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
        fcmTokens: [token], // Array to support multiple devices
        notificationsEnabled: true,
        updatedAt: new Date(),
    });
}

/**
 * Listen for foreground messages
 */
export function onForegroundMessage(
    callback: (payload: any) => void
): () => void {
    if (!messaging) {
        messaging = initializeMessaging();
    }

    if (!messaging) {
        console.warn('Messaging not available');
        return () => { };
    }

    return onMessage(messaging, (payload) => {
        console.log('Foreground message received:', payload);
        callback(payload);
    });
}

/**
 * Show local notification (for foreground messages)
 */
export function showLocalNotification(
    title: string,
    options?: NotificationOptions
): void {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        ...options,
    });
}

/**
 * Check if notifications are enabled
 */
export function areNotificationsEnabled(): boolean {
    if (typeof window === 'undefined') return false;
    if (!('Notification' in window)) return false;
    return Notification.permission === 'granted';
}

/**
 * Get notification permission status
 */
export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
    if (typeof window === 'undefined') return 'unsupported';
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission;
}

/**
 * Disable notifications for user
 */
export async function disableNotifications(userId: string): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
        fcmTokens: [],
        notificationsEnabled: false,
        updatedAt: new Date(),
    });
}
