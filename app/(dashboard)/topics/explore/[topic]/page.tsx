'use client'

import { useState, useEffect, use } from 'react'
import { motion } from 'framer-motion'
import {
    BookOpen, ChevronRight, Award, MessageSquare, ArrowLeft,
    Search, GraduationCap, Zap, Code, Lightbulb, AlertTriangle,
    ShieldCheck, PlayCircle, Terminal, HelpCircle, CheckCircle, XCircle
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import topicService from '../../../../services/topicService'

export default function TopicDeepDivePage({ params }: { params: { topic: string } }) {
    const { topic } = params;
    const decodedTopic = decodeURIComponent(topic);
    const [explanation, setExplanation] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        async function fetchExplanation() {
            // Check local cache first for instant load
            const cacheKey = `topic_cache_${decodedTopic}`;
            const cachedData = localStorage.getItem(cacheKey);

            if (cachedData) {
                try {
                    setExplanation(JSON.parse(cachedData));
                    setIsLoading(false);
                    // Still fetch in background to refresh? Maybe not to save AI costs.
                    // For now, if it's cached, just use it.
                    return;
                } catch (e) {
                    console.error('[TopicDeepDive] Cache parse error:', e);
                }
            }

            try {
                const data = await topicService.explainTopic(decodedTopic);
                setExplanation(data);
                // Save to cache
                localStorage.setItem(cacheKey, JSON.stringify(data));
            } catch (err: any) {
                setError(err.message || 'Failed to load topic explanation');
            } finally {
                setIsLoading(false);
            }
        }
        fetchExplanation();
    }, [decodedTopic]);

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 bg-primary-600/20 rounded-full flex items-center justify-center">
                    <GraduationCap className="text-primary-500 animate-pulse" size={32} />
                </div>
                <p className="text-gray-400 font-medium animate-pulse">Deep-diving into "{decodedTopic}"...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center">
                    <ArrowLeft className="mr-2 cursor-pointer" onClick={() => router.back()} />
                    {error}
                </div>
                <button onClick={() => window.location.reload()} className="text-primary-500 hover:underline">Try Again</button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <header className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} className="text-gray-400" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold">{explanation.title}</h1>
                        <p className="text-gray-400 font-medium uppercase text-[10px] tracking-[0.2em]">Curated Intelligence</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Main Content */}
                <div className="lg:col-span-8 space-y-8">
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass p-8"
                    >
                        <h3 className="text-xl font-bold mb-6 flex items-center">
                            <BookOpen className="mr-2 text-primary-500" size={20} />
                            Concept Review
                        </h3>
                        <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {explanation.explanation}
                        </div>
                    </motion.section>

                    {explanation.codeExamples && (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass p-8"
                        >
                            <h3 className="text-xl font-bold mb-6 flex items-center">
                                <Code className="mr-2 text-primary-500" size={20} />
                                Technical Blueprint (Code)
                            </h3>
                            <div className="bg-black/40 rounded-xl p-6 font-mono text-sm overflow-x-auto border border-white/10">
                                {explanation.codeExamples}
                            </div>
                        </motion.section>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <section className="glass p-8">
                            <h3 className="text-lg font-bold mb-6 flex items-center">
                                <ShieldCheck className="mr-2 text-green-500" size={18} />
                                Best Practices
                            </h3>
                            <ul className="space-y-4">
                                {explanation.bestPractices?.map((bp: string, i: number) => (
                                    <li key={i} className="flex items-start space-x-2 text-sm text-gray-400">
                                        <CheckCircle size={14} className="text-green-500 shrink-0 mt-1" />
                                        <span>{bp}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section className="glass p-8 border-l-4 border-red-500/50">
                            <h3 className="text-lg font-bold mb-6 flex items-center text-red-400">
                                <AlertTriangle className="mr-2 text-red-500" size={18} />
                                Common Mistakes
                            </h3>
                            <ul className="space-y-4">
                                {explanation.commonMistakes?.map((cm: string, i: number) => (
                                    <li key={i} className="flex items-start space-x-2 text-sm text-gray-400">
                                        <XCircle size={14} className="text-red-500 shrink-0 mt-1" />
                                        <span>{cm}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>

                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass p-8"
                    >
                        <h3 className="text-xl font-bold mb-6 flex items-center">
                            <Lightbulb className="mr-2 text-yellow-500" size={20} />
                            Real-World Use Cases
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                            {explanation.useCases?.map((uc: string, idx: number) => (
                                <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-xl text-sm text-gray-300">
                                    {uc}
                                </div>
                            ))}
                        </div>
                    </motion.section>
                </div>

                {/* Right: Interaction Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="glass p-8 sticky top-8">
                        <h3 className="text-lg font-bold mb-8 flex items-center">
                            <PlayCircle className="mr-2 text-primary-500" size={20} />
                            Launch Preparation
                        </h3>
                        <div className="space-y-4">
                            <ModeLink
                                href={`/interview?topic=${encodeURIComponent(decodedTopic)}`}
                                icon={<Terminal size={18} />}
                                title="Interview Lab"
                                desc="Start an adaptive AI interview session."
                                color="primary"
                            />
                            <ModeLink
                                href={`/practice/mcq?category=${encodeURIComponent(decodedTopic)}`}
                                icon={<HelpCircle size={18} />}
                                title="MCQ Practice"
                                desc="Test your foundational knowledge."
                                color="secondary"
                            />
                            <ModeLink
                                href="#"
                                icon={<Award size={18} />}
                                title="Revision Mode"
                                desc="Quick refresh of key concepts."
                                color="green"
                            />
                        </div>

                        <div className="mt-12 pt-12 border-t border-white/10 space-y-8">
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4 flex items-center">
                                    <MessageSquare size={12} className="mr-2" />
                                    Interview Questions
                                </h4>
                                <div className="space-y-4">
                                    {explanation.commonInterviewQuestions?.map((q: string, idx: number) => (
                                        <div key={idx} className="p-3 bg-black/20 rounded-lg text-xs text-gray-400 italic">
                                            "{q}"
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4 flex items-center">
                                    <Search size={12} className="mr-2" />
                                    Knowledge Graph
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {explanation.resources?.map((r: string) => (
                                        <div key={r} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-gray-400 font-bold uppercase tabular-nums">
                                            {r}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ModeLink({ href, icon, title, desc, color }: any) {
    const colors: any = {
        primary: 'border-primary-500/30 hover:bg-primary-500/10 text-primary-400',
        secondary: 'border-secondary-500/30 hover:bg-secondary-500/10 text-secondary-400',
        green: 'border-green-500/30 hover:bg-green-500/10 text-green-400',
    }

    return (
        <Link href={href} className={`block p-4 border rounded-2xl transition-all group ${colors[color]}`}>
            <div className="flex items-center space-x-3 mb-1">
                {icon}
                <span className="font-bold">{title}</span>
            </div>
            <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                {desc}
            </p>
        </Link>
    )
}

function Target(props: any) {
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
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
        </svg>
    )
}
