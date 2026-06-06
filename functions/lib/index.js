"use strict";
/**
 * Fantasy Matchday - Cloud Functions
 * Main entry point for all Firebase Cloud Functions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBroadcastHistory = exports.processScheduledBroadcasts = exports.sendBroadcastNotification = exports.applyReferralCode = exports.generateReferralCode = exports.banUserSecure = exports.removeAdminRole = exports.assignAdminRole = exports.sendDeadlineReminders = exports.sendMatchReminders = exports.getTransactionHistory = exports.handleStripeWebhook = exports.createPaymentIntent = exports.awardWeeklyRewards = exports.purchasePowerUp = exports.awardMatchParticipationCredits = exports.awardDailyLoginCredits = exports.updateGlobalRanks = exports.updateLeaderboards = exports.lockLineups = exports.finalizeMatchPoints = exports.calculateLivePoints = exports.syncMatchData = exports.syncMatches = void 0;
// Match and Player Data Sync
var syncMatches_1 = require("./syncMatches");
Object.defineProperty(exports, "syncMatches", { enumerable: true, get: function () { return syncMatches_1.syncMatches; } });
Object.defineProperty(exports, "syncMatchData", { enumerable: true, get: function () { return syncMatches_1.syncMatchData; } });
// Points Calculation
var calculatePoints_1 = require("./calculatePoints");
Object.defineProperty(exports, "calculateLivePoints", { enumerable: true, get: function () { return calculatePoints_1.calculateLivePoints; } });
Object.defineProperty(exports, "finalizeMatchPoints", { enumerable: true, get: function () { return calculatePoints_1.finalizeMatchPoints; } });
// Lineup Locking
var lockLineups_1 = require("./lockLineups");
Object.defineProperty(exports, "lockLineups", { enumerable: true, get: function () { return lockLineups_1.lockLineups; } });
// Leaderboard Updates
var updateLeaderboards_1 = require("./updateLeaderboards");
Object.defineProperty(exports, "updateLeaderboards", { enumerable: true, get: function () { return updateLeaderboards_1.updateLeaderboards; } });
Object.defineProperty(exports, "updateGlobalRanks", { enumerable: true, get: function () { return updateLeaderboards_1.updateGlobalRanks; } });
// Credits System
var credits_1 = require("./credits");
Object.defineProperty(exports, "awardDailyLoginCredits", { enumerable: true, get: function () { return credits_1.awardDailyLoginCredits; } });
Object.defineProperty(exports, "awardMatchParticipationCredits", { enumerable: true, get: function () { return credits_1.awardMatchParticipationCredits; } });
Object.defineProperty(exports, "purchasePowerUp", { enumerable: true, get: function () { return credits_1.purchasePowerUp; } });
Object.defineProperty(exports, "awardWeeklyRewards", { enumerable: true, get: function () { return credits_1.awardWeeklyRewards; } });
// Stripe Payments
var stripe_1 = require("./stripe");
Object.defineProperty(exports, "createPaymentIntent", { enumerable: true, get: function () { return stripe_1.createPaymentIntent; } });
Object.defineProperty(exports, "handleStripeWebhook", { enumerable: true, get: function () { return stripe_1.handleStripeWebhook; } });
Object.defineProperty(exports, "getTransactionHistory", { enumerable: true, get: function () { return stripe_1.getTransactionHistory; } });
// Notifications & Reminders
var notifications_1 = require("./notifications");
Object.defineProperty(exports, "sendMatchReminders", { enumerable: true, get: function () { return notifications_1.sendMatchReminders; } });
Object.defineProperty(exports, "sendDeadlineReminders", { enumerable: true, get: function () { return notifications_1.sendDeadlineReminders; } });
// Email System (disabled - requires SENDGRID_API_KEY)
// export {
//     sendWelcomeEmail,
//     sendWeeklySummaryEmails,
//     sendLeagueInvitationEmail
// } from './emails';
// Admin & roles
var admin_1 = require("./admin");
Object.defineProperty(exports, "assignAdminRole", { enumerable: true, get: function () { return admin_1.assignAdminRole; } });
Object.defineProperty(exports, "removeAdminRole", { enumerable: true, get: function () { return admin_1.removeAdminRole; } });
Object.defineProperty(exports, "banUserSecure", { enumerable: true, get: function () { return admin_1.banUserSecure; } });
// Referral System
var referrals_1 = require("./referrals");
Object.defineProperty(exports, "generateReferralCode", { enumerable: true, get: function () { return referrals_1.generateReferralCode; } });
Object.defineProperty(exports, "applyReferralCode", { enumerable: true, get: function () { return referrals_1.applyReferralCode; } });
// Admin Broadcast Notifications
var broadcast_1 = require("./broadcast");
Object.defineProperty(exports, "sendBroadcastNotification", { enumerable: true, get: function () { return broadcast_1.sendBroadcastNotification; } });
Object.defineProperty(exports, "processScheduledBroadcasts", { enumerable: true, get: function () { return broadcast_1.processScheduledBroadcasts; } });
Object.defineProperty(exports, "getBroadcastHistory", { enumerable: true, get: function () { return broadcast_1.getBroadcastHistory; } });
//# sourceMappingURL=index.js.map