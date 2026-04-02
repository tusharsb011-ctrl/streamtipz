// ==========================================
// Tips Routes
// ==========================================
// Includes payment code resolution, order
// creation, payment verification, and
// notification endpoints.
// ==========================================

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { TipsService } from '../services/tips.service';
import { PaymentCodeService } from '../services/payment-code.service';
import { NotificationService } from '../services/notification.service';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { AuthenticatedRequest } from '../types';

const router = Router();

// ── Validation Schemas ──────────────────────
const sendTipSchema = z.object({
    creator_id: z.string().uuid('Invalid creator ID'),
    sender_name: z.string().min(1).max(100).default('Anonymous'),
    sender_id: z.string().uuid().optional(),
    message: z.string().max(500).optional(),
    amount: z.number().positive('Amount must be greater than 0').max(100000, 'Amount too large'),
    payment_code: z.string().max(20).optional(),
});

const verifyPaymentSchema = z.object({
    razorpay_order_id: z.string(),
    razorpay_payment_id: z.string(),
    razorpay_signature: z.string(),
});

const createCodeSchema = z.object({
    amount: z.number().positive().max(100000).optional(),
    message_template: z.string().max(500).optional(),
});

// ── Payment Code Routes ─────────────────────

/**
 * GET /api/tips/resolve-code/:code
 * Resolve a QR payment code to its creator info (PUBLIC)
 */
router.get('/resolve-code/:code', async (req: Request<{ code: string }>, res: Response) => {
    try {
        const code = req.params.code;
        const result = await PaymentCodeService.resolveCode(code);

        if (!result.success) {
            res.status(404).json(result);
            return;
        }

        res.json(result);
    } catch (err) {
        console.error('Resolve code error:', err);
        res.status(500).json({ success: false, error: 'Failed to resolve payment code' });
    }
});

/**
 * POST /api/tips/create-code
 * Generate a new payment code for the authenticated creator (PROTECTED)
 */
router.post('/create-code', requireAuth, validate(createCodeSchema), async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const result = await PaymentCodeService.createCode(req.user.id, req.body);

        if (!result.success) {
            res.status(400).json(result);
            return;
        }

        res.status(201).json(result);
    } catch (err) {
        console.error('Create code error:', err);
        res.status(500).json({ success: false, error: 'Failed to create payment code' });
    }
});

/**
 * GET /api/tips/my-codes
 * Get all payment codes for the authenticated creator (PROTECTED)
 */
router.get('/my-codes', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const result = await PaymentCodeService.getCreatorCodes(req.user.id);

        if (!result.success) {
            res.status(400).json(result);
            return;
        }

        res.json(result);
    } catch (err) {
        console.error('Get codes error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch payment codes' });
    }
});

/**
 * DELETE /api/tips/deactivate-code/:code
 * Deactivate a payment code (PROTECTED)
 */
router.delete('/deactivate-code/:code', requireAuth, async (req: AuthenticatedRequest & { params: { code: string } }, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const code = String(req.params.code);
        const result = await PaymentCodeService.deactivateCode(req.user.id, code);

        if (!result.success) {
            res.status(400).json(result);
            return;
        }

        res.json(result);
    } catch (err) {
        console.error('Deactivate code error:', err);
        res.status(500).json({ success: false, error: 'Failed to deactivate code' });
    }
});

// ── Payment Routes ──────────────────────────

/**
 * POST /api/tips/create-order
 * Create a Razorpay order for a tip (PUBLIC)
 * Payment goes to platform's main account.
 */
router.post('/create-order', validate(sendTipSchema), async (req: Request, res: Response) => {
    try {
        const result = await TipsService.createOrder(req.body);

        if (!result.success) {
            res.status(400).json(result);
            return;
        }

        res.status(201).json(result);
    } catch (err) {
        console.error('Create order error:', err);
        res.status(500).json({ success: false, error: 'Failed to create order' });
    }
});

/**
 * POST /api/tips/verify-payment
 * Verify Razorpay payment, record tip, and notify creator (PUBLIC)
 */
router.post('/verify-payment', validate(verifyPaymentSchema), async (req: Request, res: Response) => {
    try {
        const result = await TipsService.verifyPayment(req.body);

        if (!result.success) {
            res.status(400).json(result);
            return;
        }

        res.status(201).json(result);
    } catch (err) {
        console.error('Verify payment error:', err);
        res.status(500).json({ success: false, error: 'Failed to verify payment' });
    }
});

// ── Creator Dashboard Routes ────────────────

/**
 * GET /api/tips/my-tips
 * Get all tips for the authenticated creator (PROTECTED)
 */
router.get('/my-tips', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const limit = parseInt(req.query.limit as string) || 50;
        const offset = parseInt(req.query.offset as string) || 0;

        const result = await TipsService.getMyTips(req.user.id, { limit, offset });

        if (!result.success) {
            res.status(400).json(result);
            return;
        }

        res.json(result);
    } catch (err) {
        console.error('Get tips error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch tips' });
    }
});

/**
 * GET /api/tips/stats
 * Get tip statistics with commission breakdown (PROTECTED)
 */
router.get('/stats', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const result = await TipsService.getTipStats(req.user.id);

        if (!result.success) {
            res.status(400).json(result);
            return;
        }

        res.json(result);
    } catch (err) {
        console.error('Get stats error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch stats' });
    }
});

// ── Notification Routes ─────────────────────

/**
 * GET /api/tips/notifications
 * Get notifications for the authenticated creator (PROTECTED)
 */
router.get('/notifications', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const limit = parseInt(req.query.limit as string) || 50;
        const offset = parseInt(req.query.offset as string) || 0;
        const unread_only = req.query.unread_only === 'true';

        const result = await NotificationService.getNotifications(req.user.id, {
            limit,
            offset,
            unread_only,
        });

        if (!result.success) {
            res.status(400).json(result);
            return;
        }

        res.json(result);
    } catch (err) {
        console.error('Get notifications error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
    }
});

/**
 * GET /api/tips/notifications/unread-count
 * Get unread notification count (PROTECTED)
 */
router.get('/notifications/unread-count', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const result = await NotificationService.getUnreadCount(req.user.id);

        if (!result.success) {
            res.status(400).json(result);
            return;
        }

        res.json(result);
    } catch (err) {
        console.error('Get unread count error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch unread count' });
    }
});

/**
 * PUT /api/tips/notifications/:id/read
 * Mark a notification as read (PROTECTED)
 */
router.put('/notifications/:id/read', requireAuth, async (req: AuthenticatedRequest & { params: { id: string } }, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const notificationId = String(req.params.id);
        const result = await NotificationService.markAsRead(req.user.id, notificationId);

        if (!result.success) {
            res.status(400).json(result);
            return;
        }

        res.json(result);
    } catch (err) {
        console.error('Mark read error:', err);
        res.status(500).json({ success: false, error: 'Failed to mark notification as read' });
    }
});

/**
 * PUT /api/tips/notifications/read-all
 * Mark all notifications as read (PROTECTED)
 */
router.put('/notifications/read-all', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'Not authenticated' });
            return;
        }

        const result = await NotificationService.markAllAsRead(req.user.id);

        if (!result.success) {
            res.status(400).json(result);
            return;
        }

        res.json(result);
    } catch (err) {
        console.error('Mark all read error:', err);
        res.status(500).json({ success: false, error: 'Failed to mark all as read' });
    }
});

export default router;
