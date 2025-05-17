import React from 'react';
import './styles/Footer.css';
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';

const Footer = ({ languageType = 'en' }) => {

  // Language content
  const content = {
    en: {
      copyright: '© 2025 Nagar Nigam Gorakhpur. - All rights reserved.',
      supportText: (
        <>
          Please feel free to contact our dedicated support team at <strong>9918000241</strong>.<br />
          Our support hours are <strong>Monday to Saturday, 10 AM – 6 PM</strong>.
        </>
      ),
      stayConnected: 'Stay connected with us',
      // Split the text to underline only 'Team Bludgers'
      madeBy: (
        <>Made by <span>Team Bludgers</span></>
      ),
    },
    hi: {
      copyright: '© 2025 नगर निगम गोरखपुर। - सर्वाधिकार सुरक्षित।',
       supportText: (
        <>
          कृपया बेझिझक हमारी समर्पित सहायता टीम से <strong>9918000241</strong> पर संपर्क करें।<br />
          हमारी सहायता का समय <strong>सोमवार से शनिवार, सुबह 10 बजे से शाम 6 बजे</strong> तक है।
        </>
      ),
      stayConnected: 'हमसे जुड़े रहें',
       // Split the text to underline only 'ब्लजर्स'
      madeBy: (
        <>टीम <span>ब्लजर्स</span> द्वारा निर्मित</>
      ),
    }
  };

  const currentContent = content[languageType] || content.en; // Default to English

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <p className="footer-text">
            {currentContent.copyright} {/* Dynamic copyright */}
          </p>
          <p className="footer-text">
            {currentContent.supportText} {/* Dynamic support text */}
          </p>

          <div className="footer-contact">
            <p className="footer-text-2">
              {currentContent.stayConnected} {/* Dynamic "Stay connected" text */}
            </p>
            <div className="footer-social">
              {/* Social icons remain the same */}
              <Facebook className="social-icon" size={20} />
              <Twitter className="social-icon" size={20} />
              <Instagram className="social-icon" size={20} />
              <Mail className="social-icon" size={20} />
            </div>
               <div className="footer-text-2">
            <a
              href="https://bludgers.vercel.app/"
              target="_blank" // Open in a new tab
              rel="noopener noreferrer" 
              style={{color:"white"}}
            >
              <u>{currentContent.madeBy} </u>{/* Dynamic "Made by" text with span */}
            </a>
          </div>
          </div>

       

        </div>
      </div>
    </footer>
  );
};

export default Footer;