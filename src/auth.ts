//utilisé dans api.ts
export const AUTH_TOKEN_KEY = "TDLOG_AUTH_TOKEN";
export const AUTH_EVENT = "tdlog-auth-changed";

export function getAuthToken(): string | null { //récupère le JWT
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void { //enregistrer le JWT
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function clearAuthToken(): void { //supprimer le token
  localStorage.removeItem(AUTH_TOKEN_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
}
