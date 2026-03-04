'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { BookOpen, CheckCircle, MessageSquare, Terminal, ChevronRight, Clock, Calendar } from 'lucide-react'
import Link from 'next/link'
import { Workspace, WorkspaceStep } from '../../app/context/WorkspaceContext'

interface RoadmapCalendarProps {
    workspace: Workspace
    onCompleteStep: (stepId: string) => Promise<void>
}

const RoadmapCalendar: React.FC<RoadmapCalendarProps> = ({ workspace, onCompleteStep }) => {
    // Sort steps by day number
    const sortedSteps = [...workspace.steps].sort((a, b) => (a.dayNumber || 0) - (b.dayNumber || 0))

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedSteps.map((step, idx) => (
                    <motion.div
                        key={step.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`glass p-6 flex flex-col relative group transition-all ${step.completed ? 'opacity-80' : 'hover:border-primary-500/50'}`}
                    >
                        {/* Day Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex flex-col pr-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 mb-1">
                                    {step.dayNumber ? `Day ${step.dayNumber}` : `Milestone ${idx + 1}`}
                                </span>
                                <h4 className={`text-lg font-bold leading-tight ${step.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                                    {step.title}
                                </h4>
                            </div>
                            <button
                                onClick={() => onCompleteStep(step.id)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 ${step.completed ? 'bg-green-500 text-white' : 'bg-white/5 text-gray-600 hover:bg-primary-600/30 hover:text-primary-400'}`}
                            >
                                <CheckCircle size={18} />
                            </button>
                        </div>

                        <p className="text-xs text-gray-400 line-clamp-3 mb-6 flex-1 leading-relaxed">
                            {step.description}
                        </p>

                        {/* Tasks Section */}
                        <div className="space-y-3 mt-auto">
                            {step.tasks && step.tasks.map((task: any, tIdx: number) => (
                                <div key={tIdx} className="group/task relative">
                                    <div className="flex items-center p-3 rounded-xl bg-white/5 border border-white/5 group-hover/task:bg-white/10 transition-all">
                                        <div className="mr-3 shrink-0">
                                            {task.type === 'theory' && <BookOpen size={16} className="text-blue-400" />}
                                            {task.type === 'mcq' && <MessageSquare size={16} className="text-purple-400" />}
                                            {task.type === 'coding' && <Terminal size={16} className="text-emerald-400" />}
                                        </div>
                                        <div className="flex-1 min-w-0 pr-2">
                                            <p className="text-xs font-semibold text-white/90 line-clamp-2 leading-tight">{task.title}</p>
                                        </div>
                                        <Link
                                            href={
                                                task.type === 'theory' ? `/topics/step/${step.id}?workspaceId=${workspace.id}` :
                                                    task.type === 'mcq' ? `/practice/mcq?topic=${encodeURIComponent(task.content)}&difficulty=${workspace.difficulty}` :
                                                        `/practice/dsa?topic=${encodeURIComponent(task.content)}&difficulty=${workspace.difficulty}`
                                            }
                                            className="ml-2 shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                                        >
                                            <ChevronRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

export default RoadmapCalendar
