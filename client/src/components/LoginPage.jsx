// LoginPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles/LoginPage.css";
import { useNavigate } from "react-router-dom";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const API = "https://kalyanmandapam.onrender.com/api"; 
// ← Make sure this matches your deployed backend!

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
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const navigate = useNavigate();

  // ─── FETCH A NEW CAPTCHA WHEN “LOGIN” TAB IS ACTIVE ───────────────
  useEffect(() => {
    if (view === "login") {
      setError("");
      setSuccess("");
      setCaptchaInput("");
      setCaptchaSvg("");
      setCaptchaToken("");
      setCaptchaVerified(false);

      axios
        .get(`${API}/captcha/get-captcha`)
        .then((res) => {
          // res.data = { svg: "<svg>…</svg>", token: "<JWT>" }
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
  }, [view, languageType]);

  // ─── VERIFY CAPTCHA (when user clicks the “Verify CAPTCHA” button) ─
  const handleVerifyCaptcha = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await axios.post(`${API}/captcha/verify-captcha`, {
        captchaInput,
        captchaToken,
      });
      // { success: true } → correct
      if (res.data?.success) {
        setSuccess(
          languageType === "en" ? "CAPTCHA verified" : "कैप्चा सत्यापित"
        );
        setCaptchaVerified(true);
      } else {
        throw new Error("Invalid response");
      }
    } catch (err) {
      console.error("CAPTCHA verify error:", err.response || err.message);
      setError(
        err.response?.data?.message ||
          (languageType === "en" ? "Invalid CAPTCHA" : "अमान्य कैप्चा")
      );
      setCaptchaVerified(false);

      // Fetch a brand-new CAPTCHA on failure
      try {
        const r2 = await axios.get(`${API}/auth/captcha`);
        setCaptchaSvg(r2.data.svg);
        setCaptchaToken(r2.data.token);
        setCaptchaInput("");
      } catch (e2) {
        console.error("Failed to reload CAPTCHA:", e2);
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── LOGIN (only if captchaVerified === true) ─────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${API}/auth/login`,
        { email, password },
        { withCredentials: false } 
        // ← note: you don’t need credentials for CAPTCHA now, but 
        // you might still need cookies if login itself uses sessions.
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
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (languageType === "en" ? "Login failed" : "लॉगिन असफल")
      );
    } finally {
      setLoading(false);
    }
  };

  // ─── SIGNUP: STEP 1 (Send OTP) ───────────────────────────────────
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
      await axios.post(`${API}/otp/send-otp`, { email });
      setSuccess(
        languageType === "en"
          ? "OTP sent to your email"
          : "ओटीपी आपके ईमेल पर भेजा गया है"
      );
      setStep(2);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (languageType === "en"
            ? "Failed to send OTP"
            : "ओटीपी भेजने में विफल")
      );
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
                  {/* Render the SVG string returned by the server */}
                  <div
                    dangerouslySetInnerHTML={{ __html: captchaSvg }}
                    style={{ marginBottom: "0.5rem" }}
                  />
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
                      if (captchaVerified) setCaptchaVerified(false);
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={handleVerifyCaptcha}
                    disabled={loading || !captchaInput.trim()}
                    className="verify-captcha-button"
                  >
                    {languageType === "en"
                      ? "Verify CAPTCHA"
                      : "कैप्चा सत्यापित करें"}
                  </button>
                </div>
              )}

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <button
                type="submit"
                disabled={loading || !captchaVerified}
                className={!captchaVerified ? "disabled-login-button" : ""}
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
