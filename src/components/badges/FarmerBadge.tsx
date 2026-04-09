import React from 'react'
import { Home, Leaf, Star } from 'lucide-react'
import { UserType } from '@/lib/database'
import { House, Plant, ShoppingCart, Sparkle, Tractor } from '@phosphor-icons/react'

interface FarmerBadgeProps {
  userType: UserType
  verified?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const badgeConfig = {
  consumer: {
    icon: ShoppingCart,
    label: 'Food Lover',
    bgColor: '#E3F2FD',
    iconColor: '#1976D2',
    iconName: 'ShoppingCart'
  },
  backyard_grower: {
    icon: Home,
    label: 'Backyard Grower',
    bgColor: '#E8F5E9',
    iconColor: '#2E7D32',
    iconName: 'House'
  },
  market_gardener: {
    icon: Leaf,
    label: 'Market Gardener',
    bgColor: '#FFF3E0',
    iconColor: '#F57C00',
    iconName: 'Plant'
  },
  production_farmer: {
    icon: Tractor,
    label: 'Production Farm',
    bgColor: '#E3F2FD',
    iconColor: '#1565C0',
    iconName: 'Tractor'
  }
}

export default function FarmerBadge({ 
  userType, 
  verified = false, 
  size = 'md',
  showLabel = true,
  className = ''
}: FarmerBadgeProps) {
  const config = badgeConfig[userType]
  const Icon = config.icon

  const sizeClasses = {
    xs: {
      container: 'px-1.5 py-0.5',
      icon: 'h-2.5 w-2.5',
      text: 'text-xs',
      star: 'h-2.5 w-2.5'
    },
    sm: {
      container: 'px-2 py-1',
      icon: 'h-3 w-3',
      text: 'text-xs',
      star: 'h-3 w-3'
    },
    md: {
      container: 'px-3 py-1.5',
      icon: 'h-4 w-4',
      text: 'text-sm',
      star: 'h-4 w-4'
    },
    lg: {
      container: 'px-4 py-2',
      icon: 'h-5 w-5',
      text: 'text-base',
      star: 'h-5 w-5'
    }
  }

  const sizes = sizeClasses[size]

  return (
    <div 
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizes.container} ${className}`}
      style={{ backgroundColor: config.bgColor }}
    >
      <Icon 
        className={sizes.icon}
        style={{ color: config.iconColor }}
      />
      {showLabel && (
        <span 
          className={`${sizes.text} font-medium`}
          style={{ color: config.iconColor }}
        >
          {config.label}
        </span>
      )}
      {verified && (
        <Star 
          className={`${sizes.star} fill-current`}
          style={{ color: '#FFB300' }}
        />
      )}
    </div>
  )
}

// Compact version for inline use
export function FarmerBadgeCompact({ userType, verified = false }: { userType: UserType; verified?: boolean }) {
  const config = badgeConfig[userType]
  
  return (
    <span className="inline-flex items-center gap-1">
      <span className="text-base">{config.iconName && <PhosphorIcon name={config.iconName} size={16} />}</span>
      {verified && <Sparkle size={24} weight="regular" />}
    </span>
  )
}