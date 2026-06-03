/**
 * Match and Player Data Synchronization
 * Syncs match data from API-FOOTBALL to Firestore
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

// API-FOOTBALL Configuration
const API_FOOTBALL_BASE_URL = 'https://v3.football.api-sports.io';
const SAUDI_PRO_LEAGUE_ID = 307; // Saudi Pro League

interface ApiMatch {
    fixture: {
        id: number;
        date: string;
        timestamp: number;
        venue: {
            name: string;
            city: string;
        };
        status: {
            short: string;
            long: string;
            elapsed: number | null;
        };
    };
    league: {
        id: number;
        name: string;
        round: string;
        season: number;
    };
    teams: {
        home: {
            id: number;
            name: string;
            logo: string;
        };
        away: {
            id: number;
            name: string;
            logo: string;
        };
    };
    goals: {
        home: number | null;
        away: number | null;
    };
}

interface FirestoreMatch {
    fixtureId: number;
    matchDate: admin.firestore.Timestamp;
    venue: string;
    city: string;
    status: 'upcoming' | 'live' | 'finished' | 'postponed';
    statusShort: string;
    elapsed: number | null;
    league: string;
    round: string;
    season: number;
    homeTeam: {
        id: number;
        name: string;
        logo: string;
    };
    awayTeam: {
        id: number;
        name: string;
        logo: string;
    };
    homeScore: number | null;
    awayScore: number | null;
    updatedAt: admin.firestore.FieldValue;
}

/**
 * Map API status to our simplified status
 */
function mapMatchStatus(apiStatus: string): 'upcoming' | 'live' | 'finished' | 'postponed' {
    const liveStatuses = ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'SUSP', 'INT', 'LIVE'];
    const finishedStatuses = ['FT', 'AET', 'PEN', 'AWD', 'WO'];
    const postponedStatuses = ['PST', 'CANC', 'ABD'];

    if (liveStatuses.includes(apiStatus)) return 'live';
    if (finishedStatuses.includes(apiStatus)) return 'finished';
    if (postponedStatuses.includes(apiStatus)) return 'postponed';
    return 'upcoming';
}

/**
 * Fetch matches from API-FOOTBALL
 */
async function fetchMatchesFromApi(season: number): Promise<ApiMatch[]> {
    const apiKey = functions.config().apifootball?.key;

    if (!apiKey) {
        throw new Error('API-FOOTBALL key not configured. Set it with: firebase functions:config:set apifootball.key="YOUR_KEY"');
    }

    try {
        const response = await axios.get(`${API_FOOTBALL_BASE_URL}/fixtures`, {
            headers: {
                'x-rapidapi-host': 'v3.football.api-sports.io',
                'x-rapidapi-key': apiKey,
            },
            params: {
                league: SAUDI_PRO_LEAGUE_ID,
                season: season,
            },
        });

        return response.data.response || [];
    } catch (error) {
        console.error('Error fetching matches from API-FOOTBALL:', error);
        throw error;
    }
}

/**
 * Sync all matches for current season
 * Runs every 6 hours
 */
export const syncMatches = functions.pubsub
    .schedule('every 6 hours')
    .timeZone('Asia/Riyadh')
    .onRun(async () => {
        console.log('Starting match sync...');

        const currentSeason = new Date().getFullYear();

        try {
            const matches = await fetchMatchesFromApi(currentSeason);
            console.log(`Fetched ${matches.length} matches from API`);

            const batch = db.batch();
            let count = 0;

            for (const match of matches) {
                const matchDoc: FirestoreMatch = {
                    fixtureId: match.fixture.id,
                    matchDate: admin.firestore.Timestamp.fromDate(new Date(match.fixture.date)),
                    venue: match.fixture.venue.name || 'TBD',
                    city: match.fixture.venue.city || 'TBD',
                    status: mapMatchStatus(match.fixture.status.short),
                    statusShort: match.fixture.status.short,
                    elapsed: match.fixture.status.elapsed,
                    league: match.league.name,
                    round: match.league.round,
                    season: match.league.season,
                    homeTeam: {
                        id: match.teams.home.id,
                        name: match.teams.home.name,
                        logo: match.teams.home.logo,
                    },
                    awayTeam: {
                        id: match.teams.away.id,
                        name: match.teams.away.name,
                        logo: match.teams.away.logo,
                    },
                    homeScore: match.goals.home,
                    awayScore: match.goals.away,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                };

                const docRef = db.collection('matches').doc(match.fixture.id.toString());
                batch.set(docRef, matchDoc, { merge: true });
                count++;

                // Firestore batch limit is 500
                if (count >= 450) {
                    await batch.commit();
                    count = 0;
                }
            }

            if (count > 0) {
                await batch.commit();
            }

            console.log(`Successfully synced ${matches.length} matches`);
            return null;
        } catch (error) {
            console.error('Match sync failed:', error);
            throw error;
        }
    });

/**
 * Sync specific match data (for live updates)
 * Called by calculatePoints function
 */
export const syncMatchData = functions.https.onCall(async (data: { fixtureId: number }) => {
    const { fixtureId } = data;

    if (!fixtureId) {
        throw new functions.https.HttpsError('invalid-argument', 'fixtureId is required');
    }

    const apiKey = functions.config().apifootball?.key;

    if (!apiKey) {
        throw new functions.https.HttpsError('internal', 'API key not configured');
    }

    try {
        const response = await axios.get(`${API_FOOTBALL_BASE_URL}/fixtures`, {
            headers: {
                'x-rapidapi-host': 'v3.football.api-sports.io',
                'x-rapidapi-key': apiKey,
            },
            params: {
                id: fixtureId,
            },
        });

        const matches = response.data.response || [];

        if (matches.length === 0) {
            throw new functions.https.HttpsError('not-found', 'Match not found');
        }

        const match = matches[0] as ApiMatch;

        const matchDoc: FirestoreMatch = {
            fixtureId: match.fixture.id,
            matchDate: admin.firestore.Timestamp.fromDate(new Date(match.fixture.date)),
            venue: match.fixture.venue.name || 'TBD',
            city: match.fixture.venue.city || 'TBD',
            status: mapMatchStatus(match.fixture.status.short),
            statusShort: match.fixture.status.short,
            elapsed: match.fixture.status.elapsed,
            league: match.league.name,
            round: match.league.round,
            season: match.league.season,
            homeTeam: {
                id: match.teams.home.id,
                name: match.teams.home.name,
                logo: match.teams.home.logo,
            },
            awayTeam: {
                id: match.teams.away.id,
                name: match.teams.away.name,
                logo: match.teams.away.logo,
            },
            homeScore: match.goals.home,
            awayScore: match.goals.away,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await db.collection('matches').doc(fixtureId.toString()).set(matchDoc, { merge: true });

        return { success: true, match: matchDoc };
    } catch (error) {
        console.error('Error syncing match data:', error);
        throw new functions.https.HttpsError('internal', 'Failed to sync match data');
    }
});
