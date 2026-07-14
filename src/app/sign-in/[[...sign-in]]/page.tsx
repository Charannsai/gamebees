import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex-1 flex items-center justify-center min-h-screen bg-[#141414] text-white selection:bg-gamebees-accent-blue relative overflow-hidden">
      {/* Background glow backdrops */}
      <div 
        className="absolute w-[600px] h-[600px] left-[-100px] top-[-100px] pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(36, 101, 150, 0.12) 0%, rgba(20, 20, 20, 0) 70%)",
          filter: "blur(120px)",
        }}
      />
      <div 
        className="absolute w-[600px] h-[600px] right-[-100px] bottom-[-100px] pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(94, 159, 208, 0.08) 0%, rgba(20, 20, 20, 0) 70%)",
          filter: "blur(120px)",
        }}
      />

      {/* Massive Typography Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
        <div className="text-[18vw] font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white/[0.09] to-white/[0.02] leading-none select-none font-sans select-none">
          SIGN IN
        </div>
      </div>

      <div className="z-10 py-12 relative">
        <SignIn />
      </div>
    </main>
  );
}
