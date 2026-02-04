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
import { authService, getStoredSubscription } from "@/lib/services";
import { subscriptionService } from "@/lib/services";

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribed, setIsSubscribedState] = useState(false);

  useEffect(() => {
    let cancelled = false;
    authService.getSession().then((session) => {
      if (!cancelled) {
        setUser(session ? dtoToUser(session) : null);
        setIsSubscribedState(getStoredSubscription());
      }
      if (!cancelled) setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback((newUser: User) => {
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setIsSubscribedState(false);
  }, []);

  const setSubscribed = useCallback((subscribed: boolean) => {
    subscriptionService.setSubscribed(subscribed);
    setIsSubscribedState(subscribed);
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    isSubscribed,
    login,
    logout,
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
