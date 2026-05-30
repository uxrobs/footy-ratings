import { TeamAvatarGraphic } from "@/components/TeamAvatarGraphic";
import { cn } from "@/lib/utils";

interface TeamAvatarProps {
  team: string;
  className?: string;
}

export function TeamAvatar({ team, className }: TeamAvatarProps) {
  return (
    <TeamAvatarGraphic
      team={team}
      className={cn("rounded-lg", className)}
    />
  );
}
