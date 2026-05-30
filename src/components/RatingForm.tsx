"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { GameButton } from "@/components/GameButton";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { RatingFactor } from "@/types/database";

interface ExistingRating {
  overall_score: number;
  factor_scores: Record<string, number>;
}

interface RatingFormProps {
  gameId: string;
  phase: "expectation" | "reality";
  factors: RatingFactor[];
  existingRating?: ExistingRating | null;
}

export function RatingForm({
  gameId,
  phase,
  factors,
  existingRating,
}: RatingFormProps) {
  const router = useRouter();
  const [overallScore, setOverallScore] = useState(existingRating?.overall_score ?? 6);
  const [factorScores, setFactorScores] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const factor of factors) {
      initial[factor.id] = existingRating?.factor_scores[factor.id] ?? 6;
    }
    return initial;
  });
  const [factorsTouched, setFactorsTouched] = useState(
    () =>
      Boolean(
        existingRating?.factor_scores &&
          Object.keys(existingRating.factor_scores).length > 0,
      ),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const phaseLabel = phase === "expectation" ? "expectation" : "reality";

  const selectedFactorCount = useMemo(
    () =>
      Object.values(factorScores).filter((score) => score >= 1 && score <= 10).length,
    [factorScores],
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const payload: {
        gameId: string;
        phase: "expectation" | "reality";
        overallScore: number;
        factorScores?: Record<string, number>;
      } = {
        gameId,
        phase,
        overallScore,
      };

      if (factorsTouched && selectedFactorCount > 0) {
        payload.factorScores = factorScores;
      }

      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to submit rating");
      }

      setSuccess(true);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Failed to submit rating",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-end justify-between">
          <Label htmlFor="overall-score">Overall quality (1–10)</Label>
          <span className="text-3xl font-bold tabular-nums">{overallScore}</span>
        </div>
        <div className="py-2">
          <Slider
          id="overall-score"
          min={1}
          max={10}
          step={1}
          value={[overallScore]}
          onValueChange={(value) => {
            const next = Array.isArray(value) ? value[0] : value;
            setOverallScore(typeof next === "number" ? next : 6);
          }}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          How good do you {phase === "expectation" ? "expect" : "think"} this game{" "}
          {phase === "expectation" ? "will be" : "was"}?
        </p>
      </div>

      {factors.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Game factors (optional)</h3>
          <div>
            {factors.map((factor) => (
              <div key={factor.id} className="space-y-2 py-3">
                <div className="flex items-center justify-between">
                  <Label>{factor.label}</Label>
                  <span className="font-semibold tabular-nums">
                    {factorScores[factor.id]}
                  </span>
                </div>
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={[factorScores[factor.id] ?? 6]}
                  onValueChange={(value) => {
                    const next = Array.isArray(value) ? value[0] : value;
                    setFactorsTouched(true);
                    setFactorScores((current) => ({
                      ...current,
                      [factor.id]: typeof next === "number" ? next : 6,
                    }));
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && (
        <p className="text-sm text-emerald-600">
          {existingRating ? "Rating updated." : `${phaseLabel} rating saved.`}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GameButton
          variant={phase}
          label={
            submitting
              ? "Saving..."
              : existingRating
                ? "Update rating"
                : `Submit ${phaseLabel} rating`
          }
          loading={submitting}
        />
      </button>
    </form>
  );
}
