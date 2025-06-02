import React, { useState, useEffect, useRef } from 'react';
import './styles/Navbar.css'; // Make sure to create/update this CSS file
import { Bell, X, Edit3, Save, UserCircle } from 'lucide-react'; // Added X, Edit3, Save, UserCircle
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
    profile: 'Profile',
    editProfile: 'Edit Profile',
    save: 'Save',
    cancel: 'Cancel',
    name: 'Name',
    email: 'Email',
    userType: 'User Type',
    updateSuccess: 'Profile updated successfully!',
    updateError: 'Failed to update profile.',
  },
  hi: {
    logoTopText: 'नगर निगम गोरखपुर',
    logoBottomText: 'कल्याण मंडपम',
    login: 'लॉग इन करें',
    logout: 'लॉग आउट करें',
    noNotifications: 'कोई सूचना नहीं',
    profile: 'प्रोफ़ाइल',
    editProfile: 'प्रोफ़ाइल संपादित करें',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    name: 'नाम',
    email: 'ईमेल',
    userType: 'उपयोगकर्ता प्रकार',
    updateSuccess: 'प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!',
    updateError: 'प्रोफ़ाइल अपडेट करने में विफल।',
  }
};

const pathsToHideWhenLoggedOut = ['/book', '/refund-status'];

