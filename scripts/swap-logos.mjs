/**
 * Replace FarmLogo usage patterns across the site.
 * - Navigation/header: TomatoMark (small) + text beside it
 * - Hero/auth pages: FarmLogo (full wordmark), no green box
 * - Avatar fallbacks: TomatoMark (small)
 * Run with: node scripts/swap-logos.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.join(__dirname, '..', 'src')

function findFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      findFiles(fullPath, files)
    } else if (entry.name.endsWith('.tsx')) {
      files.push(fullPath)
    }
  }
  return files
}

const files = findFiles(srcDir)
let changed = 0

// Files where FarmLogo should become TomatoMark (small icon uses)
const tomatoMarkFiles = [
  'ListingCard.tsx',
  'farmers/page.tsx',
  'DashboardClient.tsx',
  'QuickTour.tsx',
]

// Files where the logo is in a green box that should be removed
// Pattern: <div className="p-2 rounded-lg" style={{ backgroundColor: '#4A5E35' }}><FarmLogo .../></div>
// Replace with just the logo/mark directly

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf8')
  const fileName = path.basename(filePath)
  const relPath = path.relative(path.join(__dirname, '..'), filePath)
  let modified = false

  // Skip the FarmLogo and TomatoMark component files themselves
  if (fileName === 'FarmLogo.tsx' || fileName === 'TomatoMark.tsx') continue

  // Skip if file doesn't use FarmLogo
  if (!content.includes('FarmLogo')) continue

  // Check if this is a file that should use TomatoMark instead
  const useTomatoMark = tomatoMarkFiles.some(f => relPath.includes(f.replace('/', path.sep)))

  if (useTomatoMark) {
    // Add TomatoMark import
    if (!content.includes('TomatoMark')) {
      content = content.replace(
        "import FarmLogo from '@/components/icons/FarmLogo'",
        "import FarmLogo from '@/components/icons/FarmLogo'\nimport TomatoMark from '@/components/icons/TomatoMark'"
      )
    }
    // Replace small FarmLogo uses (size 16-24) with TomatoMark
    content = content.replace(/<FarmLogo size=\{16\}/g, '<TomatoMark size={16}')
    content = content.replace(/<FarmLogo size=\{20\}/g, '<TomatoMark size={20}')
    content = content.replace(/<FarmLogo size=\{24\}/g, '<TomatoMark size={24}')
    modified = true
  }

  // For Navigation.tsx — use TomatoMark in the header, remove green boxes
  if (fileName === 'Navigation.tsx') {
    if (!content.includes('TomatoMark')) {
      content = content.replace(
        "import FarmLogo from '@/components/icons/FarmLogo'",
        "import TomatoMark from '@/components/icons/TomatoMark'"
      )
    }
    // Replace all FarmLogo references with TomatoMark in navigation
    content = content.replace(/FarmLogo/g, 'TomatoMark')
    // Remove green box wrapper: <div className="p-2 rounded-lg" style={{ backgroundColor: '#4A5E35' }}>
    content = content.replace(
      /<div className="p-2 rounded-lg" style=\{\{ backgroundColor: '#4A5E35' \}\}>\s*<TomatoMark size=\{28\} className="text-white" \/>\s*<\/div>/g,
      '<TomatoMark size={32} />'
    )
    content = content.replace(
      /<div className="p-1.5 rounded-lg" style=\{\{ backgroundColor: '#4A5E35' \}\}>\s*<TomatoMark size=\{20\} className="text-white" \/>\s*<\/div>/g,
      '<TomatoMark size={24} />'
    )
    modified = true
  }

  // For Header.tsx — same treatment
  if (fileName === 'Header.tsx') {
    if (!content.includes('TomatoMark')) {
      content = content.replace(
        "import FarmLogo from '@/components/icons/FarmLogo'",
        "import TomatoMark from '@/components/icons/TomatoMark'"
      )
    }
    content = content.replace(/FarmLogo/g, 'TomatoMark')
    content = content.replace(
      /<div className="p-2 rounded-lg" style=\{\{ backgroundColor: '#4A5E35' \}\}>\s*<TomatoMark size=\{28\} className="text-white" \/>\s*<\/div>/g,
      '<TomatoMark size={32} />'
    )
    modified = true
  }

  // For welcome page — use full FarmLogo wordmark in hero, TomatoMark in footer
  if (relPath.includes('welcome') && fileName === 'page.tsx') {
    if (!content.includes('TomatoMark')) {
      content = content.replace(
        "import FarmLogo from '@/components/icons/FarmLogo'",
        "import FarmLogo from '@/components/icons/FarmLogo'\nimport TomatoMark from '@/components/icons/TomatoMark'"
      )
    }
    // Hero: remove green box, make logo bigger
    content = content.replace(
      /<div className="p-3 rounded-xl" style=\{\{ backgroundColor: '#4A5E35' \}\}>\s*<FarmLogo size=\{48\} className="text-white" \/>\s*<\/div>/g,
      '<FarmLogo size={120} />'
    )
    // Footer: swap to TomatoMark
    content = content.replace(
      /<div className="p-2 rounded-lg" style=\{\{ backgroundColor: '#4A5E35' \}\}>\s*<FarmLogo size=\{20\} className="text-white" \/>\s*<\/div>/g,
      '<TomatoMark size={24} />'
    )
    modified = true
  }

  // For auth pages (login, signup, forgot-password, reset-password) — use full wordmark, remove green box
  if (['login', 'signup', 'forgot-password', 'reset-password'].some(p => relPath.includes(p)) && fileName === 'page.tsx') {
    // Remove green box wrapper around FarmLogo
    content = content.replace(
      /<div className="p-3 rounded-xl shadow-lg" style=\{\{ backgroundColor: '#4A5E35' \}\}>\s*<FarmLogo size=\{32\} className="text-white" \/>\s*<\/div>/g,
      '<FarmLogo size={80} />'
    )
    content = content.replace(
      /<div className="p-3 rounded-xl" style=\{\{ backgroundColor: '#4A5E35' \}\}>\s*<FarmLogo size=\{32\} className="text-white" \/>\s*<\/div>/g,
      '<FarmLogo size={80} />'
    )
    modified = true
  }

  // For auth form components — remove green circle wrapper
  if (['LoginForm.tsx', 'SignupForm.tsx'].includes(fileName)) {
    content = content.replace(
      /<div className="inline-flex p-3 rounded-full mb-4" style=\{\{ backgroundColor: '#F0EDE4' \}\}>\s*<FarmLogo className="h-8 w-8" style=\{\{ color: '#4A5E35' \}\} \/>\s*<\/div>/g,
      '<div className="mb-4"><FarmLogo size={64} /></div>'
    )
    modified = true
  }

  // For info pages (contact, terms, privacy, how-it-works) — use FarmLogo, remove green box
  if (['contact', 'terms', 'privacy', 'how-it-works'].some(p => relPath.includes(p)) && fileName === 'page.tsx') {
    content = content.replace(
      /<Link href="\/" className="inline-block p-3 rounded-xl shadow-lg bg-farm-green-800 hover:bg-farm-green-900 transition-colors transform hover:scale-105">\s*<FarmLogo size=\{36\} className="text-white" \/>\s*<\/Link>/g,
      '<Link href="/" className="inline-block hover:opacity-80 transition-opacity"><FarmLogo size={80} /></Link>'
    )
    // Also handle non-link versions
    content = content.replace(
      /<div className="p-3 rounded-xl shadow-lg" style=\{\{ backgroundColor: '#4A5E35' \}\}>\s*<FarmLogo size=\{36\} className="text-white" \/>\s*<\/div>/g,
      '<FarmLogo size={80} />'
    )
    modified = true
  }

  // For admin page — use TomatoMark in header
  if (relPath.includes('admin') && fileName === 'page.tsx') {
    if (!content.includes('TomatoMark')) {
      content = content.replace(
        "import FarmLogo from '@/components/icons/FarmLogo'",
        "import FarmLogo from '@/components/icons/FarmLogo'\nimport TomatoMark from '@/components/icons/TomatoMark'"
      )
    }
    content = content.replace(
      /<div className="p-2 rounded-lg" style=\{\{ backgroundColor: '#4A5E35' \}\}>\s*<FarmLogo size=\{24\} className="text-white" \/>\s*<\/div>/g,
      '<TomatoMark size={28} />'
    )
    modified = true
  }

  // For claim page
  if (relPath.includes('claim') && fileName === 'page.tsx') {
    content = content.replace(
      /<div className="p-3 rounded-xl" style=\{\{ backgroundColor: '#4A5E35' \}\}>\s*<FarmLogo size=\{36\} className="text-white" \/>\s*<\/div>/g,
      '<FarmLogo size={80} />'
    )
    modified = true
  }

  // General cleanup: remove className="text-white" from FarmLogo since it's now a PNG
  content = content.replace(/<FarmLogo([^/]*) className="text-white"/g, '<FarmLogo$1')
  content = content.replace(/<TomatoMark([^/]*) className="text-white"/g, '<TomatoMark$1')

  // Remove style={{ color: '#4A5E35' }} from FarmLogo since it's now a PNG
  content = content.replace(/<FarmLogo([^/]*) style=\{\{ color: '#4A5E35' \}\}/g, '<FarmLogo$1')

  if (modified || content !== fs.readFileSync(filePath, 'utf8')) {
    fs.writeFileSync(filePath, content, 'utf8')
    console.log(`  Updated: ${relPath}`)
    changed++
  }
}

console.log(`\nDone! Updated ${changed} files.`)
