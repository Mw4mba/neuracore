"use client";

import { Building, GraduationCap, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"innovator" | "recruiter" | null>(null);
  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [bio, setBio] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = async () => {
    if (selectedRole === "innovator" && !fullName.trim()) return alert("Please enter your full name.");
    if (selectedRole === "recruiter" && !orgName.trim()) return alert("Please enter your organisation name.");
    if (!selectedRole) return alert("Please select a role.");

    const updates: Record<string, any> = {
      role: selectedRole, 
      bio,
    };

    if (selectedRole === "innovator") updates.full_name = fullName;
    if (selectedRole === "innovator") updates.skills = skills;

    try {
      const res = await fetch("/api/profile/setup/", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      alert("Profile updated successfully!");
      console.log(data);
      router.push("/trending-ideas");
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-[4vw] md:px-[10vw] py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6 text-center">
        Welcome! Let's set up your account
      </h1>

      <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full max-w-3xl">
        {/* Innovator Card */}
        <div
          onClick={() => setSelectedRole("innovator")}
          className={`flex-1 cursor-pointer bg-bg-dark p-6 rounded-xl border transition-all text-center
            ${selectedRole === "innovator" 
              ? "border-border-secondary bg-bg-dark scale-105" 
              : "border-border-secondary  hover:border-brand-red"}`}
        >
          <GraduationCap size={80} className="mx-auto stroke-1 mb-3" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">I’m an Innovator</h2>
          <p className="text-text-secondary text-sm">
            Share ideas, showcase your skills, collaborate, and grow your innovation profile.
          </p>
        </div>

        {/* Recruiter Card */}
        <div
          onClick={() => setSelectedRole("recruiter")}
          className={`flex-1 cursor-pointer bg-bg-dark p-6 rounded-xl border transition-all text-center
            ${selectedRole === "recruiter" 
              ? "border-border-secondary bg-bg-dark scale-105" 
              : "border-border-secondary hover:border-brand-red"}`}
        >
          <Building size={80} className="mx-auto stroke-1 mb-3"/>
          <h2 className="text-xl font-semibold text-text-primary mb-2">I’m a Recruiter</h2>
          <p className="text-text-secondary text-sm">
            Discover talent, post opportunities, and connect with skilled innovators.
          </p>
        </div>
      </div>

      {/* Conditional Input Field */}
      {selectedRole && (
        <div className="mt-6 w-full max-w-3xl mx-auto animate-fadeIn">
          
          {/* Name Input */}
          {selectedRole === "innovator" ? (
            <>
              <label className="text-text-primary text-sm">Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full mt-2 px-4 py-2 rounded bg-bg-dark text-text-primary border border-border-secondary"
              />
            </>
          ) : (
            <>
              <label className="text-text-primary text-sm">Organisation Name</label>
              <input
                type="text"
                placeholder="Enter your organisation name"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full mt-2 px-4 py-2 rounded bg-bg-dark text-text-primary border border-border-secondary"
              />
            </>
          )}

          {/* Bio Input */}
          <label className="text-text-primary text-sm mt-4 block">Bio</label>
          <textarea
            placeholder="Tell us a bit about yourself..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full mt-2 px-4 py-2 rounded bg-bg-dark text-text-primary border border-border-secondary h-20 resize-none"
          />

          {/* Skills Input (Only for Innovator) */}
          {selectedRole === "innovator" && (
            <>
              <label className="text-text-primary text-sm mt-4 block">Skills</label>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Type a skill & press Add"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  className="flex-1 px-4 py-2 rounded bg-bg-dark text-text-primary border border-border-secondary"
                />
                <button
                  onClick={addSkill}
                  className="px-4 py-2 cursor-pointer bg-brand-red hover:bg-brand-red/80 text-white rounded transition"
                >
                  Add
                </button>
              </div>

              {/* Skill Tags */}
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {skills.map((skill) => (
                    <span key={skill} className="flex items-center gap-2 bg-bg-dark text-text-primary px-3 py-1 rounded-full text-sm border border-border-secondary">
                      {skill}
                      <X size={14} className="cursor-pointer" onClick={() => removeSkill(skill)} />
                    </span>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Buttons */}
          <div className="flex gap-4 mt-6">
            <button 
             className="flex-1 py-3 rounded border border-border-secondary cursor-pointer text-text-primary hover:bg-bg-dark/50 transition"
             onClick={() => router.push("/trending-ideas")}
             >
              Skip
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 bg-brand-red cursor-pointer hover:bg-brand-red/80 text-white rounded transition"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
