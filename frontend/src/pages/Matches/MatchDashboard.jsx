import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { FaMapMarkerAlt, FaCheckCircle, FaStar } from "react-icons/fa";

const MatchDashboard = () => {
  const { isDarkMode } = useTheme();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3000/api/matches", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
          setMatches(res.data.data);
        } else {
          setError(res.data.message || "Failed to load matches");
        }
      } catch (err) {
        console.error("Error fetching matches:", err);
        setError("Unable to connect to the matching server.");
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  if (loading) {
    return (
      <div className={`min-h-[calc(100vh-64px)] p-6 md:p-10 flex flex-col items-center justify-center ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4" />
        <h2 className="text-xl font-medium animate-pulse">Calculating best matches...</h2>
      </div>
    );
  }

  return (
    <div className={`min-h-[calc(100vh-64px)] p-6 md:p-10 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">Your Top Matches</h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Opportunities specially curated for you based on your skills and location.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-xl bg-red-100 border border-red-200 text-red-700 font-medium">
            {error}
          </div>
        )}

        {matches.length === 0 && !error ? (
          <div className={`flex flex-col items-center justify-center p-12 text-center rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <FaStar className="text-5xl text-yellow-500 mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No matching opportunities found</h3>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
              Try adding more skills to your profile to get matched with NGOs!
            </p>
            <Link to="/profile" className="mt-6 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors font-medium shadow-sm">
              Update Profile
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {matches.map(({ opportunity, skillScore, matchedSkills, distanceKm }) => (
              <div
                key={opportunity._id}
                className={`flex flex-col rounded-2xl border shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-green-500/50' : 'bg-white border-gray-200 hover:border-green-500/50'}`}
              >
                {/* Score Header */}
                <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-green-50 dark:bg-green-900/10 rounded-t-2xl">
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-green-600 dark:text-green-400" />
                    <span className="font-bold text-green-700 dark:text-green-400">{skillScore}% Match</span>
                  </div>
                  {distanceKm !== null && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                      <FaMapMarkerAlt className="text-red-500" />
                      {distanceKm} km away
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold mb-2 line-clamp-2" title={opportunity.title}>
                    {opportunity.title}
                  </h3>

                  <div className={`text-sm mb-4 font-medium flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs">
                      {opportunity.ngo_id?.name?.charAt(0).toUpperCase() || 'N'}
                    </span>
                    {opportunity.ngo_id?.name || "Unknown NGO"}
                  </div>

                  {matchedSkills.length > 0 && (
                    <div className="mb-6 flex-1">
                      <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Matching Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {matchedSkills.map(skill => (
                          <span key={skill} className={`px-2.5 py-1 rounded-md text-xs font-medium border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-green-50 border-green-100 text-green-700'}`}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <Link
                    to={`/opportunities/${opportunity._id}`}
                    className="w-full text-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors font-semibold shadow-sm mt-auto"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchDashboard;