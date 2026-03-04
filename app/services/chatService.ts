import api from './api';

const chatService = {
    async getHistory() {
        const response = await api.get('/chat/history');
        return response.data;
    },

    async sendMessage(message: string) {
        const response = await api.post('/chat/send', { content: message });
        return response.data;
    }
};

export default chatService;
