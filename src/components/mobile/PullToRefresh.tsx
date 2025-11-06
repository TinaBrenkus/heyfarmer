'use client'

import { useState, useRef, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'

interface PullToRefreshProps {
  children: React.ReactNode
  onRefresh: () => Promise<void>
  threshold?: number
  className?: string
}

export default function PullToRefresh({ 
  children, 
  onRefresh, 
  threshold = 80,
  className = '' 
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [startY, setStartY] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      setStartY(e.touches[0].clientY)
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (startY === 0 || containerRef.current?.scrollTop !== 0) return

    const currentY = e.touches[0].clientY
    const distance = currentY - startY

    if (distance > 0 && distance <= threshold * 2) {
      setPullDistance(distance)
      e.preventDefault()
    }
  }, [startY, threshold])

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } catch (error) {
        console.error('Refresh failed:', error)
      } finally {
        setIsRefreshing(false)
      }
    }
    setPullDistance(0)
    setStartY(0)
  }, [pullDistance, threshold, isRefreshing, onRefresh])

  const refreshProgress = Math.min(pullDistance / threshold, 1)
  const shouldShowRefresh = pullDistance > 20

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateY(${Math.min(pullDistance * 0.5, 40)}px)`,
        transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none'
      }}
    >
      {/* Pull to Refresh Indicator */}
      {shouldShowRefresh && (
        <div 
          className="absolute top-0 left-0 right-0 flex items-center justify-center bg-white z-10"
          style={{
            height: `${Math.min(pullDistance, 60)}px`,
            transform: 'translateY(-100%)',
            opacity: refreshProgress
          }}
        >
          <div className="flex items-center gap-2 text-green-600">
            <RefreshCw 
              size={20} 
              className={`${isRefreshing ? 'animate-spin' : ''}`}
              style={{
                transform: `rotate(${refreshProgress * 360}deg)`
              }}
            />
            <span className="text-sm font-medium">
              {isRefreshing ? 'Refreshing...' : pullDistance >= threshold ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </div>
        </div>
      )}
      
      {children}
    </div>
  )
}