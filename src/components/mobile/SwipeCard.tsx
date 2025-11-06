'use client'

import { useState, useRef, useEffect } from 'react'

interface SwipeCardProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  className?: string
  threshold?: number
}

export default function SwipeCard({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  className = '',
  threshold = 100 
}: SwipeCardProps) {
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX)
    setIsSwiping(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return
    setCurrentX(e.touches[0].clientX)
    
    if (cardRef.current) {
      const deltaX = e.touches[0].clientX - startX
      cardRef.current.style.transform = `translateX(${deltaX}px)`
      cardRef.current.style.opacity = String(1 - Math.abs(deltaX) / 300)
    }
  }

  const handleTouchEnd = () => {
    if (!isSwiping) return
    setIsSwiping(false)
    
    const deltaX = currentX - startX
    
    if (cardRef.current) {
      cardRef.current.style.transform = 'translateX(0)'
      cardRef.current.style.opacity = '1'
    }
    
    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight()
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft()
      }
    }
    
    setCurrentX(0)
    setStartX(0)
  }

  return (
    <div
      ref={cardRef}
      className={`swipe-card ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  )
}