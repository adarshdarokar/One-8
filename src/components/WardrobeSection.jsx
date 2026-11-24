import React, { memo } from 'react';

/**
 * WardrobeSection Component for ONE8.
 * Renders a full-width static background section displaying the One8 wardrobe image.
 * Positioned immediately below the Hero section.
 * Fully responsive across desktop, tablet, and mobile devices while preserving the original 1670x942 composition.
 */
function WardrobeSection() {
  return (
    <section className="wardrobe-section w-full relative bg-[#0a0a0a] overflow-hidden" aria-label="ONE8 Wardrobe">
      <img
        src="/assets/wordrobe/One8-wordrobe.png"
        alt="ONE8 Wardrobe"
        className="wardrobe-image w-full h-auto block object-cover"
        loading="lazy"
      />
    </section>
  );
}

export default memo(WardrobeSection);
