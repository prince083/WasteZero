import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import MapPicker from "../components/MapPicker";
import { useAuth } from "../context/AuthContext";

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
      // Verify OTP logic
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

      // Register and Send OTP logic
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
    <div className="auth-container">
      <div className="form-box register-box">
        <h2>WasteZero Registration</h2>

        <form onSubmit={handleSubmit} className="register-form">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isFormDisabled}
          />

          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isFormDisabled}
          />

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter Password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isFormDisabled}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="password-wrapper" style={{ marginTop: "10px", marginBottom: "15px" }}>
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={isFormDisabled}
            />
          </div>

          <select name="role" value={formData.role} onChange={handleChange} required>
            <option value="">Select Role</option>
            <option value="volunteer">Volunteer</option>
            <option value="ngo">NGO</option>
            <option value="admin">Admin</option>
          </select>

          {formData.role === "admin" && (
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: '10px', marginBottom: '15px' }}>
              <input
                type="password"
                name="securityCode"
                placeholder="Enter Admin Security Code"
                value={formData.securityCode}
                onChange={handleChange}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleVerifySecurityCode())}
                required
                disabled={isAdminVerified}
                style={{ width: '100%', marginBottom: '10px' }}
              />
              {!isAdminVerified && (
                <button
                  type="button"
                  onClick={handleVerifySecurityCode}
                  disabled={isVerifyingCode}
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold"
                  }}
                >
                  {isVerifyingCode ? "..." : "Verify"}
                </button>
              )}
            </div>
          )}

          <input
            type="text"
            name="skills"
            placeholder="Skills (comma separated)"
            value={formData.skills}
            onChange={handleChange}
            disabled={isFormDisabled}
          />

          <textarea
            name="bio"
            placeholder="Short Bio"
            value={formData.bio}
            onChange={handleChange}
            rows="2"
            disabled={isFormDisabled}
            style={{
              padding: "8px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              width: "100%",
              opacity: isFormDisabled ? 0.6 : 1
            }}
          ></textarea>

          <div className="full-width" style={{ marginBottom: "15px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
              <label style={{ margin: 0, fontWeight: "bold" }}>Address Details:</label>
              <div style={{ display: "flex", gap: "5px" }}>
                <button
                  type="button"
                  onClick={() => setLocationMode("manual")}
                  disabled={isFormDisabled}
                  style={{
                    padding: "4px 10px",
                    fontSize: "12px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    backgroundColor: locationMode === "manual" ? "#4CAF50" : "#f1f1f1",
                    color: locationMode === "manual" ? "white" : "black",
                    cursor: isFormDisabled ? "not-allowed" : "pointer"
                  }}
                >
                  Type Manual
                </button>
                <button
                  type="button"
                  onClick={() => setLocationMode("map")}
                  disabled={isFormDisabled}
                  style={{
                    padding: "4px 10px",
                    fontSize: "12px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    backgroundColor: locationMode === "map" ? "#4CAF50" : "#f1f1f1",
                    color: locationMode === "map" ? "white" : "black",
                    cursor: isFormDisabled ? "not-allowed" : "pointer"
                  }}
                >
                  Pick on Map
                </button>
              </div>
            </div>

            <input
              type="text"
              name="address"
              placeholder={locationMode === "map" ? "Pin location on map or edit here" : "Enter your Full Address"}
              value={formData.address}
              onChange={handleChange}
              required
              disabled={isFormDisabled}
              style={{ marginTop: "10px", marginBottom: "15px" }}
            />

            {locationMode === "map" && (
              <div style={{ marginTop: "10px", marginBottom: "15px", pointerEvents: isFormDisabled ? "none" : "auto", opacity: isFormDisabled ? 0.6 : 1 }}>
                <p style={{ fontSize: "12px", color: "gray", marginBottom: "10px" }}>Click on the map to pin your location. The address will fill automatically.</p>
                <MapPicker
                  onLocationSelect={handleLocationSelect}
                  initialLat={formData.latitude}
                  initialLng={formData.longitude}
                />
              </div>
            )}
          </div>

          {showOtpInput && (
            <div className="full-width">
              <label style={{ display: "block", marginBottom: "5px", color: "green", fontWeight: "bold" }}>
                OTP Sent to email! Enter code below:
              </label>
              <input
                type="text"
                name="otp"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
          )}

          <button type="submit" className="full-width">
            {showOtpInput ? "Verify & Register" : "Register"}
          </button>
        </form>

        <p className="toggle">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register