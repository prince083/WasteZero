import api from './api';

const OpportunityService = {
    // Get all opportunities
    getAllOpportunities: async () => {
        try {
            const response = await api.get('/opportunities');
            return response.data.data || response.data.opportunities || response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to fetch opportunities';
        }
    },

    // Get a single opportunity by ID
    getOpportunityById: async (opportunityId) => {
        try {
            const response = await api.get(`/opportunities/${opportunityId}`);
            return response.data.data || response.data.opportunity || response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to fetch opportunity details';
        }
    },

    // Get opportunities created by current NGO user
    getMyOpportunities: async () => {
        try {
            const response = await api.get('/opportunities/my');
            return response.data.data || response.data.opportunities || response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to fetch your opportunities';
        }
    },

    // Create new opportunity (NGO only)
    createOpportunity: async (opportunityData) => {
        try {
            const response = await api.post('/opportunities', opportunityData);
            return response.data.data || response.data.opportunity || response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to create opportunity';
        }
    },

    // Update opportunity (NGO only)
    updateOpportunity: async (opportunityId, opportunityData) => {
        try {
            const response = await api.put(`/opportunities/${opportunityId}`, opportunityData);
            return response.data.data || response.data.opportunity || response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to update opportunity';
        }
    },

    // Delete opportunity (NGO only)
    deleteOpportunity: async (opportunityId) => {
        try {
            const response = await api.delete(`/opportunities/${opportunityId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to delete opportunity';
        }
    },

    // Apply for an opportunity (Volunteer only)
    applyForOpportunity: async (opportunityId) => {
        try {
            const response = await api.post(`/opportunities/${opportunityId}/apply`);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to apply for opportunity';
        }
    },

    // Get list of opportunities the user has applied for (Volunteer only)
    getAppliedOpportunities: async () => {
        try {
            const response = await api.get('/opportunities/applied');
            return response.data.data || response.data.opportunities || response.data;
        } catch (error) {
            // If endpoint doesn't exist yet, return empty array
            return [];
        }
    },

    // Get applicants for an opportunity (NGO only)
    getOpportunityApplicants: async (opportunityId) => {
        try {
            const response = await api.get(`/opportunities/${opportunityId}/applicants`);
            return response.data.applicants || response.data.data || response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to fetch applicants';
        }
    },

    // Search opportunities with filters
    searchOpportunities: async (filters) => {
        try {
            const response = await api.get('/opportunities/search', { params: filters });
            return response.data.data || response.data.opportunities || response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to search opportunities';
        }
    },

    // Get all volunteers accepted by the NGO (for dispatching)
    getMyVolunteers: async () => {
        try {
            const response = await api.get('/opportunities/my-volunteers');
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to fetch your volunteers';
        }
    },

    // Get all applications for NGO's opportunities
    getAllMyApplications: async () => {
        try {
            const response = await api.get('/opportunities/all-applications');
            return response.data.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to fetch applications';
        }
    },

    // Update application status
    updateApplicationStatus: async (opportunityId, applicationId, status) => {
        try {
            const response = await api.patch(`/opportunities/${opportunityId}/applicants/${applicationId}`, { status });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to update application status';
        }
    }
};

export default OpportunityService;
