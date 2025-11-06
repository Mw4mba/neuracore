"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface Challenge {
  id: string;
  title: string;
  prize: string;
  deadline: string;
  max_participants: number;
  category: string;
  description: string;
  objectives: string;
  judging_criteria: string;
  requirements: string;
  created_at: string;
}

interface Participant {
  user_id: string;
  joined_at: string;
  profiles: {
    id: string;
    full_name: string | null;
    username: string;
    avatar_url: string | null;
  };
}

const MyCreatedChallenges: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(
    null
  );
  const [participantsLoading, setParticipantsLoading] = useState(false);

  useEffect(() => {
    const fetchCreatedChallenges = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/challenges/recruiter-challenges");
        if (!res.ok) throw new Error("Failed to fetch challenges");
        const data = await res.json();

        const mappedChallenges: Challenge[] = data.map((c: any) => ({
          id: c.id,
          title: c.title,
          prize: c.prize,
          deadline: new Date(c.deadline).toLocaleDateString("en-ZA", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          max_participants: c.max_participants ?? 0,
          category: c.category ?? "Uncategorized",
          description: c.description ?? "",
          objectives: c.objectives ?? "",
          judging_criteria: c.judging_criteria ?? "",
          requirements: c.requirements ?? "",
          created_at: c.created_at,
        }));

        setChallenges(mappedChallenges);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCreatedChallenges();
  }, []);

  const openParticipantsModal = async (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setModalOpen(true);
    setParticipantsLoading(true);

    try {
      const res = await fetch(
        `/api/challenges/participants?challenge_id=${challenge.id}`
      );
      if (!res.ok) throw new Error("Failed to fetch participants");
      const data: Participant[] = await res.json();
      setParticipants(data);
    } catch (err) {
      console.error(err);
      setParticipants([]);
    } finally {
      setParticipantsLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setParticipants([]);
    setSelectedChallenge(null);
  };
  // Helper function to get initials
    const getInitials = (name: string | null, username: string) => {
    if (name) {
        const parts = name.split(" ");
        return parts
        .map((p) => p[0].toUpperCase())
        .slice(0, 2)
        .join("");
    }
    return username.slice(0, 2).toUpperCase();
    };


  if (loading)
    return <p className="text-text-secondary">Loading your challenges...</p>;

  return (
    <div className="bg-bg-dark border border-border-secondary mb-8 rounded-xl backdrop-blur-md p-6">
      <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-6">
        My Created Challenges
      </h2>

      {challenges.length === 0 ? (
        <p className="text-text-secondary">
          You have not created any challenges yet.
        </p>
      ) : (
        <div className="space-y-6">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              className="bg-[var(--color-bg-gray)]/70 border border-border-secondary rounded-xl p-5 shadow-md hover:shadow-lg transition-all"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
                  {challenge.title}
                </h3>
                <button
                  onClick={() => openParticipantsModal(challenge)}
                  className="mt-3 sm:mt-0 sm:ml-4 px-4 py-2 rounded-md bg-btn-primary text-white font-medium hover:bg-btn-primary-hover transition-all"
                >
                  Show Participants
                </button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-3 text-sm text-[var(--color-text-secondary)] mb-4">
                <span className="px-2 py-1 bg-bg-dark rounded-md border border-border-secondary">
                  Prize: {challenge.prize}
                </span>
                <span className="px-2 py-1 bg-bg-dark rounded-md border border-border-secondary">
                  Deadline: {challenge.deadline}
                </span>
                <span className="px-2 py-1 bg-bg-dark rounded-md border border-border-secondary">
                  Max Participants: {challenge.max_participants}
                </span>
                <span className="px-2 py-1 bg-bg-dark rounded-md border border-border-secondary">
                  Category: {challenge.category}
                </span>
              </div>

              {/* Divider */}
              <hr className="border-border-secondary mb-4" />

              {/* Details */}
              <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                <p>
                  <strong>Description:</strong> {challenge.description}
                </p>
                <p>
                  <strong>Objectives:</strong> {challenge.objectives}
                </p>
                <p>
                  <strong>Judging Criteria:</strong> {challenge.judging_criteria}
                </p>
                <p>
                  <strong>Requirements:</strong> {challenge.requirements}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Participants Modal */}
      {modalOpen &&
        createPortal(
          <div className="fixed px-3 inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div
              className="absolute inset-0 w-full h-full"
              onClick={closeModal}
            />
            <div className="relative z-10 bg-[var(--color-bg-dark)] border border-border-secondary rounded-xl p-6 w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[80vh]">
              <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
                Participants for "{selectedChallenge?.title}"
              </h3>

              {participantsLoading ? (
                <p className="text-text-secondary">Loading participants...</p>
              ) : participants.length === 0 ? (
                <p className="text-text-secondary">No participants yet.</p>
              ) : (
                <ul className="space-y-3">
                  {participants.map((p) => (
                    <li
                      key={p.user_id}
                      className="flex items-center gap-3 border-b border-border-secondary pb-2"
                    >
                    <div className="w-10 bg-btn-secondary text-white items-center justify-center flex rounded-full h-10 relative">
                      {p.profiles.avatar_url ? (
                        <Image
                        src={p.profiles.avatar_url}
                        alt={p.profiles.username}
                        fill
                        className="object-cover"
                        />
                    ) : (
                        <span>{getInitials(p.profiles.full_name, p.profiles.username)}</span>
                    )}
                      </div>
                      <div className="flex-1">
                        <p className="text-text-primary font-medium">
                          {p.profiles.full_name ||p.profiles.username}
                        </p>
                        <p className="text-[var(--color-text-secondary)] text-xs">
                          Joined:{" "}
                          {new Date(p.joined_at).toLocaleDateString("en-ZA", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex justify-end mt-4">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 rounded-md bg-text-primary text-bg font-medium hover:bg-bg hover:text-text-primary transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default MyCreatedChallenges;
