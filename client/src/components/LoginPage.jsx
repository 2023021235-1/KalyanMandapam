import React, { useState } from "react";
import axios from "axios";
import "./styles/LoginPage.css";
import { useNavigate } from "react-router-dom";
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const API = "http://localhost:5000/api";

function LoginPage({ setUser }) {
  const [view, setView] = useState("login");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Common fields
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");

  // Signup‑only fields
  const [name, setName]         = useState("");
  const [otp, setOtp]           = useState("");

  // ─── LOGIN ─────────────────────────────────────────────────────
  const handleLogin = async e => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);

    try {
      const { data } = await axios.post(
        `${API}/auth/login`,
        { email, password }
      );
      const { token, user } = data;
      localStorage.setItem("token", token);
      setUser(user);
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ─── SIGNUP: STEP 1 ────────────────────────────────────────────
  const sendOtp = async e => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);

    if (!name || !email || !password) {
      setError("Name, email & password are required");
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${API}/otp/send-otp`, { email });
      setSuccess("OTP sent to your email");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // ─── SIGNUP: STEP 2 ────────────────────────────────────────────
  const verifyAndSignup = async e => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);

    if (!otp) {
      setError("Please enter the OTP");
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${API}/auth/signup`, {
        name,
        email,
        password,
        otp
      });
      setSuccess("Signup successful! You can now log in.");
      setTimeout(() => {
        // reset state & switch to login
        setName(""); setEmail(""); setPassword(""); setOtp("");
        setView("login"); setStep(1); setError(""); setSuccess("");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP or signup failed");
    } finally {
      setLoading(false);
    }
  };

  // ─── RENDER ────────────────────────────────────────────────────
  return (
    <div className="login-wrapper">
      <div className="login-left">
        <img src="./dog1.webp" alt="Cute Pet" className="doggy" />
      </div>
      <div className="login-right">
        <div className="login-box">
          <button onClick={() => navigate("/")} className="back-button">
            <FontAwesomeIcon icon={faArrowLeft} /> Back
          </button>
          <img src="./logo.webp" alt="Logo" className="logo" />
          <h2>Municipal Corporation Gorakhpur</h2>
          <h3>Pet Registration Portal</h3>

          <div className="tab-buttons">
            <button
              className={view === "login" ? "active-tab" : ""}
              onClick={() => { setView("login"); setStep(1); setError(""); setSuccess(""); }}
            >Login</button>
            <button
              className={view === "signup" ? "active-tab" : ""}
              onClick={() => { setView("signup"); setStep(1); setError(""); setSuccess(""); }}
            >Signup</button>
          </div>

          {view === "login" && (
            <form onSubmit={handleLogin} className="login-form">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <button type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          )}

          {view === "signup" && (
            <div className="signup-form">
              {step === 1 ? (
                <form onSubmit={sendOtp}>
                  <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />

                  {error && <div className="error-message">{error}</div>}
                  {success && <div className="success-message">{success}</div>}

                  <button type="submit" disabled={loading}>
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </button>
                </form>
              ) : (
                <form onSubmit={verifyAndSignup}>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    required
                  />

                  {error && <div className="error-message">{error}</div>}
                  {success && <div className="success-message">{success}</div>}

                  <button type="submit" disabled={loading}>
                    {loading ? "Verifying..." : "Verify & Signup"}
                  </button>
                  <p>
                    <a href="#" onClick={e => { e.preventDefault(); setStep(1); setError(""); setSuccess(""); }}>
                      ← Back
                    </a>
                  </p>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
