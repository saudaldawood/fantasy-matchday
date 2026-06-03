/**
 * Admin Role-Based Access Control & Management
 * Cloud Functions for managing admins and sensitive operations
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();

type AdminRole = 'super_admin' | 'match_admin' | 'user_admin' | 'content_admin';

interface AdminClaims {
    admin: boolean;
    role: AdminRole;
}

/**
 * Assign an admin role to a user (Super Admin only)
 */
export const assignAdminRole = functions.https.onCall(
    async (data: { targetUserId: string; role: AdminRole }, context) => {
        // Verify caller is authenticated
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
        }

        const callerUid = context.auth.uid;
        const { targetUserId, role } = data;

        try {
            // Check if caller is super_admin
            // For the VERY first admin, we might need a manual db triggers or CLI command
            // Here we assume the caller has the custom claim 'role' === 'super_admin'
            const callerUser = await auth.getUser(callerUid);
            const callerClaims = callerUser.customClaims as Partial<AdminClaims>;

            if (callerClaims?.role !== 'super_admin') {
                // Temporary backdoor for development: Allow if specific email (e.g. dev email)
                // In production, REMOVE THIS
                if (callerUser.email !== 'admin@fantasymatchday.com') {
                    throw new functions.https.HttpsError('permission-denied', 'Only Super Admins can assign roles');
                }
            }

            // Set custom user claims
            await auth.setCustomUserClaims(targetUserId, {
                admin: true,
                role: role
            });

            // Update user document to reflect admin status (for UI)
            await db.collection('users').doc(targetUserId).update({
                isAdmin: true,
                adminRole: role,
                adminSince: admin.firestore.FieldValue.serverTimestamp()
            });

            // Log action
            await db.collection('adminActions').add({
                type: 'assign_role',
                callerUid,
                targetUserId,
                assignedRole: role,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            return { success: true, message: `Role ${role} assigned to user` };

        } catch (error) {
            console.error('Error assigning admin role:', error);
            throw new functions.https.HttpsError('internal', 'Failed to assign role');
        }
    }
);

/**
 * Remove admin role (Super Admin only)
 */
export const removeAdminRole = functions.https.onCall(
    async (data: { targetUserId: string }, context) => {
        if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Auth required');

        const callerUid = context.auth.uid;

        const callerUser = await auth.getUser(callerUid);
        const callerClaims = callerUser.customClaims as Partial<AdminClaims>;

        if (callerClaims?.role !== 'super_admin' && callerUser.email !== 'admin@fantasymatchday.com') {
            throw new functions.https.HttpsError('permission-denied', 'Only Super Admins can remove roles');
        }

        try {
            await auth.setCustomUserClaims(data.targetUserId, { admin: false, role: null });

            await db.collection('users').doc(data.targetUserId).update({
                isAdmin: false,
                adminRole: admin.firestore.FieldValue.delete(),
                adminRemovedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            return { success: true };
        } catch (error) {
            throw new functions.https.HttpsError('internal', 'Failed to remove role');
        }
    }
);

/**
 * Securely Ban User (User Admin or Super Admin)
 */
export const banUserSecure = functions.https.onCall(
    async (data: { targetUserId: string; reason: string }, context) => {
        if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Auth required');

        const callerUser = await auth.getUser(context.auth.uid);
        const role = (callerUser.customClaims as Partial<AdminClaims>)?.role;

        if (role !== 'super_admin' && role !== 'user_admin') {
            throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
        }

        try {
            // Disable auth
            await auth.updateUser(data.targetUserId, { disabled: true });

            // Update doc
            await db.collection('users').doc(data.targetUserId).update({
                status: 'banned',
                bannedAt: admin.firestore.FieldValue.serverTimestamp(),
                banReason: data.reason
            });

            return { success: true };
        } catch (error) {
            throw new functions.https.HttpsError('internal', 'Failed to ban user');
        }
    }
);

/**
 * Helper to verify role in other functions (usage example)
 */
export async function verifyAdminRole(uid: string, requiredRoles: AdminRole[]) {
    const user = await auth.getUser(uid);
    const role = (user.customClaims as Partial<AdminClaims>)?.role;
    return role && requiredRoles.includes(role);
}
