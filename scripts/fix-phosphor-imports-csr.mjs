/**
 * Fix Phosphor imports to use CSR paths for client components.
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
  let modified = false

  // Replace SSR imports with CSR imports
  const ssrRegex = /import\s*\{\s*(\w+)\s*\}\s*from\s*'@phosphor-icons\/react\/dist\/ssr\/\w+\.es\.js'/g
  let match
  while ((match = ssrRegex.exec(content)) !== null) {
    const iconName = match[1]
    const oldImport = match[0]
    const newImport = `import { ${iconName} } from '@phosphor-icons/react/dist/csr/${iconName}.es.js'`
    content = content.replace(oldImport, newImport)
    modified = true
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8')
    const relPath = path.relative(path.join(__dirname, '..'), filePath)
    console.log(`  Fixed: ${relPath}`)
    changed++
  }
}

console.log(`\nDone! Fixed ${changed} files.`)
