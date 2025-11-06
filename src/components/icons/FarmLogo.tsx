import React from 'react'

interface FarmLogoProps {
  size?: number
  className?: string
}

const FarmLogo: React.FC<FarmLogoProps> = ({ size = 24, className = "" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Simple hand-drawn style farm truck */}
      
      {/* Truck cab - slightly wonky for hand-drawn feel */}
      <path
        d="M8 24 C8 20, 9 18, 12 18 L18 18 C20 18, 21 19, 21 22 L21 28"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Windshield */}
      <path
        d="M10 20 L17 20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      
      {/* Truck bed with wooden slats */}
      <path
        d="M21 20 L36 20 C37 20, 38 21, 38 22 L38 28 L21 28"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Wooden slats in bed */}
      <line x1="24" y1="20" x2="24" y2="28" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <line x1="28" y1="20" x2="28" y2="28" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <line x1="32" y1="20" x2="32" y2="28" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <line x1="35" y1="20" x2="35" y2="28" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      
      {/* Produce in truck bed - hand-drawn circles */}
      <circle cx="25" cy="17" r="2.5" fill="currentColor" opacity="0.7" />
      <circle cx="30" cy="16" r="3" fill="currentColor" opacity="0.6" />
      <circle cx="34" cy="17.5" r="2" fill="currentColor" opacity="0.7" />
      <circle cx="27" cy="14" r="2" fill="currentColor" opacity="0.5" />
      <circle cx="32" cy="13" r="2.5" fill="currentColor" opacity="0.6" />
      
      {/* Front wheel */}
      <circle
        cx="12"
        cy="32"
        r="4"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <circle cx="12" cy="32" r="1.5" fill="currentColor" />
      
      {/* Back wheel */}
      <circle
        cx="32"
        cy="32"
        r="4"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <circle cx="32" cy="32" r="1.5" fill="currentColor" />
      
      {/* Ground line - slightly wavy for organic feel */}
      <path
        d="M2 38 Q10 37, 20 38 T38 37 Q42 37, 46 38"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.3"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default FarmLogo