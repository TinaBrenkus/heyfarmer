/**
 * Replace all emojis with Phosphor Icons across the HeyFarmer codebase.
 * Run with: node scripts/replace-emojis.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.join(__dirname, '..', 'src')

// Emoji to Phosphor icon component name mapping
const EMOJI_TO_ICON = {
  '👨‍🌾': 'Person',
  '🧑‍🌾': 'Person',
  '🥕': 'Plant',
  '🥬': 'Plant',
  '🤝': 'Handshake',
  '🌱': 'Plant',
  '📈': 'TrendUp',
  '🚀': 'TrendUp',
  '💰': 'CurrencyDollar',
  '🎯': 'Target',
  '⏰': 'Clock',
  '📱': 'DeviceMobile',
  '🌍': 'Globe',
  '✅': 'CheckCircle',
  '✨': 'Sparkle',
  '🏡': 'House',
  '🏠': 'House',
  '🛒': 'ShoppingCart',
  '💬': 'ChatCircle',
  '👥': 'UsersThree',
  '📝': 'NotePencil',
  '📍': 'MapPinLine',
  '🔍': 'MagnifyingGlass',
  '❤️': 'Heart',
  '🎉': 'Confetti',
  '👋': 'HandWaving',
  '👤': 'User',
  '📊': 'ChartBar',
  '💡': 'Lightbulb',
  '📧': 'EnvelopeSimple',
  '📅': 'CalendarBlank',
  '🗓': 'CalendarBlank',
  '🔧': 'Wrench',
  '🛠️': 'Wrench',
  '🐛': 'Bug',
  '🌦️': 'CloudSun',
  '📚': 'BookOpen',
  '📖': 'BookOpen',
  '🎙️': 'Microphone',
  '🏛️': 'Buildings',
  '😞': 'SmileySad',
  '🥚': 'Egg',
  '🍅': 'Plant',
  '🫑': 'Plant',
  '🧀': 'Plant',
  '🥩': 'Plant',
  '🍯': 'Plant',
  '🌸': 'Flower',
  '🥛': 'Plant',
  '🐔': 'Bird',
  '🌻': 'Flower',
  '🫒': 'Plant',
  '🥜': 'Plant',
  '🌿': 'Leaf',
  '🍓': 'Plant',
  '🔥': 'Fire',
  '📸': 'Camera',
  '🗺': 'MapTrifold',
  '⭐': 'Star',
  '🏆': 'Trophy',
  '📋': 'ListBullets',
  '🎪': 'Tent',
  '🔒': 'Lock',
  '📞': 'Phone',
  '⚡': 'Lightning',
  '🏷': 'Tag',
  '🔔': 'Bell',
  '📌': 'PushPin',
  '🔗': 'LinkSimple',
  '🆕': 'Plus',
  '💭': 'ChatCircleDots',
  '🤠': 'Person',
  '🐝': 'Plant',
  '🚜': 'Tractor',
}

// Files to skip
const SKIP_FILES = ['useWeather.ts']

// Collect all unique Phosphor icons needed per file
function getNeededIcons(content) {
  const icons = new Set()
  for (const [emoji, iconName] of Object.entries(EMOJI_TO_ICON)) {
    if (content.includes(emoji)) {
      icons.add(iconName)
    }
  }
  return icons
}

// Find all .tsx and .ts files recursively
function findFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      findFiles(fullPath, files)
    } else if ((entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) && !SKIP_FILES.includes(entry.name)) {
      files.push(fullPath)
    }
  }
  return files
}

// Check if file contains any emojis
function hasEmojis(content) {
  for (const emoji of Object.keys(EMOJI_TO_ICON)) {
    if (content.includes(emoji)) return true
  }
  return false
}

// Process a single file
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')

  if (!hasEmojis(content)) return false

  const neededIcons = getNeededIcons(content)
  if (neededIcons.size === 0) return false

  const relPath = path.relative(path.join(__dirname, '..'), filePath)
  console.log(`  Processing: ${relPath}`)

  // Sort emojis by length (longer first) to avoid partial replacements
  const sortedEmojis = Object.entries(EMOJI_TO_ICON).sort((a, b) => b[0].length - a[0].length)

  // Strategy 1: Replace emojis in JSX span elements like <span className="text-2xl">🔍</span>
  for (const [emoji, iconName] of sortedEmojis) {
    // Pattern: <span ...>EMOJI</span> — replace with icon component
    const spanRegex = new RegExp(`<span[^>]*>\\s*${escapeRegex(emoji)}\\s*</span>`, 'g')
    content = content.replace(spanRegex, `<${iconName} size={24} weight="regular" />`)
  }

  // Strategy 2: Replace emojis in template literals and string assignments like icon: "🔍"
  for (const [emoji, iconName] of sortedEmojis) {
    // In object properties like icon: '🔍' or icon: "🔍"
    const propRegex = new RegExp(`(icon:\\s*)['"]${escapeRegex(emoji)}['"]`, 'g')
    content = content.replace(propRegex, `$1'${iconName}'`)
  }

  // Strategy 3: Replace emojis in string literals like label: '🥚 Eggs'
  for (const [emoji, iconName] of sortedEmojis) {
    // In labels like '🥚 Eggs' — just remove the emoji, keep the text
    const labelRegex = new RegExp(`${escapeRegex(emoji)}\\s+`, 'g')
    content = content.replace(labelRegex, '')
  }

  // Strategy 4: Replace standalone emojis in JSX text like {config.emoji} references
  // Handle emoji property in objects — replace with icon name string
  for (const [emoji, iconName] of sortedEmojis) {
    const emojiPropRegex = new RegExp(`emoji:\\s*['"]${escapeRegex(emoji)}['"]`, 'g')
    content = content.replace(emojiPropRegex, `iconName: '${iconName}'`)
  }

  // Strategy 5: Replace remaining standalone emojis in JSX text content
  for (const [emoji, iconName] of sortedEmojis) {
    if (content.includes(emoji)) {
      // For text content emojis (like in paragraphs), just remove them
      content = content.replace(new RegExp(escapeRegex(emoji), 'g'), '')
    }
  }

  // Now add the Phosphor import if not already present
  if (neededIcons.size > 0 && !content.includes('@phosphor-icons/react')) {
    const iconList = Array.from(neededIcons).sort().join(', ')
    const importLine = `import { ${iconList} } from '@phosphor-icons/react'`

    // Add after the last existing import
    const lastImportIdx = content.lastIndexOf('\nimport ')
    if (lastImportIdx !== -1) {
      const endOfImportLine = content.indexOf('\n', lastImportIdx + 1)
      content = content.slice(0, endOfImportLine + 1) + importLine + '\n' + content.slice(endOfImportLine + 1)
    }
  }

  // Also need to handle the FarmerBadgeCompact that renders {config.emoji}
  // Replace with rendering the icon component from iconName
  if (content.includes('{config.emoji}')) {
    content = content.replace('{config.emoji}', '{config.iconName && <PhosphorIcon name={config.iconName} size={16} />}')
  }

  fs.writeFileSync(filePath, content, 'utf8')
  return true
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Main
console.log('Replacing emojis with Phosphor Icons...\n')

const files = findFiles(srcDir)
let changed = 0

for (const file of files) {
  if (processFile(file)) changed++
}

console.log(`\nDone! Modified ${changed} files.`)
