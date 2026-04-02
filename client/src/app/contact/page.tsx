'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Mail, Instagram, MessageCircle, ArrowLeft, Send, Users } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-[#0B0B0F] text-white selection:bg-primary/30 pb-20 overflow-hidden relative">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[130px] rounded-full -z-10"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/10 blur-[130px] rounded-full -z-10"></div>

            {/* Header */}
            <nav className="px-6 py-6 flex items-center justify-between border-b border-white/5 glass sticky top-0 z-50">
                <Link href="/" className="flex items-center gap-2 group">
                    <ArrowLeft className="text-zinc-500 group-hover:text-white transition-colors" />
                    <span className="font-black text-xl tracking-tighter">StreamTipz</span>
                </Link>
                <div className="flex gap-8 items-center text-sm font-bold uppercase tracking-widest text-zinc-500">
                    <Link href="/" className="hover:text-white transition-colors">Home</Link>
                    <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
                    <Link href="/contact" className="text-white border-b-2 border-primary pb-1">Contact</Link>
                    <Link href="/login" className="px-6 py-2 rounded-xl gradient-bg text-white shadow-lg glow-primary">Sign In</Link>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 pt-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-20"
                >
                    {/* Page Title */}
                    <div className="text-center">
                        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-6">Contact</h1>
                        <p className="text-zinc-500 font-medium max-w-2xl mx-auto">
                            Have questions or need technical support? Our community and team are here to help you scaling your streaming career.
                        </p>
                    </div>

                    {/* Contact Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* WhatsApp Card */}
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 rounded-2xl bg-[#25D366]/10 flex items-center justify-center mx-auto border border-[#25D366]/20 shadow-lg">
                                <MessageCircle className="text-[#25D366]" size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight mb-2">WhatsApp Support</h3>
                                <p className="text-zinc-500 font-medium text-sm">+91-8591989801</p>
                            </div>
                        </div>

                        {/* Email Card */}
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto border border-primary/20 shadow-lg">
                                <Mail className="text-primary" size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight mb-2">Email Address</h3>
                                <a href="mailto:igxharsh6@gmail.com" className="text-zinc-500 font-medium text-sm hover:text-white transition-colors">igxharsh6@gmail.com</a>
                            </div>
                        </div>
                    </div>

                    {/* Get in Touch Section */}
                    <div className="flex flex-col lg:flex-row items-center gap-16 pt-10">
                        {/* Image Side */}
                        <div className="w-full lg:w-1/2 relative group">
                            <div className="absolute -inset-4 gradient-bg blur-3xl opacity-10 group-hover:opacity-20 transition-opacity rounded-full"></div>
                            <div className="aspect-square rounded-full overflow-hidden border-8 border-white/5 shadow-2xl relative">
                                <img
                                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=ClassicHarsh"
                                    alt="Harsh"
                                    className="w-full h-full object-cover bg-[#1A1A24]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] to-transparent opacity-40"></div>
                            </div>
                        </div>

                        {/* Form Side */}
                        <div className="w-full lg:w-1/2 space-y-10">
                            <h2 className="text-5xl font-black uppercase tracking-tighter">Get in <span className="gradient-text">Touch</span></h2>
                            <form className="space-y-6">
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 focus:border-primary/50 outline-none transition-all font-medium text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 focus:border-primary/50 outline-none transition-all font-medium text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <textarea
                                        placeholder="Comment or Message"
                                        rows={4}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 focus:border-primary/50 outline-none transition-all resize-none font-medium text-white"
                                    ></textarea>
                                </div>
                                <button className="px-10 py-5 rounded-2xl gradient-bg hover:scale-105 transition-all font-black text-lg shadow-xl glow-primary flex items-center gap-3 uppercase tracking-tighter">
                                    Send Message <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Social Connect */}
                    <div className="pt-20 border-t border-white/5 flex flex-wrap justify-center gap-6">
                        <a
                            href="https://www.instagram.com/classic__harsh"
                            target="_blank"
                            className="flex items-center gap-3 px-8 py-4 rounded-2xl glass hover:bg-white/5 transition-all border border-white/5 group"
                        >
                            <Instagram className="text-zinc-500 group-hover:text-pink-500 transition-colors" />
                            <span className="font-bold text-sm uppercase tracking-widest text-zinc-500 group-hover:text-white">@classic__harsh</span>
                        </a>
                        <a
                            href="https://discord.gg/HpXTKhk47T"
                            target="_blank"
                            className="flex items-center gap-3 px-8 py-4 rounded-2xl glass hover:bg-white/5 transition-all border border-white/5 group"
                        >
                            <MessageSquare className="text-zinc-500 group-hover:text-[#5865F2] transition-colors" />
                            <span className="font-bold text-sm uppercase tracking-widest text-zinc-500 group-hover:text-white">Discord Community</span>
                        </a>
                    </div>

                </motion.div>
            </main>

            {/* Footer Credit */}
            <footer className="mt-32 text-center py-12 border-t border-white/5">
                <div className="flex items-center justify-center gap-2 mb-6 grayscale opacity-30">
                    <Users size={18} />
                    <span className="text-xs font-black uppercase tracking-[0.3em]">Harshplay Community Ecosystem</span>
                </div>
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">
                    Designed & Developed by Harshplay Community • 2026
                </p>
            </footer>
        </div>
    );
}
