import api from './api';

export interface Chapter {
    title: string;
    content: string;
}

export interface TopicExplanation {
    title: string;
    chapters: Chapter[];
    keyPoints: string[];
    commonInterviewQuestions: string[];
    useCases: string[];
    commonMistakes: string[];
    bestPractices: string[];
    resources: string[];
}

export interface Topic {
    id: string;
    name: string;
    description: string;
}

const topicService = {
    async getTopics(): Promise<Topic[]> {
        const response = await api.get('/topics');
        return response.data;
    },

    async getTopic(id: string): Promise<Topic> {
        const response = await api.get(`/topics/${id}`);
        return response.data;
    },

    async getStep(id: string) {
        const response = await api.get(`/topics/${id}`);
        return response.data;
    },

    async explainTopic(topic: string) {
        const response = await api.get('/topics/explain', {
            params: { topic }
        });
        return response.data;
    },

    async chat(id: string, message: string) {
        const response = await api.post(`/topics/${id}/chat`, { message });
        return response.data;
    }
};

export default topicService;
