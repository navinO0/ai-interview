import './globals.css'
import { Inter } from 'next/font/google'
import AITutor from '../components/AITutor'
import { ThemeProvider } from './context/ThemeContext'
import { SocketProvider } from './context/SocketContext'
import { WorkspaceProvider } from './context/WorkspaceContext'
import AIConfigPopup from '../components/AIConfigPopup'
import SessionExpiredModal from './components/SessionExpiredModal'
import GlobalLoader from './components/GlobalLoader'

const inter = Inter({ subsets: ['latin'] })

export const metadata: import('next').Metadata = {
    metadataBase: new URL('http://localhost:3000'),
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
import PageWrapper from './components/PageWrapper'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <ThemeProvider>
                    <SocketProvider>
                        <WorkspaceProvider>
                            <Toaster position="top-right" />
                            <PageWrapper>
                                {children}
                            </PageWrapper>
                            <AITutor />
                            <AIConfigPopup />
                            <SessionExpiredModal />
                            <GlobalLoader />
                        </WorkspaceProvider>
                    </SocketProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}
