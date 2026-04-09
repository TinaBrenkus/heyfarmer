/**
 * Replace the entire HeyFarmer color palette with earthy, agricultural colors.
 * Run with: node scripts/recolor-palette.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.join(__dirname, '..', 'src')

// ============================================================
// COLOR MAPPING: Old hex → New hex
// ============================================================

const HEX_REPLACEMENTS = [
  // PRIMARY GREEN (brand)
  ['#2E7D32', '#4A5E35'],  // Main brand green → deep olive
  ['#2e7d32', '#4A5E35'],  // lowercase variant

  // GREEN SHADES (lighter to darker)
  ['#E8F5E8', '#F0EDE4'],  // Light green bg → warm light
  ['#E8F5E9', '#F0EDE4'],  // Light green bg variant
  ['#C8E6C9', '#DDD8C8'],  // Green 100
  ['#A5D6A7', '#B8B49E'],  // Green 200
  ['#81C784', '#9A9A7E'],  // Green 300
  ['#66BB6A', '#7E8A62'],  // Green 400
  ['#4CAF50', '#6B7F4A'],  // Green 500 → sage
  ['#43A047', '#5E7240'],  // Green 600
  ['#388E3C', '#526638'],  // Green 700
  ['#1B5E20', '#3A4A28'],  // Green 900

  // TRUST BLUE → TERRACOTTA
  ['#1976D2', '#C4622D'],  // Main blue → terracotta
  ['#1976d2', '#C4622D'],  // lowercase
  ['#1565C0', '#B35526'],  // Dark blue → darker terracotta
  ['#1565c0', '#B35526'],
  ['#1E88E5', '#C4622D'],  // Blue 600
  ['#2196F3', '#D07340'],  // Blue 500
  ['#42A5F5', '#D98E60'],  // Blue 400
  ['#64B5F6', '#E0A880'],  // Blue 300
  ['#90CAF9', '#E8C4A0'],  // Blue 200
  ['#BBDEFB', '#F0DCC8'],  // Blue 100
  ['#E3F2FD', '#FAF0E8'],  // Blue 50 → warm light terracotta
  ['#0D47A1', '#8C4420'],  // Blue 900

  // HARVEST ORANGE → SAGE GREEN (secondary)
  ['#FFA726', '#6B7F4A'],  // Main orange → sage
  ['#FF9800', '#5E7240'],  // Orange 500
  ['#FB8C00', '#526638'],  // Orange 600
  ['#F57C00', '#4A5E35'],  // Orange 700 → olive
  ['#EF6C00', '#3E5230'],  // Orange 800
  ['#E65100', '#344628'],  // Orange 900
  ['#FFE0B2', '#E4E0D0'],  // Orange 100
  ['#FFCC80', '#D4D0BE'],  // Orange 200
  ['#FFB74D', '#B0AC96'],  // Orange 300
  ['#FFF3E0', '#F5F2EA'],  // Orange 50 → warm cream

  // BACKGROUNDS
  ['#F8F9FA', '#FAF7F0'],  // Clean white → warm cream
  ['#f8f9fa', '#FAF7F0'],  // lowercase

  // GRADIENTS (the green gradient backgrounds)
  ['#f0f9ff', '#FAF7F0'],  // Blue tint → warm cream
  ['#fef7ed', '#F5F2EA'],  // Orange tint → warm light
  ['#D1FAE5', '#E8E4D8'],  // Success green bg → warm border
  ['#dcfce7', '#F0EDE4'],  // Light green → warm light

  // FOREGROUND/TEXT
  ['#171717', '#2C2C24'],  // Pure black → warm near-black

  // STATUS COLORS (keep functional but warm them up slightly)
  ['#059669', '#4A5E35'],  // Emerald → olive (success/active)

  // DISABLED STATE
  ['#94a3b8', '#A09E90'],  // Cool gray → warm gray

  // BADGE STAR
  ['#FFB300', '#C4622D'],  // Gold star → terracotta
]

// ============================================================
// FILES to process
// ============================================================

function findFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      findFiles(fullPath, files)
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts') || entry.name.endsWith('.css')) {
      files.push(fullPath)
    }
  }
  return files
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ============================================================
// MAIN
// ============================================================

console.log('Recoloring HeyFarmer palette...\n')

const files = findFiles(srcDir)
let totalChanges = 0
let filesChanged = 0

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf8')
  let fileChanges = 0

  for (const [oldHex, newHex] of HEX_REPLACEMENTS) {
    const regex = new RegExp(escapeRegex(oldHex), 'g')
    const matches = content.match(regex)
    if (matches) {
      content = content.replace(regex, newHex)
      fileChanges += matches.length
    }
  }

  if (fileChanges > 0) {
    fs.writeFileSync(filePath, content, 'utf8')
    const relPath = path.relative(path.join(__dirname, '..'), filePath)
    console.log(`  ${relPath}: ${fileChanges} replacements`)
    totalChanges += fileChanges
    filesChanged++
  }
}

console.log(`\nDone! ${totalChanges} color replacements across ${filesChanged} files.`)
