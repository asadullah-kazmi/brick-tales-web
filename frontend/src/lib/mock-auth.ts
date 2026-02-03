/**
 * Mock authentication. Simulates API responses without a backend.
 * Replace with real API calls when integrating with your auth service.
 */

const MOCK_DELAY_MS = 800;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type MockLoginResult =
  | { success: true; user: { email: string; name: string } }
  | { success: false; error: string };

export async function mockLogin(
  email: string,
  password: string,
): Promise<MockLoginResult> {
  await delay(MOCK_DELAY_MS);
  // Accept any email; require password "password123" for demo success
  if (password === "password123") {
    return {
      success: true,
      user: { email: email.trim(), name: email.split("@")[0] ?? "User" },
    };
  }
  return { success: false, error: "Invalid email or password." };
}

export type MockSignupResult =
  | { success: true; user: { email: string; name: string } }
  | { success: false; error: string };

export async function mockSignup(
  name: string,
  email: string,
  password: string,
): Promise<MockSignupResult> {
  await delay(MOCK_DELAY_MS);
  // Always succeed for demo; in real app would check duplicate email etc.
  return {
    success: true,
    user: { email: email.trim(), name: name.trim() },
  };
}

export type MockForgotPasswordResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function mockForgotPassword(
  email: string,
): Promise<MockForgotPasswordResult> {
  await delay(MOCK_DELAY_MS);
  return {
    success: true,
    message:
      "If an account exists for this email, you will receive a reset link.",
  };
}

/** Store mock session in localStorage for demo (e.g. to show "logged in" state elsewhere). */
export function setMockSession(user: { email: string; name: string }): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("mockAuthUser", JSON.stringify(user));
  }
}

export function clearMockSession(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("mockAuthUser");
  }
}
