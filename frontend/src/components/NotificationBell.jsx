import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaBell, FaInfoCircle, FaRegCheckCircle } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { initiateSocketConnection } from "../services/socketService";

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const bellRef = useRef(null);
  const { isDarkMode } = useTheme();
  const { user } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch initial notifications
  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3000/api/notifications", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data?.success) {
          setNotifications(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };
    fetchNotifications();
  }, [user]);

  // Listen for live socket notifications
  useEffect(() => {
    if (!user?._id) return;
    const socket = initiateSocketConnection(user._id);

    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };

    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, [user]);

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`http://localhost:3000/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter out the notification to simulate it being "read" and removed from the bell tray
      setNotifications((prev) => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error("Could not mark tracking as read", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative" ref={bellRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`relative p-2 rounded-full transition-colors ${isDarkMode
          ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
          : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
          }`}
      >
        <FaBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-gray-900">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className={`absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl shadow-xl overflow-hidden z-[1000] border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
          <div className={`px-4 py-3 flex items-center justify-between border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-gray-50'
            }`}>
            <h4 className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Notifications
            </h4>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
              {unreadCount} New
            </span>
          </div>

          <div className="max-h-[350px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                <FaRegCheckCircle className="text-4xl text-green-500 mb-3 opacity-50" />
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>You're all caught up!</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {notifications.map((n) => (
                  <li key={n._id} className={`p-4 transition-colors relative group ${!n.isRead
                    ? isDarkMode ? 'bg-gray-800/50' : 'bg-green-50/50'
                    : isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
                    }`}>
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 p-2 rounded-full shrink-0 ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'
                        }`}>
                        <FaInfoCircle size={14} />
                      </div>
                      <div className="flex-1 min-w-0 pr-8">
                        <p className={`text-sm leading-snug ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {n.message}
                        </p>
                        <span className={`text-xs mt-1 block ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {new Date(n.createdAt || n.sent_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>

                        {n.link && (
                          <Link
                            to={n.link}
                            onClick={() => { setOpen(false); markAsRead(n._id); }}
                            className="text-xs font-semibold text-green-600 hover:text-green-700 mt-2 inline-block relative z-10"
                          >
                            View details &rarr;
                          </Link>
                        )}
                      </div>
                      <button
                        onClick={() => markAsRead(n._id)}
                        className={`absolute right-4 top-4 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${isDarkMode ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500'
                          }`}
                        title="Mark as read / dismiss"
                      >
                        &times;
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;