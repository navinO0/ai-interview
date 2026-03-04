'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, ExternalLink, BookOpen, Image as ImageIcon, StickyNote } from 'lucide-react'
import contentService from '../../services/contentService'
import searchService from '../../services/searchService'

export default function ContentPage() {
    const [topic, setTopic] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [suggestions, setSuggestions] = useState<any>(null)
    const [searchResults, setSearchResults] = useState<any[] | null>(null)
    const [mode, setMode] = useState<'ai' | 'web'>('ai')
    const [error, setError] = useState<string | null>(null)

    const handleCurate = async () => {
        if (!topic.trim()) return;
        setIsSearching(true)
        setError(null)
        setMode('ai')
        try {
            const data = await contentService.getSuggestions(topic)
            setSuggestions(data)
            setSearchResults(null)
        } catch (err: any) {
            setError(err.message || 'Failed to fetch suggestions')
            console.error(err)
        } finally {
            setIsSearching(false)
        }
    }

    const handleWebSearch = async () => {
        if (!topic.trim()) return;
        setIsSearching(true)
        setError(null)
        setMode('web')
        try {
            const results = await searchService.search(topic)
            setSearchResults(results)
            setSuggestions(null)
        } catch (err: any) {
            setError(err.message || 'Failed to perform web search')
            console.error(err)
        } finally {
            setIsSearching(false)
        }
    }

    return (
        <div className="space-y-8 pb-12">
            <header>
                <h1 className="text-3xl font-bold mb-2">Knowledge Base</h1>
                <p className="text-gray-400">AI-curated resources tailored to your interview performance.</p>
            </header>

            <div className="flex space-x-4">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-500 transition-colors" size={20} />
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (mode === 'ai' ? handleCurate() : handleWebSearch())}
                        placeholder="Search a topic (e.g. Redis Cluster, Database Sharding...)"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary-500 transition-all text-lg"
                    />
                </div>
                <button
                    onClick={handleCurate}
                    disabled={isSearching}
                    className={`px-8 rounded-2xl font-bold transition-all disabled:opacity-50 ${mode === 'ai' && suggestions ? 'bg-primary-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                >
                    AI Curate
                </button>
                <button
                    onClick={handleWebSearch}
                    disabled={isSearching}
                    className={`px-8 rounded-2xl font-bold transition-all disabled:opacity-50 ${mode === 'web' && searchResults ? 'bg-primary-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                >
                    Web Search
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-sm flex items-center">
                    <span className="mr-2">⚠️</span> {error}
                </div>
            )}

            {!suggestions && !searchResults && !isSearching && (
                <div className="py-24 text-center glass border-dashed">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
                        <Search size={32} />
                    </div>
                    <p className="text-gray-400">Enter a topic above to generate study materials or search the web.</p>
                </div>
            )}

            {isSearching && (
                <div className="py-24 flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-medium animate-pulse">{mode === 'ai' ? 'Scanning high-quality resources...' : 'Searching the web for latest info...'}</p>
                </div>
            )}

            {(suggestions || searchResults) && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                    {/* Blogs / Search Results */}
                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-xl font-bold flex items-center">
                            <BookOpen className="mr-2 text-primary-500" size={20} />
                            {mode === 'ai' ? 'Recommended Technical Articles' : 'Web Search Results'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {mode === 'ai' ? suggestions.blogs.map((blog: any, i: number) => (
                                <div key={i} className="glass p-6 group hover:border-primary-500/50 transition-colors cursor-pointer">
                                    <h4 className="font-bold mb-3 group-hover:text-primary-400 transition-colors flex items-start justify-between">
                                        <span className="line-clamp-2">{blog.title}</span>
                                        <ExternalLink size={14} className="mt-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </h4>
                                    <p className="text-sm text-gray-400 line-clamp-3">{blog.summary}</p>
                                </div>
                            )) : searchResults?.map((result: any, i: number) => (
                                <a key={i} href={result.url} target="_blank" rel="noopener noreferrer" className="glass p-6 group hover:border-primary-500/50 transition-colors">
                                    <h4 className="font-bold mb-3 group-hover:text-primary-400 transition-colors flex items-start justify-between">
                                        <span className="line-clamp-2">{result.title}</span>
                                        <ExternalLink size={14} className="mt-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </h4>
                                    <p className="text-sm text-gray-400 line-clamp-3">{result.content}</p>
                                </a>
                            ))}
                        </div>

                        {/* Visuals - Only for AI mode */}
                        {mode === 'ai' && suggestions && (
                            <>
                                <h3 className="text-xl font-bold flex items-center mt-12">
                                    <ImageIcon className="mr-2 text-primary-500" size={20} />
                                    Diagrams & Visualizations
                                </h3>
                                <div className="glass overflow-hidden group">
                                    <div className="aspect-video bg-white/5 flex items-center justify-center relative overflow-hidden">
                                        <img
                                            src={suggestions.images[0].image_url}
                                            alt={suggestions.images[0].title}
                                            className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center flex-col p-8 text-center bg-black/40">
                                            <h4 className="text-xl font-bold mb-2">{suggestions.images[0].title}</h4>
                                            <p className="text-sm text-gray-300">{suggestions.images[0].description}</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Quick Notes */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold flex items-center">
                            <StickyNote className="mr-2 text-primary-500" size={20} />
                            Key Takeaways
                        </h3>
                        <div className="glass p-8 bg-primary-600/5">
                            <ul className="space-y-6">
                                {mode === 'ai' ? suggestions.notes.map((note: string, i: number) => (
                                    <li key={i} className="flex space-x-3 text-sm">
                                        <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 shrink-0" />
                                        <span className="text-gray-300 leading-relaxed">{note}</span>
                                    </li>
                                )) : (
                                    <li className="text-sm text-gray-400 italic">
                                        Switch to AI Curate to generate formatted study notes for this topic.
                                    </li>
                                )}
                            </ul>
                            <button className="w-full mt-8 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                                {mode === 'ai' ? 'Save to Study Plan' : 'Generate Full Notes'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    )
}
