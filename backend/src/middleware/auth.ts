// ==========================================
// Authentication Middleware
// ==========================================
// Verifies JWT from Authorization header
// and attaches user info to request object.
// ==========================================

import { Response, NextFunction } from 'express';
import supabase from '../config/supabase';
import { AuthenticatedRequest } from '../types';

/**
 * Middleware to protect routes.
 * Extracts Bearer token → verifies with Supabase → attaches user to req.
 */
export const requireAuth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                error: 'Missing or invalid Authorization header. Use: Bearer <token>',
            });
            return;
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            res.status(401).json({
                success: false,
                error: 'Token not provided',
            });
            return;
        }

        // Verify the JWT with Supabase
        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data.user) {
            res.status(401).json({
                success: false,
                error: 'Invalid or expired token',
            });
            return;
        }

        // Attach user to request
        req.user = {
            id: data.user.id,
            email: data.user.email || '',
            role: data.user.role,
        };

        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        res.status(500).json({
            success: false,
            error: 'Authentication failed',
        });
    }
};
