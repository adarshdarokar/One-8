import React, { memo } from 'react';

/**
 * WardrobeSection Component for ONE8.
 * Renders the sections immediately following the Hero in normal document flow:
 * Hero → 13vh white gap → VK Banner (slim Perk wrapper strip) → 13vh white gap → ONE8 Wardrobe
 */
function WardrobeSection() {
  return (
    <div className="wardrobe-flow-wrapper">
      {/* 13vh pure white gap below Hero */}
      <div className="section-white-gap" aria-hidden="true" />

      {/* VK Banner Section - Slim full-width horizontal strip (around 180-220px desktop height) */}
      <section className="vk-banner-section" aria-label="ONE8 with Virat Kohli">
        <img
          src="/assets/wordrobe/w-withvk.png"
          alt=""
          className="vk-banner-bg"
          aria-hidden="true"
        />
        <img
          src="/assets/wordrobe/w-withvk.png"
          alt="ONE8 with Virat Kohli"
          className="vk-banner-image"
          loading="lazy"
        />
      </section>

      {/* 13vh pure white gap between VK Banner and ONE8 Wardrobe */}
      <div className="section-white-gap" aria-hidden="true" />

      {/* ONE8 Wardrobe Section - Preserving original image proportions */}
      <section className="wardrobe-section" aria-label="ONE8 Wardrobe">
        <img
          src="/assets/wordrobe/One8-wordrobe.png"
          alt="ONE8 Wardrobe"
          className="wardrobe-image"
          loading="lazy"
        />
      </section>
    </div>
  );
}

export default memo(WardrobeSection);
