"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function VerifyEmailPage() {
  return (
    <div className="text-center space-y-6">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-500/10 mb-4">
        <svg className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      
      <h3 className="text-xl font-bold text-white">Check your email</h3>
      
      <p className="text-gray-400 text-sm">
        We sent you an email with a link to verify your account. 
        Click the link to continue.
      </p>

      <div className="pt-4">
        <Link href="/login">
          <Button variant="secondary" className="w-full">
            Return to Login
          </Button>
        </Link>
      </div>
    </div>
  );
}
