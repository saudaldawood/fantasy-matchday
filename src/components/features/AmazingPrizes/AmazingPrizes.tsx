'use client';

import React from 'react';
import styles from './AmazingPrizes.module.css';
import { useTranslations } from 'next-intl';

export const AmazingPrizes = () => {
    const t = useTranslations('Prizes');

    const prizes = [
        { titleKey: 'weeklyCash.title', valueKey: 'weeklyCash.value' },
        { titleKey: 'matchTickets.title', valueKey: 'matchTickets.value' },
        { titleKey: 'jerseys.title', valueKey: 'jerseys.value' },
        { titleKey: 'seasonPrize.title', valueKey: 'seasonPrize.value' },
    ];

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <h2 className={styles.title}>
                    {t('title')} <span className={styles.highlight}>{t('titleHighlight')}</span> {t('titleSuffix')}
                </h2>
                <p className={styles.subtitle}>
                    {t('subtitle')}
                </p>

                <div className={styles.prizeGrid}>
                    {prizes.map((prize, index) => (
                        <div key={index} className={styles.prizeCard}>
                            <h3 className={styles.prizeTitle}>{t(prize.titleKey)}</h3>
                            <p className={styles.prizeValue}>{t(prize.valueKey)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
