import api from './api';

export interface InterviewSession {
    id: string;
    topic: string;
    score?: number;
    feedback?: string;
    created_at: string;
}

const interviewService = {
    async createSession(topic: string, difficulty: string): Promise<InterviewSession> {
        const response = await api.post('/interview/session', { topic, difficulty });
        return response.data;
    },

    async getSessions(): Promise<InterviewSession[]> {
        const response = await api.get('/interview/sessions');
        return response.data;
    },

    async listSessions(): Promise<InterviewSession[]> {
        return this.getSessions();
    },

    async getSession(id: string): Promise<InterviewSession> {
        const response = await api.get(`/interview/session/${id}`);
        return response.data;
    },

    async startInterview(config: any) {
        const response = await api.post('/interview/start', config);
        return response.data;
    },

    async answerQuestion(interviewId: string, questionId: string, answer: string) {
        const response = await api.post('/interview/answer', {
            interviewId,
            questionId,
            answerText: answer
        });
        return response.data;
    },

    async getReport(interviewId: string) {
        const response = await api.get(`/interview/${interviewId}/report`);
        return response.data;
    }
};

export default interviewService;
