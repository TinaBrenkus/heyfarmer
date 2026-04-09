import React from 'react'
import Image from 'next/image'

interface TomatoMarkProps {
  size?: number
  className?: string
}

const TomatoMark: React.FC<TomatoMarkProps> = ({ size = 24, className = "" }) => {
  return (
    <Image
      src="/images/favicon-tomato.png"
      alt="Hey Farmer"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain' }}
    />
  )
}

export default TomatoMark
