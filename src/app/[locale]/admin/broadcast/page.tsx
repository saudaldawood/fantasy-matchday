'use client';

/**
 * Admin Broadcast Page
 * Send notifications to users
 */

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
    Send,
    Users,
    Crown,
    Trophy,
    Clock,
    History,
    AlertCircle,
    Check,
    Calendar
} from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { useAuth } from '@/providers/AuthProvider';
import styles from './page.module.css';

interface BroadcastHistory {
    id: string;
    title: string;
    message: string;
    targetAudience: string;
    recipientCount: number;
    sentAt: any;
}

export default function AdminBroadcastPage() {
    const t = useTranslations('Admin');
    const { user, profile } = useAuth();

    const [title, setTitle] = useState('');
    const [titleAr, setTitleAr] = useState('');
    const [message, setMessage] = useState('');
    const [messageAr, setMessageAr] = useState('');
    const [targetAudience, setTargetAudience] = useState<'all' | 'premium' | 'league' | 'inactive'>('all');
    const [leagueId, setLeagueId] = useState('');
    const [scheduledFor, setScheduledFor] = useState('');
    const [isScheduled, setIsScheduled] = useState(false);

    const [history, setHistory] = useState<BroadcastHistory[]>([]);
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Load broadcast history
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const getBroadcastHistory = httpsCallable(functions, 'getBroadcastHistory');
                const result = await getBroadcastHistory({ limit: 20 });
                const data = result.data as { history: BroadcastHistory[] };
                setHistory(data.history || []);
            } catch (err) {
                console.error('Error loading history:', err);
            }
            setHistoryLoading(false);
        };

        loadHistory();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !message) {
            setError('Title and message are required');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const sendBroadcast = httpsCallable(functions, 'sendBroadcastNotification');
            const result = await sendBroadcast({
                title,
                titleAr: titleAr || title,
                message,
                messageAr: messageAr || message,
                targetAudience,
                leagueId: targetAudience === 'league' ? leagueId : undefined,
                scheduledFor: isScheduled ? scheduledFor : undefined,
            });

            const data = result.data as { success: boolean; recipientCount?: number; scheduled?: boolean };

            if (data.success) {
                if (data.scheduled) {
                    setSuccess(`Broadcast scheduled for ${new Date(scheduledFor).toLocaleString()}`);
                } else {
                    setSuccess(`Broadcast sent to ${data.recipientCount} users!`);
                }

                // Reset form
                setTitle('');
                setTitleAr('');
                setMessage('');
                setMessageAr('');
                setTargetAudience('all');
                setLeagueId('');
                setScheduledFor('');
                setIsScheduled(false);

                // Reload history
                const getBroadcastHistory = httpsCallable(functions, 'getBroadcastHistory');
                const historyResult = await getBroadcastHistory({ limit: 20 });
                const historyData = historyResult.data as { history: BroadcastHistory[] };
                setHistory(historyData.history || []);
            }
        } catch (err: any) {
            console.error('Error sending broadcast:', err);
            setError(err.message || 'Failed to send broadcast');
        }

        setLoading(false);
    };

    // Check if user is admin
    if (!profile?.isAdmin) {
        return (
            <div className={styles.container}>
                <div className={styles.accessDenied}>
                    <AlertCircle size={48} />
                    <h2>Access Denied</h2>
                    <p>You need admin privileges to access this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>
                    <Send size={28} />
                    Broadcast Notifications
                </h1>
                <p className={styles.subtitle}>
                    Send notifications to groups of users
                </p>
            </header>

            <div className={styles.grid}>
                {/* Broadcast Form */}
                <div className={styles.formSection}>
                    <h2>New Broadcast</h2>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {/* Title */}
                        <div className={styles.formGroup}>
                            <label>Title (English)</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Notification title..."
                                className={styles.input}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Title (Arabic)</label>
                            <input
                                type="text"
                                value={titleAr}
                                onChange={(e) => setTitleAr(e.target.value)}
                                placeholder="عنوان الإشعار..."
                                className={styles.input}
                                dir="rtl"
                            />
                        </div>

                        {/* Message */}
                        <div className={styles.formGroup}>
                            <label>Message (English)</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Notification message..."
                                className={styles.textarea}
                                rows={4}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Message (Arabic)</label>
                            <textarea
                                value={messageAr}
                                onChange={(e) => setMessageAr(e.target.value)}
                                placeholder="نص الإشعار..."
                                className={styles.textarea}
                                rows={4}
                                dir="rtl"
                            />
                        </div>

                        {/* Target Audience */}
                        <div className={styles.formGroup}>
                            <label>Target Audience</label>
                            <div className={styles.audienceOptions}>
                                <button
                                    type="button"
                                    className={`${styles.audienceBtn} ${targetAudience === 'all' ? styles.active : ''}`}
                                    onClick={() => setTargetAudience('all')}
                                >
                                    <Users size={18} />
                                    All Users
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.audienceBtn} ${targetAudience === 'premium' ? styles.active : ''}`}
                                    onClick={() => setTargetAudience('premium')}
                                >
                                    <Crown size={18} />
                                    Premium
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.audienceBtn} ${targetAudience === 'league' ? styles.active : ''}`}
                                    onClick={() => setTargetAudience('league')}
                                >
                                    <Trophy size={18} />
                                    League
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.audienceBtn} ${targetAudience === 'inactive' ? styles.active : ''}`}
                                    onClick={() => setTargetAudience('inactive')}
                                >
                                    <Clock size={18} />
                                    Inactive
                                </button>
                            </div>
                        </div>

                        {/* League ID (if league selected) */}
                        {targetAudience === 'league' && (
                            <div className={styles.formGroup}>
                                <label>League ID</label>
                                <input
                                    type="text"
                                    value={leagueId}
                                    onChange={(e) => setLeagueId(e.target.value)}
                                    placeholder="Enter league ID..."
                                    className={styles.input}
                                    required
                                />
                            </div>
                        )}

                        {/* Schedule Toggle */}
                        <div className={styles.formGroup}>
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={isScheduled}
                                    onChange={(e) => setIsScheduled(e.target.checked)}
                                />
                                <Calendar size={16} />
                                Schedule for later
                            </label>
                        </div>

                        {isScheduled && (
                            <div className={styles.formGroup}>
                                <label>Schedule Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={scheduledFor}
                                    onChange={(e) => setScheduledFor(e.target.value)}
                                    className={styles.input}
                                    required
                                />
                            </div>
                        )}

                        {/* Error / Success Messages */}
                        {error && (
                            <div className={styles.error}>
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className={styles.success}>
                                <Check size={16} />
                                {success}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className={styles.btnSpinner}></div>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    {isScheduled ? 'Schedule Broadcast' : 'Send Broadcast'}
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Broadcast History */}
                <div className={styles.historySection}>
                    <h2>
                        <History size={20} />
                        Broadcast History
                    </h2>

                    {historyLoading ? (
                        <div className={styles.loading}>
                            <div className={styles.spinner}></div>
                        </div>
                    ) : history.length === 0 ? (
                        <p className={styles.noHistory}>No broadcasts sent yet</p>
                    ) : (
                        <div className={styles.historyList}>
                            {history.map((item) => (
                                <div key={item.id} className={styles.historyItem}>
                                    <div className={styles.historyHeader}>
                                        <h4>{item.title}</h4>
                                        <span className={styles.audienceTag}>
                                            {item.targetAudience}
                                        </span>
                                    </div>
                                    <p>{item.message}</p>
                                    <div className={styles.historyMeta}>
                                        <span>
                                            <Users size={14} />
                                            {item.recipientCount} recipients
                                        </span>
                                        <span>
                                            <Clock size={14} />
                                            {item.sentAt?.toDate?.()?.toLocaleString() || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
