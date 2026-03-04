'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Save, FileText, Clock, Search, X } from 'lucide-react'
import noteService, { Note } from '../../services/noteService'
import toast from 'react-hot-toast'


const AUTO_SAVE_INTERVAL_MS = 2 * 60 * 1000 // 2 minutes

export default function NotesPage() {
    const [notes, setNotes] = useState<Note[]>([])
    const [selectedNote, setSelectedNote] = useState<Note | null>(null)
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [isDirty, setIsDirty] = useState(false)
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const filteredNotes = notes.filter(n =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase())
    )

    useEffect(() => {
        noteService.list().then(setNotes).finally(() => setLoading(false))
    }, [])

    const saveNote = useCallback(async (force = false) => {
        if (!selectedNote || (!isDirty && !force)) return
        setIsSaving(true)
        try {
            const updated = await noteService.update(selectedNote.id, { title, content })
            setNotes(prev => prev.map(n => n.id === updated.id ? updated : n))
            setSelectedNote(updated)
            setLastSaved(new Date())
            setIsDirty(false)
        } catch (err) {
            console.error('Failed to save note:', err)
        } finally {
            setIsSaving(false)
        }
    }, [selectedNote, title, content, isDirty])

    // Auto-save every 2 minutes
    useEffect(() => {
        if (autoSaveRef.current) clearInterval(autoSaveRef.current)
        autoSaveRef.current = setInterval(() => saveNote(), AUTO_SAVE_INTERVAL_MS)
        return () => { if (autoSaveRef.current) clearInterval(autoSaveRef.current) }
    }, [saveNote])

    const handleSelectNote = (note: Note) => {
        if (isDirty && selectedNote) saveNote()
        setSelectedNote(note)
        setTitle(note.title)
        setContent(note.content)
        setIsDirty(false)
        setLastSaved(null)
    }

    const handleCreateNote = async () => {
        const note = await noteService.create({ title: 'Untitled Note', content: '' })
        setNotes(prev => [note, ...prev])
        handleSelectNote(note)
    }

    const handleDeleteNote = async (id: string) => {
        toast((t) => (
            <div className="flex flex-col gap-3">
                <p className="font-bold text-sm">Delete this note permanently?</p>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            await noteService.delete(id);
                            setNotes(prev => prev.filter(n => n.id !== id));
                            if (selectedNote?.id === id) {
                                setSelectedNote(null);
                                setTitle('');
                                setContent('');
                            }
                            toast.success('Note deleted');
                        }}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold"
                    >
                        Delete
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1 bg-white/10 text-gray-400 rounded-lg text-xs font-bold"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), { duration: 5000, position: 'top-center' });
    }

    const handleChange = (field: 'title' | 'content', value: string) => {
        if (field === 'title') setTitle(value)
        else setContent(value)
        setIsDirty(true)
    }

    const formatTime = (date: Date | string) =>
        new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

    return (
        <div className="flex h-full gap-6 pb-4 overflow-hidden">
            {/* Notes Sidebar */}
            <aside className="w-72 shrink-0 flex flex-col glass rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-lg font-bold flex items-center gap-2">
                            <FileText size={18} className="text-primary-400" /> Notes
                        </h1>
                        <button
                            onClick={handleCreateNote}
                            className="w-8 h-8 bg-primary-600 hover:bg-primary-500 rounded-lg flex items-center justify-center transition-all shadow-lg shadow-primary-600/30"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search notes..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:border-primary-500 transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                    {loading && (
                        <div className="space-y-2 p-2">
                            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}
                        </div>
                    )}
                    {!loading && filteredNotes.length === 0 && (
                        <div className="text-center py-10 text-gray-500 text-sm">
                            <FileText size={32} className="mx-auto mb-2 opacity-30" />
                            No notes yet
                        </div>
                    )}
                    {filteredNotes.map(note => (
                        <div
                            key={note.id}
                            onClick={() => handleSelectNote(note)}
                            className={`group p-4 rounded-xl cursor-pointer transition-all flex items-start justify-between ${selectedNote?.id === note.id
                                ? 'bg-primary-600/20 border border-primary-500/30'
                                : 'hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm truncate mb-1">{note.title}</h3>
                                <p className="text-xs text-gray-500 truncate">{note.content.slice(0, 60) || 'Empty note...'}</p>
                                <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-600">
                                    <Clock size={10} /> {formatTime(note.updated_at)}
                                </div>
                            </div>
                            <button
                                onClick={e => { e.stopPropagation(); handleDeleteNote(note.id) }}
                                className="ml-2 p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Editor */}
            <main className="flex-1 flex flex-col glass rounded-2xl overflow-hidden">
                {selectedNote ? (
                    <>
                        {/* Toolbar */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                            <input
                                value={title}
                                onChange={e => handleChange('title', e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
                                className="flex-1 bg-transparent text-xl font-bold outline-none placeholder-gray-600 mr-4"
                                placeholder="Note title..."
                            />
                            <div className="flex items-center gap-3">
                                {lastSaved && (
                                    <span className="text-[10px] text-gray-500 font-medium">
                                        Saved {formatTime(lastSaved)}
                                    </span>
                                )}
                                {isDirty && !isSaving && (
                                    <span className="text-[10px] text-yellow-500 font-medium">Unsaved</span>
                                )}
                                <button
                                    onClick={() => saveNote(true)}
                                    disabled={isSaving || !isDirty}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-40 text-white rounded-xl font-bold text-xs transition-all"
                                >
                                    {isSaving ? (
                                        <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Save size={14} />
                                    )}
                                    Save
                                </button>
                            </div>
                        </div>

                        {/* Content area */}
                        <textarea
                            value={content}
                            onChange={e => handleChange('content', e.target.value)}
                            placeholder="Start writing... (supports markdown)"
                            className="flex-1 bg-transparent p-6 resize-none outline-none text-gray-200 text-sm leading-relaxed font-mono placeholder-gray-700"
                        />

                        {/* Status bar */}
                        <div className="px-6 py-2 border-t border-white/5 flex items-center gap-4 text-[10px] text-gray-600 font-medium">
                            <span>{content.split(/\s+/).filter(Boolean).length} words</span>
                            <span>{content.length} characters</span>
                            <span className="ml-auto">Auto-saves every 2 minutes</span>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <FileText size={36} className="text-gray-600" />
                        </div>
                        <h2 className="text-xl font-bold mb-2 text-gray-400">No Note Selected</h2>
                        <p className="text-gray-600 text-sm mb-8">Select a note from the sidebar or create a new one.</p>
                        <button
                            onClick={handleCreateNote}
                            className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-600/30"
                        >
                            <Plus size={16} /> New Note
                        </button>
                    </div>
                )}
            </main>
        </div>
    )
}
