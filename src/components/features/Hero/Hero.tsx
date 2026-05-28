'use client';

import React from 'react';
import styles from './Hero.module.css';
import { Button } from '../../ui/Button/Button';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { Users, DollarSign } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const Hero = () => {
    const t = useTranslations('Hero');
    const { user } = useAuth();

    return (
        <header className={styles.hero}>
            {/* Background Effects */}
            <div className={styles.gradientOrb}></div>
            <div className={styles.gridOverlay}></div>

            <div className={styles.heroContainer}>
                {/* Tagline */}
                <p className={styles.tagline}>
                    {t('tagline')}
                </p>

                {/* Main Title */}
                <h1 className={styles.heroTitle}>
                    <span className={styles.titleSmall}>{t('titlePrefix')}</span>
                    <span className={styles.titleHighlight}>{t('titleHighlight')}</span>
                    <span className={styles.titleLarge}>{t('titleSuffix')}</span>
                </h1>

                {/* Subtitle */}
                <p className={styles.heroSubtitle}>
                    {t('subtitle')}
                </p>

                {/* CTA Buttons */}
                <div className={styles.heroBtns}>
                    <Link href={user ? "/lineup" : "/register"}>
                        <Button size="lg">{t('startPlaying')}</Button>
                    </Link>
                    <a href="#how-it-works">
                        <Button variant="outline" size="lg">{t('howItWorks')}</Button>
                    </a>
                </div>

                {/* Stats Cards */}
                <div className={styles.statsContainer}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>
                            <Users size={24} />
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>12,450</span>
                            <span className={styles.statLabel}>{t('totalPlayers')}</span>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>
                            <DollarSign size={24} />
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>SAR 50k</span>
                            <span className={styles.statLabel}>{t('prizePool')}</span>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statContent}>
                            <span className={styles.statValueLive}>{t('live')}</span>
                            <span className={styles.statLabel}>{t('realTimeScoring')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
