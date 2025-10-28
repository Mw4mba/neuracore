import React from 'react'

const AboutAuthorLoader = () => {
  return (
    <div className="mt-8 bg-bg-dark border border-border-secondary rounded-lg p-6 w-full animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-600" />
            <div className="flex flex-col gap-2 flex-1">
              <div className="w-1/3 h-4 bg-gray-600 rounded" />
              <div className="w-1/4 h-3 bg-gray-500 rounded" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="w-full h-3 bg-gray-600 rounded" />
            <div className="w-5/6 h-3 bg-gray-600 rounded" />
            <div className="w-2/3 h-3 bg-gray-500 rounded" />
          </div>
        </div>
  )
}

export default AboutAuthorLoader