"use strict";
/**
 * Leaderboard Update Cloud Functions
 * Updates global and league leaderboards after points calculation
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateGlobalRanks = exports.updateLeaderboards = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
/**
 * Update leaderboards after points are updated
 * Runs every 5 minutes during active matches
 */
exports.updateLeaderboards = functions.pubsub
    .schedule('every 5 minutes')
    .timeZone('Asia/Riyadh')
    .onRun(async () => {
    console.log('Updating leaderboards...');
    try {
        // Check if there are any live matches
        const liveMatchesSnapshot = await db.collection('matches')
            .where('status', '==', 'live')
            .limit(1)
            .get();
        if (liveMatchesSnapshot.empty) {
            console.log('No live matches, skipping leaderboard update');
            return null;
        }
        // Get all users ordered by total points
        const usersSnapshot = await db.collection('users')
            .orderBy('totalPoints', 'desc')
            .get();
        const batch = db.batch();
        let rank = 1;
        let previousPoints = null;
        let sameRankCount = 0;
        for (const userDoc of usersSnapshot.docs) {
            const userData = userDoc.data();
            const currentPoints = userData.totalPoints || 0;
            const previousRank = userData.globalRank || null;
            // Handle tied ranks
            if (previousPoints === currentPoints) {
                sameRankCount++;
            }
            else {
                rank = rank + sameRankCount;
                sameRankCount = 1;
                previousPoints = currentPoints;
            }
            // Calculate rank change
            let rankChange = 0;
            if (previousRank !== null) {
                rankChange = previousRank - rank;
            }
            batch.update(userDoc.ref, {
                globalRank: rank,
                previousRank: previousRank,
                rankChange: rankChange,
                rankUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        await batch.commit();
        console.log(`Updated ranks for ${usersSnapshot.size} users`);
        // Update league leaderboards
        await updateLeagueLeaderboards();
        return null;
    }
    catch (error) {
        console.error('Leaderboard update failed:', error);
        throw error;
    }
});
/**
 * Update all league leaderboards
 */
async function updateLeagueLeaderboards() {
    console.log('Updating league leaderboards...');
    try {
        // Get all active leagues
        const leaguesSnapshot = await db.collection('leagues')
            .where('status', '==', 'active')
            .get();
        for (const leagueDoc of leaguesSnapshot.docs) {
            const leagueId = leagueDoc.id;
            // Get all memberships for this league ordered by points
            const membershipsSnapshot = await db.collection('leagueMemberships')
                .where('leagueId', '==', leagueId)
                .where('status', '==', 'active')
                .orderBy('totalPoints', 'desc')
                .get();
            const batch = db.batch();
            let rank = 1;
            for (const membershipDoc of membershipsSnapshot.docs) {
                const membershipData = membershipDoc.data();
                const previousRank = membershipData.leagueRank || null;
                // Calculate rank change
                let rankChange = 0;
                if (previousRank !== null) {
                    rankChange = previousRank - rank;
                }
                batch.update(membershipDoc.ref, {
                    leagueRank: rank,
                    previousLeagueRank: previousRank,
                    leagueRankChange: rankChange,
                    rankUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                rank++;
            }
            await batch.commit();
        }
        console.log(`Updated ${leaguesSnapshot.size} league leaderboards`);
    }
    catch (error) {
        console.error('League leaderboard update failed:', error);
    }
}
/**
 * Update global ranks when a match is completed
 * Triggered by match status change
 */
exports.updateGlobalRanks = functions.firestore
    .document('matches/{matchId}')
    .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    // Only process when match just finished
    if (before.status !== 'finished' && after.status === 'finished') {
        console.log('Match finished, updating global ranks...');
        try {
            // Get all users ordered by total points
            const usersSnapshot = await db.collection('users')
                .orderBy('totalPoints', 'desc')
                .get();
            const batch = db.batch();
            let rank = 1;
            for (const userDoc of usersSnapshot.docs) {
                const userData = userDoc.data();
                const previousRank = userData.globalRank || null;
                let rankChange = 0;
                if (previousRank !== null) {
                    rankChange = previousRank - rank;
                }
                batch.update(userDoc.ref, {
                    globalRank: rank,
                    previousRank: previousRank,
                    rankChange: rankChange,
                    rankUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                rank++;
            }
            await batch.commit();
            console.log(`Final rank update for ${usersSnapshot.size} users`);
            return null;
        }
        catch (error) {
            console.error('Global rank update failed:', error);
            throw error;
        }
    }
    return null;
});
//# sourceMappingURL=updateLeaderboards.js.map