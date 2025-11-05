// src/components/NotificationItem.tsx
import React from "react";
import Link from "next/link";

interface NotificationItemProps {
  icon: string; // Emoji for the icon
  text: React.ReactNode; // Can pass text with bold parts
  time: string;
  isUnread: boolean;
  href?: string; // optional link target
  onClick?: (e?: any) => void; // optional click handler (e.g., mark read)
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  icon,
  text,
  time,
  isUnread,
  href,
  onClick,
}) => {
  const content = (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-2 md:p-4 border-b border-border-secondary w-full">
      <span className="text-lg flex-shrink-0">{icon}</span>
      <div className="flex-grow min-w-0">
        <p className="text-sm text-text-primary break-words">{text}</p>
        <p className="text-xs text-text-secondary mt-1">{time}</p>
      </div>
      {isUnread && (
        <div className="w-2 h-2 bg-brand-red rounded-full flex-shrink-0 mt-1 sm:mt-0"></div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className="block hover:bg-border-secondary rounded-md">
        {content}
      </Link>
    );
  }

  return content;
};

export default NotificationItem;
