import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

// Register the CustomEase plugin from GSAP for custom easing curves
gsap.registerPlugin(CustomEase);

// Color string cache to prevent GC (Garbage Collection) overhead from string allocations in the animation loop
const colorCache = new Map();

/**
 * Fast RGBA color string generator that caches and reuses strings.
 * Allocating thousands of temporary string objects per frame triggers high GC overhead,
 * leading to periodic frame rate drops ("jank"). This function maps quantized color
 * states to cached CSS color strings using a unique 31-bit integer key.
 *
 * @param {number} r - Red color channel quantized to multiples of 4 (0-255)
 * @param {number} g - Green color channel quantized to multiples of 4 (0-255)
 * @param {number} b - Blue color channel quantized to multiples of 4 (0-255)
 * @param {number} a - Alpha channel quantized to 2 decimal places (0.0 - 1.0)
 * @returns {string} The cached rgba CSS color string
 */
function getCachedRgba(r, g, b, a) {
  // Compress alpha to 0-100 integer range (7 bits)
  const aInt = Math.round(a * 100);
  
  // Pack channels into a single 31-bit integer key:
  // Red (8 bits) | Green (8 bits) | Blue (8 bits) | Alpha (7 bits)
  const key = (r << 23) | (g << 15) | (b << 7) | aInt;
  
  let colorStr = colorCache.get(key);
  if (!colorStr) {
    colorStr = `rgba(${r},${g},${b},${a})`;
    colorCache.set(key, colorStr);
  }
  return colorStr;
}

/**
 * Custom Back Ease-Out equation for individual particles' overshoot behavior.
 * This function calculates the progression factor to overshoot the target position
 * slightly and then settle back into place, mimicking structural tension.
 *
 * @param {number} t - Time progression normalized between 0 and 1
 * @param {number} [c1=1.70158] - Overshoot intensity constant
 * @returns {number} The eased progress multiplier
 */
