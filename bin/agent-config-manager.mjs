#!/usr/bin/env node
/**
 * Agent Config Manager CLI
 * Serves the built app and opens it in the browser
 */

import { createServer } from 'http'
import { readFile, stat } from 'fs/promises'
import { join, extname, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createReadStream } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = join(__dirname, '..', 'dist')

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
}

const DEFAULT_PORT = 5173

async function serveFile(filePath, res) {
  try {
    await stat(filePath)
    const ext = extname(filePath)
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'
    res.writeHead(200, { 'Content-Type': contentType })
    createReadStream(filePath).pipe(res)
  } catch {
    // Fall back to index.html for SPA routing
    const indexPath = join(distDir, 'index.html')
    res.writeHead(200, { 'Content-Type': 'text/html' })
    createReadStream(indexPath).pipe(res)
  }
}

async function checkDist() {
  try {
    await stat(join(distDir, 'index.html'))
    return true
  } catch {
    return false
  }
}

async function openBrowser(url) {
  const { platform } = process
  const { exec } = await import('child_process')
  const command =
    platform === 'darwin' ? 'open' : platform === 'win32' ? 'start' : 'xdg-open'
  exec(`${command} ${url}`)
}

async function main() {
  const hasDist = await checkDist()
  if (!hasDist) {
    console.error(
      '❌  No built app found. The dist/ directory is missing.\n' +
        '   If you installed from npm, this is a packaging issue.\n' +
        '   If you cloned the repo, run: bun run build'
    )
    process.exit(1)
  }

  const port = parseInt(process.env.PORT || String(DEFAULT_PORT), 10)

  const server = createServer(async (req, res) => {
    const urlPath = req.url === '/' ? '/index.html' : req.url ?? '/index.html'
    const filePath = join(distDir, urlPath.split('?')[0])
    await serveFile(filePath, res)
  })

  server.listen(port, '127.0.0.1', async () => {
    const url = `http://localhost:${port}`
    console.log(`\n🚀  Agent Config Manager`)
    console.log(`   Running at ${url}\n`)
    console.log('   Press Ctrl+C to stop.\n')
    await openBrowser(url)
  })

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌  Port ${port} is already in use. Set PORT env var to use a different port.`)
    } else {
      console.error('❌  Server error:', err.message)
    }
    process.exit(1)
  })
}

main()
