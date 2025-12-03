import avatarPlaceholder from "@/assets/avatar-placeholder.png";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface UserAvatarProps {
  avatarUrl: string | null | undefined;
  size?: number;
  className?: string;
}

export default function UserAvatar({
  avatarUrl,
  size,
  className,
}: UserAvatarProps) {
  // Fix old transformed URLs: convert /a/{appId}/ back to /f/ for custom subdomains
  let fixedAvatarUrl = avatarUrl;
  if (avatarUrl && avatarUrl.includes(".ufs.sh/a/")) {
    fixedAvatarUrl = avatarUrl.replace(/\.ufs\.sh\/a\/[^/]+\//, ".ufs.sh/f/");
  }

  return (
    <Image
      src={fixedAvatarUrl || avatarPlaceholder}
      alt="User avatar"
      width={size ?? 48}
      height={size ?? 48}
      className={cn(
        "aspect-square h-fit flex-none rounded-full bg-secondary object-cover",
        className,
      )}
    />
  );
}
