// ==========================================
// WaveTipz Backend — Entry Point
// ==========================================

import dotenv from 'dotenv';

// Load env BEFORE anything else
dotenv.config();

import { createServer } from './server';

const PORT = parseInt(process.env.PORT || '5000', 10);
const app = createServer();

app.listen(PORT, () => {
    console.log('');
    console.log('🚀 ═══════════════════════════════════════════');
    console.log(`🚀  WaveTipz Backend is LIVE!`);
    console.log(`🚀  Port:        ${PORT}`);
    console.log(`🚀  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🚀  Health:      http://localhost:${PORT}/api/health`);
    console.log('🚀 ═══════════════════════════════════════════');
    console.log('');
    console.log(`📊 Commission: ${process.env.PLATFORM_COMMISSION_PERCENT || '10'}%`);
    console.log('');
    console.log('📡 API Endpoints:');
    console.log(`   POST   /api/auth/signup`);
    console.log(`   POST   /api/auth/login`);
    console.log(`   GET    /api/auth/me                    🔒`);
    console.log(`   GET    /api/profile/me                  🔒`);
    console.log(`   PUT    /api/profile/me                  🔒`);
    console.log(`   GET    /api/profile/:username`);
    console.log(`   GET    /api/tips/resolve-code/:code`);
    console.log(`   POST   /api/tips/create-code            🔒`);
    console.log(`   GET    /api/tips/my-codes               🔒`);
    console.log(`   DELETE /api/tips/deactivate-code/:code  🔒`);
    console.log(`   POST   /api/tips/create-order`);
    console.log(`   POST   /api/tips/verify-payment`);
    console.log(`   GET    /api/tips/my-tips                🔒`);
    console.log(`   GET    /api/tips/stats                  🔒`);
    console.log(`   GET    /api/tips/notifications          🔒`);
    console.log(`   GET    /api/tips/notifications/unread   🔒`);
    console.log(`   PUT    /api/tips/notifications/:id/read 🔒`);
    console.log(`   PUT    /api/tips/notifications/read-all 🔒`);
    console.log(`   GET    /api/creator/settings            🔒`);
    console.log(`   PUT    /api/creator/settings            🔒`);
    console.log('');
});
