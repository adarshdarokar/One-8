import React, { useState, Suspense, lazy } from 'react';
import Loader from './components/Loader.jsx';

const Navbar = lazy(() => import('./components/Navbar.jsx'));
const Hero = lazy(() => import('./components/Hero.jsx'));
const BackgroundWatermark = lazy(() => import('./components/BackgroundWatermark.jsx'));

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
      <Suspense fallback={null}>
        <div id="app-container" className={showHero ? "visible" : "hidden"}>
          <Navbar isLoaded={showHero} />
          <Hero isLoaded={showHero} />
          <BackgroundWatermark />
        </div>
      </Suspense>
    </>
  );
}

export default App;