function Navbar({ languageType = 'en', user, notifications = [], onLogout, setLanguageType, isAdmin, onProfileUpdate }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfilePopover, setShowProfilePopover] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editableName, setEditableName] = useState(user?.name || '');
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });


  const navigate = useNavigate();
  const location = useLocation();
  const notifRef = useRef(null);
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);
  const profilePopoverRef = useRef(null);
  const usernameRef = useRef(null);


  const label = (item) => languageType === 'hi' ? item.hi : item.en;
  const currentText = textContent[languageType] || textContent.en;

  useEffect(() => {
    if (user) {
      setEditableName(user.name);
    }
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotif(false);
      }
      if (showMenu && menuRef.current && !menuRef.current.contains(event.target) &&
          hamburgerRef.current && !hamburgerRef.current.contains(event.target)) {
        setShowMenu(false);
      }
      if (profilePopoverRef.current && !profilePopoverRef.current.contains(event.target) &&
          usernameRef.current && !usernameRef.current.contains(event.target)) {
        setShowProfilePopover(false);
        setIsEditingProfile(false);
        setProfileMessage({ type: '', text: '' });
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu, showNotif, showProfilePopover]);

  const handleNavItemClick = (path) => {
    navigate(path);
    setShowMenu(false);
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
    setShowNotif(false);
    setShowProfilePopover(false);
  };

  const toggleProfilePopover = () => {
    setShowProfilePopover(!showProfilePopover);
    setIsEditingProfile(false); // Reset editing state when toggling
    setProfileMessage({ type: '', text: '' });
    if (user && !showProfilePopover) { // If opening and user exists
        setEditableName(user.name);
    }
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
    setProfileMessage({ type: '', text: '' });
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    if (user) setEditableName(user.name); // Reset to original name
    setProfileMessage({ type: '', text: '' });
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setProfileMessage({ type: 'error', text: 'Authentication token not found.' });
      // Handle token expiry or missing token, e.g., redirect to login
      onLogout(); // Or navigate('/login');
      return;
    }

    try {
      const response = await fetch('https://kalyanmandapam.onrender.com/api/auth/profile', { // Ensure this matches your backend route prefix if any
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editableName }),
      });

      const data = await response.json();

      if (response.ok) {
        setProfileMessage({ type: 'success', text: currentText.updateSuccess });
        setIsEditingProfile(false);
        // Update user in parent component or global state if applicable
        if (onProfileUpdate && data.user) {
          onProfileUpdate(data.user);
        } else if (user) { // Fallback to update local state for display if no callback
            // This is a simplified update; ideally, the parent component manages the user object
            // For Navbar to reflect change immediately if 'user' prop isn't directly mutable:
            // You might need a local copy of 'user' or a more robust state management.
            // For now, we assume onProfileUpdate or a page refresh will show the change.
            // Let's directly update the user.name which the popover uses if editableName changes
            // This is a bit of a hack if `user` prop is not updated from parent.
            // A better way would be to have onProfileUpdate update the parent's state.
            // For immediate visual feedback:
             if (user && data.user) {
                user.name = data.user.name; // This mutates the prop, which is not ideal.
                                          // Consider if 'user' should be state within Navbar, initialized by prop.
             }
        }
         setTimeout(() => setShowProfilePopover(false), 2000); // Close popover after success
      } else {
        setProfileMessage({ type: 'error', text: data.message || currentText.updateError });
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      setProfileMessage({ type: 'error', text: currentText.updateError });
    }
  };


  const displayedNavItems = isAdmin
    ? [
        { hi: 'होम', en: 'Home', path: '/' },
        { hi: 'हॉल प्रबंधन', en: 'Hall Management', path: '/admin/hall-management' },
        { hi: 'बुकिंग प्रबंधन', en: 'Booking Management', path: '/admin/booking-management' },
        { hi: 'बुकिंग सत्यापित करें', en: 'Verify Booking', path: '/admin/verify-booking' },
        
      ]
    : user
      ? navItems
      : navItems.filter(item => !pathsToHideWhenLoggedOut.includes(item.path));

  return (
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
                <div className="navbar__user-section" ref={usernameRef}>
                  <button className="navbar__username-btn" onClick={toggleProfilePopover}>
                    <UserCircle size={20} style={{ marginRight: '5px' }} />
                    {user.name}
                  </button>
                  {showProfilePopover && (
                    <div className="profile-popover" ref={profilePopoverRef}>
                      <button className="profile-popover__close" onClick={toggleProfilePopover}><X size={18} /></button>
                      <h4>{currentText.profile}</h4>
                      {profileMessage.text && <p className={`profile-message ${profileMessage.type}`}>{profileMessage.text}</p>}
                      {!isEditingProfile ? (
                        <>
                          <div className="profile-details">
                            <p><strong>{currentText.name}:</strong> {user.name}</p>
                            <p><strong>{currentText.email}:</strong> {user.email}</p>
                            <p><strong>{currentText.userType}:</strong> {user.userType}</p>
                          </div>
                          <button className="btn btn--sm btn--profile-action" onClick={handleEditProfile}>
                            <Edit3 size={16} /> {currentText.editProfile}
                          </button>
                        </>
                      ) : (
                        <div className="profile-edit-form">
                          <div className="form-group">
                            <label htmlFor="profileName">{currentText.name}:</label>
                            <input
                              type="text"
                              id="profileName"
                              value={editableName}
                              onChange={(e) => setEditableName(e.target.value)}
                            />
                          </div>
                           <p><strong>{currentText.email}:</strong> {user.email} <small>(cannot be changed)</small></p>
                           <p><strong>{currentText.userType}:</strong> {user.userType} <small>(cannot be changed)</small></p>
                          <div className="profile-edit-actions">
                            <button className="btn btn--sm btn-primary-theme" onClick={handleSaveProfile}>
                              <Save size={16} /> {currentText.save}
                            </button>
                            <button className="btn btn--sm btn--outline" onClick={handleCancelEdit}>
                              {currentText.cancel}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="auth-action">
                {user
                  ? <button className="btn btn--gov btn-primary-theme" onClick={() => { setShowMenu(false); setShowProfilePopover(false); onLogout(); }}>{currentText.logout}</button>
                  : <button className="btn btn--gov btn-primary-theme" onClick={() => { setShowMenu(false); navigate('/login'); }}>{currentText.login}</button>}
              </div>
            </div>
          </div>
        </div>

        <div className={`navbar__mobile-menu ${showMenu ? 'show' : ''}`} ref={menuRef}>
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
            <li className="nav-item nav-item--gov mobile-auth">
              {user
                ? (
                  <>
                  <div className="mobile-user-info">
                    <button className="navbar__username-btn" onClick={toggleProfilePopover}>
                      <UserCircle size={20} /> {user.name}
                    </button>
                    {/* Popover can be adapted for mobile or use a separate modal if complex */}
                  </div>
                  <button className="btn btn--gov btn-primary-theme" onClick={() => { setShowMenu(false); setShowProfilePopover(false); onLogout(); }}>{currentText.logout}</button>
                  </>
                )
                : <button className="btn btn--gov btn-primary-theme" onClick={() => { setShowMenu(false); navigate('/login'); }}>{currentText.login}</button>
              }
            </li>
          </ul>
           {/* Mobile Popover - can be improved with modal styling */}
            {user && showProfilePopover && showMenu && (
                <div className="profile-popover mobile-profile-popover" ref={profilePopoverRef}>
                     <button className="profile-popover__close" onClick={toggleProfilePopover}><X size={18} /></button>
                      <h4>{currentText.profile}</h4>
                      {profileMessage.text && <p className={`profile-message ${profileMessage.type}`}>{profileMessage.text}</p>}
                      {!isEditingProfile ? (
                        <>
                          <div className="profile-details">
                            <p><strong>{currentText.name}:</strong> {user.name}</p>
                            <p><strong>{currentText.email}:</strong> {user.email}</p>
                            <p><strong>{currentText.userType}:</strong> {user.userType}</p>
                          </div>
                          <button className="btn btn--sm btn--profile-action" onClick={handleEditProfile}>
                            <Edit3 size={16} /> {currentText.editProfile}
                          </button>
                        </>
                      ) : (
                        <div className="profile-edit-form">
                          <div className="form-group">
                            <label htmlFor="profileNameMobile">{currentText.name}:</label>
                            <input
                              type="text"
                              id="profileNameMobile"
                              value={editableName}
                              onChange={(e) => setEditableName(e.target.value)}
                            />
                          </div>
                           <p><strong>{currentText.email}:</strong> {user.email} <small>(cannot be changed)</small></p>
                           <p><strong>{currentText.userType}:</strong> {user.userType} <small>(cannot be changed)</small></p>
                          <div className="profile-edit-actions">
                            <button className="btn btn--sm btn-primary-theme" onClick={handleSaveProfile}>
                              <Save size={16} /> {currentText.save}
                            </button>
                            <button className="btn btn--sm btn--outline" onClick={handleCancelEdit}>
                              {currentText.cancel}
                            </button>
                          </div>
                        </div>
                      )}
                </div>
            )}
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
  );
}

export default Navbar;