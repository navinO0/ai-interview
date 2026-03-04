import config from '../app/config';

export interface StreamHandlers {
    onChunk: (text: string) => void;
    onDone?: () => void;
    onError?: (error: string) => void;
}

class AIService {
    async streamExplanation(code: string, language: string, handlers: StreamHandlers) {
        return this.fetchStream('/ai/explain', { code, language }, handlers);
    }

    async streamChallenge(difficulty: string, topic: string, handlers: StreamHandlers) {
        return this.fetchStream('/ai/challenge', { difficulty, topic }, handlers);
    }

    private async fetchStream(path: string, body: object, handlers: StreamHandlers) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${config.apiUrl}${path}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) throw new Error('Failed to start stream');

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No readable stream');

            const decoder = new TextDecoder();
            let fullText = '';
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed) continue;

                    if (trimmed.startsWith('data: ')) {
                        const content = trimmed.slice(6);

                        if (content === '[DONE]') {
                            handlers.onDone?.();
                            return;
                        }

                        try {
                            const data = JSON.parse(content);
                            if (data.response) {
                                fullText += data.response;
                                handlers.onChunk(fullText);
                            }
                            if (data.done) {
                                handlers.onDone?.();
                            }
                        } catch (e) {
                            // Skip invalid JSON or partials that will be handled by buffer
                            console.debug('Partial JSON or parse error:', e);
                        }
                    }
                }
            }

        } catch (error: any) {
            console.error('AI Stream Error:', error);
            handlers.onError?.(error.message);
        }
    }
}

export default new AIService();
