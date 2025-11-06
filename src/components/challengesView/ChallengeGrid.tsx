"use client";

import React from "react";
import ChallengeCard from "./ChallengeCard";

interface Challenge {
  id: string;
  company: string;
  difficulty: string;
  title: string;
  description: string;
  prize: string;
  deadline: string;
  max_participants: number;
  tags: string[];
}

interface ChallengeGridProps {
  filteredChallenges: Challenge[];
  getDifficultyColor: (difficulty: string) => string;
}

const ChallengeGrid: React.FC<ChallengeGridProps> = ({ filteredChallenges, getDifficultyColor }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {filteredChallenges.map((challenge) => (
        <ChallengeCard
          key={challenge.id}
          challenge={challenge}
          getDifficultyColor={getDifficultyColor}
        />
      ))}
    </div>
  );
};

export default ChallengeGrid;
