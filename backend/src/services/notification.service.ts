// ==========================================
// Notification Service
// ==========================================
// Handles creating and fetching notifications
// for creators when tips are received.
// ==========================================

import supabase from '../config/supabase';
import { ApiResponse } from '../types';

export class NotificationService {
    /**
     * Create a notification for a creator when a tip is received.
     */
    static async createTipNotification(
        creatorId: string,
        tipId: number,
        senderName: string,
        amount: number,
        paymentCode?: string
    ): Promise<ApiResponse> {
        const message = `💸 ${senderName} sent you ₹${amount.toLocaleString('en-IN')}${paymentCode ? ` via code ${paymentCode}` : ''}!`;

        const { data, error } = await supabase
            .from('payment_notifications')
            .insert({
                creator_id: creatorId,
                tip_id: tipId,
                type: 'tip_received',
                message,
                is_read: false,
            })
            .select()
            .single();

        if (error) {
            console.error('Failed to create notification:', error.message);
            return { success: false, error: `Failed to create notification: ${error.message}` };
        }

        return {
            success: true,
            data: { notification: data },
        };
    }

    /**
     * Get all notifications for a creator (paginated, newest first).
     */
    static async getNotifications(
        creatorId: string,
        options: { limit?: number; offset?: number; unread_only?: boolean } = {}
    ): Promise<ApiResponse> {
        const { limit = 50, offset = 0, unread_only = false } = options;

        let query = supabase
            .from('payment_notifications')
            .select('*', { count: 'exact' })
            .eq('creator_id', creatorId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (unread_only) {
            query = query.eq('is_read', false);
        }

        const { data: notifications, error, count } = await query;

        if (error) {
            return { success: false, error: `Failed to fetch notifications: ${error.message}` };
        }

        return {
            success: true,
            data: {
                notifications,
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
     * Get unread notification count for a creator.
     */
    static async getUnreadCount(creatorId: string): Promise<ApiResponse> {
        const { count, error } = await supabase
            .from('payment_notifications')
            .select('*', { count: 'exact', head: true })
            .eq('creator_id', creatorId)
            .eq('is_read', false);

        if (error) {
            return { success: false, error: `Failed to fetch count: ${error.message}` };
        }

        return {
            success: true,
            data: { unread_count: count || 0 },
        };
    }

    /**
     * Mark a notification as read.
     */
    static async markAsRead(creatorId: string, notificationId: string): Promise<ApiResponse> {
        const { error } = await supabase
            .from('payment_notifications')
            .update({ is_read: true })
            .eq('id', notificationId)
            .eq('creator_id', creatorId);

        if (error) {
            return { success: false, error: `Failed to mark as read: ${error.message}` };
        }

        return { success: true, message: 'Notification marked as read' };
    }

    /**
     * Mark all notifications as read for a creator.
     */
    static async markAllAsRead(creatorId: string): Promise<ApiResponse> {
        const { error } = await supabase
            .from('payment_notifications')
            .update({ is_read: true })
            .eq('creator_id', creatorId)
            .eq('is_read', false);

        if (error) {
            return { success: false, error: `Failed to mark all as read: ${error.message}` };
        }

        return { success: true, message: 'All notifications marked as read' };
    }
}
