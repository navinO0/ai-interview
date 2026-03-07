'use client'

import { useState, Suspense } from 'react'
import { LayoutDashboard, FileText, Play, Library, Terminal as Code, Target, Map, Settings, LogOut, MessageSquare, Sun, Moon, Palette, Menu, X, PenLine } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme, Theme } from '../context/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'
import Cookies from 'js-cookie'

import Breadcrumbs from '../../components/layout/Breadcrumbs'

const sidebarItems = [
    { icon: Target, label: 'Workspaces', href: '/learning-paths' },
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: FileText, label: 'Resume Analyzer', href: '/resume' },
    { icon: Play, label: 'Interview Prep', href: '/interview' },
    { icon: MessageSquare, label: 'MCQ Practice', href: '/practice/mcq' },
    { icon: Code, label: 'Practice DSA', href: '/practice/dsa' },
    { icon: PenLine, label: 'Notes', href: '/notes' },
    { icon: Library, label: 'Knowledge Base', href: '/content' },
]

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()
    const { theme, setTheme } = useTheme()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const themes: { id: Theme; icon: any; label: string }[] = [
        { id: 'dark', icon: Moon, label: 'Dark' },
        { id: 'light', icon: Sun, label: 'Light' },
        { id: 'neon-purple', icon: Palette, label: 'Neon' },
        { id: 'ocean-blue', icon: Palette, label: 'Ocean' },
    ]

    const toggleTheme = () => {
        const nextIdx = (themes.findIndex(t => t.id === theme) + 1) % themes.length
        setTheme(themes[nextIdx].id)
    }

    const closeSidebar = () => setIsSidebarOpen(false)

    const handleLogout = () => {
        // Clear both cookie (read by middleware) and localStorage (client fallback)
        Cookies.remove('token')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
    }

    return (
        <div className="flex h-screen overflow-hidden flex-col md:flex-row relative" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

            {/* Mobile Header */}
            <header className="md:hidden flex items-center justify-between p-4 border-b border-white/10 glass m-2 rounded-xl z-20">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-primary-600/30">A</div>
                        <span className="font-bold text-sm tracking-tight uppercase">AI Coach</span>
                    </div>
                </div>
                <button onClick={toggleTheme} className="p-2 text-gray-400 hover:text-white transition-colors">
                    {theme === 'light' ? <Sun size={20} /> : theme === 'dark' ? <Moon size={20} /> : <Palette size={20} />}
                </button>
            </header>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeSidebar}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-72 glass border-r border-white/10 z-50 md:hidden flex flex-col shadow-2xl"
                        >
                            <div className="p-6 flex items-center justify-between border-b border-white/5">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-primary-600/30">A</div>
                                    <span className="font-bold text-xl tracking-tight">AI COACH</span>
                                </div>
                                <button onClick={closeSidebar} className="p-2 text-gray-500 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 py-8">
                                <nav className="space-y-1.5">
                                    {sidebarItems.map((item) => {
                                        const isActive = pathname === item.href
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={closeSidebar}
                                                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${isActive
                                                    ? 'bg-primary-600/20 text-primary-400 shadow-inner border border-primary-500/20'
                                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                    }`}
                                            >
                                                <item.icon size={20} />
                                                <span className="font-medium">{item.label}</span>
                                            </Link>
                                        )
                                    })}
                                </nav>
                            </div>

                            <div className="p-6 border-t border-white/5 space-y-1 bg-black/20">
                                <button
                                    onClick={toggleTheme}
                                    className="w-full flex items-center space-x-3 text-gray-400 hover:text-white px-4 py-3 rounded-xl hover:bg-white/5 transition-all"
                                >
                                    {theme === 'light' ? <Sun size={20} /> : theme === 'dark' ? <Moon size={20} /> : <Palette size={20} />}
                                    <span className="font-medium capitalize">{theme.replace('-', ' ')} Theme</span>
                                </button>
                                <Link onClick={closeSidebar} href="/settings" className="flex items-center space-x-3 text-gray-400 hover:text-white px-4 py-3 rounded-xl hover:bg-white/5 transition-all">
                                    <Settings size={20} />
                                    <span className="font-medium">Settings</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center space-x-3 text-red-400/80 hover:text-red-400 px-4 py-3 rounded-xl hover:bg-red-400/5 transition-all"
                                >
                                    <LogOut size={20} />
                                    <span className="font-medium">Logout</span>
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <aside className="w-64 border-r border-white/10 glass hidden md:flex flex-col m-4 rounded-2xl shrink-0 overflow-hidden">
                <div className="p-8 flex-1 overflow-y-auto">
                    <div className="flex items-center space-x-3 mb-12">
                        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-primary-600/30">A</div>
                        <span className="font-bold text-xl tracking-tight uppercase">AI COACH</span>
                    </div>

                    <nav className="space-y-1.5">
                        {sidebarItems.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${isActive
                                        ? 'bg-primary-600/20 text-primary-400 shadow-inner border border-primary-500/20'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <item.icon size={20} />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                <div className="p-6 border-t border-white/5 space-y-1">
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center space-x-3 text-gray-400 hover:text-white px-4 py-3 rounded-xl hover:bg-white/5 transition-all"
                    >
                        {theme === 'light' ? <Sun size={20} /> : theme === 'dark' ? <Moon size={20} /> : <Palette size={20} />}
                        <span className="font-medium capitalize">{theme.replace('-', ' ')} Theme</span>
                    </button>
                    <Link href="/settings" className="flex items-center space-x-3 text-gray-400 hover:text-white px-4 py-3 rounded-xl hover:bg-white/5 transition-all">
                        <Settings size={20} />
                        <span className="font-medium">Settings</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 text-red-400/80 hover:text-red-400 px-4 py-3 rounded-xl hover:bg-red-400/5 transition-all"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto p-3 md:p-8">
                <div className="max-w-6xl mx-auto h-full flex flex-col pt-4 md:pt-0">
                    <Suspense fallback={null}>
                        <Breadcrumbs />
                    </Suspense>
                    {children}
                </div>
            </main>
        </div>
    )
}


