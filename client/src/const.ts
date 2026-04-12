export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const OAUTH_MISSING_PATH = "/login?auth=missing";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL?.trim();
  const appId = import.meta.env.VITE_APP_ID?.trim();

  // In production, missing OAuth vars should not crash the app.
  if (!oauthPortalUrl || !appId) {
    return OAUTH_MISSING_PATH;
  }

  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  let url: URL;
  try {
    url = new URL(`${oauthPortalUrl}/app-auth`);
  } catch {
    return OAUTH_MISSING_PATH;
  }

  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
