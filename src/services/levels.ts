/**
 * Level System Service
 * Handles user levels, XP, and progression
 */

import {
    doc,
    getDoc,
    updateDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Level configuration
export interface LevelConfig {
    level: number;
    name: string;
    nameAr: string;
    xpRequired: number;
    totalXpRequired: number;
    rewards: {
        credits: number;
        badge?: string;
        unlocks?: string[];
    };
    color: string;
    icon: string;
}

// Level definitions
export const LEVELS: LevelConfig[] = [
    {
        level: 1,
        name: 'Rookie',
        nameAr: 'مبتدئ',
        xpRequired: 0,
        totalXpRequired: 0,
        rewards: { credits: 0 },
        color: '#808080',
        icon: '⚪',
    },
    {
        level: 2,
        name: 'Amateur',
        nameAr: 'هاوي',
        xpRequired: 100,
        totalXpRequired: 100,
        rewards: { credits: 50 },
        color: '#4CAF50',
        icon: '🟢',
    },
    {
        level: 3,
        name: 'Semi-Pro',
        nameAr: 'شبه محترف',
        xpRequired: 200,
        totalXpRequired: 300,
        rewards: { credits: 100 },
        color: '#2196F3',
        icon: '🔵',
    },
    {
        level: 4,
        name: 'Professional',
        nameAr: 'محترف',
        xpRequired: 400,
        totalXpRequired: 700,
        rewards: { credits: 150, badge: 'pro_player' },
        color: '#9C27B0',
        icon: '🟣',
    },
    {
        level: 5,
        name: 'Expert',
        nameAr: 'خبير',
        xpRequired: 600,
        totalXpRequired: 1300,
        rewards: { credits: 200 },
        color: '#FF9800',
        icon: '🟠',
    },
    {
        level: 6,
        name: 'Master',
        nameAr: 'ماستر',
        xpRequired: 1000,
        totalXpRequired: 2300,
        rewards: { credits: 300, badge: 'master_player' },
        color: '#F44336',
        icon: '🔴',
    },
    {
        level: 7,
        name: 'Grandmaster',
        nameAr: 'جراند ماستر',
        xpRequired: 1500,
        totalXpRequired: 3800,
        rewards: { credits: 500, unlocks: ['premium_avatars'] },
        color: '#E91E63',
        icon: '💎',
    },
    {
        level: 8,
        name: 'Champion',
        nameAr: 'بطل',
        xpRequired: 2500,
        totalXpRequired: 6300,
        rewards: { credits: 750, badge: 'champion' },
        color: '#FFD700',
        icon: '🏆',
    },
    {
        level: 9,
        name: 'Legend',
        nameAr: 'أسطورة',
        xpRequired: 4000,
        totalXpRequired: 10300,
        rewards: { credits: 1000, badge: 'legend', unlocks: ['exclusive_frames'] },
        color: '#FF4500',
        icon: '🌟',
    },
    {
        level: 10,
        name: 'Ultimate',
        nameAr: 'الأفضل',
        xpRequired: 6000,
        totalXpRequired: 16300,
        rewards: { credits: 2000, badge: 'ultimate', unlocks: ['all_customization'] },
        color: '#000000',
        icon: '👑',
    },
];

// XP sources
export const XP_SOURCES = {
    match_played: 10,
    match_won_top10: 25,
    match_won_top3: 50,
    match_won_first: 100,
    points_earned: 0.1, // Per point
    daily_login: 5,
    weekly_bonus: 50,
    achievement_unlocked: 20,
    league_joined: 15,
    league_created: 30,
    friend_added: 10,
    referral_success: 100,
    power_up_used: 5,
};

/**
 * Get level config for a specific level
 */
export function getLevelConfig(level: number): LevelConfig {
    return LEVELS[Math.min(level - 1, LEVELS.length - 1)] || LEVELS[0];
}

/**
 * Calculate level from total XP
 */
export function calculateLevelFromXP(totalXP: number): {
    level: number;
    currentXP: number;
    xpToNextLevel: number;
    progress: number;
} {
    let level = 1;

    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (totalXP >= LEVELS[i].totalXpRequired) {
            level = LEVELS[i].level;
            break;
        }
    }

    const currentLevelConfig = getLevelConfig(level);
    const nextLevelConfig = getLevelConfig(level + 1);

    const xpInCurrentLevel = totalXP - currentLevelConfig.totalXpRequired;
    const xpToNextLevel = nextLevelConfig.totalXpRequired - currentLevelConfig.totalXpRequired;
    const progress = level >= LEVELS.length
        ? 100
        : Math.min(100, (xpInCurrentLevel / xpToNextLevel) * 100);

    return {
        level,
        currentXP: xpInCurrentLevel,
        xpToNextLevel: xpToNextLevel - xpInCurrentLevel,
        progress,
    };
}

