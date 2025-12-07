import { useEffect, useState } from "react";
import { AUTH_EVENT, AUTH_TOKEN_KEY, getAuthToken } from "../auth";

export function useAuthToken(): string | null {
  const [token, setToken] = useState<string | null>(getAuthToken());

  useEffect(() => {
    const updateToken = () => setToken(getAuthToken());

    const onStorage = (event: StorageEvent) => {
      if (event.key === AUTH_TOKEN_KEY) {
        updateToken();
      }
    };

    window.addEventListener(AUTH_EVENT, updateToken);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(AUTH_EVENT, updateToken);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return token;
}

export function useIsAuthenticated(): boolean {
  const token = useAuthToken();
  return Boolean(token);
}
