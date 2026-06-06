"use strict";
/**
 * Referral System Cloud Functions
 * Handles referral codes and rewards
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyReferralCode = exports.generateReferralCode = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const nanoid_1 = require("nanoid");
// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
const nanoid = (0, nanoid_1.customAlphabet)('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);
/**
 * Generate referral code for user on creation
 * Triggered via Auth or direct user document creation
 */
exports.generateReferralCode = functions.firestore
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
    }
    catch (error) {
        console.error('Error generating referral code:', error);
    }
});
/**
 * Apply referral code
 * Called by new user to claim referral reward
 */
exports.applyReferralCode = functions.https.onCall(async (data, context) => {
    var _a;
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Auth required');
    }
    const userId = context.auth.uid;
    const code = data.code.toUpperCase();
    try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        if ((_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.referredBy) {
            throw new functions.https.HttpsError('failed-precondition', 'Referral code already applied');
        }
        // Find referrer
        const codeDoc = await db.collection('referralCodes').doc(code).get();
        if (!codeDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Invalid referral code');
        }
        const referrerId = codeDoc.data().userId;
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
    }
    catch (error) {
        console.error('Error applying referral:', error);
        if (error instanceof functions.https.HttpsError)
            throw error;
        throw new functions.https.HttpsError('internal', 'Failed to apply referral');
    }
});
//# sourceMappingURL=referrals.js.map