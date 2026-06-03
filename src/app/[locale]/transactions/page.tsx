'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { getTransactionHistory, type CreditTransaction } from '@/services/credits';
import styles from './page.module.css';
import { Coins, ArrowUpRight, ArrowDownLeft, Clock, Filter, ChevronDown } from 'lucide-react';

type FilterType = 'all' | 'earned' | 'spent' | 'purchased';

export default function TransactionsPage() {
    const locale = useLocale();
    const { user } = useAuth();
    const isArabic = locale === 'ar';

    const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('all');
    const [showFilter, setShowFilter] = useState(false);

    useEffect(() => {
        async function fetchTransactions() {
            if (!user) return;

            try {
                const data = await getTransactionHistory(user.uid, 50);
                setTransactions(data);
            } catch (error) {
                console.error('Error fetching transactions:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchTransactions();
    }, [user]);

    const getFilteredTransactions = () => {
        if (filter === 'all') return transactions;

        return transactions.filter(t => {
            if (filter === 'earned') return t.amount > 0 && t.type !== 'purchase';
            if (filter === 'spent') return t.amount < 0;
            if (filter === 'purchased') return t.type === 'purchase';
            return true;
        });
    };

    const getTransactionIcon = (type: string, amount: number) => {
        if (amount > 0) {
            return <ArrowDownLeft size={18} className={styles.iconEarned} />;
        }
        return <ArrowUpRight size={18} className={styles.iconSpent} />;
    };

    const getTransactionLabel = (type: string): string => {
        const labels: Record<string, { en: string; ar: string }> = {
            daily_login: { en: 'Daily Login Bonus', ar: 'مكافأة تسجيل الدخول' },
            match_participation: { en: 'Match Participation', ar: 'مشاركة في المباراة' },
            weekly_reward: { en: 'Weekly Ranking Reward', ar: 'مكافأة الترتيب الأسبوعي' },
            achievement: { en: 'Achievement Unlocked', ar: 'إنجاز جديد' },
            purchase: { en: 'Credit Purchase', ar: 'شراء رصيد' },
            powerup: { en: 'Power-Up Used', ar: 'استخدام تعزيز' },
            refund: { en: 'Refund', ar: 'استرداد' },
        };
        return labels[type]?.[isArabic ? 'ar' : 'en'] || type;
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const filteredTransactions = getFilteredTransactions();

    // Calculate totals
    const totalEarned = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const totalSpent = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);

    if (loading) {
        return (
            <div className={styles.pageWrapper}>
                <div className={styles.loading}>
                    <Clock size={40} />
                    <p>{isArabic ? 'جاري تحميل السجل...' : 'Loading history...'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.container}>
                {/* Header */}
                <header className={styles.header}>
                    <div>
                        <h1>{isArabic ? 'سجل المعاملات' : 'Transaction History'}</h1>
                        <p className={styles.subtitle}>
                            {isArabic ? 'جميع حركات الرصيد الخاصة بك' : 'All your credit transactions'}
                        </p>
                    </div>
                </header>

                {/* Summary Cards */}
                <div className={styles.summaryGrid}>
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryIcon}>
                            <ArrowDownLeft size={20} />
                        </div>
                        <div>
                            <span className={styles.summaryValue}>{totalEarned.toLocaleString()}</span>
                            <span className={styles.summaryLabel}>{isArabic ? 'الرصيد المكتسب' : 'Credits Earned'}</span>
                        </div>
                    </div>
                    <div className={`${styles.summaryCard} ${styles.spent}`}>
                        <div className={styles.summaryIcon}>
                            <ArrowUpRight size={20} />
                        </div>
                        <div>
                            <span className={styles.summaryValue}>{totalSpent.toLocaleString()}</span>
                            <span className={styles.summaryLabel}>{isArabic ? 'الرصيد المستخدم' : 'Credits Spent'}</span>
                        </div>
                    </div>
                </div>

                {/* Filter */}
                <div className={styles.filterBar}>
                    <button
                        className={styles.filterBtn}
                        onClick={() => setShowFilter(!showFilter)}
                    >
                        <Filter size={16} />
                        {filter === 'all' ? (isArabic ? 'الكل' : 'All') :
                            filter === 'earned' ? (isArabic ? 'مكتسب' : 'Earned') :
                                filter === 'spent' ? (isArabic ? 'مستخدم' : 'Spent') :
                                    (isArabic ? 'مشترى' : 'Purchased')}
                        <ChevronDown size={14} />
                    </button>

                    {showFilter && (
                        <div className={styles.filterDropdown}>
                            {(['all', 'earned', 'spent', 'purchased'] as FilterType[]).map(f => (
                                <button
                                    key={f}
                                    className={`${styles.filterOption} ${filter === f ? styles.active : ''}`}
                                    onClick={() => { setFilter(f); setShowFilter(false); }}
                                >
                                    {f === 'all' ? (isArabic ? 'الكل' : 'All') :
                                        f === 'earned' ? (isArabic ? 'مكتسب' : 'Earned') :
                                            f === 'spent' ? (isArabic ? 'مستخدم' : 'Spent') :
                                                (isArabic ? 'مشترى' : 'Purchased')}
                                </button>
                            ))}
                        </div>
                    )}

                    <span className={styles.resultCount}>
                        {filteredTransactions.length} {isArabic ? 'معاملة' : 'transactions'}
                    </span>
                </div>

                {/* Transactions List */}
                <div className={styles.transactionsList}>
                    {filteredTransactions.length === 0 ? (
                        <div className={styles.empty}>
                            <Coins size={48} />
                            <h3>{isArabic ? 'لا توجد معاملات' : 'No transactions yet'}</h3>
                            <p>{isArabic ? 'ستظهر معاملاتك هنا' : 'Your transactions will appear here'}</p>
                        </div>
                    ) : (
                        filteredTransactions.map((transaction, index) => (
                            <div key={index} className={styles.transactionItem}>
                                <div className={styles.transactionIcon}>
                                    {getTransactionIcon(transaction.type, transaction.amount)}
                                </div>
                                <div className={styles.transactionInfo}>
                                    <span className={styles.transactionLabel}>
                                        {getTransactionLabel(transaction.type)}
                                    </span>
                                    <span className={styles.transactionDate}>
                                        {formatDate(transaction.createdAt.toDate())}
                                    </span>
                                </div>
                                <span className={`${styles.transactionAmount} ${transaction.amount > 0 ? styles.positive : styles.negative}`}>
                                    {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
