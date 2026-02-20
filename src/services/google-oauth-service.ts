/**
 * Google OAuth 2.0 + PKCE service for browser mode.
 * Uses the Antigravity/OpenClaw client credentials to authenticate
 * with Google and obtain tokens usable with the Gemini API.
 */

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:51121/oauth-callback';
const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = '/api/google/token'; // Proxied via Vite dev server to avoid CORS
const SCOPES =
  'https://www.googleapis.com/auth/cloud-platform openid https://www.googleapis.com/auth/userinfo.email';

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
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  const codeVerifier = base64urlEncode(randomBytes.buffer);

  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const codeChallenge = base64urlEncode(hash);

  return { codeVerifier, codeChallenge };
}

/**
 * Generate the Google OAuth authorization URL.
 * Uses PKCE + offline access to get a refresh token.
 */
export function getGoogleAuthURL(codeChallenge: string, state: string): string {
  const url = new URL(AUTH_URL);
  url.searchParams.set('client_id', CLIENT_ID);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('redirect_uri', REDIRECT_URI);
  url.searchParams.set('scope', SCOPES);
  url.searchParams.set('code_challenge_method', 'S256');
  url.searchParams.set('code_challenge', codeChallenge);
  url.searchParams.set('state', state);
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('prompt', 'consent');

  return url.toString();
}

/**
 * Parse the callback URL pasted by the user.
 * Google redirects to localhost:51121/oauth-callback?code=...&state=...
 * Since nothing listens there, the user copies the full URL from the error page.
 */
export function parseCallbackURL(
  input: string,
  expectedState: string
): { code: string; state: string } {
  const trimmed = input.trim();

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error('Invalid URL. Please paste the full redirect URL from the browser address bar.');
  }

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code) {
    throw new Error('No authorization code found in the URL.');
  }
  if (!state || state !== expectedState) {
    throw new Error('State mismatch — possible CSRF. Please try signing in again.');
  }

  return { code, state };
}

/**
 * Exchange authorization code for tokens via Google's token endpoint.
 */
export async function exchangeGoogleCode(
  code: string,
  codeVerifier: string
): Promise<OAuthTokens> {
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to exchange code: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

/**
 * Refresh access token using a refresh token.
 */
export async function refreshGoogleToken(refreshToken: string): Promise<OAuthTokens> {
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to refresh token: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    // Google may not return a new refresh token on refresh; keep the old one
    refreshToken: data.refresh_token || refreshToken,
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
