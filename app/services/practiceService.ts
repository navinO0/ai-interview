import api from './api';

const practiceService = {
    async getChallenges(params?: { category?: string; type?: string; difficulty?: string; learner_level?: string; count?: number }) {
        const response = await api.get('/practice/challenges', { params });
        return response.data;
    },

    async getAdaptiveChallenge(params: { category: string; difficulty?: string; learner_level?: string; session_history?: any[] }) {
        const response = await api.post('/practice/mcq/adaptive', params);
        return response.data;
    },

    async submitSolution(questionId: string, solution: string, language?: string) {
        const response = await api.post('/practice/submit', { questionId, solution, language });
        return response.data;
    },

    async runCode(code: string, language: string) {
        const response = await api.post('/practice/run', { code, language });
        return response.data;
    },

    async getMcqHistory(): Promise<any[]> {
        const response = await api.get('/practice/mcq/history');
        return response.data;
    },

    async getDsaHistory(): Promise<any[]> {
        const response = await api.get('/practice/dsa/history');
        return response.data;
    },

    async getLearningPaths() {
        const response = await api.get('/practice/learning-paths');
        return response.data;
    },
};

export default practiceService;
