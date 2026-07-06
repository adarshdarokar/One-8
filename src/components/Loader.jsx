import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

// ==========================================================================
// PARTICLE ENGINE CLASSES
// ==========================================================================

class Particle {
  constructor(tx, ty, color, width, height) {
    this.tx = tx;
    this.ty = ty;
    this.color = color;
    this.width = width;
    this.height = height;
    
    const edge = Math.floor(Math.random() * 4);
    const offset = 60;
    if (edge === 0) { // Top
      this.x = Math.random() * width;
      this.y = -offset;
    } else if (edge === 1) { // Right
      this.x = width + offset;
      this.y = Math.random() * height;
    } else if (edge === 2) { // Bottom
      this.x = Math.random() * width;
      this.y = height + offset;
    } else { // Left
      this.x = -offset;
      this.y = Math.random() * height;
    }
    
    this.vx = 0;
    this.vy = 0;
    this.size = Math.random() * 1.8 + 0.6;
    this.alpha = 0;
    this.life = 1.0;
    this.reached = false;
    this.history = [];
    this.historyLength = 5;
    
    this.speed = Math.random() * 0.035 + 0.015;
    this.friction = Math.random() * 0.05 + 0.88;
  }

  update(time, transitionStarted) {
    this.history.push({ x: this.x, y: this.y });
    if (this.history.length > this.historyLength) {
      this.history.shift();
    }

    if (!this.reached) {
      if (this.alpha < 1) this.alpha += 0.06;
      
      const dx = this.tx - this.x;
      const dy = this.ty - this.y;
      const dist = Math.hypot(dx, dy);
      
      if (dist > 2.5) {
        const force = Math.min(dist * this.speed, 6);
        const ax = (dx / dist) * force;
        const ay = (dy / dist) * force;
        
        const angle = Math.sin(this.x * 0.006 + time * 1.5) * Math.cos(this.y * 0.006 + time * 1.5) * Math.PI * 2;
        const noiseStrength = 0.55;
        const nx = Math.cos(angle) * noiseStrength;
        const ny = Math.sin(angle) * noiseStrength;
        
        this.vx = this.vx * this.friction + ax + nx;
        this.vy = this.vy * this.friction + ay + ny;
        
        this.x += this.vx;
        this.y += this.vy;
      } else {
        this.x = this.tx;
        this.y = this.ty;
        this.reached = true;
      }
    } else {
      this.life -= transitionStarted ? 0.04 : 0.02;
      this.alpha = Math.max(0, this.life);
      
      this.x = this.tx + (Math.random() - 0.5) * 0.4;
      this.y = this.ty + (Math.random() - 0.5) * 0.4;
    }
  }

  draw(ctx) {
    if (this.alpha <= 0) return;
    
    if (this.history.length > 1) {
      ctx.beginPath();
      ctx.moveTo(this.history[0].x, this.history[0].y);
      for (let i = 1; i < this.history.length; i++) {
        ctx.lineTo(this.history[i].x, this.history[i].y);
      }
      ctx.strokeStyle = this.color.replace(/[\d.]+\)$/, `${this.alpha * 0.28})`);
      ctx.lineWidth = this.size * 0.7;
      ctx.stroke();
    }
    
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color.replace(/[\d.]+\)$/, `${this.alpha})`);
    ctx.fill();
  }
}

