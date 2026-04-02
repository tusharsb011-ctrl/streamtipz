'use client'

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Settings, History, ExternalLink, TrendingUp,
    Users, Wallet, LogOut, Bell, Globe, IndianRupee, Copy,
    CheckCircle, Eye, Zap, ArrowUpRight, ArrowDownRight,
    CreditCard, MessageSquare, Clock, ChevronRight, Loader2,
    Shield, QrCode, Smartphone, Star, Gift, Link2
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { tipsApi, profileApi } from '@/lib/api';

interface Tip {
    id: number;
    sender_name: string | null;
    amount: number;
    message: string | null;
    created_at: string | null;
}

interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    username: string | null;
    role: string | null;
}

export default function Dashboard() {
    const { user, loading: authLoading, signOut } = useAuth();
    const [tips, setTips] = useState<Tip[]>([]);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [stats, setStats] = useState({ total: 0, count: 0, average: 0 });
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'account' | 'service'>('dashboard');
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            fetchData();

            const channel = supabase
                .channel('realtime_tips')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'tips',
                        filter: `creator_id=eq.${user.id}`
                    },
                    (payload) => {
                        const newTip = payload.new as Tip;
                        setTips(prev => [newTip, ...prev]);
                        setStats(prev => ({
                            total: prev.total + newTip.amount,
                            count: prev.count + 1,
                            average: (prev.total + newTip.amount) / (prev.count + 1),
                        }));
                    }
                )
                .subscribe();

            return () => { supabase.removeChannel(channel); };
        }
    }, [user, authLoading, router]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Try backend API first
            const [tipsRes, profileRes] = await Promise.all([
                tipsApi.getMyTips().catch(() => null),
                profileApi.getMyProfile().catch(() => null),
            ]);

            if (tipsRes?.success && tipsRes.data?.tips) {
                setTips(tipsRes.data.tips);
            } else {
                // Fallback to direct Supabase
                const { data } = await supabase
                    .from('tips')
                    .select('*')
                    .eq('creator_id', user!.id)
                    .order('created_at', { ascending: false })
                    .limit(20);
                if (data) setTips(data);
            }

            if (profileRes?.success && profileRes.data?.profile) {
                setProfile(profileRes.data.profile);
            }

            // Calculate stats
            const { data: allTips } = await supabase
                .from('tips')
                .select('amount')
                .eq('creator_id', user!.id);
            if (allTips && allTips.length > 0) {
                const total = allTips.reduce((sum, t) => sum + Number(t.amount), 0);
                setStats({
                    total,
                    count: allTips.length,
                    average: total / allTips.length,
                });
            }
        } catch (err) {
            console.error('Dashboard error:', err);
        }
        setLoading(false);
    };

    const copyTipLink = () => {
        const link = `${window.location.origin}/${profile?.username || user?.user_metadata?.username || ''}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLogout = async () => {
        await signOut();
        router.push('/login');
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={48} className="animate-spin text-primary" />
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const displayName = profile?.full_name || user.user_metadata?.username || user.email?.split('@')[0] || 'Creator';
    const username = profile?.username || user.user_metadata?.username || 'yourname';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'streamtipz.in';
    const tipLink = `${baseUrl}/${username}`;
    const earnings = stats.total * 0.92; // 92% after 8% fee

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatTime = (dateStr: string | null) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    const timeAgo = (dateStr: string | null) => {
        if (!dateStr) return '';
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    };

    return (
        <div className="min-h-screen bg-[#0B0B0F] flex text-white selection:bg-primary/30">
            {/* Sidebar */}
            <aside className="w-72 border-r border-white/5 p-8 flex flex-col gap-3 glass relative z-10 shrink-0 hidden lg:flex">
                <div className="text-2xl font-black mb-8 flex items-center gap-3 tracking-tighter uppercase">
                    <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg glow-primary">
                        <span className="text-white font-black text-xl">₹</span>
                    </div>
                    StreamTipz
                </div>

                {/* Profile Mini Card */}
                <div className="p-4 rounded-2xl glass border border-white/5 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-white truncate">{displayName}</p>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Creator</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <SidebarLink href="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" active />
                    <SidebarLink href="/dashboard/tips" icon={<History size={20} />} label="History" />
                    <SidebarLink href="/dashboard/settings" icon={<Settings size={20} />} label="Settings" />
                    <SidebarLink href="/dashboard/widgets" icon={<Globe size={20} />} label="Widgets" />
                </div>

                <div className="mt-auto pt-8 space-y-4">
                    <Link
                        href={`/${username}`}
                        target="_blank"
                        className="flex items-center gap-3 px-5 py-4 rounded-2xl glass hover:bg-white/5 transition-all text-sm font-bold uppercase tracking-widest text-zinc-400 hover:text-white border border-white/5"
                    >
                        <ExternalLink size={18} />
                        Live Page
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-5 py-4 rounded-2xl glass hover:bg-red-500/10 transition-all text-sm font-bold uppercase tracking-widest text-zinc-500 hover:text-red-500 w-full border border-white/5 cursor-pointer"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 lg:p-10 overflow-y-auto relative">
                {/* Background glows */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 blur-[150px] -z-10"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-pink-500/5 blur-[150px] -z-10"></div>

                {/* Welcome Header */}
                <motion.header
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl lg:text-4xl font-black tracking-tighter mb-1">
                        Welcome, <span className="gradient-text">{displayName}</span>! 👋
                    </h1>
                    <p className="text-zinc-500 font-medium">Check your dashboard & manage your account</p>
                </motion.header>

                {/* Shop URL Bar — StreamTipz Style */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8 p-5 rounded-[24px] border border-purple-500/20 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/5 to-purple-600/10"></div>
                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                                <Link2 size={20} className="text-purple-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-widest text-purple-400/70 mb-0.5">Your Shop URL</p>
                                <p className="text-white font-bold truncate">{tipLink}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <button
                                onClick={copyTipLink}
                                className={`px-5 py-3 rounded-xl flex items-center gap-2 font-bold text-sm uppercase tracking-widest transition-all cursor-pointer ${copied
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:scale-105 shadow-lg'
                                    }`}
                            >
                                {copied ? <><CheckCircle size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                            </button>
                            <Link
                                href={`/${username}`}
                                target="_blank"
                                className="px-3 py-3 rounded-xl glass border border-white/10 hover:bg-white/5 transition-all flex items-center"
                            >
                                <Eye size={18} className="text-zinc-400" />
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
                >
                    <StatCard
                        icon={<Wallet size={22} />}
                        label="Total Earnings"
                        value={`₹${stats.total.toLocaleString('en-IN')}`}
                        subvalue={`After fee: ₹${earnings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                        color="purple"
                        trend="+92%"
                    />
                    <StatCard
                        icon={<Gift size={22} />}
                        label="Total Tips"
                        value={String(stats.count)}
                        subvalue="All time"
                        color="pink"
                    />
                    <StatCard
                        icon={<TrendingUp size={22} />}
                        label="Average Tip"
                        value={`₹${stats.average.toFixed(0)}`}
                        subvalue="Per transaction"
                        color="blue"
                    />
                    <StatCard
                        icon={<Users size={22} />}
                        label="Unique Supporters"
                        value={String(new Set(tips.map(t => t.sender_name)).size)}
                        subvalue="Fans who tipped"
                        color="green"
                    />
                </motion.div>

                {/* Earnings Callout Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8 p-5 rounded-[24px] bg-gradient-to-r from-green-600/10 via-emerald-600/5 to-green-600/10 border border-green-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <IndianRupee size={20} className="text-green-400" />
                        </div>
                        <div>
                            <p className="text-green-400 font-bold text-sm">💰 Earnings (after 8% fee)</p>
                            <p className="text-white font-black text-2xl">₹{earnings.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
                            <p className="text-[9px] text-green-400/70 font-bold uppercase">Payout</p>
                            <p className="text-green-400 font-bold text-sm">Instant</p>
                        </div>
                        <div className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
                            <p className="text-[9px] text-green-400/70 font-bold uppercase">You Keep</p>
                            <p className="text-green-400 font-bold text-sm">92%</p>
                        </div>
                        <div className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
                            <p className="text-[9px] text-green-400/70 font-bold uppercase">UPI</p>
                            <p className="text-green-400 font-bold text-sm">Direct</p>
                        </div>
                    </div>
                </motion.div>

                {/* Tab Navigation — StreamTipz Style */}
                <div className="flex gap-2 mb-6 p-1.5 rounded-2xl glass border border-white/5 w-fit">
                    {[
                        { id: 'dashboard' as const, icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
                        { id: 'account' as const, icon: <Settings size={16} />, label: 'Account Settings' },
                        { id: 'service' as const, icon: <Zap size={16} />, label: 'Service Settings' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                if (tab.id === 'account') router.push('/dashboard/settings');
                                else if (tab.id === 'service') router.push('/dashboard/widgets');
                                else setActiveTab(tab.id);
                            }}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all cursor-pointer ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                    : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {tab.icon} <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Recent Transactions — StreamTipz Style */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="rounded-[32px] glass border border-white/5 overflow-hidden"
                >
                    <div className="p-6 lg:p-8 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                <History size={22} className="text-purple-400" /> Recent Transactions
                            </h2>
                            <p className="text-zinc-500 text-sm mt-1">{tips.length} total tips received</p>
                        </div>
                        <Link
                            href="/dashboard/tips"
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-lg"
                        >
                            View All <ChevronRight size={14} />
                        </Link>
                    </div>

                    {tips.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                                <Gift size={36} className="text-zinc-700" />
                            </div>
                            <h3 className="text-lg font-bold text-zinc-400 mb-2">No tips yet</h3>
                            <p className="text-zinc-600 text-sm mb-6">Share your tip page to start receiving support from fans!</p>
                            <button
                                onClick={copyTipLink}
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm hover:scale-105 transition-all cursor-pointer"
                            >
                                <Copy size={14} className="inline mr-2" /> Copy Your Tip Link
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            {/* Table Header */}
                            <div className="hidden sm:grid grid-cols-12 gap-4 px-6 lg:px-8 py-4 bg-white/3 text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-white/5">
                                <div className="col-span-3">Date & Time</div>
                                <div className="col-span-3">From</div>
                                <div className="col-span-2 text-right">Amount</div>
                                <div className="col-span-4">Message</div>
                            </div>

                            {/* Table Rows */}
                            <div className="divide-y divide-white/5">
                                {tips.slice(0, 10).map((tip, idx) => (
                                    <motion.div
                                        key={tip.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.03 * idx }}
                                        className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-6 lg:px-8 py-5 hover:bg-white/3 transition-all group"
                                    >
                                        {/* Date */}
                                        <div className="col-span-3 flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                                                <Clock size={16} className="text-purple-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{formatDate(tip.created_at)}</p>
                                                <p className="text-[10px] text-zinc-600">{formatTime(tip.created_at)}</p>
                                            </div>
                                        </div>

                                        {/* Sender */}
                                        <div className="col-span-3 flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-pink-500/10 flex items-center justify-center shrink-0 text-pink-400 font-bold text-sm">
                                                {(tip.sender_name || 'A').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{tip.sender_name || 'Anonymous'}</p>
                                                <p className="text-[10px] text-zinc-600">{timeAgo(tip.created_at)}</p>
                                            </div>
                                        </div>

                                        {/* Amount */}
                                        <div className="col-span-2 flex items-center sm:justify-end">
                                            <span className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 font-black text-sm border border-green-500/20">
                                                ₹{Number(tip.amount).toLocaleString('en-IN')}
                                            </span>
                                        </div>

                                        {/* Message */}
                                        <div className="col-span-4 flex items-center">
                                            <p className="text-sm text-zinc-400 truncate">
                                                {tip.message ? (
                                                    <><MessageSquare size={12} className="inline mr-1.5 text-zinc-600" />{tip.message}</>
                                                ) : (
                                                    <span className="text-zinc-600 italic">No message</span>
                                                )}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Table Footer */}
                            {tips.length > 10 && (
                                <div className="px-6 lg:px-8 py-4 border-t border-white/5 text-center">
                                    <Link
                                        href="/dashboard/tips"
                                        className="text-purple-400 hover:text-purple-300 font-bold text-sm uppercase tracking-widest transition-colors"
                                    >
                                        View all {tips.length} transactions →
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>

                {/* Quick Actions Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4"
                >
                    <Link href="/dashboard/settings" className="p-6 rounded-[24px] glass border border-white/5 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all group">
                        <CreditCard size={24} className="text-purple-400 mb-3" />
                        <h3 className="font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">Payment Settings</h3>
                        <p className="text-zinc-600 text-xs">Setup UPI, min tip amount</p>
                    </Link>
                    <Link href="/dashboard/widgets" className="p-6 rounded-[24px] glass border border-white/5 hover:border-pink-500/30 hover:bg-pink-500/5 transition-all group">
                        <Globe size={24} className="text-pink-400 mb-3" />
                        <h3 className="font-bold text-white mb-1 group-hover:text-pink-300 transition-colors">OBS Widgets</h3>
                        <p className="text-zinc-600 text-xs">Alert box & stream overlay</p>
                    </Link>
                    <Link href="/dashboard/settings" className="p-6 rounded-[24px] glass border border-white/5 hover:border-green-500/30 hover:bg-green-500/5 transition-all group">
                        <Bell size={24} className="text-green-400 mb-3" />
                        <h3 className="font-bold text-white mb-1 group-hover:text-green-300 transition-colors">Alert Themes</h3>
                        <p className="text-zinc-600 text-xs">Customize tip notifications</p>
                    </Link>
                </motion.div>

                {/* Mobile Nav (for small screens) */}
                <div className="fixed bottom-0 left-0 right-0 lg:hidden p-3 glass border-t border-white/5 z-50">
                    <div className="flex justify-around">
                        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-purple-400">
                            <LayoutDashboard size={20} />
                            <span className="text-[9px] font-bold uppercase">Dashboard</span>
                        </Link>
                        <Link href="/dashboard/tips" className="flex flex-col items-center gap-1 text-zinc-500">
                            <History size={20} />
                            <span className="text-[9px] font-bold uppercase">History</span>
                        </Link>
                        <Link href="/dashboard/settings" className="flex flex-col items-center gap-1 text-zinc-500">
                            <Settings size={20} />
                            <span className="text-[9px] font-bold uppercase">Settings</span>
                        </Link>
                        <Link href="/dashboard/widgets" className="flex flex-col items-center gap-1 text-zinc-500">
                            <Globe size={20} />
                            <span className="text-[9px] font-bold uppercase">Widgets</span>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ icon, label, value, subvalue, color, trend }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    subvalue: string;
    color: string;
    trend?: string;
}) {
    const colors: Record<string, { bg: string, text: string, border: string, glow: string }> = {
        purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', glow: 'hover:shadow-purple-500/10' },
        pink: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20', glow: 'hover:shadow-pink-500/10' },
        blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', glow: 'hover:shadow-blue-500/10' },
        green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', glow: 'hover:shadow-green-500/10' },
    };
    const c = colors[color] || colors.purple;

    return (
        <div className={`p-5 rounded-[24px] glass border ${c.border} hover:scale-[1.02] transition-all ${c.glow} hover:shadow-xl`}>
            <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center ${c.text}`}>
                    {icon}
                </div>
                {trend && (
                    <span className={`text-[10px] font-bold ${c.text} px-2 py-1 rounded-lg ${c.bg}`}>
                        {trend}
                    </span>
                )}
            </div>
            <p className="text-2xl font-black text-white mb-0.5">{value}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</p>
            <p className="text-[10px] text-zinc-600 mt-1">{subvalue}</p>
        </div>
    );
}

function SidebarLink({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all font-bold text-sm uppercase tracking-widest ${active
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
        >
            {icon}
            {label}
        </Link>
    );
}
