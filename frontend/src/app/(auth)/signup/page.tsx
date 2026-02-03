"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Button,
  Input,
} from "@/components/ui";
import {
  validateEmail,
  validatePassword,
  validateRequired,
  validatePasswordMatch,
} from "@/lib/validation";
import { authService } from "@/lib/services";
import { useAuth } from "@/contexts";

export default function SignupPage() {
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function runValidation(): boolean {
    const nameError = validateRequired(name, "Name");
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmError = validatePasswordMatch(password, confirmPassword);
    setErrors({
      name: nameError ?? undefined,
      email: emailError ?? undefined,
      password: passwordError ?? undefined,
      confirmPassword: confirmError ?? undefined,
    });
    return !nameError && !emailError && !passwordError && !confirmError;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!runValidation()) return;

    setIsLoading(true);
    try {
      const response = await authService.register({ name, email, password });
      login({
        email: response.user.email,
        name: response.user.name,
        role: response.user.role,
      });
      setSuccess(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account created</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Your account has been created. You can sign in or go to the
            dashboard.
          </p>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Link
            href="/dashboard"
            className="inline-flex h-8 items-center justify-center rounded-md bg-neutral-900 px-3 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Dashboard
          </Link>
          <Link
            href="/login"
            className="inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Sign in
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Enter your details to create a new account.
        </p>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {submitError && (
            <p
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-400"
              role="alert"
            >
              {submitError}
            </p>
          )}
          <Input
            label="Name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            disabled={isLoading}
            placeholder="Your name"
          />
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            disabled={isLoading}
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            disabled={isLoading}
            placeholder="At least 8 characters"
            hint="Must be at least 8 characters."
          />
          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            disabled={isLoading}
            placeholder="Repeat password"
          />
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" fullWidth disabled={isLoading}>
            {isLoading ? "Creating account…" : "Create account"}
          </Button>
          <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="underline hover:text-neutral-900 dark:hover:text-white"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
