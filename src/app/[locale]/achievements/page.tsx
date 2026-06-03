'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import {
    ACHIEVEMENTS,
    getUserAchievements,
    getAchievementSummary,
    claimAchievementReward,
    getTierColor,
    type UserAchievement,
    type AchievementDefinition
} from '@/services/achievements';
import styles from './page.module.css';
import { Trophy, Gift, Check, Lock } from 'lucide-react';

export default function AchievementsPage() {
    const t = useTranslations('Achievements');
    const locale = useLocale();
    const { user } = useAuth();
    const isArabic = locale === 'ar';

    const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
    const [summary, setSummary] = useState<{
        total: number;
        completed: number;
        percentage: number;
        byCategory: Record<string, { total: number; completed: number }>;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        async function fetchData() {
            if (!user) return;

            try {
                const [achievements, summaryData] = await Promise.all([
                    getUserAchievements(user.uid),
                    getAchievementSummary(user.uid)
                ]);
                setUserAchievements(achievements);
                setSummary(summaryData);
            } catch (error) {
                console.error('Error fetching achievements:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [user]);

    const handleClaim = async (achievementId: string) => {
        if (!user) return;

        setClaiming(achievementId);
        try {
            const result = await claimAchievementReward(user.uid, achievementId);
            if (result.success) {
                // Update local state
                setUserAchievements(prev =>
                    prev.map(a =>
                        a.achievementId === achievementId
                            ? { ...a, claimedReward: true }
                            : a
                    )
                );
            }
        } catch (error) {
            console.error('Error claiming reward:', error);
        } finally {
            setClaiming(null);
        }
    };

    const getAchievementStatus = (achievement: AchievementDefinition) => {
        const userAch = userAchievements.find(a => a.achievementId === achievement.id);
        return {
            isCompleted: userAch?.isCompleted || false,
            progress: userAch?.progress || 0,
            claimedReward: userAch?.claimedReward || false,
        };
    };

    const categories = ['all', 'matches', 'points', 'ranks', 'social', 'special'];
    const categoryLabels: Record<string, { en: string; ar: string }> = {
        all: { en: 'All', ar: 'الكل' },
        matches: { en: 'Matches', ar: 'المباريات' },
        points: { en: 'Points', ar: 'النقاط' },
        ranks: { en: 'Rankings', ar: 'التصنيفات' },
        social: { en: 'Social', ar: 'اجتماعي' },
        special: { en: 'Special', ar: 'خاص' },
    };

    const filteredAchievements = selectedCategory === 'all'
        ? ACHIEVEMENTS
        : ACHIEVEMENTS.filter(a => a.category === selectedCategory);

    if (loading) {
        return (
            <div className={styles.pageWrapper}>
                <div className={styles.loading}>
                    <Trophy size={40} />
                    <p>{isArabic ? 'جاري التحميل...' : 'Loading achievements...'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.container}>
                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.headerContent}>
                        <Trophy size={32} className={styles.headerIcon} />
                        <div>
                            <h1>{isArabic ? 'الإنجازات' : 'Achievements'}</h1>
                            <p className={styles.subtitle}>
                                {isArabic
                                    ? `${summary?.completed || 0} من ${summary?.total || 0} إنجاز مكتمل`
                                    : `${summary?.completed || 0} of ${summary?.total || 0} achievements completed`
                                }
                            </p>
                        </div>
                    </div>

                    {/* Progress Ring */}
                    <div className={styles.progressRing}>
                        <svg viewBox="0 0 100 100">
                            <circle
                                className={styles.progressBg}
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                strokeWidth="8"
                            />
                            <circle
                                className={styles.progressFill}
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                strokeWidth="8"
                                strokeDasharray={`${(summary?.percentage || 0) * 2.83} 283`}
                                strokeLinecap="round"
                            />
                        </svg>
                        <span className={styles.progressText}>{summary?.percentage || 0}%</span>
                    </div>
                </header>

                {/* Category Tabs */}
                <div className={styles.tabs}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`${styles.tab} ${selectedCategory === cat ? styles.active : ''}`}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {isArabic ? categoryLabels[cat].ar : categoryLabels[cat].en}
                            {cat !== 'all' && summary?.byCategory[cat] && (
                                <span className={styles.tabCount}>
                                    {summary.byCategory[cat].completed}/{summary.byCategory[cat].total}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Achievements Grid */}
                <div className={styles.grid}>
                    {filteredAchievements.map(achievement => {
                        const status = getAchievementStatus(achievement);
                        const progressPercent = Math.min(100, (status.progress / achievement.requirement) * 100);

                        return (
                            <div
                                key={achievement.id}
                                className={`${styles.card} ${status.isCompleted ? styles.completed : ''}`}
                            >
                                {/* Tier Badge */}
                                <span
                                    className={styles.tier}
                                    style={{ background: getTierColor(achievement.tier) }}
                                >
                                    {achievement.tier}
                                </span>

                                {/* Icon */}
                                <div className={styles.iconWrapper}>
                                    <span className={styles.icon}>{achievement.icon}</span>
                                    {status.isCompleted && (
                                        <span className={styles.completedBadge}>
                                            <Check size={12} />
                                        </span>
                                    )}
                                </div>

                                {/* Content */}
                                <h3>{isArabic ? achievement.nameAr : achievement.name}</h3>
                                <p className={styles.description}>
                                    {isArabic ? achievement.descriptionAr : achievement.description}
                                </p>

                                {/* Progress */}
                                {!status.isCompleted && (
                                    <div className={styles.progressBar}>
                                        <div
                                            className={styles.progressFillBar}
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                        <span className={styles.progressLabel}>
                                            {status.progress} / {achievement.requirement}
                                        </span>
                                    </div>
                                )}

                                {/* Reward */}
                                <div className={styles.reward}>
                                    <Gift size={14} />
                                    <span>{achievement.rewardCredits} {isArabic ? 'رصيد' : 'credits'}</span>
                                </div>

                                {/* Claim Button */}
                                {status.isCompleted && !status.claimedReward && (
                                    <button
                                        className={styles.claimBtn}
                                        onClick={() => handleClaim(achievement.id)}
                                        disabled={claiming === achievement.id}
                                    >
                                        {claiming === achievement.id
                                            ? (isArabic ? 'جاري...' : 'Claiming...')
                                            : (isArabic ? 'استلام المكافأة' : 'Claim Reward')
                                        }
                                    </button>
                                )}

                                {status.claimedReward && (
                                    <span className={styles.claimed}>
                                        <Check size={14} />
                                        {isArabic ? 'تم الاستلام' : 'Claimed'}
                                    </span>
                                )}

                                {!status.isCompleted && (
                                    <span className={styles.locked}>
                                        <Lock size={14} />
                                        {isArabic ? 'غير مكتمل' : 'Incomplete'}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
