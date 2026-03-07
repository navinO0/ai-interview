'use client'

import React, { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

mermaid.initialize({
    startOnLoad: true,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'Inter, sans-serif',
})

interface MermaidProps {
    chart: string
}

const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (ref.current) {
            mermaid.contentLoaded()
            // Using a unique ID for each render to avoid conflicts
            const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`
            mermaid.render(id, chart).then(({ svg }) => {
                if (ref.current) {
                    ref.current.innerHTML = svg
                }
            }).catch((err) => {
                console.error('Mermaid render error:', err)
                if (ref.current) {
                    ref.current.innerHTML = `<pre class="text-red-500 text-xs">Error rendering diagram: ${err.message}</pre>`
                }
            })
        }
    }, [chart])

    return (
        <div
            ref={ref}
            className="mermaid-container flex justify-center my-6 bg-white/5 p-6 rounded-2xl border border-white/5 overflow-x-auto"
        />
    )
}

export default Mermaid
