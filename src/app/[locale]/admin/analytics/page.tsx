'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { getDashboardStats, type DashboardStats } from '@/services/admin';
import styles from './page.module.css';
import {
    Users, TrendingUp, DollarSign, Activity,
    BarChart3, PieChart, Calendar, ArrowUpRight,
    ArrowDownRight, Coins, Trophy, Target
} from 'lucide-react';

// Mock data for charts (in production, fetch from backend)
const mockWeeklyData = [
    { day: 'Mon', users: 120, matches: 45 },
    { day: 'Tue', users: 150, matches: 62 },
    { day: 'Wed', users: 180, matches: 78 },
    { day: 'Thu', users: 210, matches: 95 },
    { day: 'Fri', users: 320, matches: 145 },
    { day: 'Sat', users: 450, matches: 210 },
    { day: 'Sun', users: 380, matches: 175 },
];

const mockRevenueData = [
    { month: 'Jan', revenue: 2400 },
    { month: 'Feb', revenue: 3200 },
    { month: 'Mar', revenue: 2800 },
    { month: 'Apr', revenue: 4100 },
    { month: 'May', revenue: 3800 },
    { month: 'Jun', revenue: 5200 },
];

export default function AdminAnalyticsPage() {
    const locale = useLocale();
    const isArabic = locale === 'ar';

    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

    useEffect(() => {
        async function fetchStats() {
            try {
                const data = await getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    const maxUsers = Math.max(...mockWeeklyData.map(d => d.users));
    const maxRevenue = Math.max(...mockRevenueData.map(d => d.revenue));

    if (loading) {
        return (
            <div className={styles.loading}>
                <Activity size={32} className={styles.spin} />
                <p>{isArabic ? 'جاري تحميل التحليلات...' : 'Loading analytics...'}</p>
            </div>
        );
    }

    return (
        <div className={styles.analytics}>
            {/* Header */}
            <div className={styles.header}>
                <h1>{isArabic ? 'لوحة التحليلات' : 'Analytics Dashboard'}</h1>
                <div className={styles.timeFilter}>
                    {(['7d', '30d', '90d'] as const).map(range => (
                        <button
                            key={range}
                            className={`${styles.timeBtn} ${timeRange === range ? styles.active : ''}`}
                            onClick={() => setTimeRange(range)}
                        >
                            {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Key Metrics */}
            <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <div className={styles.metricIcon}><Users size={20} /></div>
                        <span className={styles.metricChange}>
                            <ArrowUpRight size={14} /> +12%
                        </span>
                    </div>
                    <div className={styles.metricValue}>{stats?.totalUsers?.toLocaleString() || 0}</div>
                    <div className={styles.metricLabel}>{isArabic ? 'إجمالي المستخدمين' : 'Total Users'}</div>
                </div>

                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <div className={styles.metricIcon}><Activity size={20} /></div>
                        <span className={styles.metricChange}>
                            <ArrowUpRight size={14} /> +8%
                        </span>
                    </div>
                    <div className={styles.metricValue}>{stats?.activeUsers?.toLocaleString() || 0}</div>
                    <div className={styles.metricLabel}>{isArabic ? 'المستخدمين النشطين' : 'Active Users'}</div>
                </div>

                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <div className={styles.metricIcon}><Trophy size={20} /></div>
                        <span className={`${styles.metricChange} ${styles.down}`}>
                            <ArrowDownRight size={14} /> -3%
                        </span>
                    </div>
                    <div className={styles.metricValue}>{stats?.matchesPlayed?.toLocaleString() || 0}</div>
                    <div className={styles.metricLabel}>{isArabic ? 'المباريات' : 'Matches Played'}</div>
                </div>

                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <div className={styles.metricIcon}><DollarSign size={20} /></div>
                        <span className={styles.metricChange}>
                            <ArrowUpRight size={14} /> +25%
                        </span>
                    </div>
                    <div className={styles.metricValue}>${stats?.totalRevenue?.toLocaleString() || 0}</div>
                    <div className={styles.metricLabel}>{isArabic ? 'الإيرادات' : 'Revenue'}</div>
                </div>
            </div>

            {/* Charts Row */}
            <div className={styles.chartsRow}>
                {/* User Activity Chart */}
                <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                        <h3><BarChart3 size={18} /> {isArabic ? 'نشاط المستخدمين' : 'User Activity'}</h3>
                    </div>
                    <div className={styles.barChart}>
                        {mockWeeklyData.map((day, index) => (
                            <div key={index} className={styles.barGroup}>
                                <div className={styles.bars}>
                                    <div
                                        className={styles.bar}
                                        style={{ height: `${(day.users / maxUsers) * 100}%` }}
                                        title={`${day.users} users`}
                                    />
                                </div>
                                <span className={styles.barLabel}>{day.day}</span>
                            </div>
                        ))}
                    </div>
                    <div className={styles.chartLegend}>
                        <span><span className={styles.legendDot} /> {isArabic ? 'المستخدمين' : 'Users'}</span>
                    </div>
                </div>

                {/* Revenue Chart */}
                <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                        <h3><TrendingUp size={18} /> {isArabic ? 'الإيرادات الشهرية' : 'Monthly Revenue'}</h3>
                    </div>
                    <div className={styles.lineChart}>
                        <svg viewBox="0 0 300 120" className={styles.chartSvg}>
                            <defs>
                                <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="rgba(0, 166, 81, 0.3)" />
                                    <stop offset="100%" stopColor="rgba(0, 166, 81, 0)" />
                                </linearGradient>
                            </defs>
                            {/* Area */}
                            <path
                                d={`M 0 ${120 - (mockRevenueData[0].revenue / maxRevenue) * 100} 
                   ${mockRevenueData.map((d, i) =>
                                    `L ${(i / (mockRevenueData.length - 1)) * 300} ${120 - (d.revenue / maxRevenue) * 100}`
                                ).join(' ')} 
                   L 300 120 L 0 120 Z`}
                                fill="url(#revenueGradient)"
                            />
                            {/* Line */}
                            <path
                                d={`M 0 ${120 - (mockRevenueData[0].revenue / maxRevenue) * 100} 
                   ${mockRevenueData.map((d, i) =>
                                    `L ${(i / (mockRevenueData.length - 1)) * 300} ${120 - (d.revenue / maxRevenue) * 100}`
                                ).join(' ')}`}
                                fill="none"
                                stroke="#00a651"
                                strokeWidth="2"
                            />
                            {/* Points */}
                            {mockRevenueData.map((d, i) => (
                                <circle
                                    key={i}
                                    cx={(i / (mockRevenueData.length - 1)) * 300}
                                    cy={120 - (d.revenue / maxRevenue) * 100}
                                    r="4"
                                    fill="#00a651"
                                />
                            ))}
                        </svg>
                        <div className={styles.chartLabels}>
                            {mockRevenueData.map((d, i) => (
                                <span key={i}>{d.month}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Stats */}
            <div className={styles.statsRow}>
                <div className={styles.statBox}>
                    <Coins size={24} />
                    <div>
                        <span className={styles.statValue}>{stats?.creditsInCirculation?.toLocaleString() || 0}</span>
                        <span className={styles.statLabel}>{isArabic ? 'الرصيد المتداول' : 'Credits in Circulation'}</span>
                    </div>
                </div>
                <div className={styles.statBox}>
                    <Target size={24} />
                    <div>
                        <span className={styles.statValue}>{stats?.averagePointsPerMatch || 0}</span>
                        <span className={styles.statLabel}>{isArabic ? 'متوسط النقاط/مباراة' : 'Avg Points/Match'}</span>
                    </div>
                </div>
                <div className={styles.statBox}>
                    <PieChart size={24} />
                    <div>
                        <span className={styles.statValue}>{stats?.retentionRate || 0}%</span>
                        <span className={styles.statLabel}>{isArabic ? 'معدل الاحتفاظ' : 'Retention Rate'}</span>
                    </div>
                </div>
            </div>

            {/* Top Users Table */}
            <div className={styles.tableCard}>
                <h3>{isArabic ? 'أفضل المستخدمين' : 'Top Performers'}</h3>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>{isArabic ? 'المستخدم' : 'User'}</th>
                            <th>{isArabic ? 'النقاط' : 'Points'}</th>
                            <th>{isArabic ? 'المباريات' : 'Matches'}</th>
                            <th>{isArabic ? 'الرتبة' : 'Rank'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { name: 'Ahmed Al-Saeed', points: 12500, matches: 45, rank: 1 },
                            { name: 'Mohammed Hassan', points: 11800, matches: 42, rank: 2 },
                            { name: 'Khalid Omar', points: 11200, matches: 44, rank: 3 },
                            { name: 'Fahad Ali', points: 10900, matches: 40, rank: 4 },
                            { name: 'Omar Saleh', points: 10500, matches: 43, rank: 5 },
                        ].map((user, i) => (
                            <tr key={i}>
                                <td>{user.rank}</td>
                                <td>{user.name}</td>
                                <td>{user.points.toLocaleString()}</td>
                                <td>{user.matches}</td>
                                <td><span className={styles.rankBadge}>#{user.rank}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
