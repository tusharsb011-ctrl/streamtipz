// ==========================================
// Express Server Configuration
// ==========================================
// Central place for all Express middleware,
// route mounting, and error handling setup.
// ==========================================

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Route imports
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import tipsRoutes from './routes/tips.routes';
import creatorRoutes from './routes/creator.routes';

// Middleware imports
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

/**
 * Creates and configures the Express application.
 */
export function createServer(): Application {
    const app = express();

    // ── Security ────────────────────────────────
    app.use(helmet());

    // ── CORS ────────────────────────────────────
    app.use(
        cors({
            origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true,
        })
    );

    // ── Rate Limiting ───────────────────────────
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per window
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            success: false,
            error: 'Too many requests, please try again later',
        },
    });
    app.use('/api/', limiter);

    // ── Body Parsing ────────────────────────────
    app.use(express.json({ limit: '10kb' }));
    app.use(express.urlencoded({ extended: true }));

    // ── Logger ──────────────────────────────────
    if (process.env.NODE_ENV !== 'test') {
        app.use(morgan('dev'));
    }

    // ── Root Route ────────────────────────────
    app.get('/', (_req: Request, res: Response) => {
        res.json({
            success: true,
            message: '🚀 WaveTipz API is running!',
            version: '1.0.0',
            docs: {
                health: '/api/health',
                auth: '/api/auth',
                profile: '/api/profile',
                tips: '/api/tips',
                creator: '/api/creator',
            },
        });
    });

    // ── Health Check ────────────────────────────
    app.get('/api/health', (_req: Request, res: Response) => {
        res.json({
            success: true,
            data: {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV || 'development',
            },
        });
    });

    // ── API Routes ──────────────────────────────
    app.use('/api/auth', authRoutes);
    app.use('/api/profile', profileRoutes);
    app.use('/api/tips', tipsRoutes);
    app.use('/api/creator', creatorRoutes);

    // ── Error Handling ──────────────────────────
    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}
