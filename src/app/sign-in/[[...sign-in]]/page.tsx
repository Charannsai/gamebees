import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex-1 flex items-center justify-center min-h-screen bg-[#141414] text-white selection:bg-gamebees-accent-blue relative overflow-hidden">
      {/* Background glow backdrops */}
      <div 
        className="absolute w-[500px] h-[500px] left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(36, 101, 150, 0.12) 0%, rgba(20, 20, 20, 0) 75%)",
          filter: "blur(120px)",
        }}
      />
      <div className="z-10 py-12">
        <SignIn />
      </div>
    </main>
  );
}
