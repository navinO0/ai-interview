'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Upload, CheckCircle, FileText, AlertCircle, Lightbulb,
    MessageSquare, Zap, ChevronRight, Target, Award,
    ShieldAlert, BarChart3, Search, Edit3
} from 'lucide-react'
import Link from 'next/link'
import resumeService from '../../services/resumeService'
import { useModelDownloader } from '../../../hooks/useModelDownloader'
import toast from 'react-hot-toast'

function ScoreCard({ title, score, icon, color, label }: { title: string, score: number, icon: any, color: string, label?: string }) {
    const colorMap: any = {
        primary: 'text-primary-400',
        secondary: 'text-secondary-400',
        green: 'text-green-400',
        yellow: 'text-yellow-400',
        red: 'text-red-400'
    }

    return (
        <div className="glass p-5 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-all ${colorMap[color]}`}>
                {icon}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">{title}</span>
            <div className="relative w-24 h-24 flex items-center justify-center mb-2">
                <svg className="w-full h-full -rotate-90">
                    <circle
                        cx="48" cy="48" r="42"
                        fill="none" stroke="currentColor"
                        strokeWidth="6" className="text-white/5"
                    />
                    <motion.circle
                        cx="48" cy="48" r="42"
                        fill="none" stroke="currentColor"
                        strokeWidth="6" strokeLinecap="round"
                        strokeDasharray={264}
                        initial={{ strokeDashoffset: 264 }}
                        animate={{ strokeDashoffset: 264 - (264 * (score || 0)) / 100 }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                        className={colorMap[color]}
                    />
                </svg>
                <div className="absolute text-center">
                    <span className="text-2xl font-black block">{score || 0}%</span>
                </div>
            </div>
            {label && <span className="text-[9px] font-bold text-gray-400 mt-2 uppercase text-center leading-tight max-w-[120px]">{label}</span>}
        </div>
    )
}

export default function ResumePage() {
    const [file, setFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [jobDescription, setJobDescription] = useState('')
    const { downloadModel } = useModelDownloader()

    // Load persisted state on mount
    useEffect(() => {
        const savedResult = localStorage.getItem('resume_analysis_result')
        const savedJD = localStorage.getItem('resume_job_description')

        if (savedResult) {
            try {
                setResult(JSON.parse(savedResult))
            } catch (e) {
                console.error('[ResumePage] Failed to parse cached result', e)
            }
        }
        if (savedJD) {
            setJobDescription(savedJD)
        }
    }, [])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0])
            setError(null)
        }
    }

    const handleAnalyze = async () => {
        if (!file) {
            setError('Please upload a resume file first.')
            return;
        }

        setIsUploading(true)
        setError(null)

        try {
            const data = await resumeService.uploadResume(file, jobDescription)
            setResult(data.parsed)

            localStorage.setItem('resume_analysis_result', JSON.stringify(data.parsed))
            localStorage.setItem('resume_job_description', jobDescription)
        } catch (error: any) {
            console.error('[ResumePage] Analysis Error:', error)
            const errorMsg = error.response?.data?.error || error.message;

            if (errorMsg?.includes('OLLAMA_MODEL_NOT_FOUND')) {
                const modelName = errorMsg.split(':')[1] || 'model';
                toast((t) => (
                    <div className="flex flex-col gap-3">
                        <p className="font-bold text-sm text-primary-400">Model "{modelName}" not found.</p>
                        <p className="text-xs text-gray-500">Analysis requires this model. Install now? (2-4GB)</p>
                        <div className="flex gap-2">
                            <button
                                onClick={async () => {
                                    toast.dismiss(t.id);
                                    try {
                                        await downloadModel(modelName);
                                        toast.success('Ready! Retrying analysis...');
                                        handleAnalyze();
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
                setError(errorMsg || 'Failed to analyze resume. Please try again.')
                toast.error('Analysis failed.')
            }
        } finally {
            setIsUploading(false)
        }
    }

    // Keep JD in sync with localStorage for quick navigations
    const handleJDChange = (val: string) => {
        setJobDescription(val)
        localStorage.setItem('resume_job_description', val)
    }

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold mb-2">Resume Intelligence Pro</h1>
                <p className="text-gray-400">Upload your PDF and optional Job Description for advanced ATS calibration.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass p-8 flex flex-col min-h-[500px]">
                    <h3 className="text-xl font-bold mb-6 flex items-center w-full">
                        <FileText className="mr-2 text-primary-500" size={20} />
                        Analyze Resume
                    </h3>

                    <div className="w-full h-32 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center hover:border-primary-500 transition-colors relative cursor-pointer mb-6">
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Upload size={24} className="text-gray-400 mb-1" />
                        <p className="text-gray-300 text-sm font-medium">Click or drag PDF</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {file ? file.name : "Supported format: .pdf"}
                        </p>
                    </div>

                    <div className="flex-1 space-y-2 mb-6">
                        <label className="text-xs font-bold uppercase text-gray-500">Target Job Description (Optional)</label>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => handleJDChange(e.target.value)}
                            placeholder="Paste the job description here to calibrate your ATS score..."
                            className="w-full h-40 bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-primary-500 outline-none transition-all resize-none"
                        />
                    </div>

                    {error && (
                        <div className="w-full mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleAnalyze}
                        disabled={!file || isUploading}
                        className="w-full py-4 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 rounded-xl font-bold flex items-center justify-center transition-all shadow-lg shadow-primary-600/20"
                    >
                        {isUploading ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                            />
                        ) : <Zap size={20} className="mr-2" />}
                        Generate Intelligence Report
                    </button>
                </div>

                <div className="glass p-8 relative overflow-y-auto max-h-[800px]">
                    {!result && !isUploading && (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-500">
                            <Upload size={48} className="mb-4 opacity-20" />
                            <p>Analysis results will appear here</p>
                        </div>
                    )}

                    {isUploading && (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center space-y-4">
                            <div className="w-16 h-16 bg-primary-600/20 rounded-full flex items-center justify-center">
                                <span className="text-primary-500 animate-pulse text-2xl font-bold">AI</span>
                            </div>
                            <p className="font-medium animate-pulse text-gray-400 font-mono">Analyzing with Intelligence engine...</p>
                        </div>
                    )}

                    {result ? (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-8"
                        >
                            {/* Core Scorecards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <ScoreCard
                                    title="ATS Compatibility"
                                    score={result.ats_score}
                                    icon={<Target size={18} />}
                                    color="secondary"
                                />
                                <ScoreCard
                                    title="Readiness Level"
                                    score={Math.round((result.ats_score + (result.job_match?.score || 0)) / 2)}
                                    label={result.recruiter_view?.impression}
                                    icon={<Award size={18} />}
                                    color="primary"
                                />
                                <ScoreCard
                                    title="JD Alignment"
                                    score={result.job_match?.score || 0}
                                    icon={<Fingerprint size={18} />}
                                    color="green"
                                />
                            </div>

                            {/* Section Analysis & Red Flags */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="glass p-6">
                                    <h4 className="text-sm font-bold uppercase tracking-wider text-primary-400 mb-6 flex items-center">
                                        <BarChart3 size={16} className="mr-2" />
                                        Section-wise Performance
                                    </h4>
                                    <div className="space-y-5">
                                        {Object.entries(result.section_scores || {}).map(([section, score]: [string, any]) => (
                                            <div key={section} className="space-y-2">
                                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                                                    <span>{section}</span>
                                                    <span className={score > 80 ? 'text-green-400' : score > 50 ? 'text-yellow-500' : 'text-red-400'}>{score}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${score}%` }}
                                                        transition={{ duration: 1, ease: 'easeOut' }}
                                                        className={`h-full ${score > 80 ? 'bg-green-500' : score > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="glass p-6 bg-red-500/5 border-l-4 border-red-500">
                                    <h4 className="text-sm font-bold uppercase tracking-wider text-red-500 mb-6 flex items-center">
                                        <ShieldAlert size={16} className="mr-2" />
                                        Recruiter Red Flags & Issues
                                    </h4>
                                    <div className="space-y-4">
                                        {result.recruiter_view?.red_flags && Array.isArray(result.recruiter_view.red_flags) && result.recruiter_view.red_flags.map((flag: string, i: number) => (
                                            <div key={i} className="flex items-start space-x-3 text-sm text-gray-300">
                                                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                                                <span>{flag}</span>
                                            </div>
                                        ))}
                                        {result.grammar_formatting?.issues && Array.isArray(result.grammar_formatting.issues) && result.grammar_formatting.issues.map((issue: string, i: number) => (
                                            <div key={`g-${i}`} className="flex items-start space-x-3 text-sm text-gray-400 border-t border-white/5 pt-2">
                                                <Edit3 size={14} className="text-yellow-500 shrink-0 mt-1" />
                                                <span>{issue}</span>
                                            </div>
                                        ))}
                                        {(!result.recruiter_view?.red_flags?.length && !result.grammar_formatting?.issues?.length) && (
                                            <div className="py-8 text-center text-gray-500 italic">No critical issues detected. Excellent formatting!</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Section-wise recommendations */}
                            <div className="glass p-8">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-primary-400 mb-6 flex items-center">
                                    <Lightbulb size={16} className="mr-2" />
                                    Section-wise Improvement Recommendations
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {Object.entries(result.section_improvements || {}).map(([section, suggestion]: [string, any]) => (
                                        <div key={section} className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{section}</div>
                                            <div className="flex items-start gap-2 text-sm text-gray-300">
                                                <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 shrink-0" />
                                                <span>{suggestion}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Impact & Actionable Intelligence */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-8">
                                    <div className="glass p-6">
                                        <h4 className="text-sm font-bold uppercase tracking-wider text-green-400 mb-6 flex items-center">
                                            <Award size={16} className="mr-2" />
                                            Impact Measurement & Rewrites
                                        </h4>
                                        <div className="space-y-6">
                                            {result.impact_measurement?.feedback && Array.isArray(result.impact_measurement.feedback) && result.impact_measurement.feedback.map((fb: string, i: number) => (
                                                <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-3">
                                                    <div className="flex items-center text-xs font-bold text-gray-400">
                                                        <span className="bg-primary-600/20 text-primary-400 px-2 py-1 rounded mr-2">ANALYSIS</span>
                                                        {fb}
                                                    </div>
                                                    <div className="pl-4 border-l-2 border-green-500/30 text-sm text-gray-300 italic">
                                                        "Suggested: {Array.isArray(result.suggestions) ? (result.suggestions.find((s: string) => s.toLowerCase().includes('result') || s.toLowerCase().includes('impact')) || 'Focus on quantifying this achievement with data points.') : 'Focus on quantifying this achievement with data points.'}"
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="glass p-6">
                                        <h4 className="text-sm font-bold uppercase tracking-wider text-primary-400 mb-6 flex items-center">
                                            <Search size={16} className="mr-2" />
                                            Keyword Gap (Missing from JD)
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {result.job_match?.missing_keywords?.map((kw: string) => (
                                                <span key={kw} className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-[10px] font-bold text-red-400 uppercase tracking-tighter">
                                                    {kw}
                                                </span>
                                            ))}
                                            {(!result.job_match?.missing_keywords?.length) && (
                                                <span className="text-sm text-gray-500 italic">Perfect keyword alignment!</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="glass p-6 bg-primary-600/5 border border-primary-500/20">
                                        <h4 className="text-sm font-bold uppercase tracking-wider text-primary-400 mb-6 flex items-center">
                                            <Zap size={16} className="mr-2" />
                                            Practice Radar
                                        </h4>
                                        <div className="space-y-3">
                                            {result.skills && Array.isArray(result.skills) && result.skills.slice(0, 5).map((s: string) => (
                                                <Link
                                                    key={s}
                                                    href={`/practice/mcq?category=${encodeURIComponent(s)}`}
                                                    className="block p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium transition-all group shrink-0"
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <span>{s}</span>
                                                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="glass p-6">
                                        <h4 className="text-sm font-bold uppercase tracking-wider text-yellow-500 mb-6 flex items-center">
                                            <AlertCircle size={16} className="mr-2" />
                                            Learning Roadmap
                                        </h4>
                                        <div className="space-y-4">
                                            {result.missing_topics && Array.isArray(result.missing_topics) && result.missing_topics.map((topic: string) => (
                                                <Link
                                                    key={topic}
                                                    href={`/topics/explore/${encodeURIComponent(topic)}`}
                                                    className="flex items-center p-3 bg-black/20 rounded-xl hover:bg-black/40 transition-all border border-white/5"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center mr-3">
                                                        <Lightbulb size={16} className="text-yellow-500" />
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-300">{topic}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="glass p-12 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                                <BarChart3 size={32} className="text-gray-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-400">No Intelligence Data</h3>
                            <p className="text-gray-500 max-w-xs text-sm">Upload your resume to generate a professional assessment report.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function Fingerprint(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M2 12a10 10 0 0 1 18-6" />
            <path d="M2 12v.01" />
            <path d="M7 12a5 5 0 0 1 5-5" />
            <path d="M7 12v.01" />
            <path d="M12 7v5" />
            <path d="M12 12a5 5 0 0 1 5 5" />
            <path d="M12 12v.01" />
            <path d="M17 12a5 5 0 0 1-5 5" />
            <path d="M17 12v.01" />
        </svg>
    )
}
