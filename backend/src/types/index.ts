// ==========================================
// StreamTipz Type Definitions
// ==========================================

import { Request } from 'express';

// ── Auth Types ──────────────────────────────
export interface AuthUser {
    id: string;
    email: string;
    role?: string;
}

export interface AuthenticatedRequest extends Request {
    user?: AuthUser;
}

export interface SignupPayload {
    email: string;
    password: string;
    full_name?: string;
    username?: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

// ── Profile Types ───────────────────────────
export interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    role: string | null;
    username: string | null;
    created_at: string | null;
}

export interface UpdateProfilePayload {
    full_name?: string;
    avatar_url?: string;
    username?: string;
}

// ── Tips Types ──────────────────────────────
export interface Tip {
    id: number;
    creator_id: string;
    sender_name: string | null;
    message: string | null;
    amount: number;
    created_at: string | null;
}

export interface SendTipPayload {
    creator_id: string;
    sender_name: string;
    message?: string;
    amount: number;
}

// ── Creator Settings Types ──────────────────
export interface CreatorSettings {
    creator_id: string;
    upi_id: string | null;
    alert_sound: string | null;
    alert_theme: string | null;
    created_at: string | null;
}

export interface UpdateCreatorSettingsPayload {
    upi_id?: string;
    alert_sound?: string;
    alert_theme?: string;
}

// ── API Response Types ──────────────────────
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
