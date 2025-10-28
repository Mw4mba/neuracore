import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type IdeaHeaderProps = {
  coverImageUrl?: string;
  categories: string[];
  title: string;
  description: string;
  link: string;
};

const IdeaHeader: React.FC<IdeaHeaderProps> = ({
  coverImageUrl = "Cover Image",
  categories,
  title,
  description,
  link,
}) => {
  return (
    <>
      <Link
        href={link}
        className="flex justify-start gap-2 py-4 text-text-secondary hover:text-text-primary items-center cursor-pointer"
      >
        <ArrowLeft size={16} />
        <p className="font-semibold text-sm">Back to Ideas</p>
      </Link>
      <div className="w-full relative h-42 md:h-92 flex justify-center items-center rounded-lg">
        {coverImageUrl ? (
        <Image
          src={coverImageUrl}
          fill
          className="object-cover"
          alt="cover-img"
        />
      ) : (
        <Image
          src="/placeholder.svg"
          fill
          className="object-cover"
          alt="cover-img"
        />
      )}
      </div>
      <div className="flex my-4 gap-2">
        {categories.map((cat, i) => (
          <div
            key={i}
            className="bg-border-secondary px-2 py-1 rounded text-text-primary"
          >
            <p className="text-[10px] font-semibold">{cat}</p>
          </div>
        ))}
      </div>
      <h1 className="text-text-primary text-3xl md:text-4xl mb-4 font-semibold">
        {title}
      </h1>
      <p className="text-text-secondary tracking-wider mb-3 text-sm w-full md:w-2/3">
        {description}
      </p>
    </>
  );
};

export default IdeaHeader;
