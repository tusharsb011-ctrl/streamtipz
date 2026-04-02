// ==========================================
// Profile Service
// ==========================================
// Handles profile retrieval and updates.
// Operates on the `profiles` table.
// ==========================================

import supabase from '../config/supabase';
import { UpdateProfilePayload, ApiResponse } from '../types';

export class ProfileService {
    /**
     * Fetch the profile for the authenticated user.
     */
    static async getProfile(userId: string): Promise<ApiResponse> {
        const { data, error } = await supabase
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
            data: { profile: data },
        };
    }

    /**
     * Fetch a public profile by username (for tip page).
     */
    static async getPublicProfile(username: string): Promise<ApiResponse> {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, username')
            .eq('username', username)
            .single();

        if (error) {
            return {
                success: false,
                error: 'Creator not found',
            };
        }

        return {
            success: true,
            data: { profile: data },
        };
    }

    /**
     * Update the authenticated user's profile.
     * Only updates the fields provided in the payload.
     */
    static async updateProfile(
        userId: string,
        payload: UpdateProfilePayload
    ): Promise<ApiResponse> {
        // Build update object with only provided fields
        const updateData: Record<string, string> = {};

        if (payload.full_name !== undefined) updateData.full_name = payload.full_name;
        if (payload.avatar_url !== undefined) updateData.avatar_url = payload.avatar_url;
        if (payload.username !== undefined) updateData.username = payload.username;

        if (Object.keys(updateData).length === 0) {
            return {
                success: false,
                error: 'No fields to update',
            };
        }

        // Check username uniqueness if being updated
        if (updateData.username) {
            const { data: existing } = await supabase
                .from('profiles')
                .select('id')
                .eq('username', updateData.username)
                .neq('id', userId)
                .single();

            if (existing) {
                return {
                    success: false,
                    error: 'Username already taken',
                };
            }
        }

        const { data, error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            return {
                success: false,
                error: `Profile update failed: ${error.message}`,
            };
        }

        return {
            success: true,
            data: { profile: data },
            message: 'Profile updated successfully',
        };
    }
}
