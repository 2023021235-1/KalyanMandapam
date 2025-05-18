import React from 'react';
// Import only necessary icons for this section
import { Send } from 'lucide-react';
// Import its specific CSS file
import './styles/QueryFeedback.css';

const QueryFeedbackSection = ({ languageType = 'en' }) => {

   // Content only for the Query & Feedback part
   const content = {
     en: {
       sectionHeading: 'Query & Feedback', // New section heading
       subHeadingForm: 'Send us a Message',
       formNameLabel: 'Your Name',
       formEmailLabel: 'Your Email',
       formMessageLabel: 'Your Message',
       formSubmitButton: 'Send Message',
     },
     hi: {
       sectionHeading: 'प्रश्न और प्रतिक्रिया', // New section heading (Hindi)
       subHeadingForm: 'हमें संदेश भेजें',
       formNameLabel: 'आपका नाम',
       formEmailLabel: 'आपका ईमेल',
       formMessageLabel: 'आपका संदेश',
       formSubmitButton: 'संदेश भेजें',
     }
   };

   const currentContent = content[languageType] || content.en;

   // Basic form submission handler (can be shared or separate)
   const handleFormSubmit = (e) => {
       e.preventDefault();
       alert('Message Sent! (This is a placeholder)');
       // Add your form submission logic here
   };

  return (
    <section className="query-feedback-section"> {/* New section class */}
      <div className="container"> {/* Use the general container class */}
        <h2 className="query-feedback-section-heading">{currentContent.sectionHeading}</h2> {/* New heading class */}

        <div className="query-feedback-content"> {/* New content wrapper */}
             {/* Contact Form Block */}
            <div className="query-feedback-form-block"> {/* New class for the form card */}
              <h3 className="contact-subheading">{currentContent.subHeadingForm}</h3> {/* Reuse subheading class if desired */}
              <form onSubmit={handleFormSubmit}>
                <div className="form-group"> {/* Reuse form-group class */}
                  <label htmlFor="name">{currentContent.formNameLabel}</label>
                  <input type="text" id="name" name="name" required />
                </div>
                <div className="form-group">
                  <label htmlFor="email">{currentContent.formEmailLabel}</label>
                  <input type="email" id="email" name="email" required />
                </div>
                <div className="form-group">
                  <label htmlFor="message">{currentContent.formMessageLabel}</label>
                  <textarea id="message" name="message" rows="5" required></textarea>
                </div>
                <button type="submit" className="btn btn-primary query-feedback-submit-btn"> {/* New button class */}
                   <Send size={18} style={{marginRight: '8px'}}/> {currentContent.formSubmitButton}
                </button>
              </form>
            </div>
        </div>
      </div>
    </section>
  );
};

export default QueryFeedbackSection;