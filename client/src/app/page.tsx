'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Layout, Bell, ArrowRight, Smartphone, BarChart3, Globe, Heart, CheckCircle2, QrCode } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen selection:bg-primary/30 bg-[#0B0B0F]">
      {/* Sticky Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 px-6 py-4 flex justify-between items-center ${isScrolled ? 'glass bg-[#0B0B0F]/80 border-b border-white/5 py-3' : 'bg-transparent'}`}>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg glow-primary">
            <span className="text-white font-black text-xl">₹</span>
          </div>
          <div className="text-2xl font-black tracking-tighter text-white">WaveTips</div>
        </div>

        <div className="hidden md:flex gap-8 items-center text-sm font-medium text-zinc-400">
          <Link href="/" className="text-white hover:text-primary transition-colors">Home</Link>
          <Link href="/qr-generator" className="hover:text-white transition-colors flex items-center gap-1.5 flex flex-row">
            <QrCode size={16} /> QR Code Generator
          </Link>
          <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>

        <div className="flex gap-4 items-center">
          {!loading && user ? (
            <Link href="/dashboard" className="px-6 py-2.5 rounded-xl gradient-bg text-white font-bold text-sm shadow-xl glow-primary hover:scale-105 transition-all">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="px-5 py-2 text-sm font-bold text-white hover:text-primary transition-all">Login</Link>
              <Link href="/signup" className="px-6 py-2.5 rounded-xl gradient-bg text-white font-bold text-sm shadow-xl glow-primary hover:scale-105 transition-all">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-44 pb-32 px-6 flex flex-col items-center text-center overflow-hidden">
        {/* Abstract Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 blur-[120px] rounded-full -z-10 opacity-30"></div>
        <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-secondary/20 blur-[100px] rounded-full -z-10 opacity-20"></div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full badge-glass text-xs font-bold mb-8 uppercase tracking-widest border border-primary/20 bg-primary/5">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            ✨ 92% Earnings Retention
          </div>

          <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter leading-[1.1]">
            Accept Support from <br />
            <span className="gradient-text">True Fans</span> Instantly
          </h1>

          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            The cleanest, most professional tipping page for Indian streamers.
            Supports UPI with instant alerts.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center mb-16">
            <Link href="/signup" className="px-10 py-5 rounded-2xl gradient-bg text-white font-black text-lg shadow-2xl glow-primary hover:scale-105 transition-all flex items-center gap-3 group">
              Create My Page <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="#features" className="px-10 py-5 rounded-2xl glass text-white font-black text-lg hover:bg-white/5 transition-all">
              Learn More
            </Link>
          </div>

          <div className="max-w-xl mx-auto px-6 py-4 rounded-2xl border border-green-500/20 bg-green-500/5 text-green-400 text-sm font-medium flex items-center justify-center gap-3">
            <Smartphone size={20} className="shrink-0" />
            💸 Payouts are sent to streamer's UPI ID daily. No manual withdrawal required!
          </div>
        </motion.div>

        {/* Tipping Demo Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="mt-28 relative w-full max-w-lg mx-auto"
        >
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 to-secondary/30 blur-2xl opacity-20 -z-10"></div>
          <div className="glass rounded-[32px] p-8 border border-white/10 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -z-10"></div>

            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full border-4 border-[#1A1A24] shadow-2xl mb-4 overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Harsh" alt="Avatar" className="w-full h-full bg-[#1A1A24]" />
              </div>
              <h3 className="text-2xl font-black text-white mb-1 uppercase tracking-tight">Rahul Gaming</h3>
              <p className="text-zinc-500 text-sm font-medium mb-8">Playing BGMI Daily IN • Thanks for support!</p>

              <div className="w-full space-y-4">
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-black text-zinc-600">₹</span>
                  <input
                    type="text"
                    readOnly
                    value="500"
                    className="w-full bg-[#0D0D14] border border-white/5 rounded-2xl py-5 px-10 text-2xl font-black text-white text-center outline-none"
                  />
                </div>

                <div className="flex gap-3 justify-center">
                  {['50', '100', '500'].map((amt) => (
                    <button key={amt} className={`px-6 py-2.5 rounded-xl border font-bold text-sm transition-all ${amt === '500' ? 'gradient-bg border-transparent shadow-lg text-white' : 'glass border-white/5 text-zinc-400'}`}>
                      ₹{amt}
                    </button>
                  ))}
                </div>

                <div className="pt-6">
                  <button className="w-full py-5 rounded-2xl bg-white text-black font-black text-xl hover:bg-zinc-200 transition-all uppercase tracking-tight">
                    Tip Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Leaderboard Section */}
      <section className="py-32 px-6 bg-[#09090D]">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase">Live Leaderboard</h2>
          <p className="text-zinc-500 max-w-xl mx-auto">See who is leading the charts in the WaveTips community.</p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <LeaderboardCard title="Top Streamers" items={[
            { name: "Rahul Gaming", amount: "₹45,200", trend: "+12%" },
            { name: "Ninja_OP", amount: "₹38,150", trend: "+8%" },
            { name: "Mortal_Clone", amount: "₹32,900", trend: "+15%" },
          ]} />
          <LeaderboardCard title="Top Viewers" items={[
            { name: "SuperFan123", amount: "₹12,400", trend: "+5%" },
            { name: "GamerBoi", amount: "₹9,800", trend: "+2%" },
            { name: "AnonyMouse", amount: "₹8,500", trend: "+10%" },
          ]} />
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase">Modern Features</h2>
          <p className="text-zinc-500 max-w-2xl mx-auto">Everything you need to monetize your stream and manage your community effectively.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<Zap className="w-8 h-8 text-yellow-500" />}
            title="Real-time Alerts"
            description="Browser source alerts for OBS, Streamlabs, and more. Triggers instantly without delay."
          />
          <FeatureCard
            icon={<Smartphone className="w-8 h-8 text-blue-500" />}
            title="UPI-Powered"
            description="Accept direct transfer via GPay, PhonePe, Paytm, or any UPI app in India."
          />
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8 text-purple-500" />}
            title="Daily Payouts"
            description="Funds are credited to your bank account daily. No manual withdrawals or waiting."
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8 text-green-500" />}
            title="Secure & Private"
            description="Your bank details are encrypted and never shared. We maintain 100% data privacy."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-24 pb-12 border-t border-white/5 bg-[#0B0B0F]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <span className="text-white font-black text-sm">₹</span>
              </div>
              <div className="text-xl font-black text-white">WaveTips</div>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed mb-6">
              Empowering Indian creators to monetize their passion with seamless UPI integration and real-time streaming alerts.
            </p>
            <p className="text-primary font-bold text-sm">Made with 💜 by Tushar, Harshit, Vaibhav & Anoop.</p>
          </div>

          <div>
            <h4 className="text-white font-black uppercase text-xs tracking-widest mb-6">Menu</h4>
            <ul className="space-y-4 text-sm text-zinc-500 font-medium">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/qr-generator" className="hover:text-white transition-colors">QR Generator</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black uppercase text-xs tracking-widest mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-zinc-500 font-medium">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/refunds" className="hover:text-white transition-colors">Refund Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black uppercase text-xs tracking-widest mb-6">Support</h4>
            <ul className="space-y-4 text-sm text-zinc-500 font-medium">
              <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">WhatsApp Support</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Discord Community</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">
            Copyright © 2026 - Developed by Tushar, Harshit, Vaibhav & Anoop
          </p>
          <div className="flex gap-8 text-zinc-600">
            <Globe size={18} className="hover:text-white cursor-pointer" />
            <Heart size={18} className="hover:text-white cursor-pointer" />
            <CheckCircle2 size={18} className="hover:text-white cursor-pointer" />
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-[32px] glass hover:border-primary/50 transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-colors"></div>
      <div className="mb-6 p-4 rounded-2xl bg-white/5 w-fit group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tight">{title}</h3>
      <p className="text-zinc-500 leading-relaxed text-sm font-medium">{description}</p>
    </div>
  );
}

function LeaderboardCard({ title, items }: { title: string, items: any[] }) {
  return (
    <div className="p-8 rounded-[32px] glass border border-white/5 relative overflow-hidden">
      <h3 className="text-sm font-black text-zinc-500 uppercase tracking-[0.2em] mb-8">{title}</h3>
      <div className="space-y-6">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between items-center group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-zinc-500 group-hover:text-white group-hover:bg-primary/20 transition-all">
                {i + 1}
              </div>
              <div>
                <div className="font-bold text-white text-lg">{item.name}</div>
                <div className="text-xs text-green-500 font-bold">{item.trend} growth</div>
              </div>
            </div>
            <div className="text-xl font-black text-white">{item.amount}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
