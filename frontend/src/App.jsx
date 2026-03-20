import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Registration";
import Dashboard from "./pages/Dashboards/Dashboard";
import Profile from "./pages/Profile";
import "./App.css";

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import ProtectedRoute from "./routes/ProtectedRoute";

import OpportunityList from "./pages/Opportunities/OpportunityList";
import OpportunityForm from "./pages/Opportunities/OpportunityForm";
import OpportunityDetail from "./pages/Opportunities/OpportunityDetail";
import SchedulePickup from "./pages/Pickups/SchedulePickup";
import MatchDashboard from "./pages/Matches/MatchDashboard";
import VolunteerTasks from "./pages/Pickups/VolunteerTasks";
import ChatLayout from "./pages/Chat/ChatLayout";
import AdminPanel from "./pages/Admin/AdminPanel";

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes - Accessible by any authenticated user */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin-panel" element={<AdminPanel />} />

              {/* Opportunity Routes */}
              <Route path="/opportunities" element={<OpportunityList />} />
              <Route path="/opportunities/create" element={<OpportunityForm />} />
              <Route path="/opportunities/edit/:id" element={<OpportunityForm />} />
              <Route path="/opportunities/:id" element={<OpportunityDetail />} />

              {/* Pickup Routes */}
              <Route path="/schedule-pickup" element={<SchedulePickup />} />
              <Route path="/tasks" element={<VolunteerTasks />} />

              {/* Chat Routes */}
              <Route path="/chat" element={<ChatLayout />} />
              <Route path="/chat/:roomId" element={<ChatLayout />} />

              {/* Match Dashboard Route */}
              <Route path="/matches" element={<MatchDashboard />} />
            </Route>

            {/* Example of Role-Based Route (Future usage) */}
            {/*
            <Route element={<ProtectedRoute roles={['admin']} />}>
                <Route path="/admin" element={<AdminPanel />} />
            </Route>
            */}
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
