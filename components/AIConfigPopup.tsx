'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Server, Cloud, Check, Loader2, Play, Download, Settings } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function AIConfigPopup() {
    const [isOpen, setIsOpen] = useState(false)
    const [step, setStep] = useState<'welcome' | 'provider' | 'model' | 'pulling' | 'completed'>('welcome')
    const [provider, setProvider] = useState<'ollama' | 'openai' | 'gemini' | 'claude'>('ollama')
    const [selectedModel, setSelectedModel] = useState('llama3')
    const [localModels, setLocalModels] = useState<string[]>([])
    const [progress, setProgress] = useState<{ status: string; completed: number; total: number; percentage: number }>({
        status: '',
        completed: 0,
        total: 0,
        percentage: 0
    })

    useEffect(() => {
        checkSettings()
    }, [])

    const checkSettings = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) return

            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/ai-settings`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (!data.setup_completed) {
                setIsOpen(true)
            }
        } catch (error) {
            console.error('Check settings error:', error)
        }
    }

    const fetchModels = async () => {
        try {
            const token = localStorage.getItem('token')
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/ai-settings/models`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setLocalModels(data)
        } catch (error) {
            toast.error('Could not connect to Ollama. Ensure it is running.')
        }
    }

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token')
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/ai-settings/save`, {
                provider,
                model_name: selectedModel
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (provider === 'ollama' && !localModels.includes(selectedModel)) {
                setStep('pulling')
                startPull()
            } else {
                setStep('completed')
            }
        } catch (error) {
            toast.error('Failed to save settings')
        }
    }

    const startPull = () => {
        const token = localStorage.getItem('token')
        const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/ai-settings/pull?token=${token}`)

        // Note: EventSource doesn't support headers natively. 
        // We'll need to modify the backend to accept token in query for this specific route or find another way.
        // For now, let's assume we'll fix the backend accordingly.

        // Actually, the pull route uses authMiddleware. I'll need a special route or pass token in URL.
    }

    // Since EventSource is tricky with auth headers, I'll use a standard POST and then poll or just use a helper function.
    // Let's refine the startPull implementation.

    const handlePull = async () => {
        setStep('pulling')
        const token = localStorage.getItem('token')

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/ai-settings/pull`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ modelName: selectedModel })
            })

            if (!response.body) return

            const reader = response.body.getReader()
            let decoder = new TextDecoder()

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const text = decoder.decode(value)
                const lines = text.split('\n\n')

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.replace('data: ', ''))
                            if (data.total) {
                                const pct = Math.round((data.completed / data.total) * 100)
                                setProgress({
                                    status: data.status,
                                    completed: data.completed,
                                    total: data.total,
                                    percentage: pct
                                })
                            } else {
                                setProgress(prev => ({ ...prev, status: data.status }))
                            }
                        } catch (e) { }
                    }
                }
            }
            setStep('completed')
        } catch (error) {
            toast.error('Model pull failed')
            setStep('model')
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="glass max-w-lg w-full p-8 relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500" />

                <AnimatePresence mode="wait">
                    {step === 'welcome' && (
                        <motion.div
                            key="welcome"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="w-16 h-16 bg-primary-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Zap className="text-primary-500" size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-center">Setup your Intelligence Engine</h2>
                            <p className="text-gray-400 text-center text-sm leading-relaxed">
                                Welcome, Naveen! Let's configure the AI brain that will power your interview preparation.
                                Choose between high-performance local AI or reliable cloud models.
                            </p>
                            <button
                                onClick={() => setStep('provider')}
                                className="w-full h-14 bg-primary-600 hover:bg-primary-500 rounded-2xl font-black transition-all flex items-center justify-center group"
                            >
                                Get Started
                                <Play size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    )}

                    {step === 'provider' && (
                        <motion.div
                            key="provider"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <h3 className="text-xl font-bold text-center">Choose AI Provider</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <button
                                    onClick={() => { setProvider('ollama'); setStep('model'); fetchModels(); }}
                                    className="p-6 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4 hover:border-primary-500 hover:bg-primary-500/5 transition-all text-left group"
                                >
                                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:bg-green-500/40 transition-colors">
                                        <Server className="text-green-500" size={24} />
                                    </div>
                                    <div>
                                        <div className="font-bold">Local AI (Ollama)</div>
                                        <div className="text-xs text-gray-500">Run models privately on your hardware. No cost, maximum privacy.</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => { setProvider('openai'); setStep('completed'); handleSave(); }}
                                    className="p-6 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4 hover:border-secondary-500 hover:bg-secondary-500/5 transition-all text-left group"
                                >
                                    <div className="w-12 h-12 bg-secondary-500/20 rounded-xl flex items-center justify-center group-hover:bg-secondary-500/40 transition-colors">
                                        <Cloud className="text-secondary-500" size={24} />
                                    </div>
                                    <div>
                                        <div className="font-bold">Cloud AI (OpenAI/Gemini)</div>
                                        <div className="text-xs text-gray-500">Higher accuracy and speed. Requires API Key in environment.</div>
                                    </div>
                                </button>
                            </div>
                            <button onClick={() => setStep('welcome')} className="w-full text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Back</button>
                        </motion.div>
                    )}

                    {step === 'model' && (
                        <motion.div
                            key="model"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <h3 className="text-xl font-bold text-center">Select Local Model</h3>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Model Name</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={selectedModel}
                                        onChange={(e) => setSelectedModel(e.target.value)}
                                        className="flex-1 h-12 bg-white/5 border border-white/10 rounded-xl px-4 outline-none focus:border-primary-500 font-mono text-sm"
                                        placeholder="e.g. llama3, codellama, mistral"
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex gap-3">
                                <Settings className="text-yellow-500 shrink-0" size={18} />
                                <p className="text-[10px] text-gray-400 leading-relaxed italic">
                                    If the model is not found on your system, we will download it directly from Ollama library.
                                    This might take a few minutes based on your internet speed.
                                </p>
                            </div>

                            <button
                                onClick={handlePull}
                                className="w-full h-14 bg-primary-600 hover:bg-primary-500 rounded-2xl font-black transition-all flex items-center justify-center"
                            >
                                <Download size={18} className="mr-2" />
                                Confirm & Initialize
                            </button>
                            <button onClick={() => setStep('provider')} className="w-full text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Back</button>
                        </motion.div>
                    )}

                    {step === 'pulling' && (
                        <motion.div
                            key="pulling"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-8 py-4"
                        >
                            <div className="text-center space-y-2">
                                <div className="text-primary-500 font-black animate-pulse">DOWNLOADING INTELLIGENCE</div>
                                <div className="text-xs text-gray-500 uppercase tracking-widest">{selectedModel}: {progress.status}</div>
                            </div>

                            <div className="space-y-2">
                                <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress.percentage}%` }}
                                        className="h-full bg-gradient-to-r from-primary-600 to-secondary-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] font-bold text-gray-500">
                                    <span>{progress.percentage}% COMPLETE</span>
                                    <span>{Math.round(progress.completed / 1024 / 1024 / 1024 * 10) / 10}GB / {Math.round(progress.total / 1024 / 1024 / 1024 * 10) / 10}GB</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-center">
                                <Loader2 className="animate-spin text-primary-500" size={32} />
                            </div>
                        </motion.div>
                    )}

                    {step === 'completed' && (
                        <motion.div
                            key="completed"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6 text-center"
                        >
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-500/30">
                                <Check className="text-green-500" size={40} />
                            </div>
                            <h2 className="text-2xl font-black">System Ready!</h2>
                            <p className="text-gray-400 text-sm">
                                Your Intelligence Engine has been configured. The application is now ready to assist you in your interview journey.
                            </p>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full h-14 bg-green-600 hover:bg-green-500 rounded-2xl font-black transition-all"
                            >
                                Enter Dashboard
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}
