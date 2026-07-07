import React, { useState, useEffect } from 'react';
import HeroBackground from './HeroBackground.jsx';

function Hero({ isLoaded }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!isLoaded) return;

    // Slide 1 (Video) has 4s duration, Slide 0 and 2 (Images) have 2s duration
    const duration = currentSlide === 1 ? 4000 : 2000;

    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, duration);

    return () => clearTimeout(timer);
  }, [currentSlide, isLoaded]);

  return (
    <section className="hero-section w-screen h-screen relative overflow-hidden">
      {/* Background slide images and video */}
      <HeroBackground isLoaded={isLoaded} currentSlide={currentSlide} />

      {/* Pagination Dot Indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full flex items-center gap-3.5 z-40 border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
        {[0, 1, 2].map((index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 pointer-events-auto ${
              currentSlide === index 
                ? 'bg-neutral-900 scale-125 shadow-[0_0_8px_rgba(0,0,0,0.5)]' 
                : 'bg-neutral-300 hover:bg-neutral-100'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export default Hero;
