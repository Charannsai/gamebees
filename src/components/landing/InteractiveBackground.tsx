"use client";

import React, { useEffect, useRef } from "react";

export default function InteractiveBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lavenderRef = useRef<HTMLDivElement>(null);
  const blueRef = useRef<HTMLDivElement>(null);
  const pinkRef = useRef<HTMLDivElement>(null);
  const grainRef = useRef<HTMLDivElement>(null);

  // Mouse tracking targets
  const targetX = useRef(0);
  const targetY = useRef(0);
  const hasMoved = useRef(false);

  // Current animated positions (for lerp/smooth lag)
  const currentLavenderX = useRef(0);
  const currentLavenderY = useRef(0);
  const currentBlueX = useRef(0);
  const currentBlueY = useRef(0);
  const currentPinkX = useRef(0);
  const currentPinkY = useRef(0);
  const currentGrainX = useRef(0);
  const currentGrainY = useRef(0);

  // Idle movement timer
  const time = useRef(0);

  useEffect(() => {
    // Set initial coordinates to center of screen once mounted
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    targetX.current = centerX;
    targetY.current = centerY;
    
    currentLavenderX.current = centerX;
    currentLavenderY.current = centerY;
    currentBlueX.current = centerX - 100;
    currentBlueY.current = centerY + 100;
    currentPinkX.current = centerX;
    currentPinkY.current = centerY;

    const handleMouseMove = (e: MouseEvent) => {
      targetX.current = e.clientX;
      targetY.current = e.clientY;
      if (!hasMoved.current) {
        hasMoved.current = true;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    let animationFrameId: number;

    const updatePositions = () => {
      time.current += 0.004;

      if (hasMoved.current) {
        // Track cursor with smooth spring/lerp logic
        currentLavenderX.current += (targetX.current - currentLavenderX.current) * 0.04;
        currentLavenderY.current += (targetY.current - currentLavenderY.current) * 0.04;

        currentBlueX.current += (targetX.current - currentBlueX.current) * 0.02;
        currentBlueY.current += (targetY.current - currentBlueY.current) * 0.02;

        currentPinkX.current += (targetX.current - currentPinkX.current) * 0.07;
        currentPinkY.current += (targetY.current - currentPinkY.current) * 0.07;

        // Subtle opposite parallax translation for the grain overlay
        const normX = (targetX.current - window.innerWidth / 2) / (window.innerWidth / 2);
        const normY = (targetY.current - window.innerHeight / 2) / (window.innerHeight / 2);
        currentGrainX.current += (normX * -15 - currentGrainX.current) * 0.05;
        currentGrainY.current += (normY * -15 - currentGrainY.current) * 0.05;
      } else {
        // Slow organic floating loops when idle or on touch screen devices
        const w = window.innerWidth;
        const h = window.innerHeight;
        const cX = w / 2;
        const cY = h / 2;

        const lavenderTargetX = cX + Math.sin(time.current * 0.6) * (w * 0.18);
        const lavenderTargetY = cY + Math.cos(time.current * 0.4) * (h * 0.15);

        const blueTargetX = cX + Math.cos(time.current * 0.3) * (w * 0.22) - 80;
        const blueTargetY = cY + Math.sin(time.current * 0.5) * (h * 0.18) + 80;

        const pinkTargetX = cX + Math.sin(time.current * 0.8) * (w * 0.12);
        const pinkTargetY = cY + Math.cos(time.current * 0.7) * (h * 0.12);

        currentLavenderX.current += (lavenderTargetX - currentLavenderX.current) * 0.03;
        currentLavenderY.current += (lavenderTargetY - currentLavenderY.current) * 0.03;

        currentBlueX.current += (blueTargetX - currentBlueX.current) * 0.02;
        currentBlueY.current += (blueTargetY - currentBlueY.current) * 0.02;

        currentPinkX.current += (pinkTargetX - currentPinkX.current) * 0.04;
        currentPinkY.current += (pinkTargetY - currentPinkY.current) * 0.04;

        currentGrainX.current += (Math.sin(time.current * 0.4) * 4 - currentGrainX.current) * 0.05;
        currentGrainY.current += (Math.cos(time.current * 0.4) * 4 - currentGrainY.current) * 0.05;
      }

      // Apply GPU-accelerated transforms directly to the DOM for max performance (60 FPS)
      if (lavenderRef.current) {
        lavenderRef.current.style.transform = `translate3d(calc(${currentLavenderX.current}px - 50%), calc(${currentLavenderY.current}px - 50%), 0)`;
      }
      if (blueRef.current) {
        blueRef.current.style.transform = `translate3d(calc(${currentBlueX.current}px - 50%), calc(${currentBlueY.current}px - 50%), 0)`;
      }
      if (pinkRef.current) {
        pinkRef.current.style.transform = `translate3d(calc(${currentPinkX.current}px - 50%), calc(${currentPinkY.current}px - 50%), 0)`;
      }
      if (grainRef.current) {
        grainRef.current.style.transform = `translate3d(${currentGrainX.current}px, ${currentGrainY.current}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(updatePositions);
    };

    animationFrameId = requestAnimationFrame(updatePositions);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      {/* Dynamic Ambient Glowing Blobs */}
      <div 
        ref={containerRef}
        className="fixed inset-0 -z-20 overflow-hidden bg-[#0A080F] pointer-events-none select-none"
      >
        {/* Soft Ambient Background Mesh */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_50%_0%,rgba(209,178,250,0.08)_0%,transparent_50%)]" />

        {/* Lavender Glow (Medium Tracking) */}
        <div
          ref={lavenderRef}
          className="absolute top-0 left-0 w-[450px] h-[450px] md:w-[650px] md:h-[650px] rounded-full bg-[radial-gradient(circle,rgba(209,178,250,0.22)_0%,transparent_70%)] blur-[70px] md:blur-[100px] will-change-transform mix-blend-screen"
          style={{ transform: "translate3d(-50%, -50%, 0)" }}
        />

        {/* Deep Blue Glow (Slow Tracking) */}
        <div
          ref={blueRef}
          className="absolute top-0 left-0 w-[550px] h-[550px] md:w-[750px] md:h-[750px] rounded-full bg-[radial-gradient(circle,rgba(62,84,247,0.28)_0%,transparent_70%)] blur-[90px] md:blur-[120px] will-change-transform mix-blend-screen"
          style={{ transform: "translate3d(-50%, -50%, 0)" }}
        />

        {/* Pink/Magenta Accent Glow (Snappy Tracking) */}
        <div
          ref={pinkRef}
          className="absolute top-0 left-0 w-[300px] h-[300px] md:w-[450px] md:h-[450px] rounded-full bg-[radial-gradient(circle,rgba(255,104,180,0.14)_0%,transparent_70%)] blur-[50px] md:blur-[80px] will-change-transform mix-blend-screen"
          style={{ transform: "translate3d(-50%, -50%, 0)" }}
        />
      </div>

      {/* Interactive Film Grain Overlay with discrete step shimmer animation */}
      <div
        ref={grainRef}
        className="pointer-events-none fixed inset-[-40px] opacity-[0.15] z-[9999] mix-blend-overlay bg-repeat bg-center animate-grain-shimmer"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </>
  );
}
