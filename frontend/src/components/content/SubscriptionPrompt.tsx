"use client";

import { useAuth } from "@/contexts";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Button,
} from "@/components/ui";

type SubscriptionPromptProps = {
  /** Optional title of the content (e.g. video title) for context. */
  contentTitle?: string;
  /** Optional class name for the wrapper. */
  className?: string;
};

/**
 * Shown when the user is not subscribed. Prompts them to subscribe (mock:
 * sets subscription in AuthContext) to access the content.
 */
export function SubscriptionPrompt({
  contentTitle,
  className,
}: SubscriptionPromptProps) {
  const { isAuthenticated, setSubscribed } = useAuth();

  function handleSubscribe() {
    setSubscribed(true);
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span aria-hidden className="text-2xl">
            🔒
          </span>
          Subscribe to watch
        </CardTitle>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          {contentTitle
            ? `This content requires an active subscription: "${contentTitle}".`
            : "This content requires an active subscription."}
        </p>
      </CardHeader>
      <CardContent>
        <ul className="list-inside list-disc space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
          <li>Unlimited access to all videos</li>
          <li>HD and 4K streaming</li>
          <li>Watch on any device</li>
          <li>Cancel anytime (mock)</li>
        </ul>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button onClick={handleSubscribe} className="w-full sm:w-auto">
          Subscribe now (mock)
        </Button>
        {!isAuthenticated && (
          <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 sm:text-left">
            You may need to sign in first to subscribe.
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
