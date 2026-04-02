// ==========================================
// Tips Service
// ==========================================
// Handles sending and retrieving tips.
// All payments go to the platform's main Razorpay
// account first, then creator's share is routed.
// QR code payment codes identify the creator.
// ==========================================

import supabase from '../config/supabase';
import { SendTipPayload, ApiResponse } from '../types';
import { razorpay } from '../config/razorpay';
import { NotificationService } from './notification.service';
import crypto from 'crypto';

// Platform commission percentage (10% by default)
const PLATFORM_COMMISSION_PERCENT = parseInt(process.env.PLATFORM_COMMISSION_PERCENT || '10', 10);

export class TipsService {
    /**
     * Create a Razorpay tip order (PUBLIC).
     * Payment goes to the PLATFORM's main Razorpay account.
     * The payment_code identifies which creator should receive the payout.
     */
    static async createOrder(payload: SendTipPayload & { payment_code?: string; sender_id?: string }): Promise<ApiResponse> {
        const { creator_id, sender_name, message, amount, payment_code, sender_id } = payload;

        if (amount <= 0) {
            return {
                success: false,
                error: 'Tip amount must be greater than 0',
            };
        }

        // Validate creator exists
        const { data: creator, error: creatorError } = await supabase
            .from('profiles')
            .select('id, full_name, username')
            .eq('id', creator_id)
            .single();

        if (creatorError || !creator) {
            return {
                success: false,
                error: 'Creator not found',
            };
        }

        // If payment_code provided, validate it belongs to the creator
        if (payment_code) {
            const { data: codeRecord } = await supabase
                .from('payment_codes')
                .select('creator_id')
                .eq('code', payment_code.toUpperCase())
                .eq('is_active', true)
                .single();

            if (!codeRecord || codeRecord.creator_id !== creator_id) {
                return { success: false, error: 'Invalid payment code for this creator' };
            }
        }

        try {
            const amountInPaise = Math.round(amount * 100);
            const commission = Math.round(amountInPaise * PLATFORM_COMMISSION_PERCENT / 100);
            const creatorEarnings = amountInPaise - commission;

            // Create order on PLATFORM'S main Razorpay account
            const order = await razorpay.orders.create({
                amount: amountInPaise,
                currency: 'INR',
                notes: {
                    creator_id,
                    sender_name: sender_name || 'Anonymous',
                    sender_id: sender_id || '',
                    message: message || '',
                    payment_code: payment_code || '',
                    platform_fee_paise: commission.toString(),
                    creator_earnings_paise: creatorEarnings.toString(),
                }
            });

            return {
                success: true,
                data: {
                    order_id: order.id,
                    amount: amountInPaise,
                    currency: 'INR',
                    commission: commission / 100,
                    creator_earnings: creatorEarnings / 100,
                    commission_percent: PLATFORM_COMMISSION_PERCENT,
                }
            };
        } catch (error: any) {
            console.error('Razorpay order creation failed:', error);
            return { success: false, error: 'Failed to create payment order' };
        }
    }

