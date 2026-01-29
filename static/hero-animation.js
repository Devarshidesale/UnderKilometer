/**
 * Scroll-Driven Hero Animation
 * 
 * This script handles:
 * 1. Preloading frame images (041-166)
 * 2. Wheel/touch events mapped to frame changes (not page scroll)
 * 3. Text fade animations synchronized with frames
 * 4. Scroll lock during animation and release after completion
 */

(function() {
  'use strict';

  const CONFIG = {
    startFrame: 41,
    endFrame: 166,
    totalFrames: 126,
    frameBasePath: '/static/underkilometer-frames/',
    framePrefix: 'ezgif-frame-',
    frameExtension: '.jpg',
    scrollSensitivity: 2
  };

  const state = {
    frames: [],
    currentFrame: 0,
    targetFrame: 0,
    isLoaded: false,
    isAnimationComplete: false,
    canvas: null,
    ctx: null,
    heroSection: null,
    accumulatedDelta: 0
  };

  const TEXT_RANGES = {
    title: { fadeIn: [0, 25], visible: [25, 45], fadeOut: [45, 60] },
    about: { fadeIn: [45, 60], visible: [60, 85], fadeOut: [85, 100] },
    punch: { fadeIn: [85, 100], visible: [100, 115], fadeOut: [115, 126] }
  };

  function init() {
    state.heroSection = document.getElementById('hero-scroll-section');
    state.canvas = document.getElementById('hero-canvas');
    
    if (!state.heroSection || !state.canvas) {
      console.error('Hero animation: Required elements not found');
      return;
    }

    state.ctx = state.canvas.getContext('2d');
    
    document.body.classList.add('hero-scroll-locked');
    
    resizeCanvas();
    window.addEventListener('resize', debounce(resizeCanvas, 100));

    showLoadingState();

    preloadFrames().then(() => {
      state.isLoaded = true;
      hideLoadingState();
      
      drawFrame(0);
      updateTextAnimations(0);
      
      setupWheelListener();
      setupTouchListener();
      setupKeyboardListener();
      
      startAnimationLoop();
    }).catch(err => {
      console.error('Failed to preload frames:', err);
      hideLoadingState();
    });
  }

  function preloadFrames() {
    return new Promise((resolve, reject) => {
      let loadedCount = 0;
      const loadingBar = document.getElementById('hero-loading-bar');

      for (let i = CONFIG.startFrame; i <= CONFIG.endFrame; i++) {
        const img = new Image();
        const frameNum = String(i).padStart(3, '0');
        img.src = `${CONFIG.frameBasePath}${CONFIG.framePrefix}${frameNum}${CONFIG.frameExtension}`;
        
        img.onload = () => {
          loadedCount++;
          if (loadingBar) {
            const progress = (loadedCount / CONFIG.totalFrames) * 100;
            loadingBar.style.width = progress + '%';
          }
          
          if (loadedCount === CONFIG.totalFrames) {
            resolve();
          }
        };
        
        img.onerror = () => {
          console.warn(`Failed to load frame ${i}`);
          loadedCount++;
          if (loadedCount === CONFIG.totalFrames) {
            resolve();
          }
        };
        
        state.frames[i - CONFIG.startFrame] = img;
      }
    });
  }

  function setupWheelListener() {
    window.addEventListener('wheel', handleWheel, { passive: false });
  }

  function setupTouchListener() {
    let touchStartY = 0;
    let lastTouchY = 0;

    window.addEventListener('touchstart', (e) => {
      if (state.isAnimationComplete) return;
      touchStartY = e.touches[0].clientY;
      lastTouchY = touchStartY;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (state.isAnimationComplete) return;
      
      const touchY = e.touches[0].clientY;
      const deltaY = lastTouchY - touchY;
      lastTouchY = touchY;
      
      e.preventDefault();
      
      state.accumulatedDelta += deltaY;
      const framesToAdvance = Math.floor(state.accumulatedDelta / CONFIG.scrollSensitivity);
      
      if (framesToAdvance !== 0) {
        state.targetFrame = Math.max(0, Math.min(CONFIG.totalFrames - 1, state.targetFrame + framesToAdvance));
        state.accumulatedDelta -= framesToAdvance * CONFIG.scrollSensitivity;
      }
    }, { passive: false });
  }

  function setupKeyboardListener() {
    window.addEventListener('keydown', (e) => {
      if (state.isAnimationComplete) return;
      
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        state.targetFrame = Math.min(CONFIG.totalFrames - 1, state.targetFrame + 5);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        state.targetFrame = Math.max(0, state.targetFrame - 5);
      }
    });
  }

  function handleWheel(e) {
    if (state.isAnimationComplete) return;
    
    e.preventDefault();
    
    state.accumulatedDelta += e.deltaY;
    const framesToAdvance = Math.floor(state.accumulatedDelta / (CONFIG.scrollSensitivity * 10));
    
    if (framesToAdvance !== 0) {
      state.targetFrame = Math.max(0, Math.min(CONFIG.totalFrames - 1, state.targetFrame + framesToAdvance));
      state.accumulatedDelta -= framesToAdvance * CONFIG.scrollSensitivity * 10;
    }
  }

  function startAnimationLoop() {
    function animate() {
      if (state.currentFrame !== state.targetFrame) {
        const diff = state.targetFrame - state.currentFrame;
        const step = Math.sign(diff) * Math.max(1, Math.abs(diff) * 0.2);
        
        state.currentFrame += step;
        
        if (Math.abs(state.targetFrame - state.currentFrame) < 0.5) {
          state.currentFrame = state.targetFrame;
        }
        
        const frameIndex = Math.round(state.currentFrame);
        drawFrame(frameIndex);
        updateTextAnimations(frameIndex);
        
        if (frameIndex >= CONFIG.totalFrames - 1 && !state.isAnimationComplete) {
          state.isAnimationComplete = true;
          releaseScroll();
        }
      }
      
      requestAnimationFrame(animate);
    }
    
    requestAnimationFrame(animate);
  }

  function drawFrame(frameIndex) {
    const img = state.frames[frameIndex];
    if (!img || !img.complete) return;

    const canvas = state.canvas;
    const ctx = state.ctx;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const imgRatio = img.width / img.height;
    const canvasRatio = canvas.width / canvas.height;
    
    let drawWidth, drawHeight, offsetX, offsetY;
    
    if (imgRatio > canvasRatio) {
      drawHeight = canvas.height;
      drawWidth = img.width * (canvas.height / img.height);
      offsetX = (canvas.width - drawWidth) / 2;
      offsetY = 0;
    } else {
      drawWidth = canvas.width;
      drawHeight = img.height * (canvas.width / img.width);
      offsetX = 0;
      offsetY = (canvas.height - drawHeight) / 2;
    }
    
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }

  function updateTextAnimations(frameIndex) {
    const titleEl = document.getElementById('hero-text-title');
    const aboutEl = document.getElementById('hero-text-about');
    const punchEl = document.getElementById('hero-text-punch');

    if (titleEl) animateText(titleEl, frameIndex, TEXT_RANGES.title);
    if (aboutEl) animateText(aboutEl, frameIndex, TEXT_RANGES.about);
    if (punchEl) animateText(punchEl, frameIndex, TEXT_RANGES.punch);
  }

  function animateText(element, frame, range) {
    let opacity = 0;
    let translateY = 20;

    if (frame >= range.fadeIn[0] && frame < range.fadeIn[1]) {
      const progress = (frame - range.fadeIn[0]) / (range.fadeIn[1] - range.fadeIn[0]);
      opacity = progress;
      translateY = 20 * (1 - progress);
    } else if (frame >= range.visible[0] && frame < range.visible[1]) {
      opacity = 1;
      translateY = 0;
    } else if (frame >= range.fadeOut[0] && frame <= range.fadeOut[1]) {
      const progress = (frame - range.fadeOut[0]) / (range.fadeOut[1] - range.fadeOut[0]);
      opacity = 1 - progress;
      translateY = -20 * progress;
    }

    element.style.opacity = opacity;
    element.style.transform = `translateY(${translateY}px)`;
  }

  function releaseScroll() {
    window.removeEventListener('wheel', handleWheel);
    
    state.heroSection.classList.add('animation-complete');
    document.body.classList.remove('hero-scroll-locked');
    
    const spacer = document.getElementById('hero-scroll-spacer');
    if (spacer) {
      spacer.style.display = 'none';
    }
    
    const indicator = document.querySelector('.hero-scroll-indicator');
    if (indicator) {
      indicator.style.opacity = '0';
    }
  }

  function resizeCanvas() {
    if (!state.canvas) return;
    
    const container = state.heroSection;
    const dpr = window.devicePixelRatio || 1;
    
    state.canvas.style.width = '100%';
    state.canvas.style.height = '100vh';
    
    state.canvas.width = container.offsetWidth * dpr;
    state.canvas.height = window.innerHeight * dpr;
    
    state.ctx.scale(dpr, dpr);
    
    if (state.isLoaded) {
      drawFrame(Math.round(state.currentFrame));
    }
  }

  function showLoadingState() {
    const loader = document.getElementById('hero-loader');
    if (loader) loader.style.display = 'flex';
  }

  function hideLoadingState() {
    const loader = document.getElementById('hero-loader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => {
        loader.style.display = 'none';
      }, 300);
    }
  }

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
