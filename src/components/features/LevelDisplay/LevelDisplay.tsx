'use client';

/**
 * Level Display Component
 * Shows user level with progress bar and XP
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { getUserLevelInfo, getLevelConfig, LEVELS } from '@/services/levels';
import styles from './LevelDisplay.module.css';

interface LevelDisplayProps {
    userId?: string;
    compact?: boolean;
    showProgress?: boolean;
}

export default function LevelDisplay({
    userId,
    compact = false,
    showProgress = true
}: LevelDisplayProps) {
    const { user } = useAuth();
    const [levelInfo, setLevelInfo] = useState<{
        level: number;
        levelName: string;
        levelNameAr: string;
        totalXP: number;
        currentXP: number;
        xpToNextLevel: number;
        progress: number;
        color: string;
        icon: string;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadLevelInfo = async () => {
            const targetUserId = userId || user?.uid;
            if (!targetUserId) return;

            try {
                const info = await getUserLevelInfo(targetUserId);
                setLevelInfo(info);
            } catch (error) {
                console.error('Error loading level info:', error);
            }
            setLoading(false);
        };

        loadLevelInfo();
    }, [userId, user?.uid]);

    if (loading) {
        return (
            <div className={`${styles.levelDisplay} ${compact ? styles.compact : ''}`}>
                <div className={styles.skeleton}></div>
            </div>
        );
    }

    if (!levelInfo) {
        return null;
    }

    if (compact) {
        return (
            <div
                className={`${styles.levelDisplay} ${styles.compact}`}
                style={{ '--level-color': levelInfo.color } as React.CSSProperties}
            >
                <span className={styles.icon}>{levelInfo.icon}</span>
                <span className={styles.levelBadge}>Lv.{levelInfo.level}</span>
            </div>
        );
    }

    return (
        <div
            className={styles.levelDisplay}
            style={{ '--level-color': levelInfo.color } as React.CSSProperties}
        >
            <div className={styles.header}>
                <div className={styles.iconLarge}>{levelInfo.icon}</div>
                <div className={styles.levelInfo}>
                    <div className={styles.levelNumber}>Level {levelInfo.level}</div>
                    <div className={styles.levelName}>{levelInfo.levelName}</div>
                </div>
            </div>

            {showProgress && (
                <div className={styles.progressSection}>
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${levelInfo.progress}%` }}
                        ></div>
                    </div>
                    <div className={styles.xpInfo}>
                        <span>{levelInfo.currentXP} XP</span>
                        <span>{levelInfo.xpToNextLevel} XP to next level</span>
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Level Badge - Small inline badge
 */
export function LevelBadge({ level }: { level: number }) {
    const config = getLevelConfig(level);

    return (
        <span
            className={styles.inlineBadge}
            style={{ '--level-color': config.color } as React.CSSProperties}
            title={config.name}
        >
            {config.icon} {level}
        </span>
    );
}

/**
 * Level Progress Card - For profile page
 */
export function LevelProgressCard() {
    const { user } = useAuth();
    const [levelInfo, setLevelInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadLevelInfo = async () => {
            if (!user?.uid) return;
            try {
                const info = await getUserLevelInfo(user.uid);
                setLevelInfo(info);
            } catch (error) {
                console.error('Error loading level info:', error);
            }
            setLoading(false);
        };
        loadLevelInfo();
    }, [user?.uid]);

    if (loading || !levelInfo) {
        return <div className={styles.card}><div className={styles.skeleton}></div></div>;
    }

    const nextLevel = levelInfo.level < LEVELS.length ? getLevelConfig(levelInfo.level + 1) : null;

    return (
        <div
            className={styles.card}
            style={{ '--level-color': levelInfo.color } as React.CSSProperties}
        >
            <div className={styles.cardHeader}>
                <div className={styles.currentLevel}>
                    <span className={styles.bigIcon}>{levelInfo.icon}</span>
                    <div>
                        <h3>Level {levelInfo.level}</h3>
                        <p>{levelInfo.levelName}</p>
                    </div>
                </div>
                <div className={styles.totalXP}>
                    {levelInfo.totalXP.toLocaleString()} XP
                </div>
            </div>

            <div className={styles.progressBarLarge}>
                <div
                    className={styles.progressFillLarge}
                    style={{ width: `${levelInfo.progress}%` }}
                ></div>
            </div>

            <div className={styles.progressLabels}>
                <span>Progress: {Math.round(levelInfo.progress)}%</span>
                <span>{levelInfo.xpToNextLevel} XP to level up</span>
            </div>

            {nextLevel && (
                <div className={styles.nextLevel}>
                    <span>Next: {nextLevel.icon} {nextLevel.name}</span>
                    <span className={styles.reward}>+{nextLevel.rewards.credits} credits</span>
                </div>
            )}
        </div>
    );
}
