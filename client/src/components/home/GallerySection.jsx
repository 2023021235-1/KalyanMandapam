import React, { useState, useEffect, useRef } from 'react';
import './styles/Gallery.css';

const GallerySection = ({ languageType = 'en' }) => {
  // Using picsum.photos URLs for placeholder images
  // Format: https://picsum.photos/seed/{seed}/{width}/{height} for static random images
  // Or https://picsum.photos/{width}/{height} for truly random images (might change on refresh)
  // Using static random with seeds for consistency during development
  const galleryImages = [
    'https://picsum.photos/seed/venue1/800/500',
    'https://picsum.photos/seed/venue2/800/500',
    'https://picsum.photos/seed/venue3/800/500',
    'https://picsum.photos/seed/venue4/800/500',
    'https://picsum.photos/seed/venue5/800/500',
    'https://picsum.photos/seed/venue6/800/500',
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef(null); // Ref for the carousel track

  // Automatic slide change
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % galleryImages.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [galleryImages.length]); // Re-run if the number of images changes

  // Sync carousel position with currentSlide state
  useEffect(() => {
    if (carouselRef.current) {
      // We need to calculate the width of a single carousel item to slide correctly.
      // Assuming all items have the same width as the carousel container.
      const containerWidth = carouselRef.current.parentElement.offsetWidth;
      carouselRef.current.style.transform = `translateX(-${currentSlide * containerWidth}px)`;
    }
  }, [currentSlide]);

  // Optional: Manual navigation handlers
  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % galleryImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + galleryImages.length) % galleryImages.length);
  };

   const content = {
     en: { sectionHeading: 'Our Gallery' },
     hi: { sectionHeading: 'हमारी गैलरी' }
   };
   const currentContent = content[languageType] || content.en;


  return (
    <section className="gallery-section">
      <div className="container"> {/* Using the general container class */}
        <h2 className="gallery-section-heading">{currentContent.sectionHeading}</h2>

        <div className="carousel-container">
          {/* Carousel Track */}
          <div className="carousel-track" ref={carouselRef}>
            {galleryImages.map((image, index) => (
              // Important: Each carousel item should have the same width as the container
              // This is handled by CSS (min-width: 100%) but can be added here too if needed
              <div className="carousel-item" key={index}>
                <img src={image} alt={`Venue  ${index + 1}`} className="carousel-image" />
              </div>
            ))}
          </div>

          {/* Optional: Manual Navigation Buttons */}
           <button className="carousel-button prev" onClick={prevSlide} aria-label="Previous slide">&#10094;</button>
           <button className="carousel-button next" onClick={nextSlide} aria-label="Next slide">&#10095;</button>

          {/* Optional: Indicators */}
          <div className="carousel-indicators">
            {galleryImages.map((_, index) => (
              <button
                key={index}
                className={`carousel-indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              ></button>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default GallerySection;