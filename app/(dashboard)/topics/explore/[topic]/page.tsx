'use client'

import { use, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    BookOpen, ChevronRight, MessageSquare, ArrowLeft,
    GraduationCap, AlertTriangle,
    ShieldCheck, Terminal, HelpCircle
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import topicService from '../../../../services/topicService'

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark-reasonable.css';
import { Mermaid } from '../../../../../components/Mermaid';

export default function TopicDeepDivePage({ params }: { params: Promise<{ topic: string }> }) {
    const { topic } = use(params);
    const decodedTopic = decodeURIComponent(topic);
    const [explanation, setExplanation] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const router = useRouter();

    useEffect(() => {
        async function fetchExplanation() {
            const cacheKey = `topic_cache_v2_${decodedTopic}`;
            const cachedData = localStorage.getItem(cacheKey);

            if (cachedData) {
                try {
                    setExplanation(JSON.parse(cachedData));
                    setIsLoading(false);
                    return;
                } catch (e) {
                    console.error('[TopicDeepDive] Cache parse error:', e);
                }
            }

            try {
                const data = await topicService.explainTopic(decodedTopic);
                setExplanation(data);
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
                    <BookOpen className="text-primary-500 animate-pulse" size={32} />
                </div>
                <p className="text-gray-400 font-medium animate-pulse">Opening the book on "{decodedTopic}"...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center">
                    <AlertTriangle className="mr-2" />
                    {error}
                </div>
                <button onClick={() => window.location.reload()} className="text-primary-500 hover:underline">Try Again</button>
            </div>
        );
    }

    const { chapters } = explanation;
    const hasChapters = chapters && chapters.length > 0;
    const currentChapter = hasChapters ? chapters[currentPage] : null;

    // Custom link router to handle topic:// links inside markdown
    const handleMarkdownLinkClick = (href: string | undefined): React.MouseEventHandler<HTMLAnchorElement> | undefined => {
        if (href && href.startsWith('topic://')) {
            return (e) => {
                e.preventDefault();
                const nextTopic = href.replace('topic://', '');
                router.push(`/topics/explore/${encodeURIComponent(nextTopic)}`);
                // Clear state slightly to show loading
                setIsLoading(true);
            };
        }
        return undefined;
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <header className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors group"
                    >
                        <ArrowLeft size={20} className="text-gray-400 group-hover:text-primary-400 transition-colors" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-white">{explanation.title}</h1>
                        <p className="text-primary-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1 flex items-center">
                            <BookOpen size={10} className="mr-1" />
                            Library of Knowledge
                        </p>
                    </div>
                </div>

                {hasChapters && (
                    <div className="flex items-center space-x-2 text-sm font-medium text-gray-500">
                        <span className="tabular-nums">Page {currentPage + 1} of {chapters.length}</span>
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Main Book Content */}
                <div className="lg:col-span-8 space-y-8">
                    {hasChapters ? (
                        <div className="bg-[#0a0a0a]/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden relative min-h-[600px] flex flex-col">

                            {/* Decorative Spine */}
                            <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-primary-600/20 via-primary-500/10 to-transparent border-r border-white/5" />

                            <div className="p-12 md:p-16 flex-1">
                                <motion.div
                                    key={currentPage} // Animates every page turn
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <h2 className="text-2xl font-black text-white mb-8 pb-4 border-b border-white/10">{currentChapter.title}</h2>

                                    {/* The magic Markdown renderer */}
                                    <div className="prose prose-invert prose-lg prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10 prose-p:leading-relaxed prose-headings:text-primary-100 max-w-none text-gray-300">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            rehypePlugins={[rehypeHighlight]}
                                            components={{
                                                a: ({ node, ...props }) => {
                                                    const isTopicLink = props.href?.startsWith('topic://');
                                                    return (
                                                        <a
                                                            {...props}
                                                            onClick={handleMarkdownLinkClick(props.href)}
                                                            className={`${isTopicLink ? 'text-primary-400 hover:text-primary-300 underline decoration-primary-500/30 font-semibold cursor-pointer transition-colors' : 'text-blue-400 hover:underline'}`}
                                                        >
                                                            {props.children}
                                                            {isTopicLink && <BookOpen size={12} className="inline ml-1 mb-0.5 opacity-70" />}
                                                        </a>
                                                    );
                                                },
                                                code({ node, inline, className, children, ...props }: any) {
                                                    const match = /language-(\w+)/.exec(className || '');
                                                    if (!inline && match && match[1] === 'mermaid') {
                                                        return <Mermaid chart={String(children).replace(/\n$/, '')} />;
                                                    }
                                                    return !inline ? (
                                                        <code className={className} {...props}>
                                                            {children}
                                                        </code>
                                                    ) : (
                                                        <code className="px-1.5 py-0.5 rounded-md bg-white/10 text-primary-300 font-mono text-[0.85em]" {...props}>
                                                            {children}
                                                        </code>
                                                    );
                                                }
                                            }}
                                        >
                                            {currentChapter.content}
                                        </ReactMarkdown>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Pagination Controls inside the book footer */}
                            <div className="p-6 bg-black/40 border-t border-white/5 flex items-center justify-between z-10">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                    disabled={currentPage === 0}
                                    className="flex items-center px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 rounded-xl text-sm font-bold transition-all"
                                >
                                    <ChevronRight size={16} className="mr-2 rotate-180" />
                                    Previous Page
                                </button>

                                <span className="text-xs font-mono text-gray-500">
                                    {String(currentPage + 1).padStart(2, '0')} / {String(chapters.length).padStart(2, '0')}
                                </span>

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(chapters.length - 1, p + 1))}
                                    disabled={currentPage === chapters.length - 1}
                                    className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white disabled:opacity-30 disabled:bg-white/5 disabled:text-gray-400 rounded-xl text-sm font-bold transition-all"
                                >
                                    Next Page
                                    <ChevronRight size={16} className="ml-2" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="glass p-12 text-center text-gray-400 italic">
                            No chapters found for this topic. Check back later!
                        </div>
                    )}
                </div>

                {/* Right: Interaction Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="glass p-8 sticky top-8 rounded-[2rem]">
                        <h3 className="text-lg font-bold mb-8 flex items-center text-white">
                            <GraduationCap className="mr-2 text-primary-500" size={20} />
                            Apply Knowledge
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
                        </div>

                        {/* Best Practices & Pitfalls (From metadata) */}
                        <div className="mt-12 pt-12 border-t border-white/10 space-y-8">
                            {explanation.bestPractices?.length > 0 && (
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-green-500/70 mb-4 flex items-center">
                                        <ShieldCheck size={12} className="mr-2" />
                                        Best Practices
                                    </h4>
                                    <ul className="space-y-3">
                                        {explanation.bestPractices.slice(0, 3).map((bp: string, i: number) => (
                                            <li key={i} className="flex items-start text-xs text-gray-400 leading-relaxed">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500/50 mt-1.5 mr-2 shrink-0" />
                                                <span>{bp}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {explanation.commonInterviewQuestions?.length > 0 && (
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4 flex items-center">
                                        <MessageSquare size={12} className="mr-2" />
                                        Expected Questions
                                    </h4>
                                    <div className="space-y-3">
                                        {explanation.commonInterviewQuestions.slice(0, 3).map((q: string, idx: number) => (
                                            <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs text-gray-300 italic">
                                                "{q}"
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ModeLink({ href, icon, title, desc, color }: any) {
    const colors: any = {
        primary: 'border-primary-500/30 hover:bg-primary-500/10 text-primary-400 bg-primary-500/5',
        secondary: 'border-secondary-500/30 hover:bg-secondary-500/10 text-secondary-400 bg-secondary-500/5',
        green: 'border-green-500/30 hover:bg-green-500/10 text-green-400 bg-green-500/5',
    }

    return (
        <Link href={href} className={`block p-4 border rounded-2xl transition-all group ${colors[color]}`}>
            <div className="flex items-center space-x-3 mb-1">
                {icon}
                <span className="font-bold text-white group-hover:text-current transition-colors">{title}</span>
            </div>
            <p className="text-[11px] text-gray-400 group-hover:text-gray-300 transition-colors mt-2">
                {desc}
            </p>
        </Link>
    )
}
