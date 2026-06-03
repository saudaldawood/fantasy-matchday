/**
 * Achievements Service
 * Handles achievements, badges, and gamification
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    query,
    where,
    Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Achievement definitions
export interface AchievementDefinition {
    id: string;
    name: string;
    nameAr: string;
    description: string;
    descriptionAr: string;
    icon: string;
    category: 'matches' | 'points' | 'ranks' | 'social' | 'special';
    requirement: number;
    rewardCredits: number;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface UserAchievement {
    id: string;
    achievementId: string;
    userId: string;
    progress: number;
    isCompleted: boolean;
    completedAt?: Timestamp;
    claimedReward: boolean;
}

// All achievement definitions
export const ACHIEVEMENTS: AchievementDefinition[] = [
    // Matches category
    {
        id: 'first_match',
        name: 'First Steps',
        nameAr: 'الخطوات الأولى',
        description: 'Complete your first match',
        descriptionAr: 'أكمل أول مباراة لك',
        icon: '🏃',
        category: 'matches',
        requirement: 1,
        rewardCredits: 25,
        tier: 'bronze',
    },
    {
        id: 'match_10',
        name: 'Getting Started',
        nameAr: 'بداية جيدة',
        description: 'Complete 10 matches',
        descriptionAr: 'أكمل 10 مباريات',
        icon: '🎯',
        category: 'matches',
        requirement: 10,
        rewardCredits: 100,
        tier: 'bronze',
    },
    {
        id: 'match_50',
        name: 'Dedicated Player',
        nameAr: 'لاعب متفاني',
        description: 'Complete 50 matches',
        descriptionAr: 'أكمل 50 مباراة',
        icon: '⚡',
        category: 'matches',
        requirement: 50,
        rewardCredits: 250,
        tier: 'silver',
    },
    {
        id: 'match_100',
        name: 'Centurion',
        nameAr: 'المئوي',
        description: 'Complete 100 matches',
        descriptionAr: 'أكمل 100 مباراة',
        icon: '🔥',
        category: 'matches',
        requirement: 100,
        rewardCredits: 500,
        tier: 'gold',
    },

    // Points category
    {
        id: 'points_100',
        name: 'Point Hunter',
        nameAr: 'صياد النقاط',
        description: 'Score 100+ points in a single match',
        descriptionAr: 'سجل 100+ نقطة في مباراة واحدة',
        icon: '💯',
        category: 'points',
        requirement: 100,
        rewardCredits: 150,
        tier: 'silver',
    },
    {
        id: 'points_1000_total',
        name: 'Thousand Club',
        nameAr: 'نادي الألف',
        description: 'Accumulate 1,000 total points',
        descriptionAr: 'اجمع 1,000 نقطة إجمالية',
        icon: '🏅',
        category: 'points',
        requirement: 1000,
        rewardCredits: 200,
        tier: 'silver',
    },
    {
        id: 'points_10000_total',
        name: 'Elite Scorer',
        nameAr: 'المسجل النخبوي',
        description: 'Accumulate 10,000 total points',
        descriptionAr: 'اجمع 10,000 نقطة إجمالية',
        icon: '👑',
        category: 'points',
        requirement: 10000,
        rewardCredits: 1000,
        tier: 'platinum',
    },

    // Ranks category
    {
        id: 'rank_top100',
        name: 'Top 100',
        nameAr: 'أفضل 100',
        description: 'Reach top 100 in global leaderboard',
        descriptionAr: 'وصل إلى أفضل 100 في الترتيب العالمي',
        icon: '📈',
        category: 'ranks',
        requirement: 100,
        rewardCredits: 300,
        tier: 'silver',
    },
    {
        id: 'rank_top10',
        name: 'Top 10',
        nameAr: 'أفضل 10',
        description: 'Reach top 10 in global leaderboard',
        descriptionAr: 'وصل إلى أفضل 10 في الترتيب العالمي',
        icon: '🥇',
        category: 'ranks',
        requirement: 10,
        rewardCredits: 500,
        tier: 'gold',
    },
    {
        id: 'rank_first',
        name: 'Champion',
        nameAr: 'البطل',
        description: 'Reach #1 in global leaderboard',
        descriptionAr: 'وصل للمركز الأول في الترتيب العالمي',
        icon: '🏆',
        category: 'ranks',
        requirement: 1,
        rewardCredits: 1000,
        tier: 'platinum',
    },

    // Social category
    {
        id: 'league_join',
        name: 'Team Player',
        nameAr: 'لاعب الفريق',
        description: 'Join your first league',
        descriptionAr: 'انضم لأول دوري لك',
        icon: '🤝',
        category: 'social',
        requirement: 1,
        rewardCredits: 50,
        tier: 'bronze',
    },
    {
        id: 'league_create',
        name: 'League Founder',
        nameAr: 'مؤسس الدوري',
        description: 'Create your own league',
        descriptionAr: 'أنشئ دوري خاص بك',
        icon: '🏛️',
        category: 'social',
        requirement: 1,
        rewardCredits: 100,
        tier: 'silver',
    },
    {
        id: 'league_win',
        name: 'League Champion',
        nameAr: 'بطل الدوري',
        description: 'Win a league competition',
        descriptionAr: 'فز في مسابقة دوري',
        icon: '🎖️',
        category: 'social',
        requirement: 1,
        rewardCredits: 300,
        tier: 'gold',
    },

    // Special category
    {
        id: 'streak_7',
        name: 'Week Warrior',
        nameAr: 'محارب الأسبوع',
        description: 'Login 7 days in a row',
        descriptionAr: 'سجل دخول 7 أيام متتالية',
        icon: '📆',
        category: 'special',
        requirement: 7,
        rewardCredits: 100,
        tier: 'bronze',
    },
    {
        id: 'streak_30',
        name: 'Month Master',
        nameAr: 'سيد الشهر',
        description: 'Login 30 days in a row',
        descriptionAr: 'سجل دخول 30 يوم متتالي',
        icon: '🗓️',
        category: 'special',
        requirement: 30,
        rewardCredits: 500,
        tier: 'gold',
    },
    {
        id: 'perfect_captain',
        name: 'Captain\'s Choice',
        nameAr: 'اختيار الكابتن',
        description: 'Captain scores 3+ goals',
        descriptionAr: 'الكابتن يسجل 3+ أهداف',
        icon: '⚽',
        category: 'special',
        requirement: 3,
        rewardCredits: 200,
        tier: 'silver',
    },
];

/**
 * Get all achievement definitions
 */
