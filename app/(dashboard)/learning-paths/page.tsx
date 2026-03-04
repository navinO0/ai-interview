'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Map as MapIcon, Star, CheckCircle, Target, Lock, ChevronRight, Plus, Trash2, BookOpen, Clock, Play, ArrowRight, X, MessageSquare, Terminal, Calendar, RefreshCw } from 'lucide-react'
import { useWorkspaces, Workspace, Difficulty } from '../../context/WorkspaceContext'
import { motion, AnimatePresence } from 'framer-motion'
import RoadmapCalendar from '../../../components/workspaces/RoadmapCalendar'

function WorkspacesContent() {
    const { workspaces, loading, createWorkspace, deleteWorkspace, completeStep, touchWorkspace, updateWorkspace, refreshWorkspaces, retryWorkspace } = useWorkspaces()
    const router = useRouter()
    const searchParams = useSearchParams()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null)
    const [isCreating, setIsCreating] = useState(false)

    // Form State
    const [title, setTitle] = useState('')
    const [goal, setGoal] = useState('')
    const [category, setCategory] = useState('Frontend')
    const [difficulty, setDifficulty] = useState<Difficulty>('Medium')
    const [learnerLevel, setLearnerLevel] = useState('Professional')
    const [targetDays, setTargetDays] = useState(10)

    // Polling logic for background generation
    useEffect(() => {
        const needsPolling = workspaces.some(ws => ws.status === 'processing' || ws.status === 'queued')
        if (!needsPolling) return

        const interval = setInterval(() => {
            refreshWorkspaces()
        }, 3000)

        return () => clearInterval(interval)
    }, [workspaces, refreshWorkspaces])

    // Update selected workspace if its status changes in the workspaces list
    useEffect(() => {
        if (selectedWorkspace) {
            const updated = workspaces.find(w => w.id === selectedWorkspace.id)
            if (updated && (
                updated.status !== selectedWorkspace.status ||
                updated.generationProgress !== selectedWorkspace.generationProgress ||
                (updated.steps && selectedWorkspace.steps && updated.steps.length !== selectedWorkspace.steps.length)
            )) {
                setSelectedWorkspace(updated)
            }
        }
    }, [workspaces, selectedWorkspace])

    // Restore workspace from URL on load
    useEffect(() => {
        if (!loading && workspaces.length > 0 && !selectedWorkspace) {
            const activeId = searchParams.get('workspaceId');
            if (activeId) {
                const ws = workspaces.find(w => w.id === activeId);
                if (ws) {
                    setSelectedWorkspace(ws);
                    touchWorkspace(ws.id).catch(console.error);
                }
            }
        }
    }, [loading, workspaces, searchParams, selectedWorkspace])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsCreating(true)
        try {
            const ws = await createWorkspace({
                title,
                goal,
                category,
                difficulty,
                learnerLevel,
                targetDays
            })

            setIsModalOpen(false)
            setTitle('')
            setGoal('')
            setSelectedWorkspace(ws)
        } catch (error) {
            console.error('Failed to create workspace:', error)
        } finally {
            setIsCreating(false)
        }
    }

    const openWorkspace = (ws: Workspace) => {
        touchWorkspace(ws.id)
        setSelectedWorkspace(ws)
        router.replace(`?workspaceId=${ws.id}`)
    }

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Learning Workspaces</h1>
                    <p className="text-gray-400">Deep dive into specific topics with AI-guided structures.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary-600/20 flex items-center justify-center"
                >
                    <Plus size={18} className="mr-2" /> Create New Workspace
                </button>
            </header>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="glass p-6 h-64 animate-pulse bg-white/5 rounded-3xl" />
                    ))}
                </div>
            ) : !selectedWorkspace ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {workspaces.map((ws) => (
                        <motion.div
                            key={ws.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass p-6 group cursor-pointer hover:border-primary-500/30 transition-all flex flex-col relative overflow-hidden"
                            onClick={() => openWorkspace(ws)}
                        >
                            {/* Status Overlay for Processing */}
                            {(ws.status === 'processing' || ws.status === 'queued') && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
                                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-3 max-w-[200px]">
                                        <motion.div
                                            className="h-full bg-primary-500 shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${ws.generationProgress || 0}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] font-bold text-white uppercase tracking-[0.2em] animate-pulse">
                                        {ws.status === 'processing' ? `Building Roadmap ${ws.generationProgress}%` : 'Waiting in Queue...'}
                                    </p>
                                </div>
                            )}

                            {ws.status === 'failed' && (
                                <div className="absolute inset-0 bg-rose-500/20 backdrop-blur-[4px] z-20 flex flex-col items-center justify-center p-6 text-center">
                                    <X size={24} className="text-rose-400 mb-2" />
                                    <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest leading-relaxed mb-4">
                                        Generation Failed<br />
                                        <span className="text-[8px] opacity-70 normal-case font-medium">{ws.errorLog?.substring(0, 50)}...</span>
                                    </p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            retryWorkspace(ws.id).catch(console.error);
                                        }}
                                        className="bg-rose-500/30 hover:bg-rose-500/50 text-rose-100 text-xs font-bold py-2 px-4 rounded-lg flex items-center transition-all border border-rose-500/50"
                                    >
                                        <RefreshCw size={14} className="mr-2" /> Retry Generation
                                    </button>
                                </div>
                            )}

                            {ws.status === 'stopped' && (
                                <div className="absolute inset-0 bg-amber-500/10 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-6 text-center">
                                    <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center mb-3">
                                        <MapIcon size={20} />
                                    </div>
                                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest leading-relaxed mb-4">
                                        Generation Stopped
                                    </p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            retryWorkspace(ws.id).catch(console.error);
                                        }}
                                        className="bg-amber-500/20 hover:bg-amber-500/40 text-amber-100 text-xs font-bold py-2 px-4 rounded-lg flex items-center transition-all border border-amber-500/30"
                                    >
                                        <RefreshCw size={14} className="mr-2" /> Resume Generation
                                    </button>
                                </div>
                            )}

                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${ws.color} flex items-center justify-center mb-6 text-white shadow-lg`}>
                                <BookOpen size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold mb-2 group-hover:text-primary-400 transition-colors">{ws.title}</h3>
                                <p className="text-gray-500 text-sm line-clamp-2 mb-4">{ws.goal}</p>

                                <div className="flex items-center space-x-3 mb-6">
                                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-bold uppercase tracking-widest text-gray-400 border border-white/5">
                                        {ws.difficulty}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-bold uppercase tracking-widest text-gray-400 border border-white/5">
                                        {ws.category}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
                                    <span>Progress</span>
                                    <span>{ws.progress}%</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary-600 transition-all" style={{ width: `${ws.progress}%` }} />
                                </div>
                            </div>

                            <button className="w-full mt-6 py-3 rounded-xl bg-white/5 group-hover:bg-primary-600 transition-all text-xs font-bold text-gray-400 group-hover:text-white flex items-center justify-center">
                                <Play size={14} className="mr-2" fill="currentColor" /> Resume Learning
                            </button>
                        </motion.div>
                    ))}

                    {workspaces.length === 0 && (
                        <div className="md:col-span-3 py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                            <MapIcon size={48} className="mx-auto text-gray-600 mb-4" />
                            <h3 className="text-xl font-bold mb-2">No Workspaces Created</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mb-8">Start by creating your first personalized learning plan for any topic or subject area.</p>
                            <button onClick={() => setIsModalOpen(true)} className="text-primary-400 font-bold hover:underline">Get Started Now</button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <button
                        onClick={() => {
                            setSelectedWorkspace(null)
                            router.replace('/learning-paths')
                        }}
                        className="flex items-center text-gray-500 hover:text-white transition-colors text-sm font-medium"
                    >
                        <ArrowRight size={16} className="rotate-180 mr-2" /> Back to Workspaces
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className={`p-8 rounded-3xl bg-gradient-to-br ${selectedWorkspace.color} text-white relative overflow-hidden`}>
                                {(selectedWorkspace.status === 'processing' || selectedWorkspace.status === 'queued') && (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px] z-20 flex flex-col items-center justify-center text-center p-8">
                                        <div className="w-64 h-2 bg-white/10 rounded-full mb-4 overflow-hidden">
                                            <motion.div
                                                className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${selectedWorkspace.generationProgress || 0}%` }}
                                            />
                                        </div>
                                        <h3 className="text-xl font-black mb-2 animate-pulse">ROADMAP IN PROGRESS</h3>
                                        <p className="text-white/60 text-sm max-w-xs font-medium">Artificial Intelligence is currently batch-processing your roadmap. Parts of your journey will appear live as they are generated.</p>
                                    </div>
                                )}

                                <div className="relative z-10 flex justify-between items-start">
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2 text-white/70 text-[10px] font-bold uppercase tracking-widest">
                                            <Target size={12} />
                                            <span>Active Journey</span>
                                        </div>
                                        <h2 className="text-4xl font-black">{selectedWorkspace.title}</h2>
                                        <p className="text-white/80 font-medium max-w-lg">{selectedWorkspace.goal}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-4xl font-black">{selectedWorkspace.progress}%</p>
                                        <p className="text-[10px] font-bold uppercase text-white/60">Overall Completion</p>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
                            </div>

                            <div className="glass p-8 relative">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-8 flex items-center">
                                    <Calendar size={16} className="mr-3 text-primary-400" /> Daily Roadmap
                                </h3>
                                <RoadmapCalendar
                                    workspace={selectedWorkspace}
                                    onCompleteStep={(stepId) => completeStep(selectedWorkspace.id, stepId)}
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="glass p-8">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center">
                                    <Lock size={16} className="mr-3 text-primary-400" /> Workspace Actions
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    <button className="w-full py-4 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm flex items-center justify-center transition-all shadow-lg shadow-primary-600/20">
                                        <Star size={18} className="mr-2" /> AI Tutor Chat
                                    </button>
                                    <button
                                        onClick={() => window.location.href = `/practice/mcq?topic=${selectedWorkspace.title}&difficulty=${selectedWorkspace.difficulty}`}
                                        className="w-full py-4 rounded-xl glass hover:bg-white/10 text-white font-bold text-sm flex items-center justify-center transition-all"
                                    >
                                        <MessageSquare size={18} className="mr-2" /> MCQ Practice
                                    </button>
                                    <button
                                        onClick={() => window.location.href = `/practice/dsa?topic=${selectedWorkspace.title}&difficulty=${selectedWorkspace.difficulty}`}
                                        className="w-full py-4 rounded-xl glass hover:bg-white/10 text-white font-bold text-sm flex items-center justify-center transition-all"
                                    >
                                        <Terminal size={18} className="mr-2" /> Practice DSA
                                    </button>
                                    <button
                                        onClick={async () => { await deleteWorkspace(selectedWorkspace.id); setSelectedWorkspace(null) }}
                                        className="w-full py-4 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-400/5 transition-all font-bold text-sm flex items-center justify-center"
                                    >
                                        <Trash2 size={18} className="mr-2" /> Delete Workspace
                                    </button>
                                </div>
                            </div>

                            <div className="glass p-8 h-80 flex flex-col">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center">
                                    <Plus size={16} className="mr-3 text-primary-400" /> Personal Notes
                                </h3>
                                <textarea
                                    className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-gray-300 font-mono leading-relaxed"
                                    placeholder="Jot down key takeaways or questions..."
                                    defaultValue={selectedWorkspace.notes}
                                    onBlur={async (e) => { await updateWorkspace(selectedWorkspace.id, { notes: e.target.value }); }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Workspace Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-secondary p-6 md:p-10 rounded-3xl border border-white/10 w-full max-w-lg relative z-10 glass shadow-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X size={24} /></button>
                            <h2 className="text-2xl font-black mb-1">Create Workspace</h2>
                            <p className="text-gray-400 mb-8 text-sm">Tell AI what you want to learn today.</p>

                            <form onSubmit={handleCreate} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Topic Title</label>
                                    <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-white outline-none focus:border-primary-500 transition-all" placeholder="e.g. Distributed Systems Masterclass" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Your Goal</label>
                                    <textarea required value={goal} onChange={e => setGoal(e.target.value)} className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-primary-500 transition-all resize-none" placeholder="What do you want to achieve?" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Difficulty</label>
                                        <select value={difficulty} onChange={e => setDifficulty(e.target.value as any)} className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-white outline-none focus:border-primary-500 appearance-none bg-[url('https://api.iconify.design/lucide:chevron-down.svg?color=%23555')] bg-[length:20px] bg-[right_1.25rem_center] bg-no-repeat">
                                            {['Beginner', 'Easy', 'Medium', 'Hard', 'Professional', 'Expert'].map(d => <option key={d} value={d} className="bg-black">{d}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Learner Level</label>
                                        <select value={learnerLevel} onChange={e => setLearnerLevel(e.target.value)} className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-white outline-none focus:border-primary-500 appearance-none bg-[url('https://api.iconify.design/lucide:chevron-down.svg?color=%23555')] bg-[length:20px] bg-[right_1.25rem_center] bg-no-repeat">
                                            {['Pre-KG', 'School', 'College', 'Professional', 'PhD'].map(l => <option key={l} value={l} className="bg-black">{l}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Target Days</label>
                                        <input type="number" min="1" max="90" value={targetDays} onChange={e => setTargetDays(parseInt(e.target.value))} className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-white outline-none focus:border-primary-500 transition-all font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Category</label>
                                        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-white outline-none focus:border-primary-500 appearance-none bg-[url('https://api.iconify.design/lucide:chevron-down.svg?color=%23555')] bg-[length:20px] bg-[right_1.25rem_center] bg-no-repeat">
                                            {['Frontend', 'Backend', 'Data Science', 'UPSC/General', 'Management', 'Other'].map(c => <option key={c} value={c} className="bg-black">{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <button disabled={isCreating} className="w-full h-16 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white font-black text-lg transition-all shadow-xl shadow-primary-600/30 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isCreating ? 'Enqueuing...' : 'Generate Workspace'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default function WorkspacesPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading Workspaces...</div>}>
            <WorkspacesContent />
        </Suspense>
    )
}
