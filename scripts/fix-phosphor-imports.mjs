/**
 * Fix Phosphor imports to use individual file imports instead of barrel imports.
 * This fixes Turbopack build errors.
 * Run with: node scripts/fix-phosphor-imports.mjs
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
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      files.push(fullPath)
    }
  }
  return files
}

let changed = 0
const files = findFiles(srcDir)

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf8')

  // Match: import { Icon1, Icon2, ... } from '@phosphor-icons/react'
  const importRegex = /import\s*\{([^}]+)\}\s*from\s*['"]@phosphor-icons\/react['"]/g
  const match = importRegex.exec(content)

  if (!match) continue

  const icons = match[1].split(',').map(s => s.trim()).filter(Boolean)
  const originalImport = match[0]

  // Replace with individual imports
  const newImports = icons.map(icon =>
    `import { ${icon} } from '@phosphor-icons/react/dist/ssr/${icon}.es.js'`
  ).join('\n')

  content = content.replace(originalImport, newImports)

  fs.writeFileSync(filePath, content, 'utf8')
  const relPath = path.relative(path.join(__dirname, '..'), filePath)
  console.log(`  Fixed: ${relPath} (${icons.length} icons)`)
  changed++
}

console.log(`\nDone! Fixed ${changed} files.`)
