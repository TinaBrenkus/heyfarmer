import React from 'react'
import Image from 'next/image'

interface FarmLogoProps {
  /** Width in pixels — height auto-calculated from 2.37:1 aspect ratio */
  size?: number
  className?: string
}

const ASPECT_RATIO = 5554 / 2345 // ~2.37:1 (width:height)

const FarmLogo: React.FC<FarmLogoProps> = ({ size = 120, className = "" }) => {
  const width = size
  const height = Math.round(size / ASPECT_RATIO)

  return (
    <Image
      src="/images/heyfarmer-logo.png"
      alt="Hey Farmer"
      width={width}
      height={height}
      className={className}
      style={{ objectFit: 'contain' }}
      priority
    />
  )
}

export default FarmLogo
