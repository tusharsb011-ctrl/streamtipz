'use client'

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart, History, IndianRupee, LogOut, MessageSquare, Clock,
    ChevronRight, Loader2, Search, User, ExternalLink, Star,
    TrendingUp, Gift, Sparkles, Send, Bell, Eye
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface SentTip {
    id: number;
    creator_id: string | null;
    sender_name: string | null;
    sender_id?: string | null;
    amount: number;
    message: string | null;
    created_at: string | null;
    creator_name?: string;
    creator_username?: string;
}

interface FavoriteCreator {
    creator_id: string;
    creator_name: string;
    creator_username: string;
    total_tips: number;
    total_amount: number;
    last_tip_date: string;
}

export default function ViewerDashboard() {
    const { user, loading: authLoading, signOut } = useAuth();
    const [sentTips, setSentTips] = useState<SentTip[]>([]);
    const [favorites, setFavorites] = useState<FavoriteCreator[]>([]);
    const [stats, setStats] = useState({ totalSpent: 0, totalTips: 0, creatorsSupported: 0 });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'creators'>('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            fetchViewerData();
        }
    }, [user, authLoading]);

    const fetchViewerData = async () => {
        setLoading(true);
        try {
            // Fetch tips that this user sent (match by sender_id OR sender_name/email)
            const displayName = user!.user_metadata?.username || user!.user_metadata?.full_name || user!.email?.split('@')[0] || '';

            // Get tips sent by this user (by sender_id if available, fallback to sender_name)
            let tips: SentTip[] = [];

            // Try by sender_id first
            const { data: tipsBySenderId } = await supabase
                .from('tips')
                .select('*')
                .eq('sender_id', user!.id)
                .order('created_at', { ascending: false });

            if (tipsBySenderId && tipsBySenderId.length > 0) {
                tips = tipsBySenderId as SentTip[];
            } else {
                // Fallback: match by sender_name
                const { data: tipsByName } = await supabase
                    .from('tips')
                    .select('*')
                    .eq('sender_name', displayName)
                    .order('created_at', { ascending: false });
                tips = (tipsByName || []) as SentTip[];
            }

            // Enrich tips with creator profile info
            const creatorIds = [...new Set(tips.map(t => t.creator_id).filter((id): id is string => !!id))];
            const { data: creatorProfiles } = await supabase
                .from('profiles')
                .select('id, full_name, username')
                .in('id', creatorIds.length > 0 ? creatorIds : ['none']);

            const creatorMap = new Map<string, { name: string; username: string }>();
            creatorProfiles?.forEach(p => {
                creatorMap.set(p.id, { name: p.full_name || p.username || 'Unknown', username: p.username || '' });
            });

            const enrichedTips = tips.map(t => ({
                ...t,
                creator_name: creatorMap.get(t.creator_id || '')?.name || 'Unknown Creator',
                creator_username: creatorMap.get(t.creator_id || '')?.username || '',
            }));

            setSentTips(enrichedTips);

            // Calculate stats
            const totalSpent = enrichedTips.reduce((sum, t) => sum + Number(t.amount), 0);
            const uniqueCreators = new Set(enrichedTips.map(t => t.creator_id));
            setStats({
                totalSpent,
                totalTips: enrichedTips.length,
                creatorsSupported: uniqueCreators.size,
            });

            // Calculate favorites (top creators by total tips)
            const creatorStats = new Map<string, FavoriteCreator>();
            enrichedTips.forEach(t => {
                const existing = creatorStats.get(t.creator_id || '');
                if (existing) {
                    existing.total_tips += 1;
                    existing.total_amount += Number(t.amount);
                    if (t.created_at && t.created_at > existing.last_tip_date) {
                        existing.last_tip_date = t.created_at;
                    }
                } else {
                    creatorStats.set(t.creator_id || '', {
                        creator_id: t.creator_id || '',
                        creator_name: t.creator_name || 'Unknown',
                        creator_username: t.creator_username || '',
                        total_tips: 1,
                        total_amount: Number(t.amount),
                        last_tip_date: t.created_at || '',
                    });
                }
            });
            setFavorites(Array.from(creatorStats.values()).sort((a, b) => b.total_amount - a.total_amount));

        } catch (err) {
            console.error('Viewer data error:', err);
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        await signOut();
        router.push('/login');
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatTime = (dateStr: string | null) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    const timeAgo = (dateStr: string | null) => {
        if (!dateStr) return '';
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={48} className="animate-spin text-pink-500" />
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const displayName = user.user_metadata?.username || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Viewer';

    const filteredTips = searchQuery
        ? sentTips.filter(t =>
            t.creator_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.message?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : sentTips;

    return (
        <div className="min-h-screen bg-[#0B0B0F] flex text-white selection:bg-pink-500/30">
            {/* Sidebar */}
            <aside className="w-72 border-r border-white/5 p-8 flex flex-col gap-3 backdrop-blur-xl bg-white/[0.02] relative z-10 shrink-0 hidden lg:flex">
                <div className="text-2xl font-black mb-8 flex items-center gap-3 tracking-tighter uppercase">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-600 to-rose-600 flex items-center justify-center shadow-lg">
                        <Heart size={20} className="text-white" />
                    </div>
                    WaveTipz
                </div>

                {/* Profile Mini Card */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold">
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-white truncate">{displayName}</p>
                            <p className="text-[10px] text-pink-400 font-bold uppercase tracking-widest">Viewer</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <SidebarBtn
                        icon={<Eye size={20} />}
                        label="Overview"
                        active={activeTab === 'overview'}
                        onClick={() => setActiveTab('overview')}
                    />
                    <SidebarBtn
                        icon={<History size={20} />}
                        label="Tip History"
                        active={activeTab === 'history'}
                        onClick={() => setActiveTab('history')}
                    />
                    <SidebarBtn
                        icon={<Star size={20} />}
                        label="My Creators"
                        active={activeTab === 'creators'}
                        onClick={() => setActiveTab('creators')}
                    />
                </div>

                <div className="mt-auto pt-8 space-y-4">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-white/[0.03] hover:bg-white/5 transition-all text-sm font-bold uppercase tracking-widest text-zinc-400 hover:text-white border border-white/5"
                    >
                        <ExternalLink size={18} />
                        Browse Creators
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-white/[0.03] hover:bg-red-500/10 transition-all text-sm font-bold uppercase tracking-widest text-zinc-500 hover:text-red-500 w-full border border-white/5 cursor-pointer"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 lg:p-10 overflow-y-auto relative pb-24 lg:pb-10">
                {/* Background */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-500/5 blur-[150px] -z-10"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-rose-500/5 blur-[150px] -z-10"></div>

                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl lg:text-4xl font-black tracking-tighter mb-1">
                        Hey, <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">{displayName}</span>! 💜
                    </h1>
                    <p className="text-zinc-500 font-medium">Track your tips and support your favorite creators</p>
                </motion.header>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
                >
                    <StatCard
                        icon={<IndianRupee size={22} />}
                        label="Total Spent"
                        value={`₹${stats.totalSpent.toLocaleString('en-IN')}`}
                        subvalue="All tips combined"
                        color="pink"
                    />
                    <StatCard
                        icon={<Send size={22} />}
                        label="Tips Sent"
                        value={String(stats.totalTips)}
                        subvalue="Total transactions"
                        color="purple"
                    />
                    <StatCard
                        icon={<Star size={22} />}
                        label="Creators Supported"
                        value={String(stats.creatorsSupported)}
                        subvalue="Unique streamers"
                        color="rose"
                    />
                </motion.div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-6 p-1.5 rounded-2xl bg-white/[0.03] border border-white/5 w-fit">
                    {[
                        { id: 'overview' as const, icon: <Eye size={16} />, label: 'Overview' },
                        { id: 'history' as const, icon: <History size={16} />, label: 'Tip History' },
                        { id: 'creators' as const, icon: <Star size={16} />, label: 'My Creators' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all cursor-pointer ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg'
                                : 'text-zinc-500 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {tab.icon} <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* ─── OVERVIEW TAB ─── */}
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* Recent Tips */}
                            <div className="rounded-[28px] bg-white/[0.02] border border-white/5 overflow-hidden">
                                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                    <h2 className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                                        <Send size={20} className="text-pink-400" /> Recent Tips Sent
                                    </h2>
                                    <button onClick={() => setActiveTab('history')} className="text-pink-400 text-xs font-bold uppercase tracking-widest hover:text-pink-300 cursor-pointer">
                                        View All →
                                    </button>
                                </div>

                                {sentTips.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                                            <Gift size={36} className="text-zinc-700" />
                                        </div>
                                        <h3 className="text-lg font-bold text-zinc-400 mb-2">No tips sent yet</h3>
                                        <p className="text-zinc-600 text-sm mb-6">Find a creator and send your first tip!</p>
                                        <Link href="/" className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold text-sm hover:scale-105 transition-all inline-block">
                                            Browse Creators
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-white/5">
                                        {sentTips.slice(0, 5).map((tip, idx) => (
                                            <TipRow key={tip.id} tip={tip} idx={idx} formatDate={formatDate} timeAgo={timeAgo} />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Favorite Creators */}
                            {favorites.length > 0 && (
                                <div className="rounded-[28px] bg-white/[0.02] border border-white/5 overflow-hidden">
                                    <div className="p-6 border-b border-white/5">
                                        <h2 className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                                            <Star size={20} className="text-yellow-400" /> Top Creators You Support
                                        </h2>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                                        {favorites.slice(0, 6).map((fav, idx) => (
                                            <Link
                                                key={fav.creator_id}
                                                href={`/${fav.creator_username}`}
                                                className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-pink-500/30 hover:bg-pink-500/5 transition-all group"
                                            >
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${idx === 0 ? 'bg-gradient-to-br from-yellow-500 to-orange-500' : idx === 1 ? 'bg-gradient-to-br from-zinc-300 to-zinc-500' : 'bg-gradient-to-br from-pink-500 to-rose-500'}`}>
                                                        {idx < 3 ? ['🥇', '🥈', '🥉'][idx] : fav.creator_name.charAt(0)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-sm text-white truncate group-hover:text-pink-300 transition-colors">{fav.creator_name}</p>
                                                        <p className="text-[10px] text-zinc-500">@{fav.creator_username}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-zinc-500">{fav.total_tips} tips</span>
                                                    <span className="text-sm font-black text-green-400">₹{fav.total_amount.toLocaleString('en-IN')}</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ─── HISTORY TAB ─── */}
                    {activeTab === 'history' && (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="rounded-[28px] bg-white/[0.02] border border-white/5 overflow-hidden">
                                {/* Search */}
                                <div className="p-6 border-b border-white/5">
                                    <div className="relative">
                                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search by creator or message..."
                                            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-pink-500/50 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                {/* Table Header */}
                                <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 bg-white/[0.03] text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-white/5">
                                    <div className="col-span-3">Date</div>
                                    <div className="col-span-3">To Creator</div>
                                    <div className="col-span-2 text-right">Amount</div>
                                    <div className="col-span-4">Your Message</div>
                                </div>

                                {filteredTips.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <p className="text-zinc-500">
                                            {searchQuery ? `No tips matching "${searchQuery}"` : 'No tips sent yet'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
                                        {filteredTips.map((tip, idx) => (
                                            <TipRow key={tip.id} tip={tip} idx={idx} formatDate={formatDate} timeAgo={timeAgo} />
                                        ))}
                                    </div>
                                )}

                                <div className="p-4 border-t border-white/5 text-center text-xs text-zinc-600">
                                    {filteredTips.length} tip{filteredTips.length !== 1 ? 's' : ''} total
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ─── CREATORS TAB ─── */}
                    {activeTab === 'creators' && (
                        <motion.div
                            key="creators"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {favorites.length === 0 ? (
                                <div className="rounded-[28px] bg-white/[0.02] border border-white/5 p-12 text-center">
                                    <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                                        <Star size={36} className="text-zinc-700" />
                                    </div>
                                    <h3 className="text-lg font-bold text-zinc-400 mb-2">No creators yet</h3>
                                    <p className="text-zinc-600 text-sm mb-6">Start supporting creators to see them here!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {favorites.map((fav, idx) => (
                                        <motion.div
                                            key={fav.creator_id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.05 * idx }}
                                        >
                                            <Link
                                                href={`/${fav.creator_username}`}
                                                className="block p-6 rounded-[24px] bg-white/[0.02] border border-white/5 hover:border-pink-500/30 hover:bg-pink-500/5 transition-all group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black ${idx === 0 ? 'bg-gradient-to-br from-yellow-500 to-orange-500' : 'bg-gradient-to-br from-pink-500 to-rose-500'} text-white`}>
                                                        {fav.creator_name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-black text-white text-lg group-hover:text-pink-300 transition-colors truncate">{fav.creator_name}</p>
                                                        <p className="text-zinc-500 text-sm">@{fav.creator_username}</p>
                                                    </div>
                                                    <ExternalLink size={18} className="text-zinc-600 group-hover:text-pink-400 transition-colors shrink-0" />
                                                </div>

                                                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/5">
                                                    <div className="text-center">
                                                        <p className="text-lg font-black text-green-400">₹{fav.total_amount.toLocaleString('en-IN')}</p>
                                                        <p className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">Total Given</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-lg font-black text-purple-400">{fav.total_tips}</p>
                                                        <p className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">Tips</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-lg font-black text-pink-400">{timeAgo(fav.last_tip_date)}</p>
                                                        <p className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">Last Tip</p>
                                                    </div>
                                                </div>

                                                <div className="mt-4">
                                                    <div className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600/20 to-rose-600/20 border border-pink-500/20 text-center text-sm font-bold text-pink-400 group-hover:from-pink-600 group-hover:to-rose-600 group-hover:text-white transition-all">
                                                        Send Tip →
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Mobile Bottom Nav */}
                <div className="fixed bottom-0 left-0 right-0 lg:hidden p-3 backdrop-blur-xl bg-[#0B0B0F]/90 border-t border-white/5 z-50">
                    <div className="flex justify-around">
                        <button onClick={() => setActiveTab('overview')} className={`flex flex-col items-center gap-1 cursor-pointer ${activeTab === 'overview' ? 'text-pink-400' : 'text-zinc-500'}`}>
                            <Eye size={20} />
                            <span className="text-[9px] font-bold uppercase">Overview</span>
                        </button>
                        <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 cursor-pointer ${activeTab === 'history' ? 'text-pink-400' : 'text-zinc-500'}`}>
                            <History size={20} />
                            <span className="text-[9px] font-bold uppercase">History</span>
                        </button>
                        <button onClick={() => setActiveTab('creators')} className={`flex flex-col items-center gap-1 cursor-pointer ${activeTab === 'creators' ? 'text-pink-400' : 'text-zinc-500'}`}>
                            <Star size={20} />
                            <span className="text-[9px] font-bold uppercase">Creators</span>
                        </button>
                        <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-zinc-500 cursor-pointer">
                            <LogOut size={20} />
                            <span className="text-[9px] font-bold uppercase">Logout</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

/* ── Sub-components ── */

function TipRow({ tip, idx, formatDate, timeAgo }: {
    tip: SentTip;
    idx: number;
    formatDate: (d: string | null) => string;
    timeAgo: (d: string | null) => string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.03 * idx }}
            className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-6 py-5 hover:bg-white/[0.02] transition-all"
        >
            {/* Date */}
            <div className="col-span-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-pink-500/10 flex items-center justify-center shrink-0">
                    <Clock size={16} className="text-pink-400" />
                </div>
                <div>
                    <p className="text-sm font-bold text-white">{formatDate(tip.created_at)}</p>
                    <p className="text-[10px] text-zinc-600">{timeAgo(tip.created_at)}</p>
                </div>
            </div>

            {/* Creator */}
            <div className="col-span-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0 text-purple-400 font-bold text-sm">
                    {(tip.creator_name || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                    <p className="text-sm font-bold text-white">{tip.creator_name}</p>
                    {tip.creator_username && (
                        <p className="text-[10px] text-zinc-600">@{tip.creator_username}</p>
                    )}
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
    );
}

function StatCard({ icon, label, value, subvalue, color }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    subvalue: string;
    color: string;
}) {
    const colors: Record<string, { bg: string, text: string, border: string }> = {
        pink: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
        purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
        rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
    };
    const c = colors[color] || colors.pink;

    return (
        <div className={`p-5 rounded-[24px] bg-white/[0.02] border ${c.border} hover:scale-[1.02] transition-all hover:shadow-xl`}>
            <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center ${c.text} mb-3`}>
                {icon}
            </div>
            <p className="text-2xl font-black text-white mb-0.5">{value}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</p>
            <p className="text-[10px] text-zinc-600 mt-1">{subvalue}</p>
        </div>
    );
}

function SidebarBtn({ icon, label, active, onClick }: {
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all font-bold text-sm uppercase tracking-widest w-full cursor-pointer ${active
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg'
                : 'text-zinc-500 hover:text-white hover:bg-white/5'
            }`}
        >
            {icon}
            {label}
        </button>
    );
}
