import React from 'react';
// Import your section components
//Assuming you have this from previous steps
import About from './AboutUs'; // Your updated About component
import HowToRegister from './HowToRegister';
import Hero from './Hero';
import GallerySection from './GallerySection';


// Import a common CSS file if you have base styles or layout wrappers
// import './styles/Common.css'; // If you have a Common.css like in Pethome example

const KalyanMandapamHome = ({ languageType }) => {
  return (
    <div className="kalyan-mandapam-home">
        <Hero languageType={languageType}/>
        <About languageType={languageType} />
        <HowToRegister languageType={languageType}/>
        <GallerySection languageType={languageType}/>
        
      
    </div>
  );
};

export default KalyanMandapamHome;