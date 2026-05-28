'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocale } from 'next-intl';
import {
    getMatchHistory,
    getPerformanceStats,
    getWeeklyPerformance,
    type MatchPerformance,
    type PerformanceStats,
    type WeeklyPerformance
} from '@/services/profile-stats';
import styles from './ProfileDashboard.module.css';
import {
    Trophy, TrendingUp, Target, Award, Calendar,
    ChevronRight, Star, Zap, Activity
} from 'lucide-react';

export default function ProfileDashboard() {
    const { user, profile } = useAuth();
    const locale = useLocale();
    const isArabic = locale === 'ar';

    const [stats, setStats] = useState<PerformanceStats | null>(null);
    const [matchHistory, setMatchHistory] = useState<MatchPerformance[]>([]);
    const [weeklyData, setWeeklyData] = useState<WeeklyPerformance[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'weekly'>('overview');

    useEffect(() => {
        async function fetchData() {
            if (!user) return;

            try {
                const [statsData, historyData, weeklyDataResult] = await Promise.all([
                    getPerformanceStats(user.uid),
                    getMatchHistory(user.uid),
                    getWeeklyPerformance(user.uid)
                ]);
                setStats(statsData);
                setMatchHistory(historyData);
                setWeeklyData(weeklyDataResult);
            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [user]);

    if (loading || !stats) {
        return (
            <div className={styles.loading}>
                <Activity size={32} className={styles.spin} />
                <p>{isArabic ? 'جاري تحميل الإحصائيات...' : 'Loading statistics...'}</p>
            </div>
        );
    }

    const maxWeeklyPoints = Math.max(...weeklyData.map(w => w.points), 1);

    return (
        <div className={styles.dashboard}>
            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}><Trophy size={24} /></div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{stats.totalPoints.toLocaleString()}</span>
                        <span className={styles.statLabel}>{isArabic ? 'إجمالي النقاط' : 'Total Points'}</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon}><Target size={24} /></div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{stats.averagePoints}</span>
                        <span className={styles.statLabel}>{isArabic ? 'متوسط النقاط' : 'Avg Points'}</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon}><Award size={24} /></div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{stats.top10Finishes}</span>
                        <span className={styles.statLabel}>{isArabic ? 'أفضل 10' : 'Top 10 Finishes'}</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon}><Star size={24} /></div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{stats.winningMatches}</span>
                        <span className={styles.statLabel}>{isArabic ? 'المركز الأول' : 'First Places'}</span>
                    </div>
                </div>
            </div>

            {/* Detailed Stats */}
            <div className={styles.detailsRow}>
                <div className={styles.detailCard}>
                    <h3>{isArabic ? 'أفضل أداء' : 'Best Performance'}</h3>
                    <div className={styles.detailValue}>{stats.bestMatch} <span>pts</span></div>
                </div>
                <div className={styles.detailCard}>
                    <h3>{isArabic ? 'أسوأ أداء' : 'Worst Performance'}</h3>
                    <div className={styles.detailValue}>{stats.worstMatch} <span>pts</span></div>
                </div>
                <div className={styles.detailCard}>
                    <h3>{isArabic ? 'أفضل سلسلة' : 'Best Streak'}</h3>
                    <div className={styles.detailValue}>{stats.bestStreak} <Zap size={16} /></div>
                </div>
                <div className={styles.detailCard}>
                    <h3>{isArabic ? 'نقاط الكابتن' : 'Captain Points'}</h3>
                    <div className={styles.detailValue}>{stats.totalCaptainPoints}</div>
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <TrendingUp size={16} />
                    {isArabic ? 'نظرة عامة' : 'Overview'}
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'history' ? styles.active : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    <Calendar size={16} />
                    {isArabic ? 'سجل المباريات' : 'Match History'}
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'weekly' ? styles.active : ''}`}
                    onClick={() => setActiveTab('weekly')}
                >
                    <Activity size={16} />
                    {isArabic ? 'الأداء الأسبوعي' : 'Weekly'}
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className={styles.overview}>
                    {/* Weekly Chart */}
                    <div className={styles.chartCard}>
                        <h3>{isArabic ? 'الأداء الأسبوعي' : 'Weekly Performance'}</h3>
                        <div className={styles.chart}>
                            {weeklyData.slice(0, 8).reverse().map((week, index) => (
                                <div key={index} className={styles.chartBar}>
                                    <div
                                        className={styles.bar}
                                        style={{ height: `${(week.points / maxWeeklyPoints) * 100}%` }}
                                    />
                                    <span className={styles.barLabel}>W{week.weekNumber}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className={styles.quickStats}>
                        <div className={styles.quickStat}>
                            <span className={styles.quickLabel}>{isArabic ? 'المباريات' : 'Matches'}</span>
                            <span className={styles.quickValue}>{stats.matchesPlayed}</span>
                        </div>
                        <div className={styles.quickStat}>
                            <span className={styles.quickLabel}>{isArabic ? 'أفضل 100' : 'Top 100'}</span>
                            <span className={styles.quickValue}>{stats.top100Finishes}</span>
                        </div>
                        <div className={styles.quickStat}>
                            <span className={styles.quickLabel}>{isArabic ? 'التعزيزات' : 'Power-ups'}</span>
                            <span className={styles.quickValue}>{stats.powerUpsUsed}</span>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'history' && (
                <div className={styles.historyList}>
                    {matchHistory.length === 0 ? (
                        <div className={styles.empty}>
                            <Calendar size={40} />
                            <p>{isArabic ? 'لا توجد مباريات سابقة' : 'No match history yet'}</p>
                        </div>
                    ) : (
                        matchHistory.map((match, index) => (
                            <div key={index} className={styles.historyItem}>
                                <div className={styles.matchInfo}>
                                    <div className={styles.teams}>
                                        {match.homeTeam} vs {match.awayTeam}
                                    </div>
                                    <div className={styles.matchMeta}>
                                        {match.matchDate.toLocaleDateString()} • {match.score}
                                    </div>
                                </div>
                                <div className={styles.matchStats}>
                                    <div className={styles.matchPoints}>{match.points} pts</div>
                                    <div className={styles.matchRank}>
                                        #{match.rank}
                                    </div>
                                </div>
                                <ChevronRight size={20} className={styles.chevron} />
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'weekly' && (
                <div className={styles.weeklyList}>
                    {weeklyData.length === 0 ? (
                        <div className={styles.empty}>
                            <Activity size={40} />
                            <p>{isArabic ? 'لا توجد بيانات أسبوعية' : 'No weekly data yet'}</p>
                        </div>
                    ) : (
                        weeklyData.map((week, index) => (
                            <div key={index} className={styles.weeklyItem}>
                                <div className={styles.weekNumber}>
                                    {isArabic ? `الأسبوع ${week.weekNumber}` : `Week ${week.weekNumber}`}
                                </div>
                                <div className={styles.weekStats}>
                                    <span>{week.matches} {isArabic ? 'مباراة' : 'matches'}</span>
                                    <span className={styles.weekPoints}>{week.points} pts</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
