import Image from "next/image";
import { getTeamAvatarImage } from "@/lib/team-avatars";
import { cn } from "@/lib/utils";

interface TeamAvatarProps {
  team: string;
  className?: string;
}

export function TeamAvatar({ team, className }: TeamAvatarProps) {
  const src = getTeamAvatarImage(team);

  return (
    <Image
      src={src}
      alt=""
      width={45}
      height={45}
      className={cn("size-[45px] shrink-0 rounded-lg", className)}
      aria-hidden
    />
  );
}
