'use client'

interface Tab {
  id: string
  label: string
  hash: string
}

interface TabNavigationProps {
  tabs: Tab[]
  activeTab: string
  onChange: (tabId: string) => void
}

export default function TabNavigation({ tabs, activeTab, onChange }: TabNavigationProps) {
  return (
    <div className="border-b border-gray-200 mb-8">
      {/* Desktop: Horizontal tabs */}
      <nav className="hidden md:flex gap-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              relative py-4 px-1 text-base font-medium transition-colors whitespace-nowrap
              ${
                activeTab === tab.id
                  ? 'text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }
            `}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600" />
            )}
          </button>
        ))}
      </nav>

      {/* Mobile: Dropdown/Select */}
      <div className="md:hidden">
        <select
          value={activeTab}
          onChange={(e) => onChange(e.target.value)}
          className="w-full py-3 px-4 border-0 border-b-2 border-gray-200 focus:border-green-600 focus:ring-0 text-base font-medium bg-transparent"
        >
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
