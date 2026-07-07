import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(CustomEase);

// Custom back ease for individual particles' overshoot
function easeOutBack(t, c1 = 1.70158) {
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

class LoaderParticle {
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
    
    // Ultra tiny dust-sized particles
    this.size = Math.random() * 1.0 + 0.6;
    
    // Delay arrival factor to create organic flow
    this.delay = Math.random() * 0.45;
    
    // Overshoot variables
    this.overshootAmount = Math.random() * 1.2 + 0.5;
    
    // Floating drift parameters
    this.driftSpeed = Math.random() * 1.2 + 0.4;
    this.driftRange = Math.random() * 30 + 10;
    this.angleOffset = Math.random() * Math.PI * 2;
    
    // Radial dispersion parameters for dissolve
    this.dissolveSpeed = Math.random() * 250 + 100;
    this.windX = (Math.random() - 0.5) * 80;
    this.windY = -Math.random() * 120 - 40;
    
    this.x = this.startX;
    this.y = this.startY;
    this.alpha = 0;
    this.finalAlpha = 0;
    this.finalR = r;
    this.finalG = g;
    this.finalB = b;
  }

  update(time, emergence, formation, shimmer, dissolve, centerX, centerY, logoX, logoWidth) {
    // 1. Calculate drift
    const driftX = Math.sin(time * this.driftSpeed + this.angleOffset) * this.driftRange;
    const driftY = Math.cos(time * this.driftSpeed + this.angleOffset * 1.3) * this.driftRange;
    
    // 2. Compute formation step
    let localT = (formation - this.delay) / (1 - this.delay);
    if (localT < 0) localT = 0;
    if (localT > 1) localT = 1;
    
    const easeVal = easeOutBack(localT, this.overshootAmount);
    
    const formedX = (this.startX + driftX) * (1 - easeVal) + this.tx * easeVal;
    const formedY = (this.startY + driftY) * (1 - easeVal) + this.ty * easeVal;
    
    // 3. Shimmer calculation
    let shimmerBoost = 0;
    if (shimmer > 0 && shimmer < 1) {
      const sweepX = logoX - 60 + shimmer * (logoWidth + 120);
      const distToSweep = Math.abs(formedX - sweepX);
      const sweepRange = 50;
      if (distToSweep < sweepRange) {
        const factor = 1 - distToSweep / sweepRange;
        shimmerBoost = factor * 0.7; // subtle brightness sweep
      }
    }
    
    // 4. Position and alpha calculations by phase
    if (dissolve > 0) {
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
      this.x = formedX;
      this.y = formedY;
      this.alpha = this.baseAlpha * Math.min(localT * 2, 1);
    } else {
      this.x = this.startX + driftX;
      this.y = this.startY + driftY;
      this.alpha = this.baseAlpha * emergence;
    }
    
    // Final values with shimmer boost
    this.finalAlpha = Math.min(1, this.alpha + shimmerBoost * 0.3);
    this.finalR = Math.floor(Math.min(255, this.r + shimmerBoost * (255 - this.r) * 0.9));
    this.finalG = Math.floor(Math.min(255, this.g + shimmerBoost * (255 - this.g) * 0.9));
    this.finalB = Math.floor(Math.min(255, this.b + shimmerBoost * (255 - this.b) * 0.9));
  }

  draw(ctx) {
    if (this.finalAlpha <= 0) return;
    ctx.fillStyle = `rgba(${this.finalR}, ${this.finalG}, ${this.finalB}, ${this.finalAlpha})`;
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
  }
}

