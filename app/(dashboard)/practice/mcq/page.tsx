'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, ChevronRight, CheckCircle, XCircle, RefreshCw, ArrowLeft, Send, Target, Award, ListFilter, History, Search, BookOpen, BrainCircuit, ChevronDown } from 'lucide-react'
import practiceService from '../../../services/practiceService'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'
import { useModelDownloader } from '../../../../hooks/useModelDownloader'

interface MCQ {
    id: string
    question_text: string
    options: string[]
    correct_option: string
    topic: string
    difficulty: string
    explanation?: string
}

interface Attempt {
    id: string
    question_text: string
    selected_option: string
    is_correct: boolean
    explanation: string
    topic: string
    created_at: string
}

function MCQContent() {
    const searchParams = useSearchParams()
    const [step, setStep] = useState<'config' | 'active' | 'results' | 'history'>('config')
    const [config, setConfig] = useState({
        topic: 'General',
        difficulty: 'Medium',
        count: 5
    })
    const { downloadModel } = useModelDownloader()
    const [questions, setQuestions] = useState<MCQ[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [selectedOption, setSelectedOption] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [feedback, setFeedback] = useState<{ isCorrect: boolean, explanation: string, correctOption: string } | null>(null)
    const [history, setHistory] = useState<Attempt[]>([])
    const [sessionHistory, setSessionHistory] = useState<{ question: string, is_correct: boolean, selected_option?: string }[]>([])
    const [sessionResults, setSessionResults] = useState<{ score: number, total: number }>({ score: 0, total: 0 })

    // Load history
    const loadHistory = useCallback(async () => {
        try {
            const data = await practiceService.getMcqHistory()
            setHistory(data)
        } catch (e) {
            console.error('Failed to load history', e)
        }
    }, [])

    useEffect(() => {
        loadHistory()
        // Load persisted config
        const saved = localStorage.getItem('mcq_practice_config');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setConfig(prev => ({ ...prev, ...parsed }));
            } catch (e) {
                console.error('Failed to parse saved MCQ config', e);
            }
        }
    }, [loadHistory])

    // Sync with URL parameters
    useEffect(() => {
        const urlTopic = searchParams.get('category') || searchParams.get('topic');
        const urlDiff = searchParams.get('difficulty');
        if (urlTopic || urlDiff) {
            setConfig(prev => ({
                ...prev,
                topic: urlTopic || prev.topic,
                difficulty: urlDiff || prev.difficulty
            }))
        }
    }, [searchParams])

    const handleStart = async () => {
        setIsLoading(true)
        localStorage.setItem('mcq_practice_config', JSON.stringify(config))
        setSessionHistory([])
        setQuestions([])
        setCurrentIndex(0)
        setSessionResults({ score: 0, total: config.count })

        try {
            const question = await practiceService.getAdaptiveChallenge({
                category: config.topic,
                difficulty: config.difficulty,
                session_history: []
            })

            setQuestions([question])
            // Initialize session history with the first question's intent (not yet answered)
            setSessionHistory([])
            setStep('active')
        } catch (error: any) {
            console.error('Failed to fetch MCQs:', error)
            const errorMsg = error.response?.data?.error || error.message;

            if (errorMsg?.includes('OLLAMA_MODEL_NOT_FOUND')) {
                const modelName = errorMsg.split(':')[1] || 'model';
                toast((t) => (
                    <div className="flex flex-col gap-3">
                        <p className="font-bold text-sm text-primary-400">Model "{modelName}" not found.</p>
                        <p className="text-xs text-gray-500">Ollama needs to install this model to continue. (2-4GB average)</p>
                        <div className="flex gap-2">
                            <button
                                onClick={async () => {
                                    toast.dismiss(t.id);
                                    try {
                                        await downloadModel(modelName);
                                        toast.success('Ready! Retrying session...');
                                        handleStart();
                                    } catch (e) {
                                        console.error('Download failed', e);
                                    }
                                }}
                                className="px-3 py-1 bg-primary-600 text-white rounded-lg text-xs font-black transition-colors hover:bg-primary-500"
                            >
                                Install Now
                            </button>
                            <button
                                onClick={() => toast.dismiss(t.id)}
                                className="px-3 py-1 bg-white/10 text-gray-400 rounded-lg text-xs font-bold hover:bg-white/20"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ), { duration: 15000 });
            } else {
                toast.error('Failed to fetch MCQs. Check your connection.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmitAnswer = async () => {
        if (!selectedOption) return

        setIsLoading(true)
        const currentQ = questions[currentIndex]
        try {
            const result = await practiceService.submitSolution(currentQ.id, selectedOption)

            // Add to session history for adaptivity
            setSessionHistory(prev => [
                ...prev,
                {
                    question: currentQ.question_text,
                    is_correct: result.isCorrect,
                    selected_option: selectedOption
                }
            ])

            setFeedback({
                isCorrect: result.isCorrect,
                explanation: result.explanation,
                correctOption: result.correctOption
            })
            if (result.isCorrect) {
                setSessionResults(prev => ({ ...prev, score: prev.score + 1 }))
            }
            // Refresh history in background
            loadHistory()
        } catch (e) {
            console.error('Failed to submit answer', e)
        } finally {
            setIsLoading(false)
        }
    }

    const nextQuestion = async () => {
        setFeedback(null)
        setSelectedOption(null)

        if (currentIndex < config.count - 1) {
            setIsLoading(true)
            try {
                const nextQ = await practiceService.getAdaptiveChallenge({
                    category: config.topic,
                    difficulty: config.difficulty,
                    session_history: sessionHistory
                })
                setQuestions(prev => [...prev, nextQ])
                setCurrentIndex(currentIndex + 1)
            } catch (error) {
                console.error('Failed to fetch adaptive question:', error)
                toast.error('Failed to load next question.')
            } finally {
                setIsLoading(false)
            }
        } else {
            setStep('results')
        }
    }

    const formatTime = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

    const learnerLevels = ['Pre-KG', 'School', 'College', 'Professional', 'PhD'];

    return (
        <AnimatePresence mode="wait">
            {step === 'config' && (
                <motion.div
                    key="config"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-8"
                >
                    <div className="glass p-10 rounded-3xl space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Topic Area</label>
                                <div className="relative">
                                    <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input
                                        value={config.topic}
                                        onChange={e => setConfig({ ...config, topic: e.target.value })}
                                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 outline-none focus:border-primary-500 transition-all font-medium"
                                        placeholder="e.g. React Hooks, Node.js Streams"
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Difficulty</label>
                                <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/5">
                                    {['Easy', 'Medium', 'Hard'].map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setConfig({ ...config, difficulty: d })}
                                            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${config.difficulty === d ? 'bg-primary-600 text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Question Count</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={config.count === 0 ? '' : config.count}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setConfig({ ...config, count: val === '' ? 0 : parseInt(val) })
                                        }}
                                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 outline-none focus:border-primary-500 transition-all font-medium text-white"
                                        placeholder="Enter number of questions"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleStart}
                            disabled={isLoading || !config.topic}
                            className="w-full h-16 bg-primary-600 hover:bg-primary-500 transition-all rounded-2xl font-bold text-lg shadow-xl shadow-primary-600/30 flex items-center justify-center disabled:opacity-50"
                        >
                            {isLoading ? <RefreshCw className="animate-spin mr-2" /> : <ChevronRight size={24} className="mr-2" />}
                            Start Practice Session
                        </button>
                    </div>

                    {/* History Section Grouped by Topic */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <History size={20} className="text-gray-500" /> Recent Activities
                            </h2>
                            <button onClick={() => setStep('history')} className="text-xs font-bold text-primary-400 hover:underline">View All</button>
                        </div>

                        <div className="space-y-8">
                            {Object.entries(
                                history.reduce((acc, curr) => {
                                    if (!acc[curr.topic]) acc[curr.topic] = [];
                                    acc[curr.topic].push(curr);
                                    return acc;
                                }, {} as Record<string, Attempt[]>)
                            ).slice(0, 3).map(([topic, attempts]) => (
                                <div key={topic} className="space-y-4">
                                    <div className="flex items-center justify-between px-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-primary-600/10 flex items-center justify-center">
                                                <BookOpen size={16} className="text-primary-500" />
                                            </div>
                                            <h3 className="font-bold text-sm tracking-wide text-gray-200">{topic}</h3>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setConfig({ ...config, topic: topic });
                                                handleStart();
                                            }}
                                            className="text-[10px] font-black uppercase tracking-widest text-primary-400 hover:text-primary-300 transition-all flex items-center gap-1 group"
                                        >
                                            Get More Related Questions
                                            <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {attempts.slice(0, 2).map(attempt => (
                                            <div key={attempt.id} className="glass p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-all flex items-center gap-4">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${attempt.is_correct ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                                    {attempt.is_correct ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-medium text-gray-400 truncate">{attempt.question_text}</p>
                                                    <span className="text-[9px] text-gray-600">{formatTime(attempt.created_at)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {history.length === 0 && (
                                <div className="py-10 text-center text-gray-600 text-sm glass rounded-3xl">
                                    No past attempts yet. Start practicing to see your history.
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

            {step === 'active' && questions.length > 0 && (
                <motion.div
                    key="active"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                >
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => {
                                    toast((t) => (
                                        <div className="flex flex-col gap-3">
                                            <p className="font-bold text-sm">Exit session? Progress will be lost.</p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        toast.dismiss(t.id);
                                                        setStep('config');
                                                    }}
                                                    className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold"
                                                >
                                                    Yes, Exit
                                                </button>
                                                <button
                                                    onClick={() => toast.dismiss(t.id)}
                                                    className="px-3 py-1 bg-white/10 text-gray-400 rounded-lg text-xs font-bold"
                                                >
                                                    Resume
                                                </button>
                                            </div>
                                        </div>
                                    ), { duration: 4000, position: 'top-center' });
                                }}
                                className="p-2 hover:bg-white/5 rounded-full transition-colors"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Question {currentIndex + 1} of {config.count}</span>
                        </div>
                        <div className="h-1.5 w-32 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-500 transition-all duration-500" style={{ width: `${((currentIndex + 1) / config.count) * 100}%` }} />
                        </div>
                    </div>

                    <div className="glass p-8 rounded-3xl space-y-8">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-primary-600/10 text-primary-400 text-[10px] font-black uppercase tracking-widest rounded-full">{questions[currentIndex].topic}</span>
                                <span className={`px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded border ${questions[currentIndex].difficulty === 'Hard' ? 'border-red-500/30 text-red-400 bg-red-500/5' : questions[currentIndex].difficulty === 'Medium' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/5' : 'border-green-500/30 text-green-400 bg-green-500/5'}`}>
                                    {questions[currentIndex].difficulty}
                                </span>
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold leading-relaxed">{questions[currentIndex].question_text}</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {questions[currentIndex].options?.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => !feedback && setSelectedOption(option)}
                                    className={`w-full p-6 rounded-2xl border text-left transition-all flex items-center justify-between group ${selectedOption === option
                                        ? 'bg-primary-600/20 border-primary-500 text-white'
                                        : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/20'
                                        } ${feedback && option === feedback.correctOption ? 'border-green-500/50 bg-green-500/10 text-green-400' : ''}
                                          ${feedback && selectedOption === option && !feedback.isCorrect && option !== feedback.correctOption ? 'border-red-500/50 bg-red-500/10 text-red-400' : ''}`}
                                >
                                    <span className="flex-1 font-medium">{option}</span>
                                    {!feedback && (
                                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${selectedOption === option ? 'border-primary-400 bg-primary-500' : 'border-white/10 group-hover:border-white/30'}`}>
                                            {selectedOption === option && <CheckCircle size={14} className="text-white" />}
                                        </div>
                                    )}
                                    {feedback && option === feedback.correctOption && <CheckCircle size={20} className="text-green-500 ml-4 shrink-0" />}
                                    {feedback && selectedOption === option && !feedback.isCorrect && option !== feedback.correctOption && <XCircle size={20} className="text-red-500 ml-4 shrink-0" />}
                                </button>
                            ))}
                        </div>

                        <AnimatePresence>
                            {feedback && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4"
                                >
                                    <div className={`p-6 rounded-2xl border ${feedback.isCorrect ? 'bg-green-500/5 border-green-500/20 text-green-400' : 'bg-red-500/5 border-red-500/20 text-red-400'}`}>
                                        <div className="flex items-center gap-3 mb-3">
                                            {feedback.isCorrect ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                            <h3 className="font-bold">{feedback.isCorrect ? 'Brilliant! That\'s correct.' : 'Not quite right.'}</h3>
                                        </div>
                                        <div className="prose prose-invert prose-sm max-w-none prose-p:text-gray-300 prose-strong:text-white">
                                            <ReactMarkdown>{feedback.explanation}</ReactMarkdown>
                                        </div>
                                    </div>
                                    <button
                                        onClick={nextQuestion}
                                        disabled={isLoading}
                                        className="w-full h-14 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-bold flex items-center justify-center transition-all shadow-lg shadow-primary-600/20 disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <RefreshCw className="animate-spin mr-2" />
                                        ) : (
                                            <>
                                                {currentIndex === config.count - 1 ? 'See Results' : 'Next Question'} <ChevronRight size={20} className="ml-2" />
                                            </>
                                        )}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {!feedback && (
                            <div className="space-y-4">
                                <button
                                    onClick={handleSubmitAnswer}
                                    disabled={!selectedOption || isLoading}
                                    className="w-full h-16 bg-primary-600 hover:bg-primary-500 rounded-2xl font-bold flex items-center justify-center transition-all disabled:opacity-30 shadow-lg shadow-primary-600/20"
                                >
                                    {isLoading ? <RefreshCw className="animate-spin mr-2" /> : <Send size={20} className="mr-2" />}
                                    Submit Answer
                                </button>

                                <button
                                    onClick={async () => {
                                        if (isLoading) return;
                                        const currentQ = questions[currentIndex];
                                        // Add as INCCORRECT 'Don't Know' to history
                                        setSessionHistory(prev => [
                                            ...prev,
                                            {
                                                question: currentQ.question_text,
                                                is_correct: false,
                                                selected_option: "I don't know"
                                            }
                                        ]);
                                        // Show feedback with correct answer immediately
                                        setFeedback({
                                            isCorrect: false,
                                            explanation: "No worries! It's okay not to know. Here's the correct answer and explanation to help you learn.",
                                            correctOption: currentQ.correct_option
                                        });
                                    }}
                                    className="w-full h-12 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-gray-500 transition-all"
                                >
                                    I don't know the answer
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {step === 'results' && (
                <motion.div
                    key="results"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass p-12 rounded-3xl text-center space-y-8"
                >
                    <div className="w-24 h-24 bg-primary-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Award size={48} className="text-primary-400" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black mb-2">Practice Complete!</h2>
                        <p className="text-gray-400">You scored {sessionResults.score} out of {sessionResults.total}</p>
                    </div>

                    <div className="text-6xl font-black text-primary-400 leading-tight">
                        {Math.round((sessionResults.score / sessionResults.total) * 100)}%
                    </div>

                    <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                        <button
                            onClick={handleStart}
                            className="h-14 bg-green-600 hover:bg-green-500 rounded-2xl font-bold transition-all text-sm flex items-center justify-center text-white"
                        >
                            Fetch More Questions
                        </button>
                        <Link
                            href="/dashboard"
                            className="h-14 bg-white/5 hover:bg-white/10 rounded-2xl font-bold transition-all text-sm flex items-center justify-center text-gray-300 border border-white/10"
                        >
                            Back to Home
                        </Link>
                    </div>
                </motion.div>
            )}

            {step === 'history' && (
                <motion.div
                    key="history"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-4">
                        <button onClick={() => setStep('config')} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-2xl font-black">Practice History</h1>
                    </div>

                    <div className="space-y-4">
                        {history.map(attempt => (
                            <div key={attempt.id} className="glass p-6 rounded-2xl border border-white/5 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 bg-primary-600/10 text-primary-400 text-[8px] font-black uppercase tracking-widest rounded">{attempt.topic}</span>
                                            <span className="text-[10px] text-gray-500 font-medium">{formatTime(attempt.created_at)}</span>
                                        </div>
                                        <h3 className="font-bold text-gray-200">{attempt.question_text}</h3>
                                    </div>
                                    <div className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${attempt.is_correct ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                        {attempt.is_correct ? 'Correct' : 'Incorrect'}
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1 p-4 bg-white/5 rounded-xl border border-white/5">
                                        <div className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wide">Your Choice</div>
                                        <div className={`text-sm font-medium ${attempt.is_correct ? 'text-green-400' : 'text-red-400'}`}>{attempt.selected_option}</div>
                                    </div>
                                    {!attempt.is_correct && (
                                        <div className="flex-1 p-4 bg-green-500/5 rounded-xl border border-green-500/10">
                                            <div className="text-[10px] font-bold text-green-500/50 mb-2 uppercase tracking-wide">Explanation</div>
                                            <div className="text-sm text-gray-400 leading-relaxed line-clamp-2">{attempt.explanation}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default function MCQPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">MCQ Practice</h1>
                    <p className="text-gray-500 text-sm font-medium">Master concepts with AI-powered personalized questions.</p>
                </div>
            </header>

            <Suspense fallback={
                <div className="glass p-20 rounded-3xl flex flex-col items-center justify-center space-y-4">
                    <RefreshCw className="animate-spin text-primary-500" size={32} />
                    <p className="text-gray-500 font-bold animate-pulse">Initializing Practice Engine...</p>
                </div>
            }>
                <MCQContent />
            </Suspense>
        </div>
    )
}
