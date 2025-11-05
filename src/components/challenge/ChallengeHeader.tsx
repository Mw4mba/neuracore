import { ArrowLeft, Building } from "lucide-react";
import Link from "next/link";
import React from "react";

type ChallengeHeaderProps = {
  tags: string[];
  title: string;
  name: string;
  link: string;
};

const ChallengeHeader: React.FC<ChallengeHeaderProps> = ({
  tags,
  title,
  name,
  link,
}) => {
  return (
    <>
      <Link
        href={link}
        className="flex justify-start gap-2 py-4 text-text-secondary hover:text-text-primary items-center cursor-pointer"
      >
        <ArrowLeft size={16} />
        <p className="font-medium text-xs md:text-sm">Back to Challenges</p>
      </Link>
      <div className="flex my-4 gap-2">
        {tags.map((cat, i) => (
          <div
            key={i}
            className="bg-border-secondary px-2 py-1 rounded text-white"
          >
            <p className="text-[10px] font-semibold">{cat}</p>
          </div>
        ))}
      </div>
      <h1 className="text-text-primary text-3xl md:text-4xl mb-4 font-semibold">
        {title}
      </h1>
      <p className="text-text-secondary tracking-wider mb-3 text-sm w-full md:w-2/3">
        <Building size={14} className="inline mr-2 text-brand-red mb-1" />
        {name}
      </p>
    </>
  );
};

export default ChallengeHeader;
