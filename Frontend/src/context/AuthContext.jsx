import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, tokenStore, setUnauthorizedHandler } from '../api/client.js';
import { useQueryClient } from '@tanstack/react-query';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(tokenStore.get()));

  const logout = useCallback(() => {
  tokenStore.clear();
  setUser(null);
  queryClient.clear();
}, [queryClient]);

  const login = useCallback((token, nextUser) => {
    tokenStore.set(token);
    setUser(nextUser);
  }, []);

  // On first load, if a token is saved, ask the server who it belongs to
  useEffect(() => {
    setUnauthorizedHandler(logout);
    if (!tokenStore.get()) return;

    api('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);