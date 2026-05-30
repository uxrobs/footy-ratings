"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { GameReview } from "@/types/database";

const MAX_BODY_LENGTH = 500;
const MAX_NAME_LENGTH = 40;

interface GameReviewFormProps {
  gameId: string;
  gameComplete: boolean;
  submissionsOpen: boolean;
  userReview: GameReview | null;
}

export function GameReviewForm({
  gameId,
  gameComplete,
  submissionsOpen,
  userReview,
}: GameReviewFormProps) {
  const router = useRouter();
  const [authorName, setAuthorName] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const hasReview = userReview !== null || submitted;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, authorName, body }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to submit review");
      }

      setSubmitted(true);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Failed to submit review",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!gameComplete) {
    return (
      <div className="space-y-4">
        <Separator />
        <p className="text-sm text-muted-foreground">Reviews open after full time.</p>
      </div>
    );
  }

  if (!submissionsOpen && !hasReview) {
    return (
      <div className="space-y-4">
        <Separator />
        <p className="text-sm text-muted-foreground">
          Reviews are closed for this round.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Separator />
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Leave a review</h2>
        {!hasReview && (
          <p className="text-sm text-muted-foreground">
            Share your take on the game. One review per device.
          </p>
        )}
      </div>

      {hasReview ? (
        <p className="text-sm text-emerald-600">
          {submitted ? (
            <>
              Review added —{" "}
              <a href="#reviews" className="underline underline-offset-2">
                view it at the bottom of the page
              </a>
              .
            </>
          ) : (
            <>
              <a href="#reviews" className="underline underline-offset-2">
                View your review at the bottom of the page
              </a>
              .
            </>
          )}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="review-name">Your name</Label>
            <input
              id="review-name"
              type="text"
              value={authorName}
              onChange={(event) => setAuthorName(event.target.value)}
              maxLength={MAX_NAME_LENGTH}
              placeholder="How should we show your name?"
              autoComplete="name"
              className={cn(
                "border-input bg-background ring-offset-background placeholder:text-muted-foreground",
                "focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 py-1 text-sm",
                "focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="review-body">Your review</Label>
            <textarea
              id="review-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              maxLength={MAX_BODY_LENGTH}
              rows={4}
              placeholder="What stood out? Was it worth the hype?"
              className={cn(
                "border-input bg-background ring-offset-background placeholder:text-muted-foreground",
                "focus-visible:border-ring focus-visible:ring-ring/50 flex w-full rounded-md border px-3 py-2 text-sm",
                "focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
              )}
            />
            <p className="text-xs text-muted-foreground tabular-nums">
              {body.trim().length}/{MAX_BODY_LENGTH}
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            disabled={
              submitting || authorName.trim().length < 1 || body.trim().length < 1
            }
          >
            {submitting ? "Saving..." : "Post review"}
          </Button>
        </form>
      )}
    </div>
  );
}
