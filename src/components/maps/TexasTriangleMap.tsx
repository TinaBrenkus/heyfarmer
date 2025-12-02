'use client'

import { useState } from 'react'
import Link from 'next/link'

interface County {
  id: string
  name: string
  metro: string
  // Approximate center coordinates for positioning (relative to SVG viewbox)
  x: number
  y: number
}

// Texas Triangle counties with approximate positions
const counties: County[] = [
  // Dallas-Fort Worth Metro (top-right area)
  { id: 'dallas', name: 'Dallas', metro: 'Dallas-Fort Worth', x: 72, y: 18 },
  { id: 'tarrant', name: 'Tarrant', metro: 'Dallas-Fort Worth', x: 62, y: 20 },
  { id: 'denton', name: 'Denton', metro: 'Dallas-Fort Worth', x: 68, y: 10 },
  { id: 'collin', name: 'Collin', metro: 'Dallas-Fort Worth', x: 78, y: 10 },
  { id: 'rockwall', name: 'Rockwall', metro: 'Dallas-Fort Worth', x: 82, y: 18 },
  { id: 'kaufman', name: 'Kaufman', metro: 'Dallas-Fort Worth', x: 82, y: 26 },
  { id: 'wise', name: 'Wise', metro: 'Dallas-Fort Worth', x: 56, y: 10 },
  { id: 'parker', name: 'Parker', metro: 'Dallas-Fort Worth', x: 52, y: 20 },
  { id: 'jack', name: 'Jack', metro: 'Dallas-Fort Worth', x: 46, y: 10 },
  { id: 'grayson', name: 'Grayson', metro: 'Dallas-Fort Worth', x: 72, y: 2 },
  { id: 'hunt', name: 'Hunt', metro: 'Dallas-Fort Worth', x: 86, y: 10 },

  // Austin Metro (center-left area)
  { id: 'travis', name: 'Travis', metro: 'Austin', x: 42, y: 62 },
  { id: 'williamson', name: 'Williamson', metro: 'Austin', x: 46, y: 54 },
  { id: 'hays', name: 'Hays', metro: 'Austin', x: 38, y: 70 },
  { id: 'bastrop', name: 'Bastrop', metro: 'Austin', x: 52, y: 68 },
  { id: 'caldwell', name: 'Caldwell', metro: 'Austin', x: 46, y: 76 },
  { id: 'lee', name: 'Lee', metro: 'Austin', x: 56, y: 60 },
  { id: 'burnet', name: 'Burnet', metro: 'Austin', x: 34, y: 56 },
  { id: 'blanco', name: 'Blanco', metro: 'Austin', x: 30, y: 66 },

  // San Antonio Metro (bottom-left area)
  { id: 'bexar', name: 'Bexar', metro: 'San Antonio', x: 26, y: 82 },
  { id: 'comal', name: 'Comal', metro: 'San Antonio', x: 32, y: 76 },
  { id: 'guadalupe', name: 'Guadalupe', metro: 'San Antonio', x: 38, y: 80 },
  { id: 'wilson', name: 'Wilson', metro: 'San Antonio', x: 34, y: 88 },
  { id: 'medina', name: 'Medina', metro: 'San Antonio', x: 18, y: 84 },
  { id: 'kendall', name: 'Kendall', metro: 'San Antonio', x: 24, y: 74 },
  { id: 'bandera', name: 'Bandera', metro: 'San Antonio', x: 16, y: 76 },
  { id: 'atascosa', name: 'Atascosa', metro: 'San Antonio', x: 26, y: 94 },

  // Houston Metro (bottom-right area)
  { id: 'harris', name: 'Harris', metro: 'Houston', x: 78, y: 72 },
  { id: 'fort-bend', name: 'Fort Bend', metro: 'Houston', x: 72, y: 78 },
  { id: 'montgomery', name: 'Montgomery', metro: 'Houston', x: 76, y: 62 },
  { id: 'brazoria', name: 'Brazoria', metro: 'Houston', x: 74, y: 86 },
  { id: 'galveston', name: 'Galveston', metro: 'Houston', x: 82, y: 88 },
  { id: 'liberty', name: 'Liberty', metro: 'Houston', x: 86, y: 66 },
  { id: 'chambers', name: 'Chambers', metro: 'Houston', x: 88, y: 76 },
  { id: 'waller', name: 'Waller', metro: 'Houston', x: 68, y: 68 },
  { id: 'austin-county', name: 'Austin County', metro: 'Houston', x: 64, y: 74 },

  // Central Corridor (center area)
  { id: 'mclennan', name: 'McLennan', metro: 'Central Corridor', x: 52, y: 36 },
  { id: 'bell', name: 'Bell', metro: 'Central Corridor', x: 48, y: 44 },
  { id: 'brazos', name: 'Brazos', metro: 'Central Corridor', x: 62, y: 52 },
  { id: 'grimes', name: 'Grimes', metro: 'Central Corridor', x: 68, y: 58 },
  { id: 'burleson', name: 'Burleson', metro: 'Central Corridor', x: 58, y: 56 },
]

