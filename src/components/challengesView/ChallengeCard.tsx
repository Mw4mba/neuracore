"use client";

import React from "react";
import Link from "next/link";

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

interface ChallengeCardProps {
  challenge: Challenge;
  getDifficultyColor: (difficulty: string) => string;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, getDifficultyColor }) => {
  return (
    <Link key={challenge.id} href={`/challenges/${challenge.id}`} className="block group">
      <div className="bg-bg-dark border border-border-secondary rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-3">
            <div className="text-brand-red font-semibold text-sm">{challenge.company}</div>
            <span
              className={`text-xs font-medium border rounded-full px-2 py-0.5 ${getDifficultyColor(
                challenge.difficulty
              )}`}
            >
              {challenge.difficulty}
            </span>
          </div>

          <h3 className="text-lg font-bold mb-2 group-hover:text-brand-red transition">
            {challenge.title}
          </h3>
          <p className="text-text-secondary text-sm line-clamp-2 mb-4">
            {challenge.description}
          </p>
        </div>

        <div className="mt-4 text-text-secondary space-y-2 text-sm">
          <div className="flex justify-between">
            <span>💰 Prize:</span>
            <span className="font-medium">{challenge.prize}</span>
          </div>
          <div className="flex text-text-secondary justify-between">
            <span>📅 Deadline:</span>
            <span>{new Date(challenge.deadline).toLocaleDateString()}</span>
          </div>
          <div className="flex text-text-secondary justify-between">
            <span>👥 Participants:</span>
            <span>{challenge.max_participants}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {challenge.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-bg-gray border border-border-secondary rounded-full px-2 py-1 text-text-secondary"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
};

export default ChallengeCard;
