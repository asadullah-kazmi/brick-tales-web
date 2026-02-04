"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@/types";
import { getApiErrorMessage } from "@/lib/api-client";
import { authService, getStoredSubscription } from "@/lib/services";
import { subscriptionService } from "@/lib/services";

type AuthState = {
  user: User | null;
  isLoading: boolean;
  /** Error from /me on load (e.g. network failure). Cleared on retry, login, or logout. */
  sessionError: string | null;
  /** Mocked subscription status. When false, subscription prompt is shown instead of video. */
  isSubscribed: boolean;
};

type AuthContextValue = AuthState & {
  login: (user: User) => void;
  logout: () => void;
  /** Re-fetch current user from GET /users/me (clears sessionError, sets loading). */
  retrySession: () => Promise<void>;
  isAuthenticated: boolean;
  /** True when user has mocked role "admin" (e.g. admin@example.com). */
  isAdmin: boolean;
  /** Mock: set subscription status (e.g. after user "subscribes"). */
  setSubscribed: (subscribed: boolean) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** Map UserDto from service to User for context (session already persisted by service). */
function dtoToUser(dto: { email: string; name: string; role: string }): User {
  return {
    email: dto.email,
    name: dto.name,
    role: dto.role === "admin" ? "admin" : "user",
  };
}

function fetchSession() {
  return authService.getSession();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribedState] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchSession()
      .then((session) => {
        if (!cancelled) {
          setUser(session ? dtoToUser(session) : null);
          setSessionError(null);
          setIsSubscribedState(getStoredSubscription());
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setUser(null);
          setSessionError(getApiErrorMessage(err));
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const retrySession = useCallback(async () => {
    setSessionError(null);
    setIsLoading(true);
    try {
      const session = await fetchSession();
      setUser(session ? dtoToUser(session) : null);
      setIsSubscribedState(getStoredSubscription());
    } catch (err) {
      setUser(null);
      setSessionError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((newUser: User) => {
    setUser(newUser);
    setSessionError(null);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setSessionError(null);
    setIsSubscribedState(false);
  }, []);

  const setSubscribed = useCallback((subscribed: boolean) => {
    subscriptionService.setSubscribed(subscribed);
    setIsSubscribedState(subscribed);
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    sessionError,
    isSubscribed,
    login,
    logout,
    retrySession,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    setSubscribed,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
