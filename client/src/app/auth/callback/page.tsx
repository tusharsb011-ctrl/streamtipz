'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

/**
 * Ensure a profile row exists in the profiles table for the current user.
 * Also handles storing the role from Google OAuth signup flow.
 */
async function ensureProfile() {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const meta = user.user_metadata || {}
        let username = meta.username || meta.preferred_username || null
        if (username && username.includes('@')) {
            username = username.split('@')[0]
        }
        if (!username) {
            username = user.email?.split('@')[0] || null
        }
        const full_name = meta.full_name || meta.name || username || null
        const avatar_url = meta.avatar_url || meta.picture || null

        // Get role from metadata or localStorage (set during Google signup)
        let role = meta.role || null
        if (!role && typeof window !== 'undefined') {
            const pendingRole = localStorage.getItem('pending_role')
            if (pendingRole) {
                role = pendingRole
                localStorage.removeItem('pending_role')
            }
        }

        await supabase.from('profiles').upsert({
            id: user.id,
            email: user.email || '',
            username: username,
            full_name: full_name,
            avatar_url: avatar_url,
            ...(role ? { role } : {}),
        }, { onConflict: 'id' })
    } catch (err) {
        console.error('Profile ensure error:', err)
    }
}

/**
 * Detect user role from profile and return the appropriate redirect path.
 */
async function getRedirectByRole(fallbackPath: string): Promise<string> {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return fallbackPath

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role === 'viewer') return '/viewer'
        if (profile?.role === 'creator') return '/dashboard'
    } catch {
        // Fallback
    }
    return fallbackPath
}

export default function AuthCallbackPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const handleCallback = async () => {
            const next = searchParams.get('next') || '/dashboard'

            const { data: { session }, error: sessionError } = await supabase.auth.getSession()

            if (sessionError) {
                console.error('Auth callback error:', sessionError)
                setError(sessionError.message)
                setTimeout(() => router.push('/login?error=callback_failed'), 2000)
                return
            }

            if (session) {
                await ensureProfile()
                const redirect = await getRedirectByRole(next)
                router.push(redirect)
                return
            }

            // Try PKCE flow
            const urlParams = new URLSearchParams(window.location.search)
            const code = urlParams.get('code')

            if (code) {
                const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
                if (exchangeError) {
                    console.error('Code exchange error:', exchangeError)
                    setError(exchangeError.message)
                    setTimeout(() => router.push('/login?error=callback_failed'), 2000)
                    return
                }
                await ensureProfile()
                const redirect = await getRedirectByRole(next)
                router.push(redirect)
                return
            }

            // Hash params
            if (window.location.hash) {
                setTimeout(async () => {
                    const { data: { session: retrySession } } = await supabase.auth.getSession()
                    if (retrySession) {
                        await ensureProfile()
                        const redirect = await getRedirectByRole(next)
                        router.push(redirect)
                    } else {
                        router.push('/login?error=callback_failed')
                    }
                }, 1500)
                return
            }

            setTimeout(() => router.push('/login?error=no_auth_data'), 2000)
        }

        handleCallback()
    }, [router, searchParams])

    return (
        <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
            <div className="text-center">
                {error ? (
                    <div className="space-y-4">
                        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
                            <span className="text-red-400 text-2xl">✕</span>
                        </div>
                        <p className="text-red-400 font-bold text-lg">Authentication Failed</p>
                        <p className="text-zinc-500 text-sm">{error}</p>
                        <p className="text-zinc-600 text-xs">Redirecting to login...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <Loader2 size={48} className="animate-spin text-purple-500 mx-auto" />
                        <p className="text-white font-bold text-lg">Signing you in...</p>
                        <p className="text-zinc-500 text-sm">Please wait while we complete authentication</p>
                    </div>
                )}
            </div>
        </div>
    )
}
