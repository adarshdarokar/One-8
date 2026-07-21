import React, { useState, useEffect, useRef, useCallback } from 'react';
import MegaMenu from './MegaMenu.jsx';

/**
 * Navbar Component for ONE8.
 * Renders the top navigation header containing link dropdowns (MegaMenu),
 * branding logo, action buttons (search, wishlist, cart), and a responsive mobile side-drawer.
 * Handles state transitions for scrolling triggers, drawer activation, and deferred menu close hover timers.
 *
 * @param {Object} props
 * @param {boolean} props.isLoaded - Determines whether the navbar should fade into view (post preloader)
 */
function Navbar({ isLoaded }) {
  // Active category in the mega dropdown ('featured', 'women', 'men', 'calendar', or null)
  const [activeMenu, setActiveMenu] = useState(null);
  // Tracks whether the desktop mega menu container is slide-opened
  const [menuOpen, setMenuOpen] = useState(false);
  // Tracks if user has scrolled down >50px to apply high-contrast white background styles
  const [scrolled, setScrolled] = useState(false);
  // Tracks mobile-only responsive sidebar nav drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Ref timer used to defer menu closing (prevents menu flickering on tiny gaps during hover cursor movements)
  const closeTimeout = useRef(null);

  /**
   * Activates a specific category and slides open the MegaMenu overlay.
   * Cancels any pending hover close timers.
   * Disables mega menu interactions on mobile-sized viewports (<=768px).
   *
   * @param {string} menuType - Category name
   */
  const openMegaMenu = useCallback((menuType) => {
    if (window.innerWidth <= 768) return;
    clearTimeout(closeTimeout.current);
    setActiveMenu(menuType);
    setMenuOpen(true);
  }, []);

  /**
   * Schedules a delayed closure of the MegaMenu.
   * Provides a 150ms buffer to allow the cursor to traverse between navbar headers
   * and the mega menu card contents without triggering rapid open/close transitions.
   */
  const requestMenuClose = useCallback(() => {
    clearTimeout(closeTimeout.current);
    closeTimeout.current = setTimeout(() => {
      setMenuOpen(false);
      setActiveMenu(null);
    }, 150);
  }, []);

  /**
   * Cancels any pending deferred menu closures (e.g. when cursor returns to nav elements).
   */
  const cancelMenuClose = useCallback(() => {
    clearTimeout(closeTimeout.current);
  }, []);

  // Monitor window scroll coordinates to toggle solid navigation bar styles
  useEffect(() => {
    let scrollScheduled = false;

    /**
     * Scroll handler throttled via requestAnimationFrame.
     * Prevents scroll events from blocking layout threads and causing paint lag.
     */
    const handleScroll = () => {
      if (scrollScheduled) return;
      scrollScheduled = true;
      requestAnimationFrame(() => {
        if (window.scrollY > 50) {
          setScrolled(true);
        } else {
          setScrolled(false);
        }
        scrollScheduled = false;
      });
    };

    // Register with passive option to boost scrolling performance on touch devices
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(closeTimeout.current);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header 
      className={`navbar ${isLoaded ? 'visible' : ''} ${menuOpen ? 'menu-open' : ''} ${scrolled ? 'scrolled' : ''} ${mobileMenuOpen ? 'mobile-menu-active' : ''}`}
      onMouseLeave={requestMenuClose}
      onMouseEnter={cancelMenuClose}
    >
      <div className="nav-container">
        {/* Left Side: Hamburger toggle on mobile viewports, Desktop links on desktop */}
        <div className="nav-left">
          {/* Mobile Hamburger Toggle Button */}
          <button 
            className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>

          {/* Wrapper to hold desktop navigation items */}
          <div className="nav-desktop-links">
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
        </div>
        
        {/* Center: ONE8 Metallic Branding Logo */}
        <div className="nav-center">
          <a href="#" className="logo-link" onClick={(e) => e.preventDefault()}>
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

      {/* Mobile Navigation Drawer */}
      <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-content">
          <nav className="mobile-nav-list">
            {['featured', 'women', 'men', 'calendar'].map((menu) => (
              <a
                key={menu}
                href="#"
                className="mobile-nav-item"
                onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                }}
              >
                {menu === 'featured' ? 'Featured' : 
                 menu === 'women' ? 'Women' : 
                 menu === 'men' ? 'Men' : 
                 menu === 'calendar' ? 'Release Calendar' : menu}
              </a>
            ))}
          </nav>
          
          <div className="mobile-nav-divider"></div>
          
          <div className="mobile-nav-extra">
            <a href="#" className="mobile-extra-link" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); }}>About us</a>
            <a href="#" className="mobile-extra-link" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); }}>My account</a>
            <a href="#" className="mobile-extra-link" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); }}>Contact us</a>
            <a href="#" className="mobile-extra-link" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); }}>Return & Exchange Portal</a>
          </div>
        </div>
      </div>

      {/* Mega Menu Overlay inside the Header (Memoized component receiving stable callbacks) */}
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

