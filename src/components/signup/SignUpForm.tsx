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
          className="bg-btn-primary hover:bg-btn-primary-hover w-full sm:w-[90%] md:w-[80%] py-2 mt-3 text-white text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Create Account
        </button>

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
