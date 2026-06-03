/**
 * Stripe Payment Integration
 * Handles credit purchases via Stripe
 */

import * as functions from 'firebase-functions';
import { defineSecret } from 'firebase-functions/params';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

// Define secrets
const stripeSecretKey = defineSecret('STRIPE_SECRET_KEY');
const stripeWebhookSecret = defineSecret('STRIPE_WEBHOOK_SECRET');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

// Credit packages
const CREDIT_PACKAGES = {
    small: {
        credits: 500,
        bonus: 0,
        price: 499, // $4.99 in cents
        name: '500 Credits',
        nameAr: '500 رصيد',
    },
    medium: {
        credits: 1200,
        bonus: 200,
        price: 999, // $9.99
        name: '1,200 Credits (+200 Bonus)',
        nameAr: '1,200 رصيد (+200 مكافأة)',
    },
    large: {
        credits: 2500,
        bonus: 500,
        price: 1999, // $19.99
        name: '2,500 Credits (+500 Bonus)',
        nameAr: '2,500 رصيد (+500 مكافأة)',
    },
    mega: {
        credits: 6000,
        bonus: 1500,
        price: 4999, // $49.99
        name: '6,000 Credits (+1,500 Bonus)',
        nameAr: '6,000 رصيد (+1,500 مكافأة)',
    },
};

/**
 * Initialize Stripe with secret key
 */
function getStripeClient(): Stripe {
    const key = stripeSecretKey.value();

    if (!key) {
        throw new functions.https.HttpsError(
            'failed-precondition',
            'Stripe is not configured. Set STRIPE_SECRET_KEY secret.'
        );
    }

    return new Stripe(key, {
        apiVersion: '2023-10-16',
    });
}

export const createPaymentIntent = functions
    .runWith({ secrets: [stripeSecretKey] })
    .https.onCall(
        async (data: { packageId: string }, context) => {
            if (!context.auth) {
                throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
            }

            const { packageId } = data;
            const userId = context.auth.uid;

            // Validate package
            if (!Object.keys(CREDIT_PACKAGES).includes(packageId)) {
                throw new functions.https.HttpsError('invalid-argument', 'Invalid package');
            }

            const package_ = CREDIT_PACKAGES[packageId as keyof typeof CREDIT_PACKAGES];

            try {
                const stripe = getStripeClient();

                // Get user email
                const userDoc = await db.collection('users').doc(userId).get();
                const userData = userDoc.data();
                const userEmail = userData?.email || context.auth.token.email;

                // Create payment intent
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: package_.price,
                    currency: 'usd',
                    metadata: {
                        userId,
                        packageId,
                        credits: package_.credits.toString(),
                        bonus: package_.bonus.toString(),
                    },
                    receipt_email: userEmail,
                    description: `Fantasy Matchday - ${package_.name}`,
                });

                // Store pending transaction
                await db.collection('pendingTransactions').doc(paymentIntent.id).set({
                    userId,
                    packageId,
                    credits: package_.credits,
                    bonus: package_.bonus,
                    amount: package_.price,
                    status: 'pending',
                    paymentIntentId: paymentIntent.id,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });

                return {
                    clientSecret: paymentIntent.client_secret,
                    packageName: package_.name,
                    credits: package_.credits + package_.bonus,
                };
            } catch (error) {
                console.error('Error creating payment intent:', error);
                throw new functions.https.HttpsError('internal', 'Failed to create payment');
            }
        }
    );

/**
 * Handle Stripe webhooks
 * Called by Stripe when payment events occur
 */
