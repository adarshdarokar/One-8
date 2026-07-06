import React from 'react';
import HeroBackground from './HeroBackground.jsx';

function Hero({ isLoaded }) {
  return (
    <section className="hero-section">
      <HeroBackground isLoaded={isLoaded} />
      <div className="hero-container">
        {/* Transparent layout container overlay */}
      </div>
    </section>
  );
}

export default Hero;
