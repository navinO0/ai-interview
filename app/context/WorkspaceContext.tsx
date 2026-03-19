'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import api from '../services/api'

export type Difficulty = 'Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Professional' | 'Expert'

export interface WorkspaceStep {
    id: string
    title: string
    description: string
    completed: boolean
    estimatedDays: number
    dayNumber?: number
    tasks?: any[] // Daily tasks
}

export interface Workspace {
    id: string
    title: string
    goal: string
    category: string
    difficulty: Difficulty
    createdAt: string
    lastAccessedAt: string
    progress: number // 0–100
    steps: WorkspaceStep[]
    notes: string
    color: string
    targetDays?: number
    status?: 'queued' | 'processing' | 'completed' | 'failed' | 'stopped'
    generationProgress?: number
    errorLog?: string
}

const COLORS = [
    'from-blue-600 to-cyan-500',
    'from-purple-600 to-violet-500',
    'from-emerald-600 to-teal-500',
    'from-orange-600 to-amber-500',
    'from-rose-600 to-pink-500',
    'from-indigo-600 to-blue-500',
]

interface WorkspaceContextValue {
    workspaces: Workspace[]
    lastWorkspace: Workspace | null
    loading: boolean
    createWorkspace: (data: { title: string; goal: string; category: string; difficulty: Difficulty; learnerLevel: string; targetDays?: number }) => Promise<Workspace>
    updateWorkspace: (id: string, updates: Partial<Workspace>) => Promise<void>
    deleteWorkspace: (id: string) => Promise<void>
    completeStep: (workspaceId: string, stepId: string) => Promise<void>
    touchWorkspace: (id: string) => Promise<void>
    refreshWorkspaces: () => Promise<void>
    retryWorkspace: (id: string) => Promise<Workspace>
}

const WorkspaceContext = createContext<WorkspaceContextValue>({
    workspaces: [],
    lastWorkspace: null,
    loading: true,
    createWorkspace: async () => ({} as Workspace),
    updateWorkspace: async () => { },
    deleteWorkspace: async () => { },
    completeStep: async () => { },
    touchWorkspace: async () => { },
    refreshWorkspaces: async () => { },
    retryWorkspace: async () => ({} as Workspace),
})

export function WorkspaceProvider({ children }: { children: ReactNode }) {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([])
    const [loading, setLoading] = useState(true)

    const mapWorkspace = (ws: any): Workspace => {
        return {
            id: ws.id,
            title: ws.title,
            goal: ws.goal,
            category: ws.category,
            difficulty: ws.difficulty,
            createdAt: ws.created_at,
            lastAccessedAt: ws.last_accessed_at,
            progress: ws.progress || 0,
            notes: ws.notes,
            color: ws.color,
            targetDays: ws.target_days,
            status: ws.status,
            generationProgress: ws.generation_progress,
            errorLog: ws.error_log,
            steps: ws.steps?.map((s: any) => {
                let parsedTasks = s.tasks;
                if (typeof parsedTasks === 'string') {
                    try {
                        parsedTasks = JSON.parse(parsedTasks);
                        if (typeof parsedTasks === 'string') {
                            parsedTasks = JSON.parse(parsedTasks); // Handle double-stringification
                        }
                    } catch (e) {
                        parsedTasks = [];
                    }
                }
                return {
                    id: s.id,
                    title: s.title,
                    description: s.description,
                    completed: s.completed,
                    estimatedDays: s.estimated_days,
                    dayNumber: s.day_number,
                    tasks: Array.isArray(parsedTasks) ? parsedTasks : []
                };
            }) || []
        };
    }

    useEffect(() => {
        const fetchWorkspaces = async () => {
            try {
                const res = await api.get('/workspaces')
                setWorkspaces(res.data.map(mapWorkspace))
            } catch (error) {
                console.error('Fetch workspaces error:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchWorkspaces()
    }, [])

    // Smart Polling: Automatically poll when workspaces are processing or queued
    useEffect(() => {
        const needsPolling = workspaces.some(ws => ws.status === 'processing' || ws.status === 'queued')

        if (!needsPolling) return

        const intervalId = setInterval(async () => {
            try {
                const res = await api.get('/workspaces')
                const updatedWorkspaces = res.data.map(mapWorkspace)
                
                // Only update state if there's actual changes to avoid unnecessary re-renders
                // but for simplicity here we just update if statuses or progress changed
                setWorkspaces(updatedWorkspaces)
                
                // If all reach terminal state, interval will be cleared on next effect run
            } catch (error) {
                console.error('Polling workspaces error:', error)
            }
        }, 5000)

        return () => clearInterval(intervalId)
    }, [workspaces])


    async function createWorkspace({ title, goal, category, difficulty, learnerLevel, targetDays }: { title: string; goal: string; category: string; difficulty: Difficulty; learnerLevel: string; targetDays?: number }): Promise<Workspace> {
        const color = COLORS[Math.floor(Math.random() * COLORS.length)]
        const res = await api.post('/workspaces', { title, goal, category, difficulty, color, learnerLevel, targetDays })
        const ws = mapWorkspace(res.data)
        setWorkspaces([ws, ...workspaces])
        return ws
    }

    async function updateWorkspace(id: string, updates: Partial<Workspace>) {
        const res = await api.patch(`/workspaces/${id}`, updates)
        const data = res.data
        setWorkspaces(workspaces.map(w => w.id === id ? mapWorkspace(data) : w))
    }

    async function deleteWorkspace(id: string) {
        await api.delete(`/workspaces/${id}`)
        setWorkspaces(workspaces.filter(w => w.id !== id))
    }

    async function completeStep(workspaceId: string, stepId: string) {
        const res = await api.post(`/workspaces/${workspaceId}/complete-step`, { stepId })
        const data = res.data
        setWorkspaces(workspaces.map(w => w.id === workspaceId ? mapWorkspace(data) : w))
    }

    async function touchWorkspace(id: string) {
        await api.post(`/workspaces/${id}/touch`)
    }

    const lastWorkspace = [...workspaces].sort(
        (a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime()
    )[0] ?? null

    const retryWorkspace = async (id: string): Promise<Workspace> => {
        const res = await api.post(`/workspaces/${id}/retry`)
        const data = mapWorkspace(res.data)
        setWorkspaces(workspaces.map(w => w.id === id ? data : w))
        return data
    }
    const refreshWorkspaces = async () => {
        try {
            const res = await api.get('/workspaces')
            setWorkspaces(res.data.map(mapWorkspace))
        } catch (error) {
            console.error('Refresh workspaces error:', error)
        }
    }

    return (
        <WorkspaceContext.Provider value={{ workspaces, lastWorkspace, loading, createWorkspace, updateWorkspace, deleteWorkspace, completeStep, touchWorkspace, refreshWorkspaces, retryWorkspace }}>
            {children}
        </WorkspaceContext.Provider>
    )
}

export const useWorkspaces = () => useContext(WorkspaceContext)
