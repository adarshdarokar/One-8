import React, { useState, useEffect, memo } from 'react';
import HeroBackground from './HeroBackground.jsx';

/**
 * Hero Component for ONE8.
 * Renders the top-level full-screen section with a media carousel (HeroBackground)
 * and interactive bottom pagination dot indicators.
 * Implements a smart slide rotation timer that changes slide durations dynamically
 * depending on whether the active media is a short image or a longer video track.
 *
 * @param {Object} props
 * @param {boolean} props.isLoaded - Flag specifying if the loader has finished fadeout animations
 */
function Hero({ isLoaded }) {
  // Current active slide index (0: Image 1, 1: Video, 2: Image 2)
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!isLoaded) return;

    // Dynamic rotation timing:
    // Video slide (Index 1) has a longer 4-second visibility to allow playback.
    // Standard image slides (Index 0 and 2) rotate every 2 seconds.
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

export default memo(Hero);

