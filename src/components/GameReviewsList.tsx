import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { GameReview } from "@/types/database";

function formatReviewTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface GameReviewsListProps {
  reviews: GameReview[];
  userReviewId: string | null;
}

export function GameReviewsList({ reviews, userReviewId }: GameReviewsListProps) {
  return (
    <Card id="reviews" className="scroll-mt-8">
      <CardHeader>
        <CardTitle>Reviews</CardTitle>
        <div className="flex items-center justify-between gap-4">
          <CardDescription className="mb-0">
            {reviews.length} {reviews.length === 1 ? "review" : "reviews"} — newest
            first
          </CardDescription>
          <a
            href="#review-form"
            className="shrink-0 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Leave a review
          </a>
        </div>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        ) : (
          <ul className="space-y-4">
            {reviews.map((review) => (
              <li
                key={review.id}
                className={cn(
                  "rounded-lg border bg-muted/30 p-4 text-sm leading-relaxed",
                  userReviewId === review.id && "border-primary/30",
                )}
              >
                <p className="font-medium">
                  {review.author_name}
                  {userReviewId === review.id && (
                    <span className="ml-1.5 font-normal text-muted-foreground">(you)</span>
                  )}
                </p>
                <p className="mt-2 whitespace-pre-wrap">{review.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatReviewTime(review.created_at)}
                  {review.updated_at !== review.created_at && " · edited"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
