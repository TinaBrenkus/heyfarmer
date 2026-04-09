/**
 * Remove lucide-react icons that conflict with Phosphor icons.
 * When both libraries export the same name, keep the Phosphor one.
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

  // Find phosphor imports
  const phosphorMatch = content.match(/import\s*\{([^}]+)\}\s*from\s*'@phosphor-icons\/react'/)
  if (!phosphorMatch) continue

  const phosphorIcons = phosphorMatch[1].split(',').map(s => s.trim()).filter(Boolean)

  // Find lucide imports
  const lucideMatch = content.match(/import\s*\{([^}]+)\}\s*from\s*'lucide-react'/)
  if (!lucideMatch) continue

  const lucideIcons = lucideMatch[1].split(',').map(s => s.trim()).filter(Boolean)

  // Find conflicts
  const conflicts = lucideIcons.filter(icon => phosphorIcons.includes(icon))
  if (conflicts.length === 0) continue

  // Remove conflicting icons from lucide import
  const remainingLucide = lucideIcons.filter(icon => !conflicts.includes(icon))

  const relPath = path.relative(path.join(__dirname, '..'), filePath)
  console.log(`  ${relPath}: removing ${conflicts.join(', ')} from lucide (kept in Phosphor)`)

  if (remainingLucide.length === 0) {
    // Remove entire lucide import line
    content = content.replace(/import\s*\{[^}]+\}\s*from\s*'lucide-react'\n?/, '')
  } else {
    // Replace lucide import with remaining icons
    const oldImport = lucideMatch[0]
    const newImport = `import { ${remainingLucide.join(', ')} } from 'lucide-react'`
    content = content.replace(oldImport, newImport)
  }

  fs.writeFileSync(filePath, content, 'utf8')
  changed++
}

console.log(`\nDone! Fixed ${changed} files with duplicate imports.`)
