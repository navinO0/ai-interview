import api from './api';

export interface RoadmapStep {
    id: string;
    topic: string;
    description: string;
    status: 'pending' | 'completed' | 'in_progress';
}

const roadmapService = {
    async generateRoadmap(goal: string, difficulty: string, learnerLevel: string, targetDays?: number) {
        const response = await api.post('/roadmap/generate', {
            goal,
            experienceLevel: learnerLevel,
            difficulty,
            targetDays
        });
        return response.data;
    },

    async getMyPaths() {
        const response = await api.get('/roadmap/my-paths');
        return response.data;
    },

    async getRoadmap(): Promise<RoadmapStep[]> {
        const response = await api.get('/roadmap');
        return response.data;
    },

    async updateStep(id: string, status: string): Promise<RoadmapStep> {
        const response = await api.patch(`/roadmap/${id}`, { status });
        return response.data;
    }
};

export default roadmapService;
