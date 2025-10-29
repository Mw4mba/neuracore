import React from "react";

interface TabsProps {
  activeTab: "top3" | "all" | "myrank";
  setActiveTab: (tab: "top3" | "all" | "myrank") => void;
}

const LeaderboardTabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { key: "top3", label: "Top 3" },
    { key: "all", label: "All" },
    { key: "myrank", label: "My Rank" },
  ];

  return (
    <div className="flex bg-bg-dark border-1 py-2 px-3 justify-between rounded-lg border-border-secondary gap-4 mb-8">
      {tabs.map((item) => (
        <button
          key={item.key}
          className={`px-4 w-full cursor-pointer py-2 rounded-md font-medium duration-300 transition-colors ${
            activeTab === item.key
              ? "bg-bg text-[var(--color-primary)]"
              : "bg-bg-gray text-[var(--color-text-secondary)] hover:bg-bg-dark"
          }`}
          onClick={() => setActiveTab(item.key as "top3" | "all" | "myrank")}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default LeaderboardTabs;
