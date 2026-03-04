'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type Theme = 'dark' | 'light' | 'neon-purple' | 'ocean-blue'

const themeVars: Record<Theme, Record<string, string>> = {
    dark: {
        '--bg-primary': '#000000',
        '--bg-secondary': '#0a0a0a',
        '--bg-glass': 'rgba(255,255,255,0.05)',
        '--bg-glass-hover': 'rgba(255,255,255,0.10)',
        '--border-color': 'rgba(255,255,255,0.10)',
        '--text-primary': '#ffffff',
        '--text-secondary': '#9ca3af',
        '--accent-primary': '#0ea5e9',
        '--accent-secondary': '#0284c7',
        '--accent-glow': 'rgba(14,165,233,0.2)',
    },
    light: {
        '--bg-primary': '#f8fafc',
        '--bg-secondary': '#ffffff',
        '--bg-glass': 'rgba(0,0,0,0.04)',
        '--bg-glass-hover': 'rgba(0,0,0,0.08)',
        '--border-color': 'rgba(0,0,0,0.10)',
        '--text-primary': '#0f172a',
        '--text-secondary': '#475569',
        '--accent-primary': '#0ea5e9',
        '--accent-secondary': '#0284c7',
        '--accent-glow': 'rgba(14,165,233,0.15)',
    },
    'neon-purple': {
        '--bg-primary': '#0d0015',
        '--bg-secondary': '#130020',
        '--bg-glass': 'rgba(180,0,255,0.07)',
        '--bg-glass-hover': 'rgba(180,0,255,0.15)',
        '--border-color': 'rgba(180,0,255,0.20)',
        '--text-primary': '#f3e8ff',
        '--text-secondary': '#c084fc',
        '--accent-primary': '#a855f7',
        '--accent-secondary': '#9333ea',
        '--accent-glow': 'rgba(168,85,247,0.25)',
    },
    'ocean-blue': {
        '--bg-primary': '#001018',
        '--bg-secondary': '#001824',
        '--bg-glass': 'rgba(0,180,255,0.06)',
        '--bg-glass-hover': 'rgba(0,180,255,0.12)',
        '--border-color': 'rgba(0,180,255,0.18)',
        '--text-primary': '#e0f7ff',
        '--text-secondary': '#67e8f9',
        '--accent-primary': '#06b6d4',
        '--accent-secondary': '#0891b2',
        '--accent-glow': 'rgba(6,182,212,0.25)',
    },
}

interface ThemeContextValue {
    theme: Theme
    setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({ theme: 'dark', setTheme: () => { } })

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('dark')

    useEffect(() => {
        const saved = (localStorage.getItem('app-theme') as Theme) || 'dark'
        applyTheme(saved)
        setThemeState(saved)
    }, [])

    function applyTheme(t: Theme) {
        const root = document.documentElement
        Object.entries(themeVars[t]).forEach(([k, v]) => root.style.setProperty(k, v))
        root.setAttribute('data-theme', t)
    }

    function setTheme(t: Theme) {
        localStorage.setItem('app-theme', t)
        applyTheme(t)
        setThemeState(t)
    }

    return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
