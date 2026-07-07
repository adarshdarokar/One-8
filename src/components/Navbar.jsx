import React, { useState, useEffect, useRef } from 'react';
import MegaMenu from './MegaMenu.jsx';

function Navbar({ isLoaded }) {
  const [activeMenu, setActiveMenu] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeTimeout = useRef(null);

  const openMegaMenu = (menuType) => {
    clearTimeout(closeTimeout.current);
    setActiveMenu(menuType);
    setMenuOpen(true);
  };

  const requestMenuClose = () => {
    clearTimeout(closeTimeout.current);
    closeTimeout.current = setTimeout(() => {
      setMenuOpen(false);
      setActiveMenu(null);
    }, 150);
  };

  const cancelMenuClose = () => {
    clearTimeout(closeTimeout.current);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(closeTimeout.current);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header 
      className={`navbar ${isLoaded ? 'visible' : ''} ${menuOpen ? 'menu-open' : ''} ${scrolled ? 'scrolled' : ''}`}
      onMouseLeave={requestMenuClose}
      onMouseEnter={cancelMenuClose}
    >
      <div className="nav-container">
        {/* Left Side: Navigation Links */}
        <div className="nav-left">
          {['featured', 'women', 'men', 'calendar'].map((menu) => (
            <a
              key={menu}
              href="#"
              className={`nav-item ${activeMenu === menu ? 'active' : ''}`}
              onMouseEnter={() => openMegaMenu(menu)}
              onClick={(e) => {
                e.preventDefault();
                openMegaMenu(menu);
              }}
            >
              {menu === 'featured' ? 'Featured' : 
               menu === 'women' ? 'Women' : 
               menu === 'men' ? 'Men' : 
               menu === 'calendar' ? 'Release Calendar' : menu}
            </a>
          ))}
        </div>
        
        {/* Center: ONE8 Metallic Logo */}
        <div className="nav-center">
          <a href="#" className="logo-link">
            <img src="/assets/logo/one18.png" alt="ONE8 Logo" className="nav-logo" />
          </a>
        </div>
        
        {/* Right Side: Action Icons */}
        <div className="nav-right">
          <button className="nav-btn-icon" aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle> 
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span className="nav-icon-text">Search</span>
          </button>
          <button className="nav-btn-icon" aria-label="Wishlist">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span className="nav-icon-text">Wishlist</span>
          </button>
          <button className="nav-btn-icon" aria-label="Cart">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span className="nav-icon-text">Cart</span>
          </button>
        </div>
      </div>

      {/* Mega Menu Overlay inside the Header */}
      <MegaMenu 
        activeMenu={activeMenu} 
        isOpen={menuOpen} 
        onMouseEnter={cancelMenuClose}
        onMouseLeave={requestMenuClose}
      />
    </header>
  );
}

export default Navbar;
