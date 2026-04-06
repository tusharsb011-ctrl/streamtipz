'use client'

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    History, LayoutDashboard, Settings, Globe, ExternalLink, LogOut,
    ChevronLeft, ChevronRight, Search, TrendingUp, IndianRupee, Users,
    Calendar
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { tipsApi } from '@/lib/api';

interface Tip {
    id: number;
    sender_name: string | null;
    amount: number;
    message: string | null;
    created_at: string | null;
}

interface Stats {
    total_tips: number;
    total_amount: number;
    average_amount: number;
}

export default function TipsHistoryPage() {
    const { user, loading: authLoading, signOut } = useAuth();
    const router = useRouter();

    const [tips, setTips] = useState<Tip[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [total, setTotal] = useState(0);
    const LIMIT = 20;

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            fetchData();
        }
    }, [user, authLoading, router, page]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [tipsRes, statsRes] = await Promise.all([
                tipsApi.getMyTips(LIMIT, page * LIMIT),
                tipsApi.getStats(),
            ]);

            if (tipsRes.success) {
                setTips(tipsRes.data.tips);
                setHasMore(tipsRes.data.pagination.has_more);
                setTotal(tipsRes.data.pagination.total);
            }

            if (statsRes.success) {
                setStats(statsRes.data.stats);
            }
        } catch (err) {
            console.error('Failed to fetch tips:', err);
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        await signOut();
        router.push('/login');
    };

    const filteredTips = tips.filter(tip =>
        !searchQuery ||
        (tip.sender_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tip.message || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading History...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const displayName = user.user_metadata?.username || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Creator';

    return (
        <div className="min-h-screen bg-[#0B0B0F] flex text-white selection:bg-primary/30">
            {/* Sidebar */}
            <aside className="w-72 border-r border-white/5 p-8 flex flex-col gap-3 glass relative z-10 shrink-0 hidden lg:flex">
                <div className="text-2xl font-black mb-12 flex items-center gap-3 tracking-tighter uppercase">
                    <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg glow-primary">
                        <span className="text-white font-black text-xl">₹</span>
                    </div>
                    WaveTipz
                </div>

                <div className="space-y-1">
                    <SidebarLink href="/dashboard" icon={<LayoutDashboard size={20} />} label="Overview" />
                    <SidebarLink href="/dashboard/tips" icon={<History size={20} />} label="History" active />
                    <SidebarLink href="/dashboard/settings" icon={<Settings size={20} />} label="Settings" />
                    <SidebarLink href="/dashboard/widgets" icon={<Globe size={20} />} label="Widgets" />
                </div>

                <div className="mt-auto pt-8 space-y-4">
                    <Link
                        href={`/${displayName}`}
                        target="_blank"
                        className="flex items-center gap-3 px-5 py-4 rounded-2xl glass hover:bg-white/5 transition-all text-sm font-bold uppercase tracking-widest text-zinc-400 hover:text-white border border-white/5"
                    >
                        <ExternalLink size={18} />
                        Live Page
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-5 py-4 rounded-2xl glass hover:bg-red-500/10 transition-all text-sm font-bold uppercase tracking-widest text-zinc-500 hover:text-red-500 w-full border border-white/5"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 lg:p-12 overflow-y-auto relative">
                <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-secondary/5 blur-[150px] -z-10"></div>

                {/* Header */}
                <header className="mb-10">
                    <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter mb-2">
                        <span className="gradient-text">Tips History</span>
                    </h1>
                    <p className="text-zinc-500 font-medium">View all tips you've received.</p>
                </header>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                        {[
                            { label: 'Total Earned', value: `₹${stats.total_amount.toLocaleString()}`, icon: <IndianRupee className="text-primary" size={20} />, color: 'border-primary/20' },
                            { label: 'Total Tips', value: stats.total_tips.toString(), icon: <Users className="text-secondary" size={20} />, color: 'border-secondary/20' },
                            { label: 'Average Tip', value: `₹${stats.average_amount}`, icon: <TrendingUp className="text-green-500" size={20} />, color: 'border-green-500/20' },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`p-6 rounded-[28px] glass border ${stat.color} relative overflow-hidden`}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 rounded-xl bg-white/5">{stat.icon}</div>
                                    <span className="text-xs font-black uppercase tracking-widest text-zinc-500">{stat.label}</span>
                                </div>
                                <p className="text-3xl font-black">{stat.value}</p>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Search + Tips Table */}
                <div className="rounded-[32px] glass border border-white/5 p-8 lg:p-10 relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                            <Calendar size={20} className="text-zinc-500" /> All Transactions
                        </h2>

                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-primary transition-colors" size={16} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search tips..."
                                className="bg-white/5 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary/50 transition-all w-64"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 text-zinc-500 text-xs uppercase font-black tracking-widest">
                                    <th className="pb-4 font-black">#</th>
                                    <th className="pb-4 font-black">Sender</th>
                                    <th className="pb-4 font-black">Amount</th>
                                    <th className="pb-4 font-black">Message</th>
                                    <th className="pb-4 font-black text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredTips.length > 0 ? (
                                    filteredTips.map((tip, i) => (
                                        <motion.tr
                                            key={tip.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="hover:bg-white/3 transition-colors group"
                                        >
                                            <td className="py-5 text-zinc-600 text-xs font-bold">{page * LIMIT + i + 1}</td>
                                            <td className="py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-white/5 group-hover:bg-primary/20 flex items-center justify-center font-black text-xs text-zinc-500 group-hover:text-white transition-all">
                                                        {(tip.sender_name || 'AN').substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="font-bold text-sm">{tip.sender_name || 'Anonymous'}</span>
                                                </div>
                                            </td>
                                            <td className="py-5">
                                                <span className="text-lg font-black text-green-400">₹{tip.amount}</span>
                                            </td>
                                            <td className="py-5">
                                                <p className="text-zinc-500 text-sm truncate max-w-xs italic">
                                                    {tip.message ? `"${tip.message}"` : '—'}
                                                </p>
                                            </td>
                                            <td className="py-5 text-right">
                                                <span className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">
                                                    {tip.created_at ? new Date(tip.created_at).toLocaleDateString('en-IN', {
                                                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                    }) : 'Just now'}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-16 text-center text-zinc-600 font-black uppercase tracking-widest text-sm">
                                            {searchQuery ? 'No tips match your search' : 'No tips received yet'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {total > LIMIT && (
                        <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/5">
                            <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest">
                                Showing {page * LIMIT + 1}-{Math.min((page + 1) * LIMIT, total)} of {total}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="p-3 rounded-xl glass border border-white/5 hover:bg-white/5 transition-all disabled:opacity-30"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={!hasMore}
                                    className="p-3 rounded-xl glass border border-white/5 hover:bg-white/5 transition-all disabled:opacity-30"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function SidebarLink({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all font-bold text-sm uppercase tracking-widest ${active ? 'gradient-bg text-white shadow-lg glow-primary' : 'text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
        >
            {icon}
            {label}
        </Link>
    );
}
