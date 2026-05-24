import Link from "next/link";
import { Zap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-bg-primary px-4">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-30%] left-[-10%] h-[600px] w-[600px] rounded-full bg-accent-blue/[0.06] blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-accent-purple/[0.06] blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-text-primary">Xautomation</span>
        </Link>

        {children}
      </div>
    </div>
  );
}
