'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import {
    CREDIT_PACKAGES,
    POWER_UPS,
    getUserCredits,
    type CreditPackage,
    type PowerUp
} from '@/services/credits';
import { PaymentModal } from '@/components/features/PaymentModal/PaymentModal';
import styles from './page.module.css';
import { Coins, Zap, Star, Crown, ShoppingCart, Check, Sparkles } from 'lucide-react';

export default function CreditsPage() {
    const locale = useLocale();
    const { user } = useAuth();
    const isArabic = locale === 'ar';

    const [credits, setCredits] = useState(0);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'packages' | 'powerups'>('packages');
    const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);

    useEffect(() => {
        async function fetchCredits() {
            if (!user) return;
            try {
                const userCredits = await getUserCredits(user.uid);
                setCredits(userCredits);
            } catch (error) {
                console.error('Error fetching credits:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchCredits();
    }, [user]);

    const handlePurchase = (pkg: CreditPackage) => {
        if (!user) {
            alert(isArabic ? 'يرجى تسجيل الدخول أولاً' : 'Please login first');
            return;
        }
        setSelectedPackage(pkg);
    };

    const handlePaymentSuccess = (earnedCredits: number) => {
        // Update local credits display
        setCredits(prev => prev + earnedCredits);
        setSelectedPackage(null);
    };

    const getPowerUpIcon = (id: string) => {
        switch (id) {
            case 'captain_boost': return <Star size={24} />;
            case 'triple_captain': return <Crown size={24} />;
            case 'bench_boost': return <Zap size={24} />;
            case 'wild_card': return <Sparkles size={24} />;
            default: return <Zap size={24} />;
        }
    };

    if (loading) {
        return (
            <div className={styles.pageWrapper}>
                <div className={styles.loading}>
                    <Coins size={40} />
                    <p>{isArabic ? 'جاري التحميل...' : 'Loading...'}</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className={styles.pageWrapper}>
                <div className={styles.container}>
                    {/* Header with Balance */}
                    <header className={styles.header}>
                        <div className={styles.balanceCard}>
                            <div className={styles.balanceIcon}>
                                <Coins size={32} />
                            </div>
                            <div className={styles.balanceInfo}>
                                <span className={styles.balanceLabel}>{isArabic ? 'رصيدك الحالي' : 'Your Balance'}</span>
                                <span className={styles.balanceAmount}>{credits.toLocaleString()}</span>
                            </div>
                        </div>
                    </header>

                    {/* Tabs */}
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tab} ${activeTab === 'packages' ? styles.active : ''}`}
                            onClick={() => setActiveTab('packages')}
                        >
                            <ShoppingCart size={16} />
                            {isArabic ? 'شراء الرصيد' : 'Buy Credits'}
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'powerups' ? styles.active : ''}`}
                            onClick={() => setActiveTab('powerups')}
                        >
                            <Zap size={16} />
                            {isArabic ? 'التعزيزات' : 'Power-Ups'}
                        </button>
                    </div>

                    {/* Content */}
                    {activeTab === 'packages' ? (
                        <div className={styles.packagesGrid}>
                            {CREDIT_PACKAGES.map((pkg, index) => {
                                const isPopular = index === 1; // Mark medium as popular
                                const isBest = index === CREDIT_PACKAGES.length - 1; // Mark last as best value

                                return (
                                    <div
                                        key={pkg.id}
                                        className={`${styles.packageCard} ${isPopular ? styles.popular : ''} ${isBest ? styles.bestValue : ''}`}
                                    >
                                        {isPopular && <span className={styles.badge}>{isArabic ? 'الأكثر شيوعاً' : 'Most Popular'}</span>}
                                        {isBest && <span className={styles.badge}>{isArabic ? 'أفضل قيمة' : 'Best Value'}</span>}

                                        <div className={styles.packageHeader}>
                                            <Coins size={28} className={styles.packageIcon} />
                                            <h3>{isArabic ? pkg.nameAr : pkg.name}</h3>
                                        </div>

                                        <div className={styles.packageCredits}>
                                            <span className={styles.creditsAmount}>{pkg.credits.toLocaleString()}</span>
                                            {pkg.bonus > 0 && (
                                                <span className={styles.bonus}>+{pkg.bonus} {isArabic ? 'مكافأة' : 'bonus'}</span>
                                            )}
                                        </div>

                                        <div className={styles.packagePrice}>{pkg.priceDisplay}</div>

                                        <button
                                            className={styles.buyBtn}
                                            onClick={() => handlePurchase(pkg)}
                                        >
                                            {isArabic ? 'شراء الآن' : 'Buy Now'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className={styles.powerupsGrid}>
                            {POWER_UPS.map((powerup) => {
                                const canAfford = credits >= powerup.cost;

                                return (
                                    <div key={powerup.id} className={styles.powerupCard}>
                                        <div className={styles.powerupIcon}>
                                            {getPowerUpIcon(powerup.id)}
                                        </div>

                                        <div className={styles.powerupContent}>
                                            <h3>{isArabic ? powerup.nameAr : powerup.name}</h3>
                                            <p>{isArabic ? powerup.descriptionAr : powerup.description}</p>

                                            <div className={styles.powerupFooter}>
                                                <span className={styles.powerupCost}>
                                                    <Coins size={14} />
                                                    {powerup.cost}
                                                </span>

                                                <span className={`${styles.affordability} ${canAfford ? styles.canAfford : styles.cantAfford}`}>
                                                    {canAfford
                                                        ? <><Check size={14} /> {isArabic ? 'متاح' : 'Available'}</>
                                                        : (isArabic ? 'رصيد غير كافي' : 'Not enough credits')
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            <div className={styles.powerupNote}>
                                <p>
                                    {isArabic
                                        ? '💡 يمكنك استخدام التعزيزات عند إنشاء تشكيلتك قبل المباراة'
                                        : '💡 Use power-ups when building your lineup before a match'
                                    }
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Payment Modal */}
            {
                selectedPackage && (
                    <PaymentModal
                        package={selectedPackage}
                        onClose={() => setSelectedPackage(null)}
                        onSuccess={handlePaymentSuccess}
                        isArabic={isArabic}
                    />
                )
            }
        </>
    );
}
