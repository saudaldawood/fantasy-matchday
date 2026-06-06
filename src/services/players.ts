import { getFixturePlayers, getTeamSquad } from './api-football';
import { mapPlayerPosition } from '@/utils/api-transform';
import type { APIFixturePlayer, APISquadPlayer } from '@/types/api-football';

export interface DraftPlayer {
    id: string; // String ID for consistency with Firestore
    apiId: number; // Original API-FOOTBALL ID
    name: string;
    number: number;
    jerseyNumber: number; // Alias for number
    position: 'GK' | 'DEF' | 'MID' | 'FWD';
    team: 'Home' | 'Away';
    teamName?: string;
    rating: number;
    photo: string;
}

/**
 * Map squad position string to our position type
 */
function mapSquadPosition(position: string): 'GK' | 'DEF' | 'MID' | 'FWD' {
    const pos = position?.toLowerCase() || '';
    if (pos.includes('goalkeeper')) return 'GK';
    if (pos.includes('defender')) return 'DEF';
    if (pos.includes('midfielder')) return 'MID';
    if (pos.includes('attacker') || pos.includes('forward')) return 'FWD';
    return 'MID'; // Default to midfielder
}

/**
 * Fetch players for a specific match/fixture for draft
 */
export async function getMatchPlayersForDraft(fixtureId: number): Promise<DraftPlayer[]> {
    try {
        // Get fixture players (lineup + bench)
        const fixturePlayers = await getFixturePlayers(fixtureId);

        if (!fixturePlayers || fixturePlayers.length === 0) {
            throw new Error('No players found for this match');
        }

        const allPlayers: DraftPlayer[] = [];

        // Process each team
        fixturePlayers.forEach((teamData, teamIndex) => {
            const teamLabel = teamIndex === 0 ? 'Home' : 'Away';

            teamData.players.forEach((playerData) => {
                const player = playerData.player;
                const stats = playerData.statistics[0];

                if (!stats) return; // Skip if no stats

                // Calculate a simple rating based on stats (or use actual rating if available)
                const rating = parseInt(stats.games.rating || '75') || 75;

                allPlayers.push({
                    id: String(player.id),
                    apiId: player.id,
                    name: player.name,
                    number: stats.games.number,
                    jerseyNumber: stats.games.number,
                    position: mapPlayerPosition(stats.games.position),
                    team: teamLabel,
                    teamName: teamData.team?.name || teamLabel,
                    rating: rating,
                    photo: player.photo,
                });
            });
        });

        return allPlayers;
    } catch (error) {
        console.error('Error fetching match players:', error);
        throw error;
    }
}

/**
 * Fetch squad players for two teams (for upcoming matches without lineups)
 */
export async function getTeamsSquadsForDraft(
    homeTeamId: number,
    awayTeamId: number
): Promise<DraftPlayer[]> {
    try {
        console.log(`[SQUAD FETCH] Fetching squads for teams: Home=${homeTeamId}, Away=${awayTeamId}`);

        const [homePlayers, awayPlayers] = await Promise.all([
            getTeamSquad(homeTeamId),
            getTeamSquad(awayTeamId),
        ]);

        console.log(`[SQUAD FETCH] Found ${homePlayers.length} home players, ${awayPlayers.length} away players`);
        
        // Log first player from each team for verification
        if (homePlayers.length > 0) {
            console.log(`[SQUAD FETCH] Sample home player:`, homePlayers[0].name);
        }
        if (awayPlayers.length > 0) {
            console.log(`[SQUAD FETCH] Sample away player:`, awayPlayers[0].name);
        }

        // Validate we have players
        if (homePlayers.length === 0 && awayPlayers.length === 0) {
            throw new Error(`No squad data available for teams ${homeTeamId} and ${awayTeamId}. This match may not have player data yet.`);
        }

        const allPlayers: DraftPlayer[] = [];

        // Process home team
        homePlayers.forEach((player) => {
            if (!player.position) return; // Skip players without position

            allPlayers.push({
                id: String(player.id),
                apiId: player.id,
                name: player.name,
                number: player.number || 0,
                jerseyNumber: player.number || 0,
                position: mapSquadPosition(player.position),
                team: 'Home',
                teamName: 'Home Team',
                rating: 75 + Math.floor(Math.random() * 15),
                photo: player.photo,
            });
        });

        // Process away team
        awayPlayers.forEach((player) => {
            if (!player.position) return; // Skip players without position

            allPlayers.push({
                id: String(player.id),
                apiId: player.id,
                name: player.name,
                number: player.number || 0,
                jerseyNumber: player.number || 0,
                position: mapSquadPosition(player.position),
                team: 'Away',
                teamName: 'Away Team',
                rating: 75 + Math.floor(Math.random() * 15),
                photo: player.photo,
            });
        });

        if (allPlayers.length === 0) {
            throw new Error('No players found in team squads');
        }

        return allPlayers;
    } catch (error) {
        console.error('Error fetching team squads:', error);
        throw error;
    }
}

/**
 * Get players for draft - tries fixture players first, falls back to team squads
 */
export async function getDraftPlayers(
    fixtureId: number,
    homeTeamId?: number,
    awayTeamId?: number
): Promise<DraftPlayer[]> {
    // If team IDs are provided, try team squads first (for upcoming matches)
    if (homeTeamId && awayTeamId) {
        try {
            console.log('Fetching team squads for upcoming match...');
            return await getTeamsSquadsForDraft(homeTeamId, awayTeamId);
        } catch (squadError) {
            console.warn('Squad fetch failed, trying fixture players:', squadError);
        }
    }

    // Try fixture players (works for completed/live matches)
    try {
        return await getMatchPlayersForDraft(fixtureId);
    } catch (fixtureError) {
        // Last resort: try squads if we have team IDs
        if (homeTeamId && awayTeamId) {
            console.log('Fixture players not available, trying team squads as fallback...');
            return await getTeamsSquadsForDraft(homeTeamId, awayTeamId);
        }
        throw new Error('Unable to fetch players for this match');
    }
}

