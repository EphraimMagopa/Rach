/**
 * SunoImporter — Downloads audio from Suno AI URLs.
 * Runs in Electron main process.
 */

import { join } from 'path'
import { createWriteStream } from 'fs'
import { mkdir } from 'fs/promises'
import { app, BrowserWindow } from 'electron'
import { get } from 'https'
import { get as httpGet } from 'http'

export interface SunoImportResult {
  audioPath: string
  metadata: {
    title: string
    duration: number | null
    sourceUrl: string
  }
}

export class SunoImporter {
  private getDownloadDir(): string {
    const userDataPath = app?.getPath?.('userData') || join(process.cwd(), '.rach-data')
    return join(userDataPath, 'suno-imports')
  }

  async importFromUrl(
    url: string,
    window?: BrowserWindow | null
  ): Promise<SunoImportResult> {
    // Validate URL
    if (!url.includes('suno')) {
      throw new Error('Invalid Suno URL. Please provide a valid Suno song URL.')
    }

    const downloadDir = this.getDownloadDir()
    await mkdir(downloadDir, { recursive: true })

    window?.webContents.send('suno:progress', { stage: 'Fetching metadata', percent: 10 })

    // Extract song ID from URL
    const songId = this.extractSongId(url)
    const title = `Suno Import ${songId}`

    window?.webContents.send('suno:progress', { stage: 'Downloading audio', percent: 30 })

    // Try to download the audio
    // Suno typically serves audio at a CDN URL derived from the song page
    const audioUrl = await this.resolveAudioUrl(url)
    const fileName = `${songId}.mp3`
    const audioPath = join(downloadDir, fileName)

    await this.downloadFile(audioUrl, audioPath, (pct) => {
      window?.webContents.send('suno:progress', {
        stage: 'Downloading audio',
        percent: 30 + Math.floor(pct * 60),
      })
    })

    window?.webContents.send('suno:progress', { stage: 'Complete', percent: 100 })

    return {
      audioPath,
      metadata: {
        title,
        duration: null,
        sourceUrl: url,
      },
    }
  }

  private extractSongId(url: string): string {
    // Handle various Suno URL formats:
    // https://suno.com/song/abc123
    // https://app.suno.ai/song/abc123
    const match = url.match(/(?:song|track)[/]([a-zA-Z0-9-]+)/)
    if (match) return match[1]

    // Fallback: use last path segment
    const parts = url.split('/').filter(Boolean)
    return parts[parts.length - 1] || `import-${Date.now()}`
  }

  private async resolveAudioUrl(pageUrl: string): Promise<string> {
    // Try to fetch the page and extract the audio URL from meta tags
    return new Promise((resolve, reject) => {
      const request = pageUrl.startsWith('http:') ? httpGet : get

      request(pageUrl, { headers: { 'User-Agent': 'Rach-DAW/0.1' } }, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirect = response.headers.location
          if (redirect) {
            this.resolveAudioUrl(redirect).then(resolve).catch(reject)
            return
          }
        }

        let body = ''
        response.on('data', (chunk: Buffer) => { body += chunk.toString() })
        response.on('end', () => {
          // Try to find audio URL in og:audio or twitter:player:stream meta tags
          const audioMatch = body.match(
            /(?:og:audio|twitter:player:stream)['"]\s*content=['"](https?:\/\/[^'"]+\.(?:mp3|wav|m4a|ogg)[^'"]*)['"]/i
          )
          if (audioMatch) {
            resolve(audioMatch[1])
            return
          }

          // Try to find any CDN audio URL in the page
          const cdnMatch = body.match(
            /(https?:\/\/cdn[^'"]*\.(?:mp3|wav|m4a|ogg)[^'"]*)/i
          )
          if (cdnMatch) {
            resolve(cdnMatch[1])
            return
          }

          // Fallback: construct a probable CDN URL from the song ID
          const songId = this.extractSongId(pageUrl)
          resolve(`https://cdn1.suno.ai/${songId}.mp3`)
        })
        response.on('error', reject)
      }).on('error', reject)
    })
  }

  private downloadFile(
    url: string,
    dest: string,
    onProgress?: (pct: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const file = createWriteStream(dest)
      let totalBytes = 0
      let downloadedBytes = 0

      const doRequest = (downloadUrl: string): void => {
        const request = downloadUrl.startsWith('http:') ? httpGet : get

        request(downloadUrl, (response) => {
          if (response.statusCode === 301 || response.statusCode === 302) {
            const redirect = response.headers.location
            if (redirect) {
              doRequest(redirect)
              return
            }
          }

          if (response.statusCode !== 200) {
            reject(new Error(`Failed to download: HTTP ${response.statusCode}`))
            return
          }

          totalBytes = parseInt(response.headers['content-length'] || '0', 10)

          response.on('data', (chunk: Buffer) => {
            downloadedBytes += chunk.length
            file.write(chunk)
            if (totalBytes > 0) {
              onProgress?.(downloadedBytes / totalBytes)
            }
          })

          response.on('end', () => {
            file.end()
            resolve()
          })

          response.on('error', reject)
        }).on('error', reject)
      }

      doRequest(url)
    })
  }
}
