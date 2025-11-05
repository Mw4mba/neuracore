"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeClosed } from "lucide-react";
import Terms from "./Terms";
import { signUpWithEmail } from "../auth-functions";
import { toast } from "sonner";

export default function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const router = useRouter();

  // ✅ Schema
  const signupSchema = z
    .object({
      email: z.string().email({ message: "Invalid email address" }),
      password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters" })
        .regex(/[A-Z]/, { message: "Password must include at least one uppercase letter" }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

  type SignupFormData = z.infer<typeof signupSchema>;
  
  const handleAzureSignUp = async () => {
    try {
      // Redirect to your Azure login endpoint
      window.location.href = "/api/auth/azure/login";
    } catch (error) {
      console.error("Azure signup failed:", error);
      toast.error("Failed to sign up with Azure");
    }
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      const { error } = await signUpWithEmail(data.email, data.password);
      if (error) throw error;

      toast.success("Account created! Please check your email to confirm.");
      // router.push(`/confirmation?email=${encodeURIComponent(data.email)}`);
    } catch (err: any) {
      console.error("Signup failed:", err.message);
      toast.error(err.message || "Signup failed");
    }
  };

  return (
    <div id="signup-form" className="flex justify-center w-full px-4 sm:px-6 md:px-0 py-8">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-bg-gray flex flex-col items-center w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl px-6 sm:px-8 py-8 rounded-3xl border border-border-secondary text-white"
      >
        <h1 className="text-2xl font-semibold text-center">Create Account</h1>
        <h2 className="text-xs mt-2 text-text-secondary text-center mb-4 sm:mb-6">
          Start your innovation journey today
        </h2>

        {/* Email */}
        <div className="w-full text-[10px]">
          <label className="font-semibold text-neutral-300">Email Address</label>
          <input
            type="email"
            {...register("email")}
            placeholder="e.g. johndoe@gmail.com"
            className="w-full bg-[#1c1c1c] border border-border-secondary rounded-md px-3 py-2 mt-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-btn-primary"
          />
          {errors.email && (
            <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="w-full mt-4 text-[10px]">
          <label className="font-semibold text-neutral-300">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="Enter your password"
              className="w-full bg-[#1c1c1c] border border-border-secondary rounded-md px-3 py-2 mt-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-btn-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-neutral-400"
            >
              {showPassword ? <EyeClosed size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="w-full mt-4 text-[10px]">
          <label className="font-semibold text-neutral-300">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              placeholder="Confirm your password"
              className="w-full bg-[#1c1c1c] border border-border-secondary rounded-md px-3 py-2 mt-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-btn-primary"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-neutral-400"
            >
              {showConfirmPassword ? <EyeClosed size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-400 text-xs mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Terms */}
        <div className="flex items-center gap-2 mt-5 mb-2 text-xs text-text-secondary flex-wrap justify-center sm:justify-start">
          <input
            type="checkbox"
            required
            onChange={(e) => setTermsAgreed(e.target.checked)}
            className="accent-btn-primary"
          />
          <label className="text-center sm:text-left">
            I agree to the{" "}
            <button
              type="button"
              onClick={() => setShowTerms(true)}
              className="text-brand-red hover:underline"
            >
              Terms & Conditions
            </button>
          </label>
        </div>

        <button
          type="submit"
          disabled={!termsAgreed}
          className=" bg-[#1c1c1c] cursor-pointer hover:bg-gradient-to-tr hover:from-[#af1898] hover:to-[#ce2577] border-1 border-[#ce2577] text-white font-medium py-2 px-4 rounded-lg mt-8 w-full transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
        >
          Sign Up
        </button>

        {/* Divider */}
        <div className="flex items-center justify-center w-full my-5">
          <div className="flex-grow border-t border-neutral-700"></div>
          <span className="mx-3 text-xs text-neutral-500">OR</span>
          <div className="flex-grow border-t border-neutral-700"></div>
        </div>

        {/* Azure Sign Up */}
        <div className="w-full sm:w-[90%] md:w-full">
          <button
            type="button"
            disabled={!termsAgreed}
            onClick={handleAzureSignUp}
            className="flex items-center cursor-pointer justify-center gap-2 w-full bg-[#1c1c1c] border-1 border-[#106EBE] hover:bg-[#106EBE] text-white disabled:opacity-70 disabled:cursor-not-allowed text-sm font-medium py-2 rounded-md transition-all ease-in-out transform hover:scale-105 duration-200"
          >
            <img
              src="/icons/azure-icon.png"
              alt="Microsoft"
              className="w-5 h-5"
            />
            Sign up with Azure
          </button>
        </div>

        <p className="text-[10px] mt-5 text-neutral-400 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-red hover:underline">
            Sign in
          </Link>
        </p>

        {/* Terms modal */}
        <Terms show={showTerms} onClose={() => setShowTerms(false)} />
      </form>
    </div>
  );
}
