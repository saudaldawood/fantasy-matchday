'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserProfile, handleGoogleRedirectResult } from '@/services/auth';
import type { UserProfile } from '@/types/app';

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    error: string | null;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    error: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check for Google redirect result (mobile sign-in)
        handleGoogleRedirectResult().catch((err) => {
            console.error('[Auth] Redirect result check failed:', err);
        });

        const unsubscribe = onAuthStateChanged(
            auth,
            async (firebaseUser) => {
                console.log('[Auth] Auth state changed:', firebaseUser?.email || 'logged out');
                setUser(firebaseUser);
                setError(null);

                if (firebaseUser) {
                    try {
                        // Try to fetch user profile from Firestore
                        const userProfile = await getUserProfile(firebaseUser.uid);
                        console.log('[Auth] Profile loaded:', userProfile ? 'success' : 'not found');
                        setProfile(userProfile);
                    } catch (err: any) {
                        // Profile fetch failed, but user is still authenticated
                        console.error('[Auth] Profile fetch error:', err.message);
                        setProfile(null);
                        // Don't set error - user is still logged in
                    }
                } else {
                    setProfile(null);
                }

                setLoading(false);
            },
            (err) => {
                console.error('[Auth] Auth error:', err.message);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, profile, loading, error }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
