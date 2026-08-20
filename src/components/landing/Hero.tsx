export default function Hero() {
  return (
    <header className="relative z-10 w-full overflow-hidden flex items-center justify-center min-h-[92dvh] sm:min-h-[100dvh] pt-14 pb-8 sm:py-0">
      
      {/* ---- SMOOTH SCATTERED GLOW (Smoothed interpolation to target background color to eliminate banding rings) ---- */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle at center, rgba(36, 101, 150, 0.18) 0%, rgba(20, 20, 20, 0) 70%)"
        }}
      ></div>

      {/* Pulsing glow animation spot (fading into the exact background color to prevent banding) */}
      <div 
        className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[750px] h-[340px] sm:h-[750px] rounded-full animate-pulse-glow pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(94, 159, 208, 0.10) 0%, rgba(20, 20, 20, 0) 70%)"
        }}
      ></div>

      {/* ---- BEHIND-TEXT: sits behind the PS5, centered ---- */}
      <div className="absolute inset-0 flex items-center justify-center z-[1] pointer-events-none select-none">
        <div 
          className="text-behind text-center px-4 leading-[0.88] tracking-tighter"
          style={{ fontSize: "clamp(42px, 12vw, 200px)" }}
        >
          <div>GAMING</div>
          <div>BEYOND</div>
          <div>LIMITS</div>
        </div>
      </div>

      {/* ---- PS5 CONSOLE CENTERED (Responsive smartphone sizing) ---- */}
      <div className="absolute inset-0 flex items-center justify-center z-[2] pointer-events-none">
        <div
          className="relative pointer-events-auto"
          style={{ width: "clamp(210px, 32vw, 460px)", height: "clamp(280px, 42vw, 600px)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ps5.png"
            alt="PlayStation 5 Pro Console"
            className="w-full h-full object-contain drop-shadow-[0_15px_50px_rgba(94, 159, 208, 0.22)]"
          />
        </div>
      </div>

      {/* ---- OVERLAYED BRAND TITLE & SUPPORTING TEXT IN HERO VIEWPORT (Absolute bottom center) ---- */}
      <div className="absolute bottom-6 sm:bottom-12 md:bottom-16 left-1/2 -translate-x-1/2 z-[3] text-center w-full max-w-2xl px-4 sm:px-6 pointer-events-none select-none animate-fadeInUp">
        <div className="space-y-1.5 sm:space-y-2">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight title-glow">
            Rent Your Experience
          </h1>
          <p className="text-[11px] sm:text-xs md:text-sm text-gamebees-accent-lavender/50 font-light leading-relaxed max-w-xs sm:max-w-md mx-auto drop-shadow-[0_2px_8px_rgba(20,20,20,0.8)]">
            Play the latest next-gen titles on premium console setups.<br className="hidden sm:inline" />
            Same-day local dispatch, zero deposits, zero hassle.
          </p>
        </div>
      </div>

    </header>
  );
}
