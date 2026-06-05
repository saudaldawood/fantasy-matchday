import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    sendPasswordResetEmail,
    updateProfile,
    User,
    UserCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, getDocFromServer, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserProfile } from '@/types/app';

/**
 * Register new user with email and password
 */
export async function registerWithEmail(
    email: string,
    password: string,
    displayName: string
): Promise<UserCredential> {
    try {
        // Create auth user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Update displayName
        await updateProfile(userCredential.user, { displayName });

        // Create user profile in Firestore
        await createUserProfile(userCredential.user, displayName);

        return userCredential;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(
    email: string,
    password: string
): Promise<UserCredential> {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // Update last login
        await updateUserLastLogin(userCredential.user.uid);

        return userCredential;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

/**
 * Sign in with Google OAuth
 * Uses popup on desktop and redirect on mobile
 */
export async function signInWithGoogle(): Promise<UserCredential | null> {
    try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({
            prompt: 'select_account'
        });

        // Detect if on mobile
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        let userCredential: UserCredential;

        if (isMobile) {
            // Use redirect for mobile (popup blockers are common)
            await signInWithRedirect(auth, provider);
            // The page will redirect, so we won't reach here
            return null;
        } else {
            // Use popup for desktop
            userCredential = await signInWithPopup(auth, provider);
        }

        // Check if profile exists, create if not
        const profileExists = await checkUserProfileExists(userCredential.user.uid);
        if (!profileExists) {
            await createUserProfile(userCredential.user, userCredential.user.displayName || 'User');
        } else {
            await updateUserLastLogin(userCredential.user.uid);
        }

        return userCredential;
    } catch (error: any) {
        console.error('[Auth] Google sign-in error:', error);
        throw new Error(error.message);
    }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
    try {
        await firebaseSignOut(auth);
    } catch (error: any) {
        throw new Error(error.message);
    }
}

/**
 * Handle Google redirect result (for mobile)
 * Call this on app initialization to complete mobile Google sign-in
 */
export async function handleGoogleRedirectResult(): Promise<UserCredential | null> {
    try {
        const result = await getRedirectResult(auth);
        if (result) {
            console.log('[Auth] Google redirect result received');
            // Check if profile exists, create if not
            const profileExists = await checkUserProfileExists(result.user.uid);
            if (!profileExists) {
                await createUserProfile(result.user, result.user.displayName || 'User');
            } else {
                await updateUserLastLogin(result.user.uid);
            }
            return result;
        }
        return null;
    } catch (error: any) {
        console.error('[Auth] Google redirect error:', error);
        throw new Error(error.message);
    }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
        throw new Error(error.message);
    }
}

/**
 * Create user profile in Firestore
 */
async function createUserProfile(user: User, displayName: string): Promise<void> {
    const userProfile: Partial<UserProfile> = {
        id: user.uid,
        email: user.email || '',
        displayName,
        language: 'ar', // Default to Arabic
        notificationSettings: {
            pushEnabled: true,
            emailEnabled: true,
            smsEnabled: false,
            matchReminders: true,
            matchResults: true,
            rankChanges: true,
            achievements: true,
            leagueUpdates: true,
            marketing: false,
        },
        totalPoints: 0,
        matchesPlayed: 0,
        averagePointsPerMatch: 0,
        bestMatchScore: 0,
        worstMatchScore: 0,
        credits: 100, // Welcome bonus
        isPremium: false,
        level: 1,
        achievements: [],
        badges: [],
        loginStreak: 1,
        lastLoginDate: new Date(),
        friends: [],
        leagues: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        lastActiveAt: new Date(),
        isActive: true,
        isBanned: false,
    };

    await setDoc(doc(db, 'users', user.uid), {
        ...userProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastActiveAt: serverTimestamp(),
        lastLoginDate: serverTimestamp(),
    });
}

/**
 * Check if user profile exists
 */
async function checkUserProfileExists(userId: string): Promise<boolean> {
    const docRef = doc(db, 'users', userId);
    try {
        // Try to get from server first
        const docSnap = await getDocFromServer(docRef);
        return docSnap.exists();
    } catch {
        // Fallback to cache if offline
        const docSnap = await getDoc(docRef);
        return docSnap.exists();
    }
}

/**
 * Update user last login timestamp
 */
async function updateUserLastLogin(userId: string): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
        lastLoginDate: serverTimestamp(),
        lastActiveAt: serverTimestamp(),
    });
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
        const docRef = doc(db, 'users', userId);
        let docSnap;

        try {
            // Try to get from server first
            docSnap = await getDocFromServer(docRef);
        } catch {
            // Fallback to cache if offline
            docSnap = await getDoc(docRef);
        }

        if (docSnap.exists()) {
            return docSnap.data() as UserProfile;
        }
        return null;
    } catch (error: any) {
        console.error('Error getting user profile:', error.message);
        return null; // Return null instead of throwing to prevent UI crashes
    }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>
): Promise<void> {
    try {
        await updateDoc(doc(db, 'users', userId), {
            ...updates,
            updatedAt: serverTimestamp(),
        });
    } catch (error: any) {
        throw new Error(error.message);
    }
}
