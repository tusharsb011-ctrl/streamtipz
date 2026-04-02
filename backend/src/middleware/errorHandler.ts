// ==========================================
// Central Error Handler Middleware
// ==========================================

import { Request, Response, NextFunction } from 'express';

/**
 * Custom API error class with HTTP status code support.
 */
export class ApiError extends Error {
    statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'ApiError';
    }
}

/**
 * Global error handler middleware.
 * Catches all errors and returns a consistent JSON response.
 */
export const errorHandler = (
    err: Error | ApiError,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    console.error(`❌ [Error] ${err.name}: ${err.message}`);

    if (err instanceof ApiError) {
        res.status(err.statusCode).json({
            success: false,
            error: err.message,
        });
        return;
    }

    // Unexpected errors - don't leak internal details
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message,
    });
};

/**
 * 404 Not Found handler for unknown routes.
 */
export const notFoundHandler = (req: Request, res: Response): void => {
    res.status(404).json({
        success: false,
        error: `Route not found: ${req.method} ${req.originalUrl}`,
    });
};
