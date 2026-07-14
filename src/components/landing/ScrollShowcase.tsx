"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";

interface ScrollShowcaseProps {
  onRentClick: (item: string) => void;
}

export default function ScrollShowcase({ onRentClick }: ScrollShowcaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how far down the component the user has scrolled
      const totalScrollable = rect.height - windowHeight;
      if (totalScrollable <= 0) return;
      
      const scrolled = -rect.top;
      const currentProgress = Math.min(1, Math.max(0, scrolled / totalScrollable));
      setProgress(currentProgress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Trigger initial check
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Determine active text phase
  let stage = 0;
  if (progress > 0.35 && progress <= 0.7) {
    stage = 1;
  } else if (progress > 0.7) {
    stage = 2;
  }

  // Calculate dynamic 3D positions based on scroll progress
  // Stage 0 (0% - 35%): PS5 in center-right, controller hovering nearby.
  // Stage 1 (35% - 70%): Controller moves to left-center, rotates. PS5 moves to back right.
  // Stage 2 (70% - 100%): Both assets align side-by-side in center for complete bundle.
  
  // PS5 Interpolations
  const ps5X = progress <= 0.35 
    ? 15 - (progress / 0.35) * 5         // 15vw -> 10vw
    : progress <= 0.7 
      ? 10 + ((progress - 0.35) / 0.35) * 15 // 10vw -> 25vw (slides right)
      : 25 - ((progress - 0.7) / 0.3) * 35;  // 25vw -> -10vw (joins controller)

  const ps5Y = progress <= 0.35
    ? -2 + Math.sin(progress * Math.PI) * 5
    : progress <= 0.7
      ? 3 + Math.sin((progress - 0.35) * Math.PI) * 4
      : 5 - ((progress - 0.7) / 0.3) * 5;

  const ps5RotateY = progress <= 0.35
    ? -25 + (progress / 0.35) * 45        // -25deg -> 20deg
    : progress <= 0.7
      ? 20 + ((progress - 0.35) / 0.35) * 180 // 20deg -> 200deg (spins)
      : 200 + ((progress - 0.7) / 0.3) * 145; // 200deg -> 345deg

  const ps5Scale = progress <= 0.35
    ? 1 + (progress / 0.35) * 0.1         // 1 -> 1.1
    : progress <= 0.7
      ? 1.1 - ((progress - 0.35) / 0.35) * 0.3 // 1.1 -> 0.8 (moves to background)
      : 0.8 + ((progress - 0.7) / 0.3) * 0.25; // 0.8 -> 1.05

  // Controller Interpolations
  const ctrlX = progress <= 0.35
    ? 30 - (progress / 0.35) * 10        // 30vw -> 20vw
    : progress <= 0.7
      ? 20 - ((progress - 0.35) / 0.35) * 45 // 20vw -> -25vw (moves left)
      : -25 + ((progress - 0.7) / 0.3) * 35; // -25vw -> 10vw

  const ctrlY = progress <= 0.35
    ? 12 - (progress / 0.35) * 5
    : progress <= 0.7
      ? 7 - ((progress - 0.35) / 0.35) * 12 // moves up
      : -5 + ((progress - 0.7) / 0.3) * 10;

  const ctrlRotateX = progress <= 0.35
    ? 15 - (progress / 0.35) * 25
    : progress <= 0.7
      ? -10 + ((progress - 0.35) / 0.35) * 45
      : 35 - ((progress - 0.7) / 0.3) * 20;

  const ctrlRotateY = progress <= 0.35
    ? 20 + (progress / 0.35) * 30
    : progress <= 0.7
      ? 50 - ((progress - 0.35) / 0.35) * 120 // spins opposite
      : -70 + ((progress - 0.7) / 0.3) * 90;

  const ctrlScale = progress <= 0.35
    ? 0.95 + (progress / 0.35) * 0.05
    : progress <= 0.7
      ? 1.0 + ((progress - 0.35) / 0.35) * 0.2 // scales up as it comes close
      : 1.2 - ((progress - 0.7) / 0.3) * 0.2;

  return (
    <section 
      ref={containerRef} 
      className="relative h-[250vh] bg-transparent w-full"
      id="scroll-showcase"
    >
      {/* Sticky stage viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        
        {/* Soft background light */}
        <div className="absolute inset-0 bg-transparent pointer-events-none z-0">
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -z-10 h-[500px] w-[500px] rounded-full bg-gamebees-accent-blue/10 blur-[120px] transition-all duration-700"></div>
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 -z-10 h-[500px] w-[500px] rounded-full bg-gamebees-accent-lavender/10 blur-[120px] transition-all duration-700"></div>
        </div>

        {/* Outer 3D Perspective Box */}
        <div className="relative w-full max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex items-center z-10 pointer-events-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 w-full items-center h-full relative">
            
            {/* LEFT COLUMN: Text narrative overlays */}
            <div className="relative h-[300px] flex items-center pointer-events-auto">
              
              {/* Slide 1 */}
              <div 
                className={`absolute inset-0 flex flex-col justify-center transition-all duration-700 space-y-5 ${
                  stage === 0 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 -translate-y-10 pointer-events-none"
                }`}
              >
                <span className="text-xs uppercase font-extrabold tracking-widest text-gamebees-accent-lavender bg-white/5 border border-white/10 px-3 py-1 rounded-full w-fit">
                  Hardware Power
                </span>
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
                  PlayStation 5 Pro <br />
                  <span className="text-gamebees-accent-blue">4K & 120 FPS.</span>
                </h3>
                <p className="text-white/50 text-sm sm:text-base leading-relaxed max-w-md font-light">
                  A high-fidelity gaming titan. Upgraded Ray Tracing, deep AI-upscaling, and a custom ultra-fast 2TB SSD deliver absolute responsiveness.
                </p>
                <div className="flex gap-6 text-xs font-semibold text-white/40">
                  <div>2TB SSD</div>
                  <div>•</div>
                  <div>8K/4K 120Hz</div>
                  <div>•</div>
                  <div>Liquid Metal Cooling</div>
                </div>
              </div>

              {/* Slide 2 */}
              <div 
                className={`absolute inset-0 flex flex-col justify-center transition-all duration-700 space-y-5 ${
                  stage === 1 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-10 pointer-events-none"
                }`}
              >
                <span className="text-xs uppercase font-extrabold tracking-widest text-gamebees-accent-lavender bg-white/5 border border-white/10 px-3 py-1 rounded-full w-fit">
                  Sensory Feedback
                </span>
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
                  DualSense Wireless<br />
                  <span className="text-gamebees-accent-lavender">Feel the Action.</span>
                </h3>
                <p className="text-white/50 text-sm sm:text-base leading-relaxed max-w-md font-light">
                  Haptic feedback puts environmental friction, rumble, and recoil right in your palms. Adaptive triggers vary resistance to reflect bows, triggers, and brakes.
                </p>
                <div className="flex gap-6 text-xs font-semibold text-white/40">
                  <div>Haptics</div>
                  <div>•</div>
                  <div>Adaptive Triggers</div>
                  <div>•</div>
                  <div>USB-C Charging</div>
                </div>
              </div>

              {/* Slide 3 */}
              <div 
                className={`absolute inset-0 flex flex-col justify-center transition-all duration-700 space-y-5 ${
                  stage === 2 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-10 pointer-events-none"
                }`}
              >
                <span className="text-xs uppercase font-extrabold tracking-widest text-gamebees-accent-lavender bg-white/5 border border-white/10 px-3 py-1 rounded-full w-fit">
                  Premium Experience
                </span>
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
                  The Complete Bundle <br />
                  <span className="text-white">Ready to Go.</span>
                </h3>
                <p className="text-white/50 text-sm sm:text-base leading-relaxed max-w-md font-light">
                  Rented setups are fully cleaned, sanitized, and packed in a premium travel case. All necessary power/HDMI cables and 2 controllers are included.
                </p>
                <div className="flex gap-4 pt-2">
                  <button
                    onClick={() => onRentClick("PlayStation 5 Pro")}
                    className="px-6 py-3 rounded-full btn-polished font-bold text-xs text-white pointer-events-auto"
                  >
                    Rent Now ($12/day)
                  </button>
                  <a
                    href="#faq"
                    className="px-6 py-3 rounded-full border border-white/10 hover:border-gamebees-accent-lavender hover:bg-white/5 font-semibold text-xs text-white text-center flex items-center justify-center pointer-events-auto"
                  >
                    Read FAQ
                  </a>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: 3D Rendered Stage */}
            <div className="relative h-full flex justify-center items-center select-none overflow-visible">
              
              <div className="absolute inset-0 flex items-center justify-center overflow-visible">
                {/* 3D Container */}
                <div 
                  className="relative w-[380px] h-[380px] sm:w-[480px] sm:h-[480px] flex items-center justify-center overflow-visible"
                  style={{ perspective: "1200px" }}
                >
                  
                  {/* PS5 Console Image */}
                  <div
                    className="absolute transition-transform duration-100 ease-out will-change-transform filter drop-shadow-[0_20px_50px_rgba(62,84,247,0.3)]"
                    style={{
                      transform: `translateX(${ps5X}vw) translateY(${ps5Y}vh) translateZ(${progress * 100}px) rotateY(${ps5RotateY}deg) rotateX(${progress * -5}deg) scale(${ps5Scale})`,
                      width: "55%",
                      height: "75%",
                    }}
                  >
                    <Image
                      src="/ps5.png"
                      alt="PlayStation 5 Console"
                      fill
                      priority
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>

                  {/* Controller Image */}
                  <div
                    className="absolute transition-transform duration-100 ease-out will-change-transform filter drop-shadow-[0_15px_35px_rgba(209,178,250,0.35)]"
                    style={{
                      transform: `translateX(${ctrlX}vw) translateY(${ctrlY}vh) translateZ(${(1 - progress) * 120}px) rotateX(${ctrlRotateX}deg) rotateY(${ctrlRotateY}deg) scale(${ctrlScale})`,
                      width: "48%",
                      height: "40%",
                    }}
                  >
                    <Image
                      src="/controller.png"
                      alt="DualSense Wireless Controller"
                      fill
                      priority
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>

                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
