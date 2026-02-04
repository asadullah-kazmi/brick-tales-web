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
import {
  authService,
  getStoredSubscription,
  subscriptionService,
} from "@/lib/services";
import { USE_MOCK_API } from "@/lib/services/config";

// ---------------------------------------------------------------------------
// Global auth state (Context)
// ---------------------------------------------------------------------------

/** User data and derived auth/subscription status. */
export type AuthState = {
  /** Current user or null when not authenticated. */
  user: User | null;
  /** True while fetching session on load or during refreshUser. */
  isLoading: boolean;
  /** Error from GET /me (e.g. network failure). Cleared on refresh, login, or logout. */
  sessionError: string | null;
  /** Whether the user has an active subscription (mock or real). */
  isSubscribed: boolean;
  /** True when user is set. */
  isAuthenticated: boolean;
  /** True when user.role === "admin". */
  isAdmin: boolean;
};

/** Actions that update auth state. */
export type AuthActions = {
  /** Set user after successful login/signup (and clear sessionError). */
  login: (user: User) => void;
  /** Clear tokens/storage and set user to null. */
  logout: () => void;
  /** Re-fetch current user from GET /users/me (clears sessionError, sets loading). */
  refreshUser: () => Promise<void>;
  /** Set subscription status (e.g. after user subscribes). */
  setSubscribed: (subscribed: boolean) => void;
};

export type AuthContextValue = AuthState & AuthActions;

const AuthContext = createContext<AuthContextValue | null>(null);

/** Map UserDto from service to User for context (session already persisted by service). */
function dtoToUser(dto: {
  id?: string;
  email: string;
  name: string;
  role: string;
  createdAt?: string;
}): User {
  return {
    id: dto.id,
    email: dto.email,
    name: dto.name ?? "",
    role: dto.role === "admin" ? "admin" : "user",
    createdAt: dto.createdAt,
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
          if (USE_MOCK_API) {
            setIsSubscribedState(getStoredSubscription());
          } else if (session) {
            subscriptionService.getSubscription().then((res) => {
              if (!cancelled) setIsSubscribedState(res.isSubscribed);
            });
          } else {
            setIsSubscribedState(false);
          }
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

  const refreshUser = useCallback(async () => {
    setSessionError(null);
    setIsLoading(true);
    try {
      const session = await fetchSession();
      setUser(session ? dtoToUser(session) : null);
      if (USE_MOCK_API) {
        setIsSubscribedState(getStoredSubscription());
      } else if (session) {
        const sub = await subscriptionService.getSubscription();
        setIsSubscribedState(sub.isSubscribed);
      } else {
        setIsSubscribedState(false);
      }
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
    // State
    user,
    isLoading,
    sessionError,
    isSubscribed,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    // Actions
    login,
    logout,
    refreshUser,
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
