import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { initiateSocketConnection, disconnectSocket, getSocket } from '../../services/socketService';
import chatService from '../../services/chatService';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { FaPaperPlane, FaUserCircle, FaArrowLeft } from 'react-icons/fa';

const ChatWindow = () => {
    const { roomId } = useParams();
    const { user } = useAuth();
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    // Derive receiverId from roomId: [user1, user2].sort().join('_')
    const userIds = roomId ? roomId.split('_') : [];
    const receiverId = userIds.find((id) => id !== user?._id);

    // Auto-scroll to latest message
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages]);

    useEffect(() => {
        if (!user?._id || !roomId) return;

        // 1. Fetch old message history
        const fetchHistory = async () => {
            try {
                const data = await chatService.getMessages(roomId);
                if (data.success && data.data) {
                    setMessages(data.data);
                }
            } catch (err) {
                console.error("Failed to fetch chat history:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();

        // 2. Initialize socket
        const socket = initiateSocketConnection(user._id);

        // Join room
        socket.emit('join_room', { roomId });

        // 3. Listen for incoming messages
        const messageHandler = (messageData) => {
            // Only add if it belongs to current room
            if (messageData.roomId === roomId) {
                setMessages((prev) => {
                    // Prevent duplicates if already added locally
                    if (prev.find(m => m._id === messageData._id)) return prev;
                    return [...prev, messageData];
                });
            }
        };

        socket.on('receive_message', messageHandler);

        // On unmount: disconnect socket and remove listeners
        return () => {
            socket.off('receive_message', messageHandler);
            // Optionally, we could leave disconnectSocket() out if we want persistent sockets,
            // but for a focused chat window, disconnecting/cleaning up is safe.
            disconnectSocket();
        };
    }, [user, roomId]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const trimmed = newMessage.trim();
        if (!trimmed || !user?._id || !receiverId) return;

        const socket = getSocket();
        if (socket && socket.connected) {
            // Send via socket. The server handles saving it and broadcasting it back.
            socket.emit('send_message', {
                roomId,
                senderId: user._id,
                receiverId,
                content: trimmed
            });
            setNewMessage('');
        } else {
            // Fallback via REST API if disconnected
            try {
                const msgResponse = await chatService.sendMessage({
                    roomId,
                    receiver_id: receiverId,
                    content: trimmed
                });
                if (msgResponse.success) {
                    setMessages(prev => [...prev, msgResponse.data]);
                    setNewMessage('');
                }
            } catch (err) {
                console.error("Failed to send message via API:", err);
                alert("Failed to send message. Please reconnect.");
            }
        }
    };

    const formatTime = (isoString) => {
        const d = new Date(isoString);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={`flex h-screen w-full transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar />

                <main className="flex-1 overflow-hidden p-6">
                    <div className={`flex flex-col h-full w-full max-w-4xl mx-auto rounded-2xl shadow-sm border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>

                        {/* Chat Header */}
                        <div className={`flex items-center gap-4 p-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                            <button
                                onClick={() => navigate(-1)}
                                className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                            >
                                <FaArrowLeft />
                            </button>
                            <div className="flex items-center gap-3">
                                <FaUserCircle size={40} className="text-gray-400" />
                                <div>
                                    <h2 className="font-semibold text-lg leading-tight">Conversation</h2>
                                    <p className="text-xs text-green-500 font-medium">Secured Room</p>
                                </div>
                            </div>
                        </div>

                        {/* Message History */}
                        <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                            {loading ? (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-gray-400 animate-pulse">Loading messages...</p>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
                                    <span className="text-4xl mb-3">💬</span>
                                    <h3 className="text-lg font-medium">No messages yet</h3>
                                    <p className="text-sm">Send a message to start the conversation!</p>
                                </div>
                            ) : (
                                messages.map((msg, index) => {
                                    const isMe = msg.sender_id === user._id;

                                    return (
                                        <div key={msg._id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm flex flex-col
                                                ${isMe
                                                    ? 'bg-green-600 text-white rounded-tr-sm'
                                                    : isDarkMode
                                                        ? 'bg-gray-700 text-gray-100 rounded-tl-sm'
                                                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'}`}
                                            >
                                                <p className="text-sm">{msg.content}</p>
                                                <span className={`text-[10px] self-end mt-1 ${isMe ? 'text-green-200' : 'text-gray-400'}`}>
                                                    {msg.createdAt ? formatTime(msg.createdAt) : 'Just now'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className={`p-4 border-t ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className={`flex-1 rounded-full px-5 py-3 outline-none transition-colors border
                                        ${isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500'
                                            : 'bg-gray-100 border-transparent focus:bg-white focus:border-green-500 text-gray-800'}`}
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="h-12 w-12 flex items-center justify-center rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shrink-0"
                                >
                                    <FaPaperPlane className="relative right-0.5" />
                                </button>
                            </form>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default ChatWindow;
