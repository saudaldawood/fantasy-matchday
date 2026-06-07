import type {
    APIResponse,
    APIFixture,
    APIFixturePlayer,
    APIFixtureEvent,
    APIPlayer,
    APITeamInfo,
    APIStanding,
    APISquadPlayer
} from '@/types/api-football';

const API_KEY = process.env.NEXT_PUBLIC_API_FOOTBALL_KEY || '';
const API_HOST = process.env.NEXT_PUBLIC_API_FOOTBALL_HOST || '';
const LEAGUE_ID = Number(process.env.NEXT_PUBLIC_SPL_LEAGUE_ID) || 307;

// Auto-detect current football season (runs Aug-May, so Jan-Jul = previous year)
function getCurrentSeason(): number {
    const now = new Date();
    const month = now.getMonth(); // 0-indexed (0 = Jan, 7 = Aug)
    const year = now.getFullYear();
    // If Jan-Jul, season started previous year; if Aug-Dec, season started this year
    return month < 7 ? year - 1 : year;
}

const SEASON = Number(process.env.NEXT_PUBLIC_SPL_SEASON) || getCurrentSeason();

// Determine if using RapidAPI or direct API-Football
const isRapidAPI = API_HOST?.includes('rapidapi.com') || false;
const BASE_URL = API_HOST
    ? (isRapidAPI ? `https://${API_HOST}/v3` : `https://${API_HOST}`)
    : '';

class APIFootballError extends Error {
    constructor(message: string, public statusCode?: number) {
        super(message);
        this.name = 'APIFootballError';
    }
}

async function apiFetch<T>(endpoint: string, params: Record<string, any> = {}): Promise<APIResponse<T>> {
    const url = new URL(`${BASE_URL}${endpoint}`);

    // Add parameters to URL
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
        }
    });

    // Use different headers based on API provider
    const headers: Record<string, string> = isRapidAPI
        ? {
            'x-rapidapi-key': API_KEY,
            'x-rapidapi-host': API_HOST,
        }
        : {
            'x-apisports-key': API_KEY,
        };

    try {
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers,
            next: { revalidate: 1800 }, // Cache for 30 minutes to avoid rate limits
        });

        if (!response.ok) {
            throw new APIFootballError(
                `API request failed: ${response.statusText}`,
                response.status
            );
        }

        const data: APIResponse<T> = await response.json();

        // Check for API errors
        if (data.errors && Object.keys(data.errors).length > 0) {
            const errorMsg = JSON.stringify(data.errors);
            
            // Check for rate limit error
            if (errorMsg.includes('rate limit') || errorMsg.includes('Too many requests')) {
                throw new APIFootballError(
                    'API rate limit exceeded. Please wait a minute and try again. The free tier allows 10 requests per minute.'
                );
            }
            
            throw new APIFootballError(
                `API Error: ${errorMsg}`
            );
        }

        return data;
    } catch (error) {
        if (error instanceof APIFootballError) {
            throw error;
        }
        throw new APIFootballError(
            error instanceof Error ? error.message : 'Unknown API error'
        );
    }
}

/**
 * Get fixtures (matches) for Saudi Pro League
 * @param date - Date in 'YYYY-MM-DD' format (optional)
 * @param live - Get only live matches (optional)
 * @param fixtureId - Get specific fixture by ID (optional)
 */
export async function getFixtures(options: {
    date?: string;
    live?: boolean;
    from?: string;
    to?: string;
    fixtureId?: number;
} = {}): Promise<APIFixture[]> {
    // When fetching by ID, API requires ID to be used alone (no league/season)
    if (options.fixtureId) {
        const response = await apiFetch<APIFixture>('/fixtures', {
            id: options.fixtureId,
        });
        return response.response;
    }

    // For other queries, include league and season
    const params: Record<string, any> = {
        league: LEAGUE_ID,
        season: SEASON,
    };

    if (options.live) {
        params.live = 'all';
    } else if (options.date) {
        params.date = options.date;
    } else if (options.from && options.to) {
        params.from = options.from;
        params.to = options.to;
    }

    const response = await apiFetch<APIFixture>('/fixtures', params);
    return response.response;
}

