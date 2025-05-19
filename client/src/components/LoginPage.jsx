import React, { useState } from "react";
import axios from "axios";
import "./styles/LoginPage.css";
import { useNavigate } from "react-router-dom";
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const API = "http://localhost:5000/api";

function LoginPage({ setUser,setIsAdmin, languageType, toggleLanguage }) { // Added toggleLanguage prop
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
    // `data` will now correctly have `userType` from the backend
    const { token, user, userType } = data;
    localStorage.setItem("token", token);
  
     setUser(user);
     console.log(user)
    console.log("Logged in user type:", userType); // This will now show the actual userType

    if (userType === 'Admin') {
      setIsAdmin(true);navigate("/admin");
    } else {
     navigate("/home"); 
    }
  } catch (err) {
    setError(err.response?.data?.message || (languageType === 'en' ? "Login failed" : "लॉगिन असफल"));
  } finally {
    setLoading(false);
  }
};

  // ─── SIGNUP: STEP 1 ────────────────────────────────────────────
  const sendOtp = async e => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);

    if (!name || !email || !password) {
      setError(languageType === 'en' ? "Name, email & password are required" : "नाम, ईमेल और पासवर्ड आवश्यक हैं");
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${API}/otp/send-otp`, { email });
      setSuccess(languageType === 'en' ? "OTP sent to your email" : "ओटीपी आपके ईमेल पर भेजा गया है");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || (languageType === 'en' ? "Failed to send OTP" : "ओटीपी भेजने में विफल"));
    } finally {
      setLoading(false);
    }
  };

  // ─── SIGNUP: STEP 2 ────────────────────────────────────────────
  const verifyAndSignup = async e => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);

    if (!otp) {
      setError(languageType === 'en' ? "Please enter the OTP" : "कृपया ओटीपी दर्ज करें");
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
      setSuccess(languageType === 'en' ? "Signup successful! You can now log in." : "साइनअप सफल! अब आप लॉग इन कर सकते हैं।");
      setTimeout(() => {
        // reset state & switch to login
        setName(""); setEmail(""); setPassword(""); setOtp("");
        setView("login"); setStep(1); setError(""); setSuccess("");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || (languageType === 'en' ? "Invalid OTP or signup failed" : "अवैध ओटीपी या साइनअप विफल"));
    } finally {
      setLoading(false);
    }
  };

  // ─── RENDER ────────────────────────────────────────────────────
  return (
    <div className="login-wrapper">
      <div className="login-left">
        <img src="./image2.webp" alt="Cute Pet" className="doggy" />
      </div>
      <div className="login-right">
        <div className="login-box">
          <button onClick={() => navigate("/")} className="back-button">
            <FontAwesomeIcon icon={faArrowLeft} /> {languageType === 'en' ? 'Back' : 'पीछे'}
          </button>
          {/* Language Toggle */}
          {toggleLanguage && (
            <div className="language-toggle">
              <button onClick={toggleLanguage}>
                {languageType === 'en' ? 'हिन्दी' : 'English'}
              </button>
            </div>
          )}

          <img src="./logo.webp" alt="Logo" className="logo" />
          <h2>{languageType === 'en' ? 'Municipal Corporation Gorakhpur' : 'नगर निगम गोरखपुर'}</h2>
          <h3>{languageType === 'en' ? 'Kalyan-Mandapam Registration Portal' : 'कल्याण मंडप पंजीकरण पोर्टल'}</h3>

          <div className="tab-buttons">
            <button
              className={view === "login" ? "active-tab" : ""}
              onClick={() => { setView("login"); setStep(1); setError(""); setSuccess(""); }}
            >{languageType === 'en' ? 'Login' : 'लॉगिन'}</button>
            <button
              className={view === "signup" ? "active-tab" : ""}
              onClick={() => { setView("signup"); setStep(1); setError(""); setSuccess(""); }}
            >{languageType === 'en' ? 'Signup' : 'साइनअप'}</button>
          </div>

          {view === "login" && (
            <form onSubmit={handleLogin} className="login-form">
              <input
                type="email"
                placeholder={languageType === 'en' ? "Email" : "ईमेल"}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder={languageType === 'en' ? "Password" : "पासवर्ड"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <button type="submit" disabled={loading}>
                {loading ? (languageType === 'en' ? "Logging in..." : "लॉग इन हो रहा है...") : (languageType === 'en' ? "Login" : "लॉगिन करें")}
              </button>
               {/* Original links div - contains only one link in the original */}
               <div className="links">
                 {/* Add your forgot password link here if needed, but keeping original structure */}
               </div>
            </form>
          )}

          {view === "signup" && (
            <div className="signup-form">
              {step === 1 ? (
                <form onSubmit={sendOtp}>
                  <input
                    type="text"
                    placeholder={languageType === 'en' ? "Name" : "नाम"}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                  <input
                    type="email"
                    placeholder={languageType === 'en' ? "Email" : "ईमेल"}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                  <input
                    type="password"
                    placeholder={languageType === 'en' ? "Password" : "पासवर्ड"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />

                  {error && <div className="error-message">{error}</div>}
                  {success && <div className="success-message">{success}</div>}

                  <button type="submit" disabled={loading}>
                    {loading ? (languageType === 'en' ? "Sending OTP..." : "ओटीपी भेज रहा है...") : (languageType === 'en' ? "Send OTP" : "ओटीपी भेजें")}
                  </button>
                 
                </form>
              ) : (
                <form onSubmit={verifyAndSignup}>
                  <input
                    type="text"
                    placeholder={languageType === 'en' ? "Enter OTP" : "ओटीपी दर्ज करें"}
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    required
                  />

                  {error && <div className="error-message">{error}</div>}
                  {success && <div className="success-message">{success}</div>}

                  <button type="submit" disabled={loading}>
                    {loading ? (languageType === 'en' ? "Verifying..." : "सत्यापित कर रहा है...") : (languageType === 'en' ? "Verify & Signup" : "सत्यापित करें और साइनअप करें")}
                  </button>
                  <p>
                    <a href="#" onClick={e => { e.preventDefault(); setStep(1); setError(""); setSuccess(""); }}>
                      ← {languageType === 'en' ? 'Back' : 'पीछे'}
                    </a>
                  </p>
                </form>
              )}
            </div>
          )}
           <div className="links">
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  setView("signup");
                                 }}>{languageType === 'en' ? "Create Account" : "खाता बनाएं"}</a>
                <a href="#" onClick={(e) => e.preventDefault()}>{languageType === 'en' ? "Forgot Password?" : "पासवर्ड भूल गए?"}</a>
              </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;