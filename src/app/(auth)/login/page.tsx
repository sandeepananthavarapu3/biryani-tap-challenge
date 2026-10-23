"use client";

import { useState } from "react";
import Link from "next/link";
import { useLoadingRouter as useRouter } from "@/components/providers/NavigationProvider";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageLoading } from "@/components/ui/PageLoading";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = createClient();
    
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Invalid login credentials");
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <PageLoading message="Signing you in…" />}
      <h3 className="text-xl font-bold text-white mb-6 text-center">Welcome Back</h3>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded text-sm mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          label="Email address" 
          id="email" 
          name="email" 
          type="email" 
          required 
          placeholder="you@example.com"
        />
        <div className="space-y-1">
          <Input 
            label="Password" 
            id="password" 
            name="password" 
            type="password" 
            required 
            placeholder="••••••••"
          />
          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-xs text-amber-500 hover:text-amber-400">
              Forgot password?
            </Link>
          </div>
        </div>
        
        <Button type="submit" className="w-full mt-6" loading={loading}>
          Log In
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-400">
        Don't have an account?{" "}
        <Link href="/signup" className="font-medium text-amber-500 hover:text-amber-400">
          Sign up
        </Link>
      </p>
    </>
  );
}
