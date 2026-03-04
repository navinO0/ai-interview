import api from './api';
import Cookies from 'js-cookie';

const authService = {
    async login(email: string, password: string) {
        const response = await api.post('/auth/login', { email, password });
        const data = response.data;
        if (data.token) {
            Cookies.set('token', data.token, { expires: 7 }); // Expires in 7 days
            localStorage.setItem('token', data.token); // Fallback
            localStorage.setItem('user', JSON.stringify(data.user)); // User info can stay in local storage
        }
        return data;
    },

    async register(name: string, email: string, password: string) {
        const response = await api.post('/auth/register', { name, email, password });
        const data = response.data;
        if (data.token) {
            Cookies.set('token', data.token, { expires: 7 });
            localStorage.setItem('token', data.token); // Fallback
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        return data;
    },

    async getMe() {
        const token = Cookies.get('token');
        if (!token) return null;

        try {
            const response = await api.get('/auth/me');
            return response.data;
        } catch (error) {
            // Error interceptor handles the 401 and token clearing
            return null;
        }
    },

    logout() {
        Cookies.remove('token');
        localStorage.removeItem('user');
    }
};

export default authService;
