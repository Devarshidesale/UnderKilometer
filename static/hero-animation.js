/**
 * Scroll-Driven Hero Animation
 * 
 * This script handles:
 * 1. Preloading 192 frame images
 * 2. Scroll-to-frame mapping for smooth animation
 * 3. Text fade animations synchronized with scroll
 * 4. Scroll lock during animation and release after completion
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    totalFrames: 192,
    frameBasePath: '/static/underkilometer-frames/',
    framePrefix: 'ezgif-frame-',
    frameExtension: '.jpg',
    scrollMultiplier: 5 // How many pixels of scroll per frame
  };

  // State
  const state = {
    frames: [],
    currentFrame: 0,
    isLoaded: false,
    isAnimationComplete: false,
    canvas: null,
    ctx: null,
    heroSection: null,
    scrollHeight: 0
  };

  // Text animation ranges (frame-based)
  const TEXT_RANGES = {
    title: { fadeIn: [0, 30], visible: [30, 60], fadeOut: [60, 90] },
    about: { fadeIn: [60, 90], visible: [90, 120], fadeOut: [120, 150] },
    punch: { fadeIn: [120, 150], visible: [150, 170], fadeOut: [170, 192] }
  };

  /**
   * Initialize the hero animation system
   */
  function init() {
    // Get DOM elements
    state.heroSection = document.getElementById('hero-scroll-section');
    state.canvas = document.getElementById('hero-canvas');
    
    if (!state.heroSection || !state.canvas) {
      console.error('Hero animation: Required elements not found');
      return;
    }

    state.ctx = state.canvas.getContext('2d');
    
    // Calculate scroll height (total frames * scroll multiplier)
    state.scrollHeight = CONFIG.totalFrames * CONFIG.scrollMultiplier;
    
    // Set spacer height to create scrollable area
    const spacer = document.getElementById('hero-scroll-spacer');
    if (spacer) {
      spacer.style.height = state.scrollHeight + 'px';
    }

    // Set up canvas sizing
    resizeCanvas();
    window.addEventListener('resize', debounce(resizeCanvas, 100));

    // Show loading state
    showLoadingState();

    // Preload all frames
    preloadFrames().then(() => {
      state.isLoaded = true;
      hideLoadingState();
      
      // Draw first frame
      drawFrame(0);
      
      // Set up scroll listener
      setupScrollListener();
      
      // Initial text state
      updateTextAnimations(0);
    }).catch(err => {
      console.error('Failed to preload frames:', err);
      hideLoadingState();
    });
  }

  /**
   * Preload all frame images
   */
  function preloadFrames() {
    return new Promise((resolve, reject) => {
      let loadedCount = 0;
      const loadingBar = document.getElementById('hero-loading-bar');

      for (let i = 1; i <= CONFIG.totalFrames; i++) {
        const img = new Image();
        const frameNum = String(i).padStart(3, '0');
        img.src = `${CONFIG.frameBasePath}${CONFIG.framePrefix}${frameNum}${CONFIG.frameExtension}`;
        
        img.onload = () => {
          loadedCount++;
          // Update loading progress
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
            resolve(); // Continue even if some frames fail
          }
        };
        
        state.frames[i - 1] = img;
      }
    });
  }

  /**
   * Set up scroll event listener with requestAnimationFrame
   */
  function setupScrollListener() {
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /**
   * Handle scroll events and update animation
   */
  function handleScroll() {
    if (!state.isLoaded) return;

    const heroRect = state.heroSection.getBoundingClientRect();
    const scrollTop = window.scrollY;
    const heroTop = state.heroSection.offsetTop;
    
    // Calculate how far we've scrolled through the hero section
    const scrollProgress = scrollTop - heroTop;
    
    // Calculate frame number based on scroll position
    let frameIndex = Math.floor(scrollProgress / CONFIG.scrollMultiplier);
    
    // Clamp frame index to valid range
    frameIndex = Math.max(0, Math.min(CONFIG.totalFrames - 1, frameIndex));
    
    // Only update if frame changed
    if (frameIndex !== state.currentFrame) {
      state.currentFrame = frameIndex;
      drawFrame(frameIndex);
      updateTextAnimations(frameIndex);
    }
    
    // Check if animation is complete
    if (frameIndex >= CONFIG.totalFrames - 1 && !state.isAnimationComplete) {
      state.isAnimationComplete = true;
      releaseScroll();
    }
  }

  /**
   * Draw a specific frame to the canvas
   */
  function drawFrame(frameIndex) {
    const img = state.frames[frameIndex];
    if (!img || !img.complete) return;

    const canvas = state.canvas;
    const ctx = state.ctx;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate scaling to cover the canvas (like background-size: cover)
    const imgRatio = img.width / img.height;
    const canvasRatio = canvas.width / canvas.height;
    
    let drawWidth, drawHeight, offsetX, offsetY;
    
    if (imgRatio > canvasRatio) {
      // Image is wider - fit by height
      drawHeight = canvas.height;
      drawWidth = img.width * (canvas.height / img.height);
      offsetX = (canvas.width - drawWidth) / 2;
      offsetY = 0;
    } else {
      // Image is taller - fit by width
      drawWidth = canvas.width;
      drawHeight = img.height * (canvas.width / img.width);
      offsetX = 0;
      offsetY = (canvas.height - drawHeight) / 2;
    }
    
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }

  /**
   * Update text animations based on current frame
   */
  function updateTextAnimations(frameIndex) {
    const titleEl = document.getElementById('hero-text-title');
    const aboutEl = document.getElementById('hero-text-about');
    const punchEl = document.getElementById('hero-text-punch');

    if (titleEl) animateText(titleEl, frameIndex, TEXT_RANGES.title);
    if (aboutEl) animateText(aboutEl, frameIndex, TEXT_RANGES.about);
    if (punchEl) animateText(punchEl, frameIndex, TEXT_RANGES.punch);
  }

  /**
   * Animate a single text element based on frame and range
   */
  function animateText(element, frame, range) {
    let opacity = 0;
    let translateY = 20;

    if (frame >= range.fadeIn[0] && frame < range.fadeIn[1]) {
      // Fading in
      const progress = (frame - range.fadeIn[0]) / (range.fadeIn[1] - range.fadeIn[0]);
      opacity = progress;
      translateY = 20 * (1 - progress);
    } else if (frame >= range.visible[0] && frame < range.visible[1]) {
      // Fully visible
      opacity = 1;
      translateY = 0;
    } else if (frame >= range.fadeOut[0] && frame <= range.fadeOut[1]) {
      // Fading out
      const progress = (frame - range.fadeOut[0]) / (range.fadeOut[1] - range.fadeOut[0]);
      opacity = 1 - progress;
      translateY = -20 * progress;
    }

    element.style.opacity = opacity;
    element.style.transform = `translateY(${translateY}px)`;
  }

  /**
   * Release scroll lock after animation completes
   */
  function releaseScroll() {
    state.heroSection.classList.add('animation-complete');
    document.body.classList.remove('hero-scroll-locked');
  }

  /**
   * Resize canvas to match container
   */
  function resizeCanvas() {
    if (!state.canvas) return;
    
    const container = state.heroSection;
    const dpr = window.devicePixelRatio || 1;
    
    // Set display size
    state.canvas.style.width = '100%';
    state.canvas.style.height = '100vh';
    
    // Set actual canvas size accounting for device pixel ratio
    state.canvas.width = container.offsetWidth * dpr;
    state.canvas.height = window.innerHeight * dpr;
    
    // Scale context to account for device pixel ratio
    state.ctx.scale(dpr, dpr);
    
    // Redraw current frame
    if (state.isLoaded) {
      drawFrame(state.currentFrame);
    }
  }

  /**
   * Show loading state
   */
  function showLoadingState() {
    const loader = document.getElementById('hero-loader');
    if (loader) loader.style.display = 'flex';
  }

  /**
   * Hide loading state
   */
  function hideLoadingState() {
    const loader = document.getElementById('hero-loader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => {
        loader.style.display = 'none';
      }, 300);
    }
  }

  /**
   * Debounce utility function
   */
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

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
