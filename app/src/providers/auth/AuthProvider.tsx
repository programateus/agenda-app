import { useEffect, useRef, useState, type ReactNode } from "react";

import { myProfile } from "@/services/auth";
import { AuthContext, type AuthUser } from "./AuthContext";

const ACCESS_TOKEN_STORAGE_KEY = "accessToken";

const getStoredAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
};

const storeAccessToken = (accessToken: string) => {
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
};

const clearStoredAccessToken = () => {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    getStoredAccessToken(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const bootstrapAttemptedRef = useRef(false);

  const clearAuthState = () => {
    clearStoredAccessToken();
    setAccessToken(null);
    setUser(null);
  };

  const loadProfile = async () => {
    const response = await myProfile();

    setUser(response.data);
  };

  const refreshProfile = async () => {
    try {
      await loadProfile();
    } catch {
      clearAuthState();
      throw new Error("Failed to refresh profile");
    }
  };

  const signIn = async (nextAccessToken: string) => {
    storeAccessToken(nextAccessToken);
    setAccessToken(nextAccessToken);

    try {
      await loadProfile();
    } catch {
      clearAuthState();
      throw new Error("Failed to load profile");
    }
  };

  const signOut = () => {
    clearAuthState();
  };

  useEffect(() => {
    if (bootstrapAttemptedRef.current) {
      return;
    }

    bootstrapAttemptedRef.current = true;

    const bootstrapAuth = async () => {
      const storedAccessToken = getStoredAccessToken();

      if (!storedAccessToken) {
        setIsLoading(false);
        return;
      }

      setAccessToken(storedAccessToken);

      try {
        await loadProfile();
      } catch {
        clearAuthState();
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrapAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: Boolean(user && accessToken),
        isLoading,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
