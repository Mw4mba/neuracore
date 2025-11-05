import React from "react";
import {
  Lightbulb,
  ClipboardList,
  Scale,
  CheckCircle2,
  Rocket,
  Users,
} from "lucide-react";

interface ChallengeContentProps {
  activeTab: string;
  challenge: {
    description?: string;
    objectives?: string;
    requirements?: string;
    judging_criteria?: string;
    deadline?: string;
    submissions?: {
      user?: {
        id?: string;
        full_name?: string;
        username?: string;
        avatar_url?: string;
      };
      description?: string;
      submitted_at?: string;
    }[];
  };
}

const ChallengeContent: React.FC<ChallengeContentProps> = ({
  activeTab,
  challenge,
}) => {
  const renderContent = () => {
    switch (activeTab) {
      case "Overview":
        return (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary tracking-wider leading-relaxed whitespace-pre-line">
              {challenge?.description || "No description available."}
            </p>

            {challenge?.objectives && (
              <>
                <h3 className="text-sm font-semibold text-text-primary mt-6 mb-2">
                  Objectives
                </h3>
                <ul className="pl-4 list-disc text-text-secondary text-sm space-y-1 whitespace-pre-line">
                  {challenge.objectives
                    .split("\n")
                    .filter((line) => line.trim() !== "")
                    .map((line, i) => (
                      <li key={i}>{line.trim()}</li>
                    ))}
                </ul>
              </>
            )}
          </div>
        );

      case "Requirements":
        return (
          <div className="space-y-4">
            {challenge?.requirements ? (
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {challenge.requirements}
              </p>
            ) : (
              <p className="text-sm text-text-secondary">No requirements listed.</p>
            )}
          </div>
        );

      case "Judging Criteria":
        return (
          <div className="space-y-4">
            {challenge?.judging_criteria ? (
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {challenge.judging_criteria}
              </p>
            ) : (
              <p className="text-sm text-text-secondary">
                Judging criteria will be announced soon.
              </p>
            )}
          </div>
        );

      case "Submissions":
        return (
          <div className="space-y-4">
            {challenge?.submissions && challenge.submissions.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {challenge.submissions.map((submission, i) => (
                  <div
                    key={i}
                    className="border border-border-secondary bg-bg-light/10 rounded-lg p-4 flex gap-3 items-center hover:border-border-primary transition"
                  >
                    {submission.user?.avatar_url ? (
                      <img
                        src={submission.user.avatar_url}
                        alt={submission.user.full_name || submission.user.username || "User"}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-semibold">
                        {submission.user?.full_name?.charAt(0) ||
                          submission.user?.username?.charAt(0) ||
                          "?"}
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-text-primary text-sm">
                        {submission.user?.full_name ||
                          submission.user?.username ||
                          "Unknown User"}
                      </h4>
                      <p className="text-xs text-text-secondary">
                        Submitted on{" "}
                        {submission.submitted_at
                          ? new Date(submission.submitted_at).toLocaleDateString("en-ZA", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-secondary">No participants have submitted yet.</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-bg-dark border my-6 rounded-lg p-6 border-border-secondary transition-all duration-300">
      <h1 className="text-text-primary font-bold mb-6 tracking-wide text-lg border-b border-border-secondary pb-2">
        {activeTab}
      </h1>
      {renderContent()}
    </div>
  );
};

export default ChallengeContent;