function easeOutBack(t, c1 = 1.70158) {
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/**
 * Represents a single dust-sized particle in the preloader canvas.
 * Manages its coordinates, motion properties, and color channels across all preloader states.
 */
class LoaderParticle {
  /**
   * Create a particle.
   * @param {number} tx - Target X coordinate where the particle forms the logo logo
   * @param {number} ty - Target Y coordinate where the particle forms the logo
   * @param {number} r - Original red channel value from image sample
   * @param {number} g - Original green channel value from image sample
   * @param {number} b - Original blue channel value from image sample
   * @param {number} baseAlpha - Original alpha channel opacity (0-255)
   */
  constructor(tx, ty, r, g, b, baseAlpha) {
    this.tx = tx;
    this.ty = ty;
    this.r = r;
    this.g = g;
    this.b = b;
    this.baseAlpha = baseAlpha / 255;
    
    // Scattered starting position across the viewport
    this.startX = Math.random() * window.innerWidth;
    this.startY = Math.random() * window.innerHeight;
    
    // Ultra tiny dust-sized particles (0.6px to 1.6px) for an elegant premium feel
    this.size = Math.random() * 1.0 + 0.6;
    
    // Delay arrival factor to create organic, flow-like assembly rather than instant snapping
    this.delay = Math.random() * 0.45;
    
    // Randomize overshoot amount per particle to vary the bounce effect
    this.overshootAmount = Math.random() * 1.2 + 0.5;
    
    // Floating drift parameters (slow sinusoidal motion while drifting or idle)
    this.driftSpeed = Math.random() * 1.2 + 0.4;
    this.driftRange = Math.random() * 30 + 10;
    this.angleOffset = Math.random() * Math.PI * 2;
    
    // Radial dispersion parameters for the dissolve/explosion phase
    this.dissolveSpeed = Math.random() * 250 + 100;
    this.windX = (Math.random() - 0.5) * 80;
    this.windY = -Math.random() * 120 - 40; // upward draft bias
    
    this.x = this.startX;
    this.y = this.startY;
    this.alpha = 0;
    this.finalAlpha = 0;
    this.finalR = r;
    this.finalG = g;
    this.finalB = b;
  }

  /**
   * Update the particle position, color, and opacity according to the active timeline phase.
   *
   * @param {number} time - Elapsed time in seconds
   * @param {number} emergence - Transition progress of the initial fade-in (0 to 1)
   * @param {number} formation - Transition progress of logo assembly (0 to 1)
   * @param {number} shimmer - Progress of the sweeping brightness shimmer effect (0 to 1)
   * @param {number} dissolve - Progress of the radial explosion/fade-out (0 to 1)
   * @param {number} centerX - Screen X coordinate of the logo center
   * @param {number} centerY - Screen Y coordinate of the logo center
   * @param {number} logoX - Screen X offset of the logo boundaries
   * @param {number} logoWidth - Responsive logo width
   */
  update(time, emergence, formation, shimmer, dissolve, centerX, centerY, logoX, logoWidth) {
    // 1. Calculate continuous floating drift (sinusoidal offset)
    const driftX = Math.sin(time * this.driftSpeed + this.angleOffset) * this.driftRange;
    const driftY = Math.cos(time * this.driftSpeed + this.angleOffset * 1.3) * this.driftRange;
    
    // 2. Compute formation step with custom back-ease overshoot curves
    let localT = (formation - this.delay) / (1 - this.delay);
    if (localT < 0) localT = 0;
    if (localT > 1) localT = 1;
    
    const easeVal = easeOutBack(localT, this.overshootAmount);
    
    const formedX = (this.startX + driftX) * (1 - easeVal) + this.tx * easeVal;
    const formedY = (this.startY + driftY) * (1 - easeVal) + this.ty * easeVal;
    
    // 3. Shimmer calculation (sweeps a bright spotlight overlay across the formed logo)
    let shimmerBoost = 0;
    if (shimmer > 0 && shimmer < 1) {
      const sweepX = logoX - 60 + shimmer * (logoWidth + 120);
      const distToSweep = Math.abs(formedX - sweepX);
      const sweepRange = 50;
      if (distToSweep < sweepRange) {
        const factor = 1 - distToSweep / sweepRange;
        shimmerBoost = factor * 0.7; // subtle brightness sweep overlay
      }
    }
    
    // 4. Determine final position and alpha according to the current active phase
    if (dissolve > 0) {
      // Phase 4: Dissolve (particles fly outwards from center and float upwards)
      const dx = this.tx - centerX;
      const dy = this.ty - centerY;
      const dist = Math.hypot(dx, dy) || 1;
      
      const disperseX = (dx / dist) * (dissolve * this.dissolveSpeed);
      const disperseY = (dy / dist) * (dissolve * this.dissolveSpeed);
      
      const windXForce = dissolve * this.windX;
      const windYForce = dissolve * this.windY;
      
      this.x = this.tx + disperseX + windXForce;
      this.y = this.ty + disperseY + windYForce;
      this.alpha = this.baseAlpha * (1 - dissolve);
    } else if (formation > 0) {
      // Phase 2 & 3: Logo formation and Shimmer hold
      this.x = formedX;
      this.y = formedY;
      this.alpha = this.baseAlpha * Math.min(localT * 2, 1);
    } else {
      // Phase 1: Emergence (drifting cloud of loose particles starts fading in)
      this.x = this.startX + driftX;
      this.y = this.startY + driftY;
      this.alpha = this.baseAlpha * emergence;
    }
    
    // Calculate final interpolated visual values with shimmer adjustments
    this.finalAlpha = Math.min(1, this.alpha + shimmerBoost * 0.3);
    this.finalR = Math.floor(Math.min(255, this.r + shimmerBoost * (255 - this.r) * 0.9));
    this.finalG = Math.floor(Math.min(255, this.g + shimmerBoost * (255 - this.g) * 0.9));
    this.finalB = Math.floor(Math.min(255, this.b + shimmerBoost * (255 - this.b) * 0.9));
  }

  /**
   * Draw particle to context (Note: call is bypassed in the optimized batch render loop below).
   */
  draw(ctx) {
    if (this.finalAlpha <= 0) return;
    ctx.fillStyle = `rgba(${this.finalR}, ${this.finalG}, ${this.finalB}, ${this.finalAlpha})`;
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
  }
}

/**
 * Samples a logo image file to fetch pixel coordinates and colors.
 * Creates an offscreen Canvas, draws the logo inside, and filters for visible pixels.
 *
 * @param {HTMLImageElement} img - The preloaded HTML logo image
 * @param {number} sampleWidth - The target width for sampling coordinates
 * @param {number} sampleHeight - The target height for sampling coordinates
 * @returns {Array<{x:number, y:number, r:number, g:number, b:number, alpha:number}>} List of sampled points
 */
function sampleLogo(img, sampleWidth, sampleHeight) {
  const offscreen = document.createElement('canvas');
  offscreen.width = sampleWidth;
  offscreen.height = sampleHeight;
  const oCtx = offscreen.getContext('2d');
  oCtx.drawImage(img, 0, 0, sampleWidth, sampleHeight);
  
  const imgData = oCtx.getImageData(0, 0, sampleWidth, sampleHeight);
  const data = imgData.data;
  
  const tempPoints = [];
  const step = 3; // Step interval for sampling density (higher = fewer particles, lower = dense)
  
  for (let y = 0; y < sampleHeight; y += step) {
    for (let x = 0; x < sampleWidth; x += step) {
      const idx = (y * sampleWidth + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const alpha = data[idx + 3];
      
      // If the pixel is opaque enough, record it
      if (alpha > 40) {
        tempPoints.push({ x, y, r, g, b, alpha });
      }
    }
  }
  return tempPoints;
}

/**
 * Preloader Component for ONE8.
 * Renders an animated particle-based metallic logo assembly canvas overlay
 * and loads website media assets in the background.
 *
 * @param {Object} props
 * @param {Function} props.onStartTransition - Callback triggered when preloader animation reaches completion checkpoints
 * @param {Function} props.onLoaded - Callback triggered when preloader fully unmounts
 */
function Loader({ onStartTransition, onLoaded }) {
  const canvasRef = useRef(null);
  const loaderContainerRef = useRef(null);
  const percentRef = useRef(null);
  
  const assetsLoadedRef = useRef(false);
  const currentProgressRef = useRef(0);
  const waitingRef = useRef(false);

  useEffect(() => {
    // Register custom easing for luxury slide curves
    CustomEase.create("luxuryCurve", "0.16, 1, 0.3, 1");

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const logoImg = new Image();
    let particles = [];
    let animationId = null;

    let shoe1Loaded = false;
    let shoe2Loaded = false;
    let videoLoaded = false;
    let videoTotalBytes = 1;
    let videoLoadedBytes = 0;

    // Timeline control parameters driven by GSAP
    const timeState = { time: 0 };
    let lerpedProgress = 0;

    // Responsive size variables
    let logoWidth = 0;
    let logoHeight = 0;
    let logoX = 0;
    let logoY = 0;
    let centerX = 0;
    let centerY = 0;

    /**
     * Recalculates canvas size and particle positions relative to viewport size.
     */
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      logoWidth = Math.min(window.innerWidth * 0.7, 400);
      logoHeight = logoWidth / 2.668;
      logoX = (window.innerWidth - logoWidth) / 2;
      logoY = (window.innerHeight - logoHeight) / 2;
      
      centerX = logoX + logoWidth / 2;
      centerY = logoY + logoHeight / 2;
      
      // Update coordinates for each particle mapping to the centered logo
      particles.forEach(p => {
        p.tx = logoX + (p.sourceX / 320) * logoWidth;
        p.ty = logoY + (p.sourceY / 120) * logoHeight;
      });
      
      if (percentRef.current) {
        percentRef.current.style.top = `${logoY + logoHeight + 25}px`;
      }
    }

    // Throttle resize triggers using requestAnimationFrame to prevent rendering bottlenecks
    let resizeScheduled = false;
    function handleResize() {
      if (resizeScheduled) return;
      resizeScheduled = true;
      requestAnimationFrame(() => {
        resizeCanvas();
        resizeScheduled = false;
      });
    }

    window.addEventListener('resize', handleResize);

    // Create the GSAP animation timeline for the first 3 phases:
    // Phase 1 (0.0s - 1.3s): Particle emergence
    // Phase 2 (1.3s - 2.9s): Logo formation
    // Phase 3 (2.9s - 3.7s): Shimmer hold
    const tl = gsap.timeline({
      paused: true
    });

    // Linear progression of time parameter. Custom back-eases are computed per-particle.
    tl.to(timeState, {
      time: 3.7,
      duration: 3.7,
      ease: "none"
    });

    // Checkpoint at 3.7s (End of logo formation and shimmer sweep)
    tl.call(() => {
      // Pause timeline here if background assets have not finished preloading
      if (!assetsLoadedRef.current || currentProgressRef.current < 100) {
        tl.pause();
        waitingRef.current = true;
      } else {
        triggerDissolve();
      }
    });

    /**
     * Triggers the final dissolve phase once loading progress hits 100% and checkpoints are cleared.
     */
    function triggerDissolve() {
      waitingRef.current = false;
      
      // Small pause (300ms) for visual balance before starting the dissolve animation
      gsap.delayedCall(0.3, () => {
        if (onStartTransition) onStartTransition();
        
        // Dissolve phase (0.8s) from time 3.7 to 4.5
        gsap.to(timeState, {
          time: 4.5,
          duration: 0.8,
          ease: "luxuryCurve",
          onComplete: () => {
            document.body.classList.remove('loading');
            onLoaded(); // Cleanly unmount loader from page DOM
          }
        });
      });
    }

    /**
     * Checks if all required image and video media assets are preloaded.
     */
    function checkAssetsLoaded() {
      if (shoe1Loaded && shoe2Loaded && videoLoaded) {
        assetsLoadedRef.current = true;
      }
    }

    /**
     * Preloads core assets (shoes WebP, high-res fallback JPEGs, and video tracks) in the background.
     */
    function preloadAssets() {
      const img1 = new Image();
      img1.src = '/assets/Hero-Images/shoe.webp';
      img1.onload = () => { shoe1Loaded = true; checkAssetsLoaded(); };
      img1.onerror = () => { shoe1Loaded = true; checkAssetsLoaded(); };

      const img2 = new Image();
      img2.src = '/assets/Hero-Images/shoe-2.jpg';
      img2.onload = () => { shoe2Loaded = true; checkAssetsLoaded(); };
      img2.onerror = () => { shoe2Loaded = true; checkAssetsLoaded(); };

      // Set global reference to play streaming files instantly
      window.preloadedVideoUrl = '/assets/video/One8.mp4';

      const tempVid = document.createElement('video');
      tempVid.src = '/assets/video/One8.mp4';
      tempVid.muted = true;
      tempVid.playsInline = true;
      
      tempVid.onprogress = () => {
        if (tempVid.buffered.length > 0) {
          const duration = tempVid.duration || 4;
          const bufferedEnd = tempVid.buffered.end(tempVid.buffered.length - 1);
          // A 2-second buffer threshold is enough to transition instantly and play smoothly
          const requiredBuffer = Math.min(duration, 2);
          const bufferProgress = Math.min(1, bufferedEnd / requiredBuffer);
          videoLoadedBytes = bufferProgress * 100;
          videoTotalBytes = 100;
        }
      };

      tempVid.oncanplay = () => {
        videoLoaded = true;
        videoLoadedBytes = 100;
        videoTotalBytes = 100;
        checkAssetsLoaded();
      };

      tempVid.oncanplaythrough = () => {
        videoLoaded = true;
        videoLoadedBytes = 100;
        videoTotalBytes = 100;
        checkAssetsLoaded();
      };
      
      tempVid.onerror = () => {
        // Fallback so users are not blocked on video loading issues
        videoLoaded = true;
        videoLoadedBytes = 100;
        videoTotalBytes = 100;
        checkAssetsLoaded();
      };

      tempVid.load();
    }

    /**
     * Primary Canvas animation render loop running at screen frame rates.
     */
    function animate() {
      animationId = requestAnimationFrame(animate);
      
      const now = Date.now();
      const time = now * 0.001;
      
      const t = timeState.time;
      let emergence = 0;
      let formation = 0;
      let shimmer = 0;
      let dissolve = 0;

      // Map progress timeline to individual animation parameters
      if (t < 1.3) {
        emergence = t / 1.3;
      } else if (t < 2.9) {
        emergence = 1;
        formation = (t - 1.3) / 1.6;
      } else if (t < 3.7) {
        emergence = 1;
        formation = 1;
        shimmer = (t - 2.9) / 0.8;
      } else {
        emergence = 1;
        formation = 1;
        shimmer = 1;
        dissolve = (t - 3.7) / 0.8;
      }
      
      // Calculate visual progress percentages
      const timeProgress = (t / 3.7) * 100;
      let assetProgress = 0;
      if (shoe1Loaded) assetProgress += 5;
      if (shoe2Loaded) assetProgress += 5;
      if (videoLoaded) {
        assetProgress += 90;
      } else {
        assetProgress += (videoTotalBytes > 0 ? (videoLoadedBytes / videoTotalBytes) * 90 : 0);
      }
      
      const targetProgress = Math.min(timeProgress, assetProgress);
      currentProgressRef.current = targetProgress;
      
      // Smooth lerp count-up for numbers
      lerpedProgress += (targetProgress - lerpedProgress) * 0.08;
      if (Math.abs(lerpedProgress - 100) < 0.1 && targetProgress >= 100) {
        lerpedProgress = 100;
      }
      
      // Update DOM elements directly for maximum performance (skipping React render cycles)
      if (percentRef.current) {
        percentRef.current.textContent = `Loading ${Math.floor(lerpedProgress)}%`;
        percentRef.current.style.opacity = (1 - dissolve) * 0.35;
      }
      
      // If we are currently paused/waiting and progress reaches 100%, trigger the dissolve state
      if (waitingRef.current && lerpedProgress >= 100 && assetsLoadedRef.current) {
        triggerDissolve();
      }

      // Clear canvas with dissolving background opacity transition
      if (dissolve > 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const bgAlpha = Math.max(0, 1 - dissolve);
        ctx.fillStyle = `rgba(0, 0, 0, ${bgAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      // Update particles and group them by color to minimize GPU state/fillStyle switches
      const colorGroups = {};
      
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.update(time, emergence, formation, shimmer, dissolve, centerX, centerY, logoX, logoWidth);
        
        if (p.finalAlpha <= 0) continue;
        
        // Quantize alpha to 2 decimal places to restrict unique keys in the string builder
        const alphaKey = Math.round(p.finalAlpha * 100) / 100;
        if (alphaKey <= 0) continue;
        
        // Quantize colors to multiples of 4 (imperceptible visual difference, reduces uniqueness)
        const rKey = Math.round(p.finalR / 4) * 4;
        const gKey = Math.round(p.finalG / 4) * 4;
        const bKey = Math.round(p.finalB / 4) * 4;
        
        // Retrieve color string from optimization cache (avoids string creation garbage collection spikes)
        const colorKey = getCachedRgba(rKey, gKey, bKey, alphaKey);
        
        if (!colorGroups[colorKey]) {
          colorGroups[colorKey] = [];
        }
        colorGroups[colorKey].push(p);
      }
      
      // Batch-draw particles to canvas grouped by color
      for (const color in colorGroups) {
        ctx.fillStyle = color;
        const group = colorGroups[color];
        for (let i = 0; i < group.length; i++) {
          const p = group[i];
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
      }
    }

    // Set source for logo pixel extraction
    logoImg.src = '/assets/logo/one18.png';
    logoImg.onload = () => {
      const points = sampleLogo(logoImg, 320, 120);
      particles = points.map(pt => {
        const p = new LoaderParticle(pt.x, pt.y, pt.r, pt.g, pt.b, pt.alpha);
        p.sourceX = pt.x;
        p.sourceY = pt.y;
        return p;
      });
      
      resizeCanvas();
      animate();
      preloadAssets();
      tl.play();
    };

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [onStartTransition, onLoaded]);

  return (
    <div 
      id="loader-container" 
      ref={loaderContainerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'transparent',
        zIndex: 9999,
        pointerEvents: 'all'
      }}
    >
      <canvas 
        ref={canvasRef} 
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      />
      <div
        ref={percentRef}
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'var(--font-luxury)',
          fontSize: '11px',
          fontWeight: '300',
          color: '#ffffff',
          opacity: 0.35,
          letterSpacing: '0.2em',
          pointerEvents: 'none',
          transition: 'opacity 0.5s ease',
          textTransform: 'uppercase'
        }}
      >
        Loading 0%
      </div>
    </div>
  );
}

export default Loader;

