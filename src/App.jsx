import React, { useState } from 'react';
import Loader from './components/Loader.jsx';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import BackgroundWatermark from './components/BackgroundWatermark.jsx';

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showHero, setShowHero] = useState(false);

  return (
    <>
      {/* Cinematic Particle Loader Canvas overlay */}
      {!isLoaded && (
        <Loader 
          onStartTransition={() => setShowHero(true)} 
          onLoaded={() => setIsLoaded(true)} 
        />
      )}
      
      {/* Main Website Container */}
      <div id="app-container" className={showHero ? "visible" : "hidden"}>
        <Navbar isLoaded={showHero} />
        <Hero isLoaded={showHero} />
        <BackgroundWatermark />
      </div>
    </>
  );
}

export default App;
