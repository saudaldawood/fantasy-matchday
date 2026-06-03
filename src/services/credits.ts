/**
 * Credits Service
 * Handles credit operations on the frontend
 */

import {
    doc,
    getDoc,
    collection,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    Timestamp
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/lib/firebase';

// Types
export interface CreditTransaction {
    id: string;
    userId: string;
    type: 'earn' | 'spend' | 'purchase';
    source: string;
    amount: number;
    description: string;
    descriptionAr: string;
    createdAt: Timestamp;
}

export interface CreditPackage {
    id: string;
    name: string;
    nameAr: string;
    credits: number;
    bonus: number;
    price: number;
    priceDisplay: string;
}

// Credit packages available for purchase
export const CREDIT_PACKAGES: CreditPackage[] = [
    {
        id: 'small',
        name: '500 Credits',
        nameAr: '500 رصيد',
        credits: 500,
        bonus: 0,
        price: 499,
        priceDisplay: '$4.99',
    },
    {
        id: 'medium',
        name: '1,200 Credits',
        nameAr: '1,200 رصيد',
        credits: 1200,
        bonus: 200,
        price: 999,
        priceDisplay: '$9.99',
    },
    {
        id: 'large',
        name: '2,500 Credits',
        nameAr: '2,500 رصيد',
        credits: 2500,
        bonus: 500,
        price: 1999,
        priceDisplay: '$19.99',
    },
    {
        id: 'mega',
        name: '6,000 Credits',
        nameAr: '6,000 رصيد',
        credits: 6000,
        bonus: 1500,
        price: 4999,
        priceDisplay: '$49.99',
    },
];

// Power-ups
export interface PowerUp {
    id: string;
    name: string;
    nameAr: string;
    description: string;
    descriptionAr: string;
    cost: number;
    icon: string;
}

export const POWER_UPS: PowerUp[] = [
    {
        id: 'captain_boost',
        name: 'Captain Boost',
        nameAr: 'تعزيز الكابتن',
        description: 'Your captain gets 2x points for this match',
        descriptionAr: 'يحصل الكابتن على ضعف النقاط في هذه المباراة',
        cost: 50,
        icon: '⭐',
    },
    {
        id: 'triple_captain',
        name: 'Triple Captain',
        nameAr: 'كابتن ثلاثي',
        description: 'Your captain gets 3x points (once per month)',
        descriptionAr: 'يحصل الكابتن على ثلاثة أضعاف النقاط (مرة واحدة شهرياً)',
        cost: 100,
        icon: '👑',
    },
    {
        id: 'bench_boost',
        name: 'Bench Boost',
        nameAr: 'تعزيز البدلاء',
        description: 'All bench players score points this match',
        descriptionAr: 'جميع اللاعبين البدلاء يسجلون نقاط في هذه المباراة',
        cost: 75,
        icon: '🪑',
    },
    {
        id: 'wild_card',
        name: 'Wild Card',
        nameAr: 'الورقة الرابحة',
        description: 'Unlimited transfers for one matchday (twice per month)',
        descriptionAr: 'انتقالات غير محدودة ليوم مباراة واحد (مرتين شهرياً)',
        cost: 150,
        icon: '🃏',
    },
];

/**
 * Get user's credit balance
 */
export async function getUserCredits(userId: string): Promise<number> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return 0;
    return userDoc.data().credits || 0;
}

/**
 * Get user's transaction history
 */
export async function getTransactionHistory(
    userId: string,
    limitCount: number = 50
): Promise<CreditTransaction[]> {
    const transactionsQuery = query(
        collection(db, 'creditTransactions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
    );

    const snapshot = await getDocs(transactionsQuery);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    } as CreditTransaction));
}

/**
 * Claim daily login reward
 */
export async function claimDailyReward(): Promise<{
    success: boolean;
    creditsEarned?: number;
    credits?: number;
    message?: string;
}> {
    try {
        const claimReward = httpsCallable(functions, 'awardDailyLoginCredits');
        const result = await claimReward({});
        return result.data as {
            success: boolean;
            creditsEarned?: number;
            credits?: number;
            message?: string;
        };
    } catch (error) {
        console.error('Error claiming daily reward:', error);
        return { success: false, message: 'Failed to claim reward' };
    }
}

/**
 * Purchase a power-up
 */
export async function purchasePowerUp(
    powerUpType: string,
    lineupId: string
): Promise<{
    success: boolean;
    credits?: number;
    message?: string;
}> {
    try {
        const purchase = httpsCallable(functions, 'purchasePowerUp');
        const result = await purchase({ powerUpType, lineupId });
        return result.data as {
            success: boolean;
            credits?: number;
            message?: string;
        };
    } catch (error: unknown) {
        console.error('Error purchasing power-up:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to purchase power-up';
        return { success: false, message: errorMessage };
    }
}

/**
 * Create payment intent for credit purchase
 */
export async function createCreditPurchaseIntent(packageId: string): Promise<{
    clientSecret?: string;
    packageName?: string;
    credits?: number;
    error?: string;
}> {
    try {
        const createIntent = httpsCallable(functions, 'createPaymentIntent');
        const result = await createIntent({ packageId });
        return result.data as {
            clientSecret: string;
            packageName: string;
            credits: number;
        };
    } catch (error: unknown) {
        console.error('Error creating payment intent:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to create payment';
        return { error: errorMessage };
    }
}

/**
 * Check if user can use a specific power-up
 * (based on usage limits and current credits)
 */
export async function canUsePowerUp(
    userId: string,
    powerUpType: string
): Promise<{
    canUse: boolean;
    reason?: string;
}> {
    // Get user's credits
    const credits = await getUserCredits(userId);
    const powerUp = POWER_UPS.find(p => p.id === powerUpType);

    if (!powerUp) {
        return { canUse: false, reason: 'Invalid power-up' };
    }

    if (credits < powerUp.cost) {
        return { canUse: false, reason: 'Insufficient credits' };
    }

    // Check monthly limits for triple_captain and wild_card
    if (powerUpType === 'triple_captain' || powerUpType === 'wild_card') {
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const usageQuery = query(
            collection(db, 'creditTransactions'),
            where('userId', '==', userId),
            where('source', '==', `power_up_${powerUpType}`),
            where('createdAt', '>=', Timestamp.fromDate(monthStart))
        );

        const usageSnapshot = await getDocs(usageQuery);
        const maxUsage = powerUpType === 'triple_captain' ? 1 : 2;

        if (usageSnapshot.size >= maxUsage) {
            return {
                canUse: false,
                reason: `You've reached the monthly limit for this power-up`,
            };
        }
    }

    return { canUse: true };
}

/**
 * Get power-up usage stats for current month
 */
export async function getPowerUpUsageStats(userId: string): Promise<{
    triple_captain: { used: number; limit: number };
    wild_card: { used: number; limit: number };
}> {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const usageQuery = query(
        collection(db, 'creditTransactions'),
        where('userId', '==', userId),
        where('type', '==', 'spend'),
        where('createdAt', '>=', Timestamp.fromDate(monthStart))
    );

    const usageSnapshot = await getDocs(usageQuery);

    let tripleCaptainUsed = 0;
    let wildCardUsed = 0;

    usageSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.source === 'power_up_triple_captain') tripleCaptainUsed++;
        if (data.source === 'power_up_wild_card') wildCardUsed++;
    });

    return {
        triple_captain: { used: tripleCaptainUsed, limit: 1 },
        wild_card: { used: wildCardUsed, limit: 2 },
    };
}
