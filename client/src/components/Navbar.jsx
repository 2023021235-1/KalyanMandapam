import React, { useState, useEffect, useRef, useCallback } from 'react';
import './styles/Navbar.css'; // Make sure to create/update this CSS file
import { Bell, X, Edit3, Save, UserCircle, KeyRound, Phone,User,  ChevronDown, Eye, EyeOff } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { hi: 'होम',             en: 'Home', path: '/' },
  { hi: 'अभी बुक करें',   en: 'Book Now', path: '/book' },
  { hi: 'किराया जांचें',   en: 'Check Rent', path: '/check-rent' },
  { hi: 'उपलब्धता जांचें',  en: 'Check Availability', path: '/availability' },
  { hi: 'रिफंड स्थिति',    en: 'Refund Status', path: '/refund-status' },
  { hi: 'संपर्क करें',      en: 'Contact Us', path: '/contact' },
  { hi: 'प्रश्न और प्रतिक्रिया', en: 'Query & Feedback', path: '/feedback' },
];

const textContent = {
  en: {
    logoTopText: 'Nagar Nigam Gorakhpur',
    logoBottomText: 'Kalyan Mandapam',
    login: 'Login',
    logout: 'Logout',
    noNotifications: 'No notifications',
    profile: 'Profile Settings',
    editProfile: 'Edit Profile',
    save: 'Save Changes',
    cancel: 'Cancel',
    name: 'Name',
    email: 'Email',
    phone: 'Phone Number',
    userType: 'User Type',
    updateSuccess: 'Profile updated successfully!',
    updateError: 'Failed to update profile.',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    passwordsDoNotMatch: 'New passwords do not match.',
    passwordUpdateSuccess: 'Password updated successfully!',
    passwordUpdateError: 'Failed to update password.',
    changePhone: 'Update Phone Number',
    newPhone: 'New Phone Number',
    sendOtp: 'Send OTP',
    otp: 'Enter OTP',
    verifyOtp: 'Verify & Update',
    otpSent: 'OTP sent to your new phone number.',
    phoneUpdateSuccess: 'Phone number updated successfully!',
    phoneUpdateError: 'Failed to update phone number.',
  },
  hi: {
    logoTopText: 'नगर निगम गोरखपुर',
    logoBottomText: 'कल्याण मंडपम',
    login: 'लॉग इन करें',
    logout: 'लॉग आउट करें',
    noNotifications: 'कोई सूचना नहीं',
    profile: 'प्रोफ़ाइल सेटिंग्स',
    editProfile: 'प्रोफ़ाइल संपादित करें',
    save: 'बदलाव सहेजें',
    cancel: 'रद्द करें',
    name: 'नाम',
    email: 'ईमेल',
    phone: 'फ़ोन नंबर',
    userType: 'उपयोगकर्ता प्रकार',
    updateSuccess: 'प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!',
    updateError: 'प्रोफ़ाइल अपडेट करने में विफल।',
    changePassword: 'पासवर्ड बदलें',
    currentPassword: 'वर्तमान पासवर्ड',
    newPassword: 'नया पासवर्ड',
    confirmNewPassword: 'नए पासवर्ड की पुष्टि करें',
    passwordsDoNotMatch: 'नया पासवर्ड मेल नहीं खाता।',
    passwordUpdateSuccess: 'पासवर्ड सफलतापूर्वक अपडेट किया गया!',
    passwordUpdateError: 'पासवर्ड अपडेट करने में विफल।',
    changePhone: 'फ़ोन नंबर अपडेट करें',
    newPhone: 'नया फ़ोन नंबर',
    sendOtp: 'ओटीपी भेजें',
    otp: 'ओटीपी दर्ज करें',
    verifyOtp: 'सत्यापित करें और अपडेट करें',
    otpSent: 'आपके नए फ़ोन नंबर पर OTP भेज दिया गया है।',
    phoneUpdateSuccess: 'फ़ोन नंबर सफलतापूर्वक अपडेट किया गया!',
    phoneUpdateError: 'फ़ोन नंबर अपडेट करने में विफल।',
  }
};

const pathsToHideWhenLoggedOut = ['/book', '/refund-status'];
const backendUrl = 'http://localhost:5000'; // Your backend URL

