import { safeStorage, shell, BrowserWindow } from 'electron'

/**
 * OAuth 2.0 + PKCE authentication service.
 * Uses Electron safeStorage for token encryption.
 */
export class AuthService {
  private clientId: string
  private redirectUri: string
  private authEndpoint: string
  private tokenEndpoint: string
  private codeVerifier: string | null = null
  private encryptedAccessToken: Buffer | null = null
  private encryptedRefreshToken: Buffer | null = null
  private expiresAt: number | null = null
  private refreshTimer: ReturnType<typeof setTimeout> | null = null

  constructor() {
    this.clientId = process.env.ANTHROPIC_CLIENT_ID ?? ''
    this.redirectUri = process.env.ANTHROPIC_REDIRECT_URI ?? 'rach://oauth/callback'
    this.authEndpoint =
      process.env.ANTHROPIC_AUTH_ENDPOINT ?? 'https://auth.anthropic.com/oauth/authorize'
    this.tokenEndpoint =
      process.env.ANTHROPIC_TOKEN_ENDPOINT ?? 'https://auth.anthropic.com/oauth/token'
  }

  generateCodeVerifier(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Buffer.from(array).toString('base64url')
  }

  async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(verifier)
    const hash = await crypto.subtle.digest('SHA-256', data)
    return Buffer.from(hash).toString('base64url')
  }

  getAuthorizationUrl(codeChallenge: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      scope: 'model.opus model.sonnet agent.execute'
    })
    return `${this.authEndpoint}?${params.toString()}`
  }

  /** Start the OAuth flow — opens browser for user to authenticate. */
  async startAuthFlow(): Promise<void> {
    this.codeVerifier = this.generateCodeVerifier()
    const codeChallenge = await this.generateCodeChallenge(this.codeVerifier)
    const authUrl = this.getAuthorizationUrl(codeChallenge)
    await shell.openExternal(authUrl)
  }

  /** Handle the OAuth callback from the custom protocol. */
  async handleCallback(url: string): Promise<{
    accessToken: string
    refreshToken: string
    expiresAt: number
  }> {
    const urlObj = new URL(url)
    const code = urlObj.searchParams.get('code')
    if (!code) throw new Error('No authorization code in callback')
    if (!this.codeVerifier) throw new Error('No code verifier — start auth flow first')

    const tokens = await this.exchangeCode(code, this.codeVerifier)
    this.codeVerifier = null

    // Encrypt tokens
    if (safeStorage.isEncryptionAvailable()) {
      this.encryptedAccessToken = safeStorage.encryptString(tokens.accessToken)
      this.encryptedRefreshToken = safeStorage.encryptString(tokens.refreshToken)
    }

    this.expiresAt = Date.now() + tokens.expiresIn * 1000
    this.scheduleRefresh(tokens.expiresIn)

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: this.expiresAt
    }
  }

  async exchangeCode(
    code: string,
    codeVerifier: string
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri,
        client_id: this.clientId,
        code_verifier: codeVerifier
      })
    })

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.status}`)
    }

    const data = await response.json()
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in
    }
  }

  async refreshTokens(): Promise<{
    accessToken: string
    refreshToken: string
    expiresAt: number
  } | null> {
    if (!this.encryptedRefreshToken || !safeStorage.isEncryptionAvailable()) {
      return null
    }

    const refreshToken = safeStorage.decryptString(this.encryptedRefreshToken)

    try {
      const response = await fetch(this.tokenEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: this.clientId
        })
      })

      if (!response.ok) return null

      const data = await response.json()
      const newAccessToken = data.access_token as string
      const newRefreshToken = (data.refresh_token as string) || refreshToken
      const expiresIn = data.expires_in as number

      this.encryptedAccessToken = safeStorage.encryptString(newAccessToken)
      this.encryptedRefreshToken = safeStorage.encryptString(newRefreshToken)
      this.expiresAt = Date.now() + expiresIn * 1000
      this.scheduleRefresh(expiresIn)

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresAt: this.expiresAt
      }
    } catch {
      return null
    }
  }

  getAccessToken(): string | null {
    if (!this.encryptedAccessToken || !safeStorage.isEncryptionAvailable()) {
      return null
    }
    return safeStorage.decryptString(this.encryptedAccessToken)
  }

  isAuthenticated(): boolean {
    return this.encryptedAccessToken !== null && (this.expiresAt ?? 0) > Date.now()
  }

  logout(): void {
    this.encryptedAccessToken = null
    this.encryptedRefreshToken = null
    this.expiresAt = null
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }
  }

  private scheduleRefresh(expiresIn: number): void {
    if (this.refreshTimer) clearTimeout(this.refreshTimer)
    // Refresh 5 minutes before expiry
    const refreshIn = Math.max(0, (expiresIn - 300)) * 1000
    this.refreshTimer = setTimeout(() => this.refreshTokens(), refreshIn)
  }

  /** Notify the renderer of auth state changes. */
  notifyRenderer(window: BrowserWindow, event: string, data: unknown): void {
    window.webContents.send(event, data)
  }
}