// Offscreen pixel sampling helper
function sampleLogo(img, sampleWidth, sampleHeight) {
  const offscreen = document.createElement('canvas');
  offscreen.width = sampleWidth;
  offscreen.height = sampleHeight;
  const oCtx = offscreen.getContext('2d');
  oCtx.drawImage(img, 0, 0, sampleWidth, sampleHeight);
  
  const imgData = oCtx.getImageData(0, 0, sampleWidth, sampleHeight);
  const data = imgData.data;
  
  const tempPoints = [];
  const step = 3;
  
  for (let y = 0; y < sampleHeight; y += step) {
    for (let x = 0; x < sampleWidth; x += step) {
      const idx = (y * sampleWidth + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const alpha = data[idx + 3];
      
      if (alpha > 40) {
        tempPoints.push({ x, y, r, g, b, alpha });
      }
    }
  }
  return tempPoints;
}

function Loader({ onStartTransition, onLoaded }) {
  const canvasRef = useRef(null);
  const loaderContainerRef = useRef(null);
  const percentRef = useRef(null);
  
  const assetsLoadedRef = useRef(false);
  const currentProgressRef = useRef(0);
  const waitingRef = useRef(false);

  useEffect(() => {
    // Register custom easing for luxury curves
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

    // Timeline control parameters
    const timeState = { time: 0 };
    
    let lerpedProgress = 0;

    // Responsive size variables
    let logoWidth = 0;
    let logoHeight = 0;
    let logoX = 0;
    let logoY = 0;
    let centerX = 0;
    let centerY = 0;

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      logoWidth = Math.min(window.innerWidth * 0.7, 400);
      logoHeight = logoWidth / 2.668;
      logoX = (window.innerWidth - logoWidth) / 2;
      logoY = (window.innerHeight - logoHeight) / 2;
      
      centerX = logoX + logoWidth / 2;
      centerY = logoY + logoHeight / 2;
      
      particles.forEach(p => {
        p.tx = logoX + (p.sourceX / 320) * logoWidth;
        p.ty = logoY + (p.sourceY / 120) * logoHeight;
      });
      
      if (percentRef.current) {
        percentRef.current.style.top = `${logoY + logoHeight + 25}px`;
      }
    }

    window.addEventListener('resize', resizeCanvas);

    // Create the GSAP animation timeline for first 3 phases
    const tl = gsap.timeline({
      paused: true
    });

    // Animate from 0 to 3.7 seconds (emergence, formation, hold/shimmer)
    tl.to(timeState, {
      time: 3.7,
      duration: 3.7,
      ease: "none" // Progression is linear, easing is handled per-particle
    });

    // Checkpoint at 3.7s (end of shimmer, logo complete)
    tl.call(() => {
      if (!assetsLoadedRef.current || currentProgressRef.current < 100) {
        tl.pause();
        waitingRef.current = true;
      } else {
        triggerDissolve();
      }
    });

    function triggerDissolve() {
      waitingRef.current = false;
      
      // Wait 0.3 seconds after reaching 100% before starting the dissolve phase
      gsap.delayedCall(0.3, () => {
        if (onStartTransition) onStartTransition();
        
        // Dissolve phase (0.8s) from time 3.7 to 4.5
        gsap.to(timeState, {
          time: 4.5,
          duration: 0.8,
          ease: "luxuryCurve",
          onComplete: () => {
            document.body.classList.remove('loading');
            onLoaded(); // Cleanly unmount loader
          }
        });
      });
    }

    function checkAssetsLoaded() {
      if (shoe1Loaded && shoe2Loaded && videoLoaded) {
        assetsLoadedRef.current = true;
        // If we are waiting at 3.7s and the lerp reaches 100, triggerDissolve will fire from the animation loop
      }
    }

    // Asset preloading
    function preloadAssets() {
      const img1 = new Image();
      img1.src = '/assets/Hero-Images/shoe.webp';
      img1.onload = () => { shoe1Loaded = true; checkAssetsLoaded(); };
      img1.onerror = () => { shoe1Loaded = true; checkAssetsLoaded(); };

      const img2 = new Image();
      img2.src = '/assets/Hero-Images/shoe-2.jpg';
      img2.onload = () => { shoe2Loaded = true; checkAssetsLoaded(); };
      img2.onerror = () => { shoe2Loaded = true; checkAssetsLoaded(); };

      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/assets/video/One8.mp4', true);
      xhr.responseType = 'blob';
      
      xhr.onprogress = (e) => {
        if (e.lengthComputable) {
          videoTotalBytes = e.total;
          videoLoadedBytes = e.loaded;
        }
      };
      
      xhr.onload = () => {
        if (xhr.status === 200) {
          const videoBlob = xhr.response;
          window.preloadedVideoUrl = URL.createObjectURL(videoBlob);
        } else {
          window.preloadedVideoUrl = '/assets/video/One8.mp4';
        }
        videoLoaded = true;
        checkAssetsLoaded();
      };
      
      xhr.onerror = () => {
        window.preloadedVideoUrl = '/assets/video/One8.mp4';
        videoLoaded = true;
        checkAssetsLoaded();
      };
      
      xhr.send();
    }

    // Main animation loop
    let lastTime = Date.now();

    function animate() {
      animationId = requestAnimationFrame(animate);
      
      const now = Date.now();
      const time = now * 0.001;
      lastTime = now;
      
      const t = timeState.time;
      let emergence = 0;
      let formation = 0;
      let shimmer = 0;
      let dissolve = 0;

      // Map timeState.time to individual phase parameters
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
      
      // Calculate loading percentage
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
      
      // Smooth lerp count-up
      lerpedProgress += (targetProgress - lerpedProgress) * 0.08;
      if (Math.abs(lerpedProgress - 100) < 0.1 && targetProgress >= 100) {
        lerpedProgress = 100;
      }
      
      // Update DOM elements directly for high performance (bypass React render loop)
      if (percentRef.current) {
        percentRef.current.textContent = `Loading ${Math.floor(lerpedProgress)}%`;
        percentRef.current.style.opacity = (1 - dissolve) * 0.35;
      }
      
      // If we are waiting at 3.7s and the percentage reaches 100, trigger dissolve
      if (waitingRef.current && lerpedProgress >= 100 && assetsLoadedRef.current) {
        triggerDissolve();
      }

      // Clear canvas with dissolving background opacity
      if (dissolve > 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const bgAlpha = Math.max(0, 1 - dissolve);
        ctx.fillStyle = `rgba(0, 0, 0, ${bgAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      // Update and draw particles
      particles.forEach(p => {
        p.update(time, emergence, formation, shimmer, dissolve, centerX, centerY, logoX, logoWidth);
        p.draw(ctx);
      });
    }

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
      window.removeEventListener('resize', resizeCanvas);
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
