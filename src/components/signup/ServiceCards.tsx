import { CheckCircle, LockIcon, SearchIcon } from "lucide-react";
import React from "react";

const ServiceCards = () => {
  const cards = [
    {
      icon: <CheckCircle size={20} className="ml-3 text-brand-red" />,
      title: "Evaluation & Scoring",
      subtitle: "Assessment Excellence",
      description: `Structured criteria and
                  advanced scoring methods to
                  assess idea feasibility, cost
                  impact, and strategic
                  alignment with precision.`,
      gradient: "bg-gradient-to-br from-[#1E1E1E] to-[#252525]",
    },
    {
      icon: <LockIcon size={20} className="ml-3 text-brand-red" />,
      title: "Motivation & Recognition",
      subtitle: "Engagement Engine",
      description: `Rewards system with points,
                  badges, and leaderboards
                  that encourage participation
                  and recognize top
                  contributors.`,
      gradient: "bg-gradient-to-br from-[#1E1E1E] to-[#252525]",
    },
    {
      icon: <SearchIcon size={20} className="ml-3 text-brand-red" />,
      title: "Search & Filter",
      subtitle: "Discovery Made Easy",
      description: `Advanced search capabilities
                  to find specific ideas, themes,
                  and submissions with
                  intelligent filtering by category
                  and status.`,
      gradient: "bg-gradient-to-br from-[#1E1E1E] to-[#252525]",
    },
  ];

  return (
    <div className="flex-2 flex py-14  bg-bg-dark w-full">
      <div className="flex text-white px-3 w-full flex-col items-center justify-center gap-6">
        <div className="flex flex-col justify-center items-center">
          <h1 className="font-bold pt-8 md:pt-1 text-xl md:text-2xl text-center ">
            Powerful Innovation Tools
          </h1>
          <p className="mb-10 text-sm mt-16 md:mt-3 text-text-secondary w-full max-w-md text-center">
            Our comprehensive platform provides everything you need to transform
            ideas into impactful solutions
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-6 tracking-wide">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`${card.gradient} flex flex-col border-2 pt-8 px-6 pb-12 rounded-lg border-neutral-600/55 flex-1 min-w-[220px] max-w-sm 
                            transition-all duration-300 hover:scale-102 hover:border-brand-red`}
            >
              {card.icon}
              <h1 className="mt-8 font-semibold text-sm">{card.title}</h1>
              <p className="font-semibold my-2 text-brand-red text-xs">
                {card.subtitle}
              </p>
              <p className="text-xs mt-2 text-text-secondary whitespace-pre-line">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceCards;
