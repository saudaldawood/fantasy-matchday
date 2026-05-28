'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import {
    subscribeToNotifications,
    subscribeToUnreadCount,
    markAsRead,
    markAllAsRead,
    getNotificationIcon,
    formatNotificationTime,
    type Notification
} from '@/services/notifications';
import styles from './NotificationCenter.module.css';

export default function NotificationCenter() {
    const { user } = useAuth();
    const locale = useLocale();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Subscribe to real-time updates
    useEffect(() => {
        if (!user) return;

        const unsubNotifications = subscribeToNotifications(user.uid, setNotifications);
        const unsubUnread = subscribeToUnreadCount(user.uid, setUnreadCount);

        return () => {
            unsubNotifications();
            unsubUnread();
        };
    }, [user]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.isRead) {
            await markAsRead(notification.id);
        }
        // Handle navigation based on notification type
        // For now, just close the dropdown
        setIsOpen(false);
    };

    const handleMarkAllRead = async () => {
        if (!user) return;
        await markAllAsRead(user.uid);
    };

    if (!user) return null;

    const isArabic = locale === 'ar';

    return (
        <div className={styles.container} ref={dropdownRef}>
            <button
                className={styles.bellButton}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
            >
                <Bell size={22} />
                {unreadCount > 0 && (
                    <span className={styles.badge}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className={`${styles.dropdown} ${isArabic ? styles.rtl : ''}`}>
                    <div className={styles.header}>
                        <h3>{isArabic ? 'الإشعارات' : 'Notifications'}</h3>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllRead} className={styles.markAllBtn}>
                                {isArabic ? 'تحديد الكل كمقروء' : 'Mark all read'}
                            </button>
                        )}
                    </div>

                    <div className={styles.list}>
                        {notifications.length === 0 ? (
                            <div className={styles.empty}>
                                <Bell size={32} />
                                <p>{isArabic ? 'لا توجد إشعارات' : 'No notifications'}</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <button
                                    key={notification.id}
                                    className={`${styles.item} ${!notification.isRead ? styles.unread : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <span className={styles.icon}>
                                        {getNotificationIcon(notification.type)}
                                    </span>
                                    <div className={styles.content}>
                                        <p className={styles.title}>
                                            {isArabic ? notification.titleAr : notification.title}
                                        </p>
                                        <p className={styles.message}>
                                            {isArabic ? notification.messageAr : notification.message}
                                        </p>
                                        <span className={styles.time}>
                                            {formatNotificationTime(notification.createdAt)}
                                        </span>
                                    </div>
                                    {!notification.isRead && <span className={styles.dot} />}
                                </button>
                            ))
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <a href={`/${locale}/notifications`} className={styles.viewAll}>
                            {isArabic ? 'عرض الكل' : 'View all'}
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}
