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
import {
  clearMockSession,
  setMockSession,
  getMockSubscription,
  setMockSubscription,
} from "@/lib/mock-auth";

const STORAGE_KEY = "mockAuthUser";

type AuthState = {
  user: User | null;
  isLoading: boolean;
  /** Mocked subscription status. When false, subscription prompt is shown instead of video. */
  isSubscribed: boolean;
};

type AuthContextValue = AuthState & {
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  /** Mock: set subscription status (e.g. after user "subscribes"). */
  setSubscribed: (subscribed: boolean) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readUserFromStorage(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as unknown;
    if (
      data &&
      typeof data === "object" &&
      "email" in data &&
      "name" in data &&
      typeof (data as User).email === "string" &&
      typeof (data as User).name === "string"
    ) {
      return data as User;
    }
  } catch {
    // ignore
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribed, setIsSubscribedState] = useState(false);

  useEffect(() => {
    const stored = readUserFromStorage();
    setUser(stored);
    setIsSubscribedState(getMockSubscription());
    setIsLoading(false);
  }, []);

  const login = useCallback((newUser: User) => {
    setMockSession(newUser);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    clearMockSession();
    setUser(null);
    setIsSubscribedState(false);
  }, []);

  const setSubscribed = useCallback((subscribed: boolean) => {
    setMockSubscription(subscribed);
    setIsSubscribedState(subscribed);
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    isSubscribed,
    login,
    logout,
    isAuthenticated: !!user,
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
