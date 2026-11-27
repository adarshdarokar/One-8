import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { gsap } from 'gsap';

/**
 * Models data for the central wardrobe showcase.
 * All models have transparent backgrounds and natural proportions.
 */
const MODELS = [
  {
    id: 'nave',
    name: 'Navy Classic',
    src: '/assets/models/nave-vk.png',
    alt: 'Virat Kohli in Navy Jacket and Trousers'
  },
  {
    id: 'urban',
    name: 'Urban Active',
    src: '/assets/models/urban-vk.png',
    alt: 'Virat Kohli in Urban Active Black Tee and Cargos'
  },
  {
    id: 'victory',
    name: 'Victory Knit',
    src: '/assets/models/victory-vk.png',
    alt: 'Virat Kohli in Victory Knit Tracksuit'
  }
];

/**
 * WardrobeSection Component for ONE8.
 * Renders the sections immediately following the Hero in normal document flow:
 * Hero → 13vh white gap → VK Banner (slim Perk wrapper strip) → 13vh white gap → ONE8 Wardrobe
 *
 * Inside ONE8 Wardrobe:
 * - One8-wordrobe.png is the fixed background layer showing both wardrobes.
 * - Three full-body models rotate seamlessly in the central empty space.
 * - Supports minimal navigation buttons, mouse wheel, trackpad, touch swipe, and arrow keys.
 */
function WardrobeSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isAnimating = useRef(false);
  const modelRefs = useRef([]);
  const sectionRef = useRef(null);
  const wheelLock = useRef(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  /**
   * Seamless infinite horizontal navigation in both directions using GSAP.
   * @param {'next' | 'prev'} direction
   */
  const navigate = useCallback((direction) => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    setCurrentIndex((prevIndex) => {
      const nextIndex = direction === 'next'
        ? (prevIndex + 1) % MODELS.length
        : (prevIndex - 1 + MODELS.length) % MODELS.length;

      const currentEl = modelRefs.current[prevIndex];
      const nextEl = modelRefs.current[nextIndex];

      if (!currentEl || !nextEl) {
        isAnimating.current = false;
        return nextIndex;
      }

      const outgoingX = direction === 'next' ? -80 : 80;
      const incomingX = direction === 'next' ? 80 : -80;

      // Kill any in-flight tweens on these elements
      gsap.killTweensOf([currentEl, nextEl]);

      // Set up incoming element before animation
      gsap.set(nextEl, {
        x: incomingX,
        opacity: 0,
        visibility: 'visible',
        scale: 0.96
      });

      // Animate current element exiting horizontally
      gsap.to(currentEl, {
        x: outgoingX,
        opacity: 0,
        scale: 0.96,
        duration: 0.45,
        ease: 'power2.inOut',
        onComplete: () => {
          gsap.set(currentEl, { visibility: 'hidden', x: 0 });
        }
      });

      // Animate next element entering horizontally
      gsap.to(nextEl, {
        x: 0,
        opacity: 1,
        scale: 1,
        duration: 0.45,
        ease: 'power2.inOut',
        onComplete: () => {
          isAnimating.current = false;
        }
      });

      return nextIndex;
    });
  }, []);

  // Keyboard navigation (ArrowLeft / ArrowRight) when wardrobe section is in viewport
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      if (e.key === 'ArrowRight') {
        navigate('next');
      } else if (e.key === 'ArrowLeft') {
        navigate('prev');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // Mouse wheel & trackpad swipe navigation
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleWheel = (e) => {
      if (wheelLock.current || isAnimating.current) return;

      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);

      if (absX > 25 || absY > 40) {
        const dir = (absX > 25 ? e.deltaX > 0 : e.deltaY > 0) ? 'next' : 'prev';
        navigate(dir);
        wheelLock.current = setTimeout(() => {
          wheelLock.current = null;
        }, 500);
      }
    };

    section.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      section.removeEventListener('wheel', handleWheel);
      if (wheelLock.current) clearTimeout(wheelLock.current);
    };
  }, [navigate]);

  // Touch swipe support for mobile and tablets
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (isAnimating.current) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchEndX - touchStartX.current;
    const diffY = touchEndY - touchStartY.current;

    // Detect intentional horizontal swipe
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      navigate(diffX < 0 ? 'next' : 'prev');
    }
  };

  return (
    <div className="wardrobe-flow-wrapper">
      {/* 13vh pure white gap below Hero */}
      <div className="section-white-gap" aria-hidden="true" />

      {/* VK Banner Section - Slim full-width horizontal strip (around 180-220px desktop height) */}
      <section className="vk-banner-section" aria-label="ONE8 with Virat Kohli">
        <img
          src="/assets/wordrobe/w-withvk.png"
          alt="ONE8 with Virat Kohli"
          className="vk-banner-image"
          loading="lazy"
        />
      </section>

      {/* 13vh pure white gap between VK Banner and ONE8 Wardrobe */}
      <div className="section-white-gap" aria-hidden="true" />

      {/* ONE8 Wardrobe Section - Fixed wardrobe base with central interactive model stage */}
      <section 
        className="wardrobe-section" 
        aria-label="ONE8 Wardrobe"
        ref={sectionRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Fixed Background Wardrobe PNG Layer */}
        <img
          src="/assets/wordrobe/One8-wordrobe.png"
          alt="ONE8 Wardrobe"
          className="wardrobe-bg"
          loading="lazy"
        />

        {/* Minimal Left Navigation Button */}
        <button
          type="button"
          className="wardrobe-nav-btn prev"
          onClick={() => navigate('prev')}
          aria-label="Previous Outfit"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        {/* Central Model Stage */}
        <div className="wardrobe-model-viewport" aria-live="polite">
          {MODELS.map((model, idx) => (
            <div
              key={model.id}
              ref={(el) => (modelRefs.current[idx] = el)}
              className={`wardrobe-model-item ${idx === currentIndex ? 'active' : ''}`}
              aria-hidden={idx !== currentIndex}
            >
              <img
                src={model.src}
                alt={model.alt}
                className="wardrobe-model-img"
                loading="eager"
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* Minimal Right Navigation Button */}
        <button
          type="button"
          className="wardrobe-nav-btn next"
          onClick={() => navigate('next')}
          aria-label="Next Outfit"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </section>
    </div>
  );
}

export default memo(WardrobeSection);
