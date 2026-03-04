import './globals.css'
import { Inter } from 'next/font/google'
import AITutor from '../components/AITutor'
import { ThemeProvider } from './context/ThemeContext'
import { WorkspaceProvider } from './context/WorkspaceContext'
import AIConfigPopup from '../components/AIConfigPopup'
import SessionExpiredModal from './components/SessionExpiredModal'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'AI Coach — Learn Anything',
    description: 'Master any topic with personalized paths, practice, and real-time feedback.',
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
