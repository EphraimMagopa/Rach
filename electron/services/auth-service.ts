/**
 * OAuth 2.0 + PKCE authentication service skeleton.
 * Will use Electron safeStorage for token encryption.
 */
export class AuthService {
  private clientId: string
  private redirectUri: string
  private authEndpoint: string
  private tokenEndpoint: string

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
}
