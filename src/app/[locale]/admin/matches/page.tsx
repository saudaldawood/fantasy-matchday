'use client';

import { useEffect, useState } from 'react';
import { getMatches, updateMatch, AdminMatch } from '@/services/admin';
import styles from './page.module.css';

export default function AdminMatchesPage() {
    const [matches, setMatches] = useState<AdminMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'live' | 'finished' | 'postponed'>('all');
    const [selectedMatch, setSelectedMatch] = useState<AdminMatch | null>(null);
    const [editData, setEditData] = useState({ homeScore: 0, awayScore: 0, reason: '' });
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchMatches();
    }, [statusFilter]);

    async function fetchMatches() {
        setLoading(true);
        try {
            const filter = statusFilter === 'all' ? undefined : statusFilter;
            const data = await getMatches(50, filter);
            setMatches(data);
        } catch (err) {
            console.error('Error fetching matches:', err);
            setError('Failed to load matches');
        } finally {
            setLoading(false);
        }
    }

    async function handleUpdateMatch() {
        if (!selectedMatch || !editData.reason) {
            alert('Please provide a reason for the update');
            return;
        }

        setActionLoading(true);
        try {
            const result = await updateMatch(
                selectedMatch.id,
                {
                    homeScore: editData.homeScore,
                    awayScore: editData.awayScore,
                },
                'current-admin-id', // In real app, get from auth context
                editData.reason
            );

            if (result.success) {
                setMatches(matches.map(m =>
                    m.id === selectedMatch.id
                        ? { ...m, homeScore: editData.homeScore, awayScore: editData.awayScore }
                        : m
                ));
                setSelectedMatch(null);
                setEditData({ homeScore: 0, awayScore: 0, reason: '' });
            } else {
                alert(result.error || 'Failed to update match');
            }
        } catch (err) {
            console.error('Error updating match:', err);
            alert('Failed to update match');
        } finally {
            setActionLoading(false);
        }
    }

    function openEditModal(match: AdminMatch) {
        setSelectedMatch(match);
        setEditData({
            homeScore: match.homeScore || 0,
            awayScore: match.awayScore || 0,
            reason: '',
        });
    }

    function formatDate(timestamp: unknown): string {
        if (!timestamp) return 'N/A';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const date = (timestamp as any).toDate ? (timestamp as any).toDate() : new Date(timestamp as string);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    function getStatusColor(status: string): string {
        switch (status) {
            case 'live': return styles.live;
            case 'finished': return styles.finished;
            case 'postponed': return styles.postponed;
            default: return styles.upcoming;
        }
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Match Management</h1>
                <p className={styles.subtitle}>View and manage all matches</p>
            </header>

            <div className={styles.controls}>
                <div className={styles.filters}>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                        className={styles.filterSelect}
                    >
                        <option value="all">All Matches</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="live">Live</option>
                        <option value="finished">Finished</option>
                        <option value="postponed">Postponed</option>
                    </select>
                </div>
                <button onClick={fetchMatches} className={styles.refreshButton}>
                    🔄 Refresh
                </button>
            </div>

            {loading ? (
                <div className={styles.loading}>Loading matches...</div>
            ) : error ? (
                <div className={styles.error}>{error}</div>
            ) : (
                <div className={styles.matchesGrid}>
                    {matches.map((match) => (
                        <div key={match.id} className={styles.matchCard}>
                            <div className={styles.matchHeader}>
                                <span className={`${styles.statusBadge} ${getStatusColor(match.status)}`}>
                                    {match.status === 'live' && '🔴 '}{match.status}
                                </span>
                                <span className={styles.matchDate}>{formatDate(match.matchDate)}</span>
                            </div>

                            <div className={styles.matchTeams}>
                                <div className={styles.team}>
                                    <img src={match.homeTeam.logo} alt={match.homeTeam.name} className={styles.teamLogo} />
                                    <span className={styles.teamName}>{match.homeTeam.name}</span>
                                </div>

                                <div className={styles.score}>
                                    <span>{match.homeScore ?? '-'}</span>
                                    <span className={styles.scoreDivider}>:</span>
                                    <span>{match.awayScore ?? '-'}</span>
                                </div>

                                <div className={styles.team}>
                                    <img src={match.awayTeam.logo} alt={match.awayTeam.name} className={styles.teamLogo} />
                                    <span className={styles.teamName}>{match.awayTeam.name}</span>
                                </div>
                            </div>

                            <div className={styles.matchFooter}>
                                <span className={styles.participantCount}>
                                    👥 {match.participantCount || 0} participants
                                </span>
                                <button
                                    onClick={() => openEditModal(match)}
                                    className={styles.editButton}
                                >
                                    Edit Score
                                </button>
                            </div>
                        </div>
                    ))}

                    {matches.length === 0 && (
                        <div className={styles.emptyState}>
                            No matches found.
                        </div>
                    )}
                </div>
            )}

            {/* Edit Match Modal */}
            {selectedMatch && (
                <div className={styles.modalOverlay} onClick={() => setSelectedMatch(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2>Edit Match Score</h2>
                        <p className={styles.matchInfo}>
                            {selectedMatch.homeTeam.name} vs {selectedMatch.awayTeam.name}
                        </p>

                        <div className={styles.scoreInputs}>
                            <div className={styles.scoreInput}>
                                <label>{selectedMatch.homeTeam.name}</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={editData.homeScore}
                                    onChange={(e) => setEditData({ ...editData, homeScore: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <span className={styles.vs}>-</span>
                            <div className={styles.scoreInput}>
                                <label>{selectedMatch.awayTeam.name}</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={editData.awayScore}
                                    onChange={(e) => setEditData({ ...editData, awayScore: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>

                        <div className={styles.reasonInput}>
                            <label>Reason for update *</label>
                            <textarea
                                placeholder="Explain why you're making this change..."
                                value={editData.reason}
                                onChange={(e) => setEditData({ ...editData, reason: e.target.value })}
                            />
                        </div>

                        <div className={styles.modalActions}>
                            <button
                                onClick={handleUpdateMatch}
                                className={styles.saveButton}
                                disabled={actionLoading || !editData.reason}
                            >
                                {actionLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                onClick={() => setSelectedMatch(null)}
                                className={styles.cancelButton}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
