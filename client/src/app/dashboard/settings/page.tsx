'use client'

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, LayoutDashboard, History, Globe, ExternalLink, LogOut,
    User, CreditCard, Bell, Palette, Save, CheckCircle, AlertCircle,
    Copy, Eye, Smartphone, IndianRupee, Shield, Zap, QrCode,
    Wallet, ArrowRight, Loader2, MessageSquare, Trophy, ToggleLeft, ToggleRight
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { profileApi, creatorApi } from '@/lib/api';

type AlertTheme = 'default' | 'neon' | 'minimal' | 'fireworks' | 'gaming';

interface ProfileData {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    username: string | null;
    role: string | null;
}

interface SettingsData {
    creator_id: string;
    upi_id: string | null;
    upi_name: string | null;
    min_tip_amount: number | null;
    payment_enabled: boolean;
    tip_page_message: string | null;
    show_leaderboard: boolean;
    thank_you_message: string | null;
    alert_sound: string | null;
    alert_theme: string | null;
    currency: string | null;
}

export default function SettingsPage() {
    const { user, loading: authLoading, signOut } = useAuth();
    const router = useRouter();

    // Profile state
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    // Creator settings state
    const [settings, setSettings] = useState<SettingsData | null>(null);
    const [upiId, setUpiId] = useState('');
    const [upiName, setUpiName] = useState('');
    const [minTipAmount, setMinTipAmount] = useState('10');
    const [paymentEnabled, setPaymentEnabled] = useState(true);
    const [tipPageMessage, setTipPageMessage] = useState('Support my content! Every tip helps me create more awesome content for you 💜');
    const [showLeaderboard, setShowLeaderboard] = useState(true);
    const [thankYouMessage, setThankYouMessage] = useState('Thank you so much for your support! 🎉');
    const [alertTheme, setAlertTheme] = useState<AlertTheme>('default');
    const [alertSound, setAlertSound] = useState('');

    // UI state
    const [activeTab, setActiveTab] = useState<'profile' | 'payment' | 'alerts'>('profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            fetchData();
        }
    }, [user, authLoading, router]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [profileRes, settingsRes] = await Promise.all([
                profileApi.getMyProfile(),
                creatorApi.getSettings(),
            ]);

            if (profileRes.success && profileRes.data?.profile) {
                const p = profileRes.data.profile;
                setProfile(p);
                setFullName(p.full_name || '');
                setUsername(p.username || '');
                setAvatarUrl(p.avatar_url || '');
            }

            if (settingsRes.success && settingsRes.data?.settings) {
                const s = settingsRes.data.settings;
                setSettings(s);
                setUpiId(s.upi_id || '');
                setUpiName(s.upi_name || '');
                setMinTipAmount(String(s.min_tip_amount || 10));
                setPaymentEnabled(s.payment_enabled !== false);
                setTipPageMessage(s.tip_page_message || 'Support my content! Every tip helps me create more awesome content for you 💜');
                setShowLeaderboard(s.show_leaderboard !== false);
                setThankYouMessage(s.thank_you_message || 'Thank you so much for your support! 🎉');
                setAlertTheme((s.alert_theme as AlertTheme) || 'default');
                setAlertSound(s.alert_sound || '');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load settings');
        }
        setLoading(false);
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        setError(null);
        setSuccess(null);
        try {
            const payload: any = {};
            if (fullName) payload.full_name = fullName;
            if (username) payload.username = username;
            if (avatarUrl) payload.avatar_url = avatarUrl;
            const res = await profileApi.updateProfile(payload);
            if (res.success) {
                setProfile(res.data.profile);
                setSuccess('Profile updated successfully!');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to update profile');
        }
        setSaving(false);
        setTimeout(() => setSuccess(null), 3000);
    };

    const handleSavePayment = async () => {
        setSaving(true);
        setError(null);
        setSuccess(null);

        // Validate UPI ID
        if (upiId && !upiId.includes('@')) {
            setError('Invalid UPI ID. It should be like name@paytm, name@ybl, etc.');
            setSaving(false);
            return;
        }

        try {
            const res = await creatorApi.updateSettings({
                upi_id: upiId,
                upi_name: upiName,
                min_tip_amount: Number(minTipAmount) || 10,
                payment_enabled: paymentEnabled,
                tip_page_message: tipPageMessage,
                show_leaderboard: showLeaderboard,
                thank_you_message: thankYouMessage,
            });
            if (res.success) {
                setSettings(res.data.settings);
                setSuccess('💰 Payment settings saved successfully!');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to update payment settings');
        }
        setSaving(false);
        setTimeout(() => setSuccess(null), 3000);
    };

    const handleSaveAlerts = async () => {
        setSaving(true);
        setError(null);
        setSuccess(null);
        try {
            const res = await creatorApi.updateSettings({
                alert_theme: alertTheme,
                alert_sound: alertSound,
            });
            if (res.success) {
                setSettings(res.data.settings);
                setSuccess('Alert settings updated!');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to update alert settings');
        }
        setSaving(false);
        setTimeout(() => setSuccess(null), 3000);
    };

    const copyTipLink = () => {
        const link = `${window.location.origin}/${username || profile?.username || ''}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLogout = async () => {
        await signOut();
        router.push('/login');
    };

    const isUpiValid = upiId ? upiId.includes('@') : true;

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading Settings...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const displayName = profile?.full_name || user.user_metadata?.username || user.email?.split('@')[0] || 'Creator';
    const themes: { id: AlertTheme; label: string; desc: string; colors: string }[] = [
        { id: 'default', label: 'Classic', desc: 'Clean & professional', colors: 'from-zinc-700 to-zinc-800' },
        { id: 'neon', label: 'Neon', desc: 'Cyberpunk vibes', colors: 'from-purple-600 to-pink-600' },
        { id: 'minimal', label: 'Minimal', desc: 'Simple & sleek', colors: 'from-gray-600 to-gray-700' },
        { id: 'fireworks', label: 'Fireworks', desc: 'Party mode 🎉', colors: 'from-orange-500 to-red-600' },
        { id: 'gaming', label: 'Gaming', desc: 'RGB everywhere', colors: 'from-green-500 to-blue-600' },
    ];

    const upiApps = [
        { name: 'Google Pay', suffix: '@okicici', color: '#4285F4', icon: '₹' },
        { name: 'PhonePe', suffix: '@ybl', color: '#5F259F', icon: '📱' },
        { name: 'Paytm', suffix: '@paytm', color: '#00BAF2', icon: '💳' },
        { name: 'BHIM', suffix: '@upi', color: '#00897B', icon: '🏦' },
        { name: 'Amazon Pay', suffix: '@apl', color: '#FF9900', icon: '🛒' },
        { name: 'Others', suffix: '@oksbi', color: '#6B7280', icon: '🔄' },
    ];

    return (
        <div className="min-h-screen bg-[#0B0B0F] flex text-white selection:bg-primary/30">
            {/* Sidebar */}
            <aside className="w-72 border-r border-white/5 p-8 flex flex-col gap-3 glass relative z-10 shrink-0 hidden lg:flex">
                <div className="text-2xl font-black mb-12 flex items-center gap-3 tracking-tighter uppercase">
                    <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg glow-primary">
                        <span className="text-white font-black text-xl">₹</span>
                    </div>
                    WaveTips
                </div>

                <div className="space-y-1">
                    <SidebarLink href="/dashboard" icon={<LayoutDashboard size={20} />} label="Overview" />
                    <SidebarLink href="/dashboard/tips" icon={<History size={20} />} label="History" />
                    <SidebarLink href="/dashboard/settings" icon={<Settings size={20} />} label="Settings" active />
                    <SidebarLink href="/dashboard/widgets" icon={<Globe size={20} />} label="Widgets" />
                </div>

                <div className="mt-auto pt-8 space-y-4">
                    <Link
                        href={`/${profile?.username || displayName}`}
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
                {/* Background glow */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] -z-10"></div>

                {/* Header */}
                <header className="mb-10">
                    <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter mb-2">
                        <span className="gradient-text">Settings</span>
                    </h1>
                    <p className="text-zinc-500 font-medium">Manage your profile, payment, and alert preferences.</p>
                </header>

                {/* Success / Error Banners */}
                <AnimatePresence>
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-bold flex items-center gap-3"
                        >
                            <CheckCircle size={18} /> {success}
                        </motion.div>
                    )}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold flex items-center gap-3"
                        >
                            <AlertCircle size={18} /> {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tip Link Card */}
                <div className="mb-8 p-6 rounded-[28px] glass border border-primary/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1">Your Tip Link</p>
                        <p className="text-lg font-bold text-white">
                            {typeof window !== 'undefined' ? window.location.origin : 'WaveTips.in'}/{profile?.username || 'yourname'}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={copyTipLink}
                            className={`px-6 py-3 rounded-xl flex items-center gap-2 font-bold text-sm uppercase tracking-widest transition-all cursor-pointer ${copied ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'gradient-bg hover:scale-105 shadow-lg glow-primary text-white'
                                }`}
                        >
                            {copied ? <><CheckCircle size={16} /> Copied!</> : <><Copy size={16} /> Copy Link</>}
                        </button>
                        <Link
                            href={`/${profile?.username || ''}`}
                            target="_blank"
                            className="px-4 py-3 rounded-xl glass border border-white/10 hover:bg-white/5 transition-all"
                        >
                            <Eye size={18} className="text-zinc-400" />
                        </Link>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-8 p-1.5 rounded-2xl glass border border-white/5 w-fit">
                    {[
                        { id: 'profile' as const, icon: <User size={16} />, label: 'Profile' },
                        { id: 'payment' as const, icon: <CreditCard size={16} />, label: 'Payment' },
                        { id: 'alerts' as const, icon: <Bell size={16} />, label: 'Alerts' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setError(null); setSuccess(null); }}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all cursor-pointer ${activeTab === tab.id
                                ? 'gradient-bg text-white shadow-lg'
                                : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-[32px] glass border border-white/5 p-8 lg:p-10 max-w-2xl"
                    >
                        <h2 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                            <User size={22} className="text-primary" /> Profile Information
                        </h2>
                        <div className="space-y-6">
                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-20 h-20 rounded-2xl bg-white/5 border-2 border-white/10 flex items-center justify-center overflow-hidden">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-black text-zinc-600">{(fullName || displayName).charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-white text-lg">{fullName || displayName}</p>
                                    <p className="text-zinc-500 text-sm">@{username || 'username'}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Display Name</label>
                                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 focus:border-primary/50 outline-none transition-all font-medium text-white" placeholder="Your display name" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Username</label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 font-bold">@</span>
                                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))} className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/5 border border-white/5 focus:border-primary/50 outline-none transition-all font-medium text-white" placeholder="your_username" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Avatar URL</label>
                                <input type="url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 focus:border-primary/50 outline-none transition-all font-medium text-white" placeholder="https://example.com/your-avatar.jpg" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Email</label>
                                <input type="email" value={profile?.email || user.email || ''} disabled className="w-full px-6 py-4 rounded-2xl bg-white/3 border border-white/5 text-zinc-600 font-medium cursor-not-allowed" />
                                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Email cannot be changed</p>
                            </div>
                            <button onClick={handleSaveProfile} disabled={saving} className="w-full py-5 rounded-2xl gradient-bg hover:scale-[1.02] active:scale-[0.98] transition-all font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl glow-primary disabled:opacity-50 mt-4 cursor-pointer" style={{ minHeight: '56px' }}>
                                {saving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <><Save size={18} /> Save Profile</>}
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Payment Tab — COMPREHENSIVE */}
                {activeTab === 'payment' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl space-y-6"
                    >
                        {/* Earnings Banner */}
                        <div className="rounded-[28px] overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-emerald-600/10 to-teal-600/20"></div>
                            <div className="relative p-8 border border-green-500/20 rounded-[28px]">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center">
                                                <IndianRupee size={24} className="text-green-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-white uppercase tracking-tight">92% Earnings</h3>
                                                <p className="text-green-400 text-xs font-bold">You keep ₹92 of every ₹100 tip</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20">
                                            <p className="text-[10px] text-green-400/70 font-bold uppercase">Platform Fee</p>
                                            <p className="text-green-400 font-black text-lg">8%</p>
                                        </div>
                                        <div className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20">
                                            <p className="text-[10px] text-green-400/70 font-bold uppercase">Payout</p>
                                            <p className="text-green-400 font-black text-lg">Instant</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* UPI Setup Card */}
                        <div className="rounded-[32px] glass border border-white/5 p-8 lg:p-10">
                            <h2 className="text-xl font-black uppercase tracking-tighter mb-2 flex items-center gap-3">
                                <Wallet size={22} className="text-green-500" /> UPI Payment Setup
                            </h2>
                            <p className="text-zinc-500 text-sm mb-8">Connect your UPI to receive tips directly</p>

                            {/* Payment Toggle */}
                            <div className="flex items-center justify-between p-5 rounded-2xl bg-white/3 border border-white/5 mb-6">
                                <div className="flex items-center gap-3">
                                    <Zap size={18} className={paymentEnabled ? 'text-green-400' : 'text-zinc-600'} />
                                    <div>
                                        <p className="text-sm font-bold text-white">Accept Payments</p>
                                        <p className="text-xs text-zinc-500">Enable/disable tipping on your page</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setPaymentEnabled(!paymentEnabled)}
                                    className="cursor-pointer"
                                >
                                    {paymentEnabled ? (
                                        <ToggleRight size={36} className="text-green-500" />
                                    ) : (
                                        <ToggleLeft size={36} className="text-zinc-600" />
                                    )}
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* UPI ID */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                        <CreditCard size={14} /> UPI ID
                                    </label>
                                    <input
                                        type="text"
                                        value={upiId}
                                        onChange={(e) => setUpiId(e.target.value.toLowerCase())}
                                        className={`w-full px-6 py-4 rounded-2xl bg-white/5 border outline-none transition-all font-medium text-white text-base ${!isUpiValid ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-green-500/50'
                                            }`}
                                        placeholder="yourname@paytm"
                                    />
                                    {!isUpiValid && (
                                        <p className="text-red-400 text-xs font-bold flex items-center gap-1">
                                            <AlertCircle size={12} /> UPI ID must contain @
                                        </p>
                                    )}
                                </div>

                                {/* UPI Registered Name */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                        <User size={14} /> UPI Registered Name
                                    </label>
                                    <input
                                        type="text"
                                        value={upiName}
                                        onChange={(e) => setUpiName(e.target.value)}
                                        className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-green-500/50 outline-none transition-all font-medium text-white text-base"
                                        placeholder="Your full name as registered on UPI"
                                    />
                                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Shown to tippers for verification</p>
                                </div>

                                {/* Supported UPI Apps */}
                                <div>
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4 block">Supported UPI Apps</label>
                                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                                        {upiApps.map(app => (
                                            <button
                                                key={app.name}
                                                onClick={() => {
                                                    if (!upiId) setUpiId(`name${app.suffix}`);
                                                }}
                                                className="p-3 rounded-2xl bg-white/3 border border-white/5 hover:border-green-500/30 hover:bg-green-500/5 transition-all text-center cursor-pointer group"
                                            >
                                                <div className="text-2xl mb-1">{app.icon}</div>
                                                <p className="text-[9px] font-bold text-zinc-500 group-hover:text-green-400 transition-colors truncate">{app.name}</p>
                                                <p className="text-[8px] text-zinc-700 font-mono">{app.suffix}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Min Tip Amount */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                        <IndianRupee size={14} /> Minimum Tip Amount
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-green-500 font-black text-lg">₹</span>
                                        <input
                                            type="number"
                                            value={minTipAmount}
                                            onChange={(e) => setMinTipAmount(e.target.value)}
                                            min="1"
                                            max="10000"
                                            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-green-500/50 outline-none transition-all font-bold text-white text-lg"
                                            placeholder="10"
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        {['10', '20', '50', '100'].map(amt => (
                                            <button
                                                key={amt}
                                                onClick={() => setMinTipAmount(amt)}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${minTipAmount === amt
                                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                        : 'bg-white/3 text-zinc-500 border border-white/5 hover:border-white/10'
                                                    }`}
                                            >
                                                ₹{amt}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Status Card */}
                                <div className="p-5 rounded-2xl bg-white/3 border border-white/5">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Payment Status</span>
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${upiId && isUpiValid
                                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                            }`}>
                                            {upiId && isUpiValid ? '✅ UPI Connected' : '⚠️ UPI Not Set'}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="p-3 rounded-xl bg-white/3 text-center">
                                            <Shield size={16} className="text-green-400 mx-auto mb-1" />
                                            <p className="text-[9px] text-zinc-500 font-bold uppercase">Secure</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-white/3 text-center">
                                            <Zap size={16} className="text-yellow-400 mx-auto mb-1" />
                                            <p className="text-[9px] text-zinc-500 font-bold uppercase">Instant</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-white/3 text-center">
                                            <QrCode size={16} className="text-blue-400 mx-auto mb-1" />
                                            <p className="text-[9px] text-zinc-500 font-bold uppercase">QR Ready</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tip Page Customization */}
                        <div className="rounded-[32px] glass border border-white/5 p-8 lg:p-10">
                            <h2 className="text-xl font-black uppercase tracking-tighter mb-2 flex items-center gap-3">
                                <MessageSquare size={22} className="text-purple-500" /> Tip Page Settings
                            </h2>
                            <p className="text-zinc-500 text-sm mb-6">Customize what tippers see on your page</p>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Welcome Message</label>
                                    <textarea
                                        value={tipPageMessage}
                                        onChange={(e) => setTipPageMessage(e.target.value)}
                                        rows={3}
                                        className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition-all font-medium text-white text-sm resize-none"
                                        placeholder="Enter a message for your tippers..."
                                        maxLength={200}
                                    />
                                    <p className="text-[10px] text-zinc-600 font-bold text-right">{tipPageMessage.length}/200</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Thank You Message</label>
                                    <input
                                        type="text"
                                        value={thankYouMessage}
                                        onChange={(e) => setThankYouMessage(e.target.value)}
                                        className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition-all font-medium text-white text-sm"
                                        placeholder="Shown after someone tips you"
                                        maxLength={150}
                                    />
                                </div>

                                {/* Show Leaderboard Toggle */}
                                <div className="flex items-center justify-between p-5 rounded-2xl bg-white/3 border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <Trophy size={18} className={showLeaderboard ? 'text-yellow-400' : 'text-zinc-600'} />
                                        <div>
                                            <p className="text-sm font-bold text-white">Show Leaderboard</p>
                                            <p className="text-xs text-zinc-500">Display top tippers on your page</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowLeaderboard(!showLeaderboard)}
                                        className="cursor-pointer"
                                    >
                                        {showLeaderboard ? (
                                            <ToggleRight size={36} className="text-yellow-500" />
                                        ) : (
                                            <ToggleLeft size={36} className="text-zinc-600" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSavePayment}
                            disabled={saving || !isUpiValid}
                            className="w-full py-5 sm:py-6 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 hover:scale-[1.02] active:scale-[0.98] transition-all font-black text-lg uppercase tracking-tighter flex items-center justify-center gap-3 shadow-xl disabled:opacity-50 cursor-pointer text-white"
                            style={{ minHeight: '60px' }}
                        >
                            {saving ? (
                                <><Loader2 size={22} className="animate-spin" /> Saving Payment Settings...</>
                            ) : (
                                <><Save size={22} /> Save Payment Settings <ArrowRight size={20} /></>
                            )}
                        </button>
                    </motion.div>
                )}

                {/* Alerts Tab */}
                {activeTab === 'alerts' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-[32px] glass border border-white/5 p-8 lg:p-10 max-w-2xl"
                    >
                        <h2 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                            <Palette size={22} className="text-purple-500" /> Alert Customization
                        </h2>
                        <div className="space-y-8">
                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4 block">Alert Theme</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {themes.map(theme => (
                                        <button
                                            key={theme.id}
                                            onClick={() => setAlertTheme(theme.id)}
                                            className={`p-5 rounded-2xl border-2 transition-all text-left cursor-pointer ${alertTheme === theme.id
                                                ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                                                : 'border-white/5 bg-white/3 hover:border-white/10'
                                                }`}
                                        >
                                            <div className={`w-full h-2 rounded-full bg-gradient-to-r ${theme.colors} mb-4`}></div>
                                            <p className="font-bold text-white text-sm">{theme.label}</p>
                                            <p className="text-zinc-500 text-xs mt-1">{theme.desc}</p>
                                            {alertTheme === theme.id && (
                                                <div className="mt-3 flex items-center gap-1 text-primary text-xs font-bold">
                                                    <CheckCircle size={14} /> Active
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Alert Sound URL</label>
                                <input type="text" value={alertSound} onChange={(e) => setAlertSound(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 focus:border-primary/50 outline-none transition-all font-medium text-white" placeholder="https://example.com/alert.mp3" />
                                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Leave empty for default sound</p>
                            </div>
                            <div className="p-5 rounded-2xl bg-purple-500/5 border border-purple-500/20 flex items-start gap-4">
                                <Bell className="text-purple-400 shrink-0 mt-0.5" size={20} />
                                <div>
                                    <p className="text-purple-300 font-bold text-sm mb-1">OBS Widget</p>
                                    <p className="text-zinc-500 text-xs leading-relaxed">Add the alert widget as a Browser Source in OBS. Your theme and sound settings will apply automatically.</p>
                                </div>
                            </div>
                            <button onClick={handleSaveAlerts} disabled={saving} className="w-full py-5 rounded-2xl gradient-bg hover:scale-[1.02] active:scale-[0.98] transition-all font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl glow-primary disabled:opacity-50 mt-4 cursor-pointer" style={{ minHeight: '56px' }}>
                                {saving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <><Save size={18} /> Save Alert Settings</>}
                            </button>
                        </div>
                    </motion.div>
                )}
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
