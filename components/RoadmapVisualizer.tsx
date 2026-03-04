'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Lock, Star, Clock, Target, Calendar } from 'lucide-react'

interface Step {
    title: string;
    content: string;
    estimatedDays: number;
}

interface Roadmap {
    id: number;
    title: string;
    description: string;
    category: string;
    level: string;
    steps: string | Step[];
}

export default function RoadmapVisualizer({ roadmap, onCompleteStep }: { roadmap: Roadmap, onCompleteStep?: (stepIndex: number) => void }) {
    const steps: Step[] = typeof roadmap.steps === 'string' ? JSON.parse(roadmap.steps) : roadmap.steps;

    return (
        <div className="glass p-8 relative overflow-hidden group">
            <div className="relative z-10">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span className="px-3 py-1 bg-primary-600/20 text-primary-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-primary-500/20">
                        {roadmap.category}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center">
                        <Star size={12} className="mr-1 text-yellow-500 fill-yellow-500" />
                        {roadmap.level}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center">
                        <Clock size={12} className="mr-1" />
                        {steps.reduce((acc, s) => acc + s.estimatedDays, 0)} Days
                    </span>
                </div>

                <h2 className="text-3xl font-bold mb-4">{roadmap.title}</h2>
                <p className="text-gray-400 mb-8 max-w-2xl">{roadmap.description}</p>

                {/* Vertical Timeline */}
                <div className="space-y-8 relative">
                    <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-white/10" />

                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start space-x-6 relative z-10 group/step"
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 transition-all ${i === 0 ? 'bg-primary-600 border-primary-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-black border-white/10 text-gray-500'
                                }`}>
                                {i === 0 ? <Target size={18} /> : <Lock size={16} />}
                            </div>

                            <div className="flex-1 glass p-6 border-white/5 group-hover/step:border-white/20 transition-all">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-lg">{step.title}</h3>
                                    <span className="text-[10px] font-bold text-gray-400 flex items-center bg-white/5 px-2 py-1 rounded">
                                        <Calendar size={10} className="mr-1" /> {step.estimatedDays}d
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400 leading-relaxed">{step.content}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}
