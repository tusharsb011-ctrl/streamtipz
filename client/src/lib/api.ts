'use client'

import { supabase } from '@/lib/supabase';

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';

/**
 * Get current auth token from Supabase session
 */
async function getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
}

/**
 * Authenticated fetch helper
 */
async function authFetch(endpoint: string, options: RequestInit = {}) {
    const token = await getAuthToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || 'Request failed');
    }

    return data;
}

// ── Profile APIs ─────────────────────────────
export const profileApi = {
    getMyProfile: () => authFetch('/api/profile/me'),
    updateProfile: (payload: { full_name?: string; avatar_url?: string; username?: string }) =>
        authFetch('/api/profile/me', { method: 'PUT', body: JSON.stringify(payload) }),
    getPublicProfile: (username: string) => authFetch(`/api/profile/${username}`),
};

// ── Tips APIs ────────────────────────────────
export const tipsApi = {
    createTipOrder: (payload: { creator_id: string; sender_name: string; message?: string; amount: number; payment_code?: string }) =>
        authFetch('/api/tips/create-order', { method: 'POST', body: JSON.stringify(payload) }),
    verifyTipPayment: (payload: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
        authFetch('/api/tips/verify-payment', { method: 'POST', body: JSON.stringify(payload) }),
    getMyTips: (limit = 50, offset = 0) =>
        authFetch(`/api/tips/my-tips?limit=${limit}&offset=${offset}`),
    getStats: () => authFetch('/api/tips/stats'),
};

// ── Payment Code APIs ────────────────────────
export const paymentCodeApi = {
    /** Resolve a QR payment code to creator info (public) */
    resolveCode: (code: string) =>
        authFetch(`/api/tips/resolve-code/${code}`),
    /** Generate a new payment code for the authenticated creator */
    createCode: (payload: { amount?: number; message_template?: string } = {}) =>
        authFetch('/api/tips/create-code', { method: 'POST', body: JSON.stringify(payload) }),
    /** Get all codes for the authenticated creator */
    getMyCodes: () =>
        authFetch('/api/tips/my-codes'),
    /** Deactivate a payment code */
    deactivateCode: (code: string) =>
        authFetch(`/api/tips/deactivate-code/${code}`, { method: 'DELETE' }),
};

// ── Notification APIs ────────────────────────
export const notificationApi = {
    /** Get notifications for the authenticated creator */
    getNotifications: (limit = 50, offset = 0, unread_only = false) =>
        authFetch(`/api/tips/notifications?limit=${limit}&offset=${offset}&unread_only=${unread_only}`),
    /** Get unread notification count */
    getUnreadCount: () =>
        authFetch('/api/tips/notifications/unread-count'),
    /** Mark a notification as read */
    markAsRead: (id: string) =>
        authFetch(`/api/tips/notifications/${id}/read`, { method: 'PUT' }),
    /** Mark all notifications as read */
    markAllAsRead: () =>
        authFetch('/api/tips/notifications/read-all', { method: 'PUT' }),
};

// ── Creator Settings APIs ────────────────────
export const creatorApi = {
    getSettings: () => authFetch('/api/creator/settings'),
    updateSettings: (payload: Record<string, any>) =>
        authFetch('/api/creator/settings', { method: 'PUT', body: JSON.stringify(payload) }),
};

// ── Auth APIs ────────────────────────────────
export const authApi = {
    getMe: () => authFetch('/api/auth/me'),
};