export const handleStripeWebhook = functions
    .runWith({ secrets: [stripeSecretKey, stripeWebhookSecret] })
    .https.onRequest(async (req, res) => {
        const stripe = getStripeClient();
        const webhookSecret = stripeWebhookSecret.value();

        if (!webhookSecret) {
            console.error('Webhook secret not configured');
            res.status(500).send('Webhook secret not configured');
            return;
        }

        const signature = req.headers['stripe-signature'] as string;

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(
                req.rawBody,
                signature,
                webhookSecret
            );
        } catch (error) {
            console.error('Webhook signature verification failed:', error);
            res.status(400).send('Webhook signature verification failed');
            return;
        }

        console.log(`Processing webhook event: ${event.type}`);

        switch (event.type) {
            case 'payment_intent.succeeded':
                await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
                break;

            case 'payment_intent.payment_failed':
                await handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.status(200).json({ received: true });
    });

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const { userId, packageId, credits, bonus } = paymentIntent.metadata;

    if (!userId || !packageId) {
        console.error('Missing metadata in payment intent');
        return;
    }

    const totalCredits = parseInt(credits) + parseInt(bonus);

    try {
        await db.runTransaction(async (transaction) => {
            // Update user credits
            const userRef = db.collection('users').doc(userId);
            transaction.update(userRef, {
                credits: admin.firestore.FieldValue.increment(totalCredits),
                totalPurchases: admin.firestore.FieldValue.increment(1),
                totalSpent: admin.firestore.FieldValue.increment(paymentIntent.amount / 100),
            });

            // Create transaction record
            const transactionRef = db.collection('creditTransactions').doc();
            transaction.set(transactionRef, {
                userId,
                type: 'purchase',
                source: 'stripe',
                packageId,
                amount: totalCredits,
                baseCredits: parseInt(credits),
                bonusCredits: parseInt(bonus),
                amountPaid: paymentIntent.amount / 100,
                currency: paymentIntent.currency,
                paymentIntentId: paymentIntent.id,
                description: `Credit purchase: ${packageId} package`,
                descriptionAr: `شراء رصيد: باقة ${packageId}`,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            // Update pending transaction
            const pendingRef = db.collection('pendingTransactions').doc(paymentIntent.id);
            transaction.update(pendingRef, {
                status: 'completed',
                completedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            // Create notification
            const notificationRef = db.collection('notifications').doc();
            transaction.set(notificationRef, {
                userId,
                type: 'purchase_complete',
                title: 'Purchase Complete',
                titleAr: 'تم الشراء',
                message: `${totalCredits} credits have been added to your account!`,
                messageAr: `تمت إضافة ${totalCredits} رصيد إلى حسابك!`,
                isRead: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        });

        console.log(`Successfully credited ${totalCredits} to user ${userId}`);
    } catch (error) {
        console.error('Error processing successful payment:', error);
        throw error;
    }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
    const { userId } = paymentIntent.metadata;

    if (!userId) {
        return;
    }

    try {
        // Update pending transaction
        await db.collection('pendingTransactions').doc(paymentIntent.id).update({
            status: 'failed',
            failedAt: admin.firestore.FieldValue.serverTimestamp(),
            failureMessage: paymentIntent.last_payment_error?.message || 'Payment failed',
        });

        // Create notification
        await db.collection('notifications').add({
            userId,
            type: 'purchase_failed',
            title: 'Purchase Failed',
            titleAr: 'فشل الشراء',
            message: 'Your credit purchase could not be completed. Please try again.',
            messageAr: 'تعذر إتمام عملية الشراء. يرجى المحاولة مرة أخرى.',
            isRead: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`Payment failed for user ${userId}`);
    } catch (error) {
        console.error('Error processing failed payment:', error);
    }
}

/**
 * Get transaction history
 */
export const getTransactionHistory = functions.https.onCall(
    async (data: { limit?: number }, context) => {
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
        }

        const userId = context.auth.uid;
        const limit = Math.min(data.limit || 50, 100);

        try {
            const transactionsSnapshot = await db.collection('creditTransactions')
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .limit(limit)
                .get();

            const transactions = transactionsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate().toISOString(),
            }));

            return { transactions };
        } catch (error) {
            console.error('Error fetching transaction history:', error);
            throw new functions.https.HttpsError('internal', 'Failed to fetch transactions');
        }
    }
);
