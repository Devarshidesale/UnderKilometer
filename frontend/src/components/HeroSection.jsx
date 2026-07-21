import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/* ─────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────── */
const CONFIG = {
  startFrame: 41,
  endFrame: 166,
  totalFrames: 126,
  frameBasePath: '/underkilometer-frames/',
  framePrefix: 'ezgif-frame-',
  frameExtension: '.jpg',
  scrollSensitivity: 2,
  lerpFactor: 0.12,
};

/* ─────────────────────────────────────────────
   Helper: split string into individual <span>s
───────────────────────────────────────────── */
function buildCharSpans(text) {
  return text.split('').map((ch, i) => (
    <span
      key={i}
      className="hero-char"
      style={{ display: 'inline-block', opacity: 0, transform: 'translateY(40px)' }}
    >
      {ch === ' ' ? '\u00A0' : ch}
    </span>
  ));
}

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export default function HeroSection() {
  const canvasRef      = useRef(null);
  const heroSectionRef = useRef(null);
  const titleRef       = useRef(null);
  const loaderRef      = useRef(null);
  const loadingBarRef  = useRef(null);
  const indicatorRef   = useRef(null);
  const spacerRef      = useRef(null);
  const accentBarRef   = useRef(null);
  const aboutRef       = useRef(null);
  const loaderTextRef  = useRef(null);

  const stateRef = useRef({
    ctx: null,
    frames: [],
    currentFrame: 0,
    targetFrame: 0,
    isLoaded: false,
    isAnimationComplete: false,
    accumulatedDelta: 0,
    handleWheel: null,
    handlePageWheel: null,
  });

  useEffect(() => {
    const s           = stateRef.current;
    const canvas      = canvasRef.current;
    const heroSection = heroSectionRef.current;
    if (!canvas || !heroSection) return;

    s.ctx = canvas.getContext('2d');
    document.body.classList.add('hero-scroll-locked');

    /* ── Resize Canvas ── */
    function resizeCanvas() {
      const dpr = window.devicePixelRatio || 1;
      canvas.style.width  = '100%';
      canvas.style.height = '100vh';
      canvas.width  = heroSection.offsetWidth * dpr;
      canvas.height = window.innerHeight  * dpr;
      s.ctx.scale(dpr, dpr);
      if (s.isLoaded) drawFrame(Math.round(s.currentFrame));
    }

    /* ── Draw a single frame ── */
    function drawFrame(frameIndex) {
      const img = s.frames[frameIndex];
      if (!img || !img.complete) return;
      const ctx = s.ctx;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const imgRatio    = img.width / img.height;
      const canvasRatio = canvas.width / canvas.height;
      let drawWidth, drawHeight, offsetX, offsetY;
      if (imgRatio > canvasRatio) {
        drawHeight = canvas.height;
        drawWidth  = img.width * (canvas.height / img.height);
        offsetX    = (canvas.width - drawWidth) / 2;
        offsetY    = 0;
      } else {
        drawWidth  = canvas.width;
        drawHeight = img.height * (canvas.width / img.width);
        offsetX    = 0;
        offsetY    = (canvas.height - drawHeight) / 2;
      }
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }

    /* ── Title reveal / hide — GSAP char stagger ── */
    function updateTitle(complete) {
      const titleEl     = titleRef.current;
      const accentBarEl = accentBarRef.current;
      if (!titleEl) return;
      const chars = titleEl.querySelectorAll('.hero-char');
      if (complete) {
        gsap.to(chars, {
          opacity: 1, y: 0,
          duration: 0.6, stagger: 0.04, ease: 'power3.out', overwrite: true,
        });
        if (accentBarEl) {
          gsap.fromTo(
            accentBarEl,
            { scaleX: 0, opacity: 1 },
            { scaleX: 1, duration: 0.7, ease: 'power2.out', delay: 0.55, overwrite: true }
          );
        }
      } else {
        gsap.to(chars, {
          opacity: 0, y: 40,
          duration: 0.25, stagger: 0.015, ease: 'power2.in', overwrite: true,
        });
        if (accentBarEl) {
          gsap.to(accentBarEl, { scaleX: 0, duration: 0.2, ease: 'power2.in', overwrite: true });
        }
      }
    }

    /* ── About section: animate in ONCE after hero completes ── */
    let aboutAnimated = false;
    function animateAboutSection() {
      if (aboutAnimated) return;
      aboutAnimated = true;
      const aboutEl = aboutRef.current;
      if (!aboutEl) return;
      const children = aboutEl.querySelectorAll(
        '.desktop-thq-text-elm18, .desktop-thq-text-elm19'
      );
      if (!children.length) return;
      gsap.fromTo(
        children,
        { opacity: 0, y: 36 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.2, ease: 'power3.out', delay: 0.2 }
      );
    }

    /* ── Lock scroll ── */
    function lockScroll() {
      window.removeEventListener('wheel', s.handlePageWheel);
      window.removeEventListener('wheel', s.handleWheel);
      window.addEventListener('wheel', s.handleWheel, { passive: false });
      document.body.classList.add('hero-scroll-locked');
      heroSection.classList.remove('animation-complete');
      if (spacerRef.current) spacerRef.current.style.display = '';
      if (indicatorRef.current) gsap.to(indicatorRef.current, { opacity: 1, duration: 0.4 });
    }

    /* ── Release scroll ── */
    function releaseScroll() {
      window.removeEventListener('wheel', s.handleWheel);
      heroSection.classList.add('animation-complete');
      document.body.classList.remove('hero-scroll-locked');
      if (spacerRef.current) spacerRef.current.style.display = 'none';
      if (indicatorRef.current) gsap.to(indicatorRef.current, { opacity: 0, duration: 0.3 });
      window.addEventListener('wheel', s.handlePageWheel, { passive: true });

      // Trigger About section entrance now that the page is unfrozen
      animateAboutSection();
    }

    /* ── Primary wheel handler ── */
    s.handleWheel = function handleWheel(e) {
      e.preventDefault();
      s.accumulatedDelta += e.deltaY;
      const framesToAdvance = Math.floor(s.accumulatedDelta / (CONFIG.scrollSensitivity * 10));
      if (framesToAdvance !== 0) {
        s.targetFrame = Math.max(
          0,
          Math.min(CONFIG.totalFrames - 1, s.targetFrame + framesToAdvance)
        );
        s.accumulatedDelta -= framesToAdvance * CONFIG.scrollSensitivity * 10;
      }
    };

    /* ── Page-level wheel (re-enter animation from top) ── */
    s.handlePageWheel = function handlePageWheel(e) {
      if (s.isAnimationComplete && e.deltaY < 0 && window.scrollY === 0) {
        s.isAnimationComplete = false;
        s.targetFrame  = CONFIG.totalFrames - 1;
        s.currentFrame = CONFIG.totalFrames - 1;
        updateTitle(false);
        lockScroll();
      }
    };

    /* ── Touch ── */
    let lastTouchY = 0;
    function handleTouchStart(e) {
      if (s.isAnimationComplete) return;
      lastTouchY = e.touches[0].clientY;
    }
    function handleTouchMove(e) {
      if (s.isAnimationComplete) return;
      const touchY = e.touches[0].clientY;
      const deltaY = lastTouchY - touchY;
      lastTouchY   = touchY;
      e.preventDefault();
      s.accumulatedDelta += deltaY;
      const framesToAdvance = Math.floor(s.accumulatedDelta / CONFIG.scrollSensitivity);
      if (framesToAdvance !== 0) {
        s.targetFrame = Math.max(0, Math.min(CONFIG.totalFrames - 1, s.targetFrame + framesToAdvance));
        s.accumulatedDelta -= framesToAdvance * CONFIG.scrollSensitivity;
      }
    }

    /* ── Keyboard ── */
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

    /* ── GSAP ticker-driven loop (replaces raw RAF) ── */
    function onTick() {
      if (s.currentFrame === s.targetFrame) return;
      const diff = s.targetFrame - s.currentFrame;
      s.currentFrame += diff * CONFIG.lerpFactor;
      if (Math.abs(diff) < 0.5) s.currentFrame = s.targetFrame;

      const frameIndex = Math.round(s.currentFrame);
      drawFrame(frameIndex);

      if (frameIndex >= CONFIG.totalFrames - 1 && !s.isAnimationComplete) {
        s.isAnimationComplete = true;
        releaseScroll();
        updateTitle(true);
      } else if (frameIndex < CONFIG.totalFrames - 1 && s.isAnimationComplete) {
        s.isAnimationComplete = false;
        updateTitle(false);
      }
    }

    /* ── Preload frames ── */
    function preloadFrames() {
      return new Promise((resolve) => {
        let loadedCount = 0;
        for (let i = CONFIG.startFrame; i <= CONFIG.endFrame; i++) {
          const img      = new Image();
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

    /* ── Debounced resize ── */
    let resizeTimeout;
    function debouncedResize() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 100);
    }

    /* ── Init ── */
    resizeCanvas();
    window.addEventListener('resize', debouncedResize);
    if (loaderRef.current) loaderRef.current.style.display = 'flex';

    preloadFrames().then(() => {
      s.isLoaded = true;

      /* Loader exit timeline */
      const loaderTL = gsap.timeline({
        onComplete: () => {
          if (loaderRef.current) loaderRef.current.style.display = 'none';
        },
      });
      loaderTL
        .to(loadingBarRef.current,  { width: '100%', duration: 0.2, ease: 'none' })
        .to(loaderTextRef.current,  { opacity: 0, y: -12, duration: 0.35, ease: 'power2.in' }, '+=0.1')
        .to(loaderRef.current,      { opacity: 0, duration: 0.5, ease: 'power2.inOut' }, '-=0.1');

      /* Canvas intro */
      gsap.fromTo(
        canvas,
        { opacity: 0, scale: 1.04 },
        { opacity: 1, scale: 1, duration: 0.9, ease: 'power2.out', delay: 0.55 }
      );

      /* Scroll indicator entrance */
      if (indicatorRef.current) {
        gsap.fromTo(
          indicatorRef.current,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 0.9 }
        );
      }

      drawFrame(0);
      updateTitle(false);

      window.addEventListener('wheel',      s.handleWheel,    { passive: false });
      window.addEventListener('touchstart', handleTouchStart, { passive: true });
      window.addEventListener('touchmove',  handleTouchMove,  { passive: false });
      window.addEventListener('keydown',    handleKeydown);

      gsap.ticker.add(onTick);
    });

    /* ── Cleanup ── */
    return () => {
      window.removeEventListener('resize',     debouncedResize);
      window.removeEventListener('wheel',      s.handleWheel);
      window.removeEventListener('wheel',      s.handlePageWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove',  handleTouchMove);
      window.removeEventListener('keydown',    handleKeydown);
      gsap.ticker.remove(onTick);
      document.body.classList.remove('hero-scroll-locked');
      clearTimeout(resizeTimeout);
    };
  }, []);

  return (
    <>
      {/* ── SCROLL-DRIVEN HERO ── */}
      <section
        id="hero-scroll-section"
        className="hero-scroll-section"
        ref={heroSectionRef}
      >
        {/* Loading Overlay */}
        <div id="hero-loader" className="hero-loader" ref={loaderRef}>
          <div className="hero-loader-content">
            <span className="hero-loader-text" ref={loaderTextRef}>
              Loading Experience...
            </span>
            <div className="hero-loading-bar-container">
              <div id="hero-loading-bar" className="hero-loading-bar" ref={loadingBarRef} />
            </div>
          </div>
        </div>

        {/* Canvas */}
        <canvas
          id="hero-canvas"
          className="hero-canvas"
          ref={canvasRef}
          style={{ opacity: 0 }}
        />

        {/* Title — chars split for stagger */}
        <div className="hero-text-container">
          <h1 id="hero-text-title" className="hero-title" ref={titleRef}>
            {buildCharSpans('UnderKilometer')}
          </h1>
          <div
            className="hero-accent-bar"
            ref={accentBarRef}
            style={{ transform: 'scaleX(0)', transformOrigin: 'left center' }}
          />
        </div>

        {/* Scroll Indicator */}
        <div
          className="hero-scroll-indicator"
          ref={indicatorRef}
          style={{ opacity: 0 }}
        >
          <span>Scroll to explore</span>
          <div className="hero-scroll-arrow" />
        </div>
      </section>

      {/* Spacer */}
      <div id="hero-scroll-spacer" className="hero-scroll-spacer" ref={spacerRef} />

      {/* ── ABOUT US ── */}
      <div className="desktop-thq-introsection-elm" ref={aboutRef}>
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
