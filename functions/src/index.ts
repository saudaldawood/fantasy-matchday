/**
 * Fantasy Matchday - Cloud Functions
 * Main entry point for all Firebase Cloud Functions
 */

// Match and Player Data Sync
export { syncMatches, syncMatchData } from './syncMatches';

// Points Calculation
export { calculateLivePoints, finalizeMatchPoints } from './calculatePoints';

// Lineup Locking
export { lockLineups } from './lockLineups';

// Leaderboard Updates
export { updateLeaderboards, updateGlobalRanks } from './updateLeaderboards';

// Credits System
export {
    awardDailyLoginCredits,
    awardMatchParticipationCredits,
    purchasePowerUp,
    awardWeeklyRewards
} from './credits';

// Stripe Payments
export {
    createPaymentIntent,
    handleStripeWebhook,
    getTransactionHistory
} from './stripe';

// Notifications & Reminders
export {
    sendMatchReminders,
    sendDeadlineReminders
} from './notifications';

// Email System (disabled - requires SENDGRID_API_KEY)
// export {
//     sendWelcomeEmail,
//     sendWeeklySummaryEmails,
//     sendLeagueInvitationEmail
// } from './emails';

// Admin & roles
export {
    assignAdminRole,
    removeAdminRole,
    banUserSecure
} from './admin';

// Referral System
export {
    generateReferralCode,
    applyReferralCode
} from './referrals';

// Admin Broadcast Notifications
export {
    sendBroadcastNotification,
    processScheduledBroadcasts,
    getBroadcastHistory
} from './broadcast';
