'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Sparkles, Zap, Cpu } from 'lucide-react'

export default function GlobalLoader() {
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        let loadingTimeout: ReturnType<typeof setTimeout> | null = null;
        let pendingClose = false;

        const handleLoading = (e: Event) => {
            const customEvent = e as CustomEvent
            const loading = customEvent.detail.isLoading
            
            if (loading) {
                if (loadingTimeout) clearTimeout(loadingTimeout);
                pendingClose = false;
                setIsLoading(true);
            } else {
                // Debounce the close slightly to prevent flickering between fast successive requests
                pendingClose = true;
                loadingTimeout = setTimeout(() => {
                    if (pendingClose) {
                        setIsLoading(false);
                    }
                }, 300);
            }
        }

        window.addEventListener('global-loading', handleLoading)
        return () => window.removeEventListener('global-loading', handleLoading)
    }, [])

    if (!isLoading) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative flex flex-col items-center justify-center pointer-events-none"
                >
                    {/* Glowing background */}
                    <div className="absolute inset-0 bg-primary-500/40 blur-[80px] rounded-full w-48 h-48 -z-10 animate-pulse" />
                    
                    {/* Character Container */}
                    <div className="relative flex items-center justify-center w-32 h-32 bg-black/50 border border-white/10 rounded-3xl shadow-2xl glass mb-8 overflow-hidden">
                        
                        {/* Orbiting Elements */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 rounded-3xl border border-dashed border-primary-500/30"
                        />
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-4 rounded-3xl border border-solid border-indigo-500/20"
                        />
                        
                        {/* Core Bot Character */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="text-primary-400 z-10 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                        >
                            <Bot size={56} strokeWidth={1.5} />
                        </motion.div>

                        {/* Sparkles */}
                        <motion.div
                            animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                            className="absolute top-3 right-3 text-yellow-400"
                        >
                            <Sparkles size={16} />
                        </motion.div>
                        <motion.div
                            animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
                            className="absolute bottom-3 left-3 text-emerald-400"
                        >
                            <Cpu size={16} />
                        </motion.div>
                        <motion.div
                            animate={{ opacity: [0, 1, 0], y: [0, -5, 0] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: 0.5 }}
                            className="absolute top-1/2 left-3 text-blue-400"
                        >
                            <Zap size={16} />
                        </motion.div>
                    </div>

                    <motion.div
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="flex flex-col items-center"
                    >
                        <h2 className="text-sm md:text-xl font-black tracking-widest uppercase italic text-white flex items-center">
                            Processing
                            <span className="flex space-x-1 ml-2">
                                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}>.</motion.span>
                                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}>.</motion.span>
                                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}>.</motion.span>
                            </span>
                        </h2>
                        <p className="text-[10px] md:text-xs text-primary-300/60 font-black uppercase tracking-[0.3em] mt-3 bg-primary-500/10 px-4 py-1.5 rounded-full border border-primary-500/20">
                            Neural Core Engaged
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
