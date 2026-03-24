import api from './api';

const adminService = {
    getPlatformStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },
    getUsers: async () => {
        const response = await api.get('/admin/users');
        return response.data;
    },
    getLogs: async () => {
        const response = await api.get('/admin/logs');
        return response.data;
    }
};

export default adminService;
