"use strict";
/**
 * Email Notification Cloud Functions
 * Handles sending transactional and campaign emails using SendGrid
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
exports.sendLeagueInvitationEmail = exports.sendWeeklySummaryEmails = exports.sendWelcomeEmail = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const sgMail = __importStar(require("@sendgrid/mail"));
const params_1 = require("firebase-functions/params");
// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
// Define secrets
const sendgridApiKey = (0, params_1.defineSecret)('SENDGRID_API_KEY');
/**
 * Helper to send email via SendGrid
 */
async function sendEmail(data) {
    const apiKey = sendgridApiKey.value();
    if (!apiKey) {
        console.warn('SendGrid API key not found. Email would have been sent:', data);
        return;
    }
    sgMail.setApiKey(apiKey);
    // Build email message - SendGrid accepts html/text directly
    const msg = {
        to: data.to,
        from: 'Fantasy Matchday <noreply@fantasymatchday.com>',
        subject: data.subject,
    };
    if (data.text)
        msg.text = data.text;
    if (data.html)
        msg.html = data.html;
    if (data.templateId)
        msg.templateId = data.templateId;
    if (data.dynamicTemplateData)
        msg.dynamicTemplateData = data.dynamicTemplateData;
    try {
        await sgMail.send(msg);
        console.log(`Email sent to ${data.to}`);
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}
/**
 * Send welcome email on new user signup
 */
exports.sendWelcomeEmail = functions.firestore
    .document('users/{userId}')
    .onCreate(async (snapshot, context) => {
    const userData = snapshot.data();
    const email = userData.email;
    const name = userData.displayName || 'Fan';
    if (!email) {
        console.log('No email for user, skipping welcome email');
        return null;
    }
    return sendEmail({
        to: email,
        subject: 'Welcome to Fantasy Matchday! ⚽',
        html: `
                <h1>Welcome, ${name}!</h1>
                <p>Thank you for joining Fantasy Matchday. We're excited to have you on board.</p>
                <p>Get started by creating your first lineup for the upcoming matches!</p>
                <br>
                <a href="https://fantasymatchday.com" style="background-color: #00A651; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Play Now</a>
            `,
        // templateId: 'd-welcome-template-id' // Use template in production
    });
});
/**
 * Send weekly summary email
 * Scheduled every Monday morning
 */
exports.sendWeeklySummaryEmails = functions.pubsub
    .schedule('every monday 09:00')
    .timeZone('Asia/Riyadh')
    .onRun(async () => {
    try {
        // Get active users who have enabled email notifications
        // In production, batch this process
        const usersSnapshot = await db.collection('users')
            .where('emailNotifications', '==', true)
            .limit(500) // Limit for safety in this function
            .get();
        console.log(`Sending weekly summaries to ${usersSnapshot.size} users`);
        for (const userDoc of usersSnapshot.docs) {
            const user = userDoc.data();
            if (!user.email)
                continue;
            // Provide a basic summary (mock data usually populated from a weekly stats aggregation)
            const points = user.lastWeekPoints || 0;
            const rank = user.lastWeekRank || '-';
            await sendEmail({
                to: user.email,
                subject: 'Your Weekly Matchday Summary 📊',
                html: `
                        <h2>Weekly Report</h2>
                        <p>Hi ${user.displayName || 'Fan'}, here is how you performed last week:</p>
                        <ul>
                            <li><strong>Points Earned:</strong> ${points}</li>
                            <li><strong>Weekly Rank:</strong> ${rank}</li>
                        </ul>
                        <p>Check out the upcoming matches and set your lineup!</p>
                    `
            });
        }
        return null;
    }
    catch (error) {
        console.error('Error sending weekly emails:', error);
        return null;
    }
});
/**
 * Send league invitation email
 */
exports.sendLeagueInvitationEmail = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { email, leagueName, inviteCode } = data;
    const inviterName = context.auth.token.name || 'A friend';
    return sendEmail({
        to: email,
        subject: `${inviterName} invited you to join a league! 🏆`,
        html: `
                <h2>League Invitation</h2>
                <p><strong>${inviterName}</strong> has invited you to join their league <strong>"${leagueName}"</strong>.</p>
                <p>Use this code to join:</p>
                <h1 style="background: #f0f0f0; padding: 10px; display: inline-block;">${inviteCode}</h1>
                <br><br>
                <a href="https://fantasymatchday.com/leagues/join?code=${inviteCode}">Join League</a>
            `
    });
});
//# sourceMappingURL=emails.js.map