class AmbientParticle {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.reset();
    this.y = Math.random() * height;
  }

  reset() {
    this.x = Math.random() * this.width;
    this.y = this.height + 20;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = -(Math.random() * 0.65 + 0.2);
    this.size = Math.random() * 1.3 + 0.4;
    this.alpha = Math.random() * 0.35 + 0.08;
    this.maxAlpha = this.alpha;
    this.life = 1.0;
    this.decay = Math.random() * 0.0025 + 0.0008;
  }

  update(time) {
    this.y += this.vy;
    this.x += this.vx + Math.sin(this.y * 0.012 + time) * 0.15;
    
    this.life -= this.decay;
    this.alpha = this.maxAlpha * this.life;
    
    if (this.life <= 0 || this.y < -20) {
      this.reset();
    }
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(220, 220, 220, ${this.alpha})`;
    ctx.fill();
  }
}

// ==========================================================================
// OFFSCREEN PIXEL SAMPLING
// ==========================================================================

function sampleLogo(img) {
  const sampleSize = 320;
  const offscreen = document.createElement('canvas');
  offscreen.width = sampleSize;
  offscreen.height = sampleSize;
  const oCtx = offscreen.getContext('2d');
  oCtx.drawImage(img, 0, 0, sampleSize, sampleSize);
  
  const imgData = oCtx.getImageData(0, 0, sampleSize, sampleSize);
  const data = imgData.data;
  
  const tempPoints = [];
  const step = 4;
  
  for (let y = 0; y < sampleSize; y += step) {
    for (let x = 0; x < sampleSize; x += step) {
      const idx = (y * sampleSize + x) * 4;
      const alpha = data[idx + 3];
      if (alpha > 128) {
        tempPoints.push({ x, y });
      }
    }
  }
  
  tempPoints.sort((a, b) => a.x - b.x);
  return tempPoints;
}

// ==========================================================================
// LOADER COMPONENT
// ==========================================================================

function Loader({ onLoaded }) {
  const canvasRef = useRef(null);
  const loaderContainerRef = useRef(null);
  const [percentText, setPercentText] = useState('0%');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const logoImg = new Image();
    let logoLoaded = false;
    let logoWidth = 0;
    let logoHeight = 0;
    let logoX = 0;
    let logoY = 0;

    let points = [];
    let particles = [];
    let ambientParticles = [];
    let lastSpawnedIndex = 0;
    let transitionStarted = false;

    let shoe1Loaded = false;
    let shoe2Loaded = false;
    let videoTotalBytes = 1;
    let videoLoadedBytes = 0;
    let videoLoaded = false;

    let timeProgress = 0;
    let currentProgress = 0;
    let lerpedProgress = 0;

    const animationState = {
      sweepProgress: -0.6,
      logoScale: 1.0,
      sweepActive: false
    };

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      const targetSize = Math.min(window.innerWidth * 0.42, window.innerHeight * 0.42, 300);
      logoWidth = targetSize;
      logoHeight = targetSize;
      
      logoX = (window.innerWidth - logoWidth) / 2;
      logoY = (window.innerHeight - logoHeight) / 2 - 20;
      
      if (points.length > 0) {
        particles.forEach(p => {
          if (p.target) {
            p.tx = logoX + (p.target.x / 320) * logoWidth;
            p.ty = logoY + (p.target.y / 320) * logoHeight;
          }
        });
      }
    }

    window.addEventListener('resize', resizeCanvas);

    // Orchestrate GSAP timeline transition when load is done
    function startFinalTransition() {
      if (transitionStarted) return;
      transitionStarted = true;
      animationState.sweepActive = true;
      
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(loaderContainerRef.current, {
            opacity: 0,
            duration: 1.0,
            onComplete: () => {
              document.body.classList.remove('loading');
              onLoaded(); // Notify parent App container to mount main view
            }
          });
        }
      });
      
      tl.to(animationState, {
        sweepProgress: 1.6,
        logoScale: 1.02,
        duration: 1.2,
        ease: 'power2.inOut'
      });
      
      tl.to({}, { duration: 0.3 });
    }

    // Asset preloader
    function preloadAssets() {
      const img1 = new Image();
      img1.src = '/assets/Hero-Images/shoe.webp';
      img1.onload = () => { shoe1Loaded = true; };
      img1.onerror = () => { shoe1Loaded = true; };

      const img2 = new Image();
      img2.src = '/assets/Hero-Images/shoe-2.jpg';
      img2.onload = () => { shoe2Loaded = true; };
      img2.onerror = () => { shoe2Loaded = true; };

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
          const videoUrl = URL.createObjectURL(videoBlob);
          window.preloadedVideoUrl = videoUrl; // Stash on window for HeroBackground
          videoLoaded = true;
        } else {
          window.preloadedVideoUrl = '/assets/video/One8.mp4';
          videoLoaded = true;
        }
      };
      
      xhr.onerror = () => {
        window.preloadedVideoUrl = '/assets/video/One8.mp4';
        videoLoaded = true;
      };
      
      xhr.send();
    }

    // Main Canvas animation render loop
    let lastTime = Date.now();
    let animationId = null;

    function animate() {
      animationId = requestAnimationFrame(animate);
      
      const now = Date.now();
      const deltaTime = Math.min((now - lastTime) * 0.001, 0.1);
      const time = now * 0.001;
      lastTime = now;
      
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      let assetsProgress = 0;
      if (logoLoaded) {
        if (shoe1Loaded) assetsProgress += 5;
        if (shoe2Loaded) assetsProgress += 5;
        if (videoLoaded) {
          assetsProgress += 90;
        } else {
          assetsProgress += (videoLoadedBytes / videoTotalBytes) * 90;
        }
      }
      
      if (logoLoaded && timeProgress < 100) {
        timeProgress += 0.48;
        if (timeProgress > 100) timeProgress = 100;
      }
      
      currentProgress = Math.min(timeProgress, assetsProgress);
      lerpedProgress += (currentProgress / 100 - lerpedProgress) * 0.07;
      if (Math.abs(lerpedProgress - 1.0) < 0.0002) {
        lerpedProgress = 1.0;
      }
      
      setPercentText(`${Math.floor(lerpedProgress * 100)}%`);
      
      ambientParticles.forEach(ap => {
        ap.update(time);
        ap.draw(ctx);
      });
      
      if (logoLoaded) {
        const currentRevealX = lerpedProgress * 320;
        while (lastSpawnedIndex < points.length && points[lastSpawnedIndex].x <= currentRevealX) {
          const pt = points[lastSpawnedIndex];
          const tx = logoX + (pt.x / 320) * logoWidth;
          const ty = logoY + (pt.y / 320) * logoHeight;
          
          const colors = [
            'rgba(255, 255, 255, 1)', 
            'rgba(225, 227, 230, 1)', 
            'rgba(195, 200, 205, 1)', 
            'rgba(165, 170, 175, 1)'
          ];
          const color = colors[Math.floor(Math.random() * colors.length)];
          
          const p = new Particle(tx, ty, color, canvas.width, canvas.height);
          p.target = pt;
          particles.push(p);
          
          lastSpawnedIndex++;
        }
        
        ctx.save();
        ctx.beginPath();
        const revealX = logoX + lerpedProgress * logoWidth;
        
        ctx.moveTo(0, 0);
        ctx.lineTo(revealX, 0);
        
        const waveHeight = 16;
        const waveFreq = 0.022;
        for (let y = 0; y <= canvas.height; y += 10) {
          const wave = Math.sin(y * waveFreq + time * 5.5) * waveHeight * (1 - lerpedProgress);
          ctx.lineTo(revealX + wave, y);
        }
        
        ctx.lineTo(0, canvas.height);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.clip();
        
        const dw = logoWidth * animationState.logoScale;
        const dh = logoHeight * animationState.logoScale;
        const dx = logoX - (dw - logoWidth) / 2;
        const dy = logoY - (dh - logoHeight) / 2;
        
        ctx.drawImage(logoImg, dx, dy, dw, dh);
        ctx.restore();
        
        if (animationState.sweepActive) {
          ctx.save();
          ctx.globalCompositeOperation = 'source-atop';
          
          const progress = animationState.sweepProgress;
          const dw = logoWidth * animationState.logoScale;
          const dh = logoHeight * animationState.logoScale;
          const dx = logoX - (dw - logoWidth) / 2;
          const dy = logoY - (dh - logoHeight) / 2;
          
          const sweepWidth = 160;
          const startX = dx - sweepWidth + progress * (dw + sweepWidth * 2);
          const endX = startX + sweepWidth;
          
          const gradient = ctx.createLinearGradient(startX, dy, endX, dy + dh);
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
          gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0)');
          gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.7)');
          gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(dx, dy, dw, dh);
          ctx.restore();
        }
        
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.update(time, transitionStarted);
          p.draw(ctx);
          
          if (p.reached && p.life <= 0) {
            particles.splice(i, 1);
          }
        }
      }
      
      if (lerpedProgress >= 1.0 && !transitionStarted) {
        startFinalTransition();
      }
    }

    logoImg.src = '/assets/logo/one18.png';
    logoImg.onload = () => {
      logoLoaded = true;
      resizeCanvas();
      points = sampleLogo(logoImg);
      
      for (let i = 0; i < 90; i++) {
        ambientParticles.push(new AmbientParticle(canvas.width, canvas.height));
      }
      
      animate();
      preloadAssets();
    };

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [onLoaded]);

  return (
    <div id="loader-container" ref={loaderContainerRef}>
      <canvas id="loader-canvas" ref={canvasRef}></canvas>
      <div id="loader-text-wrapper">
        <div className="loader-label">LOADING</div>
        <div id="loader-percentage">{percentText}</div>
      </div>
    </div>
  );
}

export default Loader;
