'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Cookies from 'js-cookie'

export default function AuthCallbackPage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const token = searchParams.get('token')
        if (token) {
            Cookies.set('token', token, { expires: 7 })
            localStorage.setItem('token', token)
            // Optional: Fetch and set user context using this token here
            router.push('/dashboard')
        } else {
            router.push('/login?error=oauth_missing_token')
        }
    }, [router, searchParams])

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-white text-xl animate-pulse">
                Authenticating...
            </div>
        </div>
    )
}
