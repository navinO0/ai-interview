import api from './api';

const contentService = {
    async getSuggestions(topic: string) {
        const response = await api.get('/content/suggestions', {
            params: { topic }
        });
        return response.data;
    }
};

export default contentService;
