'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Terminal, Sparkles } from 'lucide-react'
import chatService from '../app/services/authService'
import ReactMarkdown from 'react-markdown'
import Mermaid from '../app/components/Mermaid'

export default function AITutor() {
    const [isOpen, setIsOpen] = useState(false)
    const [message, setMessage] = useState('')
    const [chat, setChat] = useState<any[]>([
        { role: 'assistant', content: 'Hi! I am your AI Interview Tutor. Need help with a technical concept or a practice problem?' }
    ])
    const [isLoading, setIsLoading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    const chatRef = useRef<HTMLDivElement>(null)
    const [streamingContent, setStreamingContent] = useState('')



    const handleSend = async () => {
        if (!message.trim() || isLoading) return
        const userMsg = { role: 'user', content: message }
        setChat([...chat, userMsg])
        setMessage('')
        setIsLoading(true)
        setStreamingContent('') // Reset streaming content
    }

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-4 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-primary-600 rounded-full shadow-2xl shadow-primary-600/40 flex items-center justify-center text-white hover:scale-110 transition-transform z-50"
            >
                {isOpen ? <X /> : <MessageSquare />}
            </button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={chatRef}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 h-[60vh] sm:h-[500px] max-h-[80vh] glass z-50 flex flex-col shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 bg-primary-600/10 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Sparkles size={18} className="text-primary-400" />
                                <span className="font-bold text-sm tracking-tight text-white uppercase">AI Tutor</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-[10px] text-muted font-bold uppercase tracking-widest">Active</span>
                            </div>
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                            {chat.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[90%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-primary-600 text-white shadow-lg' : 'bg-[var(--bg-glass)] text-secondary'
                                        }`}>
                                        <div className="prose prose-xs max-w-none" style={{ color: 'var(--prose-color)' }}>
                                            <ReactMarkdown
                                                components={{
                                                    code({ node, className, children, ...props }) {
                                                        const match = /language-(\w+)/.exec(className || '')
                                                        if (match && match[1] === 'mermaid') {
                                                            return <Mermaid chart={String(children).replace(/\n$/, '')} />
                                                        }
                                                        if (match && match[1] === 'svg') {
                                                            return <div className="flex justify-center my-4 bg-[var(--bg-glass)] p-3 rounded-lg overflow-auto" dangerouslySetInnerHTML={{ __html: String(children) }} />
                                                        }
                                                        return <code className={className} {...props}>{children}</code>
                                                    }
                                                }}
                                            >
                                                {m.content}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {streamingContent && (
                                <div className="flex justify-start">
                                    <div className="max-w-[90%] p-3 rounded-2xl text-sm bg-[var(--bg-glass)] text-secondary border-l-2 border-primary-500">
                                        <div className="prose prose-xs max-w-none" style={{ color: 'var(--prose-color)' }}>
                                            <ReactMarkdown
                                                components={{
                                                    code({ node, className, children, ...props }) {
                                                        const match = /language-(\w+)/.exec(className || '')
                                                        if (match && match[1] === 'mermaid') {
                                                            return <Mermaid chart={String(children).replace(/\n$/, '')} />
                                                        }
                                                        if (match && match[1] === 'svg') {
                                                            return <div className="flex justify-center my-4 bg-[var(--bg-glass)] p-3 rounded-lg overflow-auto" dangerouslySetInnerHTML={{ __html: String(children) }} />
                                                        }
                                                        return <code className={className} {...props}>{children}</code>
                                                    }
                                                }}
                                            >
                                                {streamingContent}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {isLoading && !streamingContent && (
                                <div className="flex justify-start">
                                    <div className="bg-white/5 p-3 rounded-2xl">
                                        <div className="flex space-x-1">
                                            <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" />
                                            <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                            <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-white/10 bg-black/40">
                            <div className="relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={message}
                                    disabled={isLoading}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder={isLoading ? "AI is thinking..." : "Ask a question..."}
                                    className="w-full bg-[var(--bg-glass)] border border-[var(--border-color)] rounded-xl py-2.5 pl-4 pr-10 focus:outline-none focus:border-primary-500 transition-all text-sm text-primary disabled:opacity-50"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={isLoading || !message.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-primary-500 hover:text-primary-400 p-1 disabled:opacity-50"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
