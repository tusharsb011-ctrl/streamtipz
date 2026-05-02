'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Settings, LayoutDashboard, History, Globe, ExternalLink, LogOut,
    Copy, CheckCircle, Monitor, Play, Eye, Tv, Link2, Code,
    Smartphone, Volume2, Palette, AlertCircle, Zap, Info, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function WidgetsPage() {
    const { user, loading: authLoading, signOut } = useAuth();
    const router = useRouter();
    const [copied, setCopied] = useState<string | null>(null);
    const [testAlert, setTestAlert] = useState(false);

    const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'creator';

    const handleLogout = async () => {
        await signOut();
        router.push('/login');
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleTestAlert = () => {
        setTestAlert(true);
        setTimeout(() => setTestAlert(false), 3000);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={48} className="animate-spin text-primary" />
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading Widgets...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        router.push('/login');
        return null;
    }

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const alertWidgetUrl = `${baseUrl}/widget/${username}`;
    const tipPageUrl = `${baseUrl}/${username}`;

    const widgets = [
        {
            id: 'alert-widget',
            title: 'Alert Box Widget',
            icon: <Tv size={24} className="text-purple-400" />,
            description: 'Show real-time tip alerts on your stream with animated popups. New tips appear automatically!',
            url: alertWidgetUrl,
            color: 'purple',
            badge: 'Most Popular',
            instructions: [
                'Open OBS Studio',
                'Click "+" under Sources → Browser',
                'Paste the Widget URL below',
                'Set width: 800, height: 600',
                'Check "Refresh browser when scene becomes active"',
                'Click OK — Done! 🎉',
            ],
        },
        {
            id: 'tip-page',
            title: 'Public Tip Page',
            icon: <Globe size={24} className="text-green-400" />,
            description: 'Your public page where fans can send tips. Share this link in your stream description, social media, etc.',
            url: tipPageUrl,
            color: 'green',
            badge: 'Share Everywhere',
            instructions: [
                'Copy the link below',
                'Add it to your Twitch/YouTube description',
                'Pin it in your Discord server',
                'Share on social media',
                'Add QR code to your stream overlay',
            ],
        },
    ];

    const obsSettings = [
        { label: 'Width', value: '800', icon: '↔️' },
        { label: 'Height', value: '600', icon: '↕️' },
        { label: 'FPS', value: '30', icon: '🎬' },
        { label: 'CSS', value: 'body { background: transparent; }', icon: '🎨' },
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
                    <SidebarLink href="/dashboard/settings" icon={<Settings size={20} />} label="Settings" />
                    <SidebarLink href="/dashboard/widgets" icon={<Globe size={20} />} label="Widgets" active />
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
            <main className="flex-1 p-6 lg:p-12 overflow-y-auto relative">
                {/* Background glow */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 blur-[150px] -z-10"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-green-500/5 blur-[150px] -z-10"></div>

                {/* Header */}
                <header className="mb-10">
                    <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter mb-2">
                        <span className="gradient-text">Widgets & Links</span>
                    </h1>
                    <p className="text-zinc-500 font-medium">Add alert widgets to OBS and share your tip page with fans.</p>
                </header>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                    <button
                        onClick={handleTestAlert}
                        className={`p-5 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${testAlert
                                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                                : 'glass border-white/5 hover:border-purple-500/30 hover:bg-purple-500/5 text-zinc-400 hover:text-purple-400'
                            }`}
                    >
                        {testAlert ? <CheckCircle size={20} /> : <Play size={20} />}
                        <div className="text-left">
                            <p className="font-bold text-sm">{testAlert ? 'Alert Sent!' : 'Test Alert'}</p>
                            <p className="text-xs text-zinc-600">Preview on your widget</p>
                        </div>
                    </button>

                    <Link
                        href={alertWidgetUrl}
                        target="_blank"
                        className="p-5 rounded-2xl glass border border-white/5 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all flex items-center gap-3 text-zinc-400 hover:text-purple-400"
                    >
                        <Eye size={20} />
                        <div className="text-left">
                            <p className="font-bold text-sm">Preview Widget</p>
                            <p className="text-xs text-zinc-600">Open in new tab</p>
                        </div>
                    </Link>

                    <Link
                        href={tipPageUrl}
                        target="_blank"
                        className="p-5 rounded-2xl glass border border-white/5 hover:border-green-500/30 hover:bg-green-500/5 transition-all flex items-center gap-3 text-zinc-400 hover:text-green-400"
                    >
                        <Globe size={20} />
                        <div className="text-left">
                            <p className="font-bold text-sm">View Tip Page</p>
                            <p className="text-xs text-zinc-600">See what fans see</p>
                        </div>
                    </Link>
                </div>

                {/* Widget Cards */}
                <div className="space-y-8">
                    {widgets.map((widget, idx) => (
                        <motion.div
                            key={widget.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="rounded-[32px] glass border border-white/5 overflow-hidden"
                        >
                            {/* Widget Header */}
                            <div className={`p-8 lg:p-10 border-b border-white/5 bg-gradient-to-r ${widget.color === 'purple' ? 'from-purple-500/5 to-transparent' : 'from-green-500/5 to-transparent'
                                }`}>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${widget.color === 'purple' ? 'bg-purple-500/20' : 'bg-green-500/20'
                                            }`}>
                                            {widget.icon}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black uppercase tracking-tighter text-white">{widget.title}</h2>
                                            <p className="text-zinc-500 text-sm">{widget.description}</p>
                                        </div>
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${widget.color === 'purple'
                                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                            : 'bg-green-500/10 text-green-400 border border-green-500/20'
                                        }`}>
                                        {widget.badge}
                                    </span>
                                </div>

                                {/* URL Copy Bar */}
                                <div className="flex gap-3">
                                    <div className="flex-1 px-5 py-4 rounded-2xl bg-black/30 border border-white/10 font-mono text-sm text-zinc-300 overflow-hidden truncate flex items-center gap-2">
                                        <Link2 size={14} className="text-zinc-600 shrink-0" />
                                        {widget.url}
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(widget.url, widget.id)}
                                        className={`px-6 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${copied === widget.id
                                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                : widget.color === 'purple'
                                                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg'
                                                    : 'bg-green-600 hover:bg-green-500 text-white shadow-lg'
                                            }`}
                                    >
                                        {copied === widget.id ? <><CheckCircle size={16} /> Copied!</> : <><Copy size={16} /> Copy</>}
                                    </button>
                                </div>
                            </div>

                            {/* Widget Instructions */}
                            <div className="p-8 lg:p-10">
                                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-5 flex items-center gap-2">
                                    <Info size={14} /> Setup Instructions
                                </h3>
                                <div className="space-y-3">
                                    {widget.instructions.map((step, i) => (
                                        <div key={i} className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/3 transition-all">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-black ${widget.color === 'purple'
                                                    ? 'bg-purple-500/20 text-purple-400'
                                                    : 'bg-green-500/20 text-green-400'
                                                }`}>
                                                {i + 1}
                                            </div>
                                            <p className="text-sm text-zinc-300 font-medium pt-1.5">{step}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* OBS Settings Reference */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 rounded-[32px] glass border border-white/5 p-8 lg:p-10"
                >
                    <h2 className="text-xl font-black uppercase tracking-tighter mb-2 flex items-center gap-3">
                        <Monitor size={22} className="text-blue-400" /> OBS Recommended Settings
                    </h2>
                    <p className="text-zinc-500 text-sm mb-6">Use these settings when adding the Browser Source in OBS</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        {obsSettings.map(setting => (
                            <div key={setting.label} className="p-4 rounded-2xl bg-white/3 border border-white/5 text-center">
                                <p className="text-2xl mb-2">{setting.icon}</p>
                                <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1">{setting.label}</p>
                                <p className="text-sm font-bold text-white font-mono">{setting.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* OBS HTML Embed Code */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                            <Code size={14} /> Quick Embed Code (for StreamElements Custom Widget)
                        </h3>
                        <div className="relative">
                            <pre className="p-5 rounded-2xl bg-black/50 border border-white/10 text-xs text-green-400 font-mono overflow-x-auto">
                                {`<iframe
  src="${alertWidgetUrl}"
  width="800"
  height="600"
  frameborder="0"
  allowtransparency="true"
></iframe>`}
                            </pre>
                            <button
                                onClick={() => copyToClipboard(
                                    `<iframe src="${alertWidgetUrl}" width="800" height="600" frameborder="0" allowtransparency="true"></iframe>`,
                                    'embed-code'
                                )}
                                className={`absolute top-3 right-3 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${copied === 'embed-code'
                                        ? 'bg-green-500/20 text-green-400'
                                        : 'bg-white/10 text-zinc-400 hover:text-white hover:bg-white/20'
                                    }`}
                            >
                                {copied === 'embed-code' ? '✓ Copied' : 'Copy'}
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Help Section */}
                <div className="mt-8 p-6 rounded-[28px] glass border border-blue-500/20 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center shrink-0">
                        <Smartphone size={22} className="text-blue-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white mb-1">Need Help?</h3>
                        <p className="text-zinc-500 text-sm leading-relaxed">
                            If alerts aren't showing, make sure your OBS Browser Source is set to the correct URL and "Refresh browser when scene becomes active" is checked.
                            For StreamElements, add a Custom Widget and paste the embed code above.
                        </p>
                    </div>
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
