import { DeltaBadge } from "@/components/DeltaBadge";
import { GameCardAction } from "@/components/GameCardAction";
import { MatchCardHeader } from "@/components/MatchCardHeader";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { formatScore } from "@/lib/ratings";
import type { GameWithAggregates } from "@/types/database";

interface GameCardProps {
  game: GameWithAggregates;
}

export function GameCard({ game }: GameCardProps) {
  return (
    <Card className="w-full gap-4 overflow-hidden rounded-[10px] border-[#d7d7d7] py-4 shadow-none transition-shadow hover:shadow-md">
      <CardHeader className="gap-0 px-4 pb-0">
        <MatchCardHeader
          venue={game.venue}
          kickoffAt={game.kickoff_at}
          status={game.status}
          homeTeam={game.home_team}
          awayTeam={game.away_team}
          homeScore={game.home_score}
          awayScore={game.away_score}
        />
      </CardHeader>

      <CardContent className="space-y-4 px-4">
        <p className="h-5 text-center text-sm leading-5 text-[#757575]">
          {game.status === "complete" && game.margin !== null
            ? `${game.margin} pt margin`
            : game.status === "live"
              ? "In play"
              : "\u00a0"}
        </p>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border border-[#d7d7d7] p-3">
            <p className="text-[#757575]">Expected</p>
            <p className="text-2xl font-semibold text-[#1d1d1d]">
              {formatScore(game.aggregates.expectation_avg)}
            </p>
            <p className="text-xs text-[#757575]">
              {game.aggregates.expectation_count} votes
            </p>
          </div>
          <div className="rounded-lg border border-[#d7d7d7] p-3">
            <p className="text-[#757575]">Reality</p>
            <p className="text-2xl font-semibold text-[#1d1d1d]">
              {formatScore(game.aggregates.reality_avg)}
            </p>
            <p className="text-xs text-[#757575]">
              {game.aggregates.reality_count} votes
            </p>
          </div>
        </div>

        <DeltaBadge delta={game.aggregates.delta} />
      </CardContent>

      <CardFooter className="flex justify-center border-[#d7d7d7] px-4">
        <GameCardAction game={game} />
      </CardFooter>
    </Card>
  );
}
