'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useLocale } from 'next-intl';
import type { DraftPlayer } from '@/services/players';
import type { LineupEntry, PlayerPosition } from '@/types/app';
import styles from './DraggableLineup.module.css';
import { GripVertical, Star, X, User } from 'lucide-react';

interface DraggableLineupProps {
    players: DraftPlayer[];
    selectedPlayers: LineupEntry[];
    captainId: string | null;
    formation: string;
    onPlayerAdd: (player: DraftPlayer, position: PlayerPosition, isBench: boolean) => void;
    onPlayerRemove: (playerId: string) => void;
    onCaptainSelect: (playerId: string) => void;
    onFormationChange?: (formation: string) => void;
}

const FORMATIONS = ['4-4-2', '4-3-3', '3-5-2', '5-3-2', '4-5-1'];

const FORMATION_SLOTS: Record<string, { position: PlayerPosition; count: number }[]> = {
    '4-4-2': [
        { position: 'GK', count: 1 },
        { position: 'DEF', count: 4 },
        { position: 'MID', count: 4 },
        { position: 'FWD', count: 2 },
    ],
    '4-3-3': [
        { position: 'GK', count: 1 },
        { position: 'DEF', count: 4 },
        { position: 'MID', count: 3 },
        { position: 'FWD', count: 3 },
    ],
    '3-5-2': [
        { position: 'GK', count: 1 },
        { position: 'DEF', count: 3 },
        { position: 'MID', count: 5 },
        { position: 'FWD', count: 2 },
    ],
    '5-3-2': [
        { position: 'GK', count: 1 },
        { position: 'DEF', count: 5 },
        { position: 'MID', count: 3 },
        { position: 'FWD', count: 2 },
    ],
    '4-5-1': [
        { position: 'GK', count: 1 },
        { position: 'DEF', count: 4 },
        { position: 'MID', count: 5 },
        { position: 'FWD', count: 1 },
    ],
};

