/**
 * Referral System Cloud Functions
 * Handles referral codes and rewards
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { customAlphabet } from 'nanoid';

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);

/**
 * Generate referral code for user on creation
 * Triggered via Auth or direct user document creation
 */
export const generateReferralCode = functions.firestore
    .document('users/{userId}')
    .onCreate(async (snapshot, context) => {
        const userId = context.params.userId;
        const referralCode = nanoid();

        try {
            await snapshot.ref.update({
                referralCode: referralCode,
                referralCount: 0,
                referralEarnings: 0
            });

            // Index invitation code for lookup
            await db.collection('referralCodes').doc(referralCode).set({
                userId,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            console.log(`Generated referral code ${referralCode} for user ${userId}`);
        } catch (error) {
            console.error('Error generating referral code:', error);
        }
    });

/**
 * Apply referral code
 * Called by new user to claim referral reward
 */
export const applyReferralCode = functions.https.onCall(
    async (data: { code: string }, context) => {
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'Auth required');
        }

        const userId = context.auth.uid;
        const code = data.code.toUpperCase();

        try {
            const userRef = db.collection('users').doc(userId);
            const userDoc = await userRef.get();

            if (userDoc.data()?.referredBy) {
                throw new functions.https.HttpsError('failed-precondition', 'Referral code already applied');
            }

            // Find referrer
            const codeDoc = await db.collection('referralCodes').doc(code).get();
            if (!codeDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'Invalid referral code');
            }

            const referrerId = codeDoc.data()!.userId;

            if (referrerId === userId) {
                throw new functions.https.HttpsError('invalid-argument', 'Cannot refer yourself');
            }

            const REWARD_AMOUNT = 100;

            await db.runTransaction(async (transaction) => {
                // Update new user
                transaction.update(userRef, {
                    referredBy: referrerId,
                    referralAppliedAt: admin.firestore.FieldValue.serverTimestamp(),
                    credits: admin.firestore.FieldValue.increment(REWARD_AMOUNT) // Bonus for using code? Optional
                });

                // Update referrer
                const referrerRef = db.collection('users').doc(referrerId);
                transaction.update(referrerRef, {
                    referralCount: admin.firestore.FieldValue.increment(1),
                    referralEarnings: admin.firestore.FieldValue.increment(REWARD_AMOUNT),
                    credits: admin.firestore.FieldValue.increment(REWARD_AMOUNT)
                });

                // Record transactions
                const newTxRef = db.collection('creditTransactions').doc();
                transaction.set(newTxRef, {
                    userId: userId,
                    type: 'earn',
                    source: 'referral_bonus',
                    amount: REWARD_AMOUNT,
                    description: 'Bonus for using referral code',
                    descriptionAr: 'مكافأة استخدام رمز الدعوة',
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });

                const refTxRef = db.collection('creditTransactions').doc();
                transaction.set(refTxRef, {
                    userId: referrerId,
                    type: 'earn',
                    source: 'referral_reward',
                    amount: REWARD_AMOUNT,
                    description: 'Reward for referring a friend',
                    descriptionAr: 'مكافأة دعوة صديق',
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });
            });

            return { success: true, reward: REWARD_AMOUNT };

        } catch (error) {
            console.error('Error applying referral:', error);
            if (error instanceof functions.https.HttpsError) throw error;
            throw new functions.https.HttpsError('internal', 'Failed to apply referral');
        }
    }
);
