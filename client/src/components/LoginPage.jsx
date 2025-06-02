// LoginPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles/LoginPage.css";
import { useNavigate } from "react-router-dom";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const API = "https://kalyanmandapam.onrender.com/api"; 

function LoginPage({ setUser, setIsAdmin, languageType, toggleLanguage }) {
  const [view, setView] = useState("login");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Signup fields
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");

  // ─── CAPTCHA STATES ───────────────────────────────────────────────
  const [captchaSvg, setCaptchaSvg] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");   // JWT from server
  const [captchaInput, setCaptchaInput] = useState("");

  const navigate = useNavigate();

  // ─── FETCH A NEW CAPTCHA WHEN "LOGIN" OR "SIGNUP" TAB IS ACTIVE ───────────────
  useEffect(() => {
    // Only fetch CAPTCHA for login or the first step of signup (where email/password are entered)
    if (view === "login" || (view === "signup" && step === 1)) {
      setError("");
      setSuccess("");
      setCaptchaInput(""); // Clear input when new captcha is loaded
      setCaptchaSvg("");
      setCaptchaToken("");

      axios
        .get(`${API}/captcha/get-captcha`)
        .then((res) => {
          setCaptchaSvg(res.data.svg);
          setCaptchaToken(res.data.token);
        })
        .catch((err) => {
          console.error("Failed to load CAPTCHA:", err);
          setError(
            languageType === "en"
              ? "Failed to load CAPTCHA"
              : "कैप्चा लोड करने में विफल"
          );
        });
    }
  }, [view, step, languageType]); // Added 'step' to dependencies

  // ─── LOGIN (now includes CAPTCHA verification) ─────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(""); // Clear previous success messages
    setLoading(true);

    try {
      // 1. Verify CAPTCHA first
      const captchaRes = await axios.post(`${API}/captcha/verify-captcha`, {
        captchaInput,
        captchaToken,
      });

      if (!captchaRes.data?.success) {
        // If server returns 200 but success: false, it's an invalid CAPTCHA
        throw new Error(
          languageType === "en" ? "Invalid CAPTCHA" : "अमान्य कैप्चा"
        );
      }

      // If CAPTCHA is successful, proceed with user login
      const { data } = await axios.post(
        `${API}/auth/login`,
        { email, password },
        { withCredentials: false }
      );

      const { token, user, userType } = data;
      localStorage.setItem("token", token);
      setUser(user);

      if (userType === "Admin") {
        setIsAdmin(true);
        navigate("/admin");
      } else {
        navigate("/home");
      }
      setSuccess(
        languageType === "en"
          ? "Login successful!"
          : "लॉगिन सफल!"
      );
    } catch (err) {
      console.error("Login/CAPTCHA error:", err.response || err.message);
      let errorMessage = languageType === "en" ? "Login failed" : "लॉगिन असफल";

      // Prioritize specific error messages
      if (err.message === (languageType === "en" ? "Invalid CAPTCHA" : "अमान्य कैप्चा")) {
        errorMessage = err.message; // Use the specific CAPTCHA error
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);

      // Always try to refresh CAPTCHA on any login error
      try {
        const r2 = await axios.get(`${API}/captcha/get-captcha`);
        setCaptchaSvg(r2.data.svg);
        setCaptchaToken(r2.data.token);
        setCaptchaInput(""); // Clear input on refresh
      } catch (e2) {
        console.error("Failed to reload CAPTCHA after error:", e2);
        setError(
          languageType === "en"
            ? "Login failed and failed to reload CAPTCHA"
            : "लॉगिन असफल और कैप्चा लोड करने में विफल"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── SIGNUP: STEP 1 (Send OTP - now includes CAPTCHA verification) ───────────────────
  const sendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!name || !email || !password) {
      setError(
        languageType === "en"
          ? "Name, email & password are required"
          : "नाम, ईमेल और पासवर्ड आवश्यक हैं"
      );
      setLoading(false);
      return;
    }

    try {
      // 1. Verify CAPTCHA first for signup
      const captchaRes = await axios.post(`${API}/captcha/verify-captcha`, {
        captchaInput,
        captchaToken,
      });

      if (!captchaRes.data?.success) {
        throw new Error(
          languageType === "en" ? "Invalid CAPTCHA" : "अमान्य कैप्चा"
        );
      }

      setSuccess(
        languageType === "en"
          ? "CAPTCHA verified. Sending OTP..."
          : "कैप्चा सत्यापित। ओटीपी भेज रहा है..."
      );

      // 2. If CAPTCHA is successful, proceed with sending OTP
      await axios.post(`${API}/otp/send-otp`, { email });
      setSuccess(
        languageType === "en"
          ? "OTP sent to your email"
          : "ओटीपी आपके ईमेल पर भेजा गया है"
      );
      setStep(2);
    } catch (err) {
      console.error("Signup/CAPTCHA error:", err.response || err.message);
      let errorMessage =
        err.response?.data?.message ||
        (languageType === "en" ? "Failed to send OTP" : "ओटीपी भेजने में विफल");
      
      if (err.message === (languageType === "en" ? "Invalid CAPTCHA" : "अमान्य कैप्चा")) {
        errorMessage = err.message; // Use the specific CAPTCHA error
      }

      setError(errorMessage);

      // Always try to refresh CAPTCHA on any signup error in step 1
      try {
        const r2 = await axios.get(`${API}/captcha/get-captcha`);
        setCaptchaSvg(r2.data.svg);
        setCaptchaToken(r2.data.token);
        setCaptchaInput(""); // Clear input on refresh
      } catch (e2) {
        console.error("Failed to reload CAPTCHA after error:", e2);
        setError(
          languageType === "en"
            ? "Failed to send OTP and failed to reload CAPTCHA"
            : "ओटीपी भेजने में विफल और कैप्चा लोड करने में विफल"
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // ─── SIGNUP: STEP 2 (Verify OTP & Signup) ────────────────────────
  const verifyAndSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!otp) {
      setError(
        languageType === "en" ? "Please enter the OTP" : "कृपया ओटीपी दर्ज करें"
      );
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${API}/auth/signup`, {
        name,
        email,
        password,
        otp,
      });
      setSuccess(
        languageType === "en"
          ? "Signup successful! You can now log in."
          : "साइनअप सफल! अब आप लॉग इन कर सकते हैं।"
      );
      setTimeout(() => {
        setName("");
        setEmail("");
        setPassword("");
        setOtp("");
        setView("login");
        setStep(1);
        setError("");
        setSuccess("");
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (languageType === "en"
            ? "Invalid OTP or signup failed"
            : "अवैध ओटीपी या साइनअप विफल")
      );
    } finally {
      setLoading(false);
    }
  };

  // ─── RENDER ─────────────────────────────────────────────────────
  return (
    <div className="login-wrapper">
      <div className="login-left">
        <img src="./image2.webp" alt="Cute Pet" className="doggy" />
      </div>

      <div className="login-right">
        <div className="login-box">
          <button onClick={() => navigate("/")} className="back-button">
            <FontAwesomeIcon icon={faArrowLeft} />{" "}
            {languageType === "en" ? "Back" : "पीछे"}
          </button>

          {/* Language Toggle */}
          {toggleLanguage && (
            <div className="language-toggle">
              <button onClick={toggleLanguage}>
                {languageType === "en" ? "हिन्दी" : "English"}
              </button>
            </div>
          )}

          <img src="./logo.webp" alt="Logo" className="logo" />
          <h2>
            {languageType === "en"
              ? "Municipal Corporation Gorakhpur"
              : "नगर निगम गोरखपुर"}
          </h2>
          <h3>
            {languageType === "en"
              ? "Kalyan-Mandapam Registration Portal"
              : "कल्याण मंडप पंजीकरण पोर्टल"}
          </h3>

          <div className="tab-buttons">
            <button
              className={view === "login" ? "active-tab" : ""}
              onClick={() => {
                setView("login");
                setStep(1);
                setError("");
                setSuccess("");
              }}
            >
              {languageType === "en" ? "Login" : "लॉगिन"}
            </button>
            <button
              className={view === "signup" ? "active-tab" : ""}
              onClick={() => {
                setView("signup");
                setStep(1);
                setError("");
                setSuccess("");
              }}
            >
              {languageType === "en" ? "Signup" : "साइनअप"}
            </button>
          </div>

          {view === "login" && (
            <form onSubmit={handleLogin} className="login-form">
              <input
                type="email"
                placeholder={languageType === "en" ? "Email" : "ईमेल"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder={languageType === "en" ? "Password" : "पासवर्ड"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {/* ─── CAPTCHA IMAGE & INPUT ───────────────────────────── */}
              {captchaSvg && (
                <div className="captcha-wrapper">
                  <input
                    type="text"
                    placeholder={
                      languageType === "en"
                        ? "Enter CAPTCHA"
                        : "कैप्चा दर्ज करें"
                    }
                    value={captchaInput}
                    onChange={(e) => {
                      setCaptchaInput(e.target.value);
                    }}
                    required
                  />
                  {/* Render the SVG string returned by the server */}
                  <div
                    dangerouslySetInnerHTML={{ __html: captchaSvg }}
                    style={{ marginBottom: "0.5rem" }} // This style will be overridden by CSS
                  />
                </div>
              )}

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <button
                type="submit"
                disabled={loading}
                className={loading ? "disabled-login-button" : ""}
              >
                {loading
                  ? languageType === "en"
                    ? "Logging in..."
                    : "लॉग इन हो रहा है..."
                  : languageType === "en"
                  ? "Login"
                  : "लॉगिन करें"}
              </button>

              <div className="links">
                {/* (Optional) Forgot password link */}
              </div>
            </form>
          )}

          {view === "signup" && (
            <div className="signup-form">
              {step === 1 ? (
                <form onSubmit={sendOtp}>
                  <input
                    type="text"
                    placeholder={languageType === "en" ? "Name" : "नाम"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <input
                    type="email"
                    placeholder={languageType === "en" ? "Email" : "ईमेल"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <input
                    type="password"
                    placeholder={
                      languageType === "en" ? "Password" : "पासवर्ड"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />

                  {/* ─── CAPTCHA IMAGE & INPUT for Signup ───────────────────── */}
                  {captchaSvg && (
                    <div className="captcha-wrapper">
                      <input
                        type="text"
                        placeholder={
                          languageType === "en"
                            ? "Enter CAPTCHA"
                            : "कैप्चा दर्ज करें"
                        }
                        value={captchaInput}
                        onChange={(e) => {
                          setCaptchaInput(e.target.value);
                        }}
                        required
                      />
                      <div
                        dangerouslySetInnerHTML={{ __html: captchaSvg }}
                        style={{ marginBottom: "0.5rem" }}
                      />
                    </div>
                  )}

                  {error && <div className="error-message">{error}</div>}
                  {success && <div className="success-message">{success}</div>}

                  <button type="submit" disabled={loading}>
                    {loading
                      ? languageType === "en"
                        ? "Sending OTP..."
                        : "ओटीपी भेज रहा है..."
                      : languageType === "en"
                      ? "Send OTP"
                      : "ओटीपी भेजें"}
                  </button>
                </form>
              ) : (
                <form onSubmit={verifyAndSignup}>
                  <input
                    type="text"
                    placeholder={
                      languageType === "en" ? "Enter OTP" : "ओटीपी दर्ज करें"
                    }
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />

                  {error && <div className="error-message">{error}</div>}
                  {success && <div className="success-message">{success}</div>}

                  <button type="submit" disabled={loading}>
                    {loading
                      ? languageType === "en"
                        ? "Verifying..."
                        : "सत्यापित कर रहा है..."
                      : languageType === "en"
                      ? "Verify & Signup"
                      : "सत्यापित करें और साइनअप करें"}
                  </button>
                  <p>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setStep(1);
                        setError("");
                        setSuccess("");
                      }}
                    >
                      ← {languageType === "en" ? "Back" : "पीछे"}
                    </a>
                  </p>
                </form>
              )}
            </div>
          )}

          <div className="links">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setView("signup");
                setStep(1); // Ensure signup always starts at step 1
              }}
            >
              {languageType === "en" ? "Create Account" : "खाता बनाएं"}
            </a>
            <a href="#" onClick={(e) => e.preventDefault()}>
              {languageType === "en" ? "Forgot Password?" : "पासवर्ड भूल गए?"}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;