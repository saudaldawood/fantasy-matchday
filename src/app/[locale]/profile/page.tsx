'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, Link } from '@/navigation';
import { updateUserProfile, signOut } from '@/services/auth';
import { useTranslations } from 'next-intl';
import styles from './profile.module.css';
import { User, Mail, Trophy, Star, Settings, LogOut, Loader2, SaveIcon, Shirt, Users, CreditCard, History, Zap } from 'lucide-react';

export default function ProfilePage() {
    const { user, profile, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('Profile');

    const [displayName, setDisplayName] = useState('');
    const [favoriteTeam, setFavoriteTeam] = useState('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
        if (profile) {
            setDisplayName(profile.displayName);
            setFavoriteTeam(profile.favoriteTeam || '');
        }
    }, [user, profile, authLoading, router]);

    const handleSave = async () => {
        if (!user) return;

        setSaving(true);
        setMessage('');

        try {
            await updateUserProfile(user.uid, {
                displayName,
                favoriteTeam: favoriteTeam || undefined,
            });
            setMessage(t('profileUpdated'));
            setTimeout(() => setMessage(''), 3000);
        } catch (error: any) {
            setMessage(t('updateFailed'));
        } finally {
            setSaving(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        router.push('/login');
    };

    if (authLoading) {
        return (
            <div className={styles.loading}>
                <Loader2 className={styles.spinner} size={40} />
                <p>{t('loading')}</p>
            </div>
        );
    }

    if (!profile || !user) {
        return null;
    }

    return (
        <div className={styles.profilePage}>
            <div className={styles.container}>
                {/* Header with Stats */}
                <div className={styles.header}>
                    <div className={styles.avatarSection}>
                        <div className={styles.avatar}>
                            {profile.avatarUrl ? (
                                <img src={profile.avatarUrl} alt={profile.displayName} />
                            ) : (
                                <User size={60} />
                            )}
                        </div>
                        <div className={styles.userInfo}>
                            <h1>{profile.displayName}</h1>
                            <p>{profile.email}</p>
                            <div className={styles.levelBadge}>
                                {t('level')} {profile.level}
                            </div>
                        </div>
                    </div>

                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <Trophy size={24} className={styles.statIcon} />
                            <div>
                                <div className={styles.statValue}>{profile.totalPoints}</div>
                                <div className={styles.statLabel}>{t('totalPoints')}</div>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <Star size={24} className={styles.statIcon} />
                            <div>
                                <div className={styles.statValue}>{profile.matchesPlayed}</div>
                                <div className={styles.statLabel}>{t('matchesPlayed')}</div>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>💰</div>
                            <div>
                                <div className={styles.statValue}>{profile.credits}</div>
                                <div className={styles.statLabel}>{t('credits')}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <Zap size={20} />
                        {t('quickActions') || 'Quick Actions'}
                    </h2>
                    <div className={styles.quickLinksGrid}>
                        <Link href="/lineup" className={styles.quickLinkCard}>
                            <Shirt size={32} className={styles.quickLinkIcon} />
                            <div className={styles.quickLinkLabel}>{t('manageTeam') || 'Manage Team'}</div>
                            <div className={styles.quickLinkDescription}>{t('manageTeamDesc') || 'Set your lineup'}</div>
                        </Link>

                        <Link href="/leagues" className={styles.quickLinkCard}>
                            <Users size={32} className={styles.quickLinkIcon} />
                            <div className={styles.quickLinkLabel}>{t('leagues') || 'Leagues'}</div>
                            <div className={styles.quickLinkDescription}>{t('leaguesDesc') || 'Join or create leagues'}</div>
                        </Link>

                        <Link href="/credits" className={styles.quickLinkCard}>
                            <CreditCard size={32} className={styles.quickLinkIcon} />
                            <div className={styles.quickLinkLabel}>{t('buyCredits') || 'Buy Credits'}</div>
                            <div className={styles.quickLinkDescription}>{t('buyCreditsDesc') || 'Get more credits'}</div>
                        </Link>

                        <Link href="/transactions" className={styles.quickLinkCard}>
                            <History size={32} className={styles.quickLinkIcon} />
                            <div className={styles.quickLinkLabel}>{t('transactions') || 'History'}</div>
                            <div className={styles.quickLinkDescription}>{t('transactionsDesc') || 'View purchases'}</div>
                        </Link>

                        <Link href="/players" className={styles.quickLinkCard}>
                            <User size={32} className={styles.quickLinkIcon} />
                            <div className={styles.quickLinkLabel}>{t('players') || 'Players'}</div>
                            <div className={styles.quickLinkDescription}>{t('playersDesc') || 'View stats'}</div>
                        </Link>
                    </div>
                </div>

                {/* Edit Profile Section */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <Settings size={20} />
                        {t('editProfile')}
                    </h2>

                    {message && (
                        <div className={styles.messageAlert}>
                            {message}
                        </div>
                    )}

                    <div className={styles.form}>
                        <div className={styles.formGroup}>
                            <label>{t('displayName')}</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>{t('email')}</label>
                            <input
                                type="email"
                                value={profile.email}
                                disabled
                                className={`${styles.input} ${styles.disabled}`}
                            />
                            <small>{t('emailCannotChange')}</small>
                        </div>

                        <div className={styles.formGroup}>
                            <label>{t('favoriteTeam')}</label>
                            <input
                                type="text"
                                value={favoriteTeam}
                                onChange={(e) => setFavoriteTeam(e.target.value)}
                                placeholder={t('favoriteTeamPlaceholder')}
                                className={styles.input}
                            />
                        </div>

                        <button
                            onClick={handleSave}
                            className={styles.saveBtn}
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <Loader2 className={styles.spinner} size={18} />
                                    {t('saving')}
                                </>
                            ) : (
                                <>
                                    <SaveIcon size={18} />
                                    {t('saveChanges')}
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Achievements Section */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        🏆 {t('achievements')}
                    </h2>
                    {profile.achievements && profile.achievements.length > 0 ? (
                        <div className={styles.achievementsGrid}>
                            {profile.achievements.map((achievement, index) => (
                                <div key={index} className={styles.achievementCard}>
                                    <div className={styles.achievementIcon}>🏅</div>
                                    <div>{achievement}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className={styles.emptyState}>{t('noAchievements')}</p>
                    )}
                </div>

                {/* Sign Out Button */}
                <button
                    onClick={handleSignOut}
                    className={styles.signOutBtn}
                >
                    <LogOut size={18} />
                    {t('signOut')}
                </button>
            </div>
        </div>
    );
}

