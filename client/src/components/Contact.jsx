import React from 'react';
// Import only necessary icons for this section
import { Mail, Phone, MapPin } from 'lucide-react';
// Import its specific CSS file
import './styles/Contact.css';

const ContactUsSection = ({ languageType = 'en' }) => {

  // Content only for the Contact Us part
  const content = {
    en: {
      sectionHeading: 'Contact Us',
      subHeadingDetails: 'Get in Touch',
      email: 'info@kalyanmandapamgkp.com', // Replace with actual email
      phone: '+91-XXXX-XXXXXX', // Replace with actual phone
      address: '[Your Full Kalyan Mandapam Address, Gorakhpur, UP]', // Replace with actual address
      mapTitle: 'Find Us Here',
      supportText: 'Please feel free to contact our dedicated support team at',
      supportPhone: '9918000241', // Example support phone - Replace with actual
      hoursText: 'Our support hours are',
      hoursDetails: 'Monday to Saturday, 10 AM – 6 PM', // Example hours - Replace with actual
    },
    hi: {
      sectionHeading: 'हमसे संपर्क करें',
      subHeadingDetails: 'संपर्क करें',
      email: 'info@kalyanmandapamgkp.com',
      phone: '+91-XXXX-XXXXXX',
      address: '[आपका पूरा कल्याण मंडपम पता, गोरखपुर, यूपी]',
      mapTitle: 'हमें यहाँ खोजें',
      supportText: 'कृपया हमारी समर्पित सहायता टीम से संपर्क करने में संकोच न करें',
      supportPhone: '9918000241',
      hoursText: 'हमारा सहायता समय है',
      hoursDetails: 'सोमवार से शनिवार, सुबह 10 बजे से शाम 6 बजे तक',
    }
  };

  const currentContent = content[languageType] || content.en;

  const mapCoordinates = '26.748613922483322,83.36871426509431';
  const mapZoom = 16; // Adjust zoom level as needed
  // Use the updated map embed URL format
  const mapEmbedUrl = `https://maps.google.com/maps?q=${mapCoordinates}&z=${mapZoom}&ie=UTF8&output=embed`;


  return (
    <section className="contact-us-section"> {/* Renamed section class */}
      <div className="container">
        <h2 className="contact-us-section-heading">{currentContent.sectionHeading}</h2> {/* Renamed heading class */}

        <div className="contact-us-content"> {/* Renamed content class */}
          {/* Contact Details & Map Block */}
          <div className="contact-info-block">
             <h3 className="contact-subheading">{currentContent.subHeadingDetails}</h3>
              <div className="contact-item">
                <Mail size={24} className="contact-icon" />
                <a href={`mailto:${currentContent.email}`} className="contact-info-text">{currentContent.email}</a>
              </div>
              <div className="contact-item">
                <Phone size={24} className="contact-icon" />
                <a href={`tel:${currentContent.phone}`} className="contact-info-text">{currentContent.phone}</a>
              </div>
              <div className="contact-item">
                <MapPin size={24} className="contact-icon" />
                <span className="contact-info-text">{currentContent.address}</span>
              </div>

              {/* Map Embed */}
              <h3 className="contact-subheading" style={{marginTop: '30px'}}>{currentContent.mapTitle}</h3>
              <div className="contact-map">
                  <iframe
                      src={mapEmbedUrl}
                      width="100%"
                      height="300"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Kalyan Mandapam Location"
                  ></iframe>
              </div>
          </div>

      
        </div>
      </div>
    </section>
  );
};

export default ContactUsSection;