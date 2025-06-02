import React from 'react';
import './styles/RegisterSteps.css';
import { useNavigate } from 'react-router-dom';

// Icon components (These remain the same as they are SVG and fit the steps)
const MobileIcon = () => (
  <svg viewBox="0 0 384 512" fill="currentColor" className="rs-step-icon">
    <path d="M80 48c-8.8 0-16 7.2-16 16V448c0 8.8 7.2 16 16 16h224c8.8 0 16-7.2 16-16V64c0-8.8-7.2-16-16-16H80zM16 64C16 28.7 44.7 0 80 0h224c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H80c-35.3 0-64-28.7-64-64V64zM160 400h64c8.8 0 16 7.2 16 16s-7.2 16-16 16H160c-8.8 0-16-7.2-16-16s7.2-16 16-16z"/>
  </svg>
);

const OtpIcon = () => (
  <svg viewBox="0 0 512 512" fill="currentColor" className="rs-step-icon">
    <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"/>
  </svg>
);

const FormIcon = () => (
  <svg viewBox="0 0 384 512" fill="currentColor" className="rs-step-icon">
    <path d="M320 464c8.8 0 16-7.2 16-16V160H256c-17.7 0-32-14.3-32-32V48H64c-8.8 0-16 7.2-16 16V448c0 8.8 7.2 16 16 16H320zM0 64C0 28.7 28.7 0 64 0H229.5c17 0 33.3 6.7 45.3 18.7l90.5 90.5c12 12 18.7 28.3 18.7 45.3V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64z"/>
    <path d="M145 289.3L118.7 316.9c-2.9 3.1-7.1 4.9-11.5 4.9-8.8 0-16-7.2-16-16s7.2-16 16-16c4.1 0 8.1 1.6 11.1 4.4l17 16c2.1 2 5.5 2 7.6 0l49.3-46.6c3-2.8 7-4.4 11.1-4.4 8.8 0 16 7.2 16 16s-7.2 16-16 16c-4.4 0-8.6-1.8-11.5-4.9L145 289.3z"/>
  </svg>
);

const CertificateIcon = () => (
  <svg viewBox="0 0 384 512" fill="currentColor" className="rs-step-icon">
    <path d="M173.8 5.5c11-7.3 25.4-7.3 36.4 0L228 17.2c6 3.9 13 5.8 20.1 5.4l21.3-1.3c13.2-.8 25.6 6.4 31.5 18.2l9.6 19.1c3.2 6.4 8.4 11.5 14.7 14.7L344.5 83c11.8 5.9 19 18.3 18.2 31.5l-1.3 21.3c-.4 7.1 1.5 14.2 5.4 20.1l11.8 17.8c7.3 11 7.3 25.4 0 36.4L366.8 228c-3.9 6-5.8 13-5.4 20.1l1.3 21.3c.8 13.2-6.4 25.6-18.2 31.5l-19.1 9.6c-6.4 3.2-11.5 8.4-14.7 14.7L301 344.5c-5.9 11.8-18.3 19-31.5 18.2l-21.3-1.3c-7.1-.4-14.2 1.5-20.1 5.4l-17.8 11.8c-11 7.3-25.4 7.3-36.4 0L156 366.8c-6-3.9-13-5.8-20.1-5.4l-21.3 1.3c-13.2 .8-25.6-6.4-31.5-18.2l-9.6-19.1c-3.2-6.4-8.4-11.5-14.7-14.7L39.5 301c-11.8-5.9-19-18.3-18.2-31.5l1.3-21.3c.4-7.1-1.5-14.2-5.4-20.1L5.5 210.2c-7.3-11-7.3-25.4 0-36.4L17.2 156c3.9-6 5.8-13 5.4-20.1l-1.3-21.3c-.8-13.2 6.4-25.6 18.2-31.5l19.1-9.6C65 70.2 70.2 65 73.4 58.6L83 39.5c5.9-11.8 18.3-19 31.5-18.2l21.3 1.3c7.1 .4 14.2-1.5 20.1-5.4L173.8 5.5zM272 192a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM112 384a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144 96a96 96 0 1 0 0-192 96 96 0 1 0 0 192z"/>
  </svg>
);


const HowToRegister = ({ languageType = 'en' }) => {
  const navigate=useNavigate();

  // Define the steps content for both languages - Aligned with Icons
  const content = {
      en: {
          title: 'How to Book a Hall',
          steps: [
              {
                  id: 'login',
                  title: 'Login/Signup', // Matches MobileIcon
                  description: 'Use your mobile number or email to login or create an account with OTP.',
                  icon: <MobileIcon />
              },
              {
                  id: 'verify',
                  title: 'Verify Details', // Matches OtpIcon
                  description: 'Verify your identity using the OTP sent to your contact.',
                  icon: <OtpIcon />
              },
              {
                  id: 'select-check',
                  title: 'Select Hall & Check Availability', // Matches FormIcon (interacting with interface)
                  description: 'Browse available halls, view details, and check preferred dates.',
                  icon: <FormIcon />
              },
              {
                  id: 'apply',
                  title: 'Apply/Book', // Matches CertificateIcon (confirmation/final step)
                  description: 'Submit your application or confirm your booking details.',
                  icon: <CertificateIcon />
              }
          ],
          buttonText: 'Book Your Hall Now'
      },
      hi: {
          title: 'हॉल कैसे बुक करें',
          steps: [
              {
                  id: 'login',
                  title: 'लॉग इन/साइन अप करें',
                  description: 'ओटीपी के साथ लॉग इन करने या खाता बनाने के लिए अपने मोबाइल नंबर या ईमेल का उपयोग करें।',
                  icon: <MobileIcon />
              },
              {
                  id: 'verify',
                  title: 'विवरण सत्यापित करें',
                  description: 'अपने संपर्क पर भेजे गए ओटीपी का उपयोग करके अपनी पहचान सत्यापित करें।',
                  icon: <OtpIcon />
              },
              {
                  id: 'select-check',
                  title: 'हॉल चुनें और उपलब्धता जांचें',
                  description: 'उपलब्ध हॉल ब्राउज़ करें, विवरण देखें और पसंदीदा तिथियां जांचें।',
                  icon: <FormIcon />
              },
              {
                  id: 'apply',
                  title: 'आवेदन/बुक करें',
                  description: 'अपना आवेदन जमा करें या अपनी बुकिंग विवरण की पुष्टि करें।',
                  icon: <CertificateIcon />
              }
          ],
          buttonText: 'अभी हॉल बुक करें'
      }
  };

  const currentContent = content[languageType] || content.en;

  return (
    <div className="rs-register-steps-section">
      <div className="rs-container">
        <h2 className="rs-title">{currentContent.title}</h2>
        <div className="rs-steps-container">
          {currentContent.steps.map((step) => (
            <div className="rs-step-card" key={step.id}>
              <div className="rs-step-icon-container">
                {step.icon}
              </div>
              <h3 className="rs-step-title">{step.title}</h3>
              <p className="rs-step-description">{step.description}</p>
            </div>
          ))}
        </div>
        <div className="rs-register-button-container">
          <button className="rs-btn rs-btn-primary" onClick={()=>navigate('/book')} >{currentContent.buttonText}</button>
        </div>
      </div>
    </div>
  );
};

export default HowToRegister;