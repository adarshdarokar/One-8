import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

function HeroBackground({ isLoaded }) {
  const containerRef = useRef(null);
  const videoSrc = window.preloadedVideoUrl || '/assets/video/One8.mp4';

  useGSAP(() => {
    if (!isLoaded) return;

    // Trigger autoplay programmatically for both video elements
    const videos = containerRef.current.querySelectorAll('.hero-video');
    videos.forEach(video => {
      video.play().catch(err => console.log('Autoplay blocked:', err));
    });

    // Stepped slideshow GSAP timeline
    const tl = gsap.timeline({ repeat: -1 });
    tl.set('.hero-track', { xPercent: 0 })
      .to('.hero-track', {
        xPercent: -25,
        duration: 0.9,
        ease: 'power3.inOut'
      }, '+=2') // Image 1 holds for 2 seconds
      .to('.hero-track', {
        xPercent: -50,
        duration: 0.9,
        ease: 'power3.inOut'
      }, '+=4') // Video holds for 4 seconds
      .to('.hero-track', {
        xPercent: -75,
        duration: 0.9,
        ease: 'power3.inOut'
      }, '+=2') // Image 2 holds for 2 seconds
      .to('.hero-track', {
        xPercent: 0,
        duration: 0
      }); // Instant seamless reset to Panel 1 (which holds for 2 seconds)

  }, { dependencies: [isLoaded], scope: containerRef });

  return (
    <div className="hero-track-container" ref={containerRef}>
      <div className="hero-track">
        {/* Slide 1: Image */}
        <div className="hero-slide">
          <img src="/assets/Hero-Images/shoe.webp" className="shoe-img" alt="Nitro-Run Silencer" />
        </div>
        {/* Slide 2: Video */}
        <div className="hero-slide">
          <video className="hero-video" loop muted playsInline src={videoSrc}></video>
        </div>
        {/* Slide 3: Image */}
        <div className="hero-slide">
          <img src="/assets/Hero-Images/shoe-2.jpg" className="virat-img" alt="Chrome-Fusion Core" />
        </div>
        {/* Slide 4: Image (Duplicate for seamless loop) */}
        <div className="hero-slide">
          <img src="/assets/Hero-Images/shoe.webp" className="shoe-img" alt="Nitro-Run Silencer" />
        </div>
      </div>
      {/* Uniform 30% Dark Overlay */}
      <div className="hero-track-overlay"></div>
    </div>
  );
}

export default HeroBackground;
