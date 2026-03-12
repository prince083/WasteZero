import api from './api'; // Inherits the JWT logic from our api instance

const chatService = {
    // Get message history for a specific room
    getMessages: async (roomId) => {
        const response = await api.get(`/chat/${roomId}`);
        return response.data;
    },

    // Get list of recent conversations (for ChatList)
    getConversations: async () => {
        const response = await api.get('/chat/conversations/list');
        return response.data;
    },

    // Optional fallback: send message via REST if socket isn't working/used
    sendMessage: async (messageData) => {
        const response = await api.post('/chat', messageData);
        return response.data;
    }
};

export default chatService;
