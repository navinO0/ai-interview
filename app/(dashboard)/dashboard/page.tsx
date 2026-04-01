'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { TrendingUp, Users, Target, Clock, Star, Play, ArrowRight, BookOpen, Laugh, ShieldAlert, CheckCircle2, XCircle, Zap, ShieldCheck, Info } from 'lucide-react'
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import { useWorkspaces } from '../../context/WorkspaceContext'
import Link from 'next/link'
import api from '../../services/api'

const data = [
    { name: 'Mon', score: 40 },
    { name: 'Tue', score: 55 },
    { name: 'Wed', score: 45 },
    { name: 'Thu', score: 70 },
    { name: 'Fri', score: 65 },
    { name: 'Sat', score: 85 },
    { name: 'Sun', score: 80 },
]

export default function DashboardPage() {
    const { workspaces, lastWorkspace, loading } = useWorkspaces()
    const [dashboardContent, setDashboardContent] = useState<any>(null)
    const [contentLoading, setContentLoading] = useState(true)

    useEffect(() => {
        fetchDashboardContent()
    }, [])

    const fetchDashboardContent = async () => {
        try {
            const { data } = await api.get('/dashboard/content')
            setDashboardContent(data)
        } catch (error) {
            console.error('Failed to fetch dashboard content:', error)
        } finally {
            setContentLoading(false)
        }
    }

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    }

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 12 } }
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            <div className="space-y-8 pb-12">
                <motion.header variants={itemVariants}>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2 tracking-tight text-primary">System Overview</h1>
                            <p className="text-muted font-medium">Elevate your technical presence and career strategy.</p>
                        </div>
                        <Link href="/learning-paths" className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary-600/20 flex items-center group">
                            New Learning Plan <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </motion.header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Stats and Chart */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Resume Workspace Card */}
                        {loading ? (
                            <div className="h-48 glass animate-pulse rounded-2xl" />
                        ) : lastWorkspace && (
                            <motion.div
                                variants={itemVariants}
                                animate={{
                                    boxShadow: [
                                        "0 0 0px rgba(59, 130, 246, 0)",
                                        "0 0 30px rgba(59, 130, 246, 0.2)",
                                        "0 0 0px rgba(59, 130, 246, 0)"
                                    ]
                                }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <div className={`relative overflow-hidden rounded-2xl p-8 bg-gradient-to-r ${lastWorkspace.color} text-white shadow-xl`}>
                                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div>
                                            <div className="flex items-center space-x-2 text-white/80 text-xs font-bold uppercase tracking-widest mb-2">
                                                <Zap size={12} fill="currentColor" className="animate-pulse" />
                                                <span>Current Focus</span>
                                            </div>
                                            <h2 className="text-3xl font-black mb-1">{lastWorkspace.title}</h2>
                                            <p className="text-white/70 font-medium max-w-lg mb-6">{lastWorkspace.goal}</p>

                                            <div className="flex items-center space-x-6">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] uppercase tracking-tighter text-white/60">Progress</p>
                                                    <p className="text-xl font-black">{lastWorkspace.progress}%</p>
                                                </div>
                                                <div className="space-y-1 border-l border-white/20 pl-6">
                                                    <p className="text-[10px] uppercase tracking-tighter text-white/60">Level</p>
                                                    <p className="text-xl font-black">{lastWorkspace.difficulty}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <Link
                                            href={`/learning-paths?workspaceId=${lastWorkspace.id}`}
                                            className="bg-white text-black h-16 w-16 md:h-20 md:w-20 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-2xl group shrink-0"
                                        >
                                            <Play size={24} fill="currentColor" className="ml-1 group-hover:scale-125 transition-transform" />
                                        </Link>
                                    </div>
                                    <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-white/10 rounded-full blur-3xl opacity-50" />
                                </div>
                            </motion.div>
                        )}

                        {/* Dashboard Visualizer - Joke & Politics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Daily Bit (Joke) */}
                            <motion.div
                                variants={itemVariants}
                            >
                                <div className="glass p-6 relative overflow-hidden group hover:border-primary-500/50 transition-colors">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-yellow-500/20 rounded-lg">
                                                <Laugh className="text-yellow-500" size={18} />
                                            </div>
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted">Daily Bit</h3>
                                        </div>
                                        <span className="text-[10px] bg-primary-500/10 px-2 py-1 rounded text-muted font-bold">CRINGE</span>
                                    </div>
                                    <div className="min-h-[80px] flex items-center">
                                        {contentLoading ? (
                                            <div className="space-y-2 w-full">
                                                <div className="h-3 bg-white/5 rounded w-full animate-pulse" />
                                                <div className="h-3 bg-white/5 rounded w-2/3 animate-pulse" />
                                            </div>
                                        ) : (
                                            <motion.p
                                                animate={{ y: [0, -2, 0] }}
                                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                                className="text-secondary italic font-medium leading-relaxed"
                                            >
                                                "{dashboardContent?.joke?.content || 'Loading humor module...'}"
                                            </motion.p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Office Survival */}
                            <motion.div
                                variants={itemVariants}
                            >
                                <div className="glass p-6 group hover:border-red-500/50 transition-colors">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-2 bg-red-500/20 rounded-lg">
                                            <ShieldAlert className="text-red-500" size={18} />
                                        </div>
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted">Survival Guide</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {contentLoading ? (
                                            [1, 2, 3].map(i => <div key={i} className="h-2 bg-white/5 rounded w-full animate-pulse" />)
                                        ) : (
                                            dashboardContent?.politicsTips?.map((tip: any, i: number) => (
                                                <div key={i} className="flex gap-3 group/tip">
                                                    <div className="mt-1.5 h-1 w-1 rounded-full bg-red-500/50 group-hover/tip:bg-red-500 transition-colors" />
                                                    <p className="text-xs text-secondary group-hover/tip:text-primary transition-colors leading-snug">{tip.content}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Progress Chart */}
                        <motion.div variants={itemVariants}>
                            <div className="glass p-8 min-h-[350px]">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-xl font-bold tracking-tight">Performance Trend</h3>
                                    <button className="text-xs font-bold uppercase tracking-widest text-primary-400 hover:text-primary-300 transition-colors">Analytics &rarr;</button>
                                </div>
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={data}>
                                            <defs>
                                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="name" stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'rgba(10,10,10,0.9)', border: '1px solid var(--border-color)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                                                itemStyle={{ color: 'var(--accent-primary)' }}
                                            />
                                            <Area type="monotone" dataKey="score" stroke="var(--accent-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Dev Excellence & Workspaces */}
                    <div className="space-y-6">
                        {/* Dev Excellence */}
                        <motion.div
                            variants={itemVariants}
                        >
                            <div className="glass p-6 border-l-4 border-primary-500 bg-gradient-to-br from-primary-900/10 to-transparent">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="p-2 bg-primary-600/20 rounded-lg">
                                        <ShieldCheck className="text-primary-500" size={18} />
                                    </div>
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted">Dev Excellence</h3>
                                </div>

                                <div className="space-y-6">
                                    {/* DOs */}
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black tracking-[0.2em] text-green-500/70 uppercase">Industry Best Practices</p>
                                        {contentLoading ? (
                                            <div className="h-10 bg-white/5 rounded animate-pulse" />
                                        ) : (
                                            dashboardContent?.excellenceTips?.filter((t: any) => t.type === 'DO').map((tip: any, i: number) => (
                                                <div key={i} className="flex gap-3 items-start bg-green-500/5 p-3 rounded-xl border border-green-500/10 hover:bg-green-500/10 transition-colors">
                                                    <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={14} />
                                                    <p className="text-[11px] text-secondary font-medium leading-normal">{tip.content}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* AVOIDs */}
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black tracking-[0.2em] text-red-500/70 uppercase">Wall of Shame (Avoid)</p>
                                        {contentLoading ? (
                                            <div className="h-10 bg-white/5 rounded animate-pulse" />
                                        ) : (
                                            dashboardContent?.excellenceTips?.filter((t: any) => t.type === 'AVOID').map((tip: any, i: number) => (
                                                <div key={i} className="flex gap-3 items-start bg-red-500/5 p-3 rounded-xl border border-red-500/10 hover:bg-red-500/10 transition-colors">
                                                    <XCircle className="text-red-500 shrink-0 mt-0.5" size={14} />
                                                    <p className="text-[11px] text-secondary font-medium leading-normal">{tip.content}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Topics List */}
                        <motion.div variants={itemVariants}>
                            <div className="glass p-6 overflow-hidden">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold tracking-tight">Active Paths</h3>
                                    <span className="text-[10px] font-bold text-gray-500">{workspaces.length} TOTAL</span>
                                </div>
                                <div className="space-y-5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {workspaces.length > 0 ? workspaces.map((ws, i) => (
                                        <Link href={`/learning-paths?workspaceId=${ws.id}`} key={ws.id} className="block group">
                                            <div className="flex justify-between text-[11px] mb-2 font-bold tracking-tight">
                                                <span className="text-muted group-hover:text-primary transition-colors truncate pr-4">{ws.title}</span>
                                                <span className="text-primary-400">{ws.progress}%</span>
                                            </div>
                                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${ws.progress}%` }}
                                                    transition={{ duration: 1, delay: i * 0.1 }}
                                                    className="h-full bg-primary-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]"
                                                />
                                            </div>
                                        </Link>
                                    )) : (
                                        <div className="py-12 text-center">
                                            <Info className="mx-auto text-gray-600 mb-3" size={24} />
                                            <p className="text-[10px] text-gray-500 italic uppercase">Your growth journey starts with a workspace.</p>
                                            <Link href="/learning-paths" className="text-[10px] font-black text-primary-500 hover:text-primary-400 mt-4 inline-block uppercase tracking-widest">Create One Now &rarr;</Link>
                                        </div>
                                    )}
                                </div>
                                {workspaces.length > 0 && (
                                    <Link href="/learning-paths" className="w-full mt-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-500 hover:text-white hover:bg-white/10 transition-all font-bold text-[10px] uppercase tracking-widest flex items-center justify-center">
                                        Manage Paths
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { icon: Target, label: 'Readiness', val: '82%', trend: '+4%', color: 'text-green-500' },
                        { icon: Clock, label: 'Practice', val: '12.5h', trend: '+1.2h', color: 'text-primary-400' },
                        { icon: BookOpen, label: 'Workspaces', val: workspaces.length.toString(), trend: 'NEW', color: 'text-yellow-500' },
                        { icon: Star, label: 'Rating', val: '4.8', trend: 'TOP', color: 'text-purple-500' }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            variants={itemVariants}
                        >
                            <div className="glass p-4 group hover:bg-white/5 transition-all">
                                <div className="flex items-center gap-3 mb-2">
                                    <stat.icon size={14} className={stat.color} />
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
                                </div>
                                <div className="flex items-end justify-between">
                                    <h4 className="text-xl font-bold">{stat.val}</h4>
                                    <span className={`text-[8px] font-black uppercase ${stat.trend.includes('+') ? 'text-green-500' : 'text-primary-500'}`}>{stat.trend}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    )
}
