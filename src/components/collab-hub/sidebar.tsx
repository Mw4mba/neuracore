"use client";
import React from "react";
import Link from "next/link";
import { X, User, Home } from "lucide-react";

interface Chat {
  name: string;
  lastMessage: string;
  time: string;
}

interface SidebarProps {
  chats: Chat[];
  activeChat: string | null;
  setActiveChat: (chat: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  chats,
  activeChat,
  setActiveChat,
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  return (
    <div
      className={`${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 transition-transform duration-300 ease-in-out
      fixed md:static inset-y-0 left-0 z-30 w-72 bg-bg border-r border-border-secondary flex flex-col`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-secondary/70 bg-bg shadow-sm">
        <h2 className="font-semibold text-lg tracking-tight text-text-primary">
          CollabHub
        </h2>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden text-brand-red hover:text-text-primary transition-colors"
        >
          <X size={22} />
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border-secondary/50 scrollbar-track-transparent">
        {chats.map((chat) => {
          const isActive = chat.name === activeChat;
          const trimmedMessage =
            chat.lastMessage.length > 40
              ? chat.lastMessage.slice(0, 40) + "..."
              : chat.lastMessage;

          return (
            <div
              key={chat.name}
              onClick={() => {
                setActiveChat(chat.name);
                setIsSidebarOpen(false);
              }}
              className={`flex items-center gap-3 px-5 py-3.5 cursor-pointer transition-all duration-200 group
                ${
                  isActive
                    ? "bg-bg-gray"
                    : "hover:bg-dark-gray/70 active:bg-bg-gray"
                }`}
            >
              {/* Avatar */}
              <div className="relative w-11 h-11 flex-shrink-0">
                <div className="w-full h-full rounded-full bg-gray-300 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
              </div>

              {/* Chat Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-primary text-[15px] truncate">
                  {chat.name}
                </p>
                <p className="text-sm text-text-secondary truncate mt-0.5">
                  {trimmedMessage}
                </p>
              </div>

              {/* Time */}
              <span className="text-xs text-text-secondary/60 whitespace-nowrap ml-1">
                {chat.time}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-border-secondary/70 bg-bg px-5 py-3.5">
        <Link
          href="/trending-ideas"
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border-secondary/60 text-text-secondary hover:text-brand-red  hover:border-brand-red transition-all duration-200 text-sm font-medium"
        >
          <Home className="w-4 h-4" />
          Back to Ideas
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
