'use client'

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
    const { signOut } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const performLogout = async () => {
            await signOut();
            router.push('/');
        };
        performLogout();
    }, [signOut, router]);

    return (
        <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center text-white">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Logging you out...</p>
            </div>
        </div>
    );
}
