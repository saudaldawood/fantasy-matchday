/**
 * Scheduled Notifications Cloud Functions
 * Handles match reminders and deadline alerts
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();
const messaging = admin.messaging();

/**
 * Send match reminders 30 minutes before kickoff
 * Runs every 15 minutes to check for upcoming matches
 */
export const sendMatchReminders = functions.pubsub
    .schedule('every 15 minutes')
    .timeZone('Asia/Riyadh')
    .onRun(async () => {
        console.log('Checking for upcoming matches...');

        const now = new Date();
        const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
        const fortyFiveMinutesFromNow = new Date(now.getTime() + 45 * 60 * 1000);

        try {
            // Find matches starting in 30-45 minutes
            const matchesSnapshot = await db.collection('matches')
                .where('matchDate', '>=', thirtyMinutesFromNow)
                .where('matchDate', '<=', fortyFiveMinutesFromNow)
                .get();

            if (matchesSnapshot.empty) {
                console.log('No upcoming matches found for reminders');
                return null;
            }

            // Get users with notifications enabled
            // Note: In a real app with many users, this needs to be batched or use topic subscription
            // For MVP, checking user preferences individually or sending to a 'all_users' topic is fine
            // We'll assume topic subscription 'match_reminders' is used

            const messages: admin.messaging.Message[] = [];

            for (const matchDoc of matchesSnapshot.docs) {
                const match = matchDoc.data();
                const homeTeamParams = match.homeTeam?.name || 'Home Team';
                const awayTeamParams = match.awayTeam?.name || 'Away Team';

                const message: admin.messaging.Message = {
                    topic: 'match_reminders',
                    notification: {
                        title: 'Match Starting Soon! ⚽',
                        body: `${homeTeamParams} vs ${awayTeamParams} kicks off in 30 minutes!`,
                    },
                    data: {
                        type: 'match_reminder',
                        matchId: matchDoc.id,
                        url: `/matches/${matchDoc.id}`
                    },
                    android: {
                        notification: {
                            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
                        }
                    },
                    webpush: {
                        fcmOptions: {
                            link: `/matches/${matchDoc.id}`
                        }
                    }
                };

                messages.push(message);
            }

            if (messages.length > 0) {
                // Send messages
                // Note: sendAll is deprecated in some versions, using sendEach is better but send() for topics
                // Since these are per match (topic), we send one by one
                for (const msg of messages) {
                    await messaging.send(msg);
                }
                console.log(`Sent reminders for ${messages.length} matches`);
            }

            return null;
        } catch (error) {
            console.error('Error sending match reminders:', error);
            return null;
        }
    });

/**
 * Send deadline reminders 1 hour before kickoff
 */
export const sendDeadlineReminders = functions.pubsub
    .schedule('every 15 minutes')
    .timeZone('Asia/Riyadh')
    .onRun(async () => {
        const now = new Date();
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
        const oneHourFifteenFromNow = new Date(now.getTime() + 75 * 60 * 1000);

        try {
            // Find matches starting in 60-75 minutes (deadline approaching)
            const matchesSnapshot = await db.collection('matches')
                .where('matchDate', '>=', oneHourFromNow)
                .where('matchDate', '<=', oneHourFifteenFromNow)
                .get();

            if (matchesSnapshot.empty) {
                return null;
            }

            for (const matchDoc of matchesSnapshot.docs) {
                const match = matchDoc.data();

                const message: admin.messaging.Message = {
                    topic: 'deadline_reminders',
                    notification: {
                        title: 'Lineup Deadline Approaching! ⏳',
                        body: `1 hour left to set your lineup for ${match.homeTeam?.name} vs ${match.awayTeam?.name}`,
                    },
                    data: {
                        type: 'deadline_reminder',
                        matchId: matchDoc.id,
                        url: `/lineup/${matchDoc.id}`
                    },
                    webpush: {
                        fcmOptions: {
                            link: `/lineup/${matchDoc.id}`
                        }
                    }
                };

                await messaging.send(message);
            }

            console.log(`Sent deadline reminders for ${matchesSnapshot.size} matches`);
            return null;

        } catch (error) {
            console.error('Error sending deadline reminders:', error);
            return null;
        }
    });