export default function DraggableLineup({
    players,
    selectedPlayers,
    captainId,
    formation,
    onPlayerAdd,
    onPlayerRemove,
    onCaptainSelect,
    onFormationChange,
}: DraggableLineupProps) {
    const locale = useLocale();
    const isArabic = locale === 'ar';

    const [draggedPlayer, setDraggedPlayer] = useState<DraftPlayer | null>(null);
    const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);
    const [filterPosition, setFilterPosition] = useState<PlayerPosition | 'all'>('all');
    const dragCounter = useRef(0);

    const formationSlots = FORMATION_SLOTS[formation] || FORMATION_SLOTS['4-4-2'];

    // Get players by position from selection
    const getPlayersInPosition = (position: PlayerPosition): LineupEntry[] => {
        return selectedPlayers.filter(p => p.position === position && !p.isBench);
    };

    const getBenchPlayers = (): LineupEntry[] => {
        return selectedPlayers.filter(p => p.isBench);
    };

    // Get available players (not yet selected)
    const availablePlayers = players.filter(
        p => !selectedPlayers.some(s => s.playerId === p.id)
    );

    const filteredAvailablePlayers = filterPosition === 'all'
        ? availablePlayers
        : availablePlayers.filter(p => p.position === filterPosition);

    // Drag handlers
    const handleDragStart = (e: React.DragEvent, player: DraftPlayer) => {
        setDraggedPlayer(player);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', player.id);
    };

    const handleDragEnd = () => {
        setDraggedPlayer(null);
        setDragOverSlot(null);
        dragCounter.current = 0;
    };

    const handleDragEnter = (slotId: string) => {
        dragCounter.current++;
        setDragOverSlot(slotId);
    };

    const handleDragLeave = () => {
        dragCounter.current--;
        if (dragCounter.current === 0) {
            setDragOverSlot(null);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, position: PlayerPosition, isBench: boolean = false) => {
        e.preventDefault();

        if (draggedPlayer && draggedPlayer.position === position) {
            onPlayerAdd(draggedPlayer, position, isBench);
        }

        setDraggedPlayer(null);
        setDragOverSlot(null);
        dragCounter.current = 0;
    };

    const handleBenchDrop = (e: React.DragEvent) => {
        e.preventDefault();

        if (draggedPlayer) {
            onPlayerAdd(draggedPlayer, draggedPlayer.position, true);
        }

        setDraggedPlayer(null);
        setDragOverSlot(null);
        dragCounter.current = 0;
    };

    const getSlotCount = (position: PlayerPosition): number => {
        const slot = formationSlots.find(s => s.position === position);
        return slot?.count || 0;
    };

    const getSelectedPlayer = (playerId: string): DraftPlayer | undefined => {
        return players.find(p => p.id === playerId);
    };

    return (
        <div className={styles.container}>
            {/* Formation Selector */}
            <div className={styles.formationSelector}>
                <span className={styles.formationLabel}>
                    {isArabic ? 'التشكيلة:' : 'Formation:'}
                </span>
                {FORMATIONS.map(f => (
                    <button
                        key={f}
                        className={`${styles.formationBtn} ${formation === f ? styles.active : ''}`}
                        onClick={() => onFormationChange?.(f)}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <div className={styles.lineupContainer}>
                {/* Pitch - Left Side */}
                <div className={styles.pitch}>
                    <div className={styles.pitchBg}>
                        {/* Formation Rows */}
                        {formationSlots.map((slot, rowIndex) => {
                            const playersInSlot = getPlayersInPosition(slot.position);
                            const emptySlots = slot.count - playersInSlot.length;

                            return (
                                <div key={slot.position} className={styles.row}>
                                    {/* Filled Slots */}
                                    {playersInSlot.map(entry => {
                                        const player = getSelectedPlayer(entry.playerId);
                                        return (
                                            <div
                                                key={entry.playerId}
                                                className={`${styles.playerSlot} ${styles.filled} ${captainId === entry.playerId ? styles.captain : ''}`}
                                                onClick={() => onCaptainSelect(entry.playerId)}
                                            >
                                                <button
                                                    className={styles.removeBtn}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onPlayerRemove(entry.playerId);
                                                    }}
                                                >
                                                    <X size={12} />
                                                </button>
                                                {player?.photo ? (
                                                    <img src={player.photo} alt={player.name} className={styles.playerImg} />
                                                ) : (
                                                    <User size={24} />
                                                )}
                                                <span className={styles.playerName}>
                                                    {entry.playerName?.split(' ').pop() || '#' + entry.jerseyNumber}
                                                </span>
                                                {captainId === entry.playerId && (
                                                    <span className={styles.captainBadge}>C</span>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {/* Empty Slots */}
                                    {Array.from({ length: emptySlots }).map((_, i) => (
                                        <div
                                            key={`empty-${slot.position}-${i}`}
                                            className={`${styles.playerSlot} ${styles.empty} ${dragOverSlot === `${slot.position}-${i}` ? styles.dragOver : ''}`}
                                            onDragEnter={() => handleDragEnter(`${slot.position}-${i}`)}
                                            onDragLeave={handleDragLeave}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, slot.position)}
                                        >
                                            <span className={styles.slotLabel}>{slot.position}</span>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>

                    {/* Bench */}
                    <div
                        className={`${styles.bench} ${dragOverSlot === 'bench' ? styles.dragOver : ''}`}
                        onDragEnter={() => handleDragEnter('bench')}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleBenchDrop}
                    >
                        <h4>{isArabic ? 'البدلاء' : 'Bench'}</h4>
                        <div className={styles.benchSlots}>
                            {getBenchPlayers().map(entry => {
                                const player = getSelectedPlayer(entry.playerId);
                                return (
                                    <div key={entry.playerId} className={styles.benchPlayer}>
                                        <button
                                            className={styles.removeBtn}
                                            onClick={() => onPlayerRemove(entry.playerId)}
                                        >
                                            <X size={10} />
                                        </button>
                                        <span className={styles.benchPos}>{entry.position}</span>
                                        <span className={styles.benchName}>{entry.playerName?.split(' ').pop()}</span>
                                    </div>
                                );
                            })}
                            {getBenchPlayers().length < 4 && (
                                <div className={`${styles.benchPlayer} ${styles.emptyBench}`}>
                                    +{4 - getBenchPlayers().length}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Player List - Right Side */}
                <div className={styles.playerList}>
                    <div className={styles.listHeader}>
                        <h3>{isArabic ? 'اللاعبون المتاحون' : 'Available Players'}</h3>
                        <div className={styles.positionFilter}>
                            {(['all', 'GK', 'DEF', 'MID', 'FWD'] as const).map(pos => (
                                <button
                                    key={pos}
                                    className={`${styles.filterBtn} ${filterPosition === pos ? styles.active : ''}`}
                                    onClick={() => setFilterPosition(pos)}
                                >
                                    {pos === 'all' ? (isArabic ? 'الكل' : 'All') : pos}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.playerCards}>
                        {filteredAvailablePlayers.map(player => (
                            <div
                                key={player.id}
                                className={styles.playerCard}
                                draggable
                                onDragStart={(e) => handleDragStart(e, player)}
                                onDragEnd={handleDragEnd}
                            >
                                <GripVertical size={16} className={styles.dragHandle} />
                                {player.photo ? (
                                    <img src={player.photo} alt={player.name} className={styles.cardImg} />
                                ) : (
                                    <div className={styles.cardImgPlaceholder}><User size={20} /></div>
                                )}
                                <div className={styles.cardInfo}>
                                    <span className={styles.cardName}>{player.name}</span>
                                    <span className={styles.cardMeta}>
                                        {player.position} • {player.team}
                                    </span>
                                </div>
                                <span className={styles.cardRating}>{player.rating}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
