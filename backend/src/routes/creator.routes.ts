// ==========================================
// Creator Settings Routes
// ==========================================

import { Router, Response } from 'express';
import { z } from 'zod';
import { CreatorService } from '../services/creator.service';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { AuthenticatedRequest } from '../types';

const router = Router();

// ── Validation Schemas ──────────────────────
const updateSettingsSchema = z.object({
    upi_id: z.string().min(3).max(100).optional(),
    alert_sound: z.string().max(200).optional(),
    alert_theme: z.enum(['default', 'neon', 'minimal', 'fireworks', 'gaming']).optional(),
});

// ── Routes ──────────────────────────────────

/**
 * GET /api/creator/settings
 * Get settings for the authenticated creator (PROTECTED)
 */
router.get('/settings', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const result = await CreatorService.getSettings(req.user.id);

        if (!result.success) {
            res.status(400).json(result);
            return;
        }

        res.json(result);
    } catch (err) {
        console.error('Get settings error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch settings' });
    }
});

/**
 * PUT /api/creator/settings
 * Update settings for the authenticated creator (PROTECTED)
 */
router.put(
    '/settings',
    requireAuth,
    validate(updateSettingsSchema),
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: 'Not authenticated' });
                return;
            }

            const result = await CreatorService.updateSettings(req.user.id, req.body);

            if (!result.success) {
                res.status(400).json(result);
                return;
            }

            res.json(result);
        } catch (err) {
            console.error('Update settings error:', err);
            res.status(500).json({ success: false, error: 'Failed to update settings' });
        }
    }
);

export default router;
