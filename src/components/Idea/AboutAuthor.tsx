import Image from "next/image";
import Link from "next/link";
import React from "react";

interface AuthorProps {
  id: string;
  name: string;
  initials: string;
  role: string;
  bio: string;
  avatar_url?: string;
  accountType: "Innovator" | "Recruiter" | "Admin";
}

const AboutAuthor: React.FC<AuthorProps> = ({
  id,
  name,
  initials,
  role,
  bio,
  avatar_url,
  accountType,
}) => {
  return (
    <div className="w-full md:w-[80%] flex flex-col px-3 my-6 md:my-8 rounded-lg py-4 bg-bg-dark border border-border-secondary">
      <h1 className="text-lg pl-4 mb-4 md:mb-6 font-semibold text-text-primary">
        About the Author
      </h1>

      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Avatar */}
        <Link
          href={`/profile/${id}`}
          className="flex-shrink-0 cursor-pointer flex justify-center sm:justify-start"
        >
          {avatar_url ? (
            <div className="relative h-10 w-10 md:h-12 md:w-12 rounded-full overflow-hidden">
              <Image
                src={avatar_url}
                alt={initials}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="bg-btn-secondary-hover h-10 w-10 md:h-12 md:w-12 flex items-center justify-center rounded-full">
              <p className="text-[9px] md:text-[10px] text-white font-semibold">
                {initials}
              </p>
            </div>
          )}
        </Link>


        {/* Author Info */}
        <div className="flex-1 px-2 sm:px-4">
          <Link href={`/profile/${id}`} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <h1 className="text-text-primary font-semibold">{name}</h1>
            <p className="text-text-secondary text-sm font-semibold"></p>
          </Link>
          <p className="text-xs text-btn-secondary-hover mb-1 font-semibold">
            {role}
          </p>
          <p className="text-sm text-text-secondary my-2">{bio}</p>

          <div className="flex mt-4">
            <button className="flex items-center w-full   gap-1 justify-center border border-border-secondary hover:bg-btn-secondary-hover text-text-primary hover:text-white py-2 px-4 rounded-lg cursor-pointer transition-colors duration-300 text-[12px]">
              Follow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutAuthor;
