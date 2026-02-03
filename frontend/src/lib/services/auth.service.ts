import type {
  LoginRequestDto,
  LoginResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
  ForgotPasswordRequestDto,
  ForgotPasswordResponseDto,
  UserDto,
} from "@/types/api";
import type { User } from "@/types";
import {
  mockLogin,
  mockSignup,
  mockForgotPassword,
  setMockSession,
  clearMockSession,
  getMockSubscription,
} from "@/lib/mock-auth";

const MOCK_TOKEN = "mock-jwt-token";

function userToDto(user: User): UserDto {
  return {
    id: (user as User & { id?: string }).id ?? `user-${user.email}`,
    email: user.email,
    name: user.name,
    role: user.role ?? "user",
  };
}

function persistSession(user: User): void {
  setMockSession(user);
}

/**
 * Auth service. Use this instead of calling mock-auth directly.
 * Switch to real API by implementing fetch in this file when USE_MOCK_API is false.
 */
export const authService = {
  async login(body: LoginRequestDto): Promise<LoginResponseDto> {
    const result = await mockLogin(body.email, body.password);
    if (!result.success) {
      throw new Error(result.error);
    }
    persistSession(result.user);
    return {
      user: userToDto(result.user),
      accessToken: MOCK_TOKEN,
      expiresIn: 3600,
    };
  },

  async register(body: RegisterRequestDto): Promise<RegisterResponseDto> {
    const result = await mockSignup(body.name, body.email, body.password);
    if (!result.success) {
      throw new Error(result.error ?? "Registration failed");
    }
    persistSession(result.user);
    return {
      user: userToDto(result.user),
      accessToken: MOCK_TOKEN,
      expiresIn: 3600,
    };
  },

  async forgotPassword(
    body: ForgotPasswordRequestDto,
  ): Promise<ForgotPasswordResponseDto> {
    const result = await mockForgotPassword(body.email);
    if (!result.success) {
      throw new Error(result.error ?? "Request failed");
    }
    return { message: result.message };
  },

  logout(): void {
    clearMockSession();
  },

  /**
   * Get current session from storage (mock). For real API, validate token or call GET /auth/me.
   */
  getSession(): UserDto | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem("mockAuthUser");
      if (!raw) return null;
      const user = JSON.parse(raw) as User;
      if (!user?.email) return null;
      return userToDto(user);
    } catch {
      return null;
    }
  },
};

/** Used by AuthContext to read subscription from storage; see subscription.service for subscribe. */
export function getStoredSubscription(): boolean {
  return getMockSubscription();
}
