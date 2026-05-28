'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { useUpcomingMatches, useLiveMatches } from '@/hooks/useQueries';
import { Calendar, Clock, MapPin, Users, Loader2, Trophy, Filter, X } from 'lucide-react';
import styles from './page.module.css';

export default function MatchesPage() {
    const t = useTranslations('Matches');
    const [filter, setFilter] = useState<'all' | 'live' | 'upcoming'>('all');
    const [dateFilter, setDateFilter] = useState<string>('');
    const [teamFilter, setTeamFilter] = useState<string>('');
    const [showFilters, setShowFilters] = useState(false);

    const { data: upcomingMatches, isLoading: upcomingLoading } = useUpcomingMatches();
    const { data: liveMatches, isLoading: liveLoading } = useLiveMatches();

    const isLoading = upcomingLoading || liveLoading;

    // Get all unique teams for filter dropdown
    const allTeams = useMemo(() => {
        const teams = new Set<string>();
        [...(liveMatches || []), ...(upcomingMatches || [])].forEach(match => {
            teams.add(match.teams.home.name);
            teams.add(match.teams.away.name);
        });
        return Array.from(teams).sort();
    }, [liveMatches, upcomingMatches]);

    const allMatches = useMemo(() => {
        let matches = [
            ...(liveMatches || []).map(m => ({ ...m, isLive: true })),
            ...(upcomingMatches || []).map(m => ({ ...m, isLive: false }))
        ];

        // Apply status filter
        if (filter === 'live') {
            matches = matches.filter(m => m.isLive);
        } else if (filter === 'upcoming') {
            matches = matches.filter(m => !m.isLive);
        }

        // Apply date filter
        if (dateFilter) {
            const filterDate = new Date(dateFilter).toDateString();
            matches = matches.filter(m => {
                const matchDate = new Date(m.fixture.date).toDateString();
                return matchDate === filterDate;
            });
        }

        // Apply team filter
        if (teamFilter) {
            matches = matches.filter(m =>
                m.teams.home.name === teamFilter || m.teams.away.name === teamFilter
            );
        }

        return matches;
    }, [liveMatches, upcomingMatches, filter, dateFilter, teamFilter]);

    const clearFilters = () => {
        setDateFilter('');
        setTeamFilter('');
    };

    const hasActiveFilters = dateFilter || teamFilter;

    const formatDate = (dateString: string) => {

        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>
                        {t('titlePrefix')} <span className={styles.highlight}>{t('titleHighlight')}</span>
                    </h1>
                    <p className={styles.subtitle}>Select a match to build your lineup and compete</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className={styles.filterTabs}>
                <button
                    className={`${styles.filterTab} ${filter === 'all' ? styles.active : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All Matches
                </button>
                <button
                    className={`${styles.filterTab} ${filter === 'live' ? styles.active : ''}`}
                    onClick={() => setFilter('live')}
                >
                    🔴 Live
                </button>
                <button
                    className={`${styles.filterTab} ${filter === 'upcoming' ? styles.active : ''}`}
                    onClick={() => setFilter('upcoming')}
                >
                    {t('upcoming')}
                </button>
                <button
                    className={`${styles.filterBtn} ${hasActiveFilters ? styles.hasFilters : ''}`}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter size={16} />
                    Filters {hasActiveFilters && '•'}
                </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
                <div className={styles.advancedFilters}>
                    <div className={styles.filterGroup}>
                        <label>Date</label>
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className={styles.filterInput}
                        />
                    </div>
                    <div className={styles.filterGroup}>
                        <label>Team</label>
                        <select
                            value={teamFilter}
                            onChange={(e) => setTeamFilter(e.target.value)}
                            className={styles.filterSelect}
                        >
                            <option value="">All Teams</option>
                            {allTeams.map(team => (
                                <option key={team} value={team}>{team}</option>
                            ))}
                        </select>
                    </div>
                    {hasActiveFilters && (
                        <button className={styles.clearFilters} onClick={clearFilters}>
                            <X size={14} /> Clear
                        </button>
                    )}
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className={styles.loading}>
                    <Loader2 size={40} className={styles.spinner} />
                    <p>Loading matches...</p>
                </div>
            )}

            {/* Live Matches Section */}
            {!isLoading && liveMatches && liveMatches.length > 0 && (filter === 'all' || filter === 'live') && (
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>{t('liveMatchesTitle')}</h2>
                    <div className={styles.matchGrid}>
                        {liveMatches.map((match) => (
                            <Link
                                key={match.fixture.id}
                                href={`/matches/${match.fixture.id}`}
                                className={`${styles.matchCard} ${styles.liveCard}`}
                            >
                                <div className={styles.liveIndicator}>
                                    <span className={styles.liveDot}></span>
                                    {t('live')}
                                </div>

                                <div className={styles.matchTeams}>
                                    <div className={styles.team}>
                                        <img src={match.teams.home.logo} alt={match.teams.home.name} className={styles.teamLogo} />
                                        <span className={styles.teamName}>{match.teams.home.name}</span>
                                        <span className={styles.score}>{match.goals.home ?? 0}</span>
                                    </div>

                                    <div className={styles.vs}>VS</div>

                                    <div className={styles.team}>
                                        <span className={styles.score}>{match.goals.away ?? 0}</span>
                                        <span className={styles.teamName}>{match.teams.away.name}</span>
                                        <img src={match.teams.away.logo} alt={match.teams.away.name} className={styles.teamLogo} />
                                    </div>
                                </div>

                                <div className={styles.matchInfo}>
                                    <div className={styles.infoItem}>
                                        <Clock size={14} />
                                        <span>{match.fixture.status.elapsed}'</span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <MapPin size={14} />
                                        <span>{match.fixture.venue.name}</span>
                                    </div>
                                </div>

                                <button className={styles.viewButton}>
                                    View Live Match
                                </button>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Upcoming Matches Section */}
            {!isLoading && upcomingMatches && upcomingMatches.length > 0 && (filter === 'all' || filter === 'upcoming') && (
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        {t('upcomingMatchesTitlePrefix')} <span className={styles.highlight}>{t('upcomingMatchesTitleHighlight')}</span>
                    </h2>
                    <div className={styles.matchGrid}>
                        {upcomingMatches.map((match) => (
                            <Link
                                key={match.fixture.id}
                                href={`/lineup?match=${encodeURIComponent(`${match.teams.home.name} vs ${match.teams.away.name}`)}&fixtureId=${match.fixture.id}&homeTeamId=${match.teams.home.id}&awayTeamId=${match.teams.away.id}`}
                                className={styles.matchCard}
                            >
                                <div className={styles.matchDate}>
                                    <Calendar size={14} />
                                    <span>{formatDate(match.fixture.date)}</span>
                                    <Clock size={14} />
                                    <span>{formatTime(match.fixture.date)}</span>
                                </div>

                                <div className={styles.matchTeams}>
                                    <div className={styles.team}>
                                        <img src={match.teams.home.logo} alt={match.teams.home.name} className={styles.teamLogo} />
                                        <span className={styles.teamName}>{match.teams.home.name}</span>
                                    </div>

                                    <div className={styles.vs}>VS</div>

                                    <div className={styles.team}>
                                        <span className={styles.teamName}>{match.teams.away.name}</span>
                                        <img src={match.teams.away.logo} alt={match.teams.away.name} className={styles.teamLogo} />
                                    </div>
                                </div>

                                <div className={styles.matchInfo}>
                                    <div className={styles.infoItem}>
                                        <MapPin size={14} />
                                        <span>{match.fixture.venue.name}</span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <Users size={14} />
                                        <span>Round {match.league.round}</span>
                                    </div>
                                </div>

                                <button className={styles.selectButton}>
                                    <Trophy size={16} />
                                    {t('selectMatch')}
                                </button>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && allMatches.length === 0 && (
                <div className={styles.emptyState}>
                    <Calendar size={64} className={styles.emptyIcon} />
                    <h3>No Matches Available</h3>
                    <p>Check back later for upcoming fixtures</p>
                </div>
            )}
        </div>
    );
}
