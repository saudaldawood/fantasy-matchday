'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import styles from './layout.module.css';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const locale = useLocale();

    useEffect(() => {
        if (!loading && !user) {
            router.push(`/${locale}/login`);
        }
    }, [user, loading, router, locale]);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className={styles.adminLayout}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h2>Admin Panel</h2>
                </div>
                <nav className={styles.sidebarNav}>
                    <a href={`/${locale}/admin`} className={styles.navItem}>
                        <span className={styles.navIcon}>📊</span>
                        <span>Dashboard</span>
                    </a>
                    <a href={`/${locale}/admin/users`} className={styles.navItem}>
                        <span className={styles.navIcon}>👥</span>
                        <span>Users</span>
                    </a>
                    <a href={`/${locale}/admin/matches`} className={styles.navItem}>
                        <span className={styles.navIcon}>⚽</span>
                        <span>Matches</span>
                    </a>
                    <a href={`/${locale}/admin/notifications`} className={styles.navItem}>
                        <span className={styles.navIcon}>🔔</span>
                        <span>Notifications</span>
                    </a>
                    <a href={`/${locale}/admin/activity`} className={styles.navItem}>
                        <span className={styles.navIcon}>📝</span>
                        <span>Activity Log</span>
                    </a>
                </nav>
                <div className={styles.sidebarFooter}>
                    <a href={`/${locale}`} className={styles.backLink}>
                        ← Back to App
                    </a>
                </div>
            </aside>
            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
}

