'use client';

import { useEffect, useState } from 'react';
import { getDashboardStats, DashboardStats } from '@/services/admin';
import styles from './page.module.css';

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchStats() {
            try {
                const data = await getDashboardStats();
                setStats(data);
            } catch (err) {
                console.error('Error fetching dashboard stats:', err);
                setError('Failed to load dashboard stats');
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading dashboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>{error}</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Dashboard Overview</h1>
                <p className={styles.subtitle}>Welcome to the Fantasy Matchday Admin Panel</p>
            </header>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>👥</div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{stats?.totalUsers.toLocaleString()}</span>
                        <span className={styles.statLabel}>Total Users</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon}>🟢</div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{stats?.activeUsers.toLocaleString()}</span>
                        <span className={styles.statLabel}>Active This Week</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon}>✨</div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{stats?.newUsersToday}</span>
                        <span className={styles.statLabel}>New Today</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon}>⚽</div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{stats?.totalMatches}</span>
                        <span className={styles.statLabel}>Total Matches</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon}>🔴</div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{stats?.liveMatches}</span>
                        <span className={styles.statLabel}>Live Now</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon}>💰</div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>${stats?.totalRevenue.toLocaleString()}</span>
                        <span className={styles.statLabel}>Total Revenue</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon}>🪙</div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{stats?.totalCreditsInCirculation.toLocaleString()}</span>
                        <span className={styles.statLabel}>Credits in Circulation</span>
                    </div>
                </div>
            </div>

            <section className={styles.quickActions}>
                <h2>Quick Actions</h2>
                <div className={styles.actionsGrid}>
                    <a href="/admin/users" className={styles.actionCard}>
                        <span className={styles.actionIcon}>👥</span>
                        <span>Manage Users</span>
                    </a>
                    <a href="/admin/matches" className={styles.actionCard}>
                        <span className={styles.actionIcon}>⚽</span>
                        <span>Manage Matches</span>
                    </a>
                    <a href="/admin/notifications" className={styles.actionCard}>
                        <span className={styles.actionIcon}>📢</span>
                        <span>Send Broadcast</span>
                    </a>
                    <a href="/admin/activity" className={styles.actionCard}>
                        <span className={styles.actionIcon}>📝</span>
                        <span>View Activity</span>
                    </a>
                </div>
            </section>
        </div>
    );
}
