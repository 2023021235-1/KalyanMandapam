import React from 'react';
import './styles/Hero.css';
import { useNavigate } from 'react-router-dom';

const Hero = ({ languageType = 'en' }) => {
  const navigate = useNavigate();

  const content = {
    en: {
      title: 'Your Perfect Venue for Every Celebration',
      paragraph: 'Kalyan Mandapam Gorakhpur offers a beautiful and versatile space for weddings, receptions, community events, and more. Experience exceptional facilities and dedicated service for your special day.',
      bookNowButtonText: 'Book Now', // Added text for Book Now button
      checkAvailabilityButtonText: 'Check Availability' // Text for Check Availability button
    },
    hi: {
      title: 'हर समारोह के लिए आपका आदर्श स्थान',
      paragraph: 'कल्याण मंडपम गोरखपुर शादियों, रिसेप्शन, सामुदायिक कार्यक्रमों और अन्य के लिए एक सुंदर और बहुमुखी स्थान प्रदान करता है। अपने खास दिन के लिए असाधारण सुविधाओं और समर्पित सेवा का अनुभव करें।',
      bookNowButtonText: 'अभी बुक करें',
      checkAvailabilityButtonText: 'उपलब्धता जांचें'
    }
  };

  const currentContent = content[languageType] || content.en;

  return (
    <div className="hero-section">
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <h1>{currentContent.title}</h1>
            <p>
              {currentContent.paragraph}
            </p>
            {/* Container for the two buttons */}
            <div className="hero-buttons"> {/* New div for buttons */}
                {/* Book Now button - redirects to /book */}
                <button className="btn btn-primary hero-button" onClick={() => navigate('/book')}>
                    {currentContent.bookNowButtonText}
                </button>
                {/* Check Availability button - redirects to /availability */}
                <button className="btn btn-secondary hero-button" onClick={() => navigate('/availability')}> {/* Using btn-secondary for differentiation */}
                    {currentContent.checkAvailabilityButtonText}
                </button>
            </div>
          </div>
          <div className="hero-image">
            <div className="venue-circle">
              <img
                src="./image.webp"
                alt="Kalyan Mandapam Venue"
                className="responsive-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;