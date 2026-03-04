'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, RotateCcw, Share2, Save, Terminal as TerminalIcon, Code, ChevronDown, Sparkles, Wand2, BookOpen, X, Info } from 'lucide-react'
import { Difficulty } from '../../context/WorkspaceContext'
import aiService from '../../services/aiService'
import practiceService from '../../services/practiceService'
import toast from 'react-hot-toast'

type Language = 'javascript' | 'typescript' | 'python' | 'java' | 'cpp' | 'go' | 'rust' | 'sql' | 'html'

const templates: Record<Language, string> = {
    javascript: '// Node.js Sandbox\nfunction solve() {\n  console.log("Hello Coach!");\n}\nsolve();',
    typescript: '// TypeScript Engine\nconst greeting: string = "Hello Coach!";\nconsole.log(greeting);',
    python: '# Python 3.11\ndef main():\n    print("Hello Coach!")\n\nif __name__ == "__main__":\n    main()',
    java: '// Java Standard\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello Coach!");\n    }\n}',
    cpp: '// C++ 17\n#include <iostream>\nint main() {\n    std::cout << "Hello Coach!" << std::endl;\n    return 0;\n}',
    go: '// Go Runtime\npackage main\nimport "fmt"\nfunc main() {\n    fmt.Println("Hello Coach!")\n}',
    rust: '// Rust Catalyst\nfn main() {\n    println!("Hello Coach!");\n}',
    sql: '-- SQL Playground\nSELECT * FROM users WHERE active = true;',
    html: '<!-- HTML/CSS Sandbox -->\n<div class="glass">\n  <h1>Hello Coach!</h1>\n</div>'
}

