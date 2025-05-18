import React from 'react';
import About from './AboutUs'; 
import HowToRegister from './HowToRegister';
import Hero from './Hero';
import GallerySection from './GallerySection';
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