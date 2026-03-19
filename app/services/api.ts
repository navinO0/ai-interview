import axios from 'axios';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import config from '../config';

const api = axios.create({
    baseURL: config.apiUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

let activeRequests = 0;

function incrementLoading() {
    activeRequests++;
    if (activeRequests === 1 && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('global-loading', { detail: { isLoading: true } }));
    }
}

function decrementLoading() {
    activeRequests = Math.max(0, activeRequests - 1);
    if (activeRequests === 0 && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('global-loading', { detail: { isLoading: false } }));
    }
}

// Request interceptor to add the token
api.interceptors.request.use((config) => {
    incrementLoading();
    // Try Cookies first, then localStorage as fallback
    let token = Cookies.get('token');
    if (!token) {
        token = localStorage.getItem('token') || undefined;
        if (token) {
            console.log('[API Debug] Token missing in Cookies, but found in localStorage');
        }
    }

    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url} | Token exists: ${!!token}`);

    if (token) {
        if (config.headers) {
            // Use multiple ways to set the header for maximum browser/axios compatibility
            if (typeof config.headers.set === 'function') {
                config.headers.set('Authorization', `Bearer ${token}`);
            }
            config.headers.Authorization = `Bearer ${token}`;
            // @ts-ignore
            config.headers['Authorization'] = `Bearer ${token}`;
        }
    } else {
        console.warn(`[API Warning] No token found for request to ${config.url}`);
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor for global error handling
api.interceptors.response.use(
    (response) => {
        decrementLoading();
        return response;
    },
    (error) => {
        decrementLoading();
        const message = error.response?.data?.error?.message || error.message || 'An unexpected error occurred';

        // Don't toast for 401s directly, handle it contextually
        if (error.response?.status === 401) {
            Cookies.remove('token');
            // Check if we are not on the login page, register page, or landing page
            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register') && window.location.pathname !== '/') {
                window.dispatchEvent(new CustomEvent('session-expired'));
            }
        } else {
            toast.error(message, {
                id: 'global-api-error', // Prevent duplicate toasts for the same error
            });
        }

        return Promise.reject(error);
    }
);

export default api;
