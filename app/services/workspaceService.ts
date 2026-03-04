import api from './api';

export interface Workspace {
    id: string;
    name: string;
    description?: string;
    last_active: string;
}

const workspaceService = {
    async getWorkspaces(): Promise<Workspace[]> {
        const response = await api.get('/workspaces');
        return response.data;
    },

    async createWorkspace(data: any): Promise<Workspace> {
        const response = await api.post('/workspaces', data);
        return response.data;
    },

    async getWorkspace(id: string): Promise<Workspace> {
        const response = await api.get(`/workspaces/${id}`);
        return response.data;
    }
};

export default workspaceService;
