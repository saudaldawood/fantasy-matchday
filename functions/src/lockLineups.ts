/**
 * Lineup Locking Cloud Function
 * Locks lineups when match kickoff time is reached
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

/**
 * Lock lineups for matches that are about to start
 * Runs every minute to check for matches starting soon
 */
export const lockLineups = functions.pubsub
    .schedule('every 1 minutes')
    .timeZone('Asia/Riyadh')
    .onRun(async () => {
        console.log('Checking for matches to lock...');

        const now = admin.firestore.Timestamp.now();

        try {
            // Find matches that are starting within the next minute but haven't been processed
            const matchesSnapshot = await db.collection('matches')
                .where('status', '==', 'upcoming')
                .where('matchDate', '<=', now)
                .get();

            if (matchesSnapshot.empty) {
                console.log('No matches need locking');
                return null;
            }

            console.log(`Found ${matchesSnapshot.size} matches to process`);

            for (const matchDoc of matchesSnapshot.docs) {
                const matchId = matchDoc.id;
                console.log(`Locking lineups for match ${matchId}`);

                // Get all draft lineups for this match
                const lineupsSnapshot = await db.collection('lineups')
                    .where('matchId', '==', matchId)
                    .where('status', '==', 'draft')
                    .get();

                if (lineupsSnapshot.empty) {
                    console.log(`No draft lineups found for match ${matchId}`);
                    continue;
                }

                const batch = db.batch();
                let lockedCount = 0;

                for (const lineupDoc of lineupsSnapshot.docs) {
                    const lineup = lineupDoc.data();

                    // Only lock if lineup has minimum required players
                    const playerCount = (lineup.players || []).length;

                    if (playerCount >= 11) {
                        batch.update(lineupDoc.ref, {
                            status: 'locked',
                            lockedAt: admin.firestore.FieldValue.serverTimestamp(),
                        });
                        lockedCount++;

                        // Create notification for user
                        const notificationRef = db.collection('notifications').doc();
                        batch.set(notificationRef, {
                            userId: lineup.userId,
                            type: 'lineup_locked',
                            title: 'Lineup Locked',
                            titleAr: 'تم إغلاق التشكيلة',
                            message: 'Your lineup has been locked. Good luck!',
                            messageAr: 'تم إغلاق تشكيلتك. حظاً موفقاً!',
                            matchId: matchId,
                            isRead: false,
                            createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        });
                    } else {
                        // Mark incomplete lineups as missed
                        batch.update(lineupDoc.ref, {
                            status: 'missed',
                            missedAt: admin.firestore.FieldValue.serverTimestamp(),
                            missedReason: 'Incomplete lineup',
                        });

                        // Notify user about missed lineup
                        const notificationRef = db.collection('notifications').doc();
                        batch.set(notificationRef, {
                            userId: lineup.userId,
                            type: 'lineup_missed',
                            title: 'Lineup Not Submitted',
                            titleAr: 'لم يتم تقديم التشكيلة',
                            message: 'Your lineup was incomplete and could not be locked.',
                            messageAr: 'كانت تشكيلتك غير مكتملة ولم يتم قفلها.',
                            matchId: matchId,
                            isRead: false,
                            createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        });
                    }
                }

                // Update match status to live if it has started
                batch.update(matchDoc.ref, {
                    status: 'live',
                    liveStartedAt: admin.firestore.FieldValue.serverTimestamp(),
                });

                await batch.commit();
                console.log(`Locked ${lockedCount} lineups for match ${matchId}`);
            }

            return null;
        } catch (error) {
            console.error('Lineup locking failed:', error);
            throw error;
        }
    });