/**
 * Get player statistics for a specific fixture
 */
export async function getFixturePlayers(fixtureId: number): Promise<APIFixturePlayer[]> {
    const response = await apiFetch<APIFixturePlayer>('/fixtures/players', {
        fixture: fixtureId,
    });
    return response.response;
}

/**
 * Get match events (goals, cards, substitutions)
 */
export async function getFixtureEvents(fixtureId: number): Promise<APIFixtureEvent[]> {
    const response = await apiFetch<APIFixtureEvent>('/fixtures/events', {
        fixture: fixtureId,
    });
    return response.response;
}

/**
 * Get player information and statistics
 */
export async function getPlayer(playerId: number, season?: number): Promise<APIPlayer | null> {
    const response = await apiFetch<APIPlayer>('/players', {
        id: playerId,
        season: season || SEASON,
    });
    return response.response[0] || null;
}

/**
 * Get players by team
 */
export async function getTeamPlayers(teamId: number, season?: number): Promise<APIPlayer[]> {
    const response = await apiFetch<APIPlayer>('/players', {
        team: teamId,
        season: season || SEASON,
    });
    return response.response;
}

// In-memory cache for team squads to avoid duplicate API calls
const squadCache = new Map<number, { data: APISquadPlayer[]; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * Get team squad (roster) - works for upcoming matches
 */
export async function getTeamSquad(teamId: number): Promise<APISquadPlayer[]> {
    try {
        // Check cache first
        const cached = squadCache.get(teamId);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            console.log(`Using cached squad data for team ${teamId}`);
            return cached.data;
        }

        // Fetch from API
        const response = await apiFetch<{ team: any; players: APISquadPlayer[] }>('/players/squads', {
            team: teamId,
        });
        
        const players = response.response[0]?.players || [];
        
        // Cache the result
        squadCache.set(teamId, { data: players, timestamp: Date.now() });
        
        // Log for debugging
        console.log(`Fetched ${players.length} players for team ${teamId}`);
        
        return players;
    } catch (error) {
        console.error(`Error fetching squad for team ${teamId}:`, error);
        
        // If we have stale cache data, return it as fallback
        const cached = squadCache.get(teamId);
        if (cached) {
            console.log(`Using stale cache for team ${teamId} due to API error`);
            return cached.data;
        }
        
        return [];
    }
}

/**
 * Get team information
 */

export async function getTeam(teamId: number): Promise<APITeamInfo | null> {
    const response = await apiFetch<APITeamInfo>('/teams', {
        id: teamId,
    });
    return response.response[0] || null;
}

/**
 * Get league standings
 */
export async function getStandings(season?: number): Promise<APIStanding[]> {
    const response = await apiFetch<{ league: any; standings: APIStanding[][] }>(
        '/standings',
        {
            league: LEAGUE_ID,
            season: season || SEASON,
        }
    );

    // API returns standings wrapped in an extra array
    return response.response[0]?.standings[0] || [];
}

/**
 * Get upcoming matches (next 7 days)
 */
export async function getUpcomingMatches(): Promise<APIFixture[]> {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setDate(today.getDate() + 30);

    const from = today.toISOString().split('T')[0];
    const to = nextMonth.toISOString().split('T')[0];

    return getFixtures({ from, to });
}

/**
 * Get live matches
 */
export async function getLiveMatches(): Promise<APIFixture[]> {
    return getFixtures({ live: true });
}

/**
 * Get matches for today
 */
export async function getTodayMatches(): Promise<APIFixture[]> {
    const today = new Date().toISOString().split('T')[0];
    return getFixtures({ date: today });
}

/**
 * Helper to check if API is configured
 */
export function isAPIConfigured(): boolean {
    return Boolean(API_KEY && API_HOST);
}

export { APIFootballError };
