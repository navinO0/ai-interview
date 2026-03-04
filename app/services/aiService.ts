import config from '../config';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

export interface StreamCallbacks {
    onMessage: (content: string) => void;
    onDone: () => void;
    onError: (error: string) => void;
}

const aiService = {
    async streamExplain(code: string, language: string, callbacks: StreamCallbacks) {
        try {
            const response = await fetch(`${config.apiUrl}/ai/explain`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('token')}`
                },
                body: JSON.stringify({ code, language })
            });

            if (!response.ok) throw new Error('Failed to start stream');

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) throw new Error('No reader available');

            let buffer = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;

                const lines = buffer.split('\n\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.replace('data: ', '').trim();
                        if (dataStr === '[DONE]') {
                            callbacks.onDone();
                            return;
                        }

                        try {
                            const json = JSON.parse(dataStr);
                            if (json.response) {
                                callbacks.onMessage(json.response);
                            }
                            if (json.done) {
                                callbacks.onDone();
                                return;
                            }
                        } catch (e) {
                            // If it's not JSON, might be raw text chunk
                            console.warn('Failed to parse AI stream chunk:', dataStr);
                        }
                    }
                }
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            toast.error(`AI Error: ${message}`);
            callbacks.onError(message);
        }
    },

    async streamChallenge(topic: string, difficulty: string, callbacks: StreamCallbacks) {
        try {
            const response = await fetch(`${config.apiUrl}/ai/challenge`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('token')}`
                },
                body: JSON.stringify({ topic, difficulty })
            });

            if (!response.ok) throw new Error('Failed to start stream');

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) throw new Error('No reader available');

            let buffer = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;

                const lines = buffer.split('\n\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.replace('data: ', '').trim();
                        if (dataStr === '[DONE]') {
                            callbacks.onDone();
                            return;
                        }

                        try {
                            const json = JSON.parse(dataStr);
                            if (json.response) {
                                callbacks.onMessage(json.response);
                            }
                            if (json.done) {
                                callbacks.onDone();
                                return;
                            }
                        } catch (e) {
                            console.warn('Failed to parse AI stream chunk:', dataStr);
                        }
                    }
                }
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            toast.error(`AI Error: ${message}`);
            callbacks.onError(message);
        }
    }
};

export default aiService;
