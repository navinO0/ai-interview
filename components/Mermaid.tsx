import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Loader2 } from 'lucide-react';

mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
        primaryColor: '#0ea5e9', // primary-500
        primaryTextColor: '#fff',
        primaryBorderColor: '#0284c7', // primary-600
        lineColor: '#6366f1', // accent-secondary
        secondaryColor: '#f43f5e',
        tertiaryColor: '#10b981',
        background: 'transparent',
    },
    securityLevel: 'loose',
});

interface MermaidProps {
    chart: string;
}

export const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [svgContent, setSvgContent] = useState<string>('');
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        const renderChart = async () => {
            if (!chart || !containerRef.current) return;
            try {
                mermaid.mermaidAPI.reset();
                const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                const { svg } = await mermaid.render(id, chart);
                setSvgContent(svg);
                setError(false);
            } catch (err) {
                console.error("Mermaid parsing error:", err);
                setError(true);
            }
        };

        renderChart();
    }, [chart]);

    if (error) {
        return (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-mono overflow-auto">
                <p className="font-bold mb-2">Diagram Rendering Error</p>
                <pre>{chart}</pre>
            </div>
        );
    }

    if (!svgContent) {
        return (
            <div className="h-48 flex items-center justify-center bg-black/20 rounded-xl border border-white/5">
                <Loader2 className="animate-spin text-primary-500" size={24} />
            </div>
        );
    }

    return (
        <div
            className="mermaid-container overflow-x-auto my-6 p-4 bg-white/5 rounded-2xl border border-white/10 flex justify-center"
            dangerouslySetInnerHTML={{ __html: svgContent }}
        />
    );
};
