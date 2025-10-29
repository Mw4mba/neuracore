"use client";
import GetReady from "@/components/signup/GetReady";
import LeftSide from "@/components/signup/LeftSide";
import ServiceCards from "@/components/signup/ServiceCards";
import SignupForm from "@/components/signup/SignUpForm";
import React, { useState } from "react";

const Signup = () => {
  return (
    <div className="max-w-screen">
      <section className="flex bg-white flex-col md:flex-row min-h-screen w-full justify-center items-center">
        <div className="flex  flex-col md:pt-2  md:flex-row flex-1  gap-8 max-w-[840px] w-full">
          <LeftSide />
          <SignupForm />
        </div>
      </section>
      <section className="flex bg-[#1E1E1E] flex-col min-h-screen w-full justify-center items-center">
        <ServiceCards />
        <GetReady />
      </section>
    </div>
  );
};

export default Signup;
