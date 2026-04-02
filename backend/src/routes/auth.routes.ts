// ==========================================
// Authentication Routes
// ==========================================

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth.service';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { AuthenticatedRequest } from '../types';

const router = Router();

// ── Validation Schemas ──────────────────────
const signupSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    full_name: z.string().min(1).max(100).optional(),
    username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(30)
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
        .optional(),
});

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

// ── Routes ──────────────────────────────────

/**
 * POST /api/auth/signup
 * Register a new user
 */
router.post('/signup', validate(signupSchema), async (req: Request, res: Response) => {
    try {
        const result = await AuthService.signup(req.body);

        if (!result.success) {
            res.status(400).json(result);
            return;
        }

        res.status(201).json(result);
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ success: false, error: 'Registration failed' });
    }
});

/**
 * POST /api/auth/login
 * Login with email & password
 */
router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
    try {
        const result = await AuthService.login(req.body);

        if (!result.success) {
            res.status(401).json(result);
            return;
        }

        res.json(result);
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, error: 'Login failed' });
    }
});

/**
 * GET /api/auth/me
 * Get current authenticated user profile
 */
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const result = await AuthService.getMe(req.user.id);

        if (!result.success) {
            res.status(404).json(result);
            return;
        }

        res.json(result);
    } catch (err) {
        console.error('Get me error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch user' });
    }
});

export default router;
