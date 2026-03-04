'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, ArrowRight, HelpCircle, Code, Bug, Target, Play, ChevronLeft, Image as ImageIcon, Video, Sparkles, Send, Terminal as TerminalIcon, Info } from 'lucide-react'
import { Difficulty } from '../../context/WorkspaceContext'
import aiService from '../../services/aiService'

type ModuleType = 'mcq' | 'dsa' | 'coding'

interface Question {
    id: string
    type: ModuleType
    question: string
    media?: { type: 'image' | 'video', url: string }
    options?: string[]
    correctAnswer?: string
    initialCode?: string
    solution?: string
    videoHint?: string
}

const practiceModules = [
    { id: 'mcq' as ModuleType, label: 'Conceptual MCQs', icon: HelpCircle, description: 'Test your backend theory knowledge.' },
    { id: 'dsa' as ModuleType, label: 'Practice DSA', icon: TerminalIcon, description: 'LeetCode-style algorithmic challenges.' },
]

const mockQuestions: Question[] = [
    {
        id: 'q1',
        type: 'mcq',
        question: 'Identify the issue in this architecture diagram regarding scalability.',
        media: { type: 'image', url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc48?auto=format&fit=crop&w=800&q=80' },
        options: ['Single Point of Failure', 'Lack of Cache', 'Tight Coupling', 'Inefficient DB Index'],
        correctAnswer: 'Single Point of Failure',
        videoHint: 'Consider what happens if the load balancer goes down.'
    },
    {
        id: 'q2',
        type: 'coding',
        question: 'Implement a function to reverse a linked list in-place.',
        initialCode: '/**\n * @param {ListNode} head\n * @return {ListNode}\n */\nfunction reverseList(head) {\n    // Write your code here\n}',
        solution: 'let prev = null; let current = head; while(current) { ... }'
    },
    {
        id: 'q3',
        type: 'dsa',
        question: 'This Express middleware is leaking memory. Find and fix it.',
        initialCode: 'app.use((req, res, next) => {\n  const data = []; // Memory leak here?\n  global.store = data;\n  next();\n})'
    }
]

const difficulties: Difficulty[] = ['Beginner', 'Easy', 'Medium', 'Hard', 'Professional']

export default function PracticePage() {
    const startSession = (moduleId: ModuleType) => {
        if (moduleId === 'mcq') {
            window.location.href = `/practice/mcq`
        } else if (moduleId === 'dsa') {
            window.location.href = `/practice/dsa`
        }
    }

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2 font-heading">Practice Mode</h1>
                    <p className="text-gray-400 text-sm">Targeted technical drills with AI guidance.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {practiceModules.map((module) => (
                    <button
                        key={module.id}
                        onClick={() => startSession(module.id)}
                        className="glass p-8 text-left hover:border-primary-500/50 transition-all group relative overflow-hidden flex flex-col items-start"
                    >
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-600/20 transition-colors">
                            <module.icon className="text-gray-400 group-hover:text-primary-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2 group-hover:text-white font-heading">{module.label}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed mb-6 font-medium">{module.description}</p>
                        <div className="mt-auto flex items-center text-primary-500 font-bold text-xs uppercase tracking-widest">
                            Configure Practice <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary-600/5 rounded-full blur-2xl group-hover:bg-primary-600/10 transition-colors" />
                    </button>
                ))}
            </div>
        </div>
    )
}


