"use client";
import { signOut } from "@/lib/auth";
import {
  AwardIcon,
  BellIcon,
  CreditCard,
  GroupIcon,
  HamburgerIcon,
  LayoutDashboard,
  LightbulbIcon,
  ListChecks,
  LogOut,
  LucideHamburger,

  LucideSettings,

  Menu,
  MessageCircle,
  MoonIcon,
  Plus,
  RocketIcon,
  Settings,
  Settings2Icon,
  SunIcon,
  TimerReset,
  TrophyIcon,
  UserRound,
  WeightIcon,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [profile, setProfile] = useState<{
  full_name?: string;
  username?: string;
  avatar_url?: string;
  role?: string;
} | null>(null);


  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const handleSignOut = async () => {
    setLoading(true);
    const { success, error } = await signOut();

    if (success) {
      toast.success("Signed out successfully!");
      router.push("/login"); // redirect after logout
    } else {
      console.error("Failed to sign out:", error);
      toast.error("Sign out failed. Please try again.");
    }

    setLoading(false);
  };

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as
      | "light"
      | "dark"
      | null;
    const initialTheme = storedTheme || "dark";
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile/get");
      if (!res.ok) {
        toast.warning("Not logged in or failed to fetch profile");
        return;
      }
      const data = await res.json();
      setProfile(data.user || data); 
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  fetchProfile();
}, []);

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const placeholder = "/account.svg";
  
  return (
    <nav className="h-[9vh] sticky top-0 right-0 left-0 z-30 border-b-2 border-border-secondary/40 md:backdrop-blur-2xl flex justify-between px-[6vw] items-center bg-bg md:bg-bg/30">
      <div className="flex items-end gap-4">
        <Link href="/trending-ideas" className="flex items-center">
          <Image
            src={
              theme === "dark"
                ? "/neuracore-white-logo.png"
                : "/neuracore-black-logo.png"
            }
            alt="NeuraCore Logo"
            width={130}
            height={40}
            className="object-contain"
            priority
          />
        </Link>
      </div>

      <div className="flex p-2 gap-4">
        {/* Desktop Links */}
        <div className="hidden mr-4 md:flex items-center gap-2">
          {profile?.role === "user" && (
            <Link
              href="/dashboard(user)"
              className="text-sm text-text-secondary hover:text-btn-primary-hover flex items-center gap-1"
            >
              <svg className="w-4 h-4" /> Dashboard
            </Link>
          )}
          {profile?.role === "moderator" && (
            <Link
              href="/recruiter/dashboard"
              className="text-sm text-text-secondary hover:text-btn-primary-hover flex items-center gap-1"
            >
              <svg className="w-4 h-4" /> Dashboard
            </Link>
          )}
          {profile?.role === "admin" && (
            <Link
              href="/admin/dashboard"
              className="text-sm text-text-secondary hover:text-btn-primary-hover flex items-center gap-1"
            >
              <svg className="w-4 h-4" /> Dashboard
            </Link>
          )}
          <Link
            href="/leaderboard"
            className="text-sm text-text-secondary hover:text-btn-primary-hover flex items-center gap-1"
          >
            <svg className="w-4 h-4" /> Leaderboard
          </Link>
          <Link
            href="/challenges"
            className="text-sm text-text-secondary hover:text-btn-primary-hover flex items-center gap-1"
          >
            <svg className="w-4 h-4" /> Challenges
          </Link>
        </div>
        {profile?.role === "moderator" && (
          <Link
            href="/submit-challenge"
            className="hidden md:flex items-center justify-center group"
          >
            <div
              className="flex items-center bg-text-primary text-bg-dark-gray 
              hover:bg-bg-gray hover:text-text-primary rounded-full 
              px-3 py-2 transition-all duration-500 
              ease-[cubic-bezier(0.25,0.8,0.25,1)] overflow-hidden"
              style={{ height: "38px" }}
            >
              <Plus
                size={19}
                className="transition-transform duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] 
                group-hover:rotate-90"
              />
              <span
                className="inline-block text-sm font-medium overflow-hidden 
                max-w-0 group-hover:max-w-[120px] group-hover:ml-2
                transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]"
              >
                Create Challenge
              </span>
            </div>
          </Link>
        )}
        {profile?.role === "user" && (
          <Link
            href="/submit-idea"
            className="hidden md:flex items-center justify-center group"
          >
            <div
              className="flex items-center bg-text-primary text-bg-dark-gray 
              hover:bg-bg-gray hover:text-text-primary rounded-full 
              px-3 py-2 transition-all duration-500 
              ease-[cubic-bezier(0.25,0.8,0.25,1)] overflow-hidden"
              style={{ height: "38px" }}
            >
              <Plus
                size={19}
                className="transition-transform duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] 
                group-hover:rotate-90"
              />
              <span
                className="inline-block text-sm font-medium overflow-hidden 
                max-w-0 group-hover:max-w-[120px] group-hover:ml-2
                transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]"
              >
                Submit Idea
              </span>
            </div>
          </Link>
        )}
        

        <Link
          href="/payment"
          className="hidden md:flex hover:text-white hover:bg-btn-primary gap-1 text-xs font-semibold items-center hover:border-brand-red text-brand-red border-2 px-2.5 py-0.5 rounded-lg"
        >
          <RocketIcon size={17} /> Upgrade
        </Link>
        <button
          onClick={toggleTheme}
          className="hidden md:flex items-center hover:bg-brand-red cursor-pointer justify-center text-text-primary hover:text-bg  rounded-full py-2 px-2.5"
        >
          {theme === "dark" ? <SunIcon size={19} /> : <MoonIcon size={19} />}
        </button>

        {/* Profile Dropdown */}
        <div className="hidden md:flex items-center relative" ref={profileRef}>
          <div
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="cursor-pointer rounded-full justify-center items-center flex overflow-hidden h-10 w-10 ring-1 ring-brand-red/50 transition-all"
          >
            <Image
              src={profile?.avatar_url || placeholder}
              alt="profile-pic"
              width={35}
              height={35}
              className="object-cover"
            />
          </div>
          {isProfileOpen && (
            <div className="absolute right-3 top-9 mt-3 w-54 rounded-lg border border-bg-gray bg-bg-dark shadow-lg z-50 p-1">
              <Link
                href="/profile"
                className="flex items-center gap-3 px-5 py-3 text-sm hover:text-white hover:bg-bg-dark-gray rounded-md transition-colors"
              >
                <UserRound size={21} className="text-brand-red" /> Profile
              </Link>
              <Link
                href="/profile?tab=Achievements"
                className="flex items-center gap-3 px-5 py-3 text-sm hover:text-white hover:bg-bg-dark-gray rounded-md transition-colors"
              >
                <AwardIcon size={18} className="text-brand-red"/> Achievements
              </Link>
              <Link
                href="/profile?tab=Notifications"
                className="flex items-center gap-3 px-5 py-3 text-sm hover:text-white hover:bg-bg-dark-gray rounded-md transition-colors"
              >
                <BellIcon size={18} className="text-brand-red"/> Notifications
              </Link>
              <Link
                href="/profile?tab=Settings"
                className="flex items-center gap-3 px-5 py-3 text-sm hover:text-white hover:bg-bg-dark-gray rounded-md transition-colors"
              >
                <LucideSettings size={18} className="text-brand-red" /> Settings
              </Link>
              <Link
                href="/profile?tab=Settings#plans"
                className="flex items-center gap-3 px-5 py-3 text-sm hover:text-white hover:bg-bg-dark-gray rounded-md transition-colors"
              >
                <CreditCard size={18} className="text-brand-red" /> Plan
              </Link>
              <Link
                href="/collab-hub"
                className="flex items-center gap-3 px-5 py-3 text-sm hover:text-white hover:bg-bg-dark-gray rounded-md transition-colors"
              >
                <MessageCircle size={18} className="text-brand-red" /> CollabHub
              </Link>
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="flex items-center gap-3 px-5 py-3 text-sm text-brand-red hover:bg-brand-red w-full hover:text-white  rounded-md transition-colors"
              >
                <LogOut size={18} /> {loading ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-text-primary md:hidden block"
        >
          <Menu size={19} />
        </button>

        {isMenuOpen && (
          <div className="fixed inset-0 z-40">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="absolute top-0 right-0 bottom-0 w-[70vw] sm:w-[60vw] bg-bg-dark shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex justify-end p-4">
                  <X
                    size={24}
                    onClick={() => setIsMenuOpen(false)}
                    className="cursor-pointer"
                  />
                </div>

                <Link 
                 href="/profile"
                 className="flex items-center gap-3 p-4 border-b border-bg-gray hover:bg-bg-dark-gray transition-colors cursor-pointer rounded-r-full">
                  <div className="bg-bg-dark-gray p-2 rounded-full flex items-center justify-center">
                    <UserRound size={18} />
                  </div>
                  <h1 className="text-text-primary font-semibold">
                    {profile?.full_name || "Anonymous User"}
                  </h1>
                </Link>

                <div className="flex flex-col mt-2">
                  <Link
                    href="/trending-ideas"
                    className="flex items-center gap-3 p-4 text-text-primary hover:bg-bg-dark-gray rounded-r-full"
                  >
                    <LightbulbIcon className="text-brand-red" size={16} /> Ideas
                  </Link>
                  <Link
                    href="/challenges"
                    className="flex items-center gap-3 p-4 text-text-primary hover:bg-bg-dark-gray rounded-r-full"
                  >
                    <ListChecks size={16} className="text-brand-red" /> Challenges
                  </Link>
                  {profile?.role === "user" && (
                    <Link
                    href="/dashboard(user)"
                    className="flex items-center gap-3 p-4 text-text-primary hover:bg-bg-dark-gray rounded-r-full"
                  >
                    <LayoutDashboard size={16} className="text-brand-red"/>
                    Dashboard
                  </Link>
                  )}
                  {profile?.role === "admin" && (
                    <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-3 p-4 text-text-primary hover:bg-bg-dark-gray rounded-r-full"
                  >
                    <LayoutDashboard size={16} className="text-brand-red"/>
                    Dashboard
                  </Link>
                  )}
                  {profile?.role === "moderator" && (
                    <Link
                    href="/recruiter/dashboard"
                    className="flex items-center gap-3 p-4 text-text-primary hover:bg-bg-dark-gray rounded-r-full"
                  >
                    <LayoutDashboard size={16} className="text-brand-red"/>
                    Dashboard
                  </Link>
                  )}
                  <Link
                    href="/dashboard(user)"
                    className="flex items-center gap-3 p-4 text-text-primary hover:bg-bg-dark-gray rounded-r-full"
                  >
                    <LayoutDashboard size={16} className="text-brand-red"/>
                    Dashboard
                  </Link>
                  <Link
                    href="/leaderboard"
                    className="flex items-center gap-3 p-4 text-text-primary hover:bg-bg-dark-gray rounded-r-full"
                  >
                    <TrophyIcon size={16} className="text-brand-red" /> Leaderboard
                  </Link>
                  <Link
                    href="/profile?tab=Settings"
                    className="flex items-center gap-3 p-4 text-text-primary hover:bg-bg-dark-gray rounded-r-full"
                  >
                    <Settings size={16} className="text-brand-red" /> Settings
                  </Link>
                  <Link
                    href="/profile?tab=Notifications"
                    className="flex items-center gap-3 p-4 text-text-primary hover:bg-bg-dark-gray rounded-r-full"
                  >
                    <BellIcon size={16} className="text-brand-red" /> Notifications
                  </Link>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 p-4 hover:bg-bg-dark-gray rounded-r-full"
                  >
                    {theme === "dark" ? (
                      <SunIcon size={19} />
                    ) : (
                      <MoonIcon size={19} />
                    )}{" "}
                    Mode
                  </button>
                  <Link
                    href="/payment"
                    className="flex items-center gap-3 p-4 hover:bg-bg-dark-gray rounded-r-full"
                  >
                    <RocketIcon size={16} className="text-brand-red" /> Upgrade
                  </Link>
                </div>
              </div>

              <div className="flex flex-col mb-6 mt-4">
                <button
                onClick={handleSignOut}
                disabled={loading}
                className="flex items-center gap-3 p-4 text-brand-red hover:bg-brand-red hover:text-white rounded w-full"
              >
                <LogOut size={18} /> {loading ? "Signing out..." : "Sign Out"}
              </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
