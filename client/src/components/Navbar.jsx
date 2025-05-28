import React, { useState, useEffect, useRef } from 'react';
import './styles/Navbar.css';
import { Bell } from 'lucide-react';
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
  },
  hi: {
    logoTopText: 'नगर निगम गोरखपुर',
    logoBottomText: 'कल्याण मंडपम',
    login: 'लॉग इन करें',
    logout: 'लॉग आउट करें',
    noNotifications: 'कोई सूचना नहीं',
  }
};

const pathsToHideWhenLoggedOut = ['/book', '/refund-status'];

function Navbar({ languageType = 'en', user, notifications = [], onLogout, setLanguageType, isAdmin }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const notifRef = useRef(null);
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);

  const label = (item) => languageType === 'hi' ? item.hi : item.en;

  const currentText = textContent[languageType] || textContent.en;

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotif(false);
      }

      if (showMenu && menuRef.current && !menuRef.current.contains(event.target) &&
          hamburgerRef.current && !hamburgerRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu, showNotif]);

  const handleNavItemClick = (path) => {
    navigate(path);
    setShowMenu(false);
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
    setShowNotif(false);
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
            <span></span>
            <span></span>
            <span></span>
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
                  <span
                    className={languageType === 'hi' ? 'active' : ''}
                    onClick={() =>setLanguageType('hi')}
                  >अ</span>
                  <span>/</span>
                  <span
                    className={languageType === 'en' ? 'active' : ''}
                    onClick={() => setLanguageType('en')}
                  >A</span>
                </button>
              </div>

              {user && (
                <div className="notif" ref={notifRef}>
                  <button
                    className="notif__icon-btn"
                    aria-label={languageType === 'hi' ? 'सूचनाएं' : 'Notifications'}
                    onClick={() => setShowNotif(!showNotif)}
                  >
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
                <span className="navbar__username">{user.name}</span>
              )}

              <div className="auth-action">
                {user
                  ? <button className="btn btn--gov btn-primary-theme" onClick={() => { setShowMenu(false); onLogout(); }}>{currentText.logout}</button>
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
                ? <button className="btn btn--gov btn-primary-theme" onClick={() => { setShowMenu(false); onLogout(); }}>{currentText.logout}</button>
                : <button className="btn btn--gov btn-primary-theme" onClick={() => { setShowMenu(false); navigate('/login'); }}>{currentText.login}</button>
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
  );
}

export default Navbar;
