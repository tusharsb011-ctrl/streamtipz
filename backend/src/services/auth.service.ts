// ==========================================
// Authentication Service
// ==========================================
// Handles signup, login, and session retrieval
// using Supabase Auth.
// ==========================================

import supabase from '../config/supabase';
import { SignupPayload, LoginPayload, ApiResponse, Profile } from '../types';

export class AuthService {
    /**
     * Sign up a new user with email & password.
     * Also creates a profile row in the `profiles` table.
     */
    static async signup(payload: SignupPayload): Promise<ApiResponse> {
        const { email, password, full_name, username } = payload;

        // 1. Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm for dev; remove in production SMTP setup
            user_metadata: { full_name, username },
        });

        if (authError) {
            return {
                success: false,
                error: authError.message,
            };
        }

        if (!authData.user) {
            return {
                success: false,
                error: 'User creation failed',
            };
        }

        // 2. Create profile row (linked to auth.users via id)
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: authData.user.id,
                email,
                full_name: full_name || null,
                username: username || null,
            });

        if (profileError) {
            console.error('Profile creation error:', profileError.message);
            // Don't fail signup if profile creation fails — it can be retried
        }

        // 3. Create default creator_settings row
        const { error: settingsError } = await supabase
            .from('creator_settings')
            .insert({
                creator_id: authData.user.id,
            });

        if (settingsError) {
            console.error('Creator settings creation error:', settingsError.message);
        }

        return {
            success: true,
            data: {
                user: {
                    id: authData.user.id,
                    email: authData.user.email,
                },
            },
            message: 'User registered successfully',
        };
    }

    /**
     * Login with email & password.
     * Returns access_token and refresh_token.
     */
    static async login(payload: LoginPayload): Promise<ApiResponse> {
        const { email, password } = payload;

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return {
                success: false,
                error: error.message,
            };
        }

        return {
            success: true,
            data: {
                user: {
                    id: data.user.id,
                    email: data.user.email,
                },
                session: {
                    access_token: data.session.access_token,
                    refresh_token: data.session.refresh_token,
                    expires_in: data.session.expires_in,
                    expires_at: data.session.expires_at,
                },
            },
            message: 'Login successful',
        };
    }

    /**
     * Get current user info by token.
     * Also fetches the profile from `profiles` table.
     */
    static async getMe(userId: string): Promise<ApiResponse> {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            return {
                success: false,
                error: 'Profile not found',
            };
        }

        return {
            success: true,
            data: { profile },
        };
    }
}
