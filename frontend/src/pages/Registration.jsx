import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaMapMarkerAlt, FaShieldAlt, FaBriefcase, FaAlignLeft, FaUsers } from "react-icons/fa";
import MapPicker from "../components/MapPicker";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import AuthService from "../services/authService";

function Register() {
  const navigate = useNavigate();
  const { register, verifyOtp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    securityCode: "",
    skills: "",
    bio: "",
    latitude: "",
    longitude: "",
    address: "",
  });
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [locationMode, setLocationMode] = useState("manual");
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

  const handleChange = (e) => {
    if (e.target.name === 'role') {
      setIsAdminVerified(false);
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationSelect = async (lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    }));

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      if (data && data.display_name) {
        setFormData(prev => ({ ...prev, address: data.display_name }));
      }
    } catch (error) {
      console.error("Failed to fetch address:", error);
    }
  };

  const handleVerifySecurityCode = async () => {
    if (!formData.securityCode) return;
    setIsVerifyingCode(true);
    try {
      await AuthService.verifyAdminCode({ securityCode: formData.securityCode });
      setIsAdminVerified(true);
      alert("Admin code verified successfully. You may proceed.");
    } catch (error) {
      alert("Security code didn't match. You can't register as admin.");
      setIsAdminVerified(false);
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const isFormDisabled = formData.role === "admin" && !isAdminVerified;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isFormDisabled) {
      alert("Please verify admin security code first.");
      return;
    }

    if (showOtpInput) {
      try {
        await verifyOtp({
          email: formData.email,
          otp: otp
        });
        alert("Verification Successful! You are now logged in.");
        navigate("/dashboard");
      } catch (error) {
        console.error("Verification Error:", error);
        alert("Verification Failed: " + (error.response?.data?.message || "Invalid OTP"));
      }
    } else {
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }

      const submissionData = {
        ...formData,
        skills: formData.skills.split(",").map((s) => s.trim()).filter(Boolean),
        location: {
          type: "Point",
          coordinates: [
            parseFloat(formData.longitude) || 0,
            parseFloat(formData.latitude) || 0,
          ],
        },
      };
      delete submissionData.latitude;
      delete submissionData.longitude;
      delete submissionData.confirmPassword;

      try {
        const responseData = await register(submissionData);
        alert(responseData.message);
        setShowOtpInput(true);
      } catch (error) {
        console.error("Registration Error:", error);
        alert("Registration Failed: " + (error.response?.data?.message || "An error occurred during registration."));
      }
    }
  };

  return (
    <AuthLayout
      title="Create a new account"
      subtitle="Fill in your details to join the WasteZero community."
    >
      <div className="flex bg-[#F2F4F3] p-1 rounded-2xl mb-8">
        <Link to="/" className="w-1/2 py-2.5 text-sm font-bold text-secondary text-center">
          Login
        </Link>
        <button className="w-1/2 py-2.5 text-sm font-bold rounded-xl glass-card text-primary shadow-sm">
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {!showOtpInput ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-[10px] font-bold font-manrope uppercase tracking-widest text-[#414844] mb-1.5 ml-1">Full Name</label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-mint transition-colors text-xs" />
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={isFormDisabled}
                    className="w-full pl-10 pr-4 py-3 input-glass rounded-xl transition-all font-inter text-sm"
                  />
                </div>
              </div>
              <div className="group">
                <label className="block text-[10px] font-bold font-manrope uppercase tracking-widest text-[#414844] mb-1.5 ml-1">Email</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-mint transition-colors text-xs" />
                  <input
                    type="email"
                    name="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isFormDisabled}
                    className="w-full pl-10 pr-4 py-3 input-glass rounded-xl transition-all font-inter text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-[10px] font-bold font-manrope uppercase tracking-widest text-secondary mb-1.5 ml-1">Password</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-mint transition-colors text-xs" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isFormDisabled}
                    className="w-full pl-10 pr-10 py-3 input-glass rounded-xl transition-all font-inter text-sm"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary">
                    {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
              </div>
              <div className="group">
                <label className="block text-[10px] font-bold font-manrope uppercase tracking-widest text-secondary mb-1.5 ml-1">Confirm</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-mint transition-colors text-xs" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={isFormDisabled}
                    className="w-full pl-10 pr-4 py-3 input-glass rounded-xl transition-all font-inter text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="group">
              <label className="block text-[10px] font-bold font-manrope uppercase tracking-widest text-secondary mb-1.5 ml-1">I am a...</label>
              <div className="relative">
                <FaUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-mint transition-colors text-xs" />
                <select 
                  name="role" 
                  value={formData.role} 
                  onChange={handleChange} 
                  required
                  className="w-full pl-10 pr-4 py-3 input-glass rounded-xl transition-all font-inter text-sm appearance-none cursor-pointer"
                >
                  <option value="">Select Role</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="ngo">NGO</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {formData.role === "admin" && (
              <div className="group animate-in fade-in slide-in-from-left-4 duration-300">
                <label className="block text-[10px] font-bold font-manrope uppercase tracking-widest text-secondary mb-1.5 ml-1">Admin Authorization</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <FaShieldAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-mint transition-colors text-xs" />
                    <input
                      type="password"
                      name="securityCode"
                      placeholder="Security Code"
                      value={formData.securityCode}
                      onChange={handleChange}
                      disabled={isAdminVerified}
                      className="w-full pl-10 pr-4 py-3 input-glass rounded-xl transition-all font-inter text-sm"
                    />
                  </div>
                  {!isAdminVerified && (
                    <button
                      type="button"
                      onClick={handleVerifySecurityCode}
                      disabled={isVerifyingCode}
                      className="px-6 py-3 mint-btn rounded-xl text-xs font-bold whitespace-nowrap"
                    >
                      {isVerifyingCode ? "..." : "Verify"}
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="group">
              <label className="block text-[10px] font-bold font-manrope uppercase tracking-widest text-secondary mb-1.5 ml-1">Skills</label>
              <div className="relative">
                <FaBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-mint transition-colors text-xs" />
                <input
                  type="text"
                  name="skills"
                  placeholder="e.g. Recycling, Logistics, Teaching"
                  value={formData.skills}
                  onChange={handleChange}
                  disabled={isFormDisabled}
                  className="w-full pl-10 pr-4 py-3 input-glass rounded-xl transition-all font-inter text-sm"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-[10px] font-bold font-manrope uppercase tracking-widest text-secondary mb-1.5 ml-1">Bio</label>
              <div className="relative">
                <FaAlignLeft className="absolute left-4 top-4 text-secondary group-focus-within:text-mint transition-colors text-xs" />
                <textarea
                  name="bio"
                  placeholder="A bit about yourself..."
                  value={formData.bio}
                  onChange={handleChange}
                  rows="2"
                  disabled={isFormDisabled}
                  className="w-full pl-10 pr-4 py-3 input-glass rounded-xl transition-all font-inter text-sm resize-none"
                />
              </div>
            </div>

            <div className="group">
              <div className="flex justify-between items-center mb-1.5 px-1">
                <label className="block text-[10px] font-bold font-manrope uppercase tracking-widest text-secondary">Location</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setLocationMode("manual")}
                    className={`text-[9px] px-2 py-1 rounded-md font-bold uppercase tracking-wider transition-all ${locationMode === "manual" ? "bg-primary text-white" : "bg-secondary/10 text-secondary"}`}
                  >
                    Manual
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocationMode("map")}
                    className={`text-[9px] px-2 py-1 rounded-md font-bold uppercase tracking-wider transition-all ${locationMode === "map" ? "bg-primary text-white" : "bg-secondary/10 text-secondary"}`}
                  >
                    Map Picker
                  </button>
                </div>
              </div>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-mint transition-colors text-xs" />
                <input
                  type="text"
                  name="address"
                  placeholder={locationMode === "map" ? "Select on map below" : "Enter full address"}
                  value={formData.address}
                  onChange={handleChange}
                  required
                  disabled={isFormDisabled}
                  className="w-full pl-10 pr-4 py-3 input-glass rounded-xl transition-all font-inter text-sm"
                />
              </div>

              {locationMode === "map" && !isFormDisabled && (
                <div className="mt-4 p-1 glass-card rounded-2xl overflow-hidden border border-mint/20">
                  <div className="h-48 rounded-xl overflow-hidden">
                    <MapPicker
                      onLocationSelect={handleLocationSelect}
                      initialLat={formData.latitude}
                      initialLng={formData.longitude}
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="animate-in fade-in zoom-in duration-500">
             <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl mb-8 text-center">
              <div className="w-12 h-12 bg-mint rounded-full flex items-center justify-center mx-auto mb-4">
                <FaEnvelope className="text-primary text-xl" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2 font-manrope">Check your email</h3>
              <p className="text-emerald-700 text-sm font-medium">We've sent a security code to {formData.email}</p>
            </div>
            <input
              type="text"
              name="otp"
              placeholder="0 0 0 0 0 0"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="w-full text-center text-3xl tracking-[1rem] py-6 input-glass rounded-2xl font-manrope font-extrabold text-primary"
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full py-5 mint-btn rounded-2xl text-lg font-extrabold tracking-tight"
        >
          {showOtpInput ? "Verify & Create Account" : "Join the Ecosystem"}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-black/[0.03] text-center">
        <p className="text-secondary text-sm font-medium">
          Already a member?{" "}
          <Link to="/" className="text-primary font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default Register;