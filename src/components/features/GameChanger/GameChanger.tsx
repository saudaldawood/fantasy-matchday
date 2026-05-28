'use client';

import React from 'react';
import styles from './GameChanger.module.css';
import Image from 'next/image';
import { Play } from 'lucide-react';
import { useTranslations } from 'next-intl';
import soccerPlayer from '@/images/17-06 1.jpg';

export const GameChanger = () => {
    const t = useTranslations('GameChanger');

    return (
        <section id="how-it-works" className={styles.section}>
            <div className={styles.container}>
                {/* Left Content */}
                <div className={styles.leftContent}>
                    <h2 className={styles.title}>{t('title')}</h2>
                    <p className={styles.subtitle}>
                        {t('subtitle')}
                    </p>
                    <button className={styles.watchBtn}>
                        <span className={styles.playIcon}>
                            <Play size={16} fill="currentColor" />
                        </span>
                        {t('watchVideo')}
                    </button>
                </div>

                {/* Right Content - Features */}
                <div className={styles.rightContent}>
                    <div className={styles.feature}>
                        <h3 className={styles.featureTitle}>{t('instantImpact.title')}</h3>
                        <p className={styles.featureDesc}>
                            {t('instantImpact.description')}
                        </p>
                    </div>

                    <div className={styles.feature}>
                        <h3 className={styles.featureTitle}>{t('liveData.title')}</h3>
                        <p className={styles.featureDesc}>
                            {t('liveData.description')}
                        </p>
                    </div>

                    <div className={styles.feature}>
                        <h3 className={styles.featureTitle}>{t('globalRank.title')}</h3>
                        <p className={styles.featureDesc}>
                            {t('globalRank.description')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Soccer Player Image */}
            <div className={styles.imageContainer}>
                <Image
                    src={soccerPlayer}
                    alt="Soccer Player"
                    className={styles.playerImage}
                    priority
                />
            </div>

            {/* Scrolling Marquee */}
            <div className={styles.marquee}>
                <div className={styles.marqueeTrack}>
                    <span className={styles.marqueeItem}>{t('marquee.speedYouCanFeel')}</span>
                    <span className={styles.marqueeDot}>•</span>
                    <span className={styles.marqueeItem}>{t('marquee.buildYourSquad')}</span>
                    <span className={styles.marqueeDot}>•</span>
                    <span className={styles.marqueeItem}>{t('marquee.competeAndWin')}</span>
                    <span className={styles.marqueeDot}>•</span>
                    <span className={styles.marqueeItem}>{t('marquee.realTimeUpdates')}</span>
                    <span className={styles.marqueeDot}>•</span>
                    <span className={styles.marqueeItem}>{t('marquee.speedYouCanFeel')}</span>
                    <span className={styles.marqueeDot}>•</span>
                    <span className={styles.marqueeItem}>{t('marquee.buildYourSquad')}</span>
                    <span className={styles.marqueeDot}>•</span>
                    <span className={styles.marqueeItem}>{t('marquee.competeAndWin')}</span>
                    <span className={styles.marqueeDot}>•</span>
                    <span className={styles.marqueeItem}>{t('marquee.realTimeUpdates')}</span>
                    <span className={styles.marqueeDot}>•</span>
                </div>
            </div>
        </section>
    );
};
