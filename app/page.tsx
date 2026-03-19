'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import {
    ArrowRight, Terminal, Cpu, Zap, Bookmark,
    Layers, Search, MessageSquare, Code2,
    Globe, Shield, Gauge, Github, Star,
    Database, Network, Infinity as InfinityIcon, Sparkles,
    ShieldCheck, Code, HardDrive,
    Workflow, Radio, Activity, Layout, BookOpen,
    CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { useRef } from 'react'

export default function LandingPage() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    })

    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
    const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])
    const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -100])

    // Parallax Offsets for floating elements
    const p1 = useTransform(scrollYProgress, [0, 1], [0, -200])
    const p2 = useTransform(scrollYProgress, [0, 1], [0, -400])
    const p3 = useTransform(scrollYProgress, [0, 1], [0, -600])
    const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 45])
    const rotate2 = useTransform(scrollYProgress, [0, 1], [0, -90])

    const features = [
        {
            icon: InfinityIcon,
            title: 'Adaptive MCQ Engine',
            desc: 'Self-evolving question paths that identify your weak spots in real-time using Bayesian-inspired selection algorithms. No static question banks.',
            color: 'text-blue-400'
        },
        {
            icon: Network,
            title: 'Distributed Event Bus',
            desc: 'Powered by Kafka & BullMQ. Ensures sub-100ms latency for AI state synchronization across distributed worker nodes.',
            color: 'text-purple-400'
        },
        {
            icon: Database,
            title: 'RAG AI Tutor',
            desc: 'Retrieval Augmented Generation using high-dimensional Vector embeddings. Context-aware technical assistance that actually understands your code.',
            color: 'text-emerald-400'
        },
        {
            icon: BookOpen,
            title: '30-Day Mastery Paths',
            desc: 'Automated roadmaps batch-generated via background workers. Dynamic progress tracking with live Socket updates.',
            color: 'text-amber-400'
        },
        {
            icon: Code,
            title: 'DSA Execution Sandbox',
            desc: 'Integrated LeetCode-style environment with live Big-O analysis and multi-language support (TS, Py, Go, C++).',
            color: 'text-rose-400'
        },
        {
            icon: ShieldCheck,
            title: 'Hybrid Intelligence',
            desc: 'Smart switching between Local Ollama (Privacy-First) and Cloud Gemini/Claude (Complex Reasoning) depending on complexity.',
            color: 'text-cyan-400'
        },
        {
            icon: Zap,
            title: 'Real-time Analytics',
            desc: 'Live telemetry on your performance. Watch your proficiency grow on a granular scale across 50+ technical domains.',
            color: 'text-yellow-400'
        },
        {
            icon: Workflow,
            title: 'Interview Simulator',
            desc: 'AI-driven roleplay that mimics high-pressure environments, adjusting its tone based on your real-time responses.',
            color: 'text-orange-400'
        },
        {
            icon: Radio,
            title: 'Webhooks & Integration',
            desc: 'Sync your progress with GitHub or receive mobile notifications for upcoming daily tasks automatically.',
            color: 'text-pink-400'
        }
    ]

    const techStack = [
        { name: 'Next.js 14', category: 'Frontend Infrastructure', detail: 'App Router, Server Components' },
        { name: 'Node.js & TS', category: 'Backend Engine', detail: 'Express, TypeORM, Cluster Mode' },
        { name: 'PostgreSQL', category: 'Persistence Layer', detail: 'JSONB Optimizations, indexing' },
        { name: 'Redis', category: 'Caching & Streams', detail: 'Pub/Sub, Rate Limiting' },
        { name: 'Apache Kafka', category: 'Event Orchestration', detail: 'High Throughput, Fault Tolerance' },
        { name: 'BullMQ', category: 'Task Queueing', detail: 'Distributed Job Scheduling' },
        { name: 'Vector DB', category: 'AI Semantic Search', detail: 'Cosine Similarity, Embeddings' },
        { name: 'Ollama & Cloud LLMs', category: 'AI Inference', detail: 'Hybrid Model Orchestration' },
        { name: 'Docker & Compose', category: 'Deployment', detail: 'Containerized Microservices' },
        { name: 'Socket.io', category: 'Real-time', detail: 'Binary Streams, Low Latency' }
    ]

    return (
        <div ref={containerRef} className="flex flex-col bg-black text-white selection:bg-primary-500/30">
            {/* Nav */}
            <nav className="fixed top-0 w-full z-[100] flex justify-between items-center px-6 md:px-12 py-5 backdrop-blur-xl bg-black/40 border-b border-white/5">
                <div className="flex items-center space-x-3 group cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:rotate-12 transition-transform duration-300">
                        <Terminal size={22} className="text-white" />
                    </div>
                    <span className="font-black text-2xl tracking-tighter uppercase italic">AI Interview Coach</span>
                </div>
                <div className="hidden md:flex items-center space-x-8">
                    {['Features', 'Architecture', 'Pricing'].map(item => (
                        <Link key={item} href={`#${item.toLowerCase()}`} className="text-sm font-bold text-gray-400 hover:text-white transition-all tracking-widest uppercase">
                            {item}
                        </Link>
                    ))}
                    <Link href="/login" className="px-8 py-3 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all shadow-xl shadow-white/5">
                        Get Access
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6 overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary-600/10 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse delay-700" />

                {/* Floating Decorative Elements */}
                <motion.div style={{ y: p1, rotate: rotate1 }} className="absolute top-1/3 left-[10%] opacity-20 hidden lg:block">
                    <Cpu size={120} strokeWidth={0.5} className="text-primary-500" />
                </motion.div>
                <motion.div style={{ y: p2, rotate: rotate2 }} className="absolute bottom-1/4 right-[5%] opacity-15 hidden lg:block">
                    <Zap size={180} strokeWidth={0.5} className="text-indigo-500" />
                </motion.div>
                <motion.div style={{ y: p3 }} className="absolute top-1/4 right-1/3 opacity-10 hidden lg:block">
                    <Code size={80} strokeWidth={0.5} className="text-emerald-500" />
                </motion.div>
                <motion.div style={{ y: p2, rotate: rotate1 }} className="absolute bottom-1/3 left-1/4 opacity-10 hidden lg:block">
                    <Network size={100} strokeWidth={0.5} className="text-purple-500" />
                </motion.div>

                <motion.div
                    style={{ opacity, scale, y: heroY }}
                    className="max-w-5xl w-full text-center relative z-10"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                            v2.0 Architecture Live
                        </span>
                    </motion.div>

                    <h1 className="text-6xl md:text-[10rem] font-black tracking-tightest leading-[0.85] mb-12 uppercase italic">
                        Interview <br />
                        <span className="bg-gradient-to-r from-primary-400 via-indigo-400 to-primary-600 bg-clip-text text-transparent">
                            Singularity
                        </span>
                    </h1>

                    <p className="text-lg md:text-2xl text-gray-400 max-w-3xl mx-auto mb-16 leading-relaxed font-medium">
                        The world’s first autonomous career orchestration platform. Leveraging <span className="text-white italic">Event-Driven AI</span> and <span className="text-white italic">Hybrid LLM Orchestration</span> to guarantee 10x faster technical mastery.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link href="/register" prefetch={false} className="group h-16 px-10 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center transition-all shadow-2xl shadow-primary-600/40">
                            Initiate Protocol
                            <ArrowRight size={18} className="ml-3 group-hover:translate-x-2 transition-transform" />
                        </Link>
                        <Link href="#architecture" className="h-16 px-10 glass hover:bg-white/5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center transition-all">
                            View Tech Stack
                        </Link>
                    </div>
                </motion.div>

                {/* Animated Grid Lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] -z-10" />
            </section>

            {/* Feature Cosmos */}
            <section id="features" className="py-32 px-6 md:px-12 relative">
                <div className="max-w-7xl mx-auto">
                    {/* Floating Tech Deco */}
                    <motion.div style={{ y: p2, rotate: rotate1 }} className="absolute -top-20 -left-10 opacity-10 hidden lg:block">
                        <Database size={100} strokeWidth={0.5} className="text-emerald-500" />
                    </motion.div>
                    <motion.div style={{ y: p1, rotate: rotate2 }} className="absolute top-1/2 -right-20 opacity-10 hidden lg:block">
                        <Shield size={120} strokeWidth={0.5} className="text-primary-500" />
                    </motion.div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-24 relative z-10">
                        <div className="max-w-xl">
                            <h2 className="text-sm font-black text-primary-500 uppercase tracking-[0.3em] mb-4">The Feature Cosmos</h2>
                            <h3 className="text-5xl md:text-7xl font-black tracking-tighter leading-none italic uppercase">
                                Tiny Details.<br />Massive Impact.
                            </h3>
                        </div>
                        <p className="text-gray-500 max-w-xs font-medium text-sm leading-relaxed">
                            No placeholders. No generic advice. Every line of code is engineered for zero-compromise performance.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="group glass p-10 flex flex-col hover:border-white/20 transition-all duration-500 cursor-default"
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 ${feature.color}`}>
                                    <feature.icon size={28} />
                                </div>
                                <h4 className="text-2xl font-black mb-4 uppercase italic tracking-tight">{feature.title}</h4>
                                <p className="text-gray-500 group-hover:text-gray-300 transition-colors text-sm leading-8 font-medium">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Architecture Section */}
            <section id="architecture" className="py-32 bg-white text-black relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 text-center">
                    <h2 className="text-sm font-black text-primary-600 uppercase tracking-[0.3em] mb-12">The Machine Room</h2>
                    <h3 className="text-6xl md:text-9xl font-black tracking-tightest leading-none mb-24 uppercase italic">
                        Raw Power. <br />Expert Orchestration.
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {techStack.map((tech, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="group p-6 rounded-2xl bg-black text-white flex flex-col items-center justify-center border border-white/5 hover:border-primary-500/50 transition-all shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-primary-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="text-[7px] font-black uppercase tracking-[0.2em] text-primary-500 mb-2">{tech.category}</span>
                                <span className="text-sm font-black tracking-tight uppercase italic mb-2 relative z-10">{tech.name}</span>
                                <span className="text-[9px] text-gray-500 group-hover:text-gray-400 transition-colors text-center leading-tight">{tech.detail}</span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Final Floating Deco */}
                    <motion.div style={{ y: p3, rotate: rotate2 }} className="absolute bottom-20 right-1/4 opacity-10 hidden lg:block">
                        <Globe size={150} strokeWidth={0.5} className="text-indigo-400" />
                    </motion.div>

                    <div className="mt-32 p-12 rounded-[3rem] bg-black text-white relative border border-white/5 overflow-hidden text-left shadow-3xl">
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary-600/5 blur-[100px] -z-10" />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div className="space-y-8">
                                <motion.h4
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    className="text-4xl md:text-6xl font-black tracking-tightest leading-none uppercase italic"
                                >
                                    The "Hard Work" Behind Every Response
                                </motion.h4>
                                <p className="text-gray-400 text-lg leading-relaxed font-medium">
                                    Our orchestration layer is the result of thousands of hours of optimization. We don't just "ping an API". Every interaction triggers a high-precision, multi-stage workflow:
                                </p>
                                <ul className="space-y-6">
                                    {[
                                        { title: 'Event Sourcing', desc: 'Kafka clusters ingest intent and broadcast to specialized micro-consumers for parallel pre-processing.', icon: Network },
                                        { title: 'Vector Retrieval', desc: 'RAG engine executes high-dimensional similarity search in <15ms for hyper-contextual tutoring.', icon: Database },
                                        { title: 'Task Prioritization', desc: 'BullMQ orchestrators manage distributed workers with fair-share scheduling and priority weights.', icon: Activity },
                                        { title: 'Binary Streaming', desc: 'Low-latency Socket.io pipes stream AI tokens directly to your UI with zero-flicker rendering.', icon: Zap }
                                    ].map((step, i) => (
                                        <motion.li
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex items-start space-x-5"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 mt-1 border border-white/10 group-hover:border-primary-500/50 transition-all">
                                                <step.icon size={20} className="text-primary-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-sm font-black text-white uppercase tracking-[0.15em]">{step.title}</span>
                                                <p className="text-xs text-gray-500 font-medium leading-relaxed uppercase">{step.desc}</p>
                                            </div>
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-primary-600/20 blur-3xl group-hover:bg-primary-600/30 transition-all rounded-full" />
                                <div className="relative glass p-6 rounded-3xl border-white/5 bg-black/60 text-[10px] font-mono leading-relaxed text-primary-400 backdrop-blur-3xl">
                                    <div className="flex items-center space-x-2 mb-4 border-b border-white/5 pb-4">
                                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                        <span className="text-gray-600 ml-2 uppercase tracking-widest text-[8px]">Orchestrator Logs — LIVE</span>
                                    </div>
                                    <pre className="whitespace-pre-wrap">
                                        {`// Internal Event Bus Initialization...
topic: "ai.inference.request"
partition: user_shard_08
priority: P0_CRITICAL
payload: {
  userId: "a9e5f9ee-2c76-4e72...",
  action: "GENERATE_ROADMAP",
  context: {
    rag_enabled: true,
    vector_dims: 1536,
    socket_id: "kx92..."
  }
}

// Executing RAG Semantic Search...
MATCH (v:Vector) WHERE v.embedding <=> :query
RESULT: 0.982 Similarity (Match Found)

// Dispatching to BullMQ Worker...
jobId: mq_8321
status: "BROADCASTING_TO_WORKERS"`}
                                    </pre>
                                </div>
                                <motion.div
                                    className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary-500/20 blur-2xl rounded-full"
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.3, 0.6, 0.3]
                                    }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-6 md:px-12 border-t border-white/5">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="space-y-4 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                <Terminal size={16} className="text-primary-500" />
                            </div>
                            <span className="font-black text-xl tracking-tighter uppercase italic">AI Interview Coach</span>
                        </div>
                        <p className="text-gray-500 text-sm font-medium">© 2026 AI Laboratory. Built with raw obsession.</p>
                    </div>

                    <div className="flex items-center space-x-8">
                        <Link href="#" className="text-gray-500 hover:text-white transition-colors"><Github size={20} /></Link>
                        <Link href="#" className="text-gray-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest italic">Legal</Link>
                        <Link href="#" className="text-gray-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest italic">System Status</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}

function CheckCircleIcon({ className }: { className?: string }) {
    return (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
    )
}
