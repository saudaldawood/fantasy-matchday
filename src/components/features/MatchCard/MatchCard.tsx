'use client';

import React from 'react';
import styles from './MatchCard.module.css';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';

interface Team {
    name: string;
    logo: string;
}

interface MatchCardProps {
    fixtureId?: number; // Real match ID from API
    homeTeam: Team;
    awayTeam: Team;
    date: string;
    time: string;
    venue: string;
    status: 'scheduled' | 'live' | 'upcoming';
    variant?: 'green' | 'dark';
}

export const MatchCard: React.FC<MatchCardProps> = ({
    fixtureId,
    homeTeam,
    awayTeam,
    date,
    time,
    venue,
    status,
    variant = 'green'
}) => {
    const t = useTranslations('Matches');

    const statusText = status === 'upcoming' ? t('upcoming') : t('scheduled');

    return (
        <div className={clsx(styles.matchCard, variant === 'dark' ? styles.darkVariant : styles.greenVariant)}>
            {/* Teams Row */}
            <div className={styles.teamsRow}>
                {/* Home Team */}
                <div className={styles.teamSection}>
                    <div className={styles.teamLogo}>
                        {homeTeam.logo ? (
                            <img src={homeTeam.logo} alt={homeTeam.name} />
                        ) : (
                            <span>{homeTeam.name.substring(0, 2).toUpperCase()}</span>
                        )}
                    </div>
                    <span className={styles.teamName}>{homeTeam.name}</span>
                </div>

                {/* Status & VS */}
                <div className={styles.centerSection}>
                    <span className={styles.matchStatus}>{statusText}</span>
                    <span className={styles.vs}>VS</span>
                </div>

                {/* Away Team */}
                <div className={styles.teamSection}>
                    <div className={styles.teamLogo}>
                        {awayTeam.logo ? (
                            <img src={awayTeam.logo} alt={awayTeam.name} />
                        ) : (
                            <span>{awayTeam.name.substring(0, 2).toUpperCase()}</span>
                        )}
                    </div>
                    <span className={styles.teamName}>{awayTeam.name}</span>
                </div>
            </div>

            {/* Match Info */}
            <div className={styles.matchInfo}>
                <span className={styles.venue}>{venue}</span>
                <span className={styles.dateTime}>{date} • {time}</span>
            </div>

            {/* Select Match Button */}
            <Link
                href={fixtureId
                    ? `/lineup?fixtureId=${fixtureId}&match=${homeTeam.name}-${awayTeam.name}`
                    : `/lineup?match=${homeTeam.name}-${awayTeam.name}`
                }
                className={clsx(styles.selectBtn, variant === 'dark' ? styles.darkBtn : styles.greenBtn)}
            >
                {t('selectMatch')}
            </Link>
        </div>
    );
};
