import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./styles/LoginPage.css"; // Ensure this CSS file is correctly linked and updated

import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { RefreshCw } from 'lucide-react';

const translations = {
  en: {
    municipalCorporation: "Municipal Corporation Gorakhpur",
    petRegistrationPortal: "Pet Registration Portal",
    login: "Login",
    signup: "Signup",
    username: "Phone Number",
    password: "Password",
    loginFailed: "Login failed",
    loggingIn: "Logging in...",
    createAccount: "Create Account",
    forgotPassword: "Forgot Password?",
    phone: "Phone",
    enterPhoneNumber: "Enter phone number",
    invalidPhoneNumber: "Please enter a valid phone number",
    sendingOtp: "Sending OTP...",
    sendOtp: "Send OTP",
    otpSentSuccess: "OTP sent successfully!",
    otp: "OTP",
    name: "Name",
    chooseUsername: "Please choose a username",
    choosePassword: "Please choose a password",
    confirmPassword: "Confirm Password",
    passwordsDoNotMatch: "Passwords do not match",
    passwordTooShort: "Password must be at least 6 characters long",
    passwordTooCommon: "Password is too common. Please choose a more secure one.",
    passwordNeedsSpecialChar: "Password must contain at least one special symbol (e.g., !@#$%)",
    nameTooShort: "Name must be at least 3 characters long",
    allFieldsRequired: "All fields are required",
    invalidOtpOrSignupFailed: "Invalid OTP or failed signup",
    verifying: "Verifying...",
    verifyOtpAndSignup: "Verify OTP & Signup",
    signupSuccessful: "Signup successful! You can now log in.",
    goBack: "Go Back",
    back: "Back",
    enterCaptcha: "Enter CAPTCHA",
    invalidCaptcha: "Invalid CAPTCHA",
    failedToLoadCaptcha: "Failed to load CAPTCHA",
    refreshCaptcha: "Refresh CAPTCHA",
    captchaVerifiedSendingOtp: "CAPTCHA verified. Sending OTP...",
    resendOtp: "Resend OTP",
    resendOtpIn: "Resend OTP in"
  },
  hi: {
    municipalCorporation: "नगर निगम गोरखपुर",
    petRegistrationPortal: "पालतू पशु पंजीकरण पोर्टल",
    login: "लॉग इन करें",
    signup: "साइन अप करें",
    username: "फ़ोन नंबर",
    password: "पासवर्ड",
    loginFailed: "लॉग इन विफल रहा",
    loggingIn: "लॉग इन हो रहा है...",
    createAccount: "खाता बनाएं",
    forgotPassword: "पासवर्ड भूल गए?",
    phone: "फ़ोन",
    enterPhoneNumber: "फ़ोन नंबर दर्ज करें",
    invalidPhoneNumber: "कृपया मान्य फ़ोन नंबर दर्ज करें",
    sendingOtp: "ओटीपी भेज रहा है...",
    sendOtp: "ओटीपी भेजें",
    otpSentSuccess: "ओटीपी सफलतापूर्वक भेजा गया!",
    otp: "ओटीपी",
    name: "नाम",
    chooseUsername: "कृपया यूज़रनेम चुनें",
    choosePassword: "कृपया पासवर्ड चुनें",
    confirmPassword: "पासवर्ड की पुष्टि करें",
    passwordsDoNotMatch: "पासवर्ड मेल नहीं खाते",
    passwordTooShort: "पासवर्ड कम से कम 6 अक्षर का होना चाहिए", // UPDATED
    passwordTooCommon: "यह पासवर्ड बहुत आम है। कृपया अधिक सुरक्षित पासवर्ड चुनें।",
    passwordNeedsSpecialChar: "पासवर्ड में कम से कम एक विशेष प्रतीक होना चाहिए (उदा. !@#$%)",
    nameTooShort: "नाम कम से कम 3 अक्षर का होना चाहिए",
    allFieldsRequired: "सभी फ़ील्ड आवश्यक हैं",
    invalidOtpOrSignupFailed: "अमान्य ओटीपी या साइन अप विफल रहा",
    verifying: "सत्यापित हो रहा है...",
    verifyOtpAndSignup: "ओटीपी सत्यापित करें और साइन अप करें",
    signupSuccessful: "साइन अप सफल! अब आप लॉग इन कर सकते हैं।",
    goBack: "वापस जाएं",
    back: "वापस",
    enterCaptcha: "कैप्चा दर्ज करें",
    invalidCaptcha: "अमान्य कैप्चा",
    failedToLoadCaptcha: "कैप्चा लोड करने में विफल",
    refreshCaptcha: "कैप्चा रीफ़्रेश करें",
    captchaVerifiedSendingOtp: "कैप्चा सत्यापित। ओटीपी भेज रहा है...",
    resendOtp: "पुनः ओटीपी भेजें",
    resendOtpIn: "पुनः ओटीपी भेजें"
  }
};

