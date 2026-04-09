/**
 * Revert individual CSR imports back to barrel imports from @phosphor-icons/react
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

  // Find all individual phosphor imports
  const iconRegex = /import\s*\{\s*(\w+)\s*\}\s*from\s*'@phosphor-icons\/react\/dist\/csr\/\w+\.es\.js'/g
  const icons = []
  let match

  while ((match = iconRegex.exec(content)) !== null) {
    icons.push(match[1])
  }

  if (icons.length === 0) continue

  // Remove all individual imports
  content = content.replace(/import\s*\{\s*\w+\s*\}\s*from\s*'@phosphor-icons\/react\/dist\/csr\/\w+\.es\.js'\n?/g, '')

  // Add single barrel import
  const uniqueIcons = [...new Set(icons)].sort()
  const barrelImport = `import { ${uniqueIcons.join(', ')} } from '@phosphor-icons/react'`

  // Find the right place to insert (after last import)
  const lastImportIdx = content.lastIndexOf('\nimport ')
  if (lastImportIdx !== -1) {
    const endOfImportLine = content.indexOf('\n', lastImportIdx + 1)
    content = content.slice(0, endOfImportLine + 1) + barrelImport + '\n' + content.slice(endOfImportLine + 1)
  } else {
    content = barrelImport + '\n' + content
  }

  // Clean up any double newlines from removed imports
  content = content.replace(/\n{3,}/g, '\n\n')

  fs.writeFileSync(filePath, content, 'utf8')
  const relPath = path.relative(path.join(__dirname, '..'), filePath)
  console.log(`  Fixed: ${relPath} (${uniqueIcons.length} icons)`)
  changed++
}

console.log(`\nDone! Reverted ${changed} files to barrel imports.`)
