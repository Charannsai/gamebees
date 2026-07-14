import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex-1 flex items-center justify-center min-h-screen bg-[#141414] text-white selection:bg-gamebees-accent-blue relative overflow-hidden">
      
      {/* Scattered background glows */}
      <div 
        className="absolute w-[600px] h-[600px] left-[-200px] top-[-200px] pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(36, 101, 150, 0.08) 0%, rgba(20, 20, 20, 0) 70%)",
          filter: "blur(120px)",
        }}
      />
      <div 
        className="absolute w-[600px] h-[600px] right-[-200px] bottom-[-200px] pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(94, 159, 208, 0.06) 0%, rgba(20, 20, 20, 0) 70%)",
          filter: "blur(120px)",
        }}
      />

      {/* Centered electric blue shiny glow (from landing hero) */}
      <div 
        className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(94, 159, 208, 0.22) 0%, rgba(36, 101, 150, 0.05) 50%, rgba(20, 20, 20, 0) 70%)",
        }}
      />

      {/* Flex container wrapping text and card */}
      <div className="z-10 py-12 relative flex flex-col items-center">
        
        {/* Overlapping Stencil Watermark (Half visible, half cut by card) */}
        <div className="absolute top-[-30px] sm:top-[-45px] left-1/2 -translate-x-1/2 z-0 pointer-events-none select-none overflow-visible">
          <div className="text-[12vw] sm:text-[75px] font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white/[0.14] to-white/[0.02] leading-none select-none font-sans whitespace-nowrap">
            SIGN IN
          </div>
        </div>

        {/* Clerk Component (masks the lower half of the text) */}
        <div className="z-10 relative">
          <SignIn />
        </div>
      </div>
    </main>
  );
}
