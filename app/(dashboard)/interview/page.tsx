'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, ChevronRight, Award, AlertTriangle, Info, Play, XCircle, Target, History, Clock, BrainCircuit, ChevronDown, CheckCircle, Lightbulb, ChevronUp, RefreshCw, ArrowLeft, Zap, Code } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import interviewService from '../../services/interviewService'
import workspaceService from '../../services/workspaceService'
import resumeService from '../../services/resumeService'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'
import { useModelDownloader } from '../../../hooks/useModelDownloader'

function InterviewContent() {
    const searchParams = useSearchParams()
    const urlTopic = searchParams.get('topic')
    const [step, setStep] = useState<'idle' | 'config' | 'active' | 'report'>('idle')
    const [sessionResults, setSessionResults] = useState<{ score: number, total: number }>({ score: 0, total: 0 })
    const { downloadModel } = useModelDownloader()
    const [config, setConfig] = useState<any>({
        topic: 'Backend Development',
        difficulty: 'Medium',
        numQuestions: 5,
        role: 'Backend Engineer',
        learner_level: 'Professional',
        realTimeScenarios: false,
        realTimeChallenges: false,
        codingPractice: false,
        jd: ''
    })
    const [sessions, setSessions] = useState<any[]>([])
    const [resumeFile, setResumeFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [currentQuestion, setCurrentQuestion] = useState<any>(null)
    const [answer, setAnswer] = useState('')
    const [results, setResults] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [interviewId, setInterviewId] = useState<string | null>(null)
    const [report, setReport] = useState<any>(null)
    const [expandedAnswers, setExpandedAnswers] = useState<Record<string, boolean>>({})

    const loadSessions = useCallback(async () => {
        try {
            const data = await interviewService.listSessions()
            setSessions(data)
        } catch (e) {
            console.error('Failed to load sessions', e)
        }
    }, [])

    useEffect(() => {
        loadSessions()
        const saved = localStorage.getItem('interview_session_config');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setConfig((prev: any) => ({ ...prev, ...parsed }));
            } catch (e) {
                console.error('Failed to parse saved interview config', e);
            }
        }
    }, [loadSessions])

    useEffect(() => {
        if (urlTopic) {
            setConfig((prev: any) => ({ ...prev, topic: urlTopic }))
            setStep('config')
        }
    }, [urlTopic])

    useEffect(() => {
        localStorage.setItem('interview_session_config', JSON.stringify(config))
    }, [config])

    const handleInitialize = async () => {
        setIsLoading(true)
        try {
            if (resumeFile && uploadStatus !== 'success') {
                setIsUploading(true)
                await resumeService.uploadResume(resumeFile);
                setUploadStatus('success');
            }
            const data = await interviewService.startInterview(config)
            setInterviewId(data.interview.id)
            setCurrentQuestion(data.firstQuestion)
            setCurrentQuestionIndex(0)
            setResults([])
            setAnswer('')
            setStep('active')
        } catch (error: any) {
            console.error('Failed to start interview:', error)
            const errorMsg = error.response?.data?.error || error.message;

            if (errorMsg?.includes('OLLAMA_MODEL_NOT_FOUND')) {
                const modelName = errorMsg.split(':')[1] || 'model';
                toast((t) => (
                    <div className="flex flex-col gap-3">
                        <p className="font-bold text-sm">Model "{modelName}" not found.</p>
                        <p className="text-xs text-gray-500">Would you like to install it now? (approx. 2-4GB)</p>
                        <div className="flex gap-2">
                            <button
                                onClick={async () => {
                                    toast.dismiss(t.id);
                                    try {
                                        await downloadModel(modelName);
                                        toast.success('Installation complete! Retrying...');
                                        handleInitialize();
                                    } catch (e) {
                                        console.error('Manual install failed', e);
                                    }
                                }}
                                className="px-3 py-1 bg-primary-600 text-white rounded-lg text-xs font-bold"
                            >
                                Yes, Install
                            </button>
                            <button
                                onClick={() => toast.dismiss(t.id)}
                                className="px-3 py-1 bg-white/10 text-gray-400 rounded-lg text-xs font-bold"
                            >
                                Not now
                            </button>
                        </div>
                    </div>
                ), { duration: 10000 });
            } else {
                toast.error('Failed to initialize interview engine.')
            }
        } finally {
            setIsLoading(false)
            setIsUploading(false)
        }
    }

    const handleViewReport = async (id: string) => {
        setIsLoading(true)
        try {
            const finalReport = await interviewService.getReport(id)
            setInterviewId(id)
            setReport(finalReport)
            setStep('report')
        } catch (error) {
            console.error('Failed to load report:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleQuit = async () => {
        if (!interviewId) return;

        toast((t) => (
            <div className="flex flex-col gap-3">
                <p className="font-bold text-sm">Quit interview and see report?</p>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            handleViewReport(interviewId);
                        }}
                        className="px-3 py-1 bg-primary-600 text-white rounded-lg text-xs font-bold"
                    >
                        Yes, See Report
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1 bg-white/10 text-gray-400 rounded-lg text-xs font-bold"
                    >
                        Stay
                    </button>
                </div>
            </div>
        ), { duration: 5000, position: 'top-center' });
    }

    const handleSubmit = async () => {
        if (!interviewId || !currentQuestion) return;
        setIsLoading(true)
        try {
            const data = await interviewService.answerQuestion(interviewId, currentQuestion.id, answer)
            setResults([...results, data.evaluation])
            if (data.nextQuestion) {
                setCurrentQuestion(data.nextQuestion)
                setCurrentQuestionIndex(currentQuestionIndex + 1)
                setAnswer('')
            } else {
                handleViewReport(interviewId)
            }
        } catch (error) {
            console.error('Failed to submit answer:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const toggleExpand = (id: string) => {
        setExpandedAnswers(prev => ({ ...prev, [id]: !prev[id] }))
    }

    const formatTime = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

    const learnerLevels = ['Pre-KG', 'School', 'College', 'Professional', 'PhD'];

    return (
        <div className="max-w-4xl mx-auto py-8">
            <AnimatePresence mode="wait">
                {step === 'idle' && (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="space-y-12"
                    >
                        <div className="glass p-6 md:p-12 text-center rounded-3xl">
                            <div className="w-20 h-20 bg-primary-600/20 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8">
                                <Play className="text-primary-500 fill-primary-500" size={32} />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">Adaptive Interview Prep</h1>
                            <p className="text-gray-400 mb-8 md:mb-10 text-base md:text-lg max-w-lg mx-auto leading-relaxed">
                                Real-time AI evaluation using context from your resume, learner level, and performance.
                            </p>
                            <button
                                onClick={() => setStep('config')}
                                className="px-12 py-5 bg-primary-600 hover:bg-primary-500 rounded-2xl font-bold text-lg shadow-xl shadow-primary-600/40 transition-all flex items-center justify-center mx-auto"
                            >
                                Start New Session
                            </button>
                        </div>

                        {/* Session History */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <History size={20} className="text-gray-500" /> Past Sessions
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {sessions.map(s => (
                                    <div key={s.id} onClick={() => handleViewReport(s.id)} className="glass p-5 rounded-2xl border border-white/5 hover:border-primary-500/30 cursor-pointer transition-all group">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-bold text-gray-200 group-hover:text-primary-400 transition-colors">{s.topic}</h3>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{s.role} • {s.difficulty}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-black text-gray-300">{s.readiness_score}%</div>
                                                <div className="text-[8px] font-bold text-gray-600 uppercase">Score</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-[10px] text-gray-600">
                                            <span className="flex items-center gap-1"><Clock size={10} /> {formatTime(s.created_at)}</span>
                                            <span className="flex items-center gap-1 font-bold text-primary-500/50 uppercase tracking-widest">Report <ChevronRight size={10} /></span>
                                        </div>
                                    </div>
                                ))}
                                {sessions.length === 0 && (
                                    <div className="col-span-2 py-12 text-center text-gray-600 text-sm border-2 border-dashed border-white/5 rounded-2xl">
                                        No past sessions found. Your interview history will appear here.
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 'config' && (
                    <motion.div
                        key="config"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass p-5 md:p-10 max-w-2xl mx-auto rounded-2xl md:rounded-3xl"
                    >
                        <h2 className="text-xl md:text-2xl font-black mb-6 md:mb-8">Session Configuration</h2>
                        <div className="space-y-4 md:space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Topic Area</label>
                                    <input
                                        type="text"
                                        value={config.topic}
                                        onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 text-sm md:text-base focus:border-primary-500 outline-none font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Learner Level</label>
                                    <div className="relative">
                                        <BrainCircuit size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <select
                                            value={config.learner_level}
                                            onChange={(e) => setConfig({ ...config, learner_level: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 md:py-4 text-sm md:text-base focus:border-primary-500 outline-none appearance-none font-medium"
                                        >
                                            {learnerLevels.map(l => (
                                                <option key={l} value={l} className="bg-black text-white">{l}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Target Role</label>
                                    <input
                                        type="text"
                                        list="roles-list"
                                        value={config.role}
                                        onChange={(e) => setConfig({ ...config, role: e.target.value })}
                                        placeholder="Enter target role..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 text-sm md:text-base focus:border-primary-500 outline-none font-medium"
                                    />
                                    <datalist id="roles-list">
                                        {['Backend Engineer', 'Frontend Engineer', 'Fullstack Engineer', 'Mobile Developer', 'DevOps Engineer', 'Data Scientist', 'SRE', 'Security Engineer', 'Product Manager'].map(r => (
                                            <option key={r} value={r} />
                                        ))}
                                    </datalist>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">Difficulty</label>
                                        <select
                                            value={config.difficulty}
                                            onChange={(e) => setConfig({ ...config, difficulty: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 text-sm md:text-base focus:border-primary-500 outline-none font-medium appearance-none"
                                        >
                                            {['Beginner', 'Medium', 'Hard', 'Expert'].map(d => (
                                                <option key={d} value={d} className="bg-black text-white">{d}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Questions</label>
                                        <input
                                            type="number"
                                            value={config.numQuestions === 0 ? '' : config.numQuestions}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setConfig({ ...config, numQuestions: val === '' ? 0 : parseInt(val) })
                                            }}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 text-sm md:text-base focus:border-primary-500 outline-none font-medium"
                                            placeholder="Count"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Additional Practice Options</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { id: 'realTimeScenarios', label: 'Real-time Scenarios', icon: <Target size={14} /> },
                                        { id: 'realTimeChallenges', label: 'Real-time Challenges', icon: <Zap size={14} /> },
                                        { id: 'codingPractice', label: 'Coding Practice', icon: <Code size={14} /> }
                                    ].map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setConfig({ ...config, [opt.id]: !config[opt.id] })}
                                            className={`flex items-center justify-center gap-2 p-3 md:p-4 rounded-xl border transition-all text-[10px] md:text-xs font-bold ${config[opt.id] ? 'bg-primary-600/20 border-primary-500 text-white' : 'bg-white/5 border-white/5 text-gray-500 hover:text-white hover:bg-white/10'}`}
                                        >
                                            {opt.icon} {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Job Description (JD) — For targeted questions</label>
                                <textarea
                                    value={config.jd}
                                    onChange={(e) => setConfig({ ...config, jd: e.target.value })}
                                    placeholder="Paste the Job Description here to get specific questions..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 h-24 md:h-32 focus:border-primary-500 outline-none font-medium resize-none text-xs md:text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Technical Resume (Optional)</label>
                                <label className={`block cursor-pointer p-6 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 ${resumeFile ? 'border-primary-500 bg-primary-500/10' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}>
                                    <span className="text-sm font-bold">{resumeFile ? resumeFile.name : 'Click to Upload PDF'}</span>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">Questions will adapt to your background</span>
                                    <input type="file" className="hidden" accept="application/pdf" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} />
                                </label>
                            </div>

                            <div className="pt-4 md:pt-6 flex flex-col md:flex-row gap-3 md:gap-4">
                                <button onClick={() => setStep('idle')} className="w-full md:flex-1 py-3 md:py-4 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-all text-xs md:text-sm uppercase tracking-widest hidden md:block">Cancel</button>
                                <button
                                    onClick={handleInitialize}
                                    disabled={isLoading}
                                    className="w-full md:flex-[2] py-3 md:py-4 bg-primary-600 hover:bg-primary-500 rounded-xl font-bold transition-all text-xs md:text-sm uppercase tracking-widest disabled:opacity-50 flex items-center justify-center shadow-lg shadow-primary-600/30"
                                >
                                    {isLoading ? <RefreshCw className="animate-spin mr-2" size={16} /> : 'Start Interview'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 'active' && (
                    <motion.div
                        key="active"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-8"
                    >
                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-500">
                            <span className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> Live Session
                            </span>
                            <span>Question {currentQuestionIndex + 1} of {config.numQuestions}</span>
                        </div>

                        <div className="glass p-6 md:p-10 border-l-4 border-primary-500 rounded-3xl space-y-6 md:space-y-8 shadow-2xl">
                            <h2 className="text-xl md:text-2xl font-bold leading-relaxed">{currentQuestion?.question_text}</h2>
                            <textarea
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                disabled={isLoading}
                                placeholder="Type your technical answer here..."
                                className="w-full h-40 md:h-56 bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 text-base md:text-lg text-gray-200 focus:outline-none focus:border-primary-500 transition-all disabled:opacity-50 resize-none font-sans"
                            />
                            <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-4">
                                <button onClick={handleQuit} disabled={isLoading} className="text-xs font-bold text-gray-500 hover:text-red-400 uppercase tracking-widest py-2 px-4 rounded-lg hover:bg-red-500/5 transition-all w-full md:w-auto">End Session</button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!answer.trim() || isLoading}
                                    className="px-10 py-5 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-black flex items-center transition-all disabled:opacity-30 shadow-lg shadow-primary-600/20"
                                >
                                    {isLoading ? <RefreshCw className="animate-spin mr-2" size={18} /> : 'Submit Answer'} <ChevronRight size={20} className="ml-2" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 'report' && (
                    <motion.div
                        key="report"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <div className="glass p-6 md:p-10 bg-gradient-to-br from-primary-900/10 to-black rounded-3xl border border-white/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 gap-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <button onClick={() => setStep('idle')} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                                            <ArrowLeft size={18} />
                                        </button>
                                        <h2 className="text-2xl md:text-3xl font-black tracking-tight">{report?.analytics?.config?.topic || 'Performance Report'}</h2>
                                    </div>
                                    <p className="text-gray-500 text-sm font-medium px-4 md:px-10 flex items-center gap-2">
                                        {report?.analytics?.total_questions || 0} Questions Answered • {report?.interview_id?.slice(0, 8)}
                                    </p>
                                </div>
                                <div className="text-left md:text-right px-4 md:px-0">
                                    <span className="text-[10px] font-black uppercase text-primary-400 tracking-[0.2em]">Readiness Score</span>
                                    <p className="text-6xl md:text-7xl font-black tracking-tighter text-white">{report?.readiness_score || '0'}%</p>
                                </div>
                            </div>
                        </div>

                        {report?.workspaceSuggestion && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass p-8 border-l-4 border-green-500 bg-green-500/5 flex flex-col md:flex-row justify-between items-center gap-8 rounded-2xl"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 text-green-500 font-black uppercase text-[10px] mb-3 tracking-widest">
                                        <Target size={14} />
                                        <span>AI Recommended Growth Path</span>
                                    </div>
                                    <h3 className="text-2xl font-black mb-2 text-white">{report.workspaceSuggestion.title}</h3>
                                    <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">{report.workspaceSuggestion.goal}</p>
                                </div>
                                <button
                                    onClick={async () => {
                                        setIsLoading(true);
                                        try {
                                            await workspaceService.createWorkspace(report.workspaceSuggestion);
                                            window.location.href = '/learning-paths';
                                        } finally { setIsLoading(false); }
                                    }}
                                    className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-green-600/20 shrink-0"
                                >
                                    Start Path
                                </button>
                            </motion.div>
                        )}

                        <div className="space-y-6">
                            <h3 className="text-lg font-bold px-1 flex items-center gap-2"><Award size={20} className="text-primary-500" /> Detailed Breakdown</h3>
                            <div className="grid grid-cols-1 gap-6">
                                {report?.answers?.map((ans: any, i: number) => (
                                    <div key={i} className="glass rounded-3xl overflow-hidden border border-white/5">
                                        <div className="p-8 space-y-6">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Question {i + 1}</span>
                                                    <h4 className="text-xl font-bold text-white leading-relaxed">{ans.question_text}</h4>
                                                </div>
                                                <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${ans.weakness_tag === 'strong' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-500'}`}>
                                                    {ans.weakness_tag}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="text-[10px] font-black uppercase text-gray-600 tracking-widest">Your Answer</div>
                                                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap bg-white/5 p-5 rounded-2xl border border-white/5 font-medium">{ans.answer_text}</p>
                                            </div>

                                            <div className="space-y-3 border-t border-white/5 pt-6">
                                                <button
                                                    onClick={() => toggleExpand(ans.id)}
                                                    className="flex items-center gap-2 text-xs font-black uppercase text-primary-400 tracking-widest hover:text-primary-300 transition-all"
                                                >
                                                    <Lightbulb size={14} /> AI Suggested Answer {expandedAnswers[ans.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                </button>
                                                <AnimatePresence>
                                                    {expandedAnswers[ans.id] && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="p-6 bg-primary-600/10 rounded-2xl border border-primary-500/20 text-gray-200 text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                                                                <ReactMarkdown>{ans.suggested_answer}</ReactMarkdown>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            <div className="bg-white/2 p-5 rounded-2xl border border-white/5 space-y-2">
                                                <div className="text-[10px] font-black uppercase text-gray-600 tracking-widest">AI Feedback</div>
                                                <p className="text-sm text-gray-400 italic font-medium leading-relaxed">"{ans.feedback}"</p>
                                                <div className="flex gap-1 pt-2">
                                                    {[1, 2, 3].map(dot => (
                                                        <div key={dot} className={`h-1.5 flex-1 rounded-full ${dot <= ans.score ? 'bg-primary-500' : 'bg-white/5'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default function InterviewPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Target className="text-primary-500 animate-spin" size={32} />
                <p className="text-gray-400 font-bold animate-pulse uppercase tracking-[0.2em] text-xs">Initializing Session...</p>
            </div>
        }>
            <InterviewContent />
        </Suspense>
    )
}
