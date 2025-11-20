'use client'

import React from 'react'

interface LinkifyProps {
  text: string
  className?: string
}

export default function Linkify({ text, className = '' }: LinkifyProps) {
  // Regular expression to detect URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g

  // Split text by URLs
  const parts = text.split(urlRegex)

  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Check if this part is a URL
        if (part.match(urlRegex)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          )
        }
        return <span key={index}>{part}</span>
      })}
    </span>
  )
}
