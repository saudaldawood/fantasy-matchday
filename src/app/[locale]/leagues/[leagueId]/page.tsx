'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { useParams } from 'next/navigation';
import {
    getLeague,
    getLeagueLeaderboard,
    leaveLeague,
    regenerateInviteCode,
    type League,
    type LeagueMembership
} from '@/services/leagues';
import styles from './page.module.css';
import { Users, Trophy, Lock, Globe, ArrowLeft, Copy, Check, LogOut, Crown, RefreshCw } from 'lucide-react';
import { Link } from '@/navigation';

export default function LeagueDetailPage() {
    const locale = useLocale();
    const { user } = useAuth();
    const params = useParams();
    const leagueId = params.leagueId as string;
    const isArabic = locale === 'ar';

    const [league, setLeague] = useState<League | null>(null);
    const [members, setMembers] = useState<LeagueMembership[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const [generatingCode, setGeneratingCode] = useState(false);

    useEffect(() => {
        async function fetchData() {
            if (!leagueId) return;
            try {
                const [leagueData, leaderboard] = await Promise.all([
                    getLeague(leagueId),
                    getLeagueLeaderboard(leagueId)
                ]);
                setLeague(leagueData);
                setMembers(leaderboard);
            } catch (error) {
                console.error('Error fetching league:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [leagueId]);

    const handleCopyCode = () => {
        if (league?.inviteCode) {
            navigator.clipboard.writeText(league.inviteCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleGenerateCode = async () => {
        if (!user || !league) return;
        setGeneratingCode(true);
        try {
            const result = await regenerateInviteCode(league.id, user.uid);
            if (result.success && result.inviteCode) {
                setLeague(prev => prev ? { ...prev, inviteCode: result.inviteCode } : prev);
            }
        } catch (error) {
            console.error('Error generating invite code:', error);
        } finally {
            setGeneratingCode(false);
        }
    };

    const handleLeave = async () => {
        if (!user || !league) return;
        if (!confirm(isArabic ? 'هل تريد مغادرة هذا الدوري؟' : 'Are you sure you want to leave this league?')) return;

        setLeaving(true);
        try {
            const result = await leaveLeague(league.id, user.uid);
            if (result.success) {
                window.location.href = `/${locale}/leagues`;
            }
        } catch (error) {
            console.error('Error leaving league:', error);
        } finally {
            setLeaving(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.pageWrapper}>
                <div className={styles.loading}>
                    <Users size={40} />
                    <p>{isArabic ? 'جاري التحميل...' : 'Loading...'}</p>
                </div>
            </div>
        );
    }

    if (!league) {
        return (
            <div className={styles.pageWrapper}>
                <div className={styles.container}>
                    <div className={styles.notFound}>
                        <h2>{isArabic ? 'الدوري غير موجود' : 'League not found'}</h2>
                        <Link href="/leagues" className={styles.backLink}>
                            <ArrowLeft size={16} />
                            {isArabic ? 'العودة للدوريات' : 'Back to Leagues'}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const isCreator = user?.uid === league.creatorId;
    const isAdmin = league.adminIds?.includes(user?.uid || '');

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.container}>
                {/* Back Link */}
                <Link href="/leagues" className={styles.backLink}>
                    <ArrowLeft size={16} />
                    {isArabic ? 'العودة للدوريات' : 'Back to Leagues'}
                </Link>

                {/* League Header */}
                <div className={styles.leagueHeader}>
                    <div className={styles.leagueIcon}>
                        {league.type === 'private' ? <Lock size={28} /> : <Globe size={28} />}
                    </div>
                    <div className={styles.leagueHeaderInfo}>
                        <h1>{isArabic ? league.nameAr || league.name : league.name}</h1>
                        {league.description && (
                            <p className={styles.description}>
                                {isArabic ? league.descriptionAr || league.description : league.description}
                            </p>
                        )}
                        <div className={styles.leagueMeta}>
                            <span><Users size={14} /> {league.memberCount}/{league.maxMembers} {isArabic ? 'عضو' : 'members'}</span>
                            <span>{league.type === 'private' ? (isArabic ? 'خاص' : 'Private') : (isArabic ? 'عام' : 'Public')}</span>
                        </div>
                    </div>
                </div>

                {/* Invite Code */}
                {(isCreator || isAdmin) && (
                    <div className={styles.inviteSection}>
                        <span className={styles.inviteLabel}>{isArabic ? 'رمز الدعوة' : 'Invite Code'}</span>
                        {league.inviteCode ? (
                            <div className={styles.inviteCodeBox}>
                                <span className={styles.inviteCode}>{league.inviteCode}</span>
                                <button onClick={handleCopyCode} className={styles.copyBtn}>
                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                    {copied ? (isArabic ? 'تم النسخ' : 'Copied') : (isArabic ? 'نسخ' : 'Copy')}
                                </button>
                                <button onClick={handleGenerateCode} disabled={generatingCode} className={styles.copyBtn}>
                                    <RefreshCw size={16} />
                                    {isArabic ? 'تجديد' : 'Regenerate'}
                                </button>
                            </div>
                        ) : (
                            <button onClick={handleGenerateCode} disabled={generatingCode} className={styles.copyBtn}>
                                <RefreshCw size={16} />
                                {generatingCode
                                    ? (isArabic ? 'جاري الإنشاء...' : 'Generating...')
                                    : (isArabic ? 'إنشاء رمز الدعوة' : 'Generate Invite Code')}
                            </button>
                        )}
                    </div>
                )}

                {/* Leaderboard */}
                <div className={styles.leaderboardSection}>
                    <h2>
                        <Trophy size={20} />
                        {isArabic ? 'الترتيب' : 'Leaderboard'}
                    </h2>
                    {members.length === 0 ? (
                        <div className={styles.emptyMembers}>
                            <p>{isArabic ? 'لا يوجد أعضاء بعد' : 'No members yet'}</p>
                        </div>
                    ) : (
                        <div className={styles.membersList}>
                            {members.map((member, index) => (
                                <div
                                    key={member.id}
                                    className={`${styles.memberRow} ${member.userId === user?.uid ? styles.currentUser : ''}`}
                                >
                                    <span className={styles.rank}>
                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                    </span>
                                    <div className={styles.memberAvatar}>
                                        {member.avatarUrl ? (
                                            <img src={member.avatarUrl} alt={member.displayName} />
                                        ) : (
                                            <span>{member.displayName?.charAt(0)?.toUpperCase() || 'U'}</span>
                                        )}
                                    </div>
                                    <div className={styles.memberInfo}>
                                        <span className={styles.memberName}>
                                            {member.displayName}
                                            {member.userId === league.creatorId && (
                                                <Crown size={12} className={styles.crownIcon} />
                                            )}
                                        </span>
                                    </div>
                                    <span className={styles.memberPoints}>{member.totalPoints || 0} pts</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions */}
                {user && !isCreator && (
                    <div className={styles.actions}>
                        <button onClick={handleLeave} disabled={leaving} className={styles.leaveBtn}>
                            <LogOut size={16} />
                            {leaving ? '...' : (isArabic ? 'مغادرة الدوري' : 'Leave League')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
