'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { Clock, MapPin, Users, Trophy, ArrowLeft, TrendingUp, Zap, Star, Activity } from 'lucide-react';
import { doc, getDoc, onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/providers/AuthProvider';
import { getUserLineupForMatch, getMatchLineups } from '@/services/lineups';
import styles from './page.module.css';

interface Match {
    id: string;
    fixtureId: number;
    homeTeam: { id: number; name: string; nameAr?: string; logo: string };
    awayTeam: { id: number; name: string; nameAr?: string; logo: string };
    homeScore: number | null;
    awayScore: number | null;
    date: Date;
    venue: string;
    status: 'upcoming' | 'live' | 'finished';
    elapsed?: number;
}

interface MatchEvent {
    id: string;
    minute: number;
    type: 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'substitution' | 'penalty_saved';
    playerName: string;
    team: 'home' | 'away';
}

interface Lineup {
    id: string;
    userId: string;
    displayName?: string;
    totalPoints: number;
    rank: number;
    entries: LineupEntry[];
    captainPlayerId: string;
    status: string;
    playerPoints?: Record<string, number>;
}

interface LineupEntry {
    playerId: string;
    playerName: string;
    playerNameAr?: string;
    position: string;
    teamId: number;
    teamName: string;
    isCaptain?: boolean;
}

export default function MatchDetailsPage() {
    const params = useParams();
    const matchId = params.matchId as string;
    const t = useTranslations('Matches');
    const { user } = useAuth();

    const [match, setMatch] = useState<Match | null>(null);
    const [matchEvents, setMatchEvents] = useState<MatchEvent[]>([]);
    const [leaderboard, setLeaderboard] = useState<Lineup[]>([]);
    const [userLineup, setUserLineup] = useState<Lineup | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch match data with real-time updates
    useEffect(() => {
        const matchRef = doc(db, 'matches', matchId);

        const unsubscribe = onSnapshot(matchRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                setMatch({
                    id: snapshot.id,
                    fixtureId: data.fixtureId,
                    homeTeam: data.homeTeam,
                    awayTeam: data.awayTeam,
                    homeScore: data.homeScore,
                    awayScore: data.awayScore,
                    date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
                    venue: data.venue || 'TBD',
                    status: data.status || 'upcoming',
                    elapsed: data.elapsed,
                });
            } else {
                setError('Match not found');
            }
            setLoading(false);
        }, (err) => {
            console.error('Error fetching match:', err);
            setError('Failed to load match');
            setLoading(false);
        });

        return () => unsubscribe();
    }, [matchId]);

    // Fetch match events in real-time
    useEffect(() => {
        const eventsRef = collection(db, 'matches', matchId, 'events');
        const eventsQuery = query(eventsRef, orderBy('minute', 'asc'));

        const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
            const events: MatchEvent[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as MatchEvent));
            setMatchEvents(events);
        });

        return () => unsubscribe();
    }, [matchId]);

    // Fetch user's lineup with real-time points
    useEffect(() => {
        if (!user?.uid) return;

        const lineupsRef = collection(db, 'lineups');
        const lineupQuery = query(
            lineupsRef,
            where('userId', '==', user.uid),
            where('matchId', '==', matchId),
            limit(1)
        );

        const unsubscribe = onSnapshot(lineupQuery, (snapshot) => {
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                setUserLineup({ id: doc.id, ...doc.data() } as Lineup);
            }
        });

        return () => unsubscribe();
    }, [matchId, user?.uid]);

    // Fetch leaderboard with real-time updates
    useEffect(() => {
        const lineupsRef = collection(db, 'lineups');
        const leaderboardQuery = query(
            lineupsRef,
            where('matchId', '==', matchId),
            orderBy('totalPoints', 'desc'),
            limit(20)
        );

        const unsubscribe = onSnapshot(leaderboardQuery, (snapshot) => {
            const lineups: Lineup[] = snapshot.docs.map((doc, index) => ({
                id: doc.id,
                rank: index + 1,
                ...doc.data()
            } as Lineup));
            setLeaderboard(lineups);
        });

        return () => unsubscribe();
    }, [matchId]);

    const getEventIcon = (type: MatchEvent['type']) => {
        switch (type) {
            case 'goal': return '⚽';
            case 'assist': return '🅰️';
            case 'yellow_card': return '🟨';
            case 'red_card': return '🟥';
            case 'substitution': return '🔄';
            case 'penalty_saved': return '🧤';
            default: return '📋';
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Loading match details...</p>
                </div>
            </div>
        );
    }

    if (error || !match) {
        return (
            <div className={styles.container}>
                <Link href="/matches" className={styles.backButton}>
                    <ArrowLeft size={20} />
                    Back to Matches
                </Link>
                <div className={styles.section}>
                    <p>{error || 'Match not found'}</p>
                </div>
            </div>
        );
    }

    const isLive = match.status === 'live';
    const isFinished = match.status === 'finished';

    return (
        <div className={styles.container}>
            {/* Back Button */}
            <Link href="/matches" className={styles.backButton}>
                <ArrowLeft size={20} />
                Back to Matches
            </Link>

            {/* Match Header */}
            <div className={`${styles.matchHeader} ${isLive ? styles.liveHeader : ''}`}>
                {isLive && (
                    <div className={styles.liveIndicator}>
                        <span className={styles.liveDot}></span>
                        LIVE {match.elapsed && `• ${match.elapsed}'`}
                    </div>
                )}

                <div className={styles.matchTeams}>
                    <div className={styles.team}>
                        <img src={match.homeTeam.logo} alt={match.homeTeam.name} className={styles.teamLogo} />
                        <h2 className={styles.teamName}>{match.homeTeam.name}</h2>
                        <div className={styles.score}>{match.homeScore ?? '-'}</div>
                    </div>

                    <div className={styles.vsSection}>
                        <div className={styles.status}>
                            {isLive ? `${match.elapsed}'` : isFinished ? 'FT' : 'VS'}
                        </div>
                        <div className={styles.vs}>VS</div>
                    </div>

                    <div className={styles.team}>
                        <div className={styles.score}>{match.awayScore ?? '-'}</div>
                        <h2 className={styles.teamName}>{match.awayTeam.name}</h2>
                        <img src={match.awayTeam.logo} alt={match.awayTeam.name} className={styles.teamLogo} />
                    </div>
                </div>

                <div className={styles.matchInfo}>
                    <div className={styles.infoItem}>
                        <Clock size={16} />
                        <span>{match.date.toLocaleString()}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <MapPin size={16} />
                        <span>{match.venue}</span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.actions}>
                {!isFinished && !isLive && (
                    <Link
                        href={`/lineup?match=${encodeURIComponent(`${match.homeTeam.name} vs ${match.awayTeam.name}`)}&fixtureId=${matchId}&homeTeamId=${match.homeTeam.id}&awayTeamId=${match.awayTeam.id}`}
                        className={styles.primaryButton}
                    >
                        <Trophy size={18} />
                        Build Your Lineup
                    </Link>
                )}
                <button className={styles.secondaryButton}>
                    <Users size={18} />
                    View All Lineups
                </button>
            </div>

            {/* User's Lineup Performance (Live Points) */}
            {userLineup && (
                <div className={styles.userPerformance}>
                    <h3>
                        {isLive && <Activity size={20} style={{ marginRight: '0.5rem', animation: 'pulse 1.5s infinite' }} />}
                        Your Performance {isLive && '(Live)'}
                    </h3>
                    <div className={styles.performanceGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>
                                <Trophy />
                            </div>
                            <div className={styles.statValue}>{userLineup.totalPoints || 0}</div>
                            <div className={styles.statLabel}>Total Points</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>
                                <TrendingUp />
                            </div>
                            <div className={styles.statValue}>#{userLineup.rank || '-'}</div>
                            <div className={styles.statLabel}>Your Rank</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>
                                <Star />
                            </div>
                            <div className={styles.statValue}>
                                {userLineup.playerPoints?.[userLineup.captainPlayerId]
                                    ? userLineup.playerPoints[userLineup.captainPlayerId] * 2
                                    : 0}
                            </div>
                            <div className={styles.statLabel}>Captain Points</div>
                        </div>
                    </div>

                    {/* Player-by-Player Points Breakdown */}
                    {(isLive || isFinished) && userLineup.entries && (
                        <div className={styles.lineupBreakdown}>
                            <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>Your Players</h4>
                            <div className={styles.playerPointsList}>
                                {userLineup.entries.map((entry) => {
                                    const points = userLineup.playerPoints?.[entry.playerId] || 0;
                                    const isCaptain = entry.playerId === userLineup.captainPlayerId;
                                    const displayPoints = isCaptain ? points * 2 : points;

                                    return (
                                        <div key={entry.playerId} className={styles.playerPointRow}>
                                            <div className={styles.playerPointInfo}>
                                                <span className={styles.playerPosition}>{entry.position}</span>
                                                <span className={styles.playerPointName}>
                                                    {entry.playerName}
                                                    {isCaptain && <span className={styles.captainBadge}>C</span>}
                                                </span>
                                            </div>
                                            <div className={`${styles.playerPointValue} ${points > 0 ? styles.positive : points < 0 ? styles.negative : ''}`}>
                                                {displayPoints > 0 ? '+' : ''}{displayPoints}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Live Points Leaderboard */}
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                    {isLive ? '🔴 Live Leaderboard' : isFinished ? '🏆 Final Standings' : '📊 Leaderboard'}
                </h3>

                <div className={styles.pointsTable}>
                    <div className={styles.tableHeader}>
                        <div>Rank</div>
                        <div>Player</div>
                        <div>Points</div>
                        <div>Change</div>
                    </div>

                    {leaderboard.length === 0 ? (
                        <div className={styles.noData}>
                            No lineups submitted yet
                        </div>
                    ) : (
                        leaderboard.map((lineup) => (
                            <div
                                key={lineup.id}
                                className={`${styles.tableRow} ${lineup.userId === user?.uid ? styles.currentUser : ''}`}
                            >
                                <div className={styles.rank}>
                                    {lineup.rank === 1 && '🥇'}
                                    {lineup.rank === 2 && '🥈'}
                                    {lineup.rank === 3 && '🥉'}
                                    {lineup.rank > 3 && lineup.rank}
                                </div>
                                <div className={styles.playerInfo}>
                                    <div className={styles.avatar}>
                                        {(lineup.displayName || 'U')[0].toUpperCase()}
                                    </div>
                                    <span>
                                        {lineup.displayName || 'Anonymous'}
                                        {lineup.userId === user?.uid && ' (You)'}
                                    </span>
                                </div>
                                <div className={styles.points}>{lineup.totalPoints}</div>
                                <div className={styles.change}>
                                    <span className={styles.up}>↑ {Math.floor(Math.random() * 5)}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <Link href="/leaderboard" className={styles.viewAllButton}>
                    View Full Leaderboard
                </Link>
            </div>

            {/* Match Events (Live or Finished) */}
            {(isLive || isFinished) && (
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                        {isLive ? '⚡ Live Events' : '📋 Match Events'}
                    </h3>
                    <div className={styles.events}>
                        {matchEvents.length === 0 ? (
                            <div className={styles.noData}>
                                {isLive ? 'No events yet' : 'No events recorded'}
                            </div>
                        ) : (
                            matchEvents.map((event) => (
                                <div
                                    key={event.id}
                                    className={`${styles.event} ${event.type === 'goal' ? styles.goalEvent : ''}`}
                                >
                                    <div className={styles.eventTime}>{event.minute}'</div>
                                    <div className={styles.eventIcon}>{getEventIcon(event.type)}</div>
                                    <div className={styles.eventText}>
                                        <strong>{event.playerName}</strong>
                                        {event.type === 'goal' && ' scored'}
                                        {event.type === 'assist' && ' assist'}
                                        {event.type === 'yellow_card' && ' yellow card'}
                                        {event.type === 'red_card' && ' red card'}
                                        {event.type === 'substitution' && ' substituted'}
                                        {event.type === 'penalty_saved' && ' penalty saved'}
                                        {' for '}
                                        {event.team === 'home' ? match.homeTeam.name : match.awayTeam.name}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
