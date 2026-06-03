/**
 * Credits System Cloud Functions
 * Handles credit earning, spending, and transactions
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

// Credit Earning Rules
const CREDIT_REWARDS = {
    dailyLogin: 10,
    matchParticipation: 20,
    weeklyRankTop10: 500,
    weeklyRankTop50: 200,
    weeklyRankTop100: 100,
    weeklyRankParticipation: 50,
    leagueWin: 500,
    achievement: 50,
    referral: 100,
};

// Power-Up Costs
const POWER_UP_COSTS = {
    captain_boost: 50,
    triple_captain: 100,
    bench_boost: 75,
    wild_card: 150,
};

/**
 * Award daily login credits
 * Tracks last login to prevent multiple awards per day
 */
export const awardDailyLoginCredits = functions.https.onCall(
    async (data: unknown, context) => {
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
        }

        const userId = context.auth.uid;

        try {
            const userRef = db.collection('users').doc(userId);
            const userDoc = await userRef.get();

            if (!userDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'User not found');
            }

            const userData = userDoc.data()!;
            const lastLoginReward = userData.lastLoginReward?.toDate();
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Check if user already claimed today's reward
            if (lastLoginReward && lastLoginReward >= today) {
                return {
                    success: false,
                    message: 'Daily reward already claimed',
                    credits: userData.credits || 0,
                };
            }

            // Award credits
            const creditsToAdd = CREDIT_REWARDS.dailyLogin;

            await db.runTransaction(async (transaction) => {
                // Update user credits
                transaction.update(userRef, {
                    credits: admin.firestore.FieldValue.increment(creditsToAdd),
                    lastLoginReward: admin.firestore.FieldValue.serverTimestamp(),
                    loginStreak: admin.firestore.FieldValue.increment(1),
                });

                // Create transaction record
                const transactionRef = db.collection('creditTransactions').doc();
                transaction.set(transactionRef, {
                    userId,
                    type: 'earn',
                    source: 'daily_login',
                    amount: creditsToAdd,
                    description: 'Daily login reward',
                    descriptionAr: 'مكافأة تسجيل الدخول اليومي',
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            });

            return {
                success: true,
                message: 'Daily reward claimed!',
                creditsEarned: creditsToAdd,
                credits: (userData.credits || 0) + creditsToAdd,
            };
        } catch (error) {
            console.error('Error awarding daily login credits:', error);
            throw new functions.https.HttpsError('internal', 'Failed to award credits');
        }
    }
);

/**
 * Award credits for match participation
 * Triggered when lineup is locked
 */
export const awardMatchParticipationCredits = functions.firestore
    .document('lineups/{lineupId}')
    .onUpdate(async (change, context) => {
        const before = change.before.data();
        const after = change.after.data();

        // Only process when lineup is locked (not draft anymore)
        if (before.status === 'draft' && after.status === 'locked') {
            const userId = after.userId;
            const matchId = after.matchId;
            const creditsToAdd = CREDIT_REWARDS.matchParticipation;

            try {
                await db.runTransaction(async (transaction) => {
                    // Update user credits
                    const userRef = db.collection('users').doc(userId);
                    transaction.update(userRef, {
                        credits: admin.firestore.FieldValue.increment(creditsToAdd),
                    });

                    // Create transaction record
                    const transactionRef = db.collection('creditTransactions').doc();
                    transaction.set(transactionRef, {
                        userId,
                        type: 'earn',
                        source: 'match_participation',
                        matchId,
                        amount: creditsToAdd,
                        description: 'Match participation reward',
                        descriptionAr: 'مكافأة المشاركة في المباراة',
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    });
                });

                console.log(`Awarded ${creditsToAdd} credits to user ${userId} for match ${matchId}`);
            } catch (error) {
                console.error('Error awarding participation credits:', error);
            }
        }

        return null;
    });

/**
 * Purchase a power-up
 * Deducts credits and activates power-up for specified lineup
 */
