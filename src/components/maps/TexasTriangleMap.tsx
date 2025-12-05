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
  // Dallas-Fort Worth Metro (top area)
  { id: 'dallas', name: 'Dallas', metro: 'Dallas-Fort Worth', x: 65, y: 15 },
  { id: 'tarrant', name: 'Tarrant', metro: 'Dallas-Fort Worth', x: 55, y: 17 },
  { id: 'denton', name: 'Denton', metro: 'Dallas-Fort Worth', x: 60, y: 8 },
  { id: 'collin', name: 'Collin', metro: 'Dallas-Fort Worth', x: 70, y: 8 },
  { id: 'rockwall', name: 'Rockwall', metro: 'Dallas-Fort Worth', x: 75, y: 15 },
  { id: 'kaufman', name: 'Kaufman', metro: 'Dallas-Fort Worth', x: 75, y: 22 },
  { id: 'wise', name: 'Wise', metro: 'Dallas-Fort Worth', x: 48, y: 10 },
  { id: 'parker', name: 'Parker', metro: 'Dallas-Fort Worth', x: 45, y: 18 },
  { id: 'jack', name: 'Jack', metro: 'Dallas-Fort Worth', x: 38, y: 10 },
  { id: 'grayson', name: 'Grayson', metro: 'Dallas-Fort Worth', x: 65, y: 2 },
  { id: 'hunt', name: 'Hunt', metro: 'Dallas-Fort Worth', x: 78, y: 8 },

  // Austin Metro (bottom-left area)
  { id: 'travis', name: 'Travis', metro: 'Austin', x: 32, y: 70 },
  { id: 'williamson', name: 'Williamson', metro: 'Austin', x: 35, y: 62 },
  { id: 'hays', name: 'Hays', metro: 'Austin', x: 28, y: 78 },
  { id: 'bastrop', name: 'Bastrop', metro: 'Austin', x: 42, y: 75 },
  { id: 'caldwell', name: 'Caldwell', metro: 'Austin', x: 38, y: 82 },
  { id: 'lee', name: 'Lee', metro: 'Austin', x: 48, y: 68 },
  { id: 'burnet', name: 'Burnet', metro: 'Austin', x: 25, y: 62 },
  { id: 'blanco', name: 'Blanco', metro: 'Austin', x: 22, y: 72 },

  // San Antonio Metro (bottom-left area)
  { id: 'bexar', name: 'Bexar', metro: 'San Antonio', x: 18, y: 88 },
  { id: 'comal', name: 'Comal', metro: 'San Antonio', x: 24, y: 82 },
  { id: 'guadalupe', name: 'Guadalupe', metro: 'San Antonio', x: 30, y: 86 },
  { id: 'wilson', name: 'Wilson', metro: 'San Antonio', x: 26, y: 94 },
  { id: 'medina', name: 'Medina', metro: 'San Antonio', x: 10, y: 90 },
  { id: 'kendall', name: 'Kendall', metro: 'San Antonio', x: 16, y: 80 },
  { id: 'bandera', name: 'Bandera', metro: 'San Antonio', x: 8, y: 82 },
  { id: 'atascosa', name: 'Atascosa', metro: 'San Antonio', x: 18, y: 98 },

  // Houston Metro (bottom-right area)
  { id: 'harris', name: 'Harris', metro: 'Houston', x: 82, y: 72 },
  { id: 'fort-bend', name: 'Fort Bend', metro: 'Houston', x: 76, y: 78 },
  { id: 'montgomery', name: 'Montgomery', metro: 'Houston', x: 80, y: 62 },
  { id: 'brazoria', name: 'Brazoria', metro: 'Houston', x: 78, y: 86 },
  { id: 'galveston', name: 'Galveston', metro: 'Houston', x: 88, y: 88 },
  { id: 'liberty', name: 'Liberty', metro: 'Houston', x: 90, y: 65 },
  { id: 'chambers', name: 'Chambers', metro: 'Houston', x: 92, y: 78 },
  { id: 'waller', name: 'Waller', metro: 'Houston', x: 72, y: 68 },
  { id: 'austin-county', name: 'Austin County', metro: 'Houston', x: 66, y: 74 },

  // Central Corridor (center area)
  { id: 'mclennan', name: 'McLennan', metro: 'Central Corridor', x: 45, y: 35 },
  { id: 'bell', name: 'Bell', metro: 'Central Corridor', x: 40, y: 45 },
  { id: 'brazos', name: 'Brazos', metro: 'Central Corridor', x: 58, y: 55 },
  { id: 'grimes', name: 'Grimes', metro: 'Central Corridor', x: 65, y: 60 },
  { id: 'burleson', name: 'Burleson', metro: 'Central Corridor', x: 52, y: 60 },
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
      <div className="relative bg-gradient-to-br from-amber-50 via-green-50 to-blue-50 rounded-xl p-4 md:p-8 overflow-hidden border border-gray-200">
        {/* Texas State Inset - Shows where the Triangle is */}
        <div className="absolute top-3 left-3 bg-white/90 rounded-lg shadow-md p-2 border border-gray-200 z-10">
          <p className="text-[9px] font-semibold text-gray-600 mb-1 text-center">Texas Triangle</p>
          <svg viewBox="0 0 100 100" className="w-16 h-16 md:w-20 md:h-20">
            {/* Realistic Texas state outline */}
            <path
              d="M 25 5
                 L 75 5
                 L 78 8
                 L 95 25
                 L 95 35
                 L 90 45
                 L 88 55
                 L 85 65
                 L 80 75
                 L 70 85
                 L 55 92
                 L 45 95
                 L 35 92
                 L 25 88
                 L 15 80
                 L 8 70
                 L 5 55
                 L 8 40
                 L 5 30
                 L 8 20
                 L 15 10
                 Z"
              fill="#e5e7eb"
              stroke="#9ca3af"
              strokeWidth="1"
            />
            {/* Texas Triangle region highlighted */}
            <path
              d="M 55 18 L 82 70 L 22 78 Z"
              fill="#22c55e"
              fillOpacity="0.4"
              stroke="#16a34a"
              strokeWidth="1.5"
            />
            {/* Metro city dots */}
            <circle cx="55" cy="22" r="3" fill="#3B82F6" /> {/* Dallas */}
            <circle cx="78" cy="65" r="3" fill="#F97316" /> {/* Houston */}
            <circle cx="28" cy="72" r="3" fill="#EF4444" /> {/* San Antonio */}
            <circle cx="38" cy="58" r="2.5" fill="#8B5CF6" /> {/* Austin */}
          </svg>
          <div className="flex flex-wrap justify-center gap-1 mt-1">
            <span className="text-[7px] text-gray-500">39 Counties</span>
            <span className="text-[7px] text-gray-400">•</span>
            <span className="text-[7px] text-gray-500">4 Metros</span>
          </div>
        </div>

        <svg
          viewBox="0 0 100 105"
          className="w-full max-w-2xl mx-auto"
          style={{ minHeight: '350px' }}
        >
          {/* Simplified Texas state outline */}
          <path
            d="M 2 10 L 35 2 L 85 2 L 98 15 L 98 45 L 95 70 L 88 95 L 75 100 L 50 98 L 25 100 L 5 95 L 2 70 L 5 40 Z"
            fill="#f5f5f4"
            stroke="#d4d4d4"
            strokeWidth="0.5"
          />

          {/* Texas Triangle region highlight */}
          <path
            d="M 60 5 L 95 75 L 5 95 Z"
            fill="#dcfce7"
            fillOpacity="0.4"
            stroke="#22c55e"
            strokeWidth="0.8"
            strokeDasharray="3,2"
          />

          {/* Major highways/interstates */}
          {/* I-35 (San Antonio to Dallas) */}
          <path
            d="M 18 90 Q 30 70 35 55 Q 40 40 50 30 Q 55 22 62 15"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="0.8"
            strokeLinecap="round"
          />
          {/* I-45 (Houston to Dallas) */}
          <path
            d="M 82 75 Q 75 60 68 45 Q 62 32 63 15"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="0.8"
            strokeLinecap="round"
          />
          {/* I-10 (San Antonio to Houston) */}
          <path
            d="M 18 88 Q 35 85 50 80 Q 65 76 82 74"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="0.8"
            strokeLinecap="round"
          />
          {/* Highway labels */}
          <text x="38" y="48" className="text-[2px] font-bold fill-amber-600">I-35</text>
          <text x="72" y="48" className="text-[2px] font-bold fill-amber-600">I-45</text>
          <text x="52" y="84" className="text-[2px] font-bold fill-amber-600">I-10</text>

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
                    r="5"
                    fill="none"
                    stroke={colors.bg}
                    strokeWidth="0.5"
                    opacity="0.5"
                  />
                )}
                {/* Shadow for depth */}
                <circle
                  cx={county.x + 0.3}
                  cy={county.y + 0.3}
                  r={isHovered ? "2.8" : "2.2"}
                  fill="rgba(0,0,0,0.2)"
                />
                {/* Main dot */}
                <circle
                  cx={county.x}
                  cy={county.y}
                  r={isHovered ? "2.8" : "2.2"}
                  fill={isHovered ? colors.hover : colors.bg}
                  stroke="white"
                  strokeWidth="0.4"
                  className="transition-all duration-200"
                />
                {/* County name on hover */}
                {isHovered && (
                  <>
                    <rect
                      x={county.x - 8}
                      y={county.y - 8}
                      width="16"
                      height="4"
                      rx="1"
                      fill="white"
                      fillOpacity="0.9"
                    />
                    <text
                      x={county.x}
                      y={county.y - 5}
                      textAnchor="middle"
                      className="text-[2.5px] font-bold fill-gray-800"
                    >
                      {county.name}
                    </text>
                  </>
                )}
              </g>
            )

            if (showLinks) {
              return (
                <Link key={county.id} href={`/${county.id}-county`}>
                  {dot}
                </Link>
              )
            }
            return dot
          })}

          {/* Major City Labels with backgrounds */}
          {/* Dallas */}
          <rect x="56" y="19" width="18" height="5" rx="1" fill="white" fillOpacity="0.85" />
          <text x="65" y="23" textAnchor="middle" className="text-[3.5px] font-bold fill-gray-700">Dallas-FW</text>

          {/* Austin */}
          <rect x="24" y="72" width="12" height="5" rx="1" fill="white" fillOpacity="0.85" />
          <text x="30" y="76" textAnchor="middle" className="text-[3.5px] font-bold fill-gray-700">Austin</text>

          {/* San Antonio */}
          <rect x="6" y="91" width="18" height="5" rx="1" fill="white" fillOpacity="0.85" />
          <text x="15" y="95" textAnchor="middle" className="text-[3.5px] font-bold fill-gray-700">San Antonio</text>

          {/* Houston */}
          <rect x="76" y="75" width="14" height="5" rx="1" fill="white" fillOpacity="0.85" />
          <text x="83" y="79" textAnchor="middle" className="text-[3.5px] font-bold fill-gray-700">Houston</text>

          {/* Waco label for Central Corridor */}
          <rect x="40" y="38" width="10" height="4" rx="1" fill="white" fillOpacity="0.85" />
          <text x="45" y="41" textAnchor="middle" className="text-[2.5px] font-semibold fill-gray-600">Waco</text>
        </svg>

        {/* Hover Info Card */}
        {hoveredCounty && (
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 min-w-[150px] border border-gray-100">
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

        {/* Map Legend */}
        <div className="absolute bottom-2 left-2 bg-white/80 rounded px-2 py-1 text-[10px] text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-amber-400 rounded"></div>
            <span>Interstate Highways</span>
          </div>
        </div>
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
