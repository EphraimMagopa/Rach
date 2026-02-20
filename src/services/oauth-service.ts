/**
 * Browser-compatible OAuth 2.0 + PKCE service for Anthropic.
 * Uses Web Crypto API (no Node.js crypto).
 * Mirrors the flow from Ravel's server/oauth.ts.
 */

const CLIENT_ID = '9d1c250a-e61b-44d9-88ed-5944d1962f5e';
const AUTHORIZATION_URL = 'https://claude.ai/oauth/authorize';
const TOKEN_URL = '/api/oauth/token'; // Proxied through Vite dev server to avoid CORS
const REDIRECT_URI = 'https://console.anthropic.com/oauth/code/callback';
const SCOPES = 'org:create_api_key user:profile user:inference';

export interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp in milliseconds
}

export interface PKCEChallenge {
  codeVerifier: string;
  codeChallenge: string;
}

function base64urlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Generate PKCE challenge using Web Crypto API.
 */
export async function generatePKCE(): Promise<PKCEChallenge> {
  // Generate code verifier (43-128 chars, base64url-encoded random bytes)
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  const codeVerifier = base64urlEncode(randomBytes.buffer);

  // Generate code challenge (SHA-256 hash of verifier, base64url-encoded)
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const codeChallenge = base64urlEncode(hash);

  return { codeVerifier, codeChallenge };
}

/**
 * Generate the authorization URL for the OAuth flow.
 */
export function getAuthorizationURL(codeChallenge: string, codeVerifier: string): string {
  const url = new URL(AUTHORIZATION_URL);
  url.searchParams.set('code', 'true');
  url.searchParams.set('client_id', CLIENT_ID);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('redirect_uri', REDIRECT_URI);
  url.searchParams.set('scope', SCOPES);
  url.searchParams.set('code_challenge_method', 'S256');
  url.searchParams.set('code_challenge', codeChallenge);
  url.searchParams.set('state', codeVerifier); // Use verifier as state for CSRF protection

  return url.toString();
}

/**
 * Exchange authorization code for tokens.
 * The response format from Claude is: code#state
 */
export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
): Promise<OAuthTokens> {
  // Split code and state (format: code#state)
  const splits = code.split('#');
  const authCode = splits[0];
  const state = splits[1] || codeVerifier;

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code: authCode,
      state,
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to exchange code for tokens: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

/**
 * Refresh access token using refresh token.
 */
export async function refreshAccessToken(refreshToken: string): Promise<OAuthTokens> {
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to refresh token: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

/**
 * Check if token is expired or will expire soon (within 5 minutes).
 */
export function isTokenExpired(expiresAt: number): boolean {
  const fiveMinutes = 5 * 60 * 1000;
  return Date.now() >= expiresAt - fiveMinutes;
}
