import React from 'react';
import { FaCalendarPlus, FaChartLine, FaUsers } from 'react-icons/fa';
import logo from '../assets/logo.png';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left Pane - Brand & Impact (Hidden on mobile for now, or stackable) */}
      <div className="hidden md:flex md:w-1/2 eco-gradient p-12 flex-col justify-between text-white">
        <div className="flex items-center gap-3">
          <img src={logo} alt="WasteZero Logo" className="w-12 h-12" />
          <h1 className="text-3xl font-bold tracking-tight font-manrope">WasteZero</h1>
        </div>

        <div className="max-w-xl">
          <h2 className="text-5xl font-extrabold leading-tight mb-6 font-manrope">
            Join the Recycling Revolution
          </h2>
          <p className="text-lg text-emerald-100 mb-12 font-inter leading-relaxed opacity-90">
            WasteZero connects volunteers, NGOs, and administrators to schedule pickups, manage recycling opportunities, and make a positive impact on our environment.
          </p>

          <div className="grid grid-cols-1 gap-8">
            <div className="flex items-start gap-4">
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md">
                <FaCalendarPlus className="text-2xl text-mint" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-manrope mb-1">Schedule Pickups</h3>
                <p className="text-emerald-100/70 font-inter text-sm">Easily arrange waste collection and track status in real-time.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md">
                <FaChartLine className="text-2xl text-mint" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-manrope mb-1">Track Impact</h3>
                <p className="text-emerald-100/70 font-inter text-sm">Monitor your environmental contribution and community reach.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md">
                <FaUsers className="text-2xl text-mint" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-manrope mb-1">Volunteer</h3>
                <p className="text-emerald-100/70 font-inter text-sm">Join recycling initiatives and connect with local NGOs.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-emerald-100/40 text-xs font-inter uppercase tracking-widest">
          © 2026 WasteZero Ecosystem • All Rights Reserved
        </div>
      </div>

      {/* Right Pane - Content */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-lg">
          {/* Logo visible on mobile only */}
          <div className="md:hidden flex flex-col items-center mb-8">
            <img src={logo} alt="WasteZero Logo" className="w-16 h-16 mb-4" />
            <h1 className="text-2xl font-extrabold text-primary font-manrope">WasteZero</h1>
          </div>

          <div className="glass-card rounded-[2rem] p-8 md:p-10">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-primary mb-2 font-manrope">{title}</h2>
              <p className="text-secondary text-sm font-medium">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
