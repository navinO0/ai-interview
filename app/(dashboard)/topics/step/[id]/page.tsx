'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, BookOpen, Send, Sparkles, Save, MessageCircle, X, Loader, CheckCircle, BrainCircuit } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'
import topicService from '../../../../services/topicService'
import noteService from '../../../../services/noteService'
import { useWorkspaces } from '../../../../context/WorkspaceContext'
import Link from 'next/link'

const AUTO_SAVE_MS = 2 * 60 * 1000

interface ChatMsg { role: 'user' | 'assistant'; content: string }

function TopicPageContent() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()
    const searchParams = useSearchParams()
    const workspaceId = searchParams.get('workspaceId')
    const { completeStep } = useWorkspaces()
    const [step, setStep] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [completing, setCompleting] = useState(false)

    // AI Chat
    const [chatOpen, setChatOpen] = useState(false)
    const [messages, setMessages] = useState<ChatMsg[]>([])
    const [chatInput, setChatInput] = useState('')
    const [chatLoading, setChatLoading] = useState(false)
    const chatEndRef = useRef<HTMLDivElement>(null)
    const chatInputRef = useRef<HTMLInputElement>(null)

    // Topic Notes
    const [noteId, setNoteId] = useState<string | null>(null)
    const [noteContent, setNoteContent] = useState('')
    const [noteDirty, setNoteDirty] = useState(false)
    const [noteSaving, setNoteSaving] = useState(false)
    const [noteLastSaved, setNoteLastSaved] = useState<Date | null>(null)

    useEffect(() => {
        topicService.getStep(id).then(data => {
            setStep(data)
            setLoading(false)
            // Load any existing note for this workspace
            if (data.workspace_id) {
                noteService.list().then(notes => {
                    const existing = notes.find((n: any) => n.workspace_id === data.workspace_id && n.title === `Notes: ${data.title}`)
                    if (existing) {
                        setNoteId(existing.id)
                        setNoteContent(existing.content)
                    }
                })
            }
        }).catch(() => {
            setError('Failed to load topic content.')
            setLoading(false)
        })
    }, [id])

    const saveNote = useCallback(async (force = false) => {
        if (!noteDirty && !force) return
        if (!step) return
        setNoteSaving(true)
        try {
            if (noteId) {
                await noteService.update(noteId, { content: noteContent })
            } else {
                const n = await noteService.create({
                    title: `Notes: ${step.title}`,
                    content: noteContent,
                    workspace_id: step.workspace_id || undefined,
                })
                setNoteId(n.id)
            }
            setNoteDirty(false)
            setNoteLastSaved(new Date())
        } finally {
            setNoteSaving(false)
        }
    }, [noteId, noteContent, noteDirty, step])

    useEffect(() => {
        const iv = setInterval(() => saveNote(), AUTO_SAVE_MS)
        return () => clearInterval(iv)
    }, [saveNote])

    const handleChat = async () => {
        if (!chatInput.trim() || chatLoading) return
        const userMsg = chatInput.trim()
        setChatInput('')
        setMessages(prev => [...prev, { role: 'user', content: userMsg }])
        setChatLoading(true)
        try {
            const data = await topicService.chat(id, userMsg)
            setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I couldn\'t process your question. Please try again.' }])
        } finally {
            setChatLoading(false)
        }
    }

    useEffect(() => {
        if (chatOpen) {
            setTimeout(() => chatInputRef.current?.focus(), 100);
        }
    }, [chatOpen])

    useEffect(() => {
        if (chatOpen) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, chatOpen])

    const handleComplete = async () => {
        if (!step?.workspace_id || !step?.id) return
        setCompleting(true)
        try {
            await completeStep(step.workspace_id, step.id)
            setStep((prev: any) => ({ ...prev, completed: true }))
        } catch (error) {
            console.error('Failed to complete step:', error)
        } finally {
            setCompleting(false)
        }
    }

    const getCleanContent = () => {
        let content = step?.content || step?.description || '*No content available yet.*';
        if (content.startsWith('"') && content.endsWith('"')) {
            try { content = JSON.parse(content); } catch (e) { }
        }
        if (content.startsWith('```markdown')) {
            content = content.replace(/^```markdown\n?/, '').replace(/```$/, '');
        } else if (content.startsWith('```')) {
            content = content.replace(/^```\n?/, '').replace(/```$/, '');
        }
        // Handle literal \n stringified returns from AI logic
        content = content.replace(/\\n/g, '\n');
        return content;
    }


    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary-600/20 rounded-full flex items-center justify-center">
                    <Loader className="text-primary-500 animate-spin" size={28} />
                </div>
                <p className="text-gray-400 animate-pulse">Generating learning content...</p>
            </div>
        </div>
    )

    if (error) return (
        <div className="text-center py-20 text-red-400">{error}</div>
    )

    return (
        <div className="max-w-7xl mx-auto h-[100dvh] flex flex-col pt-8 pb-8 px-4 relative">
            {/* Header */}
            <div className="flex shrink-0 items-center gap-4 mb-6">
                <button
                    onClick={() => {
                        const targetId = workspaceId || step?.workspace_id
                        if (targetId) {
                            router.push(`/learning-paths?workspaceId=${targetId}`)
                        } else {
                            router.back()
                        }
                    }}
                    className="p-2 glass rounded-xl hover:bg-white/10 transition-all"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary-400 mb-1">
                        <BookOpen size={12} /> {step?.workspace_title}
                    </div>
                    <h1 className="text-3xl font-black">{step?.title}</h1>
                </div>
            </div>

            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content (Left Pane) */}
                <motion.article className="lg:col-span-2 glass rounded-2xl flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <div className="prose prose-invert prose-headings:text-white prose-p:text-gray-300 prose-code:text-primary-300 prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-black/60 prose-pre:border prose-pre:border-white/10 max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                                {getCleanContent()}
                            </ReactMarkdown>
                        </div>
                    </div>
                </motion.article>

                {/* Right Pane (Sidebar) */}
                <div className="flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2 h-full">
                    {/* Actions Panel */}
                    <div className="glass rounded-2xl p-6 space-y-3 shrink-0">
                        <button
                            onClick={handleComplete}
                            disabled={step?.completed || completing}
                            className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl font-bold text-sm transition-all ${step?.completed ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-600/30'}`}
                        >
                            <CheckCircle size={18} /> {step?.completed ? 'Completed' : 'Mark as Completed'}
                        </button>

                        <Link
                            href={`/practice/mcq?topic=${encodeURIComponent(step?.title || '')}&difficulty=${step?.workspace_difficulty || 'Medium'}`}
                            className="flex items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all font-bold text-sm w-full"
                        >
                            <BrainCircuit size={18} className="text-purple-400" /> Practice MCQ
                        </Link>

                        <button
                            onClick={() => setChatOpen(o => !o)}
                            className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl font-bold text-sm transition-all ${chatOpen ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30' : 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-600/30'}`}
                        >
                            <Sparkles size={18} /> Tutor & Notes
                        </button>
                    </div>

                    {/* AI Chat Panel */}
                    <AnimatePresence>
                        {chatOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="glass rounded-2xl flex flex-col shrink-0 max-h-[400px]"
                            >
                                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-primary-600/20 rounded-lg flex items-center justify-center">
                                            <Sparkles size={14} className="text-primary-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">AI Tutor</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setChatOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-all">
                                        <X size={16} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                    {messages.length === 0 && (
                                        <div className="text-center py-4 text-gray-600">
                                            <p className="text-xs">Ask any doubt about this topic</p>
                                        </div>
                                    )}
                                    {messages.map((msg, i) => (
                                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[90%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                                ? 'bg-primary-600 text-white rounded-tr-sm'
                                                : 'bg-white/5 text-gray-200 rounded-tl-sm'}`}
                                            >
                                                <div className="prose prose-invert prose-sm max-w-none prose-p:m-0 prose-headings:text-white">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                </div>

                                            </div>
                                        </div>
                                    ))}
                                    {chatLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-white/5 rounded-2xl rounded-tl-sm p-3">
                                                <div className="flex gap-1">
                                                    <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                    <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                    <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                <div className="p-4 border-t border-white/5">
                                    <div className="flex gap-2">
                                        <input
                                            ref={chatInputRef}
                                            value={chatInput}
                                            onChange={e => setChatInput(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleChat()}
                                            placeholder="Message..."
                                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary-500 transition-all"
                                        />
                                        <button
                                            onClick={handleChat}
                                            disabled={chatLoading || !chatInput.trim()}
                                            className="p-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-40 text-white rounded-xl transition-all"
                                        >
                                            <Send size={16} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Topic Notes */}
                    <div className="glass rounded-2xl flex flex-col flex-1 shrink-0 min-h-[300px]">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
                            <h3 className="font-bold text-sm flex items-center gap-2">
                                <MessageCircle size={16} className="text-primary-400" /> Notes
                            </h3>
                            <div className="flex items-center gap-3">
                                {noteLastSaved && (
                                    <span className="text-[10px] text-gray-500">Saved {noteLastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                )}
                                <button
                                    onClick={() => saveNote(true)}
                                    disabled={noteSaving || !noteDirty}
                                    className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white rounded-lg font-bold text-xs transition-all"
                                >
                                    {noteSaving ? <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={12} />}
                                    Save
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 p-0">
                            <textarea
                                value={noteContent}
                                onChange={e => { setNoteContent(e.target.value); setNoteDirty(true) }}
                                placeholder="Write your notes here..."
                                className="w-full h-full bg-transparent p-6 resize-none outline-none text-gray-200 text-sm leading-relaxed font-mono placeholder-gray-700 custom-scrollbar"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function TopicPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-full text-gray-500">Loading...</div>}>
            <TopicPageContent />
        </Suspense>
    )
}
