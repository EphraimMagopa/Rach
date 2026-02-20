#!/usr/bin/env tsx
/**
 * Download Demucs v4 ONNX model for stem separation.
 * Usage: pnpm run download-models
 */

import { createWriteStream, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { get } from 'https'

const MODELS_DIR = join(process.cwd(), 'resources', 'models')

const MODELS = [
  {
    name: 'demucs_v4_hq.onnx',
    // This is a placeholder URL — replace with actual model hosting URL
    url: 'https://huggingface.co/Eithan/Demucs-v4/resolve/main/demucs_v4_hq.onnx',
    size: '~80MB',
  },
]

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest)
    let totalBytes = 0
    let downloadedBytes = 0

    const request = (downloadUrl: string): void => {
      get(downloadUrl, (response) => {
        // Handle redirects
        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location
          if (redirectUrl) {
            request(redirectUrl)
            return
          }
        }

        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}: Failed to download from ${downloadUrl}`))
          return
        }

        totalBytes = parseInt(response.headers['content-length'] || '0', 10)

        response.on('data', (chunk: Buffer) => {
          downloadedBytes += chunk.length
          file.write(chunk)
          if (totalBytes > 0) {
            const pct = ((downloadedBytes / totalBytes) * 100).toFixed(1)
            process.stdout.write(`\r  Progress: ${pct}% (${(downloadedBytes / 1024 / 1024).toFixed(1)} MB)`)
          }
        })

        response.on('end', () => {
          file.end()
          console.log('')
          resolve()
        })

        response.on('error', reject)
      }).on('error', reject)
    }

    request(url)
  })
}

async function main(): Promise<void> {
  console.log('Rach DAW — Model Download\n')

  if (!existsSync(MODELS_DIR)) {
    mkdirSync(MODELS_DIR, { recursive: true })
  }

  for (const model of MODELS) {
    const dest = join(MODELS_DIR, model.name)

    if (existsSync(dest)) {
      console.log(`  ${model.name} already exists, skipping.`)
      continue
    }

    console.log(`  Downloading ${model.name} (${model.size})...`)
    console.log(`  From: ${model.url}`)

    try {
      await downloadFile(model.url, dest)
      console.log(`  Saved to: ${dest}\n`)
    } catch (err) {
      console.error(`  Failed to download ${model.name}: ${(err as Error).message}`)
      console.error(`  You may need to download manually from: ${model.url}`)
      console.error(`  Place the file at: ${dest}\n`)
    }
  }

  console.log('Done.')
}

main().catch(console.error)
