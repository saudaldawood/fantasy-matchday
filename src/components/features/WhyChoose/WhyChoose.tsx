'use client';

import React from 'react';
import styles from './WhyChoose.module.css';
import Image from 'next/image';
import { Users, Trophy, Clock } from 'lucide-react';
import { Button } from '../../ui/Button/Button';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import soccerPlayer from '@/images/soccer-player-with-ball-grass-field_23-2150821562 1.png';

export const WhyChoose = () => {
    const t = useTranslations('WhyChoose');
    const { user } = useAuth();

    return (
        <section id="features" className={styles.section}>
            <div className={styles.container}>
                {/* Left Card - Why Choose */}
                <div className={styles.whyCard}>
                    <div className={styles.imageOverlay}>
                        <Image
                            src={soccerPlayer}
                            alt="Soccer Player"
                            className={styles.playerImage}
                            fill
                            style={{ objectFit: 'cover' }}
                        />
                        <div className={styles.cardGradient}></div>
                    </div>
                    <div className={styles.cardContent}>
                        <h2 className={styles.cardTitle}>
                            {t('titlePrefix')}<br />
                            <span className={styles.highlight}>{t('titleHighlight')}</span>
                        </h2>
                        <p className={styles.cardSubtitle}>
                            {t('subtitle1')}<br />
                            {t('subtitle2')}
                        </p>
                        <Link href={user ? "/lineup" : "/register"}>
                            <Button size="md">{t('startPlaying')}</Button>
                        </Link>
                    </div>
                </div>

                {/* Right Side - Feature Cards */}
                <div className={styles.featuresGrid}>
                    {/* Build Your Squad - Full Width */}
                    <div className={styles.featureCard + ' ' + styles.fullWidth}>
                        <div className={styles.iconWrapper}>
                            <Users size={24} />
                        </div>
                        <h3 className={styles.featureTitle}>{t('buildYourSquad.title')}</h3>
                        <p className={styles.featureDesc}>
                            {t('buildYourSquad.description')}
                        </p>
                    </div>

                    {/* Compete & Win */}
                    <div className={styles.featureCard}>
                        <div className={styles.iconWrapper}>
                            <Trophy size={24} />
                        </div>
                        <h3 className={styles.featureTitle}>{t('competeAndWin.title')}</h3>
                        <p className={styles.featureDesc}>
                            {t('competeAndWin.description')}
                        </p>
                    </div>

                    {/* Real-Time Updates */}
                    <div className={styles.featureCard}>
                        <div className={styles.iconWrapper}>
                            <Clock size={24} />
                        </div>
                        <h3 className={styles.featureTitle}>{t('realTimeUpdates.title')}</h3>
                        <p className={styles.featureDesc}>
                            {t('realTimeUpdates.description')}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};
