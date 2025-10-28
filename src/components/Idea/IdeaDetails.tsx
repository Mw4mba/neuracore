import React from "react";

type IdeaDetailsProps = {
  description: string;
};

const IdeaDetails: React.FC<IdeaDetailsProps> = ({ description }) => {
  return (
    <div className="bg-bg-dark border my-4 rounded p-6 border-border-secondary">
      <h1 className="text-text-primary font-bold my-4 tracking-wider text-lg">
        Detailed Description
      </h1>

      <div
        className="text-xs prose editor md:text-sm text-text-secondary [&>p]:mb-4 [&>p:last-child]:mb-0 tracking-wider"
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </div>
  );
};

export default IdeaDetails;
