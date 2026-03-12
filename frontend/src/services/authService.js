import api from './api';

const AuthService = {
    // Login
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    // Register
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    // Verify OTP
    verifyOtp: async (data) => {
        const response = await api.post('/auth/verify-otp', data);
        return response.data;
    },

    // Verify Admin Code
    verifyAdminCode: async (data) => {
        const response = await api.post('/auth/verify-admin-code', data);
        return response.data;
    },

    // Get current user profile (example)
    getProfile: async () => {
        const response = await api.get('/auth/profile'); // Adjust endpoint
        return response.data;
    },
};

export default AuthService;
