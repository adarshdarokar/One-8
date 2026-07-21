import React, { useEffect, useRef, memo } from 'react';

/**
 * HeroBackground Component for ONE8.
 * Renders the background media container for the Hero section.
 * Contains image slides (high-resolution product shots) and a video slide (action sequence).
 * Controls video play/pause events dynamically to avoid CPU consumption when the video slide is hidden.
 * Memoized to prevent re-renders when parent states change but active slide parameters remain identical.
 *
 * @param {Object} props
 * @param {boolean} props.isLoaded - Specifies if site-wide preloading is complete
 * @param {number} props.currentSlide - Current active slide index (0, 1, 2)
 */
function HeroBackground({ isLoaded, currentSlide }) {
  const videoRef = useRef(null);
  // Fetch from global preloaded video stream URL if present; fallback to path
  const videoSrc = window.preloadedVideoUrl || '/assets/video/One8.mp4';

  // Synchronize video playback states with slider transitions to conserve system resources
  useEffect(() => {
    if (!videoRef.current) return;
    if (currentSlide === 1) {
      videoRef.current.currentTime = 0;
      // Play video with autoplay fallback catch to prevent browser security exceptions
      videoRef.current.play().catch(err => console.log('Autoplay blocked:', err));
    } else {
      // Pause video when transitioning to image slides to conserve GPU/memory resources
      videoRef.current.pause();
    }
  }, [currentSlide]);

  return (
    <div className="absolute inset-0 w-full h-full z-1 overflow-hidden bg-black">
      {/* Slide 1: Image (shoe-2.jpg) - Focused on specific crop offset */}
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

      {/* Slide 2: Video (One8.mp4) - Looped, muted, and playsinline for premium web design standard */}
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

      {/* Uniform 30% Dark Overlay (Ensures high readability of overlay header fonts and pagination dots) */}
      <div className="absolute inset-0 bg-black/30 z-20 pointer-events-none"></div>
    </div>
  );
}

export default memo(HeroBackground);

