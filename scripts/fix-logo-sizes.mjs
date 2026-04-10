/**
 * Fix FarmLogo sizes — the PNG wordmark needs larger dimensions
 * because the text occupies ~50% of the square image area.
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

const SIZE_MAP = {
  // FarmLogo (wordmark) — needs to be large since text is ~50% of image
  'FarmLogo size={36}': 'FarmLogo size={140}',
  'FarmLogo size={48}': 'FarmLogo size={160}',
  'FarmLogo size={64}': 'FarmLogo size={180}',
  'FarmLogo size={80}': 'FarmLogo size={200}',
  'FarmLogo size={120}': 'FarmLogo size={280}',
  'FarmLogo size={20}': 'FarmLogo size={80}',    // messages avatar
  'FarmLogo className="h-8 w-8"': 'FarmLogo size={160}',  // admin stats
}

const files = findFiles(srcDir)
let changed = 0

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf8')
  const relPath = path.relative(path.join(__dirname, '..'), filePath)
  let modified = false

  if (path.basename(filePath) === 'FarmLogo.tsx') continue

  for (const [old, replacement] of Object.entries(SIZE_MAP)) {
    if (content.includes(old)) {
      content = content.replaceAll(old, replacement)
      modified = true
    }
  }

  // Also clean up any remaining style/className on FarmLogo that don't apply to PNG
  content = content.replace(/<FarmLogo([^/]*) style=\{\{[^}]*\}\}/g, '<FarmLogo$1')
  content = content.replace(/<FarmLogo([^/]*) className="[^"]*"/g, '<FarmLogo$1')

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8')
    console.log(`  Fixed: ${relPath}`)
    changed++
  }
}

console.log(`\nDone! Fixed ${changed} files.`)
