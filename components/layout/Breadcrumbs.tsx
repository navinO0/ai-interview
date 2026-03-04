'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

export default function Breadcrumbs() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Don't show breadcrumbs on the main dashboard itself
    if (pathname === '/dashboard') return null;

    // Split pathname into segments, filter out empty strings
    const segments = pathname.split('/').filter(Boolean)

    // Capitalize and format segment strings
    const formatSegment = (segment: string) => {
        return segment
            .replace(/-/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase())
    }

    return (
        <nav aria-label="Breadcrumb" className="mb-6 overflow-x-auto custom-scrollbar">
            <ol className="flex items-center space-x-2 min-w-max text-sm text-gray-400">
                <li>
                    <Link href="/dashboard" className="hover:text-primary-400 transition-colors flex items-center">
                        <Home size={16} className="mr-1" />
                        <span className="hidden sm:inline">Dashboard</span>
                    </Link>
                </li>

                {segments.map((segment, index) => {
                    // Build the cumulative path for this segment
                    let href = `/${segments.slice(0, index + 1).join('/')}`

                    // The last item shouldn't be a link, but representing the current page
                    const isLast = index === segments.length - 1

                    // Treat 'learning-paths' uniquely for better UX
                    const isWorkspaces = segment.toLowerCase() === 'learning-paths'
                    const displayName = isWorkspaces ? 'Workspaces' : formatSegment(segment)

                    // If returning to workspaces, append the active workspace parameter to auto-open it
                    const workspaceId = searchParams.get('workspaceId')
                    if (isWorkspaces && workspaceId) {
                        href += `?workspaceId=${workspaceId}`
                    }

                    return (
                        <li key={segment + index} className="flex items-center space-x-2">
                            <ChevronRight size={14} className="text-gray-600" />
                            {isLast ? (
                                <span className="font-bold text-white tracking-wide" aria-current="page">
                                    {displayName}
                                </span>
                            ) : (
                                <Link href={href} className="hover:text-primary-400 transition-colors">
                                    {displayName}
                                </Link>
                            )}
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}
