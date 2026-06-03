/**
 * Admin Broadcast Notifications Cloud Function
 * Handles sending broadcast notifications to users
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

interface BroadcastInput {
    title: string;
    titleAr: string;
    message: string;
    messageAr: string;
    targetAudience: 'all' | 'premium' | 'league' | 'inactive';
    leagueId?: string;
    scheduledFor?: string; // ISO date string
}

/**
 * Send broadcast notification to targeted users
 */
export const sendBroadcastNotification = functions.https.onCall(
    async (data: BroadcastInput, context) => {
        // Check if caller is admin
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
        }

        const callerDoc = await db.collection('users').doc(context.auth.uid).get();
        const callerData = callerDoc.data();

        if (!callerData?.isAdmin) {
            throw new functions.https.HttpsError('permission-denied', 'Must be admin');
        }

        const { title, titleAr, message, messageAr, targetAudience, leagueId, scheduledFor } = data;

        // If scheduled, save to scheduled broadcasts
        if (scheduledFor) {
            const scheduledDate = new Date(scheduledFor);
            if (scheduledDate > new Date()) {
                await db.collection('scheduledBroadcasts').add({
                    title,
                    titleAr,
                    message,
                    messageAr,
                    targetAudience,
                    leagueId,
                    scheduledFor: admin.firestore.Timestamp.fromDate(scheduledDate),
                    status: 'pending',
                    createdBy: context.auth.uid,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });

                return { success: true, scheduled: true, scheduledFor };
            }
        }

        // Get target users
        let usersQuery: FirebaseFirestore.Query = db.collection('users');

        switch (targetAudience) {
            case 'premium':
                usersQuery = usersQuery.where('isPremium', '==', true);
                break;
            case 'league':
                if (leagueId) {
                    usersQuery = usersQuery.where('leagues', 'array-contains', leagueId);
                }
                break;
            case 'inactive':
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                usersQuery = usersQuery.where('lastActiveAt', '<', thirtyDaysAgo);
                break;
            // 'all' - no filter needed
        }

        const usersSnapshot = await usersQuery.get();
        const batch = db.batch();
        let count = 0;

        for (const userDoc of usersSnapshot.docs) {
            const notificationRef = db.collection('notifications').doc();
            batch.set(notificationRef, {
                userId: userDoc.id,
                type: 'broadcast',
                title,
                titleAr,
                message,
                messageAr,
                isRead: false,
                data: { broadcastId: Date.now().toString() },
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            count++;

            // Commit batch every 500 documents
            if (count % 500 === 0) {
                await batch.commit();
            }
        }

        // Commit remaining
        if (count % 500 !== 0) {
            await batch.commit();
        }

        // Log the broadcast
        await db.collection('broadcastHistory').add({
            title,
            titleAr,
            message,
            messageAr,
            targetAudience,
            leagueId,
            recipientCount: count,
            sentBy: context.auth.uid,
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`Broadcast sent to ${count} users`);

        return { success: true, recipientCount: count };
    }
);

/**
 * Process scheduled broadcasts
 * Runs every 15 minutes
 */
export const processScheduledBroadcasts = functions.pubsub
    .schedule('every 15 minutes')
    .timeZone('Asia/Riyadh')
    .onRun(async () => {
        const now = admin.firestore.Timestamp.now();

        const scheduledQuery = await db.collection('scheduledBroadcasts')
            .where('status', '==', 'pending')
            .where('scheduledFor', '<=', now)
            .get();

        if (scheduledQuery.empty) {
            console.log('No scheduled broadcasts to process');
            return null;
        }

        for (const broadcastDoc of scheduledQuery.docs) {
            const broadcast = broadcastDoc.data();

            try {
                // Process the broadcast
                let usersQuery: FirebaseFirestore.Query = db.collection('users');

                switch (broadcast.targetAudience) {
                    case 'premium':
                        usersQuery = usersQuery.where('isPremium', '==', true);
                        break;
                    case 'league':
                        if (broadcast.leagueId) {
                            usersQuery = usersQuery.where('leagues', 'array-contains', broadcast.leagueId);
                        }
                        break;
                    case 'inactive':
                        const thirtyDaysAgo = new Date();
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                        usersQuery = usersQuery.where('lastActiveAt', '<', thirtyDaysAgo);
                        break;
                }

                const usersSnapshot = await usersQuery.get();
                const batch = db.batch();
                let count = 0;

                for (const userDoc of usersSnapshot.docs) {
                    const notificationRef = db.collection('notifications').doc();
                    batch.set(notificationRef, {
                        userId: userDoc.id,
                        type: 'broadcast',
                        title: broadcast.title,
                        titleAr: broadcast.titleAr,
                        message: broadcast.message,
                        messageAr: broadcast.messageAr,
                        isRead: false,
                        data: { broadcastId: broadcastDoc.id },
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    });
                    count++;

                    if (count % 500 === 0) {
                        await batch.commit();
                    }
                }

                if (count % 500 !== 0) {
                    await batch.commit();
                }

                // Update broadcast status
                await broadcastDoc.ref.update({
                    status: 'sent',
                    recipientCount: count,
                    processedAt: admin.firestore.FieldValue.serverTimestamp(),
                });

                console.log(`Scheduled broadcast ${broadcastDoc.id} sent to ${count} users`);

            } catch (error) {
                console.error(`Error processing broadcast ${broadcastDoc.id}:`, error);
                await broadcastDoc.ref.update({
                    status: 'failed',
                    error: String(error),
                });
            }
        }

        return null;
    });

/**
 * Get broadcast history
 */
export const getBroadcastHistory = functions.https.onCall(
    async (data: { limit?: number }, context) => {
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
        }

        const callerDoc = await db.collection('users').doc(context.auth.uid).get();
        if (!callerDoc.data()?.isAdmin) {
            throw new functions.https.HttpsError('permission-denied', 'Must be admin');
        }

        const historyQuery = await db.collection('broadcastHistory')
            .orderBy('sentAt', 'desc')
            .limit(data.limit || 50)
            .get();

        const history = historyQuery.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        return { history };
    }
);
