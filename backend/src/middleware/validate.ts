// ==========================================
// Request Validation Middleware (Zod)
// ==========================================

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Validates request body against a Zod schema.
 * Returns 400 with field-level error details on failure.
 */
export const validate = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            schema.parse(req.body);
            next();
        } catch (err) {
            if (err instanceof ZodError) {
                const errors = err.errors.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                }));

                res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: errors,
                });
                return;
            }

            next(err);
        }
    };
};