    /**
     * Verify Razorpay payment, record the tip, calculate commission,
     * and notify the creator (PUBLIC).
     * 
     * Payment flow:
     * 1. Fan pays → money goes to Platform's Razorpay account
     * 2. Backend verifies signature
     * 3. Tip is recorded in Supabase with commission breakdown
     * 4. Creator is notified about the received tip
     * 5. (Future) Platform triggers payout to creator's bank/UPI
     */
    static async verifyPayment(payload: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
    }): Promise<ApiResponse> {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = payload;

        // 1. Verify Razorpay signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return { success: false, error: 'Invalid payment signature' };
        }

        try {
            // 2. Fetch the order to get tip details securely from Razorpay
            const order = await razorpay.orders.fetch(razorpay_order_id);
            const notes = order.notes as any;
            const { creator_id, sender_name, sender_id, message, payment_code } = notes;
            const amount = Number(order.amount) / 100;

            // 3. Calculate commission split
            const platformFee = Math.round(amount * PLATFORM_COMMISSION_PERCENT) / 100;
            const creatorEarnings = Math.round((amount - platformFee) * 100) / 100;

            // 4. Insert tip into Supabase with commission details
            const { data: tip, error: tipError } = await supabase
                .from('tips')
                .insert({
                    creator_id,
                    sender_name,
                    sender_id: sender_id || null,
                    message: message || null,
                    amount,
                    payment_code: payment_code || null,
                    platform_fee: platformFee,
                    creator_earnings: creatorEarnings,
                    razorpay_order_id,
                    razorpay_payment_id,
                    status: 'verified',
                })
                .select()
                .single();

            if (tipError) {
                return { success: false, error: `Failed to record tip: ${tipError.message}` };
            }

            // 5. Notify the creator about the payment
            await NotificationService.createTipNotification(
                creator_id,
                tip.id,
                sender_name || 'Anonymous',
                amount,
                payment_code || undefined
            );

            console.log(`✅ Tip verified: ₹${amount} → Creator ${creator_id} (Fee: ₹${platformFee}, Earnings: ₹${creatorEarnings})`);

            return {
                success: true,
                data: {
                    tip,
                    breakdown: {
                        total_amount: amount,
                        platform_fee: platformFee,
                        creator_earnings: creatorEarnings,
                        commission_percent: PLATFORM_COMMISSION_PERCENT,
                    },
                },
                message: 'Payment verified, tip recorded, and creator notified!',
            };
        } catch (error: any) {
            console.error('Razorpay payment verification failed:', error);
            return { success: false, error: 'Failed to verify payment and record tip' };
        }
    }

    /**
     * Get all tips for the authenticated creator.
     * Supports pagination (limit + offset) and sorting.
     */
    static async getMyTips(
        creatorId: string,
        options: { limit?: number; offset?: number } = {}
    ): Promise<ApiResponse> {
        const { limit = 50, offset = 0 } = options;

        const { data: tips, error, count } = await supabase
            .from('tips')
            .select('*', { count: 'exact' })
            .eq('creator_id', creatorId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            return {
                success: false,
                error: `Failed to fetch tips: ${error.message}`,
            };
        }

        return {
            success: true,
            data: {
                tips,
                pagination: {
                    total: count,
                    limit,
                    offset,
                    has_more: count ? offset + limit < count : false,
                },
            },
        };
    }

    /**
     * Get tip statistics for the authenticated creator.
     * Now includes commission breakdown.
     */
    static async getTipStats(creatorId: string): Promise<ApiResponse> {
        const { data: tips, error } = await supabase
            .from('tips')
            .select('amount, platform_fee, creator_earnings')
            .eq('creator_id', creatorId);

        if (error) {
            return {
                success: false,
                error: `Failed to fetch stats: ${error.message}`,
            };
        }

        const totalTips = tips.length;
        const totalAmount = tips.reduce((sum, tip) => sum + Number(tip.amount), 0);
        const totalPlatformFee = tips.reduce((sum, tip) => sum + Number(tip.platform_fee || 0), 0);
        const totalCreatorEarnings = tips.reduce((sum, tip) => sum + Number(tip.creator_earnings || tip.amount), 0);
        const avgAmount = totalTips > 0 ? totalAmount / totalTips : 0;

        return {
            success: true,
            data: {
                stats: {
                    total_tips: totalTips,
                    total_amount: Math.round(totalAmount * 100) / 100,
                    total_platform_fee: Math.round(totalPlatformFee * 100) / 100,
                    total_creator_earnings: Math.round(totalCreatorEarnings * 100) / 100,
                    average_amount: Math.round(avgAmount * 100) / 100,
                    commission_percent: PLATFORM_COMMISSION_PERCENT,
                },
            },
        };
    }
}
