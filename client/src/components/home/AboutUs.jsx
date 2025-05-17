import React from 'react';
import './styles/About.css';

const About = ({ languageType = 'en' }) => { // Added languageType prop

  // Language content
  const content = {
    en: {
      sectionHeading: 'About Us',
      officials: [
        {
          name: 'Shri Yogi Adityanath',
          designation: 'Chief Minister',
          image: './yogi.webp',
          alt: 'Chief Minister'
        },
        {
          name: 'Manglesh Kumar Srivastava',
          designation: 'Mayor GKP',
          image: './Dr._Manglesh_Kumar_Srivastava.webp',
          alt: 'Manglesh_Kumar_Srivastava'
        },
        {
          name: 'Sri Gaurav Singh Sogarwal',
          designation: 'Municipal Commissioner',
          image: './muncipal.webp',
          alt: 'Shri Inderajeet Singh' // Note: Alt text still refers to 'Shri Inderajeet Singh' from original JSX, might need correction if the image/person changed. Keeping it as per original for now.
        }
      ],
      description: 'Nagar Nigam Gorakhpur is the governing body of the city of Gorakhpur in the Indian state of Uttar Pradesh. The municipal corporation consists of democratically elected members, is headed by a mayor and administers the city’s infrastructure and public services. Members from the state’s leading various political parties hold elected offices in the corporation. It is the richest Municipal corporation in terms of revenue generated in the state of Uttar Pradesh.',
      buttonText: 'More About Us',
      buttonLink: 'https://gorakhpurnagarnigam.up.gov.in/'
    },
    hi: {
      sectionHeading: 'हमारे बारे में',
      officials: [
        {
          name: 'श्री योगी आदित्यनाथ',
          designation: 'मुख्यमंत्री',
          image: './yogi.webp',
          alt: 'Chief Minister'
        },
        {
          name: 'मंगलेश कुमार श्रीवास्तव',
          designation: 'महापौर गोरखपुर',
          image: './Dr._Manglesh_Kumar_Srivastava.webp',
          alt: 'Manglesh_Kumar_Srivastava'
        },
        {
          name: 'श्री गौरव सिंह सोगरवाल',
          designation: 'नगर आयुक्त',
          image: './muncipal.webp',
          alt: 'Shri Inderajeet Singh'
        }
      ],
      description: 'नगर निगम गोरखपुर भारतीय राज्य उत्तर प्रदेश के गोरखपुर शहर का शासी निकाय है। नगर निगम में लोकतांत्रिक रूप से चुने गए सदस्य होते हैं, इसका नेतृत्व महापौर करते हैं और यह शहर के बुनियादी ढांचे और सार्वजनिक सेवाओं का प्रशासन करता है। राज्य के प्रमुख विभिन्न राजनीतिक दलों के सदस्य निगम में निर्वाचित पदों पर हैं। यह उत्तर प्रदेश राज्य में राजस्व सृजन के मामले में सबसे धनी नगर निगम है।',
      buttonText: 'हमारे बारे में और जानें',
      buttonLink: 'https://gorakhpurnagarnigam.up.gov.in/'
    }
  };

  const currentContent = content[languageType] || content.en;

  return (
    <section className="About-section">
      <div className="About-container">
        <div className="About-grid">
           <h2 className="About-section-heading">{currentContent.sectionHeading}</h2>
          <div className="About-images-horizontal-row">
            {currentContent.officials.map((official, index) => (
              <div className={`About-official-card ${index === 0 ? 'About-main-official' : ''}`} key={official.name}>
                <div className="About-official-image">
                  <img src={official.image} alt={official.alt} />
                </div>
                <div className="About-official-info">
                  <h3>{official.name}</h3>
                  <p>{official.designation}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="About-content">
            <div className="About-section-description">
              <p>
                {currentContent.description}
              </p>
              <button className="About-btn-primary" onClick={() => window.location.href = currentContent.buttonLink}>
                {currentContent.buttonText}
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;