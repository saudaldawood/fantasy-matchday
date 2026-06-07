import type { LineupEntry, PlayerPosition } from '@/types/app';

// Generic player interface for validation (works with both Player and DraftPlayer)
interface ValidatablePlayer {
    id: string;
    teamId?: string;
    team?: 'Home' | 'Away';
}

export interface ValidationError {
    field: string;
    message: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

// Maximum number of players a user can pick per match
export const MAX_PLAYERS = 3;

/**
 * Validate lineup player count
 * - Must have exactly 3 players selected
 */
export function validateFormation(entries: LineupEntry[]): ValidationResult {
    const errors: ValidationError[] = [];

    if (entries.length !== MAX_PLAYERS) {
        errors.push({
            field: 'players',
            message: `Must select exactly ${MAX_PLAYERS} players (currently ${entries.length})`
        });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate team balance - must pick from both teams
 */
export function validateTeamLimit(
    entries: LineupEntry[],
    players: ValidatablePlayer[]
): ValidationResult {
    const errors: ValidationError[] = [];

    // Create player lookup
    const playerMap = new Map(players.map(p => [p.id, p]));

    // Count players per team
    const teamCounts = entries.reduce((acc, entry) => {
        const player = playerMap.get(entry.playerId);
        if (player) {
            const teamKey = player.teamId || player.team || 'unknown';
            acc[teamKey] = (acc[teamKey] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    // All 3 players cannot be from the same team
    Object.entries(teamCounts).forEach(([teamId, count]) => {
        if (count >= MAX_PLAYERS) {
            errors.push({
                field: 'teamLimit',
                message: `Cannot pick all ${MAX_PLAYERS} players from the same team`
            });
        }
    });

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate captain selection
 */
export function validateCaptain(entries: LineupEntry[]): ValidationResult {
    const errors: ValidationError[] = [];

    const captains = entries.filter(e => e.isCaptain && !e.isBench);

    if (captains.length === 0) {
        errors.push({
            field: 'captain',
            message: 'Must select a captain'
        });
    } else if (captains.length > 1) {
        errors.push({
            field: 'captain',
            message: 'Can only have one captain'
        });
    }

    // Captain must be a starter
    const benchCaptain = entries.find(e => e.isCaptain && e.isBench);
    if (benchCaptain) {
        errors.push({
            field: 'captain',
            message: 'Captain must be in starting lineup'
        });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate no duplicate players
 */
export function validateNoDuplicates(entries: LineupEntry[]): ValidationResult {
    const errors: ValidationError[] = [];

    const playerIds = entries.map(e => e.playerId);
    const duplicates = playerIds.filter((id, index) => playerIds.indexOf(id) !== index);

    if (duplicates.length > 0) {
        errors.push({
            field: 'duplicates',
            message: 'Cannot select the same player multiple times'
        });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Run all validation checks
 */
export function validateLineup(
    entries: LineupEntry[],
    players: ValidatablePlayer[]
): ValidationResult {
    const validations = [
        validateFormation(entries),
        validateTeamLimit(entries, players),
        validateCaptain(entries),
        validateNoDuplicates(entries)
    ];

    const allErrors = validations.flatMap(v => v.errors);

    return {
        isValid: allErrors.length === 0,
        errors: allErrors
    };
}

/**
 * Get formation name from entries
 */
export function getFormationName(entries: LineupEntry[]): string {
    const counts = entries.reduce((acc, entry) => {
        acc[entry.position] = (acc[entry.position] || 0) + 1;
        return acc;
    }, {} as Record<PlayerPosition, number>);

    const positions = Object.entries(counts)
        .map(([pos, count]) => `${count} ${pos}`)
        .join(', ');

    return positions || 'No players';
}

/**
 * Check if lineup is complete (3 players selected)
 */
export function isLineupComplete(entries: LineupEntry[]): boolean {
    return entries.length === MAX_PLAYERS;
}

/**
 * Check if deadline has passed
 */
export function isDeadlinePassed(deadline: Date): boolean {
    return new Date() > deadline;
}
