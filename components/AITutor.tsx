'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Terminal, Sparkles } from 'lucide-react'
import chatService from '../app/services/chatService'

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

    useEffect(() => {
        if (isOpen) {
            const fetchHistory = async () => {
                try {
                    const history = await chatService.getHistory()
                    if (history && history.length > 0) {
                        setChat(history)
                    }
                } catch (error) {
                    console.error('Failed to fetch chat history:', error)
                }
            }
            fetchHistory()
            // Auto focus
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [isOpen])

    // Auto scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [chat, isLoading])

    // Click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (chatRef.current && !chatRef.current.contains(event.target as Node) && isOpen) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen])

    const handleSend = async () => {
        if (!message.trim() || isLoading) return
        const userMsg = { role: 'user', content: message }
        setChat([...chat, userMsg])
        setMessage('')
        setIsLoading(true)

        try {
            const response = await chatService.sendMessage(message)
            setChat(prev => [...prev, {
                role: 'assistant',
                content: response.content
            }])
        } catch (error) {
            console.error('Failed to send message:', error)
            setChat(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.'
            }])
        } finally {
            setIsLoading(false)
            // Focus back after send
            inputRef.current?.focus()
        }
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
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Active</span>
                            </div>
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                            {chat.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-primary-600 text-white shadow-lg' : 'bg-white/5 text-gray-300'
                                        }`}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
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
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-4 pr-10 focus:outline-none focus:border-primary-500 transition-all text-sm disabled:opacity-50"
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
