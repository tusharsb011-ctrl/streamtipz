'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Mail, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    /** Detect user role from profiles table and redirect accordingly */
    const redirectByRole = async (userId: string) => {
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();
            
            if (profile?.role === 'viewer') {
                router.push('/viewer');
            } else {
                router.push('/dashboard');
            }
        } catch {
            router.push('/dashboard'); // Default fallback
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            if (error.message.includes('provider is not enabled')) {
                setError('Authentication is not fully set up. Please enable the "Email" provider in your Supabase Dashboard.');
            } else if (error.message.includes('Invalid login credentials')) {
                setError('Wrong email or password. Please try again.');
            } else {
                setError(error.message);
            }
            setLoading(false);
        } else if (data?.user) {
            await redirectByRole(data.user.id);
        }
    };

    const handleGoogleLogin = async () => {
        setError(null);
        setGoogleLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            }
        });
        if (error) {
            if (error.message.includes('provider is not enabled') || error.message.includes('Unsupported provider')) {
                setError('⚠️ Google Login is not enabled. Enable it in Supabase Dashboard → Authentication → Providers → Google.');
            } else {
                setError(error.message);
            }
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center p-4 sm:p-6 selection:bg-purple-500/30 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full -z-10"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-600/10 blur-[120px] rounded-full -z-10"></div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-8 sm:p-10 rounded-[32px] sm:rounded-[40px] backdrop-blur-xl bg-white/[0.03] border border-white/5 shadow-2xl relative"
            >
                <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group mb-8">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold uppercase tracking-widest">Back to Home</span>
                </Link>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg mx-auto mb-5">
                        <span className="text-white font-black text-3xl">₹</span>
                    </div>
                    <h1 className="text-3xl font-black mb-2 uppercase tracking-tighter text-white">Welcome Back</h1>
                    <p className="text-zinc-500 font-medium">Log in to your account</p>
                </div>

                {/* Google Button */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={googleLoading}
                    className="w-full py-4 sm:py-5 rounded-2xl bg-white hover:bg-gray-100 active:scale-[0.98] transition-all font-bold text-base sm:text-lg flex items-center justify-center gap-3 text-gray-800 shadow-lg hover:shadow-xl disabled:opacity-60 mb-6 cursor-pointer"
                    style={{ minHeight: '56px' }}
                >
                    {googleLoading ? (
                        <Loader2 size={22} className="animate-spin" />
                    ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                    )}
                    {googleLoading ? 'Redirecting to Google...' : 'Continue with Google'}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 h-px bg-white/10"></div>
                    <span className="text-zinc-600 text-xs font-bold uppercase tracking-widest">or use email</span>
                    <div className="flex-1 h-px bg-white/10"></div>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold text-center">
                        {error}
                    </div>
                )}

                <form className="space-y-5" onSubmit={handleLogin}>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                            <Mail size={14} /> Email Address
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-500/50 outline-none transition-all font-medium text-white text-base"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                <Lock size={14} /> Password
                            </label>
                            <Link href="#" className="text-[10px] font-black uppercase tracking-widest text-purple-400 hover:underline">Forgot?</Link>
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-500/50 outline-none transition-all font-medium text-white text-base"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        disabled={loading}
                        className="w-full py-5 sm:py-6 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-[1.02] active:scale-[0.98] transition-all font-black text-lg sm:text-xl shadow-xl shadow-purple-500/20 flex items-center justify-center gap-3 uppercase tracking-tighter text-white disabled:opacity-50 cursor-pointer"
                        style={{ minHeight: '60px' }}
                    >
                        {loading ? (
                            <><Loader2 size={22} className="animate-spin" /> Logging in...</>
                        ) : (
                            <>Log In <ChevronRight size={22} /></>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-zinc-500 text-sm font-medium">
                        Don't have an account? <Link href="/signup" className="text-white hover:text-purple-400 transition-colors font-bold ml-1">Sign up for free</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
