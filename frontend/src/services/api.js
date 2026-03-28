import axios from 'axios';

// Create an Axios instance
const api = axios.create({
    baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors (e.g., global error logging or redirect on 401)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // You could add logic here to redirect to login if 401 Unauthorized
        // if (error.response && error.response.status === 401) {
        //    localStorage.removeItem('token');
        //    window.location.href = '/'; 
        // }
        return Promise.reject(error);
    }
);

export default api;