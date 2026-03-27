import api from './api';

const wasteService = {
    getStatsByCategory: async () => {
        try {
            const response = await api.get('/waste/stats/category');
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to fetch category stats';
        }
    },

    getWasteTrends: async () => {
        try {
            const response = await api.get('/waste/stats/trends');
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to fetch waste trends';
        }
    },

    addWasteEntry: async (entryData) => {
        try {
            const response = await api.post('/waste', entryData);
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to add waste entry';
        }
    },

    getDetailedReport: async () => {
        try {
            const response = await api.get('/waste/details');
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to fetch detailed records';
        }
    }
};

export default wasteService;
