import React, { useState, useEffect, useRef } from 'react';
import './styles/Navbar.css';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { hi: 'होम',               en: 'Home'             },
  { hi: 'हमारे बारे में',     en: 'About Us'         },
  { hi: 'सुविधाएं',           en: 'Facilities'       },
  { hi: 'सेवाएं',             en: 'Services'         },
  { hi: 'गैलरी',              en: 'Gallery'          },
  { hi: 'उपलब्धता और बुकिंग', en: 'Availability & Booking' },
  { hi: 'संपर्क करें',       en: 'Contact Us'       },
];

// Text content for other parts of the navbar - Reverted logo text
const textContent = {
  en: {
    logoText: 'Nagar Nigam Gorakhpur', // Reverted logo text
    login: 'Login',
    logout: 'Logout',
    noNotifications: 'No notifications',
  },
  hi: {
    logoText: 'नगर निगम गोरखपुर', // Reverted logo text
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


  const handleNavItemClick = (englishLabel) => {
    switch (englishLabel) {
      case 'Home':
        navigate('/');
        break;
      case 'About Us':
        navigate('/about');
        break;
      case 'Facilities':
         navigate('/facilities');
        break;
      case 'Services':
        navigate('/services');
        break;
      case 'Gallery':
        navigate('/gallery');
        break;
      case 'Availability & Booking':
        navigate('/booking');
        break;
       case 'Contact Us':
        navigate('/contact');
        break;
      default:
        console.warn('Unhandled nav item:', englishLabel);
    }
    setShowMenu(false);
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
    setShowNotif(false);
  };

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
            <img src="./logo.webp" alt="Logo" className="navbar__logo-img" />
            <span className="gov-logo">{currentText.logoText}</span> {/* This will now display Nagar Nigam Gorakhpur */}
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
            {navItems.map((item, idx) => (
              <li
                key={idx}
                className="nav-item nav-item--gov"
                onClick={() => handleNavItemClick(item.en)}
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
           {(true || user) && (
           <div className="navbar__bottom-row">
             <ul className="navbar__menu">
               {navItems.map((item, idx) => (
                 <li
                   key={idx}
                   className="nav-item nav-item--gov"
                   onClick={() => handleNavItemClick(item.en)}
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