export function getAchievementDefinitions(): AchievementDefinition[] {
    return ACHIEVEMENTS;
}

/**
 * Get achievement definition by ID
 */
export function getAchievementById(id: string): AchievementDefinition | undefined {
    return ACHIEVEMENTS.find(a => a.id === id);
}

/**
 * Get user's achievements
 */
export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const achievementsQuery = query(
        collection(db, 'userAchievements'),
        where('userId', '==', userId)
    );

    const snapshot = await getDocs(achievementsQuery);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    } as UserAchievement));
}

/**
 * Get completed achievements
 */
export async function getCompletedAchievements(userId: string): Promise<UserAchievement[]> {
    const achievementsQuery = query(
        collection(db, 'userAchievements'),
        where('userId', '==', userId),
        where('isCompleted', '==', true)
    );

    const snapshot = await getDocs(achievementsQuery);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    } as UserAchievement));
}

/**
 * Check and update achievement progress
 */
export async function checkAchievementProgress(
    userId: string,
    achievementId: string,
    currentValue: number
): Promise<{ isNewlyCompleted: boolean; achievement?: AchievementDefinition }> {
    const definition = getAchievementById(achievementId);
    if (!definition) {
        return { isNewlyCompleted: false };
    }

    const docId = `${userId}_${achievementId}`;
    const achievementRef = doc(db, 'userAchievements', docId);
    const existingDoc = await getDoc(achievementRef);

    const isCompleted = currentValue >= definition.requirement;
    const wasCompleted = existingDoc.exists() && existingDoc.data()?.isCompleted;

    if (isCompleted && !wasCompleted) {
        // Newly completed!
        await setDoc(achievementRef, {
            achievementId,
            userId,
            progress: currentValue,
            isCompleted: true,
            completedAt: Timestamp.now(),
            claimedReward: false,
        }, { merge: true });

        return { isNewlyCompleted: true, achievement: definition };
    } else if (!wasCompleted) {
        // Update progress
        await setDoc(achievementRef, {
            achievementId,
            userId,
            progress: currentValue,
            isCompleted: false,
            claimedReward: false,
        }, { merge: true });
    }

    return { isNewlyCompleted: false };
}

/**
 * Claim achievement reward
 */
export async function claimAchievementReward(
    userId: string,
    achievementId: string
): Promise<{ success: boolean; creditsEarned?: number; error?: string }> {
    const docId = `${userId}_${achievementId}`;
    const achievementRef = doc(db, 'userAchievements', docId);
    const achievementDoc = await getDoc(achievementRef);

    if (!achievementDoc.exists()) {
        return { success: false, error: 'Achievement not found' };
    }

    const data = achievementDoc.data();
    if (!data.isCompleted) {
        return { success: false, error: 'Achievement not completed' };
    }

    if (data.claimedReward) {
        return { success: false, error: 'Reward already claimed' };
    }

    const definition = getAchievementById(achievementId);
    if (!definition) {
        return { success: false, error: 'Achievement definition not found' };
    }

    // Mark as claimed (credits are added via Cloud Function trigger)
    await setDoc(achievementRef, {
        claimedReward: true,
    }, { merge: true });

    return { success: true, creditsEarned: definition.rewardCredits };
}

/**
 * Get achievement progress summary
 */
export async function getAchievementSummary(userId: string): Promise<{
    total: number;
    completed: number;
    percentage: number;
    byCategory: Record<string, { total: number; completed: number }>;
}> {
    const userAchievements = await getUserAchievements(userId);
    const completedIds = new Set(
        userAchievements.filter(a => a.isCompleted).map(a => a.achievementId)
    );

    const total = ACHIEVEMENTS.length;
    const completed = completedIds.size;
    const percentage = Math.round((completed / total) * 100);

    const byCategory: Record<string, { total: number; completed: number }> = {};

    ACHIEVEMENTS.forEach(achievement => {
        if (!byCategory[achievement.category]) {
            byCategory[achievement.category] = { total: 0, completed: 0 };
        }
        byCategory[achievement.category].total++;
        if (completedIds.has(achievement.id)) {
            byCategory[achievement.category].completed++;
        }
    });

    return { total, completed, percentage, byCategory };
}

/**
 * Get tier color
 */
export function getTierColor(tier: AchievementDefinition['tier']): string {
    switch (tier) {
        case 'bronze': return '#CD7F32';
        case 'silver': return '#C0C0C0';
        case 'gold': return '#FFD700';
        case 'platinum': return '#E5E4E2';
        default: return '#888';
    }
}
