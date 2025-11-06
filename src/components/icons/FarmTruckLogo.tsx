interface FarmTruckLogoProps {
  className?: string
  size?: number
}

export default function FarmTruckLogo({ className = "", size = 30 }: FarmTruckLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Truck body/cab */}
      <path
        d="M6 18 L6 12 Q6 10 8 10 L16 10 Q18 10 18 12 L18 18"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="currentColor"
        opacity="0.8"
      />
      
      {/* Truck hood */}
      <rect x="2" y="14" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.8" />
      
      {/* Front grill */}
      <rect x="1.5" y="15" width="1" height="2" fill="currentColor" opacity="0.6" />
      
      {/* Windshield */}
      <rect x="7" y="11" width="8" height="3" rx="0.5" fill="currentColor" opacity="0.3" />
      
      {/* Truck bed */}
      <rect x="18" y="12" width="16" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
      
      {/* Wooden bed slats */}
      <line x1="20" y1="12" x2="20" y2="20" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
      <line x1="24" y1="12" x2="24" y2="20" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
      <line x1="28" y1="12" x2="28" y2="20" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
      <line x1="32" y1="12" x2="32" y2="20" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
      
      {/* Vegetables in truck bed */}
      <circle cx="21" cy="10" r="1.5" fill="currentColor" opacity="0.7" />
      <circle cx="25" cy="9" r="1.5" fill="currentColor" opacity="0.6" />
      <circle cx="29" cy="10.5" r="1.5" fill="currentColor" opacity="0.8" />
      <circle cx="33" cy="9.5" r="1.5" fill="currentColor" opacity="0.7" />
      
      {/* More vegetables */}
      <circle cx="23" cy="8" r="1" fill="currentColor" opacity="0.5" />
      <circle cx="27" cy="8.5" r="1" fill="currentColor" opacity="0.6" />
      <circle cx="31" cy="8" r="1" fill="currentColor" opacity="0.5" />
      
      {/* Front wheel */}
      <circle cx="8" cy="22" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="8" cy="22" r="1.5" fill="currentColor" />
      
      {/* Rear wheel */}
      <circle cx="28" cy="22" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="28" cy="22" r="1.5" fill="currentColor" />
      
      {/* Front bumper */}
      <rect x="0.5" y="16" width="1.5" height="2" rx="0.5" fill="currentColor" opacity="0.6" />
      
      {/* Headlight */}
      <circle cx="2.5" cy="15.5" r="0.8" fill="currentColor" opacity="0.4" />
      
      {/* Ground line */}
      <line x1="0" y1="28" x2="40" y2="28" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    </svg>
  )
}