"use strict";
/**
 * Match and Player Data Synchronization
 * Syncs match data from API-FOOTBALL to Firestore
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncMatchData = exports.syncMatches = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const axios_1 = __importDefault(require("axios"));
// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
// API-FOOTBALL Configuration
const API_FOOTBALL_BASE_URL = 'https://v3.football.api-sports.io';
const SAUDI_PRO_LEAGUE_ID = 307; // Saudi Pro League
/**
 * Map API status to our simplified status
 */
function mapMatchStatus(apiStatus) {
    const liveStatuses = ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'SUSP', 'INT', 'LIVE'];
    const finishedStatuses = ['FT', 'AET', 'PEN', 'AWD', 'WO'];
    const postponedStatuses = ['PST', 'CANC', 'ABD'];
    if (liveStatuses.includes(apiStatus))
        return 'live';
    if (finishedStatuses.includes(apiStatus))
        return 'finished';
    if (postponedStatuses.includes(apiStatus))
        return 'postponed';
    return 'upcoming';
}
/**
 * Fetch matches from API-FOOTBALL
 */
async function fetchMatchesFromApi(season) {
    var _a;
    const apiKey = (_a = functions.config().apifootball) === null || _a === void 0 ? void 0 : _a.key;
    if (!apiKey) {
        throw new Error('API-FOOTBALL key not configured. Set it with: firebase functions:config:set apifootball.key="YOUR_KEY"');
    }
    try {
        const response = await axios_1.default.get(`${API_FOOTBALL_BASE_URL}/fixtures`, {
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
    }
    catch (error) {
        console.error('Error fetching matches from API-FOOTBALL:', error);
        throw error;
    }
}
/**
 * Sync all matches for current season
 * Runs every 6 hours
 */
exports.syncMatches = functions.pubsub
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
            const matchDoc = {
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
    }
    catch (error) {
        console.error('Match sync failed:', error);
        throw error;
    }
});
/**
 * Sync specific match data (for live updates)
 * Called by calculatePoints function
 */
exports.syncMatchData = functions.https.onCall(async (data) => {
    var _a;
    const { fixtureId } = data;
    if (!fixtureId) {
        throw new functions.https.HttpsError('invalid-argument', 'fixtureId is required');
    }
    const apiKey = (_a = functions.config().apifootball) === null || _a === void 0 ? void 0 : _a.key;
    if (!apiKey) {
        throw new functions.https.HttpsError('internal', 'API key not configured');
    }
    try {
        const response = await axios_1.default.get(`${API_FOOTBALL_BASE_URL}/fixtures`, {
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
        const match = matches[0];
        const matchDoc = {
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
    }
    catch (error) {
        console.error('Error syncing match data:', error);
        throw new functions.https.HttpsError('internal', 'Failed to sync match data');
    }
});
//# sourceMappingURL=syncMatches.js.map