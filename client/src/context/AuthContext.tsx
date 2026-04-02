'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

type AuthContextType = {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signOut: async () => { },
});

/**
 * Ensure a profile row exists for the given user.
 * Runs silently — won't break auth if it fails.
 */
async function ensureProfile(user: User) {
    try {
        const meta = user.user_metadata || {};
        // Extract username: prefer explicit username, fallback to email prefix
        let username = meta.username || meta.preferred_username || null;
        // If username looks like an email, strip the domain
        if (username && username.includes('@')) {
            username = username.split('@')[0];
        }
        // Final fallback: use email prefix
        if (!username) {
            username = user.email?.split('@')[0] || null;
        }
        const full_name = meta.full_name || meta.name || username || null;
        const avatar_url = meta.avatar_url || meta.picture || null;

        // Get role: from metadata (email signup), or from localStorage (Google signup)
        let role = meta.role || null;
        if (!role && typeof window !== 'undefined') {
            const pendingRole = localStorage.getItem('pending_role');
            if (pendingRole) {
                role = pendingRole;
                localStorage.removeItem('pending_role');
            }
        }

        await supabase.from('profiles').upsert({
            id: user.id,
            email: user.email || '',
            username: username,
            full_name: full_name,
            avatar_url: avatar_url,
            ...(role ? { role } : {}),
        }, { onConflict: 'id' });
    } catch (err) {
        // Silently fail — profile creation is best-effort
        console.error('Profile ensure error:', err);
    }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active sessions and set the user
        const setData = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                console.error('Error getting session:', error.message);
            }
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);

            // Ensure profile exists for authenticated users
            if (session?.user) {
                ensureProfile(session.user);
            }
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);

                // Ensure profile on sign-in events
                if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
                    ensureProfile(session.user);
                }
            }
        );

        setData();

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.error('Error signing out:', error.message);
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
