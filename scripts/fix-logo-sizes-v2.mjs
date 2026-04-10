/**
 * Fix FarmLogo sizes after cropping whitespace from PNG.
 * The image is now 5554x2345 (2.37:1 ratio), so size=width.
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

// New sizes: size = width of the wordmark
const SIZE_MAP = {
  'FarmLogo size={280}': 'FarmLogo size={220}',   // Hero — large and prominent
  'FarmLogo size={200}': 'FarmLogo size={180}',   // Auth pages
  'FarmLogo size={180}': 'FarmLogo size={160}',   // Auth forms
  'FarmLogo size={160}': 'FarmLogo size={140}',   // Admin stats
  'FarmLogo size={140}': 'FarmLogo size={120}',   // Info page headers
  'FarmLogo size={80}': 'FarmLogo size={60}',     // Message avatars (still small)
}

const files = findFiles(srcDir)
let changed = 0

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf8')
  if (path.basename(filePath) === 'FarmLogo.tsx') continue
  let modified = false

  for (const [old, replacement] of Object.entries(SIZE_MAP)) {
    if (content.includes(old)) {
      content = content.replaceAll(old, replacement)
      modified = true
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8')
    const relPath = path.relative(path.join(__dirname, '..'), filePath)
    console.log(`  Fixed: ${relPath}`)
    changed++
  }
}

console.log(`\nDone! Fixed ${changed} files.`)
