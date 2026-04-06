'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    QrCode, Download, Share2, Smartphone, ArrowLeft, RefreshCw,
    Palette, Loader2, CheckCircle2, Trash2, Copy, ExternalLink, Zap
} from 'lucide-react';
import Link from 'next/link';
import { paymentCodeApi } from '@/lib/api';
import { supabase } from '@/lib/supabase';

interface PaymentCode {
    id: string;
    code: string;
    creator_id: string;
    amount: number | null;
    message_template: string | null;
    is_active: boolean;
    created_at: string;
}

export default function QRGenerator() {
    const [amount, setAmount] = useState('');
    const [messageTemplate, setMessageTemplate] = useState('');
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [myCodes, setMyCodes] = useState<PaymentCode[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingCodes, setLoadingCodes] = useState(true);
    const [copied, setCopied] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const qrRef = useRef<HTMLDivElement>(null);

    // Fallback for non-logged-in users: plain UPI QR
    const [upiId, setUpiId] = useState('');
    const [displayName, setDisplayName] = useState('');

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            setIsLoggedIn(true);
            // Fetch profile for username
            const { data: profile } = await supabase
                .from('profiles')
                .select('username, full_name')
                .eq('id', session.user.id)
                .single();
            if (profile) {
                setUsername(profile.username || '');
                setDisplayName(profile.full_name || profile.username || '');
            }
            fetchMyCodes();
        } else {
            setLoadingCodes(false);
        }
    };

    const fetchMyCodes = async () => {
        setLoadingCodes(true);
        try {
            const res = await paymentCodeApi.getMyCodes();
            if (res.success) {
                setMyCodes(res.data.codes || []);
            }
        } catch (err) {
            console.error('Failed to fetch codes:', err);
        }
        setLoadingCodes(false);
    };

    const handleGenerateCode = async () => {
        setLoading(true);
        try {
            const payload: { amount?: number; message_template?: string } = {};
            if (amount && parseFloat(amount) > 0) payload.amount = parseFloat(amount);
            if (messageTemplate.trim()) payload.message_template = messageTemplate.trim();

            const res = await paymentCodeApi.createCode(payload);
            if (res.success) {
                setGeneratedCode(res.data.code);
                await fetchMyCodes();
            } else {
                alert(res.error || 'Failed to generate code');
            }
        } catch (err: any) {
            alert('Error: ' + err.message);
        }
        setLoading(false);
    };

    const handleDeactivate = async (code: string) => {
        if (!confirm(`Deactivate code ${code}? This QR will stop working.`)) return;
        try {
            await paymentCodeApi.deactivateCode(code);
            await fetchMyCodes();
        } catch (err: any) {
            alert('Error: ' + err.message);
        }
    };

    const getQRUrl = (code: string) => {
        const tipPageUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${username}?code=${code}`;
        return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(tipPageUrl)}&color=c084fc&bgcolor=0f0a1e`;
    };

    const getTipPageUrl = (code: string) => {
        return `${typeof window !== 'undefined' ? window.location.origin : ''}/${username}?code=${code}`;
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // ── Non-logged-in: plain UPI QR ──
    const plainQrData = `upi://pay?pa=${upiId}&pn=${displayName || 'WaveTipz'}${amount ? `&am=${amount}` : ''}&cu=INR`;
    const plainQrUrl = upiId ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(plainQrData)}` : null;

    return (
        <div className="min-h-screen bg-[#0B0B0F] text-white selection:bg-purple-500/30 pb-20">
            {/* Header */}
            <nav className="px-6 py-6 flex items-center justify-between border-b border-white/5 backdrop-blur-xl bg-[#0B0B0F]/80 sticky top-0 z-50">
                <Link href="/" className="flex items-center gap-2 group">
                    <ArrowLeft className="text-zinc-500 group-hover:text-white transition-colors" />
                    <span className="font-black text-xl tracking-tighter text-white">WaveTipz</span>
                </Link>
                <div className="hidden md:flex gap-8 items-center text-sm font-bold uppercase tracking-widest text-zinc-500">
                    <Link href="/" className="hover:text-white transition-colors">Home</Link>
                    <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
                    {isLoggedIn ? (
                        <Link href="/dashboard" className="px-5 py-2 text-white hover:text-purple-400 transition-colors">Dashboard</Link>
                    ) : (
                        <Link href="/login" className="px-5 py-2 text-white hover:text-purple-400 transition-colors">Login</Link>
                    )}
                </div>
                <div className="w-10"></div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 pt-16">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tighter">
                        {isLoggedIn ? (
                            <>Payment <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">QR Codes</span></>
                        ) : (
                            <>Branded <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">QR Generator</span></>
                        )}
                    </h1>
                    <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
                        {isLoggedIn
                            ? 'Generate unique QR codes with payment codes. All payments route through the platform and are automatically credited to your account.'
                            : 'Create a custom UPI QR code for your stream overlays. Login for payment-code QR codes with automatic routing.'}
                    </p>
                </motion.div>

                {isLoggedIn ? (
                    /* ── LOGGED IN: Payment Code QR Generator ── */
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                        {/* Generate Section */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-8"
                        >
                            <div className="rounded-[28px] border border-white/5 p-8 space-y-6" style={{ background: 'linear-gradient(180deg, rgba(20,15,35,0.95) 0%, rgba(11,11,15,0.98) 100%)' }}>
                                <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                                    <Zap size={20} className="text-purple-400" />
                                    Generate New Code
                                </h2>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">
                                        Fixed Amount (Optional)
                                    </label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="₹ Leave blank for any amount"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-purple-500/50 transition-all font-medium"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">
                                        Message Template (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={messageTemplate}
                                        onChange={(e) => setMessageTemplate(e.target.value)}
                                        placeholder="e.g., Thanks for watching!"
                                        maxLength={200}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-purple-500/50 transition-all font-medium"
                                    />
                                </div>

                                <motion.button
                                    onClick={handleGenerateCode}
                                    disabled={loading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 font-black text-sm uppercase tracking-tight flex items-center justify-center gap-2 shadow-2xl shadow-purple-500/20 text-white disabled:opacity-50 cursor-pointer"
                                >
                                    {loading ? (
                                        <><Loader2 size={18} className="animate-spin" /> Generating...</>
                                    ) : (
                                        <><QrCode size={18} /> Generate Payment Code</>
                                    )}
                                </motion.button>
                            </div>

                            {/* Info Card */}
                            <div className="p-6 rounded-2xl bg-purple-500/5 border border-purple-500/20 flex items-start gap-4">
                                <Palette className="text-purple-400 shrink-0 mt-0.5" />
                                <div className="text-sm text-zinc-400 leading-relaxed">
                                    <strong className="text-purple-400">How it works:</strong>
                                    <ol className="mt-2 space-y-1 list-decimal list-inside text-xs">
                                        <li>Generate a unique payment code</li>
                                        <li>QR code contains your tip page URL + code</li>
                                        <li>Fan scans → pays via Razorpay (to platform)</li>
                                        <li>Platform routes your share (minus 10% commission)</li>
                                        <li>You get notified instantly! 🔔</li>
                                    </ol>
                                </div>
                            </div>
                        </motion.div>

                        {/* Preview + Codes Section */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-8"
                        >
                            {/* Generated Code Preview */}
                            <AnimatePresence>
                                {generatedCode && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="rounded-[28px] border border-green-500/20 p-8 text-center"
                                        style={{ background: 'linear-gradient(180deg, rgba(20,35,20,0.95) 0%, rgba(11,15,11,0.98) 100%)' }}
                                    >
                                        <div className="flex items-center justify-center gap-2 text-green-400 mb-4">
                                            <CheckCircle2 size={20} />
                                            <span className="text-sm font-black uppercase tracking-widest">Code Generated!</span>
                                        </div>

                                        <div className="mb-6 relative inline-block">
                                            <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-pink-600 blur-2xl opacity-20"></div>
                                            <div className="w-56 h-56 bg-white rounded-3xl p-3 mx-auto relative shadow-2xl">
                                                <img src={getQRUrl(generatedCode)} alt="Payment QR Code" className="w-full h-full" />
                                            </div>
                                        </div>

                                        <div className="text-3xl font-black tracking-[0.3em] text-white mb-2 font-mono">
                                            {generatedCode}
                                        </div>
                                        <p className="text-zinc-500 text-xs mb-4">This code uniquely identifies you for payments</p>

                                        <div className="flex gap-3 justify-center">
                                            <button
                                                onClick={() => copyToClipboard(getTipPageUrl(generatedCode))}
                                                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 font-bold text-xs hover:bg-white/10 transition-all cursor-pointer"
                                            >
                                                {copied ? <CheckCircle2 size={14} className="text-green-400" /> : <Copy size={14} />}
                                                {copied ? 'Copied!' : 'Copy Link'}
                                            </button>
                                            <a
                                                href={getTipPageUrl(generatedCode)}
                                                target="_blank"
                                                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 font-bold text-xs hover:bg-white/10 transition-all"
                                            >
                                                <ExternalLink size={14} /> Open Page
                                            </a>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* My Active Codes */}
                            <div className="rounded-[28px] border border-white/5 p-8" style={{ background: 'linear-gradient(180deg, rgba(20,15,35,0.95) 0%, rgba(11,11,15,0.98) 100%)' }}>
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500 mb-6 flex items-center gap-2">
                                    <QrCode size={14} /> Your Payment Codes
                                </h3>

                                {loadingCodes ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 size={24} className="animate-spin text-purple-500" />
                                    </div>
                                ) : myCodes.length === 0 ? (
                                    <p className="text-zinc-600 text-sm text-center py-8">No codes generated yet. Create your first one!</p>
                                ) : (
                                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                        {myCodes.map((pc) => (
                                            <div
                                                key={pc.id}
                                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${pc.is_active
                                                    ? 'bg-white/3 border-white/8 hover:border-purple-500/30'
                                                    : 'bg-white/2 border-white/5 opacity-40'
                                                }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                                        <QrCode size={16} className="text-purple-400" />
                                                    </div>
                                                    <div>
                                                        <span className="font-black text-sm font-mono tracking-wider">{pc.code}</span>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            {pc.amount && (
                                                                <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                                                                    ₹{pc.amount}
                                                                </span>
                                                            )}
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pc.is_active
                                                                ? 'text-green-400 bg-green-500/10'
                                                                : 'text-red-400 bg-red-500/10'
                                                            }`}>
                                                                {pc.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => copyToClipboard(getTipPageUrl(pc.code))}
                                                        className="p-2 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
                                                        title="Copy link"
                                                    >
                                                        <Copy size={14} className="text-zinc-500" />
                                                    </button>
                                                    {pc.is_active && (
                                                        <button
                                                            onClick={() => handleDeactivate(pc.code)}
                                                            className="p-2 rounded-lg hover:bg-red-500/10 transition-all cursor-pointer"
                                                            title="Deactivate"
                                                        >
                                                            <Trash2 size={14} className="text-red-400" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                ) : (
                    /* ── NOT LOGGED IN: Plain UPI QR ── */
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-8"
                        >
                            <div className="rounded-[28px] border border-white/5 p-8 space-y-6" style={{ background: 'linear-gradient(180deg, rgba(20,15,35,0.95) 0%, rgba(11,11,15,0.98) 100%)' }}>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                        <Smartphone size={14} /> Your UPI ID
                                    </label>
                                    <input
                                        type="text"
                                        value={upiId}
                                        onChange={(e) => setUpiId(e.target.value)}
                                        placeholder="yourname@upi"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-purple-500/50 transition-all font-medium"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Display Name</label>
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            placeholder="Rahul Gaming"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-purple-500/50 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Fixed Amount (Optional)</label>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="₹ 500"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-purple-500/50 transition-all font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Login CTA */}
                            <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-500/20">
                                <p className="text-sm text-zinc-300 mb-3">
                                    <strong className="text-purple-400">Want payment tracking?</strong> Login to generate QR codes with unique payment codes. Payments automatically route through the platform with commission splits and instant notifications.
                                </p>
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm hover:scale-105 transition-all"
                                >
                                    Login for Smart QR Codes →
                                </Link>
                            </div>
                        </motion.div>

                        {/* Plain QR Preview */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="sticky top-32"
                        >
                            <div className="rounded-[40px] p-10 border border-white/10 shadow-2xl relative overflow-hidden flex flex-col items-center" style={{ background: 'linear-gradient(180deg, rgba(20,15,35,0.95) 0%, rgba(11,11,15,0.98) 100%)' }}>
                                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600"></div>

                                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500 mb-10">Live Preview</h3>

                                <div className="relative group">
                                    <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-pink-600 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                    <div className="w-64 h-64 bg-white rounded-3xl p-4 flex items-center justify-center relative shadow-2xl">
                                        {plainQrUrl ? (
                                            <img src={plainQrUrl} alt="QR Code" className="w-full h-full" />
                                        ) : (
                                            <div className="flex flex-col items-center gap-4 text-zinc-300">
                                                <QrCode size={48} className="opacity-20 animate-pulse" />
                                                <span className="text-[10px] uppercase font-black tracking-widest opacity-40">Enter Details to Generate</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-12 text-center">
                                    <div className="text-xl font-black mb-1">{displayName || "Your Name"}</div>
                                    <div className="text-zinc-500 text-sm font-medium mb-8">{upiId || "yourname@upi"}</div>

                                    <div className="flex gap-4">
                                        <button className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-black font-black uppercase tracking-tight hover:bg-zinc-200 transition-all shadow-xl cursor-pointer">
                                            <Download size={18} /> Download
                                        </button>
                                        <button className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 font-black uppercase tracking-tight hover:bg-white/10 transition-all cursor-pointer">
                                            <Share2 size={18} /> Share
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={() => { setUpiId(''); setDisplayName(''); setAmount(''); }}
                                    className="mt-8 flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest cursor-pointer"
                                >
                                    <RefreshCw size={14} /> Reset Configuration
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </main>
        </div>
    );
}
