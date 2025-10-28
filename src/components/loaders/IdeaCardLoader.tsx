import React from 'react'

const IdeaCardLoader = () => {
  return (
    <div className="rounded-lg border border-border-secondary bg-bg-dark overflow-hidden animate-pulse">
            <div className="bg-gray-700 h-40 sm:h-44 w-full" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-600 rounded w-1/3" />
              <div className="h-3 bg-gray-600 rounded w-1/2" />
              <div className="h-3 bg-gray-500 rounded w-2/3" />
              <div className="flex justify-between mt-2">
                <div className="h-3 bg-gray-600 rounded w-1/4" />
                <div className="h-3 bg-gray-600 rounded w-1/6" />
              </div>
            </div>
          </div>
  )
}

export default IdeaCardLoader