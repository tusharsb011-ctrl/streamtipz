// ==========================================
// Creator Settings Service
// ==========================================
// Handles creator settings (UPI, alerts, etc.)
// Operates on the `creator_settings` table.
// ==========================================

import supabase from '../config/supabase';
import { UpdateCreatorSettingsPayload, ApiResponse } from '../types';

export class CreatorService {
    /**
     * Fetch settings for the authenticated creator.
     */
    static async getSettings(creatorId: string): Promise<ApiResponse> {
        const { data, error } = await supabase
            .from('creator_settings')
            .select('*')
            .eq('creator_id', creatorId)
            .single();

        if (error) {
            // If no settings exist yet, create default ones
            if (error.code === 'PGRST116') {
                const { data: newSettings, error: createError } = await supabase
                    .from('creator_settings')
                    .insert({ creator_id: creatorId })
                    .select()
                    .single();

                if (createError) {
                    return {
                        success: false,
                        error: `Failed to create settings: ${createError.message}`,
                    };
                }

                return {
                    success: true,
                    data: { settings: newSettings },
                };
            }

            return {
                success: false,
                error: `Failed to fetch settings: ${error.message}`,
            };
        }

        return {
            success: true,
            data: { settings: data },
        };
    }

    /**
     * Update creator settings.
     * Only updates the fields provided in the payload.
     */
    static async updateSettings(
        creatorId: string,
        payload: UpdateCreatorSettingsPayload
    ): Promise<ApiResponse> {
        const updateData: Record<string, string> = {};

        if (payload.upi_id !== undefined) updateData.upi_id = payload.upi_id;
        if (payload.alert_sound !== undefined) updateData.alert_sound = payload.alert_sound;
        if (payload.alert_theme !== undefined) updateData.alert_theme = payload.alert_theme;

        if (Object.keys(updateData).length === 0) {
            return {
                success: false,
                error: 'No fields to update',
            };
        }

        // Upsert — if row doesn't exist, create it
        const { data, error } = await supabase
            .from('creator_settings')
            .upsert({
                creator_id: creatorId,
                ...updateData,
            })
            .select()
            .single();

        if (error) {
            return {
                success: false,
                error: `Failed to update settings: ${error.message}`,
            };
        }

        return {
            success: true,
            data: { settings: data },
            message: 'Creator settings updated successfully',
        };
    }
}
