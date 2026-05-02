'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Target, Zap, Shield, Rocket, ArrowLeft, Globe, Users } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#0B0B0F] text-white selection:bg-primary/30 pb-20 overflow-hidden relative">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[130px] rounded-full -z-10"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/10 blur-[130px] rounded-full -z-10"></div>

            {/* Header */}
            <nav className="px-6 py-6 flex items-center justify-between border-b border-white/5 glass sticky top-0 z-50">
                <Link href="/" className="flex items-center gap-2 group">
                    <ArrowLeft className="text-zinc-500 group-hover:text-white transition-colors" />
                    <span className="font-black text-xl tracking-tighter">WaveTips</span>
                </Link>
                <div className="flex gap-8 items-center text-sm font-bold uppercase tracking-widest text-zinc-500">
                    <Link href="/" className="hover:text-white transition-colors">Home</Link>
                    <Link href="/about" className="text-white border-b-2 border-primary pb-1">About Us</Link>
                    <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                    <Link href="/login" className="px-6 py-2 rounded-xl gradient-bg text-white shadow-lg glow-primary">Sign In</Link>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 pt-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                >
                    {/* Main Title */}
                    <div className="border-b border-white/5 pb-10">
                        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8">
                            About <span className="gradient-text">WaveTips</span>
                        </h1>
                        <p className="text-zinc-500 text-lg leading-relaxed">
                            Welcome to <strong className="text-white">WaveTips</strong>, the ultimate monetization infrastructure built specifically for the Indian streaming ecosystem.
                            We bridge the gap between creators and fans with technology that feels like magic.
                        </p>
                    </div>

                    {/* Mission Section */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-8 gradient-bg rounded-full"></div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">Our Mission</h2>
                        </div>
                        <p className="text-zinc-400 leading-relaxed text-sm md:text-base">
                            Content creation is real work. Whether you're grinding ranked matches or entertaining thousands, you deserve to keep the majority of what you earn. Traditional platforms often take massive cuts or delay payments for weeks. We are here to change that paradigm.
                        </p>
                        <p className="text-zinc-100 font-bold bg-white/5 p-6 rounded-2xl border border-white/5 leading-relaxed">
                            Our goal is simple: <span className="text-primary italic">Empower streamers to accept support from true fans instantly, securely, and with maximum earnings retention.</span>
                        </p>
                    </section>

                    {/* Our Team */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-8 gradient-bg rounded-full"></div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">Our Team</h2>
                        </div>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            WaveTips is built by a passionate team of developers who believe in empowering Indian creators with world-class technology.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { name: 'Tushar Singh', role: 'Developer', seed: 'Tushar' },
                                { name: 'Harshit Prajapati Bhardwaj', role: 'Developer', seed: 'Harshit' },
                                { name: 'Vaibhav Pandey', role: 'Developer', seed: 'Vaibhav' },
                                { name: 'Anoop Kumar', role: 'Developer', seed: 'Anoop' },
                            ].map((member) => (
                                <div key={member.seed} className="glass rounded-2xl p-5 border border-white/5 text-center hover:border-primary/30 transition-all group">
                                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 mx-auto mb-3 shadow-lg">
                                        <img
                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.seed}`}
                                            alt={member.name}
                                            className="w-full h-full bg-[#1A1A24] object-cover"
                                        />
                                    </div>
                                    <h3 className="text-sm font-black uppercase tracking-tight group-hover:text-primary transition-colors">{member.name}</h3>
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{member.role}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Why Choose Us */}
                    <section className="space-y-10 pt-10">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-8 gradient-bg rounded-full"></div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">Why Creators Choose Us</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InfoCard
                                title="92% Revenue Retention"
                                text="The industry standard is taking 40-50%. We take a small fee to keep the servers running; you keep the wealth."
                            />
                            <InfoCard
                                title="Instant UPI Settlement"
                                text="Built for India's favorite payment method. No international waits or PayPal freezing your funds."
                            />
                            <InfoCard
                                title="Zero-Lag Alerts"
                                text="Integrated with our custom socket engine for that instant dopamine hit on your live stream overlay."
                            />
                        </div>
                    </section>

                </motion.div>
            </main>

            {/* Footer Credit */}
            <footer className="mt-32 text-center py-12 border-t border-white/5">
                <div className="flex items-center justify-center gap-2 mb-6 grayscale opacity-30">
                    <Users size={18} />
                    <span className="text-xs font-black uppercase tracking-[0.3em]">WaveTips Team</span>
                </div>
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">
                    Developed by Tushar Singh, Harshit Prajapati Bhardwaj, Vaibhav Pandey & Anoop Kumar • 2026
                </p>
            </footer>
        </div>
    );
}

function InfoCard({ title, text }: { title: string, text: string }) {
    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all group flex flex-col justify-between h-full">
            <div>
                <h4 className="text-sm font-black text-white mb-3 uppercase tracking-tight group-hover:text-primary transition-colors">{title}</h4>
                <p className="text-zinc-500 text-xs leading-relaxed font-medium">{text}</p>
            </div>
            <div className="mt-4 flex justify-end">
                <div className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center group-hover:bg-primary/20 transition-all">
                    <Rocket size={12} className="text-zinc-600 group-hover:text-white" />
                </div>
            </div>
        </div>
    );
}
