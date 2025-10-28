"use client";

import { MailCheck } from "lucide-react";
import Link from "next/link";

export default function EmailConfirmationNotice({ email }: { email?: string }) {
  return (
    <div className="flex flex-col absolute  w-screen items-center justify-center min-h-screen px-6 bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900">
      <div className="w-full max-w-lg bg-white shadow-xl rounded-2xl p-10 border border-gray-100 transition-all duration-300 hover:shadow-2xl">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-primary/10">
            <MailCheck className="w-14 h-14 text-brand-red" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-semibold mb-3 tracking-tight">
          Check your email
        </h1>

        {/* Subtext */}
        <p className="text-base text-gray-600 mb-8 leading-relaxed">
          We’ve sent a confirmation link to{" "}
          <span className="font-medium text-gray-900">{email || "your inbox"}</span>.
          Please open it and verify your account before logging in.
        </p>

        {/* Info box */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-left shadow-sm mb-6">
          <p className="mb-2 font-semibold text-gray-900 text-sm">Didn’t get the email?</p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>Check your spam or junk folder.</li>
            <li>Wait a few minutes — sometimes delivery can take a bit.</li>
            <li>Ensure you entered the correct email address.</li>
          </ul>
        </div>

        {/* Back to Login button */}
        <div className="flex justify-center">
          <Link
            href="/login"
            className="bg-btn-primary hover:bg-btn-primary-hover text-white font-semibold px-6 py-2 rounded-lg transition-all duration-300"
          >
            Back to Login
          </Link>
        </div>

        {/* Footer note */}
        <p className="text-xs text-gray-500 mt-8 leading-relaxed text-center">
          Once confirmed, you can safely close this page and log in using your
          credentials. <br /> Thank you for verifying your email 🙌
        </p>
      </div>
    </div>
  );
}
