"use client";
import React, { useRef, useEffect } from "react";
import { User, Send } from "lucide-react";

interface Message {
  sender: string;
  text: string;
  time?: string;
}

interface Chat {
  name: string;
  messages: Message[];
}

interface MessagesProps {
  activeChat: string | null;
  currentChat?: Chat;
}

const Messages: React.FC<MessagesProps> = ({ activeChat, currentChat }) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat]);

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className=" fixed z-10 top-[9vh] md:w-[calc(100%-18rem)] w-full items-center justify-between px-4 py-3 bg-bg border-b border-border-secondary shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <h2 className="font-semibold text-text-primary">{activeChat}</h2>
        </div>
      </div>

      {/* Chat Background */}
      <div
        className="flex-1 overflow-y-auto p-4 bg-bg-dark relative"
        // style={{
        //   backgroundImage:
        //     "url('https://i.ibb.co/h7QJctN/chat-bg-pattern.png')", // WhatsApp-style pattern
        //   backgroundRepeat: "repeat",
        //   backgroundSize: "contain",
        // }}
      >
        {/* Messages */}
        <div className="space-y-3 pt-[8vh]">
          {currentChat?.messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.sender === "You" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-2xl max-w-[75%] text-sm shadow-sm break-words ${
                  msg.sender === "You"
                    ? "bg-brand-red text-white rounded-br-none"
                    : "bg-text-primary text-bg border border-text-primary rounded-bl-none"
                }`}
              >
                {msg.text}
                {msg.time && (
                  <span className="block text-[10px] text-text-secondary/60 mt-1 text-right">
                    {msg.time}
                  </span>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="fixed bottom-0 w-full md:w-[calc(100%-18rem)] flex items-center gap-2 p-4 bg-bg border-t border-gray-200">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 rounded-full border border-border-secondary focus:outline-none focus:ring-1 focus:ring-brand-red text-sm"
        />
        <button className="bg-brand-red text-white p-2 rounded-full hover:bg-red-600 transition">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default Messages;
