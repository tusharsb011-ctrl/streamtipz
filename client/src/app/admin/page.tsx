'use client'

import React, { useEffect } from 'react';
import { ShieldCheck, Users, Activity, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) return null;
    if (!user) return null;

    return (
        <div className="min-h-screen bg-zinc-950 p-8 text-white">
            <header className="flex items-center gap-4 mb-12">
                <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20">
                    <ShieldCheck size={32} />
                </div>
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter">System Admin</h1>
                    <p className="text-zinc-500 font-medium">Control center for WaveTipz.in</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <AdminStat icon={<Users />} label="Total Users" value="24,502" />
                <AdminStat icon={<Activity />} label="Daily Volume" value="₹12.5L" color="text-green-500" />
                <AdminStat icon={<AlertTriangle />} label="Pending Reports" value="12" color="text-yellow-500" />
                <AdminStat icon={<Activity />} label="Server Status" value="Online" color="text-blue-500" />
            </div>

            <div className="rounded-3xl glass border border-white/5 p-8">
                <h2 className="text-2xl font-bold mb-8">System Logs</h2>
                <div className="space-y-4">
                    {[
                        { msg: 'New user registered: NinjaStreamer', time: '10s ago', type: 'info' },
                        { msg: 'Payment failed for txn_847293rd', time: '1m ago', type: 'error' },
                        { msg: 'Withdrawal processed for user_123', time: '5m ago', type: 'success' },
                    ].map((log, i) => (
                        <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${log.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                <span className="font-medium">{log.msg}</span>
                            </div>
                            <span className="text-zinc-500 text-sm font-mono">{log.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function AdminStat({ icon, label, value, color = "text-white" }: { icon: React.ReactNode, label: string, value: string, color?: string }) {
    return (
        <div className="p-6 rounded-2xl glass border border-white/5">
            <div className="flex items-center gap-3 text-zinc-500 mb-4">
                {icon}
                <span className="text-xs uppercase font-bold tracking-widest">{label}</span>
            </div>
            <div className={`text-3xl font-black ${color}`}>{value}</div>
        </div>
    );
}