export default function PlaygroundPage() {
    const [language, setLanguage] = useState<Language>('javascript')
    const [difficulty, setDifficulty] = useState<Difficulty>('Medium')
    const [code, setCode] = useState(templates.javascript)
    const [output, setOutput] = useState('')
    const [isRunning, setIsRunning] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [showExplain, setShowExplain] = useState(false)
    const [aiExplanation, setAiExplanation] = useState('')
    const [isExplaining, setIsExplaining] = useState(false)
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [isGettingSuggestions, setIsGettingSuggestions] = useState(false)
    const [analysis, setAnalysis] = useState('')

    const handleRun = async () => {
        if (!code.trim()) {
            setOutput('Error: Editor is empty.')
            return
        }
        setIsRunning(true)
        setOutput('Waking up AI compiler engine...\n')

        try {
            // @ts-ignore
            const result = await practiceService.api.post('/practice/playground/analyze', { code, language });
            setOutput(`${result.data.output}\n\n--- Analysis ---\n${result.data.analysis}`);
            setAnalysis(result.data.analysis);
            if (result.data.suggestions) {
                setSuggestions(result.data.suggestions);
            }
        } catch (error: any) {
            console.error('Run failed:', error);
            setOutput(`Error: ${error.response?.data?.error || error.message}`);
            toast.error('Simulation engine failed.');
        } finally {
            setIsRunning(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const pairs: Record<string, string> = { '(': ')', '{': '}', '[': ']', '"': '"', "'": "'" };
        if (pairs[e.key]) {
            e.preventDefault();
            const start = e.currentTarget.selectionStart;
            const end = e.currentTarget.selectionEnd;
            const val = e.currentTarget.value;
            const newVal = val.substring(0, start) + e.key + pairs[e.key] + val.substring(end);
            setCode(newVal);
            setTimeout(() => {
                const el = e.currentTarget;
                if (el) el.setSelectionRange(start + 1, start + 1);
            }, 0);
        }
    };

    const getAiSuggestions = async () => {
        setIsGettingSuggestions(true);
        try {
            // @ts-ignore
            const result = await practiceService.api.post('/practice/playground/suggestions', { code, language });
            setSuggestions(result.data.suggestions);
            toast.success('Suggestions updated!');
        } catch (error) {
            toast.error('Failed to get suggestions.');
        } finally {
            setIsGettingSuggestions(false);
        }
    };

    const handleLanguageChange = (l: Language) => {
        setLanguage(l)
        setCode(templates[l])
        setOutput('')
    }

    const generateChallenge = () => {
        setIsGenerating(true)
        setOutput(`Generating a ${difficulty} difficulty ${language} challenge...`)
        setTimeout(() => {
            setIsGenerating(false)
            const challenge = `/* \n CHALLENGE: ${difficulty} Level\n Solve a problem involving logical reasoning in ${language}.\n*/\n\n`
            setCode(challenge + templates[language])
            setOutput('Challenge generated! Happy coding.')
        }, 1500)
    }

    return (
        <div className="h-full flex flex-col space-y-6 pb-12 relative overflow-hidden">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-1 font-heading">Code Playground</h1>
                    <p className="text-gray-400 text-sm">Experimental sandbox for cross-language prototyping.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="relative group">
                        <select
                            value={language}
                            onChange={(e) => handleLanguageChange(e.target.value as Language)}
                            className="appearance-none glass px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest outline-none pr-10 cursor-pointer hover:bg-white/5 transition-all text-primary-400 border-primary-500/20"
                        >
                            {Object.keys(templates).map(lang => (
                                <option key={lang} value={lang} className="bg-[#111] text-white capitalize">{lang}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
                    </div>

                    {/* Difficulty Selector */}
                    <div className="relative group">
                        <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                            className="appearance-none glass px-4 py-2.5 text-xs font-bold uppercase tracking-widest outline-none pr-10 cursor-pointer hover:bg-white/5 transition-all text-gray-400"
                        >
                            {['Beginner', 'Easy', 'Medium', 'Hard', 'Professional'].map(d => (
                                <option key={d} value={d} className="bg-black text-white">{d}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
                    </div>

                    <button
                        onClick={generateChallenge}
                        disabled={isGenerating}
                        className="glass px-4 py-2.5 text-primary-400 hover:text-white transition-all flex items-center space-x-2 border-primary-500/20"
                    >
                        <Wand2 size={16} className={isGenerating ? 'animate-spin' : ''} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Generate</span>
                    </button>

                    <button
                        onClick={handleRun}
                        disabled={isRunning}
                        className="bg-primary-600 px-6 py-2.5 rounded-xl font-bold text-sm flex items-center space-x-2 hover:bg-primary-500 transition-all shadow-lg shadow-primary-600/30 text-white"
                    >
                        <Play size={18} fill="currentColor" />
                        <span>{isRunning ? 'Running' : 'Run'}</span>
                    </button>

                    <button
                        onClick={() => {
                            if (!showExplain) {
                                setShowExplain(true);
                                setAiExplanation('Analyzing code...');
                                setIsExplaining(true);
                                aiService.streamExplain(code, language, {
                                    onMessage: (text) => setAiExplanation(text),
                                    onDone: () => setIsExplaining(false),
                                    onError: (err) => {
                                        setAiExplanation(`Error: ${err}`);
                                        setIsExplaining(false);
                                    }
                                });
                            } else {
                                setShowExplain(false);
                            }
                        }}
                        className={`p-2.5 rounded-xl transition-all ${showExplain ? 'bg-primary-600 text-white' : 'glass text-gray-400 hover:text-white'}`}
                    >
                        <Info size={18} />
                    </button>
                </div>
            </header>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[550px]">
                {/* Editor Area */}
                <div className="lg:col-span-3 flex flex-col glass overflow-hidden border-white/5 bg-[#0a0a0a]">
                    <div className="bg-white/5 px-4 py-3 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Code size={14} className="text-primary-400" />
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">main.{language === 'javascript' ? 'js' : language === 'typescript' ? 'ts' : language === 'python' ? 'py' : language}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button onClick={() => setCode(templates[language])} className="text-gray-500 hover:text-white transition-colors" title="Reset Code"><RotateCcw size={14} /></button>
                            <button className="text-gray-500 hover:text-white transition-colors" title="Save Session"><Save size={14} /></button>
                        </div>
                    </div>
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-transparent p-6 font-mono text-sm resize-none focus:outline-none text-gray-300 leading-relaxed CustomScrollbar selection:bg-primary-500/30"
                        spellCheck={false}
                    />
                </div>

                {/* Output Area */}
                <div className="lg:col-span-2 flex flex-col space-y-6">
                    <div className="flex-1 glass flex flex-col overflow-hidden bg-black/40 border-white/5">
                        <div className="bg-white/5 px-4 py-3 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <TerminalIcon size={14} className="text-gray-500" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">Terminal Output</span>
                            </div>
                        </div>
                        <pre className="flex-1 p-6 font-mono text-xs text-green-400/90 overflow-y-auto whitespace-pre-wrap selection:bg-green-500/20">
                            {output || 'System ready. Enter code and click "Run"...'}
                        </pre>
                    </div>

                    <div className="glass p-6 space-y-4 border-primary-500/10 bg-primary-600/5 backdrop-blur-sm">
                        <div className="flex items-center space-x-2 text-primary-400">
                            <Sparkles size={16} />
                            <h3 className="font-bold text-[10px] uppercase tracking-widest">Environment Status</h3>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-500 uppercase font-bold">Runtime</span>
                            <span className="text-[10px] text-primary-400 font-bold uppercase">{language} v1.4.2</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-500 uppercase font-bold">Allocated RAM</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase">512MB / 1GB</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Explain Sidebar */}
            <AnimatePresence>
                {showExplain && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowExplain(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 w-full max-w-md h-screen bg-[#0a0a0a] border-l border-white/10 p-8 z-50 overflow-y-auto shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-primary-600/20 rounded-lg text-primary-400">
                                        <Sparkles size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold">AI Explain</h2>
                                </div>
                                <button onClick={() => setShowExplain(false)} className="text-gray-500 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-8">
                                <section className="space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-primary-400">Logic Flow</h3>
                                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4 leading-relaxed text-sm text-gray-300 font-medium overflow-hidden">
                                        {aiExplanation || 'Select code to see an AI-powered walkthrough.'}
                                        {isExplaining && <span className="inline-block w-1.5 h-4 bg-primary-500 ml-1 animate-pulse align-middle" />}
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-primary-400">Time Complexity</h3>
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                        <span className="text-sm font-bold">Big O Notation</span>
                                        <span className="text-sm text-primary-400 font-black">O(n)</span>
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-primary-400">AI Suggestions</h3>
                                        <button
                                            onClick={getAiSuggestions}
                                            disabled={isGettingSuggestions}
                                            className="text-[10px] font-bold text-primary-500 hover:underline disabled:opacity-50"
                                        >
                                            {isGettingSuggestions ? 'Refreshing...' : 'Refresh'}
                                        </button>
                                    </div>
                                    <ul className="space-y-3">
                                        {(suggestions.length > 0 ? suggestions : [
                                            'Consider using async/await for I/O operations.',
                                            'Implement error boundaries for edge case protection.',
                                            'Check for variable shadowing in inner loops.'
                                        ]).map((tip, i) => (
                                            <li key={i} className="flex items-start space-x-3 text-sm text-gray-400 bg-white/5 p-4 rounded-xl border border-white/5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 shrink-0" />
                                                <span>{tip}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
