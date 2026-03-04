import api from './api';

export interface Note {
    id: string;
    topic_id?: string;
    workspace_id?: string;
    title?: string;
    content: string;
    created_at?: string;
    updated_at?: string;
}

const noteService = {
    async list(): Promise<Note[]> {
        const response = await api.get('/notes');
        return response.data;
    },

    async get(id: string): Promise<Note> {
        const response = await api.get(`/notes/${id}`);
        return response.data;
    },

    async create(data: Partial<Note>): Promise<Note> {
        const response = await api.post('/notes', data);
        return response.data;
    },

    async update(id: string, data: Partial<Note>): Promise<Note> {
        const response = await api.put(`/notes/${id}`, data);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/notes/${id}`);
    },

    // Keep the aliases for backward compatibility if any
    async getNotes(topicId: string): Promise<Note[]> {
        const response = await api.get(`/notes/${topicId}`);
        return response.data;
    },

    async saveNote(topicId: string, content: string): Promise<Note> {
        const response = await api.post('/notes', { topicId, content });
        return response.data;
    },

    async deleteNote(id: string): Promise<void> {
        await api.delete(`/notes/${id}`);
    }
};

export default noteService;
