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

    async createWorkspace(name: string, description?: string): Promise<Workspace> {
        const response = await api.post('/workspaces', { name, description });
        return response.data;
    },

    async getWorkspace(id: string): Promise<Workspace> {
        const response = await api.get(`/workspaces/${id}`);
        return response.data;
    }
};

export default workspaceService;
