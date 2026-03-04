'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, Code, FileText, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import practiceService from '../../../../services/practiceService'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'

interface DSAAttempt {
    id: string
    question_text: string
    topic: string
    difficulty: string
    language: string
    code: string
    is_correct: boolean
    feedback: string
    created_at: string
}

export default function DSAHistoryPage() {
    const [history, setHistory] = useState<DSAAttempt[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedAttempt, setSelectedAttempt] = useState<DSAAttempt | null>(null)

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await practiceService.getDsaHistory()
                setHistory(data)
                if (data.length > 0) setSelectedAttempt(data[0])
            } catch (error) {
                toast.error('Failed to load DSA history')
            } finally {
                setIsLoading(false)
            }
        }
        fetchHistory()
    }, [])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 h-[calc(100vh-100px)] flex flex-col">
            <header className="flex items-center space-x-4 shrink-0">
                <Link href="/practice/dsa" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold flex items-center">
                        <Clock className="mr-2 text-primary-500" size={24} /> DSA Practice History
                    </h1>
                    <p className="text-gray-400 text-sm">Review your previous algorithmic problem submissions.</p>
                </div>
            </header>

            {history.length === 0 ? (
                <div className="glass p-12 rounded-3xl text-center space-y-4 m-auto">
                    <Code size={48} className="mx-auto text-gray-500" />
                    <h2 className="text-xl font-bold">No History Found</h2>
                    <p className="text-gray-400">You haven't submitted any DSA coding problems yet.</p>
                </div>
            ) : (
                <div className="flex gap-6 flex-1 min-h-0">
                    {/* Left Sidebar: List of Attempts */}
                    <div className="w-1/3 glass rounded-3xl overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-white/5 bg-white/5 font-bold text-sm text-gray-400 uppercase tracking-widest">
                            Submissions ({history.length})
                        </div>
                        <div className="overflow-y-auto flex-1 p-2 space-y-2">
                            {history.map((attempt) => (
                                <button
                                    key={attempt.id}
                                    onClick={() => setSelectedAttempt(attempt)}
                                    className={`w-full text-left p-4 rounded-2xl transition-all border ${selectedAttempt?.id === attempt.id ? 'bg-primary-500/10 border-primary-500/30' : 'bg-transparent border-transparent hover:bg-white/5'}`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {attempt.is_correct ? (
                                                <CheckCircle size={16} className="text-green-500 shrink-0" />
                                            ) : (
                                                <XCircle size={16} className="text-red-500 shrink-0" />
                                            )}
                                            <span className="font-bold text-sm truncate">{attempt.topic}</span>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${attempt.difficulty.toLowerCase() === 'easy' ? 'bg-green-500/20 text-green-400' :
                                            attempt.difficulty.toLowerCase() === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-red-500/20 text-red-400'
                                            }`}>
                                            {attempt.difficulty}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>{attempt.language}</span>
                                        <span>{new Date(attempt.created_at).toLocaleDateString()}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Pane: Attempt Details */}
                    {selectedAttempt && (
                        <div className="w-2/3 glass rounded-3xl flex flex-col min-h-0">
                            <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
                                <div>
                                    <h2 className="text-xl font-bold">{selectedAttempt.topic} Problem</h2>
                                    <p className="text-sm text-gray-400">Language: <span className="text-white font-mono">{selectedAttempt.language}</span></p>
                                </div>
                                <div className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center ${selectedAttempt.is_correct ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {selectedAttempt.is_correct ? 'Successful Validation' : 'Failed Edge Cases'}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2 text-primary-400 font-bold uppercase text-[10px]">
                                        <FileText size={14} />
                                        <span>Problem Statement</span>
                                    </div>
                                    <div className="prose prose-invert prose-sm text-gray-300 max-w-none">
                                        <ReactMarkdown>{selectedAttempt.question_text}</ReactMarkdown>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2 text-blue-400 font-bold uppercase text-[10px]">
                                        <Code size={14} />
                                        <span>Your Code</span>
                                    </div>
                                    <div className="bg-black/50 p-4 rounded-xl border border-white/5 font-mono text-sm overflow-x-auto">
                                        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                                            {`\`\`\`${selectedAttempt.language.toLowerCase()}\n${selectedAttempt.code}\n\`\`\``}
                                        </ReactMarkdown>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2 text-yellow-400 font-bold uppercase text-[10px]">
                                        <CheckCircle size={14} />
                                        <span>AI Code Review & Feedback</span>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-gray-300 text-sm leading-relaxed">
                                        {selectedAttempt.feedback}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
