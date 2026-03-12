import { io } from 'socket.io-client';

// Use production URL if defined, otherwise default to local dev server
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

let socket;

export const initiateSocketConnection = (userId) => {
    // Prevent multiple connections
    if (socket && socket.connected) return socket;

    socket = io(SOCKET_URL, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
        console.log('[SocketService] Connected to server:', socket.id);
        if (userId) {
            // Tell the server this user is online (matches our backend event 'user_online')
            socket.emit('user_online', userId);
        }
    });

    socket.on('disconnect', () => {
        console.log('[SocketService] Disconnected from server');
    });

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const getSocket = () => {
    return socket;
};
