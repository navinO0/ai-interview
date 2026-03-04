import api from './api';

const resumeService = {
    async uploadResume(file: File, jobDescription: string = '') {
        const formData = new FormData();
        formData.append('resume', file);
        if (jobDescription) {
            formData.append('jobDescription', jobDescription);
        }

        const response = await api.post('/resume/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    async getLatest() {
        const response = await api.get('/resume/latest');
        return response.data;
    },

    // Kept for backward compatibility if needed by newer code
    async analyzeResume(file: File) {
        return this.uploadResume(file);
    }
};

export default resumeService;
