import React, { useEffect, useRef } from 'react';

function HeroBackground({ isLoaded, currentSlide }) {
  const videoRef = useRef(null);
  const videoSrc = window.preloadedVideoUrl || '/assets/video/One8.mp4';

  useEffect(() => {
    if (!videoRef.current) return;
    if (currentSlide === 1) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(err => console.log('Autoplay blocked:', err));
    } else {
      videoRef.current.pause();
    }
  }, [currentSlide]);

  return (
    <div className="absolute inset-0 w-full h-full z-1 overflow-hidden bg-black">
      {/* Slide 1: Image (shoe-2.jpg) */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
        currentSlide === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <img 
          src="/assets/Hero-Images/shoe-2.jpg" 
          className="w-full h-full object-cover" 
          style={{ objectPosition: '72% 15%' }} 
          alt="Chrome-Fusion Core" 
        />
      </div>

      {/* Slide 2: Video (One8.mp4) */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
        currentSlide === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <video 
          ref={videoRef} 
          className="w-full h-full object-cover" 
          loop 
          muted 
          playsInline 
          src={videoSrc}
        />
      </div>

      {/* Slide 3: Image (shoe.webp) */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
        currentSlide === 2 ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <img 
          src="/assets/Hero-Images/shoe.webp" 
          className="w-full h-full object-cover" 
          style={{ objectPosition: 'center 30%' }} 
          alt="Nitro-Run Silencer" 
        />
      </div>

      {/* Uniform 30% Dark Overlay */}
      <div className="absolute inset-0 bg-black/30 z-20 pointer-events-none"></div>
    </div>
  );
}

export default HeroBackground;
