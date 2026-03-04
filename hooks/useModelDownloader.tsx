'use client'

import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'

export function useModelDownloader() {
    const [isDownloading, setIsDownloading] = useState(false)
    const [progress, setProgress] = useState(0)

    const downloadModel = useCallback((modelName: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            setIsDownloading(true)
            setProgress(0)

            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const url = `${baseUrl}/api/ai-settings/pull-stream?modelName=${modelName}${token ? `&token=${token}` : ''}`;

            const toastId = toast.loading((t) => (
                <div className="flex flex-col gap-2 min-w-[250px]">
                    <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-primary-400">Installing {modelName}...</span>
                        <span className="text-gray-500 font-mono text-xs">0%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary-500 transition-all duration-300"
                            style={{ width: `0%` }}
                        />
                    </div>
                </div>
            ), { duration: Infinity, position: 'bottom-right' })

            const eventSource = new EventSource(url)

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)

                    if (data.status === 'downloading' && data.total > 0) {
                        const percent = Math.round((data.completed / data.total) * 100)
                        setProgress(percent)

                        // Update toast content dynamically
                        toast.loading((t) => (
                            <div className="flex flex-col gap-2 min-w-[250px]">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-primary-400">Installing {modelName}...</span>
                                    <span className="text-gray-500 font-mono text-xs">{percent}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary-500 transition-all duration-300"
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                            </div>
                        ), { id: toastId })
                    }

                    // Ollama sometimes sends "success" or similar when done
                    if (data.status === 'success' || event.data.includes('"status":"success"')) {
                        eventSource.close()
                        setIsDownloading(false)
                        toast.success(`${modelName} installed successfully!`, { id: toastId })
                        resolve()
                    }

                    if (data.error) {
                        throw new Error(data.error)
                    }
                } catch (e: any) {
                    eventSource.close()
                    setIsDownloading(false)
                    toast.error(`Installation failed: ${e.message}`, { id: toastId })
                    reject(e)
                }
            }

            eventSource.onerror = (err) => {
                eventSource.close()
                setIsDownloading(false)
                toast.error('Connection lost during installation.', { id: toastId })
                reject(err)
            }
        })
    }, [])

    return { downloadModel, isDownloading, progress }
}