const metroColors: Record<string, { bg: string; hover: string; text: string }> = {
  'Dallas-Fort Worth': { bg: '#3B82F6', hover: '#2563EB', text: 'text-blue-600' },
  'Austin': { bg: '#8B5CF6', hover: '#7C3AED', text: 'text-purple-600' },
  'San Antonio': { bg: '#EF4444', hover: '#DC2626', text: 'text-red-600' },
  'Houston': { bg: '#F97316', hover: '#EA580C', text: 'text-orange-600' },
  'Central Corridor': { bg: '#22C55E', hover: '#16A34A', text: 'text-green-600' },
}

interface TexasTriangleMapProps {
  showLinks?: boolean
  onCountyClick?: (countyId: string) => void
}

export default function TexasTriangleMap({ showLinks = true, onCountyClick }: TexasTriangleMapProps) {
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null)
  const [selectedMetro, setSelectedMetro] = useState<string | null>(null)

  const filteredCounties = selectedMetro
    ? counties.filter(c => c.metro === selectedMetro)
    : counties

  const handleCountyClick = (county: County) => {
    if (onCountyClick) {
      onCountyClick(county.id)
    }
  }

  return (
    <div className="w-full">
      {/* Metro Area Legend/Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        <button
          onClick={() => setSelectedMetro(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !selectedMetro
              ? 'bg-gray-800 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Areas
        </button>
        {Object.entries(metroColors).map(([metro, colors]) => (
          <button
            key={metro}
            onClick={() => setSelectedMetro(selectedMetro === metro ? null : metro)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedMetro === metro
                ? 'text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            style={selectedMetro === metro ? { backgroundColor: colors.bg } : {}}
          >
            <span className={selectedMetro === metro ? 'text-white' : colors.text}>
              {metro}
            </span>
          </button>
        ))}
      </div>

      {/* Map Container */}
      <div className="relative bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 md:p-8 overflow-hidden">
        {/* Texas Triangle Outline (simplified) */}
        <svg
          viewBox="0 0 100 100"
          className="w-full max-w-2xl mx-auto"
          style={{ minHeight: '300px' }}
        >
          {/* Background triangle shape */}
          <path
            d="M 70 5 L 90 90 L 15 90 Z"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="0.5"
            strokeDasharray="2,2"
            opacity="0.5"
          />

          {/* County dots */}
          {filteredCounties.map((county) => {
            const colors = metroColors[county.metro]
            const isHovered = hoveredCounty === county.id

            const dot = (
              <g
                key={county.id}
                onMouseEnter={() => setHoveredCounty(county.id)}
                onMouseLeave={() => setHoveredCounty(null)}
                onClick={() => handleCountyClick(county)}
                className="cursor-pointer"
              >
                {/* Outer ring on hover */}
                {isHovered && (
                  <circle
                    cx={county.x}
                    cy={county.y}
                    r="4"
                    fill="none"
                    stroke={colors.bg}
                    strokeWidth="0.5"
                    opacity="0.5"
                  />
                )}
                {/* Main dot */}
                <circle
                  cx={county.x}
                  cy={county.y}
                  r={isHovered ? "2.5" : "2"}
                  fill={isHovered ? colors.hover : colors.bg}
                  className="transition-all duration-200"
                />
                {/* County name on hover */}
                {isHovered && (
                  <text
                    x={county.x}
                    y={county.y - 4}
                    textAnchor="middle"
                    className="text-[2.5px] font-semibold fill-gray-800"
                  >
                    {county.name}
                  </text>
                )}
              </g>
            )

            if (showLinks) {
              return (
                <Link key={county.id} href={`/${county.id}`}>
                  {dot}
                </Link>
              )
            }
            return dot
          })}

          {/* City Labels */}
          <text x="72" y="22" className="text-[3px] font-bold fill-gray-600">Dallas</text>
          <text x="42" y="66" className="text-[3px] font-bold fill-gray-600">Austin</text>
          <text x="22" y="86" className="text-[3px] font-bold fill-gray-600">San Antonio</text>
          <text x="78" y="76" className="text-[3px] font-bold fill-gray-600">Houston</text>
        </svg>

        {/* Hover Info Card */}
        {hoveredCounty && (
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 min-w-[150px]">
            {(() => {
              const county = counties.find(c => c.id === hoveredCounty)
              if (!county) return null
              const colors = metroColors[county.metro]
              return (
                <>
                  <h4 className="font-bold text-gray-900">{county.name} County</h4>
                  <p className={`text-sm ${colors.text}`}>{county.metro}</p>
                  {showLinks && (
                    <p className="text-xs text-gray-500 mt-1">Click to view listings</p>
                  )}
                </>
              )
            })()}
          </div>
        )}
      </div>

      {/* County Count */}
      <p className="text-center text-sm text-gray-500 mt-4">
        Serving <span className="font-semibold text-gray-700">{filteredCounties.length}</span> counties
        {selectedMetro && ` in ${selectedMetro}`}
        {!selectedMetro && ' across the Texas Triangle'}
      </p>
    </div>
  )
}
