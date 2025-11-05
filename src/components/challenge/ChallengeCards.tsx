import React from "react";
import { Calendar, CheckCircle, DollarSign, Users } from "lucide-react";
import StatCard from "../challenge/StatCard";

interface ChallengeCardsProps {
  challenge: {
    prize?: string | number;
    deadline?: string;
    category?: string;
    max_participants?: number;
  };
}

const ChallengeCards: React.FC<ChallengeCardsProps> = ({ challenge }) => {
  const stats = [
    {
      icon: <DollarSign size={12} />,
      label: "Prize",
      value: challenge?.prize ? `${challenge.prize}` : "N/A",
    },
    {
      icon: <Calendar size={12} />,
      label: "Deadline",
      value: challenge?.deadline
        ? new Date(challenge.deadline).toLocaleDateString("en-ZA", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "No deadline",
    },
    {
      icon: <Users size={12} />,
      label: "Participants",
      value: challenge?.max_participants || "0"
    },
    {
      icon: <CheckCircle size={12} />,
      label: "Category",
      value: challenge?.category || "Uncategorized",
    },
  ];

  return (
    <div className="flex flex-wrap gap-4 mt-4">
      {stats.map((stat, i) => (
        <StatCard key={i} {...stat} />
      ))}
    </div>
  );
};

export default ChallengeCards;