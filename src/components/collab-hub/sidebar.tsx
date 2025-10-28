"use client";
import React from "react";
import { X, User } from "lucide-react";

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
      fixed md:static inset-y-0 left-0 z-30 w-72 bg-bg border-r border-border-secondary flex flex-col shadow-md`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-secondary bg-bg">
        <h2 className="font-semibold text-lg text-text-primary">CollabHub</h2>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden text-brand-red hover:text-text-primary"
        >
          <X size={22} />
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
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
              className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition-all duration-200
                ${
                  isActive
                    ? "bg-bg-gray"
                    : "hover:bg-dark-gray active:bg-bg-gray"
                }`}
            >
              <div className="w-11 h-11 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-primary truncate">{chat.name}</p>
                <p className="text-sm text-text-secondary truncate">
                  {trimmedMessage}
                </p>
              </div>

              <span className="text-xs text-text-secondary/60">{chat.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
