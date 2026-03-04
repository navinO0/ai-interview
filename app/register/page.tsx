'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Terminal, Mail, Lock, User, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import authService from '../services/authService'

export default function RegisterPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        try {
            await authService.register(name, email, password)
            // Auto login after registration
            await authService.login(email, password)
            router.push('/resume')
        } catch (err: any) {
            setError(err.message || 'Registration failed')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 right-1/2 translate-x-1/2 w-[600px] h-[400px] bg-primary-600/10 blur-[100px] rounded-full -z-10" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md glass p-10"
            >
                <div className="flex flex-col items-center mb-10">
                    <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary-600/30">
                        <Terminal size={24} />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
                    <p className="text-gray-400 mt-2">Start your journey to backend mastery</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 ml-1">Full Name</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-500 transition-colors" size={18} />
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-primary-500 transition-all font-medium"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 ml-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-500 transition-colors" size={18} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-primary-500 transition-all font-medium"
                                placeholder="name@company.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-500 transition-colors" size={18} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-primary-500 transition-all font-medium"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 rounded-xl font-bold flex items-center justify-center transition-all shadow-lg hover:shadow-primary-600/30 mt-4"
                    >
                        {isLoading ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                            />
                        ) : null}
                        Get Started <ArrowRight size={18} className="ml-2" />
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                    <button
                        onClick={() => window.location.href = 'http://localhost:3001/api/auth/google'}
                        type="button"
                        className="w-full py-3.5 glass flex items-center justify-center space-x-3 text-sm font-medium hover:bg-white/10 transition-all"
                    >
                        <svg className="w-5 h-5 mr-1" viewBox="0 0 48 48">
                            <title>Google Logo</title>
                            <clipPath id="g">
                                <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" />
                            </clipPath>
                            <g className="colors" clipPath="url(#g)">
                                <path fill="#FBBC05" d="M0 37V11l17 13z" />
                                <path fill="#EA4335" d="M0 11l17 13 7-6.1L48 14V0H0z" />
                                <path fill="#34A853" d="M0 37l30-23 7.9 1L48 0v48H0z" />
                                <path fill="#4285F4" d="M48 48L17 24l-4-3 35-10z" />
                            </g>
                        </svg>
                        <span>Continue with Google</span>
                    </button>

                    <p className="text-center text-sm text-gray-500">
                        Already have an account? {' '}
                        <Link href="/login" className="text-primary-500 font-bold hover:underline">Sign in</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
