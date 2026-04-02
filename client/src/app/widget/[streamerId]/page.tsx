'use client'

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface TipAlert {
    id: string;
    sender_name: string;
    amount: number;
    message: string;
}

export default function AlertWidget() {
    const { streamerId } = useParams() as { streamerId: string };
    const [alert, setAlert] = useState<TipAlert | null>(null);

    useEffect(() => {
        let channel: any;

        const setupRealtime = async () => {
            // 1. Find the creator's ID based on username (slug)
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('id')
                .eq('username', streamerId)
                .single();

            if (error || !profile) {
                console.error('Widget: Creator not found', streamerId);
                return;
            }

            // 2. Subscribe to new tips for this creator
            channel = supabase
                .channel(`public:tips:${profile.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'tips',
                        filter: `creator_id=eq.${profile.id}`
                    },
                    (payload) => {
                        console.log('New tip alert!', payload.new);
                        setAlert(payload.new as TipAlert);

                        // Auto-hide alert after 5 seconds
                        setTimeout(() => {
                            setAlert(null);
                        }, 5000);
                    }
                )
                .subscribe();
        };

        setupRealtime();

        return () => {
            if (channel) supabase.removeChannel(channel);
        };
    }, [streamerId]);

    return (
        <div className="h-screen flex items-center justify-center overflow-hidden bg-transparent">
            <AnimatePresence>
                {alert && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.2, y: -50 }}
                        className="flex flex-col items-center text-white text-center"
                    >
                        {/* Alert Media */}
                        <div className="w-64 h-64 mb-4">
                            <img
                                src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ3R6Z2J6Z2J6Z2J6Z2J6Z2J6Z2J6Z2J6Z2J6Z2J6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxPvkO2i9fG/giphy.gif"
                                alt="Alert"
                                className="w-full h-full object-contain"
                            />
                        </div>

                        {/* Alert Text */}
                        <div className="bg-black/60 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/10">
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter">
                                <span className="text-primary">{alert.sender_name}</span>
                                <span className="mx-2">donated</span>
                                <span className="text-accent">₹{alert.amount}</span>
                            </h2>
                            {alert.message && (
                                <p className="mt-2 text-xl font-medium text-zinc-300">
                                    {alert.message}
                                </p>
                            )}
                        </div>

                        {/* Play Sound (Optional, but browser might block without user interaction) */}
                        <audio autoPlay src="https://www.myinstants.com/media/sounds/notification.mp3" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
