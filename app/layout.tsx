import './globals.css'
import { Inter } from 'next/font/google'
import AITutor from '../components/AITutor'
import { ThemeProvider } from './context/ThemeContext'
import { WorkspaceProvider } from './context/WorkspaceContext'
import AIConfigPopup from '../components/AIConfigPopup'
import SessionExpiredModal from './components/SessionExpiredModal'

const inter = Inter({ subsets: ['latin'] })

export const metadata: import('next').Metadata = {
    title: {
        template: '%s | AI Interview Coach',
        default: 'AI Interview Coach — Master Any Role',
    },
    description: 'Master any technical or behavioral interview with personalized learning paths, real-time AI mock interviews, and actionable feedback.',
    keywords: ['interview prep', 'AI mock interview', 'coding prep', 'system design', 'learning paths', 'tech interview'],
    authors: [{ name: 'Navin' }],
    creator: 'Navin',
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://app.navin.lol',
        title: 'AI Interview Coach — Learn Anything',
        description: 'Master any topic with personalized paths, practice, and real-time feedback from our AI.',
        siteName: 'AI Interview Coach',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'AI Interview Coach',
        description: 'Level up your interview skills with personalized AI-driven prep.',
    },
    icons: {
        icon: '/icon.png',
        shortcut: '/icon.png',
        apple: '/icon.png',
    },
}

import { Toaster } from 'react-hot-toast';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <ThemeProvider>
                    <WorkspaceProvider>
                        <Toaster position="top-right" />
                        {children}
                        <AITutor />
                        <AIConfigPopup />
                        <SessionExpiredModal />
                    </WorkspaceProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}
