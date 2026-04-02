// ==========================================
// Payment Code Service
// ==========================================
// Handles generation, resolution, and management
// of unique payment codes linked to creators.
// Each QR code contains a unique code that maps
// to a creator + optional tip metadata.
// ==========================================

import supabase from '../config/supabase';
import { ApiResponse } from '../types';
import crypto from 'crypto';

/**
 * Generate a unique 8-character alphanumeric code.
 */
function generateCode(): string {
    return crypto.randomBytes(4).toString('hex').toUpperCase(); // e.g., "A3F2B1C8"
}

export class PaymentCodeService {
    /**
     * Create a new payment code linked to a creator.
     * Optionally set a pre-filled amount and message template.
     */
    static async createCode(
        creatorId: string,
        options: { amount?: number; message_template?: string } = {}
    ): Promise<ApiResponse> {
        // Validate creator exists
        const { data: creator, error: creatorError } = await supabase
            .from('profiles')
            .select('id, full_name, username')
            .eq('id', creatorId)
            .single();

        if (creatorError || !creator) {
            return { success: false, error: 'Creator not found' };
        }

        // Generate unique code (retry up to 5 times for collision)
        let code = '';
        let attempts = 0;
        while (attempts < 5) {
            code = generateCode();
            const { data: existing } = await supabase
                .from('payment_codes')
                .select('id')
                .eq('code', code)
                .single();

            if (!existing) break;
            attempts++;
        }

        if (attempts >= 5) {
            return { success: false, error: 'Failed to generate unique code. Please try again.' };
        }

        const { data, error } = await supabase
            .from('payment_codes')
            .insert({
                code,
                creator_id: creatorId,
                amount: options.amount || null,
                message_template: options.message_template || null,
                is_active: true,
            })
            .select()
            .single();

        if (error) {
            return { success: false, error: `Failed to create payment code: ${error.message}` };
        }

        return {
            success: true,
            data: {
                code: data.code,
                payment_code: data,
                creator: {
                    id: creator.id,
                    full_name: creator.full_name,
                    username: creator.username,
                },
            },
            message: 'Payment code created successfully',
        };
    }

    /**
     * Resolve a payment code to its creator and metadata.
     * This is called when a fan scans a QR code.
     */
    static async resolveCode(code: string): Promise<ApiResponse> {
        const { data: paymentCode, error } = await supabase
            .from('payment_codes')
            .select('*')
            .eq('code', code.toUpperCase())
            .eq('is_active', true)
            .single();

        if (error || !paymentCode) {
            return { success: false, error: 'Invalid or expired payment code' };
        }

        // Fetch creator profile
        const { data: creator, error: creatorError } = await supabase
            .from('profiles')
            .select('id, full_name, username, avatar_url')
            .eq('id', paymentCode.creator_id)
            .single();

        if (creatorError || !creator) {
            return { success: false, error: 'Creator associated with this code not found' };
        }

        return {
            success: true,
            data: {
                code: paymentCode.code,
                creator: {
                    id: creator.id,
                    full_name: creator.full_name,
                    username: creator.username,
                    avatar_url: creator.avatar_url,
                },
                preset_amount: paymentCode.amount,
                message_template: paymentCode.message_template,
            },
        };
    }

    /**
     * Get all payment codes for a creator.
     */
    static async getCreatorCodes(creatorId: string): Promise<ApiResponse> {
        const { data: codes, error } = await supabase
            .from('payment_codes')
            .select('*')
            .eq('creator_id', creatorId)
            .order('created_at', { ascending: false });

        if (error) {
            return { success: false, error: `Failed to fetch codes: ${error.message}` };
        }

        return {
            success: true,
            data: { codes },
        };
    }

    /**
     * Deactivate a payment code.
     */
    static async deactivateCode(creatorId: string, code: string): Promise<ApiResponse> {
        const { data, error } = await supabase
            .from('payment_codes')
            .update({ is_active: false })
            .eq('code', code.toUpperCase())
            .eq('creator_id', creatorId)
            .select()
            .single();

        if (error) {
            return { success: false, error: `Failed to deactivate code: ${error.message}` };
        }

        return {
            success: true,
            data: { code: data },
            message: 'Payment code deactivated',
        };
    }
}
