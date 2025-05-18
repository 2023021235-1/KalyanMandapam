import React, { useState, useEffect, useRef } from 'react';
import './styles/Navbar.css';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Navigation items for the menu
const navItems = [
  { hi: 'होम',               en: 'Home'             },
  { hi: 'अभी बुक करें',       en: 'Book Now'         },
  { hi: 'किराया जांचें',      en: 'Check Rent'       },
  { hi: 'उपलब्धता जांचें',  en: 'Check Availability' },
  { hi: 'रिफंड स्थिति',     en: 'Refund Status'    },
  { hi: 'संपर्क करें',       en: 'Contact Us'       },
  { hi: 'प्रश्न और प्रतिक्रिया', en: 'Query & Feedback' },
];

// Text content for other parts of the navbar
const textContent = {
  en: {
    logoTopText: 'Nagar Nigam Gorakhpur', // Existing logo text
    logoBottomText: 'Kalyan Mandapam',    // New text for Kalyan Mandapam
    login: 'Login',
    logout: 'Logout',
    noNotifications: 'No notifications',
  },
  hi: {
    logoTopText: 'नगर निगम गोरखपुर',
    logoBottomText: 'कल्याण मंडपम',
    login: 'लॉग इन करें',
    logout: 'लॉग आउट करें',
    noNotifications: 'कोई सूचना नहीं',
  }
};


