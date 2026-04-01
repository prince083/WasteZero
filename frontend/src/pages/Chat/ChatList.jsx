import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import { initiateSocketConnection } from '../../services/socketService';

const createMockConversations = (user) => {
    const displayName = user?.name || 'Community Partner';

    return [
        {
            id: `${user?._id || 'me'}_partner1`,
            name: 'GreenCycle Hub',
            lastMessage: 'Thanks for scheduling the pickup! See you tomorrow morning.',
            timestamp: new Date().toISOString(),
            unreadCount: 2
        },
        {
            id: `${user?._id || 'me'}_partner2`,
            name: 'EcoDrop Center',
            lastMessage: 'We have a new slot available this evening.',
            timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            unreadCount: 0
        },
        {
            id: `${user?._id || 'me'}_support`,
            name: `${displayName} Support`,
            lastMessage: 'Let us know if you need help with pickups or opportunities.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
            unreadCount: 0
        }
    ];
};

const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ChatList = ({ selectedRoomId, onSelectRoom }) => {
    const { user } = useAuth();
    const { isDarkMode } = useTheme();

    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const loadConversations = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Load real conversations from backend. Falls back to mock data on failure.
                const response = await api.get('/chat/conversations/list');

                if (!isMounted) return;

                if (response.data?.success && Array.isArray(response.data.data)) {
                    const apiConversations = response.data.data.map((conv) => {
                        const last = conv.lastMessage || {};
                        const senderId =
                            last.sender_id?._id || last.sender_id || last.sender || null;
                        const receiverId =
                            last.receiver_id?._id || last.receiver_id || last.receiver || null;

                        const currentUserId = user?._id || user?.id;
                        const isSenderMe =
                            currentUserId &&
                            senderId &&
                            String(senderId) === String(currentUserId);

                        const otherUser = isSenderMe ? last.receiver_id : last.sender_id;

                        return {
                            id: conv.roomId,
                            name: otherUser?.name || 'Conversation',
                            lastMessage: last.content || 'No messages yet',
                            timestamp: last.createdAt || last.timestamp,
                            unreadCount: conv.unreadCount || 0
                        };
                    });

                    setConversations(apiConversations);
                } else {
                    setConversations(createMockConversations(user));
                }
            } catch (err) {
                console.error('Failed to load conversations:', err);
                if (!isMounted) return;
                setError('Unable to load conversations right now.');
                setConversations(createMockConversations(user));
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadConversations();

        return () => {
            isMounted = false;
        };
    }, [user]);

    // Automatically clear unread bubble when selecting a room
    useEffect(() => {
        if (selectedRoomId) {
            setConversations(prev =>
                prev.map(conv =>
                    conv.id === selectedRoomId
                        ? { ...conv, unreadCount: 0 }
                        : conv
                )
            );
        }
    }, [selectedRoomId]);

    // Listen for new messages continuously to increment unread counter instantly
    useEffect(() => {
        if (!user?._id) return;
        const socket = initiateSocketConnection(user._id);

        const handleNewMessage = (msg) => {
            setConversations((prev) => {
                const isCurrentRoom = msg.roomId === selectedRoomId;

                // Check if it's an existing conversation
                const exists = prev.some(c => c.id === msg.roomId);

                // If the message brings a completely brand new room, we can just log for now
                if (!exists) {
                    console.log('Received message from a new conversation! Refresh required to see in sidebar.');
                    // (To avoid infinite fetch loops, we skip auto-refreshing here. The user gets a bell notification anyway.)
                    return prev;
                }

                return prev.map((conv) => {
                    if (conv.id === msg.roomId) {
                        return {
                            ...conv,
                            lastMessage: msg.content,
                            timestamp: msg.createdAt || new Date().toISOString(),
                            unreadCount: isCurrentRoom ? 0 : (conv.unreadCount + 1),
                        };
                    }
                    return conv;
                });
            });
        };

        socket.on('receive_message', handleNewMessage);

        return () => {
            socket.off('receive_message', handleNewMessage);
        };
    }, [user, selectedRoomId]);

    if (!user) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Sign in to view your messages.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
                    <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading conversations...</p>
                </div>
            </div>
        );
    }

    if (!conversations.length) {
        return (
            <div className="flex-1 flex items-center justify-center px-4 text-center">
                <div>
                    <h2 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No conversations yet</h2>
                    <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Start a new conversation from an opportunity or a pickup to see it appear here.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
                <h2 className={`text-sm font-semibold tracking-wide uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Recent Chats
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto">
                {error && (
                    <div className={`px-4 py-2 text-xs ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>
                        {error}
                    </div>
                )}

                <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                    {conversations.map((conversation) => {
                        const isActive = conversation.id === selectedRoomId;
                        const hasUnread = conversation.unreadCount > 0;
                        const lastMessagePreview = conversation.lastMessage || 'No messages yet';

                        return (
                            <li
                                key={conversation.id}
                                className={`cursor-pointer px-4 py-3 flex items-start gap-3 transition-colors ${isActive
                                        ? isDarkMode
                                            ? 'bg-gray-800'
                                            : 'bg-green-50'
                                        : isDarkMode
                                            ? 'hover:bg-gray-900'
                                            : 'hover:bg-gray-50'
                                    }`}
                                onClick={() => onSelectRoom?.(conversation.id)}
                            >
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-green-100 text-green-700'
                                        }`}
                                >
                                    {conversation.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p
                                            className={`text-sm font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'
                                                }`}
                                        >
                                            {conversation.name}
                                        </p>
                                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {formatTime(conversation.timestamp)}
                                        </span>
                                    </div>
                                    <p
                                        className={`mt-1 text-xs truncate ${hasUnread
                                                ? isDarkMode
                                                    ? 'text-gray-100'
                                                    : 'text-gray-800'
                                                : isDarkMode
                                                    ? 'text-gray-400'
                                                    : 'text-gray-600'
                                            }`}
                                    >
                                        {lastMessagePreview}
                                    </p>
                                </div>

                                {hasUnread && (
                                    <div className="ml-2">
                                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-semibold bg-green-600 text-white">
                                            {conversation.unreadCount}
                                        </span>
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default ChatList;

