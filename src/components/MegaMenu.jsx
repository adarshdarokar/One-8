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
        
        {/* Featured Tab Content */}
        <div className={`mega-menu-panel ${activeMenu === 'featured' ? 'active' : ''}`}>
          <div className="mega-grid">
            <div className="mega-card">
              <div className="mega-img-wrapper">
                <img src="/assets/FeaturedImages/Cricket.png" alt="Cricket" />
              </div>
              <h3 className="mega-card-title">Cricket</h3>
            </div>
            <div className="mega-card">
              <div className="mega-img-wrapper">
                <img src="/assets/FeaturedImages/Active Lifestyle.png" alt="Active Lifestyle" />
              </div>
              <h3 className="mega-card-title">Active Lifestyle</h3>
            </div>
            <div className="mega-card">
              <div className="mega-img-wrapper">
                <img src="/assets/FeaturedImages/Hybird Workout.png" alt="Hybrid Workout" />
              </div>
              <h3 className="mega-card-title">Hybrid Workout</h3>
            </div>
          </div>
        </div>

        {/* Women Tab Content */}
        <div className={`mega-menu-panel ${activeMenu === 'women' ? 'active' : ''}`}>
          <div className="mega-grid cols-2">
            <div className="mega-card">
              <div className="mega-img-wrapper">
                <img src="/assets/Women/Gym.png" alt="Gym" />
              </div>
              <h3 className="mega-card-title">Gym</h3>
            </div>
            <div className="mega-card">
              <div className="mega-img-wrapper">
                <img src="/assets/Women/Sneakers.png" alt="Sneakers" />
              </div>
              <h3 className="mega-card-title">Sneakers</h3>
            </div>
          </div>
        </div>

        {/* Men Tab Content */}
        <div className={`mega-menu-panel ${activeMenu === 'men' ? 'active' : ''}`}>
          <div className="mega-grid">
            <div className="mega-card">
              <div className="mega-img-wrapper">
                <img src="/assets/Men/Seam collection.png" alt="Seam Collection" />
              </div>
              <h3 className="mega-card-title">Seam Collection</h3>
            </div>
            <div className="mega-card">
              <div className="mega-img-wrapper">
                <img src="/assets/Men/gym.png" alt="Gym" />
              </div>
              <h3 className="mega-card-title">Gym</h3>
            </div>
            <div className="mega-card">
              <div className="mega-img-wrapper">
                <img src="/assets/Men/running.png" alt="Running" />
              </div>
              <h3 className="mega-card-title">Running</h3>
            </div>
          </div>
        </div>

        {/* Release Calendar Tab Content */}
        <div className={`mega-menu-panel ${activeMenu === 'calendar' ? 'active' : ''}`}>
          <div className="mega-grid cols-2">
            <div className="mega-card release-card">
              <div className="mega-img-wrapper">
                <img src="/assets/Hero-Images/shoe.webp" alt="Nitro-Run Silencer" />
              </div>
              <div className="release-info">
                <span className="release-tag">COMING SOON</span>
                <h3 className="mega-card-title">Nitro-Run Silencer</h3>
                <p className="release-date">Launching July 15, 2026</p>
              </div>
            </div>
            <div className="mega-card release-card">
              <div className="mega-img-wrapper">
                <img src="/assets/Hero-Images/shoe-2.jpg" alt="Chrome-Fusion Core" />
              </div>
              <div className="release-info">
                <span className="release-tag">COMING SOON</span>
                <h3 className="mega-card-title">Chrome-Fusion Core</h3>
                <p className="release-date">Launching August 01, 2026</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default MegaMenu;
