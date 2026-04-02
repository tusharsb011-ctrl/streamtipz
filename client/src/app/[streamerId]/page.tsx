'use client'

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart, IndianRupee, MessageSquare, User, CheckCircle2,
    Sparkles, Zap, Shield, Star, Loader2, Trophy, Gift, QrCode
} from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface CreatorProfile {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
}

interface TopSupporter {
    sender_name: string;
    total: number;
}

export default function StreamerPage() {
    const { streamerId } = useParams() as { streamerId: string };
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const paymentCode = searchParams.get('code'); // QR code payment identifier
    const [amount, setAmount] = useState('');
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [creator, setCreator] = useState<CreatorProfile | null>(null);
    const [creatorLoading, setCreatorLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [topSupporters, setTopSupporters] = useState<TopSupporter[]>([]);
    const [tipCount, setTipCount] = useState(0);
    const [selectedQuick, setSelectedQuick] = useState<string | null>(null);
    const [codeResolved, setCodeResolved] = useState(false);

    useEffect(() => {
        if (paymentCode) {
            resolvePaymentCode();
        } else {
            fetchCreator();
        }
    }, [streamerId, paymentCode]);

    /**
     * Resolve a QR payment code — auto-fills creator info & optional amount.
     */
    const resolvePaymentCode = async () => {
        setCreatorLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/tips/resolve-code/${paymentCode}`);
            const data = await res.json();

            if (!data.success) {
                // Fallback to normal creator fetch
                await fetchCreator();
                return;
            }

            setCreator(data.data.creator);
            setCodeResolved(true);

            // Pre-fill amount if set in the code
            if (data.data.preset_amount) {
                setAmount(String(data.data.preset_amount));
            }

            // Pre-fill message template if set
            if (data.data.message_template) {
                setMessage(data.data.message_template);
            }

            // Fetch tip count for this creator
            const { count } = await supabase
                .from('tips')
                .select('*', { count: 'exact', head: true })
                .eq('creator_id', data.data.creator.id);
            setTipCount(count || 0);

            // Fetch top supporters
            await fetchTopSupporters(data.data.creator.id);
        } catch (err) {
            await fetchCreator();
        }
        setCreatorLoading(false);
    };

    const fetchTopSupporters = async (creatorId: string) => {
        const { data: tips } = await supabase
            .from('tips')
            .select('sender_name, amount')
            .eq('creator_id', creatorId)
            .order('amount', { ascending: false })
            .limit(50);

        if (tips && tips.length > 0) {
            const supporterMap: Record<string, number> = {};
            tips.forEach(t => {
                const n = t.sender_name || 'Anonymous';
                supporterMap[n] = (supporterMap[n] || 0) + Number(t.amount);
            });
            const sorted = Object.entries(supporterMap)
                .map(([sender_name, total]) => ({ sender_name, total }))
                .sort((a, b) => b.total - a.total)
                .slice(0, 3);
            setTopSupporters(sorted);
        }
    };

    const fetchCreator = async () => {
        setCreatorLoading(true);
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('id, full_name, username, avatar_url')
                .eq('username', streamerId)
                .single();

            if (error || !profile) {
                setNotFound(true);
                setCreatorLoading(false);
                return;
            }

            setCreator(profile);

            // Fetch tip count
            const { count } = await supabase
                .from('tips')
                .select('*', { count: 'exact', head: true })
                .eq('creator_id', profile.id);
            setTipCount(count || 0);

            await fetchTopSupporters(profile.id);
        } catch (err) {
            setNotFound(true);
        }
        setCreatorLoading(false);
    };

    const handleDonate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || Number(amount) < 1) return;
        setLoading(true);

        try {
            if (!creator) throw new Error('Creator not found');

            // 1. Create Order (payment goes to PLATFORM's main Razorpay account)
            const orderRes = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/tips/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    creator_id: creator.id,
                    sender_name: name || 'Anonymous Hero',
                    sender_id: user?.id || undefined,
                    amount: parseFloat(amount),
                    message: message,
                    payment_code: paymentCode || undefined,  // QR code identifier
                })
            });
            const orderData = await orderRes.json();
            
            if (!orderData.success) {
                throw new Error(orderData.error || 'Failed to create payment order');
            }

            // 2. Open Razorpay Checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
                amount: orderData.data.amount, 
                currency: "INR",
                name: "StreamTipz",
                description: `Tip to ${displayName}`,
                image: creator.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=streamtipz",
                order_id: orderData.data.order_id, 
                handler: async function (response: any) {
                    try {
                        const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/tips/verify-payment`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature
                            })
                        });
                        const verifyData = await verifyRes.json();
                        
                        if (!verifyData.success) {
                            alert('Verification failed: ' + verifyData.error);
                            setLoading(false);
                            return;
                        }

                        // Options upon success
                        setSuccess(true);
                        setName('');
                        setAmount('');
                        setMessage('');
                        setSelectedQuick(null);
                        setTipCount(prev => prev + 1);
                        setTimeout(() => setSuccess(false), 4000);
                        setLoading(false);
                    } catch (err: any) {
                        alert('Payment verification request failed');
                        setLoading(false);
                    }
                },
                prefill: {
                    name: name || 'Anonymous Hero',
                },
                theme: {
                    color: "#a855f7" 
                },
                modal: {
                    ondismiss: function() {
                        setLoading(false);
                    }
                }
            };
            
            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any){
                alert(response.error.description);
                setLoading(false);
            });
            rzp.open();

        } catch (error: any) {
            alert('Error initiating tip: ' + error.message);
            setLoading(false);
        }
    };

    const quickAmounts = [
        { value: '50', label: '₹50', emoji: '☕' },
        { value: '100', label: '₹100', emoji: '🍕' },
        { value: '500', label: '₹500', emoji: '🎮' },
        { value: '1000', label: '₹1000', emoji: '🚀' },
    ];

    const displayName = creator?.full_name || creator?.username || streamerId;

    if (creatorLoading) {
        return (
            <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
                <Loader2 size={48} className="animate-spin text-purple-500" />
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center p-6">
                <div className="text-center">
                    <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">😢</span>
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2">Creator Not Found</h2>
                    <p className="text-zinc-500 mb-6">@{streamerId} doesn't exist yet</p>
                    <Link href="/" className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm hover:scale-105 transition-all inline-block">
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center p-4 sm:p-6 selection:bg-purple-500/30 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden -z-10">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/8 blur-[150px] rounded-full animate-pulse" style={{ animationDuration: '4s' }}></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-pink-600/8 blur-[150px] rounded-full animate-pulse" style={{ animationDuration: '6s' }}></div>
                <div className="absolute top-[30%] left-[50%] w-[300px] h-[300px] bg-blue-600/5 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '5s' }}></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative"
            >
                {/* Success Overlay */}
                <AnimatePresence>
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute inset-0 z-50 flex items-center justify-center rounded-[36px] bg-[#0B0B0F]/95 backdrop-blur-xl"
                        >
                            <div className="text-center p-8">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    className="text-6xl mb-4"
                                >
                                    💜
                                </motion.div>
                                <h3 className="text-2xl font-black text-white mb-2">Tip Sent!</h3>
                                <p className="text-purple-400 font-bold">Thank you for supporting {displayName}!</p>
                                <div className="mt-4 flex items-center justify-center gap-2 text-green-400">
                                    <CheckCircle2 size={18} />
                                    <span className="text-sm font-bold">Payment Successful</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Card */}
                <div className="rounded-[36px] overflow-hidden border border-white/5 shadow-2xl relative" style={{ background: 'linear-gradient(180deg, rgba(20,15,35,0.95) 0%, rgba(11,11,15,0.98) 100%)' }}>
                    {/* Top Accent Line */}
                    <div className="h-1 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600"></div>

                    {/* Header Background */}
                    <div className="relative px-8 pt-10 pb-6">
                        <div className="absolute inset-0 bg-gradient-to-b from-purple-600/10 to-transparent"></div>

                        {/* Avatar */}
                        <div className="relative flex flex-col items-center text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', damping: 12 }}
                                className="relative mb-5"
                            >
                                <div className="absolute -inset-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
                                <div className="w-24 h-24 rounded-full border-[3px] border-purple-500/50 shadow-2xl overflow-hidden relative bg-[#1A1A24]">
                                    <img
                                        src={creator?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${streamerId}`}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {/* Online indicator */}
                                <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-[#14102B]"></div>
                            </motion.div>

                            <h1 className="text-2xl font-black text-white mb-1 uppercase tracking-tight">
                                Support <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{displayName}</span>
                            </h1>
                            <p className="text-zinc-500 text-sm font-medium mb-3">Your message will appear live on stream! 🔴</p>

                            {/* Stats Pills */}
                            <div className="flex flex-wrap gap-2">
                                {codeResolved && (
                                    <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 flex items-center gap-1">
                                        <QrCode size={10} /> QR Verified
                                    </div>
                                )}
                                <div className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-400 flex items-center gap-1">
                                    <Gift size={10} /> {tipCount} tips
                                </div>
                                <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-bold text-green-400 flex items-center gap-1">
                                    <Shield size={10} /> UPI Secure
                                </div>
                                <div className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[10px] font-bold text-yellow-400 flex items-center gap-1">
                                    <Zap size={10} /> Instant
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleDonate} className="px-8 pb-8 space-y-6">
                        {/* Nickname */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                                <User size={12} /> Your Nickname
                            </label>
                            <input
                                type="text"
                                placeholder="Anonymous Hero"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-white/5 border border-white/8 rounded-2xl px-5 py-4 focus:border-purple-500/50 outline-none transition-all font-medium text-white text-sm placeholder:text-zinc-600"
                            />
                        </div>

                        {/* Tip Amount */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                                <IndianRupee size={12} /> Tip Amount
                            </label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-black text-purple-500">₹</span>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    placeholder="0"
                                    value={amount}
                                    onChange={(e) => { setAmount(e.target.value); setSelectedQuick(null); }}
                                    className="w-full bg-white/5 border border-white/8 rounded-2xl pl-12 pr-5 py-5 focus:border-purple-500/50 outline-none transition-all text-3xl font-black text-white text-center"
                                />
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {quickAmounts.map((q) => (
                                    <button
                                        key={q.value}
                                        type="button"
                                        onClick={() => { setAmount(q.value); setSelectedQuick(q.value); }}
                                        className={`py-3 rounded-xl font-bold text-sm transition-all border cursor-pointer ${selectedQuick === q.value
                                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-transparent text-white shadow-lg shadow-purple-500/20'
                                                : 'bg-white/3 border-white/8 text-zinc-400 hover:text-white hover:border-purple-500/30 hover:bg-purple-500/5'
                                            }`}
                                    >
                                        <span className="text-xs">{q.emoji}</span> {q.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Message */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                                <MessageSquare size={12} /> Message
                            </label>
                            <textarea
                                placeholder="Say something inspiring..."
                                rows={3}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                maxLength={200}
                                className="w-full bg-white/5 border border-white/8 rounded-2xl px-5 py-4 focus:border-purple-500/50 outline-none transition-all resize-none font-medium text-white text-sm placeholder:text-zinc-600 placeholder:italic"
                            ></textarea>
                            <div className="text-right">
                                <span className="text-[9px] text-zinc-700 font-bold">{message.length}/200</span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={loading || !amount || Number(amount) < 1}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-[length:200%_auto] hover:bg-right transition-all duration-500 font-black text-lg flex items-center justify-center gap-3 shadow-2xl shadow-purple-500/20 uppercase tracking-tight text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            style={{ minHeight: '60px' }}
                        >
                            {loading ? (
                                <><Loader2 size={22} className="animate-spin" /> Processing...</>
                            ) : (
                                <>
                                    Send Instant Tip
                                    <Heart className="w-5 h-5 group-hover:fill-white transition-all" />
                                </>
                            )}
                        </motion.button>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-2 pt-2">
                            <div className="p-2.5 rounded-xl bg-white/3 text-center">
                                <Shield size={14} className="text-green-400 mx-auto mb-1" />
                                <p className="text-[8px] text-zinc-600 font-bold uppercase">Secure</p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white/3 text-center">
                                <Zap size={14} className="text-yellow-400 mx-auto mb-1" />
                                <p className="text-[8px] text-zinc-600 font-bold uppercase">Instant</p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white/3 text-center">
                                <Sparkles size={14} className="text-purple-400 mx-auto mb-1" />
                                <p className="text-[8px] text-zinc-600 font-bold uppercase">Live Alert</p>
                            </div>
                        </div>
                    </form>

                    {/* Top Supporters */}
                    {topSupporters.length > 0 && (
                        <div className="px-8 pb-6">
                            <div className="p-4 rounded-2xl bg-white/3 border border-white/5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-1.5">
                                    <Trophy size={12} className="text-yellow-400" /> Top Supporters
                                </p>
                                <div className="space-y-2">
                                    {topSupporters.map((s, i) => (
                                        <div key={s.sender_name} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                                                <span className="text-xs font-bold text-zinc-300">{s.sender_name}</span>
                                            </div>
                                            <span className="text-xs font-black text-green-400">₹{s.total.toLocaleString('en-IN')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer — Powered by Harsh Community */}
                    <div className="px-8 pb-8">
                        <div className="pt-6 border-t border-white/5 flex flex-col items-center gap-3">
                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Powered by</p>
                            <Link href="/" className="flex items-center gap-2 group transition-all hover:scale-105">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shadow-lg group-hover:shadow-purple-500/30">
                                    <span className="text-white font-black text-xs">H</span>
                                </div>
                                <span className="font-black text-sm text-white group-hover:text-purple-400 transition-colors tracking-tight">
                                    Harsh Community
                                </span>
                            </Link>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-[8px] text-zinc-700 font-bold uppercase tracking-widest">Safe • Instant • UPI Powered</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
