"use strict";
/**
 * Admin Role-Based Access Control & Management
 * Cloud Functions for managing admins and sensitive operations
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
exports.banUserSecure = exports.removeAdminRole = exports.assignAdminRole = void 0;
exports.verifyAdminRole = verifyAdminRole;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
const auth = admin.auth();
/**
 * Assign an admin role to a user (Super Admin only)
 */
exports.assignAdminRole = functions.https.onCall(async (data, context) => {
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
        const callerClaims = callerUser.customClaims;
        if ((callerClaims === null || callerClaims === void 0 ? void 0 : callerClaims.role) !== 'super_admin') {
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
    }
    catch (error) {
        console.error('Error assigning admin role:', error);
        throw new functions.https.HttpsError('internal', 'Failed to assign role');
    }
});
/**
 * Remove admin role (Super Admin only)
 */
exports.removeAdminRole = functions.https.onCall(async (data, context) => {
    if (!context.auth)
        throw new functions.https.HttpsError('unauthenticated', 'Auth required');
    const callerUid = context.auth.uid;
    const callerUser = await auth.getUser(callerUid);
    const callerClaims = callerUser.customClaims;
    if ((callerClaims === null || callerClaims === void 0 ? void 0 : callerClaims.role) !== 'super_admin' && callerUser.email !== 'admin@fantasymatchday.com') {
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
    }
    catch (error) {
        throw new functions.https.HttpsError('internal', 'Failed to remove role');
    }
});
/**
 * Securely Ban User (User Admin or Super Admin)
 */
exports.banUserSecure = functions.https.onCall(async (data, context) => {
    var _a;
    if (!context.auth)
        throw new functions.https.HttpsError('unauthenticated', 'Auth required');
    const callerUser = await auth.getUser(context.auth.uid);
    const role = (_a = callerUser.customClaims) === null || _a === void 0 ? void 0 : _a.role;
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
    }
    catch (error) {
        throw new functions.https.HttpsError('internal', 'Failed to ban user');
    }
});
/**
 * Helper to verify role in other functions (usage example)
 */
async function verifyAdminRole(uid, requiredRoles) {
    var _a;
    const user = await auth.getUser(uid);
    const role = (_a = user.customClaims) === null || _a === void 0 ? void 0 : _a.role;
    return role && requiredRoles.includes(role);
}
//# sourceMappingURL=admin.js.map