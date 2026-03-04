import api from './api';

const searchService = {
    async search(query: string) {
        const response = await api.get('/search', {
            params: { query }
        });
        return response.data;
    },

    async getSummary(query: string) {
        const response = await api.get('/search/summary', {
            params: { query }
        });
        return response.data.summary;
    }
};

export default searchService;
