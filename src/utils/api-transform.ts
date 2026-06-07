// Utility functions to transform API-Football responses to app models

import type { APIFixture, APIPlayer, APITeam as APITeamType, APIFixturePlayer, APIFixtureEvent } from '@/types/api-football';
import type { Match, Player, Team, PlayerPosition, MatchStatus, PlayerMatchPerformance, PointsBreakdown } from '@/types/app';

/**
 * Determine player position from API string
 */
export function mapPlayerPosition(apiPosition: string): PlayerPosition {
    const pos = apiPosition.toUpperCase();

    if (pos.includes('GOAL') || pos === 'G') return 'GK';
    if (pos.includes('DEF') || pos === 'D') return 'DEF';
    if (pos.includes('MID') || pos === 'M') return 'MID';
    if (pos.includes('FOR') || pos.includes('ATT') || pos === 'F' || pos === 'A') return 'FWD';

    // Default to midfielder if unclear
    return 'MID';
}

/**
 * Map API match status to app status
 */
export function mapMatchStatus(apiStatus: string): MatchStatus {
    const status = apiStatus.toLowerCase();

    if (status === 'ns' || status === 'tbd') return 'scheduled';
    if (status === '1h' || status === '2h' || status === 'live') return 'live';
    if (status === 'ht') return 'halftime';
    if (status === 'ft' || status === 'aet' || status === 'pen') return 'completed';
    if (status === 'pst') return 'postponed';
    if (status === 'canc' || status === 'abd') return 'cancelled';

    return 'scheduled';
}

/**
 * Transform API team to app team
 */
export function transformTeam(apiTeam: APITeamType): Team {
    return {
        id: String(apiTeam.id),
        name: apiTeam.name,
        nameAr: apiTeam.name, // TODO: Add Arabic names mapping
        logo: apiTeam.logo,
        shortName: apiTeam.name.substring(0, 3).toUpperCase(),
    };
}

/**
 * Transform API fixture to app match
 */
export function transformMatch(apiFixture: APIFixture): Match {
    const matchDate = new Date(apiFixture.fixture.date);

    return {
        id: String(apiFixture.fixture.id),
        homeTeam: transformTeam(apiFixture.teams.home),
        awayTeam: transformTeam(apiFixture.teams.away),
        venue: apiFixture.fixture.venue.name || 'TBD',
        matchDate,
        round: parseInt(apiFixture.league.round.replace(/\D/g, '')) || 1,
        season: String(apiFixture.league.season),
        status: mapMatchStatus(apiFixture.fixture.status.short),
        currentMinute: apiFixture.fixture.status.elapsed || undefined,
        homeScore: apiFixture.goals.home || 0,
        awayScore: apiFixture.goals.away || 0,
        lineupDeadline: matchDate, // Deadline is match kickoff
        totalParticipants: 0, // TODO: Get from Firebase
        isActive: true,
    };
}

/**
 * Transform API player to app player
 */
export function transformPlayer(apiPlayer: APIPlayer, teamId: string): Player {
    const stats = apiPlayer.statistics[0]; // Use first (current season) stats

    return {
        id: String(apiPlayer.player.id),
        name: apiPlayer.player.name,
        nameAr: apiPlayer.player.name, // TODO: Add Arabic names mapping
        photo: apiPlayer.player.photo,
        jerseyNumber: stats?.games.number || 0,
        teamId,
        position: mapPlayerPosition(stats?.games.position || 'M'),
        form: [], // TODO: Calculate from recent matches
        totalPoints: 0, // TODO: Calculate from performances
        averagePoints: 0, // TODO: Calculate average
        isAvailable: !apiPlayer.player.injured,
    };
}

/**
 * Calculate fantasy points for a player's match performance
 * Based on rules from docs/gameplay-rules.md
 */
