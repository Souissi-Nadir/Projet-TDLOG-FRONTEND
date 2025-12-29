import { useEffect, useState } from "react";
import { AUTH_EVENT, AUTH_TOKEN_KEY, getAuthToken } from "../auth";

export function useAuthToken(): string | null {
  const [token, setToken] = useState<string | null>(getAuthToken()); // permet de déclencer un rerender quand le token change

  useEffect(() => { //synchronisation automatique
    const updateToken = () => setToken(getAuthToken()); //fonction interne de mise à jour

    const onStorage = (event: StorageEvent) => {
      if (event.key === AUTH_TOKEN_KEY) {
        updateToken();
      }
    };

    window.addEventListener(AUTH_EVENT, updateToken);
    window.addEventListener("storage", onStorage);

    return () => { //nettoyage
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
