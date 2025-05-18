import React from 'react';
// Import only necessary icons for this section
import { Send } from 'lucide-react';
// Import its specific CSS file
import './styles/QueryFeedback.css';

const QueryFeedbackSection = ({ languageType = 'en' }) => {

   // Content only for the Query & Feedback part
   const content = {
     en: {
       sectionHeading: 'Query & Feedback', // Section heading
       subHeadingForm: 'Send us a Message', // Form sub-heading
       formNameLabel: 'Your Name', // Label for Name input
       formEmailLabel: 'Your Email', // Label for Email input
       formMessageLabel: 'Your Message', // Label for Message textarea
       formSubmitButton: 'Send Message', // Submit button text
     },
     hi: {
       sectionHeading: 'प्रश्न और प्रतिक्रिया', // Section heading (Hindi)
       subHeadingForm: 'हमें संदेश भेजें', // Form sub-heading (Hindi)
       formNameLabel: 'आपका नाम', // Label for Name input (Hindi)
       formEmailLabel: 'आपका ईमेल', // Label for Email input (Hindi)
       formMessageLabel: 'आपका संदेश', // Label for Message textarea (Hindi)
       formSubmitButton: 'संदेश भेजें', // Submit button text (Hindi)
     }
   };

   // Get current content based on language
   const currentContent = content[languageType] || content.en;

   // Basic form submission handler (can be shared or separate)
   const handleFormSubmit = (e) => {
       e.preventDefault(); // Prevent default form refresh
       alert('Message Sent! (This is a placeholder)'); // Placeholder alert
       // Add your actual form submission logic here (e.g., sending data to a backend)
   };

  return (
    <section className="query-feedback-section"> {/* Main section container */}
      {/* Use the general container class for max width and centering */}
      <div className="container">
        <h2 className="query-feedback-section-heading">{currentContent.sectionHeading}</h2> {/* Section heading */}

        {/* Wrapper for the content (form block) */}
        <div className="query-feedback-content">
             {/* Contact Form Block (the white card) */}
            <div className="query-feedback-form-block">
              {/* Form sub-heading */}
              <h3 className="contact-subheading">{currentContent.subHeadingForm}</h3>
              <form onSubmit={handleFormSubmit}> {/* Form element */}
                {/* Form group for Name input */}
                <div className="form-group">
                  <label htmlFor="name">{currentContent.formNameLabel}</label> {/* Label */}
                  <input type="text" id="name" name="name" required /> {/* Input field */}
                </div>
                 {/* Form group for Email input */}
                <div className="form-group">
                  <label htmlFor="email">{currentContent.formEmailLabel}</label> {/* Label */}
                  <input type="email" id="email" name="email" required /> {/* Input field */}
                </div>
                 {/* Form group for Message textarea */}
                <div className="form-group">
                  <label htmlFor="message">{currentContent.formMessageLabel}</label> {/* Label */}
                  <textarea id="message" name="message" rows="5" required></textarea> {/* Textarea */}
                </div>
                {/* Container for the submit button to help with centering */}
                <div className="query-feedback-button-container"> {/* New class for button wrapper */}
                    {/* Submit button */}
                    <button type="submit" className="btn btn-primary query-feedback-submit-btn"> {/* Button */}
                       {/* Icon next to button text */}
                       <Send size={18} style={{marginRight: '8px'}}/> {currentContent.formSubmitButton}
                    </button>
                </div> {/* End query-feedback-button-container */}
              </form>
            </div> {/* End query-feedback-form-block */}
        </div> {/* End query-feedback-content */}
      </div> {/* End container */}
    </section>
  );
};

export default QueryFeedbackSection;