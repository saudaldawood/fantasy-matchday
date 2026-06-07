"use strict";
/**
 * Points Calculation Cloud Functions
 * Calculates fantasy points based on real match events
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
exports.finalizeMatchPoints = exports.calculateLivePoints = void 0;
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
// Scoring Rules by Position
const SCORING_RULES = {
    GK: {
        goal: 6,
        assist: 3,
        cleanSheet: 4,
        penaltySave: 5,
        saves3Plus: 2,
        yellowCard: -1,
        redCard: -3,
        ownGoal: -2,
        minutesPlayed60: 2,
        motm: 3,
    },
    DEF: {
        goal: 6,
        assist: 3,
        cleanSheet: 4,
        penaltySave: 5,
        saves3Plus: 0,
        yellowCard: -1,
        redCard: -3,
        ownGoal: -2,
        minutesPlayed60: 2,
        motm: 3,
    },
    MID: {
        goal: 5,
        assist: 3,
        cleanSheet: 1,
        penaltySave: 0,
        saves3Plus: 0,
        yellowCard: -1,
        redCard: -3,
        ownGoal: -2,
        minutesPlayed60: 2,
        motm: 3,
    },
    FWD: {
        goal: 4,
        assist: 3,
        cleanSheet: 0,
        penaltySave: 0,
        saves3Plus: 0,
        yellowCard: -1,
        redCard: -3,
        ownGoal: -2,
        minutesPlayed60: 2,
        motm: 3,
    },
};
/**
 * Calculate points for a single player
 */
function calculatePlayerPoints(stats, position, isCaptain, powerUps) {
    const rules = SCORING_RULES[position] || SCORING_RULES.MID;
    let points = 0;
    // Goals
    points += stats.goals * rules.goal;
    // Assists
    points += stats.assists * rules.assist;
    // Clean Sheet (for GK, DEF, MID only if eligable)
    if (stats.cleanSheet && rules.cleanSheet > 0) {
        points += rules.cleanSheet;
    }
    // Saves (GK only)
    if (stats.saves >= 3 && rules.saves3Plus > 0) {
        points += rules.saves3Plus;
    }
    // Penalty Save
    points += stats.penaltiesSaved * rules.penaltySave;
    // Cards
    points += stats.yellowCards * rules.yellowCard;
    points += stats.redCards * rules.redCard;
    // Own Goals
    points += stats.ownGoals * rules.ownGoal;
    // Minutes played bonus
    if (stats.minutesPlayed >= 60) {
        points += rules.minutesPlayed60;
    }
    // Apply captain multiplier
    let multiplier = isCaptain ? 2 : 1;
    // Apply Triple Captain power-up
    if (powerUps.includes('triple_captain') && isCaptain) {
        multiplier = 3;
    }
    return points * multiplier;
}
/**
 * Fetch player statistics from API-FOOTBALL
 */
async function fetchPlayerStats(fixtureId) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const apiKey = (_a = functions.config().apifootball) === null || _a === void 0 ? void 0 : _a.key;
    if (!apiKey) {
        throw new Error('API-FOOTBALL key not configured');
    }
    const playerStats = new Map();
    try {
        // Fetch fixture statistics
        const statsResponse = await axios_1.default.get(`${API_FOOTBALL_BASE_URL}/fixtures/players`, {
            headers: {
                'x-rapidapi-host': 'v3.football.api-sports.io',
                'x-rapidapi-key': apiKey,
            },
            params: {
                fixture: fixtureId,
            },
        });
        const teams = statsResponse.data.response || [];
        // Get match info for clean sheet calculation
        const matchDoc = await db.collection('matches').doc(fixtureId.toString()).get();
        const matchData = matchDoc.data();
        const homeScore = (matchData === null || matchData === void 0 ? void 0 : matchData.homeScore) || 0;
        const awayScore = (matchData === null || matchData === void 0 ? void 0 : matchData.awayScore) || 0;
        for (const team of teams) {
            const isHomeTeam = team.team.id === ((_b = matchData === null || matchData === void 0 ? void 0 : matchData.homeTeam) === null || _b === void 0 ? void 0 : _b.id);
            const concededGoals = isHomeTeam ? awayScore : homeScore;
            const hasCleanSheet = concededGoals === 0;
            for (const playerData of team.players) {
                const player = playerData.player;
                const stats = playerData.statistics[0] || {};
                playerStats.set(player.id, {
                    playerId: player.id,
                    goals: ((_c = stats.goals) === null || _c === void 0 ? void 0 : _c.total) || 0,
                    assists: ((_d = stats.goals) === null || _d === void 0 ? void 0 : _d.assists) || 0,
                    saves: ((_e = stats.goals) === null || _e === void 0 ? void 0 : _e.saves) || 0,
                    yellowCards: ((_f = stats.cards) === null || _f === void 0 ? void 0 : _f.yellow) || 0,
                    redCards: ((_g = stats.cards) === null || _g === void 0 ? void 0 : _g.red) || 0,
                    ownGoals: 0, // Need to check events for own goals
                    minutesPlayed: ((_h = stats.games) === null || _h === void 0 ? void 0 : _h.minutes) || 0,
                    penaltiesSaved: ((_j = stats.penalty) === null || _j === void 0 ? void 0 : _j.saved) || 0,
                    cleanSheet: hasCleanSheet,
                });
            }
        }
        // Fetch events for own goals
        const eventsResponse = await axios_1.default.get(`${API_FOOTBALL_BASE_URL}/fixtures/events`, {
            headers: {
                'x-rapidapi-host': 'v3.football.api-sports.io',
                'x-rapidapi-key': apiKey,
            },
            params: {
                fixture: fixtureId,
            },
        });
        const events = eventsResponse.data.response || [];
        for (const event of events) {
            if (event.detail === 'Own Goal' && ((_k = event.player) === null || _k === void 0 ? void 0 : _k.id)) {
                const stats = playerStats.get(event.player.id);
                if (stats) {
                    stats.ownGoals += 1;
                }
            }
        }
        return playerStats;
    }
    catch (error) {
        console.error('Error fetching player stats:', error);
        throw error;
    }
}
/**
 * Calculate live points for all lineups in a match
 * Runs every 2 minutes during live matches
 */
