import React from 'react';

function MegaMenu({ activeMenu, isOpen, onMouseEnter, onMouseLeave }) {
  return (
    <div 
      id="mega-menu" 
      className={`mega-menu-container ${isOpen ? 'open' : ''}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="mega-menu-content">
        
        {/* LEFT SIDEBAR SECTION */}
        <div className="mega-menu-sidebar">
          <div className="sidebar-nav">
            
            {/* Featured */}
            <div className="sidebar-section">
              <span className={`sidebar-nav-title ${activeMenu === 'featured' ? 'active' : ''}`}>
                Featured
              </span>
              {activeMenu === 'featured' && (
                <div className="sidebar-submenu">
                  <a href="#" className="sidebar-submenu-item" onClick={(e) => e.preventDefault()}>An Ode to Cricket</a>
                  <a href="#" className="sidebar-submenu-item" onClick={(e) => e.preventDefault()}>Active Lifestyle</a>
                  <a href="#" className="sidebar-submenu-item" onClick={(e) => e.preventDefault()}>Cover Drive</a>
                  <a href="#" className="sidebar-submenu-item" onClick={(e) => e.preventDefault()}>Hybrid Workout</a>
                </div>
              )}
            </div>

            {/* Women */}
            <div className="sidebar-section">
              <span className={`sidebar-nav-title ${activeMenu === 'women' ? 'active' : ''}`}>
                Women
              </span>
              {activeMenu === 'women' && (
                <div className="sidebar-submenu">
                  <a href="#" className="sidebar-submenu-item" onClick={(e) => e.preventDefault()}>Featured</a>
                  <a href="#" className="sidebar-submenu-item" onClick={(e) => e.preventDefault()}>Footwear</a>
                  <a href="#" className="sidebar-submenu-item" onClick={(e) => e.preventDefault()}>Clothing</a>
                  <a href="#" className="sidebar-submenu-item" onClick={(e) => e.preventDefault()}>Caps</a>
                  <a href="#" className="sidebar-submenu-item" onClick={(e) => e.preventDefault()}>Activity</a>
                </div>
              )}
            </div>

            {/* Men */}
            <div className="sidebar-section">
              <span className={`sidebar-nav-title ${activeMenu === 'men' ? 'active' : ''}`}>
                Men
              </span>
              {activeMenu === 'men' && (
                <div className="sidebar-submenu">
                  <a href="#" className="sidebar-submenu-item" onClick={(e) => e.preventDefault()}>Featured</a>
                  <a href="#" className="sidebar-submenu-item" onClick={(e) => e.preventDefault()}>Footwear</a>
                  <a href="#" className="sidebar-submenu-item" onClick={(e) => e.preventDefault()}>Clothing</a>
                  <a href="#" className="sidebar-submenu-item" onClick={(e) => e.preventDefault()}>Caps</a>
                  <a href="#" className="sidebar-submenu-item" onClick={(e) => e.preventDefault()}>Activity</a>
                </div>
              )}
            </div>

            {/* Release Calendar */}
            <div className="sidebar-section">
              <span className={`sidebar-nav-title ${activeMenu === 'calendar' ? 'active' : ''}`}>
                Release Calendar
              </span>
            </div>

          </div>

          {/* Footer links at the bottom */}
          <div className="sidebar-footer">
            <a href="#" className="sidebar-footer-link" onClick={(e) => e.preventDefault()}>About us</a>
            <a href="#" className="sidebar-footer-link" onClick={(e) => e.preventDefault()}>My account</a>
            <a href="#" className="sidebar-footer-link" onClick={(e) => e.preventDefault()}>Contact us</a>
            <a href="#" className="sidebar-footer-link" onClick={(e) => e.preventDefault()}>Return & Exchange Portal</a>
          </div>
        </div>

        {/* RIGHT CONTENT SECTION */}
        <div className="mega-menu-main">
          {/* Faded watermark logo background */}
          <div className="mega-menu-watermark">
            <img src="/assets/logo/watermark-0ne8.png" alt="One8 Watermark" />
          </div>

          {/* Featured Panel Content */}
          {activeMenu === 'featured' && (
            <div className="mega-grid">
              <div className="mega-card" onClick={(e) => e.preventDefault()}>
                <div className="mega-img-wrapper">
                  <img src="/assets/FeaturedImages/Cricket.png" alt="Cricket" />
                </div>
                <h3 className="mega-card-title">Cricket</h3>
              </div>
              <div className="mega-card" onClick={(e) => e.preventDefault()}>
                <div className="mega-img-wrapper">
                  <img src="/assets/FeaturedImages/Active Lifestyle.png" alt="Active Lifestyle" />
                </div>
                <h3 className="mega-card-title">Active Lifestyle</h3>
              </div>
              <div className="mega-card" onClick={(e) => e.preventDefault()}>
                <div className="mega-img-wrapper">
                  <img src="/assets/FeaturedImages/Hybird Workout.png" alt="Hybrid Workout" />
                </div>
                <h3 className="mega-card-title">Hybrid Workout</h3>
              </div>
            </div>
          )}

          {/* Women Panel Content */}
          {activeMenu === 'women' && (
            <div className="mega-grid cols-2">
              <div className="mega-card" onClick={(e) => e.preventDefault()}>
                <div className="mega-img-wrapper">
                  <img src="/assets/Women/Gym.png" alt="Gym" />
                </div>
                <h3 className="mega-card-title">Gym</h3>
              </div>
              <div className="mega-card" onClick={(e) => e.preventDefault()}>
                <div className="mega-img-wrapper">
                  <img src="/assets/Women/Sneakers.png" alt="Sneakers" />
                </div>
                <h3 className="mega-card-title">Sneakers</h3>
              </div>
            </div>
          )}

          {/* Men Panel Content */}
          {activeMenu === 'men' && (
            <div className="mega-grid">
              <div className="mega-card" onClick={(e) => e.preventDefault()}>
                <div className="mega-img-wrapper">
                  <img src="/assets/Men/Seam collection.png" alt="Seam Collection" />
                </div>
                <h3 className="mega-card-title">Seam Collection</h3>
              </div>
              <div className="mega-card" onClick={(e) => e.preventDefault()}>
                <div className="mega-img-wrapper">
                  <img src="/assets/Men/gym.png" alt="Gym" />
                </div>
                <h3 className="mega-card-title">Gym</h3>
              </div>
              <div className="mega-card" onClick={(e) => e.preventDefault()}>
                <div className="mega-img-wrapper">
                  <img src="/assets/Men/running.png" alt="Running" />
                </div>
                <h3 className="mega-card-title">Running</h3>
              </div>
            </div>
          )}

          {/* Release Calendar Panel Content */}
          {activeMenu === 'calendar' && (
            <div className="mega-grid">
              <div className="mega-card release-card" onClick={(e) => e.preventDefault()}>
                <div className="mega-img-wrapper">
                  <img src="/assets/Release Calendar/25 Hour pro.png" alt="25 Hour Pro" />
                  <button className="card-heart-btn" aria-label="Add to Wishlist" onClick={(e) => e.stopPropagation()}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>
                </div>
                <h3 className="mega-card-title">25 Hour Pro</h3>
                <span className="release-tag">COMING SOON</span>
              </div>
              <div className="mega-card release-card" onClick={(e) => e.preventDefault()}>
                <div className="mega-img-wrapper">
                  <img src="/assets/Release Calendar/Pro load VI.png" alt="Pro Load VI" />
                  <button className="card-heart-btn" aria-label="Add to Wishlist" onClick={(e) => e.stopPropagation()}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>
                </div>
                <h3 className="mega-card-title">Pro Load VI</h3>
                <span className="release-tag">COMING SOON</span>
              </div>
              <div className="mega-card release-card" onClick={(e) => e.preventDefault()}>
                <div className="mega-img-wrapper">
                  <img src="/assets/Release Calendar/sonic Heap.png" alt="Sonic Heap" />
                  <button className="card-heart-btn" aria-label="Add to Wishlist" onClick={(e) => e.stopPropagation()}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>
                </div>
                <h3 className="mega-card-title">Sonic Heap</h3>
                <span className="release-tag">COMING SOON</span>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default MegaMenu;
