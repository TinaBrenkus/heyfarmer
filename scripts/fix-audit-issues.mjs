/**
 * Fix all visual audit issues:
 * 1. Old Tailwind green hex values in map components
 * 2. Wrong hover colors (blue → terra)
 * 3. Wrong focus ring colors (blue → farm-green)
 * 4. Stray blue colors
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
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts') || entry.name.endsWith('.css')) {
      files.push(fullPath)
    }
  }
  return files
}

// All replacements
const REPLACEMENTS = [
  // Old Tailwind green hex values → earthy equivalents
  ['#22c55e', '#6B7F4A'],  // green-500 → sage
  ['#22C55E', '#6B7F4A'],
  ['#16a34a', '#4A5E35'],  // green-600 → olive
  ['#16A34A', '#4A5E35'],
  ['#dcfce7', '#F0EDE4'],  // green-100 → warm light

  // Wrong hover colors
  ['hover:bg-blue-700', 'hover:bg-terra-700'],
  ['hover:bg-blue-600', 'hover:bg-terra-600'],
  ['hover:bg-blue-500', 'hover:bg-terra-500'],
  ['hover:text-blue-700', 'hover:text-terra-700'],
  ['hover:text-blue-600', 'hover:text-terra-600'],

  // Wrong focus ring colors
  ['focus:ring-blue-500', 'focus:ring-farm-green-500'],
  ['focus:ring-blue-600', 'focus:ring-farm-green-800'],
  ['focus:border-blue-500', 'focus:border-farm-green-500'],

  // Stray blue classes
  ['bg-blue-500', 'bg-terra-500'],
  ['bg-blue-600', 'bg-terra-600'],
  ['bg-blue-700', 'bg-terra-700'],
  ['bg-blue-100', 'bg-terra-100'],
  ['bg-blue-50', 'bg-terra-50'],
  ['text-blue-900', 'text-soil-800'],
  ['text-blue-800', 'text-terra-800'],
  ['text-blue-700', 'text-terra-700'],
  ['text-blue-600', 'text-terra-600'],
  ['text-blue-500', 'text-terra-500'],
  ['border-blue-500', 'border-terra-500'],
  ['border-blue-400', 'border-terra-400'],
  ['border-blue-300', 'border-terra-300'],
  ['border-blue-200', 'border-terra-200'],
]

const files = findFiles(srcDir)
let totalChanges = 0
let filesChanged = 0

for (const filePath of files) {
  // Skip useWeather.ts
  if (path.basename(filePath) === 'useWeather.ts') continue

  let content = fs.readFileSync(filePath, 'utf8')
  let fileChanges = 0

  for (const [old, replacement] of REPLACEMENTS) {
    const escaped = old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // For class names, ensure we don't match partial (e.g. don't match blue-500 inside blue-5000)
    const regex = new RegExp(escaped + '(?![0-9a-zA-Z])', 'g')
    const matches = content.match(regex)
    if (matches) {
      content = content.replace(regex, replacement)
      fileChanges += matches.length
    }
  }

  if (fileChanges > 0) {
    fs.writeFileSync(filePath, content, 'utf8')
    const relPath = path.relative(path.join(__dirname, '..'), filePath)
    console.log(`  ${relPath}: ${fileChanges} fixes`)
    totalChanges += fileChanges
    filesChanged++
  }
}

console.log(`\nDone! ${totalChanges} fixes across ${filesChanged} files.`)
