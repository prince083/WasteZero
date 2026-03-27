import api from './api';

const PickupService = {
    // Schedule a new pickup
    createPickup: async (pickupData) => {
        try {
            const response = await api.post('/pickups', pickupData);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to schedule pickup';
        }
    },

    // Get user's own picks
    getMyPickups: async () => {
        try {
            const response = await api.get('/pickups/my');
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to fetch pickups';
        }
    },

    // Get pickups assigned to NGO/staff
    getAssignedPickups: async () => {
        try {
            const response = await api.get('/pickups/assigned');
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to fetch assigned pickups';
        }
    },

    // Update pickup status (assigned -> completed/cancelled)
    updateStatus: async (pickupId, status, extraData = {}) => {
        try {
            const response = await api.patch(`/pickups/${pickupId}/status`, { status, ...extraData });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to update status';
        }
    },

    // Dispatch pickup to a volunteer
    dispatchPickup: async (pickupId, volunteerId) => {
        try {
            const response = await api.patch(`/pickups/${pickupId}/dispatch`, { volunteer_id: volunteerId });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to dispatch pickup';
        }
    },

    // Admin: get all pickups
    getAllPickups: async () => {
        try {
            const response = await api.get('/pickups');
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to fetch all pickups';
        }
    }
};

export default PickupService;