function Navbar({ languageType = 'en', user, notifications = [], onLogout, setLanguageType, isAdmin, setUser }) {
  // --- STATE MANAGEMENT ---
  const [showMenu, setShowMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfilePopover, setShowProfilePopover] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [isEditMode, setIsEditMode] = useState(false);

  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const [editableName, setEditableName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordMatchError, setPasswordMatchError] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [phoneUpdateStep, setPhoneUpdateStep] = useState('idle');

  // --- REFS & ROUTING ---
  const navigate = useNavigate();
  const location = useLocation();
  const notifRef = useRef(null);
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);
  const profilePopoverRef = useRef(null);
  const userDisplayRef = useRef(null);
  
  const label = (item) => languageType === 'hi' ? item.hi : item.en;
  const currentText = textContent[languageType] || textContent.en;

  // --- LIFECYCLE HOOKS ---


  useEffect(() => {
    setPasswordMatchError(confirmNewPassword && newPassword !== confirmNewPassword);
  }, [newPassword, confirmNewPassword]);

  // --- HELPER FUNCTIONS ---

  const resetFormState = useCallback(() => {
    setProfileMessage({ type: '', text: '' });
    if(user) setEditableName(user.name);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setPasswordMatchError(false);
    setNewPhone('');
    setOtp('');
    setPhoneUpdateStep('idle');
    setIsPasswordOpen(false);
    setIsPhoneOpen(false);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
  }, [user]);
  const closeAndResetProfile = useCallback(() => {
    setShowProfilePopover(false);
    setShowProfileModal(false);
    setIsEditMode(false);
    resetFormState();
  }, [resetFormState]); // Depends on the stable resetFormState
      useEffect(() => {
    if (user) setEditableName(user.name || '');
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotif(false);
      if (showMenu && menuRef.current && !menuRef.current.contains(event.target) && hamburgerRef.current && !hamburgerRef.current.contains(event.target)) setShowMenu(false);
      if (profilePopoverRef.current && !profilePopoverRef.current.contains(event.target) && userDisplayRef.current && !userDisplayRef.current.contains(event.target)) {
        closeAndResetProfile();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu, showProfilePopover,closeAndResetProfile]);
  const processApiResponse = (response, data) => {
    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, message: data.message || 'An unknown error occurred.' };
    }
  };

  // --- API HANDLERS ---
  const handleRequestPhoneUpdate = async () => {
    if (!newPhone) return;
    try {
        const response = await fetch(`${backendUrl}/api/auth/profile/request-phone-update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPhone: `+91${newPhone}` }), // Assuming +91 for India
            credentials: 'include' 
        });
        const data = await response.json();
        const result = processApiResponse(response, data);

        if (result.success) {
            setProfileMessage({ type: 'success', text: currentText.otpSent });
            setPhoneUpdateStep('awaiting-otp');
        } else {
            setProfileMessage({ type: 'error', text: result.message });
        }
    } catch (error) {
        setProfileMessage({ type: 'error', text: currentText.phoneUpdateError });
    }
  };

  const handleConfirmPhoneUpdate = async () => {
    if (!otp) return;
    try {
        const response = await fetch(`${backendUrl}/api/auth/profile/confirm-phone-update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ otp }),
            credentials: 'include' 
        });
        const data = await response.json();
        const result = processApiResponse(response, data);

        if (result.success) {
            setProfileMessage({ type: 'success', text: currentText.phoneUpdateSuccess });
            const updatedUser = { ...user, phone: result.data.phone };
            setUser(updatedUser); // Update parent state
            setPhoneUpdateStep('idle');
            setNewPhone('');
            setOtp('');
        } else {
            setProfileMessage({ type: 'error', text: result.message });
        }
    } catch (error) {
        setProfileMessage({ type: 'error', text: currentText.phoneUpdateError });
    }
  };

  const handleSaveName = async () => {
    if (!editableName.trim()) return { success: false, message: 'Name cannot be empty.' };
    try {
      const response = await fetch(`${backendUrl}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editableName }),
        credentials: 'include'
      });
      const data = await response.json();
      return processApiResponse(response, data);
    } catch (error) {
      return { success: false, message: currentText.updateError };
    }
  };
  
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || newPassword !== confirmNewPassword) {
      return { success: false, message: currentText.passwordUpdateError };
    }
    try {
        const response = await fetch(`${backendUrl}/api/auth/profile/change-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword }),
            credentials: 'include' 
        });
        const data = await response.json();
        return processApiResponse(response, data);
    } catch (error) {
        return { success: false, message: currentText.passwordUpdateError };
    }
  };

  const handleSaveAllChanges = async () => {
    let updatesMade = 0;
    let errors = [];
    setProfileMessage({ type: '', text: '' }); 

    if (passwordMatchError) {
        errors.push(currentText.passwordsDoNotMatch);
    } else if (newPassword.trim()) {
        if (!currentPassword.trim()) {
            errors.push("Current password is required to set a new one.");
        } else {
            const result = await handleChangePassword();
            if(result.success) {
                updatesMade++;
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
            } else {
                errors.push(result.message);
            }
        }
    }
    
    if (editableName.trim() && editableName.trim() !== user.name) {
        const result = await handleSaveName();
        if(result.success) {
          updatesMade++;
          const updatedUser = { ...user, name: result.data.user.name };
          setUser(updatedUser); // Update parent state
        } else {
          errors.push(result.message);
        }
    }
    
    if (errors.length > 0) {
        setProfileMessage({ type: 'error', text: errors.join(' ') });
    } else if (updatesMade > 0) {
        setProfileMessage({ type: 'success', text: currentText.updateSuccess });
        setTimeout(() => closeAndResetProfile(), 1500);
    } else {
        setIsEditMode(false); // No changes were made, just exit edit mode
    }
  };

  // --- UI HANDLERS ---
  const handleEdit = () => {
    setIsEditMode(true);
    setProfileMessage({ type: '', text: '' });
  };
  const handleCancel = () => {
    setIsEditMode(false);
    resetFormState();
  };
  const handleLogout = () => { onLogout(); closeAndResetProfile(); };
  const handleLoginNav = () => { navigate('/login'); closeAndResetProfile(); };
  const toggleMenu = () => setShowMenu(!showMenu);
  
  const handleDesktopProfileClick = () => setShowProfilePopover(!showProfilePopover);
  const handleMobileProfileClick = () => {
    setShowMenu(false);
    setShowProfileModal(true);
  };
  const handleNavItemClick = (path) => {
    navigate(path);
    setShowMenu(false);
  };

  const displayedNavItems = isAdmin
    ? [
        { hi: 'होम', en: 'Home', path: '/' },
        { hi: 'हॉल प्रबंधन', en: 'Hall Management', path: '/admin/hall-management' },
        { hi: 'बुकिंग प्रबंधन', en: 'Booking Management', path: '/admin/booking-management' },
        { hi: 'बुकिंग सत्यापित करें', en: 'Verify Booking', path: '/admin/verify-booking' },
        {hi: 'प्रशासन प्रबंधन', en: 'Admin Management', path: '/admin/admin-management' },
        { hi: 'आंकड़े', en: 'Statistics', path: '/admin/stats' },
      ]
    : user
      ? navItems
      : navItems.filter(item => !pathsToHideWhenLoggedOut.includes(item.path));

  // --- RENDER PROFILE UI ---
  const renderProfileUI = (onClose) => {
    return (
        <>
            <div className="profile-header">
                <div className="profile-title">
                    <UserCircle size={20} />
                    {isEditMode ? currentText.editProfile : currentText.profile}
                </div>
                <button className="close-btn" onClick={onClose}><X size={18} /></button>
            </div>

            {profileMessage.text && (
                <div className={`profile-message ${profileMessage.type}`}>{profileMessage.text}</div>
            )}
            
            {isEditMode ? (
                // --- Edit View ---
                <div className="profile-content edit-mode">
                    <div className="edit-sections">
                        {/* Name Section */}
                        <div className="edit-section">
                            <div className="section-header"><User size={18} /> <h4>{currentText.name}</h4></div>
                            <div className="form-field">
                                <input type="text" value={editableName} onChange={(e) => setEditableName(e.target.value)} placeholder="Enter your full name" className="form-input" />
                            </div>
                        </div>
                        {/* Password Section */}
                        <div className="edit-section">
                            <div className="section-header collapsible" onClick={() => setIsPasswordOpen(!isPasswordOpen)}>
                                <div className='collapsible-title'><KeyRound size={18} /> <h4>{currentText.changePassword}</h4></div>
                                <ChevronDown size={20} className={`chevron-icon ${isPasswordOpen ? 'open' : ''}`} />
                            </div>
                            {isPasswordOpen && (
                                <div className="collapsible-content">
                                    <div className="form-field password-field-wrapper">
                                        <input type={showCurrentPassword ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder={currentText.currentPassword} className="form-input" />
                                        <button type="button" className="password-toggle-icon" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>{showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                    </div>
                                    <div className="form-field password-field-wrapper">
                                        <input type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder={currentText.newPassword} className="form-input" />
                                        <button type="button" className="password-toggle-icon" onClick={() => setShowNewPassword(!showNewPassword)}>{showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                    </div>
                                    <div className="form-field password-field-wrapper">
                                        {passwordMatchError && (<label className="error-label">{currentText.passwordsDoNotMatch}</label>)}
                                        <input type={showConfirmNewPassword ? 'text' : 'password'} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder={currentText.confirmNewPassword} className={`form-input ${passwordMatchError ? 'input-error' : ''}`} />
                                        <button type="button" className="password-toggle-icon" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}>{showConfirmNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Phone Section */}
                        <div className="edit-section">
                            <div className="section-header collapsible" onClick={() => setIsPhoneOpen(!isPhoneOpen)}>
                                <div className='collapsible-title'><Phone size={18} /> <h4>{currentText.changePhone}</h4></div>
                                <ChevronDown size={20} className={`chevron-icon ${isPhoneOpen ? 'open' : ''}`} />
                            </div>
                            {isPhoneOpen && (
                                <div className="collapsible-content">
                                    {phoneUpdateStep === 'idle' && (
                                        <>
                                            <div className="phone-input">
                                                <span className="country-code">+91</span>
                                                <input type="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="1234567890" className="form-input phone-number-input"/>
                                            </div>
                                            <button className="otp-btn" onClick={handleRequestPhoneUpdate}>{currentText.sendOtp}</button>
                                        </>
                                    )}
                                    {phoneUpdateStep === 'awaiting-otp' && (
                                        <>
                                            <div className="form-field">
                                                <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder={currentText.otp} className="form-input"/>
                                            </div>
                                            <div className="otp-actions">
                                                <button className="verify-btn" onClick={handleConfirmPhoneUpdate}>{currentText.verifyOtp}</button>
                                                <button className="cancel-otp-btn" onClick={() => { setPhoneUpdateStep('idle'); setOtp(''); setProfileMessage({type:'', text:''}); }}>{currentText.cancel}</button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                       
                       
                    </div>
                </div>
            ) : (
                // --- Display View ---
                <div className="profile-content">
                    <div className="info-card">
                        <div className="info-row">
                            <div className="info-label"><User size={18} className="info-icon" /> {currentText.name}</div>
                            <div className="info-value">{user?.name}</div>
                        </div>
                         <div className="info-row">
                            <div className="info-label"><Phone size={18} className="info-icon" /> {currentText.phone}</div>
                            <div className="info-value">{user?.phone || 'Not set'}</div>
                        </div>
                      
                    </div>
                    <div className="profile-actions">
                        <button className="edit-btn" onClick={handleEdit}><Edit3 size={16} /> {currentText.editProfile}</button>
                    </div>
                </div>
            )}

            {isEditMode && (
                <div className="profile-footer">
                    <button className="cancel-btn" onClick={handleCancel}>{currentText.cancel}</button>
                    <button className="save-btn" onClick={handleSaveAllChanges} disabled={passwordMatchError}><Save size={16} /> {currentText.save}</button>
                </div>
            )}
        </>
    );
  }

  return (
    <>
      <nav className="navbar navbar--gov">
        <div className="navbar__container">
          <div className="navbar__top-row">
            <button
              ref={hamburgerRef}
              className={`hamburger ${showMenu ? 'active' : ''}`}
              aria-label={languageType === 'hi' ? 'मेनू टॉगल करें' : 'Toggle menu'}
              onClick={toggleMenu}
            >
              <span></span><span></span><span></span>
            </button>

            <div className="navbar__logo">
              <img src="/logo.webp" alt="Logo" className="navbar__logo-img" />
              <div className="navbar__logo-text-container">
                <span className="gov-logo">{currentText.logoTopText}</span>
                <span className="kalyan-mandapam-heading">{currentText.logoBottomText}</span>
              </div>
            </div>

            <div className="navbar__actions">
              <div className="navbar__controls">
                <div className="lang-toggle-container">
                  <button className="lang-toggle" aria-label={languageType === 'hi' ? 'भाषा बदलें' : 'Toggle language'}>
                    <span className={languageType === 'hi' ? 'active' : ''} onClick={() =>setLanguageType('hi')}>अ</span>
                    <span>/</span>
                    <span className={languageType === 'en' ? 'active' : ''} onClick={() => setLanguageType('en')}>A</span>
                  </button>
                </div>

                {user && (
                  <div className="notif" ref={notifRef}>
                    <button className="notif__icon-btn" aria-label={languageType === 'hi' ? 'सूचनाएं' : 'Notifications'} onClick={() => setShowNotif(!showNotif)}>
                      <Bell size={20} />
                      {notifications.length > 0 && <span className="notif__badge">{notifications.length}</span>}
                    </button>
                    {showNotif && (
                      <ul className="notif__dropdown">
                        {notifications.length > 0
                          ? notifications.map((n, i) => <li key={i} className="notif__item">{n}</li>)
                          : <li className="notif__empty">{currentText.noNotifications}</li>}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              <div className="navbar__desktop-only">
                {user && (
                  <div className="navbar__user-section" ref={userDisplayRef}>
                    <button className="navbar__username-btn" onClick={handleDesktopProfileClick}>
                      <UserCircle size={24} />
                      <span>{user.name}</span>
                    </button>
                    {showProfilePopover && (
                        <div className="profile-popover" ref={profilePopoverRef}>
                            {renderProfileUI(closeAndResetProfile)}
                        </div>
                    )}
                  </div>
                )}

                <div className="auth-action">
                  {user
                    ? <button className="btn btn--gov btn-primary-theme" onClick={handleLogout}>{currentText.logout}</button>
                    : <button className="btn btn--gov btn-primary-theme" onClick={handleLoginNav}>{currentText.login}</button>}
                </div>
              </div>
            </div>
          </div>

          <div className={`navbar__mobile-menu ${showMenu ? 'show' : ''}`} ref={menuRef}>
            <ul className="navbar__menu">
              {user && (
                <li className="nav-item nav-item--gov mobile-user-profile-section">
                    <div className="mobile-user-info" onClick={handleMobileProfileClick}>
                        <UserCircle size={20} /> {user.name}
                        <Edit3 size={16} style={{marginLeft: 'auto'}}/>
                    </div>
                </li>
              )}
              {displayedNavItems.map((item, idx) => (
                <li
                  key={idx}
                  className={`nav-item nav-item--gov ${location.pathname === item.path ? 'active-nav-item' : ''}`}
                  onClick={() => handleNavItemClick(item.path)}
                >
                  {label(item)}
                </li>
              ))}
              <li className="nav-item nav-item--gov mobile-auth">
                {user
                  ? <button className="btn btn--gov btn-primary-theme" onClick={handleLogout}>{currentText.logout}</button>
                  : <button className="btn btn--gov btn-primary-theme" onClick={handleLoginNav}>{currentText.login}</button>
                }
              </li>
            </ul>
          </div>

          <div className='navbar__desktop-only'>
            {displayedNavItems.length > 0 && (
              <div className="navbar__bottom-row">
                <ul className="navbar__menu">
                  {displayedNavItems.map((item, idx) => (
                    <li
                      key={idx}
                      className={`nav-item nav-item--gov ${location.pathname === item.path ? 'active-nav-item' : ''}`}
                      onClick={() => handleNavItemClick(item.path)}
                    >
                      {label(item)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Fullscreen Modal for Mobile Profile */}
      {showProfileModal && (
        <div className="profile-modal-overlay" onClick={closeAndResetProfile}>
            <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
                {renderProfileUI(closeAndResetProfile)}
            </div>
        </div>
      )}
    </>
  );
}

export default Navbar;