exports.calculateLivePoints = functions.pubsub
    .schedule('every 2 minutes')
    .timeZone('Asia/Riyadh')
    .onRun(async () => {
    console.log('Starting live points calculation...');
    try {
        // Find all live matches
        const liveMatchesSnapshot = await db.collection('matches')
            .where('status', '==', 'live')
            .get();
        if (liveMatchesSnapshot.empty) {
            console.log('No live matches found');
            return null;
        }
        console.log(`Found ${liveMatchesSnapshot.size} live matches`);
        for (const matchDoc of liveMatchesSnapshot.docs) {
            const matchId = matchDoc.id;
            const fixtureId = matchDoc.data().fixtureId;
            console.log(`Processing match ${matchId} (fixture: ${fixtureId})`);
            // Fetch latest player stats
            const playerStats = await fetchPlayerStats(fixtureId);
            // Get all locked lineups for this match
            const lineupsSnapshot = await db.collection('lineups')
                .where('matchId', '==', matchId)
                .where('status', '==', 'locked')
                .get();
            console.log(`Found ${lineupsSnapshot.size} lineups to update`);
            const batch = db.batch();
            for (const lineupDoc of lineupsSnapshot.docs) {
                const lineup = lineupDoc.data();
                const powerUps = lineup.powerUps || [];
                let totalPoints = 0;
                const playerPointsMap = {};
                // Calculate points for starting lineup
                for (const player of lineup.players || []) {
                    const stats = playerStats.get(player.playerId);
                    if (stats) {
                        const points = calculatePlayerPoints(stats, player.position, player.isCaptain, powerUps);
                        playerPointsMap[player.playerId] = points;
                        totalPoints += points;
                    }
                }
                // If bench boost is active, add bench player points
                if (powerUps.includes('bench_boost')) {
                    for (const player of lineup.bench || []) {
                        const stats = playerStats.get(player.playerId);
                        if (stats) {
                            const points = calculatePlayerPoints(stats, player.position, false, []);
                            playerPointsMap[player.playerId] = points;
                            totalPoints += points;
                        }
                    }
                }
                // Update lineup with calculated points
                batch.update(lineupDoc.ref, {
                    totalPoints,
                    playerPoints: playerPointsMap,
                    pointsUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            }
            await batch.commit();
            console.log(`Updated points for match ${matchId}`);
        }
        return null;
    }
    catch (error) {
        console.error('Live points calculation failed:', error);
        throw error;
    }
});
/**
 * Finalize match points when match ends
 * Triggered when match status changes to 'finished'
 */
exports.finalizeMatchPoints = functions.firestore
    .document('matches/{matchId}')
    .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    // Only process when match just finished
    if (before.status !== 'finished' && after.status === 'finished') {
        const matchId = context.params.matchId;
        console.log(`Match ${matchId} finished, finalizing points...`);
        try {
            // Get all lineups for this match
            const lineupsSnapshot = await db.collection('lineups')
                .where('matchId', '==', matchId)
                .where('status', '==', 'locked')
                .get();
            const batch = db.batch();
            for (const lineupDoc of lineupsSnapshot.docs) {
                // Mark lineup as completed
                batch.update(lineupDoc.ref, {
                    status: 'completed',
                    completedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                // Update user's total points
                const lineup = lineupDoc.data();
                const userRef = db.collection('users').doc(lineup.userId);
                batch.update(userRef, {
                    totalPoints: admin.firestore.FieldValue.increment(lineup.totalPoints || 0),
                    matchesPlayed: admin.firestore.FieldValue.increment(1),
                });
            }
            await batch.commit();
            console.log(`Finalized ${lineupsSnapshot.size} lineups for match ${matchId}`);
            return null;
        }
        catch (error) {
            console.error('Error finalizing match points:', error);
            throw error;
        }
    }
    return null;
});
//# sourceMappingURL=calculatePoints.js.map