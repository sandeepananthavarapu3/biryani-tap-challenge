import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 spice-page relative overflow-hidden">
      {/* Background patterns/glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />
      
      <div className="max-w-md w-full space-y-8 spice-panel p-8 rounded-xl border border-gray-800 shadow-2xl relative z-10">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-extrabold text-white tracking-tight text-glow text-amber-500">
            🍗 Biryani Tap
          </h2>
        </div>
        {children}
      </div>
    </div>
  );
}
