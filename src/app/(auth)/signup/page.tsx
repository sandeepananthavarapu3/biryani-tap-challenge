"use client";

import { useState } from "react";
import Link from "next/link";
import { useLoadingRouter as useRouter } from "@/components/providers/NavigationProvider";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = createClient();
    
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) throw signUpError;
      
      setSuccess(true);
      router.push("/verify-email");
    } catch (err: any) {
      setError(err.message || "An error occurred during sign up");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return null; // Will redirect
  }

  return (
    <>
      <h3 className="text-xl font-bold text-white mb-6 text-center">Create an Account</h3>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded text-sm mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          label="Full Name" 
          id="name" 
          name="name" 
          required 
          placeholder="Biryani Lover"
        />
        <Input 
          label="Email address" 
          id="email" 
          name="email" 
          type="email" 
          required 
          placeholder="you@example.com"
        />
        <Input 
          label="Password" 
          id="password" 
          name="password" 
          type="password" 
          required 
          placeholder="••••••••"
          minLength={6}
        />
        
        <Button type="submit" className="w-full mt-6" loading={loading}>
          Sign Up
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-amber-500 hover:text-amber-400">
          Log in
        </Link>
      </p>
    </>
  );
}
