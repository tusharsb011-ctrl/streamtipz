'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lock, Mail, User, ChevronRight, Loader2, Tv, Heart, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';

type UserRole = 'creator' | 'viewer';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [role, setRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!role) { setError('Please select whether you are a Creator or Viewer'); return; }
        setLoading(true);
        setError(null);

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username,
                    full_name: username,
                    role: role,
                },
                emailRedirectTo: `${window.location.origin}/auth/callback?next=${role === 'creator' ? '/dashboard' : '/viewer'}`,
            }
        });

        if (error) {
            if (error.message.includes('provider is not enabled')) {
                setError('Provider not enabled. Please enable "Email" and disable "Confirm Email" in Supabase Auth settings.');
            } else {
                setError(error.message);
            }
            setLoading(false);
        } else {
            if (data?.session) {
                try {
                    const user = data.session.user;
                    await supabase.from('profiles').upsert({
                        id: user.id,
                        email: user.email || '',
                        username: username,
                        full_name: username,
                        avatar_url: null,
                        role: role,
                    }, { onConflict: 'id' });
                } catch (err) {
                    console.log('Profile creation error:', err);
                }

                try {
                    await fetch(`${API_URL}/api/auth/signup`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${data.session.access_token}`,
                        },
                        body: JSON.stringify({ email, username, role }),
                    });
                } catch (err) {
                    console.log('Backend profile sync skipped:', err);
                }
                router.push(role === 'creator' ? '/dashboard' : '/viewer');
            } else {
                setError('✅ Check your email to confirm your account, then log in!');
                setLoading(false);
            }
        }
    };

    const handleGoogleSignup = async () => {
        if (!role) { setError('Please select whether you are a Creator or Viewer first'); return; }
        setError(null);
        setGoogleLoading(true);
        
        // Store role in localStorage so we can use it after Google redirect
        localStorage.setItem('pending_role', role);
        
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback?next=${role === 'creator' ? '/dashboard' : '/viewer'}&role=${role}`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            }
        });
        if (error) {
            if (error.message.includes('provider is not enabled') || error.message.includes('Unsupported provider')) {
                setError('⚠️ Google Sign-up is not enabled yet. Enable it in Supabase Dashboard → Authentication → Providers → Google.');
            } else {
                setError(error.message);
            }
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center p-4 sm:p-6 selection:bg-purple-500/30 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full -z-10"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-pink-600/10 blur-[120px] rounded-full -z-10"></div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg p-8 sm:p-10 rounded-[32px] sm:rounded-[40px] backdrop-blur-xl bg-white/[0.03] border border-white/5 shadow-2xl relative"
            >
                <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group mb-8">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold uppercase tracking-widest">Back to Home</span>
                </Link>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg mx-auto mb-5">
                        <span className="text-white font-black text-3xl">₹</span>
                    </div>
                    <h1 className="text-3xl font-black mb-2 uppercase tracking-tighter text-white">Get Started</h1>
                    <p className="text-zinc-500 font-medium">Choose your role and create your account</p>
                </div>

                {/* ── Role Selector ── */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { setRole('creator'); setError(null); }}
                        className={`p-5 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                            role === 'creator'
                                ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                                : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                        }`}
                    >
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${
                            role === 'creator' ? 'bg-purple-500/20' : 'bg-white/5'
                        }`}>
                            <Tv size={22} className={role === 'creator' ? 'text-purple-400' : 'text-zinc-500'} />
                        </div>
                        <h3 className={`font-black text-sm uppercase tracking-tight mb-1 ${role === 'creator' ? 'text-purple-300' : 'text-white'}`}>
                            Creator
                        </h3>
                        <p className="text-[10px] text-zinc-500 leading-relaxed">
                            Stream & receive tips from fans. Manage payments & overlays.
                        </p>
                        {role === 'creator' && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-2">
                                <Sparkles size={14} className="text-purple-400" />
                            </motion.div>
                        )}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { setRole('viewer'); setError(null); }}
                        className={`p-5 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                            role === 'viewer'
                                ? 'border-pink-500 bg-pink-500/10 shadow-lg shadow-pink-500/20'
                                : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                        }`}
                    >
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${
                            role === 'viewer' ? 'bg-pink-500/20' : 'bg-white/5'
                        }`}>
                            <Heart size={22} className={role === 'viewer' ? 'text-pink-400' : 'text-zinc-500'} />
                        </div>
                        <h3 className={`font-black text-sm uppercase tracking-tight mb-1 ${role === 'viewer' ? 'text-pink-300' : 'text-white'}`}>
                            Viewer
                        </h3>
                        <p className="text-[10px] text-zinc-500 leading-relaxed">
                            Support your favorite creators. Track your tip history.
                        </p>
                        {role === 'viewer' && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-2">
                                <Sparkles size={14} className="text-pink-400" />
                            </motion.div>
                        )}
                    </motion.button>
                </div>

                <AnimatePresence>
                    {role && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            {/* Google Button */}
                            <button
                                onClick={handleGoogleSignup}
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
                                {googleLoading ? 'Redirecting...' : `Sign up as ${role === 'creator' ? 'Creator' : 'Viewer'} with Google`}
                            </button>

                            {/* Divider */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex-1 h-px bg-white/10"></div>
                                <span className="text-zinc-600 text-xs font-bold uppercase tracking-widest">or use email</span>
                                <div className="flex-1 h-px bg-white/10"></div>
                            </div>

                            {error && (
                                <div className={`mb-6 p-4 rounded-2xl text-sm font-bold text-center ${error.startsWith('✅') ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                                    {error}
                                </div>
                            )}

                            <form className="space-y-5" onSubmit={handleSignup}>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                        <User size={14} /> {role === 'creator' ? 'Creator Username' : 'Display Name'}
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-500/50 outline-none transition-all font-medium text-white text-base"
                                        placeholder={role === 'creator' ? 'ninja_streamer' : 'CoolFan42'}
                                    />
                                    {role === 'creator' && (
                                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">URL: WaveTips.in/{username || 'yourname'}</p>
                                    )}
                                </div>
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
                                        placeholder={role === 'creator' ? 'creator@example.com' : 'you@example.com'}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                        <Lock size={14} /> Password
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-purple-500/50 outline-none transition-all font-medium text-white text-base"
                                        placeholder="••••••••"
                                        minLength={6}
                                    />
                                </div>

                                <button
                                    disabled={loading}
                                    className={`w-full py-5 sm:py-6 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all font-black text-lg sm:text-xl shadow-xl flex items-center justify-center gap-3 uppercase tracking-tighter text-white disabled:opacity-50 cursor-pointer ${
                                        role === 'creator'
                                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-purple-500/20'
                                            : 'bg-gradient-to-r from-pink-600 to-rose-600 shadow-pink-500/20'
                                    }`}
                                    style={{ minHeight: '60px' }}
                                >
                                    {loading ? (
                                        <><Loader2 size={22} className="animate-spin" /> Creating Account...</>
                                    ) : (
                                        <>Create {role === 'creator' ? 'Creator' : 'Viewer'} Account <ChevronRight size={22} /></>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!role && error && (
                    <div className="mb-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold text-center">
                        {error}
                    </div>
                )}

                <div className="mt-8 text-center">
                    <p className="text-zinc-500 text-sm font-medium">
                        Already have an account? <Link href="/login" className="text-white hover:text-purple-400 transition-colors font-bold ml-1">Log in here</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
