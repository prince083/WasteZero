import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { initiateSocketConnection, disconnectSocket } from '../../services/socketService';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';

const ChatLayout = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    const { user } = useAuth();

    useEffect(() => {
        if (user?._id) {
            initiateSocketConnection(user._id);
        }
        return () => {
            disconnectSocket();
        };
    }, [user]);

    const handleSelectRoom = (id) => {
        navigate(`/chat/${id}`);
    };

    return (
        <div
            className={`flex h-screen w-full transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'
                }`}
        >
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar />

                <main className="flex-1 flex overflow-hidden">
                    {/* Conversations list */}
                    <section
                        className={`w-full md:w-80 lg:w-96 border-r ${isDarkMode ? 'border-gray-800 bg-gray-950' : 'border-gray-200 bg-white'
                            }`}
                    >
                        <ChatList selectedRoomId={roomId} onSelectRoom={handleSelectRoom} />
                    </section>

                    {/* Chat window / empty state */}
                    <section className="hidden md:flex flex-1">
                        {roomId ? (
                            <ChatWindow />
                        ) : (
                            <div className="flex-1 flex items-center justify-center px-6">
                                <div className="max-w-md text-center">
                                    <h1
                                        className={`text-2xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'
                                            }`}
                                    >
                                        Welcome to your messages
                                    </h1>
                                    <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                                        You do not have any conversation selected yet. Choose a recent chat on the left,
                                        or start a new conversation from an opportunity or pickup.
                                    </p>
                                </div>
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
};

export default ChatLayout;

