import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";

function Login() {
  const navigate = useNavigate();
  const { login, verifyOtp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (showOtpInput) {
      try {
        await verifyOtp({
          email: formData.email,
          otp: otp
        });
        alert("Login Successful!");
        navigate("/dashboard");
      } catch (error) {
        console.error("Verification Error:", error);
        alert("Verification Failed: " + (error.response?.data?.message || "Invalid OTP"));
      }
    } else {
      try {
        const response = await login(formData);
        alert(response.message);
        setShowOtpInput(true);
      } catch (error) {
        console.error("Error:", error);
        alert("Login Failed: " + (error.response?.data?.message || "Invalid credentials"));
      }
    }
  };

  return (
    <AuthLayout
      title="Login to your account"
      subtitle="Enter your credentials to access your WasteZero dashboard."
    >
      <div className="flex bg-[#F2F4F3] p-1 rounded-2xl mb-8">
        <button className="w-1/2 py-2.5 text-sm font-bold rounded-xl glass-card text-primary shadow-sm">
          Login
        </button>
        <Link to="/register" className="w-1/2 py-2.5 text-sm font-bold text-secondary text-center">
          Register
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {!showOtpInput ? (
          <>
            <div className="relative group">
              <label className="block text-xs font-bold font-manrope uppercase tracking-widest text-[#414844] mb-2 ml-1">
                Username or Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-mint transition-colors" />
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 input-glass rounded-2xl transition-all font-inter text-primary placeholder:text-secondary/50"
                />
              </div>
            </div>

            <div className="relative group">
              <label className="block text-xs font-bold font-manrope uppercase tracking-widest text-[#414844] mb-2 ml-1">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-mint transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your security key"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-12 py-4 input-glass rounded-2xl transition-all font-inter text-primary placeholder:text-secondary/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors text-lg"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded accent-mint border-none focus:ring-mint focus:ring-offset-2" />
                <span className="text-sm font-medium text-secondary group-hover:text-primary transition-colors">Keep me signed in</span>
              </label>
              <button type="button" className="text-sm font-bold text-primary hover:text-green-700 transition-colors">
                Forgot password?
              </button>
            </div>
          </>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl mb-6">
              <p className="text-emerald-800 text-sm font-semibold flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Security Verification
              </p>
              <p className="text-emerald-600 text-xs mt-1">We've sent a 6-digit code to your email. Please enter it to authorize your session.</p>
            </div>
            <input
              type="text"
              name="otp"
              placeholder="0 0 0 0 0 0"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="w-full text-center text-3xl tracking-[1.5rem] py-6 input-glass rounded-2xl font-manrope font-extrabold text-primary"
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full py-5 mint-btn rounded-2xl text-lg font-extrabold tracking-tight transition-all"
        >
          {showOtpInput ? "Verify & Unlock" : "Sign In to Ecosystem"}
        </button>
      </form>

      <div className="mt-10 pt-8 border-t border-black/[0.03] text-center">
        <p className="text-secondary text-sm font-medium">
          New to the recycling revolution?{" "}
          <Link to="/register" className="text-primary font-bold hover:underline">
            Create an Account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default Login;