const commonPasswords = new Set([
  '123456', '12345678', '123456789', 'password', 'qwerty', 'admin',
  '111111', '123123', 'password123', 'test'
]);

const hasSpecialChar = (password) => {
  const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
  return specialCharRegex.test(password);
};

// --- MODIFICATION START: Removed hasConsecutiveChars function ---
/*
const hasConsecutiveChars = (password) => {
  for (let i = 0; i < password.length - 2; i++) {
    const char1 = password.charCodeAt(i);
    const char2 = password.charCodeAt(i + 1);
    const char3 = password.charCodeAt(i + 2);

    if (char2 === char1 + 1 && char3 === char2 + 1) {
      return true;
    }
    if (char2 === char1 - 1 && char3 === char2 - 1) {
      return true;
    }
  }
  return false;
};
*/
// --- MODIFICATION END ---

const API = `https://kalyanmandapam.onrender.com/api`;

function LoginPage({ setUser, languageType,setIsAdmin }) {
  const [view, setView] = useState("login");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [step, setStep] = useState(1);
  const [resetStep, setResetStep] = useState(1);
  const [resetPhone, setResetPhone] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [captchaSvg, setCaptchaSvg] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [modalCaptchaInput, setModalCaptchaInput] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendTimerId, setResendTimerId] = useState(null);

  const [signupPasswordMatchError, setSignupPasswordMatchError] = useState(false);
  const [resetPasswordMatchError, setResetPasswordMatchError] = useState(false);

  const t = translations[languageType] || translations.en;

  useEffect(() => {
    return () => { if (resendTimerId) clearInterval(resendTimerId); };
  }, [resendTimerId]);
  
  useEffect(() => {
    if (signupConfirmPassword && signupPassword !== signupConfirmPassword) {
      setSignupPasswordMatchError(true);
    } else {
      setSignupPasswordMatchError(false);
    }
  }, [signupPassword, signupConfirmPassword]);

  useEffect(() => {
    if (confirmPassword && newPassword !== confirmPassword) {
      setResetPasswordMatchError(true);
    } else {
      setResetPasswordMatchError(false);
    }
  }, [newPassword, confirmPassword]);

  const startResendCooldown = () => {
    if (resendTimerId) clearInterval(resendTimerId);
    setResendCooldown(60);
    const newTimerId = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(newTimerId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setResendTimerId(newTimerId);
  };

  const loadCaptcha = useCallback(() => {
    setCaptchaInput("");
    setModalCaptchaInput("");
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
        setError(t.failedToLoadCaptcha);
      });
  }, [t]);

  useEffect(() => {
    if (view === "login" || (view === "signup" && step === 1) || showForgotPasswordModal) {
      loadCaptcha();
    }
  }, [view, step, showForgotPasswordModal, loadCaptcha]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatPhoneNumber = (number) => number ? number.toString() : "";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!isValidPhoneNumber(username || '')) {
      setError(t.invalidPhoneNumber);
      setLoading(false);
      loadCaptcha();
      return;
    }
    
    try {
        const captchaRes = await axios.post(`${API}/captcha/verify-captcha`, { captchaInput, captchaToken });
        if (!captchaRes.data?.success) throw new Error(t.invalidCaptcha);

      const res = await axios.post(`${API}/auth/login`, { phone: username, password }, { withCredentials: true });
      const data=res.data;
      console.log(data.user);
      const { user: loggedUser } = res.data;
       setIsAdmin(data.user.role==='Admin')
      setUser(loggedUser);

      if (loggedUser.role === "admin") navigate("/");
      else navigate("/home");
    } catch (err) {
      let errorMessage;
      if (err.response?.status === 429) {
        errorMessage = err.response.data.error || "Too many login attempts, please try again later.";
      } else if (err.message === t.invalidCaptcha) {
        errorMessage = err.message;
      } else {
        errorMessage = err.response?.data?.message || t.loginFailed;
      }
      setError(errorMessage);
      loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setSuccess("");

    if (!isValidPhoneNumber(phoneNumber)) {
      setError(t.invalidPhoneNumber);
      return;
    }

    setLoading(true);
    try {
      if (step === 1) {
        const captchaRes = await axios.post(`${API}/captcha/verify-captcha`, { captchaInput, captchaToken });
        if (!captchaRes.data?.success) throw new Error(t.invalidCaptcha);
      }
      
      await axios.post(`${API}/auth/send-phone-otp`, { phone: formatPhoneNumber(phoneNumber) });
      
      setStep(2);
      setSuccess(t.otpSentSuccess);
      startResendCooldown();
    } catch (err) {
      let errorMessage;
      if (err.response?.status === 429) {
        errorMessage = err.response.data.error || "Too many attempts, please try again later.";
      } else if (err.message === t.invalidCaptcha) {
        errorMessage = err.message;
      } else {
        errorMessage = err.response?.data?.message || t.invalidOtpOrSignupFailed;
      }
      setError(errorMessage);
      loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (signupPasswordMatchError) {
      setError(t.passwordsDoNotMatch);
      return;
    }
    if (!otp || !signupUsername || !signupPassword || !signupConfirmPassword) {
      setError(t.allFieldsRequired);
      return;
    }
    if (signupUsername.length < 3) {
      setError(t.nameTooShort);
      return;
    }
    if (signupPassword.length < 6) {
      setError(t.passwordTooShort);
      return;
    }
    if (commonPasswords.has(signupPassword)) {
      setError(t.passwordTooCommon);
      return;
    }
    if (!hasSpecialChar(signupPassword)) {
      setError(t.passwordNeedsSpecialChar);
      return;
    }
    // --- MODIFICATION START: Removed consecutive character check ---
    /*
    if (hasConsecutiveChars(signupPassword)) {
      setError(t.passwordHasConsecutive);
      return;
    }
    */
    // --- MODIFICATION END ---
    if (signupPassword !== signupConfirmPassword) {
      setError(t.passwordsDoNotMatch);
      return;
    }

    setLoading(true);
    try {
      const payload = { otp, username: signupUsername, password: signupPassword, phone: formatPhoneNumber(phoneNumber) };
      await axios.post(`${API}/auth/verify-phone-otp`, payload);

      setSuccess(t.signupSuccessful);
      setTimeout(() => {
        setView("login");
        setStep(1);
        setPhoneNumber("");
        setOtp("");
        setSignupUsername("");
        setSignupPassword("");
        setSignupConfirmPassword("");
        setError("");
        setSuccess("");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || t.invalidOtpOrSignupFailed);
    } finally {
      setLoading(false);
    }
  };
  
  const handleForgotPasswordClick = () => {
    setShowForgotPasswordModal(true);
    setResetStep(1);
    setResetPhone("");
    setResetOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
    setModalCaptchaInput("");
    loadCaptcha();
  };

  const handleInitiatePasswordReset = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!isValidPhoneNumber(resetPhone)) {
      setError(t.invalidPhoneNumber);
      return;
    }

    setLoading(true);
    try {
      if (resetStep === 1) {
          const captchaRes = await axios.post(`${API}/captcha/verify-captcha`, { captchaInput: modalCaptchaInput, captchaToken });
          if (!captchaRes.data?.success) throw new Error(t.invalidCaptcha);
      }
      await axios.post(`${API}/auth/forgot-password`, { phone: formatPhoneNumber(resetPhone) });
      setResetStep(2);
      setSuccess(t.otpSentSuccess);
      startResendCooldown();
    } catch (err) {
      const errorMessage = err.message === t.invalidCaptcha ? err.message : err.response?.data?.message || "Failed to initiate password reset";
      setError(errorMessage);
      loadCaptcha();
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyResetOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!resetOtp) {
      setError("Please enter the OTP");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/auth/verify-reset-otp`, { phone: formatPhoneNumber(resetPhone), otp: resetOtp });
      setResetStep(3);
      setSuccess("OTP verified. Please set your new password.");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (resetPasswordMatchError) {
        setError(t.passwordsDoNotMatch);
        return;
    }
    if (!newPassword || !confirmPassword) {
      setError(t.allFieldsRequired);
      return;
    }
    if (newPassword.length < 6) {
        setError(t.passwordTooShort);
        return;
    }
    if (commonPasswords.has(newPassword)) {
      setError(t.passwordTooCommon);
      return;
    }
    if (!hasSpecialChar(newPassword)) {
      setError(t.passwordNeedsSpecialChar);
      return;
    }
    // --- MODIFICATION START: Removed consecutive character check ---
    /*
    if (hasConsecutiveChars(newPassword)) {
      setError(t.passwordHasConsecutive);
      return;
    }
    */
    // --- MODIFICATION END ---
    if (newPassword !== confirmPassword) {
      setError(t.passwordsDoNotMatch);
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/auth/reset-password`, { phone: formatPhoneNumber(resetPhone), newPassword });
      setSuccess("Password reset successfully! You can now login with your new password.");
      setTimeout(() => {
        setShowForgotPasswordModal(false);
        setView("login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };
  
  const resetAllForms = () => {
    setError("");
    setSuccess("");
    setStep(1);
    setResetStep(1);
    if(resendTimerId) clearInterval(resendTimerId);
    setResendCooldown(0);
    setSignupPasswordMatchError(false);
    setResetPasswordMatchError(false);
    loadCaptcha();
  };

  const renderCaptchaFields = (value, onChange) => (
    captchaSvg && (
      <div className="captcha-wrapper">
        <div className="captcha-top-row" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="captcha-svg-container" dangerouslySetInnerHTML={{ __html: captchaSvg }} />
          <button type="button" onClick={loadCaptcha} title={t.refreshCaptcha} className="refresh-captcha-btn" style={{ height: "40px", width: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <RefreshCw size={22} />
          </button>
        </div>
        <input type="text" placeholder={t.enterCaptcha} value={value} onChange={onChange} required className="captcha-input-field" />
      </div>
    )
  );
  
  const renderResendOtpButton = (handler) => (
      <div className="resend-otp-container" style={{ marginTop: '15px', textAlign: 'center' }}>
          <button type="button" onClick={handler} disabled={resendCooldown > 0 || loading} className="link-style-button">
              {resendCooldown > 0 ? `${t.resendOtpIn} ${resendCooldown}s` : t.resendOtp}
          </button>
      </div>
  );

  return (
    <div className="login-wrapper">
      {!isMobile && (
        <div className="login-left">
          <img src='/image2.webp' alt="Cute Pet" className="doggy" />
        </div>
      )}
      <div className="login-right">
        <div className="login-box">
          <button onClick={() => navigate("/")} className="back-button">
            <FontAwesomeIcon icon={faArrowLeft} /> {t.back}
          </button>
          <img src='/logo.webp' alt="Nagar Nigam Logo" className="logo" />
          <h2>{t.municipalCorporation}</h2>
          <h3>{t.petRegistrationPortal}</h3>
          <div className="tab-buttons">
            <button onClick={() => { setView("login"); resetAllForms(); }} className={view === "login" ? "active-tab" : ""}>
              {t.login}
            </button>
            <button onClick={() => { setView("signup"); resetAllForms(); }} className={view === "signup" ? "active-tab" : ""}>
              {t.signup}
            </button>
          </div>

          {view === "login" && (
            <form className="login-form" onSubmit={handleLogin}>
              <PhoneInput placeholder={t.username} value={username} onChange={setUsername} defaultCountry="IN" international required countrySelectProps={{ disabled: true }} />
              <input type="password" placeholder={t.password} value={password} onChange={e => setPassword(e.target.value)} required />
              {renderCaptchaFields(captchaInput, (e) => setCaptchaInput(e.target.value))}
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}
              <button type="submit" disabled={loading || !captchaToken}>
                {loading ? t.loggingIn : t.login}
              </button>
              <div className="links">
                <button1 href="#" onClick={(e) => { e.preventDefault(); setView("signup"); resetAllForms(); }}>{t.createAccount}</button1>
                <button1 href="#" onClick={(e) => { e.preventDefault(); handleForgotPasswordClick(); }}>{t.forgotPassword}</button1>
              </div>
            </form>
          )}

          {view === "signup" && (
            <div className="signup-form">
              {step === 1 ? (
                <form onSubmit={handleSendOtp}>
                  <PhoneInput placeholder={t.enterPhoneNumber} value={phoneNumber} onChange={setPhoneNumber} defaultCountry="IN" international countrySelectProps={{ disabled: true }} />
                  {renderCaptchaFields(captchaInput, (e) => setCaptchaInput(e.target.value))}
                  {error && <div className="error-message">{error}</div>}
                  {success && <div className="success-message">{success}</div>}
                  <button type="submit" disabled={loading || !captchaToken}>
                    {loading ? t.sendingOtp : t.sendOtp}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp}>
                  <input placeholder={t.otp} value={otp} onChange={e => setOtp(e.target.value)} required />
                  <input placeholder={t.name} value={signupUsername} onChange={e => setSignupUsername(e.target.value)} required />
                  <input type="password" placeholder={t.password} value={signupPassword} onChange={e => setSignupPassword(e.target.value)} required />
                  
                  {/* --- MODIFICATION START: Display password rules --- */}
                  <div className="password-rules" style={{ textAlign: 'left', fontSize: '0.8rem', color: '#666', marginBottom: '10px' }}>
                    <ul style={{ listStylePosition: 'inside', paddingLeft: '5px', margin: '0' }}>
                      <li>{t.passwordTooShort}</li>
                      <li>{t.passwordNeedsSpecialChar}</li>
                    
                    </ul>
                  </div>
                  {/* --- MODIFICATION END --- */}

                  {signupPasswordMatchError && <div className="field-error-label">{t.passwordsDoNotMatch}</div>}
                  <input 
                    type="password" 
                    placeholder={t.confirmPassword} 
                    value={signupConfirmPassword} 
                    onChange={e => setSignupConfirmPassword(e.target.value)} 
                    className={signupPasswordMatchError ? 'input-validation-error' : ''}
                    required 
                  />

                  {error && <div className="error-message">{error}</div>}
                  {success && <div className="success-message">{success}</div>}

                  <button type="submit" disabled={loading || signupPasswordMatchError}>
                    {loading ? t.verifying : t.verifyOtpAndSignup}
                  </button>

                  {renderResendOtpButton(handleSendOtp)}
                  <p style={{marginTop: '15px'}}>
                    <button href="#" onClick={(e) => { e.preventDefault(); setStep(1); setError(""); setSuccess(""); }}>{t.goBack}</button>
                  </p>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {showForgotPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
             <div className="modal-header">
              <h3>Reset Password</h3>
              <button className="close-modal" onClick={() => setShowForgotPasswordModal(false)}>&times;</button>
            </div>
            
            {resetStep === 1 && (
              <form onSubmit={handleInitiatePasswordReset}>
                <PhoneInput placeholder={t.enterPhoneNumber} value={resetPhone} onChange={setResetPhone} defaultCountry="IN" international required />
                {renderCaptchaFields(modalCaptchaInput, (e) => setModalCaptchaInput(e.target.value))}
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
                <button type="submit" disabled={loading || !captchaToken}>
                  {loading ? t.sendingOtp : "Send OTP"}
                </button>
              </form>
            )}
            
            {resetStep === 2 && (
              <form onSubmit={handleVerifyResetOtp}>
                <input placeholder={t.otp} value={resetOtp} onChange={e => setResetOtp(e.target.value)} required />
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
                <button type="submit" disabled={loading}>
                  {loading ? t.verifying : "Verify OTP"}
                </button>
                {renderResendOtpButton(handleInitiatePasswordReset)}
              </form>
            )}
            
            {resetStep === 3 && (
              <form onSubmit={handlePasswordReset}>
                <div className="password-rules" style={{ textAlign: 'left', fontSize: '0.8rem', color: '#666', marginBottom: '10px' }}>
                    <ul style={{ listStylePosition: 'inside', paddingLeft: '5px', margin: '0' }}>
                      <li>{t.passwordTooShort}</li>
                      <li>{t.passwordNeedsSpecialChar}</li>
                    
                    </ul>
                  </div>
                <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />

                {resetPasswordMatchError && <div className="field-error-label">{t.passwordsDoNotMatch}</div>}
                <input 
                  type="password" 
                  placeholder={t.confirmPassword} 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)}
                  className={resetPasswordMatchError ? 'input-validation-error' : ''}
                  required 
                />

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <button type="submit" disabled={loading || resetPasswordMatchError}>
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginPage;