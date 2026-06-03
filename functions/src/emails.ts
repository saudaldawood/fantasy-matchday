/**
 * Email Notification Cloud Functions
 * Handles sending transactional and campaign emails using SendGrid
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as sgMail from '@sendgrid/mail';
import { defineSecret } from 'firebase-functions/params';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

// Define secrets
const sendgridApiKey = defineSecret('SENDGRID_API_KEY');

interface EmailData {
    to: string;
    subject: string;
    text?: string;
    html?: string;
    templateId?: string;
    dynamicTemplateData?: Record<string, any>;
}

/**
 * Helper to send email via SendGrid
 */
async function sendEmail(data: EmailData) {
    const apiKey = sendgridApiKey.value();
    if (!apiKey) {
        console.warn('SendGrid API key not found. Email would have been sent:', data);
        return;
    }

    sgMail.setApiKey(apiKey);

    // Build email message - SendGrid accepts html/text directly
    const msg: any = {
        to: data.to,
        from: 'Fantasy Matchday <noreply@fantasymatchday.com>',
        subject: data.subject,
    };

    if (data.text) msg.text = data.text;
    if (data.html) msg.html = data.html;
    if (data.templateId) msg.templateId = data.templateId;
    if (data.dynamicTemplateData) msg.dynamicTemplateData = data.dynamicTemplateData;

    try {
        await sgMail.send(msg);
        console.log(`Email sent to ${data.to}`);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

/**
 * Send welcome email on new user signup
 */
export const sendWelcomeEmail = functions.firestore
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
export const sendWeeklySummaryEmails = functions.pubsub
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
                if (!user.email) continue;

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
        } catch (error) {
            console.error('Error sending weekly emails:', error);
            return null;
        }
    });

/**
 * Send league invitation email
 */
export const sendLeagueInvitationEmail = functions.https.onCall(
    async (data: { email: string; leagueName: string; inviteCode: string }, context) => {
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
    }
);