export const purchasePowerUp = functions.https.onCall(
    async (data: { powerUpType: string; lineupId: string }, context) => {
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
        }

        const { powerUpType, lineupId } = data;
        const userId = context.auth.uid;

        // Validate power-up type
        if (!Object.keys(POWER_UP_COSTS).includes(powerUpType)) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid power-up type');
        }

        const cost = POWER_UP_COSTS[powerUpType as keyof typeof POWER_UP_COSTS];

        try {
            const result = await db.runTransaction(async (transaction) => {
                // Get user
                const userRef = db.collection('users').doc(userId);
                const userDoc = await transaction.get(userRef);

                if (!userDoc.exists) {
                    throw new functions.https.HttpsError('not-found', 'User not found');
                }

                const userData = userDoc.data()!;
                const currentCredits = userData.credits || 0;

                if (currentCredits < cost) {
                    throw new functions.https.HttpsError('failed-precondition', 'Insufficient credits');
                }

                // Get lineup
                const lineupRef = db.collection('lineups').doc(lineupId);
                const lineupDoc = await transaction.get(lineupRef);

                if (!lineupDoc.exists) {
                    throw new functions.https.HttpsError('not-found', 'Lineup not found');
                }

                const lineupData = lineupDoc.data()!;

                if (lineupData.userId !== userId) {
                    throw new functions.https.HttpsError('permission-denied', 'Not your lineup');
                }

                if (lineupData.status !== 'draft') {
                    throw new functions.https.HttpsError('failed-precondition', 'Lineup already locked');
                }

                // Check for duplicate power-up
                const existingPowerUps = lineupData.powerUps || [];
                if (existingPowerUps.includes(powerUpType)) {
                    throw new functions.https.HttpsError('already-exists', 'Power-up already active');
                }

                // Deduct credits
                transaction.update(userRef, {
                    credits: admin.firestore.FieldValue.increment(-cost),
                });

                // Add power-up to lineup
                transaction.update(lineupRef, {
                    powerUps: admin.firestore.FieldValue.arrayUnion(powerUpType),
                });

                // Create transaction record
                const transactionRef = db.collection('creditTransactions').doc();
                transaction.set(transactionRef, {
                    userId,
                    type: 'spend',
                    source: `power_up_${powerUpType}`,
                    lineupId,
                    amount: -cost,
                    description: `Power-up: ${powerUpType.replace('_', ' ')}`,
                    descriptionAr: `قوة خاصة: ${powerUpType}`,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });

                return { newBalance: currentCredits - cost };
            });

            return {
                success: true,
                message: 'Power-up activated!',
                credits: result.newBalance,
            };
        } catch (error) {
            if (error instanceof functions.https.HttpsError) {
                throw error;
            }
            console.error('Error purchasing power-up:', error);
            throw new functions.https.HttpsError('internal', 'Failed to purchase power-up');
        }
    }
);

/**
 * Award weekly ranking rewards
 * Runs every Monday at 00:00
 */
export const awardWeeklyRewards = functions.pubsub
    .schedule('0 0 * * 1') // Every Monday at midnight
    .timeZone('Asia/Riyadh')
    .onRun(async () => {
        console.log('Awarding weekly ranking rewards...');

        try {
            // Get top ranked users
            const usersSnapshot = await db.collection('users')
                .orderBy('weeklyPoints', 'desc')
                .limit(100)
                .get();

            const batch = db.batch();
            let rank = 1;

            for (const userDoc of usersSnapshot.docs) {
                let creditsToAdd = CREDIT_REWARDS.weeklyRankParticipation;

                if (rank <= 10) {
                    creditsToAdd = CREDIT_REWARDS.weeklyRankTop10;
                } else if (rank <= 50) {
                    creditsToAdd = CREDIT_REWARDS.weeklyRankTop50;
                } else if (rank <= 100) {
                    creditsToAdd = CREDIT_REWARDS.weeklyRankTop100;
                }

                // Update user credits
                batch.update(userDoc.ref, {
                    credits: admin.firestore.FieldValue.increment(creditsToAdd),
                    weeklyPoints: 0, // Reset weekly points
                });

                // Create transaction record
                const transactionRef = db.collection('creditTransactions').doc();
                batch.set(transactionRef, {
                    userId: userDoc.id,
                    type: 'earn',
                    source: 'weekly_ranking',
                    amount: creditsToAdd,
                    rank: rank,
                    description: `Weekly ranking reward (Rank #${rank})`,
                    descriptionAr: `مكافأة الترتيب الأسبوعي (المركز #${rank})`,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });

                rank++;
            }

            await batch.commit();
            console.log(`Awarded weekly rewards to ${usersSnapshot.size} users`);

            return null;
        } catch (error) {
            console.error('Weekly rewards failed:', error);
            throw error;
        }
    });
