'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Bug, Play, CheckCircle, RefreshCw, ArrowLeft, Send, Award, Code, Info, History } from 'lucide-react'
import practiceService from '../../../services/practiceService'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import toast from 'react-hot-toast'
import { useModelDownloader } from '../../../../hooks/useModelDownloader'
import ReactMarkdown from 'react-markdown'
import Editor from '@monaco-editor/react'

interface Challenge {
    id: string
    question_text: string // Description of the problem
    code_snippet: string // Initial boilerplate code
    topic: string
    difficulty: string
}

function DSAPracticeContent() {
    const searchParams = useSearchParams()
    const [step, setStep] = useState<'config' | 'active' | 'results'>('config')
    const [config, setConfig] = useState({
        topic: searchParams.get('topic') || 'General',
        difficulty: searchParams.get('difficulty') || 'Medium',
        language: 'TypeScript',
        count: 3
    })
    const { downloadModel } = useModelDownloader()
    const [challenges, setChallenges] = useState<Challenge[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [userCode, setUserCode] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isEvaluating, setIsEvaluating] = useState(false)
    const [feedback, setFeedback] = useState<{ success: boolean, message: string, feedback: string } | null>(null)
    const [isRunning, setIsRunning] = useState(false)
    const [consoleOutput, setConsoleOutput] = useState<{ stdout: string, stderr: string } | null>(null)

    const pistonLanguageMap: Record<string, string> = {
        'TypeScript': 'typescript',
        'JavaScript': 'javascript',
        'Python': 'python',
        'Go': 'go',
        'Java': 'java',
        'C++': 'c++'
    }

    const runCode = async () => {
        setIsRunning(true)
        setConsoleOutput(null)
        try {
            const data = await practiceService.runCode(userCode, config.language);

            if (data.run) {
                setConsoleOutput({
                    stdout: data.run.stdout,
                    stderr: data.run.stderr || data.compile?.stderr || ''
                })
            } else {
                setConsoleOutput({ stdout: '', stderr: data.message || 'Execution error' })
            }
        } catch (err) {
            setConsoleOutput({ stdout: '', stderr: 'Failed to connect to execution engine.' })
        } finally {
            setIsRunning(false)
        }
    }
    const handleStart = async () => {
        setIsLoading(true)
        try {
            const data = await practiceService.getChallenges({
                category: config.topic,
                type: 'CODING',
                difficulty: config.difficulty,
                count: config.count,
                // @ts-ignore
                language: config.language
            })
            // Shuffle and limit
            const filtered = (data as Challenge[]).sort(() => 0.5 - Math.random()).slice(0, config.count)

            if (filtered.length === 0) {
                toast.error('No coding challenges found for this topic. Try another Focus Area.')
                return
            }

            setChallenges(filtered)
            setCurrentIndex(0)
            if (filtered.length > 0) {
                setUserCode(filtered[0].code_snippet || '')
            }
            setStep('active')
        } catch (error: any) {
            console.error('Failed to fetch challenges:', error)
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
                                        toast.success('Ready! Retrying challenges...');
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
                toast.error('Failed to load coding challenges. Check your connection.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    // Removed manual HandleKeyDown to rely on Monaco's built-in bracket completion.

    const handleSubmit = async () => {
        setIsEvaluating(true)
        try {
            // @ts-ignore
            const result = await practiceService.submitSolution(challenges[currentIndex].id, userCode, config.language)
            setFeedback(result)
        } catch (error) {
            console.error('Failed to submit solution:', error)
            toast.error('Evaluation failed. Check your connection.')
        } finally {
            setIsEvaluating(false)
        }
    }

    const nextChallenge = () => {
        setFeedback(null)
        if (currentIndex < challenges.length - 1) {
            const nextIdx = currentIndex + 1
            setCurrentIndex(nextIdx)
            setUserCode(challenges[nextIdx].code_snippet || '')
        } else {
            setStep('results')
        }
    }

    return (
        <AnimatePresence mode="wait">
            {step === 'config' && (
                <motion.div
                    key="config"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="glass p-10 rounded-3xl space-y-8"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Focus Area</label>
                            <input
                                value={config.topic}
                                onChange={e => setConfig({ ...config, topic: e.target.value })}
                                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 outline-none focus:border-primary-500 transition-all font-medium text-white"
                                placeholder="e.g. Async/Await, Databases, API Safety"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Programming Language</label>
                            <select
                                value={config.language}
                                onChange={e => setConfig({ ...config, language: e.target.value })}
                                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 outline-none focus:border-primary-500 appearance-none bg-no-repeat bg-[right_1.25rem_center] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik02IDlsNiA2IDYtNiIvPjwvc3ZnPg==')]"
                            >
                                {['TypeScript', 'JavaScript', 'Python', 'Go', 'Java', 'C++'].map(lang => (
                                    <option key={lang} value={lang} className="bg-black text-white">{lang}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Competency Level</label>
                            <select
                                value={config.difficulty}
                                onChange={e => setConfig({ ...config, difficulty: e.target.value })}
                                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 outline-none focus:border-primary-500 appearance-none bg-no-repeat bg-[right_1.25rem_center] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik02IDlsNiA2IDYtNiIvPjwvc3ZnPg==')]"
                            >
                                {['Beginner', 'Easy', 'Medium', 'Hard', 'Professional', 'Expert'].map(d => (
                                    <option key={d} value={d} className="bg-black text-white">{d}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={handleStart}
                        disabled={isLoading}
                        className="w-full h-16 bg-primary-600 hover:bg-primary-500 transition-all rounded-2xl font-bold text-lg shadow-xl shadow-primary-600/30 flex items-center justify-center disabled:opacity-50"
                    >
                        {isLoading ? <RefreshCw className="animate-spin mr-2" /> : <Play size={24} className="mr-2" />}
                        Start Practice
                    </button>
                </motion.div>
            )}

            {step === 'active' && challenges.length > 0 && (
                <motion.div
                    key="active"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-250px)]"
                >
                    <div className="space-y-6 flex flex-col h-full overflow-hidden">
                        <div id="problem-statement" className="glass p-6 rounded-3xl flex-1 overflow-y-auto">
                            <div className="flex items-center space-x-2 text-primary-400 font-bold uppercase text-[10px] mb-4">
                                <Code size={14} />
                                <span>Problem Statement</span>
                            </div>
                            <h2 className="text-xl font-bold mb-4">The Challenge</h2>
                            <div className="prose prose-invert prose-sm text-gray-300 leading-relaxed max-w-none">
                                <ReactMarkdown>{challenges[currentIndex].question_text}</ReactMarkdown>
                            </div>

                            {feedback && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`mt-8 p-6 rounded-2xl border ${feedback.success ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}
                                >
                                    <div className="flex items-center font-bold mb-2">
                                        {feedback.success ? <CheckCircle size={18} className="mr-2" /> : <Terminal size={18} className="mr-2" />}
                                        {feedback.success ? 'Accepted!' : 'Wrong Answer or Error'}
                                    </div>
                                    <p className="text-sm opacity-90">{feedback.feedback}</p>
                                    <button
                                        onClick={nextChallenge}
                                        className="mt-4 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-xs font-bold transition-all"
                                    >
                                        {currentIndex === challenges.length - 1 ? 'Finish Practice' : 'Next Problem'}
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col space-y-4 h-full">
                        <div className="flex-1 relative bg-black/40 rounded-3xl border border-white/5 overflow-hidden flex flex-col group">
                            <div className="absolute inset-x-0 top-0 px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between z-10 pointer-events-none">
                                <div className="flex items-center space-x-2">
                                    <Terminal size={14} className="text-gray-500" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Code Editor — solution.{config.language === 'Python' ? 'py' : 'ts'}</span>
                                </div>
                            </div>

                            <div className="flex-1 relative overflow-hidden">
                                <Editor
                                    height="100%"
                                    theme="vs-dark"
                                    language={config.language.toLowerCase() === 'c++' ? 'cpp' : config.language.toLowerCase()}
                                    value={userCode}
                                    onChange={(val) => setUserCode(val || '')}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        fontFamily: 'monospace',
                                        lineHeight: 24,
                                        padding: { top: 60, bottom: 20 },
                                        scrollBeyondLastLine: false,
                                        smoothScrolling: true,
                                        cursorBlinking: 'smooth',
                                        contextmenu: false,
                                        automaticLayout: true
                                    }}
                                />
                            </div>

                            {/* Execution Console */}
                            <div className="h-48 bg-[#1e1e1e] border-t border-white/10 flex flex-col relative z-20">
                                <div className="px-4 py-2 border-b border-white/5 bg-black/20 flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    <span>Console Output</span>
                                    {isRunning && <RefreshCw size={12} className="animate-spin text-primary-500" />}
                                </div>
                                <div className="flex-1 overflow-auto p-4 font-mono text-sm">
                                    {consoleOutput ? (
                                        <>
                                            {consoleOutput.stdout && <div className="text-gray-300 whitespace-pre-wrap">{consoleOutput.stdout}</div>}
                                            {consoleOutput.stderr && <div className="text-red-400 whitespace-pre-wrap mt-2">{consoleOutput.stderr}</div>}
                                            {!consoleOutput.stdout && !consoleOutput.stderr && <div className="text-gray-600 italic">Program finished running with no output.</div>}
                                        </>
                                    ) : (
                                        <div className="text-gray-600 italic">Run your code to see the output here...</div>
                                    )}
                                </div>
                            </div>

                            <div className="absolute bottom-56 right-6 z-20 flex gap-2">
                                <button
                                    onClick={runCode}
                                    disabled={isRunning}
                                    className="h-10 px-5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl flex items-center transition-all disabled:opacity-50 text-sm border border-white/10"
                                >
                                    {isRunning ? <RefreshCw className="animate-spin mr-2" size={14} /> : <Play size={14} className="mr-2 text-green-400" />}
                                    Run Code
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isEvaluating}
                                    className="h-12 px-6 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-lg shadow-primary-600/30 flex items-center transition-all disabled:opacity-50"
                                >
                                    {isEvaluating ? <RefreshCw className="animate-spin mr-2" /> : <Play size={16} className="mr-2" />}
                                    Run & Verify
                                </button>
                            </div>
                        </div>
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
                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Award size={48} className="text-green-400" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black mb-2">Practice Complete!</h2>
                        <p className="text-gray-400 max-w-sm mx-auto">You've successfully solved all the algorithms in this session.</p>
                    </div>

                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={() => setStep('config')}
                            className="h-14 px-8 bg-white/5 hover:bg-white/10 rounded-2xl font-bold transition-all text-sm"
                        >
                            Practice More
                        </button>
                        <Link
                            href="/learning-paths"
                            className="h-14 px-8 bg-primary-600 hover:bg-primary-500 rounded-2xl font-bold transition-all text-sm flex items-center justify-center text-white shadow-xl shadow-primary-600/20"
                        >
                            Back to Workspaces
                        </Link>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default function DSAPracticePage() {
    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20 h-full">
            <header className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/learning-paths" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center">
                            <Terminal className="mr-2 text-primary-500" size={24} /> Practice DSA
                        </h1>
                        <p className="text-gray-400 text-sm">Solve algorithmic problems in a LeetCode-style environment.</p>
                    </div>
                </div>
                <Link href="/practice/dsa/history" className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-all text-sm flex items-center">
                    <History size={16} className="mr-2 text-primary-400" /> View History
                </Link>
            </header>

            <Suspense fallback={
                <div className="glass p-20 rounded-3xl flex flex-col items-center justify-center space-y-4">
                    <RefreshCw className="animate-spin text-primary-500" size={32} />
                    <p className="text-gray-500 font-bold animate-pulse uppercase tracking-[0.2em] text-xs">Initializing Editor Content...</p>
                </div>
            }>
                <DSAPracticeContent />
            </Suspense>
        </div>
    )
}
