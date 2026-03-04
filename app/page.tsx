'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Terminal, Cpu, Zap, Bookmark } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden bg-black text-white">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary-600/20 blur-[120px] rounded-full -z-10" />

            <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 py-6 backdrop-blur-md bg-black/50 border-b border-white/10">
                <div className="flex items-center space-x-2">
                    <Terminal className="text-primary-500" />
                    <span className="font-bold text-xl tracking-tighter uppercase">AI Coach</span>
                </div>
                <div className="flex items-center space-x-6">
                    <Link href="/login" className="text-sm font-medium hover:text-primary-400 transition-colors">Login</Link>
                    <Link href="/register" className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 rounded-full text-sm font-bold transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                        Get Started
                    </Link>
                </div>
            </nav>

            <main className="max-w-6xl w-full px-6 pt-32 pb-24 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="px-4 py-1.5 rounded-full bg-primary-950/30 border border-primary-500/30 text-primary-400 text-xs font-bold uppercase tracking-widest mb-6 inline-block">
                        Production-Grade Interview prep
                    </span>
                    <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-8 leading-tight">
                        Level Up Your <br />
                        <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                            Backend Career
                        </span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
                        AI-driven adaptive coaching, deep resume analysis, and real-world backend scenarios prepared by a local LLM.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                        <Link href="/register" className="group px-8 py-4 bg-white text-black rounded-full font-bold text-lg flex items-center hover:bg-primary-50 transition-all">
                            Start Free Trial
                            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link href="#features" className="px-8 py-4 glass text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all">
                            View Features
                        </Link>
                    </div>
                </motion.div>

                <motion.div
                    className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    {[
                        { icon: Cpu, title: 'Local AI Engine', desc: 'Private, secure, and fast responses using Ollama Llama3.' },
                        { icon: Zap, title: 'Adaptive Questions', desc: 'Questions that evolve based on your previous answers.' },
                        { icon: Bookmark, title: 'Curated Content', desc: 'Auto-generated notes and blogs based on your weak spots.' }
                    ].map((feature, i) => (
                        <div key={i} className="glass p-8 text-left hover:border-primary-500/50 transition-colors group">
                            <feature.icon className="w-12 h-12 text-primary-500 mb-6 group-hover:scale-110 transition-transform" />
                            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </motion.div>
            </main>
        </div>
    )
}
