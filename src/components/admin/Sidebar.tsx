"use client";

import React, { useState } from "react";
import { Users, FileText, Award, Flag, X, Menu } from "lucide-react";
import Link from "next/link";

const Sidebar = ({ activeSection, setActiveSection }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  const items = [
    { id: "users", label: "Users", icon: <Users size={20} /> },
    { id: "posts", label: "Posts", icon: <FileText size={20} /> },
    { id: "achievements", label: "Achievements", icon: <Award size={20} /> },
    { id: "challenges", label: "Challenges", icon: <Flag size={20} /> },
  ];

  const handleItemClick = (id: string) => {
    setActiveSection(id);
    setIsOpen(false); // auto-close on mobile
  };

  return (
    <>
      {/* Hamburger button for mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-bg border border-border-secondary rounded-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-bg border-r border-border-secondary flex flex-col z-50 transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:flex`}
      >
        <div className="p-6 font-bold text-xl text-text-primary flex justify-between items-center md:block">
          Admin Dashboard
          <button
            className="md:hidden p-1"
            onClick={() => setIsOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center gap-3 px-6 cursor-pointer py-3 text-left text-sm font-medium
                ${
                  activeSection === item.id
                    ? "bg-bg-gray text-brand-red border-l-4 border-brand-red"
                    : "text-text-secondary hover:bg-bg-dark-gray"
                }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto">
          <Link
            href="/trending-ideas"
            className="block w-full text-center py-2 px-4 bg-brand-red text-white rounded-md hover:bg-btn-primary-hover transition"
            onClick={() => setIsOpen(false)} // auto-close
          >
            Back to homepage
          </Link>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
