'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import { Search, Trophy, Users, Calendar, TrendingUp, TrendingDown, Minus, Loader2, Medal } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import {
    getGlobalLeaderboard,
    getWeeklyLeaderboard,
    getRecentMatchesWithRankings,
    getUserGlobalRank,
    type LeaderboardEntry,
    type MatchLeaderboard,
    type WeeklyLeaderboard as WeeklyLeaderboardType
} from '@/services/leaderboard';

type TabType = 'global' | 'weekly' | 'matches';

export default function LeaderboardPage() {
    const t = useTranslations('Leaderboard');
    const locale = useLocale();
    const isArabic = locale === 'ar';
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState<TabType>('global');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    // Data states
    const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<WeeklyLeaderboardType | null>(null);
    const [recentMatches, setRecentMatches] = useState<MatchLeaderboard[]>([]);
    const [userRank, setUserRank] = useState<number | null>(null);

    // Fetch data on mount and tab change
    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                if (activeTab === 'global') {
                    const data = await getGlobalLeaderboard(100);
                    setGlobalLeaderboard(data);
                } else if (activeTab === 'weekly') {
                    const data = await getWeeklyLeaderboard();
                    setWeeklyLeaderboard(data);
                } else if (activeTab === 'matches') {
                    const data = await getRecentMatchesWithRankings(14, 10);
                    setRecentMatches(data);
                }

                // Get user's rank if logged in
                if (user && !userRank) {
                    const rank = await getUserGlobalRank(user.uid);
                    setUserRank(rank);
                }
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [activeTab, user, userRank]);

    // Filter entries by search
    const filterEntries = (entries: LeaderboardEntry[]) => {
        if (!searchQuery) return entries;
        return entries.filter(e =>
            e.displayName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    const getRankChange = (change?: number) => {
        if (!change || change === 0) {
            return <Minus size={14} className={styles.noChange} />;
        }
        if (change > 0) {
            return (
                <span className={styles.rankUp}>
                    <TrendingUp size={14} /> +{change}
                </span>
            );
        }
        return (
            <span className={styles.rankDown}>
                <TrendingDown size={14} /> {change}
            </span>
        );
    };

    const getRankBadge = (rank: number) => {
        if (rank === 1) return <Medal className={styles.gold} size={20} />;
        if (rank === 2) return <Medal className={styles.silver} size={20} />;
        if (rank === 3) return <Medal className={styles.bronze} size={20} />;
        return <span className={styles.rankNumber}>{rank}</span>;
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <h1><Trophy size={28} /> {t('title')}</h1>
                        <p className={styles.subtitle}>{t('subtitle') || 'See where you stand among the best'}</p>
                    </div>

                    {user && userRank && (
                        <div className={styles.userRankCard}>
                            <span className={styles.yourRankLabel}>{t('yourRank') || 'Your Rank'}</span>
                            <span className={styles.yourRankValue}>#{userRank}</span>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'global' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('global')}
                    >
                        <Trophy size={16} />
                        {t('globalTab') || 'Global'}
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'weekly' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('weekly')}
                    >
                        <Calendar size={16} />
                        {t('weeklyTab') || 'This Week'}
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'matches' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('matches')}
                    >
                        <Users size={16} />
                        {t('matchesTab') || 'By Match'}
                    </button>
                </div>

                {/* Search */}
                <div className={styles.searchBar}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder={t('searchPlaceholder') || 'Search players...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

                {/* Content */}
                {loading ? (
                    <div className={styles.loading}>
                        <Loader2 size={32} className={styles.spinner} />
                        <p>{t('loading') || 'Loading leaderboard...'}</p>
                    </div>
                ) : (
                    <>
                        {/* Global Leaderboard */}
                        {activeTab === 'global' && (
                            <div className={styles.leaderboardTable}>
                                <div className={styles.tableHeader}>
                                    <span>{t('rank') || 'Rank'}</span>
                                    <span>{t('player') || 'Player'}</span>
                                    <span>{t('matches') || 'Matches'}</span>
                                    <span>{t('points') || 'Points'}</span>
                                </div>

                                {filterEntries(globalLeaderboard).length > 0 ? (
                                    filterEntries(globalLeaderboard).map((entry) => (
                                        <div
                                            key={entry.userId}
                                            className={`${styles.tableRow} ${user?.uid === entry.userId ? styles.currentUser : ''}`}
                                        >
                                            <span className={styles.rankCell}>
                                                {getRankBadge(entry.rank)}
                                                {getRankChange(entry.weeklyChange)}
                                            </span>
                                            <span className={styles.playerCell}>
                                                <div className={styles.avatar}>
                                                    {entry.avatarUrl ? (
                                                        <img src={entry.avatarUrl} alt={entry.displayName} />
                                                    ) : (
                                                        <span>{entry.displayName[0]?.toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <span className={styles.playerName}>{entry.displayName}</span>
                                            </span>
                                            <span className={styles.matchesCell}>{entry.matchesPlayed}</span>
                                            <span className={styles.pointsCell}>{entry.points.toLocaleString()}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className={styles.emptyState}>
                                        <Trophy size={48} />
                                        <h3>{t('noData') || 'No rankings yet'}</h3>
                                        <p>{t('noDataDesc') || 'Be the first to build a lineup!'}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Weekly Leaderboard */}
                        {activeTab === 'weekly' && weeklyLeaderboard && (
                            <div className={styles.weeklySection}>
                                <div className={styles.weekInfo}>
                                    <span>Week {weeklyLeaderboard.weekNumber}</span>
                                    <span className={styles.weekDates}>
                                        {formatDate(weeklyLeaderboard.startDate)} - {formatDate(weeklyLeaderboard.endDate)}
                                    </span>
                                    <span className={styles.participantCount}>
                                        {weeklyLeaderboard.totalParticipants} {t('participants') || 'participants'}
                                    </span>
                                </div>

                                <div className={styles.leaderboardTable}>
                                    <div className={styles.tableHeader}>
                                        <span>{t('rank') || 'Rank'}</span>
                                        <span>{t('player') || 'Player'}</span>
                                        <span>{t('matches') || 'Matches'}</span>
                                        <span>{t('points') || 'Points'}</span>
                                    </div>

                                    {filterEntries(weeklyLeaderboard.entries).length > 0 ? (
                                        filterEntries(weeklyLeaderboard.entries).map((entry) => (
                                            <div
                                                key={entry.userId}
                                                className={`${styles.tableRow} ${user?.uid === entry.userId ? styles.currentUser : ''}`}
                                            >
                                                <span className={styles.rankCell}>{getRankBadge(entry.rank)}</span>
                                                <span className={styles.playerCell}>
                                                    <div className={styles.avatar}>
                                                        {entry.avatarUrl ? (
                                                            <img src={entry.avatarUrl} alt={entry.displayName} />
                                                        ) : (
                                                            <span>{entry.displayName[0]?.toUpperCase()}</span>
                                                        )}
                                                    </div>
                                                    <span className={styles.playerName}>{entry.displayName}</span>
                                                </span>
                                                <span className={styles.matchesCell}>{entry.matchesPlayed}</span>
                                                <span className={styles.pointsCell}>{entry.points.toLocaleString()}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className={styles.emptyState}>
                                            <Calendar size={48} />
                                            <h3>{t('noWeeklyData') || 'No weekly data'}</h3>
                                            <p>{t('noWeeklyDataDesc') || 'Play matches this week to appear here!'}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Match Leaderboards */}
                        {activeTab === 'matches' && (
                            <div className={styles.matchesSection}>
                                {recentMatches.length > 0 ? (
                                    recentMatches.map((match) => (
                                        <div key={match.matchId} className={styles.matchCard}>
                                            <div className={styles.matchHeader}>
                                                <div className={styles.matchTeams}>
                                                    {match.homeTeamLogo && (
                                                        <img src={match.homeTeamLogo} alt={match.homeTeam} className={styles.teamLogo} />
                                                    )}
                                                    <span>{match.homeTeam}</span>
                                                    <span className={styles.matchScore}>
                                                        {match.status === 'finished'
                                                            ? `${match.homeScore} - ${match.awayScore}`
                                                            : match.status === 'live'
                                                                ? 'LIVE'
                                                                : 'vs'}
                                                    </span>
                                                    <span>{match.awayTeam}</span>
                                                    {match.awayTeamLogo && (
                                                        <img src={match.awayTeamLogo} alt={match.awayTeam} className={styles.teamLogo} />
                                                    )}
                                                </div>
                                                <span className={styles.matchDate}>{formatDate(match.matchDate)}</span>
                                            </div>

                                            <div className={styles.matchStats}>
                                                <span>{match.participantCount} {t('playersJoined') || 'players'}</span>
                                            </div>

                                            {match.topPlayers.length > 0 && (
                                                <div className={styles.topPlayers}>
                                                    <span className={styles.topLabel}>{t('topPlayers') || 'Top Players'}:</span>
                                                    {match.topPlayers.map((player, idx) => (
                                                        <div key={player.userId} className={styles.topPlayer}>
                                                            <span className={styles.topRank}>#{idx + 1}</span>
                                                            <span>{player.displayName}</span>
                                                            <span className={styles.topPoints}>{player.points} pts</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className={styles.emptyState}>
                                        <Users size={48} />
                                        <h3>{t('noMatches') || 'No recent matches'}</h3>
                                        <p>{t('noMatchesDesc') || 'Check back after matches are played!'}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
