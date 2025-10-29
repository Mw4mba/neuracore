"use client";

import { Eye, EyeClosed } from "lucide-react";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth/session-provider";
import { createClient } from "@/app/lib/supabase/client";
import { toast } from "sonner"; // 🔹 import toast

const LoginForm = () => {
  const supabase = createClient();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshSession } = useSession();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null); // Clear any previous errors
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Sign in with Supabase
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (signInError) {
        throw new Error(signInError.message || 'Sign in failed');
      }

      // Refresh the session context
      await refreshSession();

      // Show success toast
      toast.success("Successfully signed in!");

      // Get the redirect URL from the query parameters or use a default
      const redirect = searchParams.get('redirect') || '/setup';
      router.push(redirect);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign in');
      toast.error(err instanceof Error ? err.message : 'Sign in failed');
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col justify-center w-full  px-2 py-2 gap-4">
      <form
        onSubmit={handleSubmit}
        className="bg-bg-gray md:px-8 tracking-wide flex flex-col items-center px-4 sm:px-6 py-8 h-full text-white rounded-3xl w-full"
      >
        <h1 className="text-xl font-semibold text-center">Sign in</h1>
        <h2 className="text-xs mt-2 text-neutral-400 text-center">
          Enter your credentials to access your account
        </h2>

        {error && (
          <div className="w-full mt-4 p-3 rounded bg-red-500/10 border border-red-500 text-red-500 text-sm">
            {error}
          </div>
        )}

        <div className="text-[10px] mt-6 w-full">
          <label htmlFor="email" className="font-semibold text-neutral-300">
            Username
          </label>
          <input
            type="text"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="username@neura.com"
            className="
              text-white 
              bg-[#242424] 
              rounded border-none outline-none 
              px-[1vw] w-full h-8 mt-2 mb-4
              placeholder:text-xs 
              transition duration-400
              hover:shadow-[0_0_0_0.15vw_rgba(223,22,22,0.4)]
              focus:shadow-[0_0_0_0.15vw_#DF1616]
            "
          />

          <label
            htmlFor="password"
            className="font-semibold text-neutral-300 text-[10px]"
          >
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              className="
                text-white 
                bg-[#242424] 
                rounded border-none outline-none 
                px-[1vw] w-full h-8 mt-2 mb-4
                placeholder:text-xs 
                transition duration-400
                hover:shadow-[0_0_0_0.15vw_rgba(223,22,22,0.4)]
                focus:shadow-[0_0_0_0.15vw_#DF1616]
              "
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-4 text-[10px] text-neutral-400"
            >
              {showPassword ? <EyeClosed size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-gradient-to-tr cursor-pointer from-[#af1898] to-[#ce2577] text-white font-medium py-2 px-4 rounded-lg mt-8 w-full transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </>
          ) : (
            'Log In'
          )}
        </button>

        <p className="text-[10px] mt-5 text-text-secondary text-center">
          Don't have an account?{" "}
          <Link href="/signup" className="text-brand-red hover:underline">
            Sign up here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;
