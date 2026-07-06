import React, { useState } from 'react';
import Loader from './components/Loader.jsx';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';

function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      {/* Cinematic Particle Loader Canvas overlay */}
      {!isLoaded && <Loader onLoaded={() => setIsLoaded(true)} />}
      
      {/* Main Website Container */}
      <div id="app-container" className={isLoaded ? "visible" : "hidden"}>
        <Navbar isLoaded={isLoaded} />
        <Hero isLoaded={isLoaded} />
      </div>
    </>
  );
}

export default App;
