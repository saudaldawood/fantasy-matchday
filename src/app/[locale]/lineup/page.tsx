'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { useRouter, useSearchParams } from 'next/navigation';
import { getDraftPlayers, type DraftPlayer } from '@/services/players';
import { getFixtures } from '@/services/api-football';
import { useAuth } from '@/hooks/useAuth';
import {
    validateLineup,
    getFormationName,
    isLineupComplete,
    MAX_PLAYERS,
    type ValidationError
} from '@/utils/lineup-validation';
import {
    saveLineupDraft,
    submitLineup,
    getUserLineupForMatch,
    getUserLineups
} from '@/services/lineups';
import type { Lineup, LineupEntry, PlayerPosition } from '@/types/app';
import { AlertCircle, CheckCircle, Save, Send, Loader2, Shield, Coins, Zap, Trophy, Calendar } from 'lucide-react';
import { POWER_UPS, getUserCredits, purchasePowerUp, type PowerUp } from '@/services/credits';

export default function LineupPage() {
    const t = useTranslations('Lineup');
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();

    // Get match info from URL
    const matchParam = searchParams.get('match');
    const fixtureId = searchParams.get('fixtureId');
    const homeTeamIdParam = searchParams.get('homeTeamId');
    const awayTeamIdParam = searchParams.get('awayTeamId');

    // State
    const [availablePlayers, setAvailablePlayers] = useState<DraftPlayer[]>([]);
    const [selectedPlayers, setSelectedPlayers] = useState<LineupEntry[]>([]);
    const [captainId, setCaptainId] = useState<string | null>(null);
    const [isLoadingPlayers, setIsLoadingPlayers] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<ValidationError[]>([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [draftId, setDraftId] = useState<string | null>(null);
    const [upcomingMatches, setUpcomingMatches] = useState<any[]>([]);
    const [isLoadingMatches, setIsLoadingMatches] = useState(false);
    const [userCredits, setUserCredits] = useState(0);
    const [activePowerUp, setActivePowerUp] = useState<string | null>(null);
    const [submittedLineup, setSubmittedLineup] = useState<Lineup | null>(null);
    const [myMatches, setMyMatches] = useState<Lineup[]>([]);
    const [isLoadingMyMatches, setIsLoadingMyMatches] = useState(false);
    const [matchDisplayName, setMatchDisplayName] = useState<string>('');

    // Fetch players and existing lineup
    useEffect(() => {
        async function fetchData() {
            if (!fixtureId) {
                // If no match selected, fetch upcoming matches
                setIsLoadingMatches(true);
                try {
                    const matches = await import('@/services/api-football').then(m => m.getUpcomingMatches());
                    setUpcomingMatches(matches);
                } catch (error) {
                    console.error('Error fetching upcoming matches:', error);
                } finally {
                    setIsLoadingMatches(false);
                }
                return;
            }

            try {
                setIsLoadingPlayers(true);

                let homeTeamId = homeTeamIdParam ? parseInt(homeTeamIdParam) : undefined;
                let awayTeamId = awayTeamIdParam ? parseInt(awayTeamIdParam) : undefined;

                // If team IDs not in URL, fetch fixture to get them
                if (!homeTeamId || !awayTeamId) {
                    console.log('Fetching fixture to get team IDs...');
                    const fixtures = await getFixtures({ fixtureId: parseInt(fixtureId) });
                    if (fixtures && fixtures.length > 0) {
                        homeTeamId = fixtures[0].teams.home.id;
                        awayTeamId = fixtures[0].teams.away.id;
                        setMatchDisplayName(`${fixtures[0].teams.home.name} vs ${fixtures[0].teams.away.name}`);
                        console.log(`Got team IDs: Home=${homeTeamId}, Away=${awayTeamId}`);
                    }
                } else if (matchParam) {
                    setMatchDisplayName(matchParam);
                }

                console.log(`Fetching players for fixture ${fixtureId} with teams: Home=${homeTeamId}, Away=${awayTeamId}`);
                const players = await getDraftPlayers(parseInt(fixtureId), homeTeamId, awayTeamId);
                
                // Validate we got players
                if (!players || players.length === 0) {
                    setErrors([{ 
                        field: 'general', 
                        message: 'Player data not available for this match yet. Please try again closer to match time or select a live/completed match.' 
                    }]);
                    setIsLoadingPlayers(false);
                    return;
                }
                
                setAvailablePlayers(players);

                // Load existing lineup if user is logged in
                if (user && fixtureId) {
                    const existing = await getUserLineupForMatch(user.uid, fixtureId);
                    if (existing) {
                        if (existing.status === 'draft') {
                            setSelectedPlayers(existing.entries);
                            setCaptainId(existing.captainPlayerId);
                            setDraftId(existing.id);
                        } else {
                            // Lineup already submitted
                            setSubmittedLineup(existing);
                            setSelectedPlayers(existing.entries);
                            setCaptainId(existing.captainPlayerId);
                        }
                    }
                }
            } catch (error: any) {
                console.error('Error loading data:', error);
                setErrors([{ 
                    field: 'general', 
                    message: error.message || 'Unable to load player data for this match. Please try a different match.' 
                }]);
            } finally {
                setIsLoadingPlayers(false);
            }
        }

        fetchData();
    }, [fixtureId, homeTeamIdParam, awayTeamIdParam, user, router]);

    // Fetch user credits
    useEffect(() => {
        async function fetchCredits() {
            if (!user) return;
            try {
                const credits = await getUserCredits(user.uid);
                setUserCredits(credits);
            } catch (error) {
                console.error('Error fetching credits:', error);
            }
        }
        fetchCredits();
    }, [user]);

    // Toggle player selection (max 3 players, no bench)
    const togglePlayer = (player: DraftPlayer, position: PlayerPosition) => {
        const isSelected = selectedPlayers.some(p => p.playerId === player.id);

        if (isSelected) {
            // Remove player
            setSelectedPlayers(prev => prev.filter(p => p.playerId !== player.id));
            if (captainId === player.id) {
                setCaptainId(null);
            }
        } else {
            // Check max players limit
            if (selectedPlayers.length >= MAX_PLAYERS) {
                setErrors([{ field: 'players', message: `You can only select ${MAX_PLAYERS} players. Remove one first.` }]);
                return;
            }
            // Add player (no bench in 3-player mode)
            const newEntry: LineupEntry = {
                playerId: player.id,
                playerName: player.name,
                position,
                isBench: false,
                isCaptain: false,
                multiplier: 1,
                pointsEarned: 0,
            };
            setSelectedPlayers(prev => [...prev, newEntry]);
        }
        setErrors([]);
    };

    // Toggle captain
    const toggleCaptain = (playerId: string) => {
        if (captainId === playerId) {
            setCaptainId(null);
            setSelectedPlayers(prev =>
                prev.map(p => ({ ...p, isCaptain: false }))
            );
        } else {
            setCaptainId(playerId);
            setSelectedPlayers(prev =>
                prev.map(p => ({ ...p, isCaptain: p.playerId === playerId }))
            );
        }
    };

    // Save draft
    const handleSave = async () => {
        if (!user || !fixtureId) return;

        setIsSaving(true);
        setErrors([]);
        setSuccessMessage('');

        try {
            const lineupId = await saveLineupDraft(
                user.uid,
                fixtureId,
                selectedPlayers,
                formation || '4-3-3',
                captainId
            );

            setDraftId(lineupId);
            setSuccessMessage('Draft saved successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error: any) {
            console.error('Error saving draft:', error);
            setErrors([{ field: 'general', message: error.message || 'Failed to save draft' }]);
        } finally {
            setIsSaving(false);
        }
    };

    // Submit lineup
    const handleSubmit = async () => {
        if (!user || !fixtureId) return;

        setIsSubmitting(true);
        setErrors([]);
        setSuccessMessage('');

        // Validate lineup
        const validation = validateLineup(selectedPlayers, availablePlayers);
        if (!validation.isValid) {
            setErrors(validation.errors);
            setIsSubmitting(false);
            return;
        }

        try {
            // First save/update the lineup
            const lineupId = await saveLineupDraft(
                user.uid,
                fixtureId,
                selectedPlayers,
                formation || '4-3-3',
                captainId
            );

            // Then submit it
            await submitLineup(lineupId);

            setSuccessMessage('Lineup submitted successfully!');
            setTimeout(() => {
                router.push('/leaderboard');
            }, 2000);
        } catch (error: any) {
            console.error('Error submitting lineup:', error);
            setErrors([{ field: 'general', message: error.message || 'Failed to submit lineup' }]);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Fetch my submitted matches
    useEffect(() => {
        async function fetchMyMatches() {
            if (!user || fixtureId) return;
            setIsLoadingMyMatches(true);
            try {
                const lineups = await getUserLineups(user.uid);
                setMyMatches(lineups);
            } catch (error) {
                console.error('Error fetching my matches:', error);
            } finally {
                setIsLoadingMyMatches(false);
            }
        }
        fetchMyMatches();
    }, [user, fixtureId]);

    // No match selected
    if (!fixtureId) {
        return (
            <div className={styles.pageWrapper}>
                <div className={styles.container}>
                    {/* My Matches Section */}
                    {user && myMatches.length > 0 && (
                        <div className={styles.myMatchesSection}>
                            <h2 className={styles.myMatchesTitle}>
                                <Trophy size={24} />
                                My Matches
                            </h2>
                            <div className={styles.myMatchesGrid}>
                                {myMatches.map((lineup) => {
                                    const statusLabel = lineup.status === 'draft' ? '📝 Draft' : lineup.status === 'submitted' ? '✅ Submitted' : lineup.status === 'locked' ? '🔒 Locked' : '✅ Completed';
                                    // Try to find match info from upcomingMatches
                                    const matchInfo = upcomingMatches.find((m: any) => String(m.fixture.id) === String(lineup.matchId));
                                    const matchName = matchInfo
                                        ? `${matchInfo.teams.home.name} vs ${matchInfo.teams.away.name}`
                                        : `Match #${lineup.matchId}`;
                                    return (
                                        <div key={lineup.id} className={styles.myMatchCard}>
                                            <div className={styles.myMatchHeader}>
                                                <span className={`${styles.myMatchStatus} ${styles[`status_${lineup.status}`]}`}>
                                                    {statusLabel}
                                                </span>
                                                <span className={styles.myMatchPoints}>{lineup.totalPoints || 0} pts</span>
                                            </div>
                                            <div className={styles.myMatchInfo}>
                                                <Calendar size={14} />
                                                <span>{matchName}</span>
                                            </div>
                                            <div className={styles.myMatchPlayers}>
                                                {lineup.entries.map((entry, i) => (
                                                    <span key={i} className={styles.myMatchPlayer}>
                                                        {entry.isCaptain && '©️ '}{entry.playerName} ({entry.position})
                                                    </span>
                                                ))}
                                            </div>
                                            <Link
                                                href={`/lineup?fixtureId=${lineup.matchId}`}
                                                className={styles.myMatchViewBtn}
                                            >
                                                {lineup.status === 'draft' ? 'Edit Lineup' : 'View Lineup'}
                                            </Link>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className={styles.header}>
                        <div>
                            <h1>{t('title')}</h1>
                            <p className={styles.matchInfo}>Select a match to build your lineup</p>
                        </div>
                    </div>

                    {isLoadingMatches ? (
                        <div className={styles.loading}>
                            <Loader2 size={40} className={styles.spinner} />
                            <p>Loading upcoming matches...</p>
                        </div>
                    ) : (
                        <div className={styles.matchSelectionGrid}>
                            {upcomingMatches.length > 0 ? (
                                upcomingMatches.map((match) => (
                                    <Link
                                        key={match.fixture.id}
                                        href={`/lineup?match=${encodeURIComponent(`${match.teams.home.name} vs ${match.teams.away.name}`)}&fixtureId=${match.fixture.id}&homeTeamId=${match.teams.home.id}&awayTeamId=${match.teams.away.id}`}
                                        className={styles.matchSelectionCard}
                                    >
                                        <div className={styles.matchSelectionDate}>
                                            {new Date(match.fixture.date).toLocaleDateString()} • {new Date(match.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className={styles.matchSelectionTeams}>
                                            <div className={styles.matchSelectionTeam}>
                                                <img src={match.teams.home.logo} alt={match.teams.home.name} />
                                                <span>{match.teams.home.name}</span>
                                            </div>
                                            <div className={styles.matchSelectionVs}>VS</div>
                                            <div className={styles.matchSelectionTeam}>
                                                <img src={match.teams.away.logo} alt={match.teams.away.name} />
                                                <span>{match.teams.away.name}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className={styles.errorState}>
                                    <AlertCircle size={48} />
                                    <h2>No Upcoming Matches</h2>
                                    <p>Check back later for new fixtures.</p>
                                    <Link href="/" className={styles.homeLink}>
                                        Back to Home
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const formation = getFormationName(selectedPlayers);
    const isComplete = isLineupComplete(selectedPlayers);
    const isSubmitted = submittedLineup !== null;

    // Show submitted lineup confirmation
    if (isSubmitted) {
        return (
            <div className={styles.pageWrapper}>
                <div className={styles.container}>
                    <div className={styles.submittedBanner}>
                        <CheckCircle size={48} className={styles.submittedIcon} />
                        <h2>Lineup Submitted!</h2>
                        <p className={styles.submittedMatch}>{matchDisplayName || matchParam || `Match #${fixtureId}`}</p>
                        <p className={styles.submittedStatus}>
                            Status: <strong>{submittedLineup.status === 'submitted' ? 'Awaiting Match' : submittedLineup.status === 'locked' ? 'Locked In' : 'Completed'}</strong>
                        </p>
                    </div>

                    <div className={styles.submittedLineupCard}>
                        <h3>Your {MAX_PLAYERS} Picks</h3>
                        <div className={styles.submittedPlayers}>
                            {selectedPlayers.map(entry => {
                                const player = availablePlayers.find(p => p.id === entry.playerId);
                                return (
                                    <div key={entry.playerId} className={styles.submittedPlayerRow}>
                                        {entry.isCaptain && <span className={styles.captainBadgeInline}>C</span>}
                                        {player?.photo && (
                                            <img src={player.photo} alt={entry.playerName} className={styles.playerPhotoSmall} />
                                        )}
                                        <span className={styles.submittedPlayerName}>{entry.playerName}</span>
                                        <span className={styles.submittedPlayerPos}>{entry.position}</span>
                                        {player && <span className={styles.submittedPlayerTeam}>{player.teamName}</span>}
                                    </div>
                                );
                            })}
                        </div>
                        {submittedLineup.totalPoints > 0 && (
                            <div className={styles.submittedPoints}>
                                <Trophy size={20} />
                                <span>{submittedLineup.totalPoints} Points</span>
                            </div>
                        )}
                    </div>

                    <div className={styles.submittedActions}>
                        <Link href="/lineup" className={styles.backToMatchesBtn}>
                            ← Back to Matches
                        </Link>
                        <Link href="/leaderboard" className={styles.viewLeaderboardBtn}>
                            <Trophy size={16} /> View Leaderboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h1>{t('title')}</h1>
                        <p className={styles.matchInfo}>{matchParam}</p>
                        {formation && <p className={styles.formation}>Formation: {formation}</p>}
                    </div>
                    <div className={styles.headerActions}>
                        <button
                            onClick={handleSave}
                            className={styles.saveBtn}
                            disabled={isSaving || selectedPlayers.length === 0}
                        >
                            {isSaving ? <Loader2 size={18} className={styles.spinner} /> : <Save size={18} />}
                            Save Draft
                        </button>
                        <button
                            onClick={handleSubmit}
                            className={styles.submitBtn}
                            disabled={isSubmitting || !isComplete}
                        >
                            {isSubmitting ? <Loader2 size={18} className={styles.spinner} /> : <Send size={18} />}
                            Submit Lineup
                        </button>
                    </div>
                </div>

                {/* Success/Error Messages */}
                {successMessage && (
                    <div className={styles.successAlert}>
                        <CheckCircle size={18} />
                        <span>{successMessage}</span>
                    </div>
                )}

                {errors.length > 0 && (
                    <div className={styles.errorAlert}>
                        <AlertCircle size={18} />
                        <div>
                            {errors.map((error, i) => (
                                <p key={i}>{error.message}</p>
                            ))}
                        </div>
                    </div>
                )}

                {/* Progress Indicator */}
                <div className={styles.progress}>
                    <div className={styles.progressText}>
                        Players: {selectedPlayers.length}/{MAX_PLAYERS} | Captain: {captainId ? '✓' : '✗'}
                        {userCredits > 0 && <span style={{marginLeft: '1rem'}}>💰 {userCredits} Credits</span>}
                    </div>
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${(selectedPlayers.length / MAX_PLAYERS) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Power-Ups Section */}
                {user && (
                    <div className={styles.powerupsBar}>
                        <span className={styles.powerupsLabel}><Zap size={16} /> Power-Ups:</span>
                        {POWER_UPS.filter(p => p.id === 'captain_boost' || p.id === 'triple_captain').map(powerup => {
                            const canAfford = userCredits >= powerup.cost;
                            const isActive = activePowerUp === powerup.id;
                            return (
                                <button
                                    key={powerup.id}
                                    className={`${styles.powerupBtn} ${isActive ? styles.activePowerup : ''} ${!canAfford ? styles.disabledPowerup : ''}`}
                                    onClick={() => {
                                        if (!canAfford) return;
                                        setActivePowerUp(isActive ? null : powerup.id);
                                    }}
                                    disabled={!canAfford}
                                    title={canAfford ? powerup.description : `Need ${powerup.cost} credits`}
                                >
                                    {powerup.icon} {powerup.name} ({powerup.cost} 💰)
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Main Content */}
                <div className={styles.content}>
                    {/* Available Players */}
                    <div className={styles.playersPanel}>
                        <h2>Pick {MAX_PLAYERS} Players</h2>

                        {['GK', 'DEF', 'MID', 'FWD'].map(position => {
                            const posPlayers = availablePlayers.filter(p => p.position === position);
                            if (posPlayers.length === 0) return null;
                            return (
                                <div key={position} className={styles.positionGroup}>
                                    <h3>{position}</h3>
                                    <div className={styles.playerGrid}>
                                        {posPlayers.map(player => {
                                            const isSelected = selectedPlayers.some(p => p.playerId === player.id);
                                            const isCaptain = captainId === player.id;
                                            const isFull = selectedPlayers.length >= MAX_PLAYERS;

                                            return (
                                                <div
                                                    key={player.id}
                                                    className={`${styles.playerCard} ${isSelected ? styles.selected : ''}`}
                                                >
                                                    {player.photo && (
                                                        <img src={player.photo} alt={player.name} className={styles.playerPhoto} />
                                                    )}
                                                    <div className={styles.playerInfo}>
                                                        <div className={styles.playerName}>{player.name}</div>
                                                        <div className={styles.playerTeam}>{player.teamName}</div>
                                                        <div className={styles.playerStats}>
                                                            {player.position} • #{player.jerseyNumber}
                                                        </div>
                                                    </div>
                                                    <div className={styles.playerActions}>
                                                        {!isSelected && !isFull && (
                                                            <button
                                                                onClick={() => togglePlayer(player, player.position as PlayerPosition)}
                                                                className={styles.addBtn}
                                                            >
                                                                Pick
                                                            </button>
                                                        )}
                                                        {isSelected && (
                                                            <>
                                                                <button
                                                                    onClick={() => togglePlayer(player, player.position as PlayerPosition)}
                                                                    className={styles.removeBtn}
                                                                >
                                                                    Remove
                                                                </button>
                                                                <button
                                                                    onClick={() => toggleCaptain(player.id)}
                                                                    className={`${styles.captainBtn} ${isCaptain ? styles.active : ''}`}
                                                                >
                                                                    <Shield size={14} />
                                                                    {isCaptain ? 'C' : 'Captain'}
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Selected Lineup */}
                    <div className={styles.lineupPanel}>
                        <h2>Your {MAX_PLAYERS} Picks</h2>

                        <div className={styles.lineupSection}>
                            <h3>Selected Players ({selectedPlayers.length}/{MAX_PLAYERS})</h3>
                            {selectedPlayers.length === 0 ? (
                                <p className={styles.emptyState}>Pick {MAX_PLAYERS} players from any position</p>
                            ) : (
                                <div className={styles.selectedGrid}>
                                    {selectedPlayers.map(entry => {
                                        const player = availablePlayers.find(p => p.id === entry.playerId);
                                        if (!player) return null;

                                        return (
                                            <div key={entry.playerId} className={styles.selectedCard}>
                                                {entry.isCaptain && <div className={styles.captainBadge}>C</div>}
                                                {player.photo && (
                                                    <img src={player.photo} alt={player.name} className={styles.playerPhoto} />
                                                )}
                                                <div className={styles.playerInfo}>
                                                    <div className={styles.playerName}>{player.name}</div>
                                                    <div className={styles.playerStats}>{entry.position} • {player.teamName}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {activePowerUp && (
                            <div className={styles.activePowerupInfo}>
                                <Zap size={16} />
                                <span>Active: {POWER_UPS.find(p => p.id === activePowerUp)?.name}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
