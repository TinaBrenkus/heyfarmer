/**
 * Replace Tailwind green/blue/orange color classes with earthy palette equivalents.
 * Run with: node scripts/recolor-tailwind-classes.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.join(__dirname, '..', 'src')

// Class replacements: old class substring → new class substring
const CLASS_REPLACEMENTS = [
  // GREEN → OLIVE/SAGE (primary brand)
  ['bg-green-700', 'bg-farm-green-800'],
  ['bg-green-600', 'bg-farm-green-800'],
  ['bg-green-500', 'bg-farm-green-500'],
  ['bg-green-400', 'bg-farm-green-400'],
  ['bg-green-300', 'bg-farm-green-300'],
  ['bg-green-200', 'bg-farm-green-200'],
  ['bg-green-100', 'bg-farm-green-100'],
  ['bg-green-50', 'bg-farm-green-50'],

  ['text-green-800', 'text-farm-green-900'],
  ['text-green-700', 'text-farm-green-800'],
  ['text-green-600', 'text-farm-green-800'],
  ['text-green-500', 'text-farm-green-500'],
  ['text-green-400', 'text-farm-green-400'],
  ['text-green-200', 'text-farm-green-200'],
  ['text-green-100', 'text-farm-green-100'],

  ['border-green-600', 'border-farm-green-800'],
  ['border-green-500', 'border-farm-green-500'],
  ['border-green-400', 'border-farm-green-400'],
  ['border-green-300', 'border-farm-green-300'],
  ['border-green-200', 'border-warm-border'],
  ['border-green-100', 'border-warm-border'],

  ['hover:bg-green-700', 'hover:bg-farm-green-900'],
  ['hover:bg-green-600', 'hover:bg-farm-green-800'],
  ['hover:bg-green-500', 'hover:bg-farm-green-500'],
  ['hover:bg-green-50', 'hover:bg-farm-green-50'],

  ['hover:text-green-700', 'hover:text-farm-green-900'],
  ['hover:text-green-600', 'hover:text-farm-green-800'],

  ['hover:border-green-300', 'hover:border-farm-green-300'],

  ['ring-green-500', 'ring-farm-green-500'],
  ['ring-green-600', 'ring-farm-green-800'],

  ['focus:ring-green-500', 'focus:ring-farm-green-500'],
  ['focus:ring-green-600', 'focus:ring-farm-green-800'],
  ['focus:border-green-500', 'focus:border-farm-green-500'],

  ['from-green-600', 'from-farm-green-800'],
  ['to-green-700', 'to-farm-green-900'],
  ['from-green-50', 'from-farm-green-50'],

  // ORANGE → TERRA (accent/CTA)
  ['bg-orange-50', 'bg-terra-50'],
  ['bg-orange-100', 'bg-terra-100'],
  ['bg-orange-400', 'bg-terra-400'],
  ['bg-orange-500', 'bg-terra-500'],
  ['bg-orange-600', 'bg-terra-600'],

  ['text-orange-800', 'text-terra-800'],
  ['text-orange-700', 'text-terra-700'],
  ['text-orange-600', 'text-terra-600'],
  ['text-orange-500', 'text-terra-500'],
  ['text-orange-400', 'text-terra-400'],

  ['border-orange-400', 'border-terra-400'],
  ['border-orange-200', 'border-terra-200'],
  ['border-orange-100', 'border-terra-100'],

  ['hover:bg-orange-50', 'hover:bg-terra-50'],
  ['hover:bg-orange-600', 'hover:bg-terra-700'],

  ['hover:text-orange-600', 'hover:text-terra-600'],

  // BLUE → TERRA (secondary action)
  ['bg-blue-50', 'bg-terra-50'],
  ['bg-blue-100', 'bg-terra-100'],
  ['bg-blue-600', 'bg-terra-600'],

  ['text-blue-800', 'text-terra-800'],
  ['text-blue-700', 'text-terra-700'],
  ['text-blue-600', 'text-terra-600'],
  ['text-blue-500', 'text-terra-500'],
  ['text-blue-400', 'text-terra-400'],

  ['border-blue-200', 'border-terra-200'],
  ['border-blue-100', 'border-terra-100'],
  ['border-blue-400', 'border-terra-400'],

  ['hover:bg-blue-50', 'hover:bg-terra-50'],

  // GRAY → WARM SOIL TONES
  ['bg-gray-50', 'bg-soil-50'],
  ['bg-gray-100', 'bg-soil-100'],
  ['bg-gray-200', 'bg-soil-200'],

  ['text-gray-900', 'text-soil-800'],
  ['text-gray-800', 'text-soil-800'],
  ['text-gray-700', 'text-soil-700'],
  ['text-gray-600', 'text-soil-500'],
  ['text-gray-500', 'text-soil-400'],
  ['text-gray-400', 'text-soil-400'],

  ['border-gray-300', 'border-warm-border'],
  ['border-gray-200', 'border-warm-border'],
  ['border-gray-100', 'border-warm-border'],

  ['hover:bg-gray-50', 'hover:bg-soil-50'],
  ['hover:bg-gray-100', 'hover:bg-soil-100'],
  ['hover:bg-gray-200', 'hover:bg-soil-200'],

  ['hover:text-gray-900', 'hover:text-soil-800'],
  ['hover:text-gray-800', 'hover:text-soil-800'],

  ['focus:ring-gray-500', 'focus:ring-soil-400'],
  ['focus:border-gray-300', 'focus:border-warm-border'],

  // RED → Keep for errors but warm up
  ['bg-red-50', 'bg-red-50'],  // keep
  ['text-red-600', 'text-red-600'],  // keep
  ['text-red-500', 'text-red-500'],  // keep
  ['border-red-200', 'border-red-200'],  // keep
]

function findFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      findFiles(fullPath, files)
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      files.push(fullPath)
    }
  }
  return files
}

console.log('Replacing Tailwind color classes...\n')

const files = findFiles(srcDir)
let totalChanges = 0
let filesChanged = 0

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf8')
  let fileChanges = 0

  for (const [oldClass, newClass] of CLASS_REPLACEMENTS) {
    if (oldClass === newClass) continue  // skip no-ops (like red → red)

    // Use word boundary matching to avoid partial replacements
    // e.g., don't replace "green-600" inside "bg-green-6000"
    const regex = new RegExp(oldClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![0-9])', 'g')
    const matches = content.match(regex)
    if (matches) {
      content = content.replace(regex, newClass)
      fileChanges += matches.length
    }
  }

  if (fileChanges > 0) {
    fs.writeFileSync(filePath, content, 'utf8')
    const relPath = path.relative(path.join(__dirname, '..'), filePath)
    console.log(`  ${relPath}: ${fileChanges} class replacements`)
    totalChanges += fileChanges
    filesChanged++
  }
}

console.log(`\nDone! ${totalChanges} Tailwind class replacements across ${filesChanged} files.`)
