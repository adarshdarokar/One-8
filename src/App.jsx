import React, { useState } from 'react';
import Loader from './components/Loader.jsx';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';

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
      </div>
    </>
  );
}

export default App;
