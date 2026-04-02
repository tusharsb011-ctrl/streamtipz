// ==========================================
// Profile Routes
// ==========================================

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { ProfileService } from '../services/profile.service';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { AuthenticatedRequest } from '../types';

const router = Router();

// ── Validation Schemas ──────────────────────
const updateProfileSchema = z.object({
    full_name: z.string().min(1).max(100).optional(),
    avatar_url: z.string().url('Invalid URL').optional(),
    username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(30)
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
        .optional(),
});

// ── Routes ──────────────────────────────────

/**
 * GET /api/profile/me
 * Get authenticated user's profile (PROTECTED)
 */
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const result = await ProfileService.getProfile(req.user.id);

        if (!result.success) {
            res.status(404).json(result);
            return;
        }

        res.json(result);
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch profile' });
    }
});

/**
 * GET /api/profile/:username
 * Get public profile by username (PUBLIC — for tip page)
 */
router.get('/:username', async (req: Request, res: Response) => {
    try {
        const username = req.params.username as string;
        const result = await ProfileService.getPublicProfile(username);

        if (!result.success) {
            res.status(404).json(result);
            return;
        }

        res.json(result);
    } catch (err) {
        console.error('Get public profile error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch profile' });
    }
});

/**
 * PUT /api/profile/me
 * Update authenticated user's profile (PROTECTED)
 */
router.put(
    '/me',
    requireAuth,
    validate(updateProfileSchema),
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: 'Not authenticated' });
                return;
            }

            const result = await ProfileService.updateProfile(req.user.id, req.body);

            if (!result.success) {
                res.status(400).json(result);
                return;
            }

            res.json(result);
        } catch (err) {
            console.error('Update profile error:', err);
            res.status(500).json({ success: false, error: 'Failed to update profile' });
        }
    }
);

export default router;
