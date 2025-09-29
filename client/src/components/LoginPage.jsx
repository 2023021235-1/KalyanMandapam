// LoginPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./styles/LoginPage.css";
import { useNavigate } from "react-router-dom";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { RefreshCw } from 'lucide-react'; // Added for CAPTCHA refresh

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

  // CAPTCHA STATES
  const [captchaSvg, setCaptchaSvg] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");

  const navigate = useNavigate();

  // Function to load/reload CAPTCHA
  const loadCaptcha = useCallback(() => {
    setError(""); // Clear general errors when captcha is (re)loaded
    setCaptchaInput(""); // Clear input when new captcha is loaded
    setCaptchaSvg("");   // Clear current SVG while loading
    setCaptchaToken(""); // Clear current token

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
  }, [languageType]); // languageType for error messages

  useEffect(() => {
    // Only fetch CAPTCHA for login or the first step of signup
    if (view === "login" || (view === "signup" && step === 1)) {
      loadCaptcha();
    }
  }, [view, step, loadCaptcha]); // Rerun if view, step, or loadCaptcha (due to languageType) changes

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // 1. Verify CAPTCHA first
      const captchaRes = await axios.post(`${API}/captcha/verify-captcha`, {
        captchaInput,
        captchaToken,
      });

      if (!captchaRes.data?.success) {
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

      if (err.message === (languageType === "en" ? "Invalid CAPTCHA" : "अमान्य कैप्चा")) {
        errorMessage = err.message;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
      loadCaptcha(); // Refresh CAPTCHA on error

    } finally {
      setLoading(false);
    }
  };

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
        errorMessage = err.message;
      }

      setError(errorMessage);
      loadCaptcha(); // Refresh CAPTCHA on error

    } finally {
      setLoading(false);
    }
  };

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

const renderCaptchaFields = () => (
    captchaSvg && ( // Only render if captchaSvg is available
        <div className="captcha-wrapper" style={{  display: "flex", alignItems: "center", gap: "10px" }}> {/* Main container for CAPTCHA elements */}
            <div className="captcha-top-row" style={{  display: "flex", alignItems: "center", flexDirection: "row", gap: "10px" }}> {/* Container for image and refresh button */}
                <div className="captcha-svg-container" dangerouslySetInnerHTML={{ __html: captchaSvg }} />
                <button
                    type="button"
                    onClick={loadCaptcha} // Assuming loadCaptcha is your function to reload CAPTCHA
                    title={languageType === "en" ? "Refresh CAPTCHA" : "कैप्चा रीफ़्रेश करें"}
                    className="refresh-captcha-btn"
                    // Inline styles for basic button reset, further styling in CSS
                    style={{ height: "40px", width: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                    <RefreshCw size={22} /> {/* Adjusted icon size */}
                </button>
            </div>
            <input
                type="text"
                placeholder={languageType === "en" ? "Enter CAPTCHA" : "कैप्चा दर्ज करें"}
                value={captchaInput} // Assuming captchaInput is your state for the input
                onChange={(e) => setCaptchaInput(e.target.value)} // Assuming setCaptchaInput updates the state
                required
                className="captcha-input-field" // Specific class for the input field
            />
        </div>
    )
  );

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
                // loadCaptcha will be called by useEffect
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
                // loadCaptcha will be called by useEffect
              }}
            >
              {languageType === "en" ? "Signup" : "साइनअप"}
            </button>
          </div>

          {view === "login" && (
            <form onSubmit={handleLogin} className="login-form">
              <input
                type="text"
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
              
              {renderCaptchaFields()}

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <button
                type="submit"
                disabled={loading || !captchaToken} // Also disable if captcha isn't loaded
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

                  {renderCaptchaFields()}

                  {error && <div className="error-message">{error}</div>}
                  {success && <div className="success-message">{success}</div>}

                  <button type="submit" disabled={loading || !captchaToken}>
                    {loading
                      ? languageType === "en"
                        ? "Sending OTP..."
                        : "ओटीपी भेज रहा है..."
                      : languageType === "en"
                      ? "Send OTP"
                      : "ओटीपी भेजें"}
                  </button>
                </form>
              ) : ( // Step 2: Verify OTP
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
                        setStep(1); // Go back to step 1 (name, email, password, CAPTCHA)
                        setError("");
                        setSuccess("");
                        // loadCaptcha will be called by useEffect due to step change
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
            {/* Links are kept as they were, switching view triggers useEffect for CAPTCHA */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setView(view === "login" ? "signup" : "login");
                setStep(1); 
                setError("");
                setSuccess("");
              }}
            >
              {view === "login"
                ? languageType === "en" ? "Create Account" : "खाता बनाएं"
                : languageType === "en" ? "Back to Login" : "लॉगिन पर वापस जाएं"}
            </a>
            <a href="#" onClick={(e) => {e.preventDefault(); /* Implement forgot password */}}>
              {languageType === "en" ? "Forgot Password?" : "पासवर्ड भूल गए?"}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;