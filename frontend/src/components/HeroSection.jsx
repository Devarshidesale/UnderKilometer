import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const CONFIG = {
  startFrame: 41,
  endFrame: 166,
  totalFrames: 126,
  frameBasePath: '/underkilometer-frames/',
  framePrefix: 'ezgif-frame-',
  frameExtension: '.jpg',
  scrollSensitivity: 2,
};

const TEXT_RANGES = {
  title: { enter: 0, exit: 60 },
};

export default function HeroSection() {
  const canvasRef = useRef(null);
  const heroSectionRef = useRef(null);
  const titleRef = useRef(null);
  const loaderRef = useRef(null);
  const loadingBarRef = useRef(null);
  const indicatorRef = useRef(null);
  const spacerRef = useRef(null);

  // Mutable animation state stored in a ref (avoids re-renders)
  const stateRef = useRef({
    ctx: null,
    frames: [],
    currentFrame: 0,
    targetFrame: 0,
    isLoaded: false,
    isAnimationComplete: false,
    accumulatedDelta: 0,
    animFrameId: null,
    handleWheel: null,
  });

  useEffect(() => {
    const s = stateRef.current;
    const canvas = canvasRef.current;
    const heroSection = heroSectionRef.current;

    if (!canvas || !heroSection) return;

    s.ctx = canvas.getContext('2d');
    document.body.classList.add('hero-scroll-locked');

    /* ─── Resize Canvas ─── */
    function resizeCanvas() {
      const dpr = window.devicePixelRatio || 1;
      canvas.style.width = '100%';
      canvas.style.height = '100vh';
      canvas.width = heroSection.offsetWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      s.ctx.scale(dpr, dpr);
      if (s.isLoaded) drawFrame(Math.round(s.currentFrame));
    }

    /* ─── Draw a single frame on canvas ─── */
    function drawFrame(frameIndex) {
      const img = s.frames[frameIndex];
      if (!img || !img.complete) return;

      const ctx = s.ctx;
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

    /* ─── GSAP‑powered text animations ─── */
    function updateTextAnimations(frameIndex) {
      const titleEl = titleRef.current;
      if (!titleEl) return;

      const range = TEXT_RANGES.title;
      if (frameIndex >= range.enter && frameIndex < range.exit) {
        gsap.to(titleEl, { opacity: 1, y: 0, duration: 0.3, overwrite: true });
      } else if (frameIndex >= range.exit) {
        gsap.to(titleEl, { opacity: 0, y: -20, duration: 0.3, overwrite: true });
      } else {
        gsap.to(titleEl, { opacity: 0, y: 20, duration: 0.3, overwrite: true });
      }
    }

    /* ─── Release scroll after animation completes ─── */
    function releaseScroll() {
      window.removeEventListener('wheel', s.handleWheel);
      heroSection.classList.add('animation-complete');
      document.body.classList.remove('hero-scroll-locked');

      if (spacerRef.current) spacerRef.current.style.display = 'none';
      if (indicatorRef.current) {
        gsap.to(indicatorRef.current, { opacity: 0, duration: 0.3 });
      }
    }

    /* ─── Wheel handler ─── */
    s.handleWheel = function handleWheel(e) {
      if (s.isAnimationComplete) return;
      e.preventDefault();

      s.accumulatedDelta += e.deltaY;
      const framesToAdvance = Math.floor(
        s.accumulatedDelta / (CONFIG.scrollSensitivity * 10)
      );

      if (framesToAdvance !== 0) {
        s.targetFrame = Math.max(
          0,
          Math.min(CONFIG.totalFrames - 1, s.targetFrame + framesToAdvance)
        );
        s.accumulatedDelta -= framesToAdvance * CONFIG.scrollSensitivity * 10;
      }
    };

    /* ─── Touch handlers ─── */
    let lastTouchY = 0;

    function handleTouchStart(e) {
      if (s.isAnimationComplete) return;
      lastTouchY = e.touches[0].clientY;
    }

    function handleTouchMove(e) {
      if (s.isAnimationComplete) return;
      const touchY = e.touches[0].clientY;
      const deltaY = lastTouchY - touchY;
      lastTouchY = touchY;
      e.preventDefault();

      s.accumulatedDelta += deltaY;
      const framesToAdvance = Math.floor(
        s.accumulatedDelta / CONFIG.scrollSensitivity
      );
      if (framesToAdvance !== 0) {
        s.targetFrame = Math.max(
          0,
          Math.min(CONFIG.totalFrames - 1, s.targetFrame + framesToAdvance)
        );
        s.accumulatedDelta -= framesToAdvance * CONFIG.scrollSensitivity;
      }
    }

    /* ─── Keyboard handler ─── */
    function handleKeydown(e) {
      if (s.isAnimationComplete) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        s.targetFrame = Math.min(CONFIG.totalFrames - 1, s.targetFrame + 5);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        s.targetFrame = Math.max(0, s.targetFrame - 5);
      }
    }

    /* ─── RAF animation loop ─── */
    function animate() {
      if (s.currentFrame !== s.targetFrame) {
        const diff = s.targetFrame - s.currentFrame;
        const step = Math.sign(diff) * Math.max(1, Math.abs(diff) * 0.2);
        s.currentFrame += step;

        if (Math.abs(s.targetFrame - s.currentFrame) < 0.5) {
          s.currentFrame = s.targetFrame;
        }

        const frameIndex = Math.round(s.currentFrame);
        drawFrame(frameIndex);
        updateTextAnimations(frameIndex);

        if (frameIndex >= CONFIG.totalFrames - 1 && !s.isAnimationComplete) {
          s.isAnimationComplete = true;
          releaseScroll();
        }
      }
      s.animFrameId = requestAnimationFrame(animate);
    }

    /* ─── Preload all frame images ─── */
    function preloadFrames() {
      return new Promise((resolve) => {
        let loadedCount = 0;

        for (let i = CONFIG.startFrame; i <= CONFIG.endFrame; i++) {
          const img = new Image();
          const frameNum = String(i).padStart(3, '0');
          img.src = `${CONFIG.frameBasePath}${CONFIG.framePrefix}${frameNum}${CONFIG.frameExtension}`;

          img.onload = img.onerror = () => {
            loadedCount++;
            if (loadingBarRef.current) {
              loadingBarRef.current.style.width = `${(loadedCount / CONFIG.totalFrames) * 100}%`;
            }
            if (loadedCount === CONFIG.totalFrames) resolve();
          };

          s.frames[i - CONFIG.startFrame] = img;
        }
      });
    }

    /* ─── Debounced resize ─── */
    let resizeTimeout;
    function debouncedResize() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 100);
    }

    /* ─── Init ─── */
    resizeCanvas();
    window.addEventListener('resize', debouncedResize);

    if (loaderRef.current) loaderRef.current.style.display = 'flex';

    preloadFrames().then(() => {
      s.isLoaded = true;

      // Hide loader
      if (loaderRef.current) {
        loaderRef.current.style.opacity = '0';
        setTimeout(() => {
          if (loaderRef.current) loaderRef.current.style.display = 'none';
        }, 300);
      }

      drawFrame(0);
      updateTextAnimations(0);

      // Attach event listeners
      window.addEventListener('wheel', s.handleWheel, { passive: false });
      window.addEventListener('touchstart', handleTouchStart, { passive: true });
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('keydown', handleKeydown);

      // Start animation loop
      s.animFrameId = requestAnimationFrame(animate);
    });

    /* ─── Cleanup ─── */
    return () => {
      window.removeEventListener('resize', debouncedResize);
      window.removeEventListener('wheel', s.handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeydown);
      if (s.animFrameId) cancelAnimationFrame(s.animFrameId);
      document.body.classList.remove('hero-scroll-locked');
      clearTimeout(resizeTimeout);
    };
  }, []);

  return (
    <>
      {/* ── SCROLL-DRIVEN HERO ANIMATION SECTION ── */}
      <section
        id="hero-scroll-section"
        className="hero-scroll-section"
        ref={heroSectionRef}
      >
        {/* Loading Overlay */}
        <div id="hero-loader" className="hero-loader" ref={loaderRef}>
          <div className="hero-loader-content">
            <span className="hero-loader-text">Loading Experience...</span>
            <div className="hero-loading-bar-container">
              <div
                id="hero-loading-bar"
                className="hero-loading-bar"
                ref={loadingBarRef}
              />
            </div>
          </div>
        </div>

        {/* Canvas for Frame Animation */}
        <canvas id="hero-canvas" className="hero-canvas" ref={canvasRef} />

        {/* Text Overlay */}
        <div className="hero-text-container">
          <h1
            id="hero-text-title"
            className="hero-title"
            ref={titleRef}
            style={{ opacity: 0, transform: 'translateY(20px)' }}
          >
            UnderKilometer
          </h1>
        </div>

        {/* Scroll Indicator */}
        <div className="hero-scroll-indicator" ref={indicatorRef}>
          <span>Scroll to explore</span>
        </div>
      </section>

      {/* Spacer to create scroll area for animation */}
      <div
        id="hero-scroll-spacer"
        className="hero-scroll-spacer"
        ref={spacerRef}
      />

      {/* ── ABOUT US SECTION ── */}
      <div className="desktop-thq-introsection-elm">
        <div className="desktop-thq-content-elm">
          <span className="desktop-thq-text-elm18 Heading1">
            <span className="desktop-thq-text-elm24">01</span>
            <span id="About-us">About us</span>
          </span>
          <span className="desktop-thq-text-elm19 Paragraph">
            <span>
              This platform is an essential resource for college students
              seeking their ideal accommodation near their institution,
              offering a verified selection of hostels, PGs, and flats. All
              listings feature detailed reviews and ratings provided exclusively
              by current and former students who have genuinely lived in the
              properties.
            </span>
            <br />
            <span>
              This ensures that prospective renters receive transparent and
              reliable insights into the living experience, far beyond standard
              listings.
            </span>
            <br />
            <span>
              While the site diligently provides key contact numbers, it
              responsibly notes that these are student-provided and may
              occasionally be outdated, underscoring its focus on authentic,
              student-sourced information for a confident and well-informed
              decision.
            </span>
          </span>
        </div>
      </div>
    </>
  );
}
