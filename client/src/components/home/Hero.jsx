import React from 'react';
// Remove PawIcon import as we are removing paw decorations
// import PawIcon from '../icons/PawIcon';
import './styles/Hero.css';
import { useNavigate } from 'react-router-dom';

const Hero = ({ languageType = 'en' }) => {
  const navigate = useNavigate();

  // Language content - UPDATED FOR KALYAN MANDAPAM
  const content = {
    en: {
      title: 'Your Perfect Venue for Every Celebration', // New Title
      paragraph: 'Kalyan Mandapam Gorakhpur offers a beautiful and versatile space for weddings, receptions, community events, and more. Experience exceptional facilities and dedicated service for your special day.', // New Paragraph
      buttonText: 'Check Availability' // New Button Text
    },
    hi: {
      title: 'हर समारोह के लिए आपका आदर्श स्थान', // New Title (Hindi)
      paragraph: 'कल्याण मंडपम गोरखपुर शादियों, रिसेप्शन, सामुदायिक कार्यक्रमों और अन्य के लिए एक सुंदर और बहुमुखी स्थान प्रदान करता है। अपने खास दिन के लिए असाधारण सुविधाओं और समर्पित सेवा का अनुभव करें।', // New Paragraph (Hindi)
      buttonText: 'उपलब्धता जांचें' // New Button Text (Hindi)
    }
  };

  const currentContent = content[languageType] || content.en;

  return (
    <div className="hero-section">
      {/* Container div from previous example */}
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <h1>{currentContent.title}</h1>
            <p>
              {currentContent.paragraph}
            </p>
            {/* Navigate to booking/availability page */}
            <button className="btn btn-primary hero-button" onClick={() => navigate('/book')}>{currentContent.buttonText}</button>
          </div>
          <div className="hero-image">
            <div className="venue-circle"> {/* Changed class name */}
              {/* Replace with an image of your venue (decorated hall, exterior, etc.) */}
              <img
                src="./image.png" // New placeholder image
                alt="Kalyan Mandapam Venue" // Updated alt text
                className="responsive-cover"
              />
            </div>
          </div>
        </div>
      </div>
      {/* Remove the paw-decorations div entirely */}
      {/* <div className="paw-decorations">...</div> */}
    </div>
  );
};

export default Hero;