"use client";
import React, { useState } from "react";
import { Send, Menu, X, User } from "lucide-react";
import Sidebar from "@/components/collab-hub/sidebar";
import Messages from "@/components/collab-hub/Messages";

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState("Jane Doe");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const chats = [
    {
      name: "Michael Jackson",
      lastMessage: "Hey! How’s your project going?",
      time: "12:45 PM",
      messages: [
        { sender: "Michael Jackson", text: "Hey! How’s your project going?" },
        { sender: "You", text: "Pretty good actually, thanks for asking 😄" },
        { sender: "Michael Jackson", text: "That’s awesome! Keep it up." },
      ],
    },
    {
      name: "Kwena",
      lastMessage: "Wanna grab coffee later?",
      time: "11:10 AM",
      messages: [
        { sender: "Kwena", text: "Wanna grab coffee later?" },
        { sender: "You", text: "Sure, let’s do 3PM ☕" },
      ],
    },
    {
      name: "Team Chat",
      lastMessage: "Meeting starts in 10 mins!",
      time: "Yesterday",
      messages: [
        { sender: "Alice", text: "Meeting starts in 10 mins!" },
        { sender: "Bob", text: "On my way 👋" },
        { sender: "You", text: "Cool, I’ll join now." },
      ],
    },
  ];

  const currentChat = chats.find((c) => c.name === activeChat);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-bg">
      <Sidebar
        chats={chats}
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 bg-orange-300 border p-2 rounded-full shadow-md z-20"
      >
        <Menu size={22} />
      </button>

      <Messages activeChat={activeChat} currentChat={currentChat} />
    </div>
  );
}
