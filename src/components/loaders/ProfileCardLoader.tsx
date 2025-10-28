import React from 'react'

const ProfileCardLoader = () => {
  return (
    <div className="rounded border border-border-secondary bg-bg-dark p-6 text-center animate-pulse">
        <div className="h-32 w-32 rounded-full border-4 border-[var(--primary)]/20 mx-auto mb-4 bg-gray-700" />
        <div className="h-6 w-32 mx-auto mb-2 bg-gray-600 rounded" />
        <div className="h-4 w-24 mx-auto mb-4 bg-gray-600 rounded" />
        <div className="h-12 w-full mx-auto mb-4 bg-gray-600 rounded" />
        <div className="space-y-2 text-sm mb-6">
          <div className="h-4 w-24 mx-auto bg-gray-700 rounded" />
          <div className="h-4 w-32 mx-auto bg-gray-700 rounded" />
          <div className="h-4 w-28 mx-auto bg-gray-700 rounded" />
        </div>
        <div className="h-10 w-full bg-brand-red rounded mx-auto" />
      </div>
  )
}

export default ProfileCardLoader