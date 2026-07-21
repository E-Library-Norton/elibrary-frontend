const AUTH_REDIRECT_BASE = "https://elibrary.local";

export const OAUTH_RETURN_PATH_KEY = "elibrary.oauth.return-path";

/**
 * Accept only same-site paths before using a query parameter as a redirect.
 * This prevents authentication links from becoming open redirects.
 */
export function getSafeAuthRedirect(value: string | null, fallback = "/") {
  if (!value) return fallback;

  try {
    const url = new URL(value, AUTH_REDIRECT_BASE);

    if (url.origin !== AUTH_REDIRECT_BASE) return fallback;

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export function withAuthRedirect(authPath: string, returnPath: string) {
  const safeReturnPath = getSafeAuthRedirect(returnPath);

  if (safeReturnPath === "/") return authPath;

  const separator = authPath.includes("?") ? "&" : "?";
  return `${authPath}${separator}next=${encodeURIComponent(safeReturnPath)}`;
}

export function rememberOAuthReturnPath(returnPath: string) {
  const safeReturnPath = getSafeAuthRedirect(returnPath);

  try {
    if (safeReturnPath === "/") {
      sessionStorage.removeItem(OAUTH_RETURN_PATH_KEY);
    } else {
      sessionStorage.setItem(OAUTH_RETURN_PATH_KEY, safeReturnPath);
    }
  } catch {
    // Social sign-in still works if browser storage is unavailable.
  }
}

export function consumeOAuthReturnPath() {
  try {
    const returnPath = sessionStorage.getItem(OAUTH_RETURN_PATH_KEY);
    sessionStorage.removeItem(OAUTH_RETURN_PATH_KEY);
    return getSafeAuthRedirect(returnPath);
  } catch {
    return "/";
  }
}

export function clearOAuthReturnPath() {
  try {
    sessionStorage.removeItem(OAUTH_RETURN_PATH_KEY);
  } catch {
    // Nothing to clear if browser storage is unavailable.
  }
}