function Navbar({ languageType = 'en', user, notifications = [], onLogout, setLanguageType }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const navigate = useNavigate();
  const notifRef = useRef(null);
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);

  // Helper function to get localized label
  const label = (item) => languageType === 'hi' ? item.hi : item.en;

  // Get the current text content based on language
  const currentText = textContent[languageType] || textContent.en;

  // Effect to handle clicks outside notification dropdown and mobile menu
  useEffect(() => {
    function handleClickOutside(event) {
      // Close notification dropdown if clicking outside
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotif(false);
      }

      // Close mobile menu if clicking outside (and not on hamburger)
      if (showMenu && menuRef.current && !menuRef.current.contains(event.target) &&
          hamburgerRef.current && !hamburgerRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }

    // Add event listener when components mount
    document.addEventListener('mousedown', handleClickOutside);

    // Clean up event listener on unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu, showNotif]); // Dependencies

  // Function to handle navigation item clicks
  const handleNavItemClick = (englishLabel) => {
    // Navigate based on the English label of the clicked item
    switch (englishLabel) {
      case 'Home':
        navigate('/'); // Navigate to the home page
        break;
      case 'Book Now':
        navigate('/book'); // Navigate to the book now page
        break;
      case 'Check Rent':
        navigate('/check-rent'); // Navigate to check rent route
        break;
      case 'Check Availability':
         navigate('/availability'); // Navigate to availability page
        break;
      case 'Refund Status':
        navigate('/refund-status'); // Navigate to refund status route
        break;
       case 'Contact Us':
        navigate('/contact'); // Navigate to contact us page
        break;
      case 'Query & Feedback':
        navigate('/feedback'); // Navigate to query & feedback page
        break;
      default:
        console.warn('Unhandled nav item:', englishLabel); // Log if an item is not handled
    }
    // Close the mobile menu after clicking an item
    setShowMenu(false);
  };

  // Toggle the visibility of the mobile menu
  const toggleMenu = () => {
    setShowMenu(!showMenu);
    setShowNotif(false); // Close notifications when opening/closing menu
  };

  return (
    // Main nav element with base styles
    <nav className="navbar navbar--gov">
      <div className="navbar__container"> {/* Container for max width and centering */}
        <div className="navbar__top-row"> {/* Top row containing logo, actions, etc. */}
          {/* Hamburger menu button (visible on mobile) */}
          <button
            ref={hamburgerRef} // Ref for click outside logic
            className={`hamburger ${showMenu ? 'active' : ''}`} // Active class for animation
            aria-label={languageType === 'hi' ? 'मेनू टॉगल करें' : 'Toggle menu'}
            onClick={toggleMenu} // Toggle menu on click
          >
            <span></span> {/* Hamburger lines */}
            <span></span>
            <span></span>
          </button>

          {/* Logo area */}
          <div className="navbar__logo"> {/* Container for logo image and text headings */}
            <img src="./logo.webp" alt="Logo" className="navbar__logo-img" /> {/* Logo image */}
            {/* Container for stacked text headings */}
            <div className="navbar__logo-text-container"> {/* New container for text */}
              <span className="gov-logo">{currentText.logoTopText}</span> {/* Existing top text */}
              <span className="kalyan-mandapam-heading">{currentText.logoBottomText}</span> {/* New bottom text */}
            </div>
          </div>

          {/* Right side actions */}
          <div className="navbar__actions"> {/* Container for controls, user info, auth buttons */}
            {/* Language toggle and notification bell */}
            <div className="navbar__controls"> {/* Container for language and notifications */}
              <div className="lang-toggle-container"> {/* Language toggle wrapper */}
                <button className="lang-toggle" aria-label={languageType === 'hi' ? 'भाषा बदलें' : 'Toggle language'}>
                  {/* Hindi language option */}
                  <span
                    className={languageType === 'hi' ? 'active' : ''}
                    onClick={() =>setLanguageType('hi')}
                  >अ</span>
                  <span>/</span>
                   {/* English language option */}
                  <span
                    className={languageType === 'en' ? 'active' : ''}
                    onClick={() => setLanguageType('en')}
                  >A</span>
                </button>
              </div>

              {/* Notification bell and dropdown (only if user is logged in) */}
              {user && (
                <div className="notif" ref={notifRef}> {/* Notification container */}
                  <button
                    className="notif__icon-btn"
                    aria-label={languageType === 'hi' ? 'सूचनाएं' : 'Notifications'}
                    onClick={() => setShowNotif(!showNotif)} // Toggle notification dropdown
                  >
                    <Bell size={20} /> {/* Bell icon */}
                    {/* Notification badge (if notifications exist) */}
                    {notifications.length > 0 && <span className="notif__badge">{notifications.length}</span>}
                  </button>
                  {/* Notification dropdown list */}
                  {showNotif && (
                    <ul className="notif__dropdown">
                      {notifications.length > 0
                        ? notifications.map((n, i) => <li key={i} className="notif__item">{n}</li>) // List notifications
                        : <li className="notif__empty">{currentText.noNotifications}</li>} {/* Message if no notifications */}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Desktop-only elements (username and auth button) */}
            <div className="navbar__desktop-only"> {/* Container for desktop specific elements */}
              {/* Display username if logged in */}
              {user && (
                <span className="navbar__username">{user.name}</span>
              )}

              {/* Login/Logout button */}
              <div className="auth-action"> {/* Wrapper for auth button */}
                {user // Check if user is logged in
                  ? <button className="btn btn--gov btn-primary-theme" onClick={() => { setShowMenu(false); onLogout(); }}>{currentText.logout}</button> // Logout button
                  : <button className="btn btn--gov btn-primary-theme" onClick={() => { setShowMenu(false); navigate('/login'); }}>{currentText.login}</button>} {/* Login button */}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu (toggles visibility) */}
        <div className={`navbar__mobile-menu ${showMenu ? 'show' : ''}`} ref={menuRef}> {/* Mobile menu container */}
          <ul className="navbar__menu"> {/* Mobile navigation list */}
            {navItems.map((item, idx) => (
              <li
                key={idx}
                className="nav-item nav-item--gov" // Mobile menu item styles
                onClick={() => handleNavItemClick(item.en)} // Handle click and close menu
              >
                {label(item)} {/* Display localized label */}
              </li>
            ))}

            {/* Mobile authentication button (duplicate for mobile menu) */}
            <li className="nav-item nav-item--gov mobile-auth"> {/* Mobile auth item styles */}
              {user // Check if user is logged in
                ? <button className="btn btn--gov btn-primary-theme" onClick={() => { setShowMenu(false); onLogout(); }}>{currentText.logout}</button> // Logout button for mobile
                : <button className="btn btn--gov btn-primary-theme" onClick={() => { setShowMenu(false); navigate('/login'); }}>{currentText.login}</button> // Login button for mobile
              }
            </li>
          </ul>
        </div>

         {/* Desktop bottom row navigation (visible on desktop) */}
         {/* The `true || user` condition here seems incorrect if you only want it for logged-in users. */}
         {/* Assuming you want this visible always on desktop */}
          <div className='navbar__desktop-only'> {/* Wrapper to show only on desktop */}
           {/* {(true || user) && (  // Removed the possibly incorrect condition */}
           <div className="navbar__bottom-row"> {/* Bottom row container */}
             <ul className="navbar__menu"> {/* Desktop navigation list */}
               {navItems.map((item, idx) => (
                 <li
                   key={idx}
                   className="nav-item nav-item--gov" // Desktop menu item styles
                   onClick={() => handleNavItemClick(item.en)} // Handle navigation
                 >
                   {label(item)} {/* Display localized label */}
                 </li>
               ))}
             </ul>
           </div>
           {/* )} */}
           </div>
      </div>
    </nav>
  );
}

export default Navbar;