/**
 * Add XP to user and check for level up
 */
export async function addUserXP(
    userId: string,
    xpAmount: number,
    source: keyof typeof XP_SOURCES
): Promise<{
    newXP: number;
    leveledUp: boolean;
    oldLevel: number;
    newLevel: number;
    rewards?: LevelConfig['rewards'];
}> {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        throw new Error('User not found');
    }

    const userData = userSnap.data();
    const currentTotalXP = userData.totalXP || 0;
    const currentLevel = userData.level || 1;

    const newTotalXP = currentTotalXP + xpAmount;
    const levelData = calculateLevelFromXP(newTotalXP);
    const leveledUp = levelData.level > currentLevel;

    const updates: any = {
        totalXP: newTotalXP,
        level: levelData.level,
        updatedAt: serverTimestamp(),
    };

    // If leveled up, add credits reward
    if (leveledUp) {
        const newLevelConfig = getLevelConfig(levelData.level);
        updates.credits = (userData.credits || 0) + newLevelConfig.rewards.credits;

        // Add badge if unlocked
        if (newLevelConfig.rewards.badge) {
            updates.badges = [...(userData.badges || []), newLevelConfig.rewards.badge];
        }
    }

    await updateDoc(userRef, updates);

    return {
        newXP: newTotalXP,
        leveledUp,
        oldLevel: currentLevel,
        newLevel: levelData.level,
        rewards: leveledUp ? getLevelConfig(levelData.level).rewards : undefined,
    };
}

/**
 * Get user's level info
 */
export async function getUserLevelInfo(userId: string): Promise<{
    level: number;
    levelName: string;
    levelNameAr: string;
    totalXP: number;
    currentXP: number;
    xpToNextLevel: number;
    progress: number;
    color: string;
    icon: string;
}> {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        throw new Error('User not found');
    }

    const userData = userSnap.data();
    const totalXP = userData.totalXP || 0;
    const levelData = calculateLevelFromXP(totalXP);
    const levelConfig = getLevelConfig(levelData.level);

    return {
        level: levelData.level,
        levelName: levelConfig.name,
        levelNameAr: levelConfig.nameAr,
        totalXP,
        currentXP: levelData.currentXP,
        xpToNextLevel: levelData.xpToNextLevel,
        progress: levelData.progress,
        color: levelConfig.color,
        icon: levelConfig.icon,
    };
}

/**
 * Calculate XP for match performance
 */
export function calculateMatchXP(
    points: number,
    rank: number,
    totalParticipants: number
): number {
    let xp = XP_SOURCES.match_played;

    // Add points-based XP
    xp += Math.floor(points * XP_SOURCES.points_earned);

    // Add rank-based XP
    if (rank === 1) {
        xp += XP_SOURCES.match_won_first;
    } else if (rank <= 3) {
        xp += XP_SOURCES.match_won_top3;
    } else if (rank <= Math.min(10, totalParticipants * 0.1)) {
        xp += XP_SOURCES.match_won_top10;
    }

    return xp;
}

/**
 * Get level display badge
 */
export function getLevelBadge(level: number): {
    icon: string;
    name: string;
    nameAr: string;
    color: string;
} {
    const config = getLevelConfig(level);
    return {
        icon: config.icon,
        name: config.name,
        nameAr: config.nameAr,
        color: config.color,
    };
}

/**
 * Get all levels with their requirements
 */
export function getAllLevels(): LevelConfig[] {
    return LEVELS;
}