export function calculatePoints(
    performance: {
        position: PlayerPosition;
        minutesPlayed: number;
        goals: number;
        assists: number;
        cleanSheet: boolean;
        penaltySaves: number;
        saves: number;
        yellowCards: number;
        redCards: number;
        manOfTheMatch: boolean;
    },
    isCaptain: boolean = false,
    isTripleCaptain: boolean = false
): PointsBreakdown {
    const breakdown: PointsBreakdown = {
        goalsPoints: 0,
        assistsPoints: 0,
        cleanSheetPoints: 0,
        penaltySavePoints: 0,
        savesPoints: 0,
        minutesPlayedPoints: 0,
        manOfTheMatchPoints: 0,
        hatTrickPoints: 0,
        yellowCardPoints: 0,
        redCardPoints: 0,
        total: 0,
    };

    const { position, minutesPlayed, goals, assists, cleanSheet, penaltySaves, saves, yellowCards, redCards, manOfTheMatch } = performance;

    // Goals points (position-dependent)
    if (position === 'GK' || position === 'DEF') {
        breakdown.goalsPoints = goals * 6;
    } else if (position === 'MID') {
        breakdown.goalsPoints = goals * 5;
    } else if (position === 'FWD') {
        breakdown.goalsPoints = goals * 4;
    }

    // Assists (all positions)
    breakdown.assistsPoints = assists * 3;

    // Clean sheet (GK and DEF only)
    if ((position === 'GK' || position === 'DEF') && cleanSheet) {
        breakdown.cleanSheetPoints = 4;
    } else if (position === 'MID' && cleanSheet) {
        breakdown.cleanSheetPoints = 1;
    }

    // Goalkeeper specific
    if (position === 'GK') {
        breakdown.penaltySavePoints = penaltySaves * 5;
        if (saves >= 3) {
            breakdown.savesPoints = 2;
        }
    }

    // Minutes played bonus (60+ minutes)
    if (minutesPlayed >= 60) {
        breakdown.minutesPlayedPoints = 2;
    }

    // Man of the Match
    if (manOfTheMatch) {
        breakdown.manOfTheMatchPoints = 3;
    }

    // Hat-trick bonus (3+ goals)
    if (goals >= 3) {
        breakdown.hatTrickPoints = 5;
    }

    // Cards (negative points)
    breakdown.yellowCardPoints = yellowCards * -1;
    breakdown.redCardPoints = redCards * -3;

    // Calculate total
    const baseTotal =
        breakdown.goalsPoints +
        breakdown.assistsPoints +
        breakdown.cleanSheetPoints +
        breakdown.penaltySavePoints +
        breakdown.savesPoints +
        breakdown.minutesPlayedPoints +
        breakdown.manOfTheMatchPoints +
        breakdown.hatTrickPoints +
        breakdown.yellowCardPoints +
        breakdown.redCardPoints;

    // Apply captain multiplier
    let multiplier = 1;
    if (isTripleCaptain) {
        multiplier = 3;
    } else if (isCaptain) {
        multiplier = 2;
    }

    breakdown.total = baseTotal * multiplier;

    return breakdown;
}

/**
 * Transform API fixture players to match performance
 */
export function transformPlayerPerformance(
    apiData: APIFixturePlayer,
    matchId: string,
    teamCleanSheet: boolean
): PlayerMatchPerformance[] {
    return apiData.players.map((playerData) => {
        const player = playerData.player;
        const stats = playerData.statistics[0];

        if (!stats) {
            // Player didn't play
            return null;
        }

        const position = mapPlayerPosition(stats.games.position);
        const minutesPlayed = stats.games.minutes || 0;

        const performance = {
            position,
            minutesPlayed,
            goals: stats.goals.total || 0,
            assists: stats.goals.assists || 0,
            cleanSheet: teamCleanSheet && (position === 'GK' || position === 'DEF'),
            penaltySaves: stats.penalty.saved || 0,
            saves: stats.goals.saves || 0,
            yellowCards: stats.cards.yellow,
            redCards: stats.cards.red,
            manOfTheMatch: false, // TODO: Determine MOTM from match data
        };

        const pointsBreakdown = calculatePoints(performance);

        return {
            id: `${matchId}-${player.id}`,
            playerId: String(player.id),
            matchId,
            minutesPlayed: performance.minutesPlayed,
            goals: performance.goals,
            assists: performance.assists,
            cleanSheet: performance.cleanSheet,
            penaltySaves: performance.penaltySaves,
            saves: performance.saves,
            yellowCards: performance.yellowCards,
            redCards: performance.redCards,
            manOfTheMatch: performance.manOfTheMatch,
            hatTrick: performance.goals >= 3,
            pointsBreakdown,
            totalPoints: pointsBreakdown.total,
        };
    }).filter((p): p is PlayerMatchPerformance => p !== null);
}

/**
 * Format match date/time for display
 */
export function formatMatchTime(date: Date, locale: string = 'en'): string {
    return new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

/**
 * Format match date for display
 */
export function formatMatchDate(date: Date, locale: string = 'en'): string {
    return new Intl.DateTimeFormat(locale, {
        month: 'short',
        day: 'numeric',
    }).format(date);
}

/**
 * Check if lineup deadline has passed
 */
export function isLineupLocked(match: Match): boolean {
    return new Date() >= match.lineupDeadline;
}

/**
 * Get time until match/deadline
 */
export function getTimeUntilMatch(match: Match): {
    hours: number;
    minutes: number;
    isPast: boolean;
} {
    const now = new Date();
    const diff = match.matchDate.getTime() - now.getTime();

    return {
        hours: Math.floor(Math.abs(diff) / (1000 * 60 * 60)),
        minutes: Math.floor((Math.abs(diff) % (1000 * 60 * 60)) / (1000 * 60)),
        isPast: diff < 0,
    };
}
