'use client'

import { useTheme } from '../../context/ThemeContext'
import { useWorkspaces } from '../../context/WorkspaceContext'
import { User, Shield, Bell, Palette, Trash2, Brain, Cpu, Server, Save, Settings, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function SettingsPage() {
    const { theme, setTheme } = useTheme()
    const { workspaces, deleteWorkspace } = useWorkspaces()
    const [activeTab, setActiveTab] = useState('Account')

    // AI Settings State
    const [aiSettings, setAiSettings] = useState({
        provider: 'ollama',
        model_name: 'llama3',
        api_key: '',
        use_custom_settings: false
    })
    const [isSaving, setIsSaving] = useState(false)
    const [isLoadingSettings, setIsLoadingSettings] = useState(true)

    useEffect(() => {
        fetchAiSettings()
    }, [])

    const fetchAiSettings = async () => {
        try {
            setIsLoadingSettings(true)
            const { data } = await api.get('/ai-settings')
            setAiSettings({
                provider: data.provider || 'ollama',
                model_name: data.model_name || 'llama3',
                api_key: data.api_key || '',
                use_custom_settings: !!data.use_custom_settings
            })
        } catch (error) {
            console.error('Fetch AI settings error:', error)
        } finally {
            setIsLoadingSettings(false)
        }
    }

    const handleSaveAISettings = async () => {
        try {
            setIsSaving(true)
            await api.post('/ai-settings/save', aiSettings)
            toast.success('AI settings saved successfully')
        } catch (error) {
            toast.error('Failed to save AI settings')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20">
            <header>
                <h1 className="text-3xl font-bold mb-2">Profile & Settings</h1>
                <p className="text-gray-400">Manage your account, themes, and personalized workspaces.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sidebar Nav */}
                <div className="space-y-1">
                    {['Account', 'Appearance', 'AI Intelligence', 'Notifications', 'Workspaces'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab ? 'bg-primary-600/10 text-primary-400 border-l-2 border-primary-500' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="md:col-span-2 space-y-8">
                    {/* Appearance Section */}
                    {activeTab === 'Appearance' && (
                        <section className="glass p-8 space-y-6">
                            <div className="flex items-center space-x-3 text-primary-400">
                                <Palette size={20} />
                                <h3 className="font-bold uppercase tracking-widest text-xs">Appearance</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { id: 'dark', label: 'Dark Mode', color: 'bg-black' },
                                    { id: 'light', label: 'Light Mode', color: 'bg-white' },
                                    { id: 'neon-purple', label: 'Neon Purple', color: 'bg-purple-900' },
                                    { id: 'ocean-blue', label: 'Ocean Blue', color: 'bg-blue-900' },
                                ].map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTheme(t.id as any)}
                                        className={`p-4 rounded-xl border-2 transition-all text-left ${theme === t.id ? 'border-primary-500 bg-primary-500/10' : 'border-white/5 hover:border-white/10'}`}
                                    >
                                        <div className={`w-full h-12 rounded-lg mb-3 ${t.color}`} />
                                        <span className="text-sm font-bold">{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* AI Configuration Section */}
                    {activeTab === 'AI Intelligence' && (
                        <section className="glass p-8 space-y-8">
                            <div className="flex items-center space-x-3 text-primary-400">
                                <Brain size={20} />
                                <h3 className="font-bold uppercase tracking-widest text-xs">AI Intelligence Engine</h3>
                            </div>

                            {/* Preference Toggle */}
                            <div className="flex items-center justify-between p-6 bg-primary-500/5 border border-primary-500/20 rounded-2xl">
                                <div className="space-y-1">
                                    <h4 className="font-bold text-sm">Personal AI Configuration</h4>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Toggle to use your own API keys and specific models</p>
                                </div>
                                <button
                                    onClick={() => setAiSettings({ ...aiSettings, use_custom_settings: !aiSettings.use_custom_settings })}
                                    className={`w-14 h-7 rounded-full relative transition-all duration-300 ${aiSettings.use_custom_settings ? 'bg-primary-600' : 'bg-white/10'}`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg transition-all duration-300 ${aiSettings.use_custom_settings ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>

                            {!aiSettings.use_custom_settings ? (
                                <div className="p-8 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center space-y-4 opacity-60">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                                        <Server className="text-gray-500" size={32} />
                                    </div>
                                    <div>
                                        <p className="font-bold">Using System Default Engine</p>
                                        <p className="text-xs text-gray-500 max-w-xs mx-auto text-balance">The application will use the pre-configured system models. Toggle the switch above to connect your own AI providers.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">AI Provider</label>
                                            <div className="relative">
                                                <select
                                                    value={aiSettings.provider}
                                                    onChange={(e) => setAiSettings({ ...aiSettings, provider: e.target.value })}
                                                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 outline-none focus:border-primary-500 appearance-none cursor-pointer"
                                                >
                                                    <option value="ollama" className="bg-gray-900">Ollama (Local)</option>
                                                    <option value="openai" className="bg-gray-900">OpenAI (Cloud)</option>
                                                    <option value="gemini" className="bg-gray-900">Google Gemini (Cloud)</option>
                                                    <option value="claude" className="bg-gray-900">Anthropic Claude (Cloud)</option>
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                    <Cpu size={16} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Model Name</label>
                                            <input
                                                type="text"
                                                value={aiSettings.model_name}
                                                onChange={(e) => setAiSettings({ ...aiSettings, model_name: e.target.value })}
                                                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 outline-none focus:border-primary-500 font-mono text-sm"
                                                placeholder="e.g. llama3, gpt-4, gemini-pro"
                                            />
                                        </div>
                                    </div>

                                    {aiSettings.provider !== 'ollama' && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">API Token / Key</label>
                                            <div className="relative">
                                                <input
                                                    type="password"
                                                    value={aiSettings.api_key || ''}
                                                    onChange={(e) => setAiSettings({ ...aiSettings, api_key: e.target.value })}
                                                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 pr-12 outline-none focus:border-primary-500 font-mono text-sm"
                                                    placeholder={`Paste your ${aiSettings.provider} API key here`}
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                                    <Shield size={16} />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-4 bg-primary-500/5 border border-primary-500/10 rounded-xl flex gap-3">
                                        <Settings className="text-primary-500 shrink-0" size={18} />
                                        <p className="text-[10px] text-gray-400 leading-relaxed italic">
                                            {aiSettings.provider === 'ollama'
                                                ? "Local AI runs directly on your machine. Ensure Ollama is running and the model you specified is pulled."
                                                : `Using ${aiSettings.provider} requires a valid API key. Models will be served from their respective cloud infrastructure.`}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleSaveAISettings}
                                disabled={isSaving}
                                className="w-full h-14 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-black transition-all flex items-center justify-center gap-2"
                            >
                                {isSaving ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <Save size={20} />
                                )}
                                Save Intelligence Configuration
                            </button>
                        </section>
                    )}

                    {/* Account Section */}
                    {activeTab === 'Account' && (
                        <section className="glass p-8 space-y-6">
                            <div className="flex items-center space-x-3 text-primary-400">
                                <User size={20} />
                                <h3 className="font-bold uppercase tracking-widest text-xs">Account Details</h3>
                            </div>
                            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-2xl font-black">N</div>
                                    <div>
                                        <div className="text-xl font-bold">Naveen</div>
                                        <div className="text-sm text-gray-500 font-mono">naveen@example.com</div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Notifications Section */}
                    {activeTab === 'Notifications' && (
                        <section className="glass p-8 space-y-6">
                            <div className="flex items-center space-x-3 text-primary-400">
                                <Bell size={20} />
                                <h3 className="font-bold uppercase tracking-widest text-xs">Notifications</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                    <div>
                                        <p className="font-bold text-sm">Email Notifications</p>
                                        <p className="text-[10px] text-gray-500 uppercase">Weekly progress reports and tips</p>
                                    </div>
                                    <div className="w-12 h-6 bg-primary-600/20 rounded-full relative">
                                        <div className="absolute right-1 top-1 w-4 h-4 bg-primary-500 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Workspaces Management */}
                    {activeTab === 'Workspaces' && (
                        <section className="glass p-8 space-y-6">
                            <div className="flex items-center space-x-3 text-primary-400">
                                <Shield size={20} />
                                <h3 className="font-bold uppercase tracking-widest text-xs">Manage Workspaces</h3>
                            </div>
                            <div className="space-y-4">
                                {workspaces.map(ws => (
                                    <div key={ws.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                        <div>
                                            <p className="font-bold text-sm tracking-tight">{ws.title}</p>
                                            <p className="text-[10px] text-gray-500 uppercase">{ws.difficulty} • {ws.category}</p>
                                        </div>
                                        <button
                                            onClick={() => deleteWorkspace(ws.id)}
                                            className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                {workspaces.length === 0 && <p className="text-sm text-gray-500 italic">No workspaces created yet.</p>}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    )
}
