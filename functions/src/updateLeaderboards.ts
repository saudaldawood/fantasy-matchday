/**
 * Leaderboard Update Cloud Functions
 * Updates global and league leaderboards after points calculation
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

/**
 * Update leaderboards after points are updated
 * Runs every 5 minutes during active matches
 */
export const updateLeaderboards = functions.pubsub
    .schedule('every 5 minutes')
    .timeZone('Asia/Riyadh')
    .onRun(async () => {
        console.log('Updating leaderboards...');

        try {
            // Check if there are any live matches
            const liveMatchesSnapshot = await db.collection('matches')
                .where('status', '==', 'live')
                .limit(1)
                .get();

            if (liveMatchesSnapshot.empty) {
                console.log('No live matches, skipping leaderboard update');
                return null;
            }

            // Get all users ordered by total points
            const usersSnapshot = await db.collection('users')
                .orderBy('totalPoints', 'desc')
                .get();

            const batch = db.batch();
            let rank = 1;
            let previousPoints: number | null = null;
            let sameRankCount = 0;

            for (const userDoc of usersSnapshot.docs) {
                const userData = userDoc.data();
                const currentPoints = userData.totalPoints || 0;
                const previousRank = userData.globalRank || null;

                // Handle tied ranks
                if (previousPoints === currentPoints) {
                    sameRankCount++;
                } else {
                    rank = rank + sameRankCount;
                    sameRankCount = 1;
                    previousPoints = currentPoints;
                }

                // Calculate rank change
                let rankChange = 0;
                if (previousRank !== null) {
                    rankChange = previousRank - rank;
                }

                batch.update(userDoc.ref, {
                    globalRank: rank,
                    previousRank: previousRank,
                    rankChange: rankChange,
                    rankUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            }

            await batch.commit();
            console.log(`Updated ranks for ${usersSnapshot.size} users`);

            // Update league leaderboards
            await updateLeagueLeaderboards();

            return null;
        } catch (error) {
            console.error('Leaderboard update failed:', error);
            throw error;
        }
    });

/**
 * Update all league leaderboards
 */
async function updateLeagueLeaderboards() {
    console.log('Updating league leaderboards...');

    try {
        // Get all active leagues
        const leaguesSnapshot = await db.collection('leagues')
            .where('status', '==', 'active')
            .get();

        for (const leagueDoc of leaguesSnapshot.docs) {
            const leagueId = leagueDoc.id;

            // Get all memberships for this league ordered by points
            const membershipsSnapshot = await db.collection('leagueMemberships')
                .where('leagueId', '==', leagueId)
                .where('status', '==', 'active')
                .orderBy('totalPoints', 'desc')
                .get();

            const batch = db.batch();
            let rank = 1;

            for (const membershipDoc of membershipsSnapshot.docs) {
                const membershipData = membershipDoc.data();
                const previousRank = membershipData.leagueRank || null;

                // Calculate rank change
                let rankChange = 0;
                if (previousRank !== null) {
                    rankChange = previousRank - rank;
                }

                batch.update(membershipDoc.ref, {
                    leagueRank: rank,
                    previousLeagueRank: previousRank,
                    leagueRankChange: rankChange,
                    rankUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });

                rank++;
            }

            await batch.commit();
        }

        console.log(`Updated ${leaguesSnapshot.size} league leaderboards`);
    } catch (error) {
        console.error('League leaderboard update failed:', error);
    }
}

/**
 * Update global ranks when a match is completed
 * Triggered by match status change
 */
export const updateGlobalRanks = functions.firestore
    .document('matches/{matchId}')
    .onUpdate(async (change, context) => {
        const before = change.before.data();
        const after = change.after.data();

        // Only process when match just finished
        if (before.status !== 'finished' && after.status === 'finished') {
            console.log('Match finished, updating global ranks...');

            try {
                // Get all users ordered by total points
                const usersSnapshot = await db.collection('users')
                    .orderBy('totalPoints', 'desc')
                    .get();

                const batch = db.batch();
                let rank = 1;

                for (const userDoc of usersSnapshot.docs) {
                    const userData = userDoc.data();
                    const previousRank = userData.globalRank || null;

                    let rankChange = 0;
                    if (previousRank !== null) {
                        rankChange = previousRank - rank;
                    }

                    batch.update(userDoc.ref, {
                        globalRank: rank,
                        previousRank: previousRank,
                        rankChange: rankChange,
                        rankUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    });

                    rank++;
                }

                await batch.commit();
                console.log(`Final rank update for ${usersSnapshot.size} users`);

                return null;
            } catch (error) {
                console.error('Global rank update failed:', error);
                throw error;
            }
        }

        return null;
    });
