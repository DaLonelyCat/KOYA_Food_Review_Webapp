"use client";

import { useState } from "react";
import UserAvatar from "@/components/UserAvatar";
import RestaurantUsersDialog from "./RestaurantUsersDialog";
import { UserData } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface RestaurantUserAvatarsProps {
  restaurantId: string;
  type: "favorites" | "visited";
  count: number;
  randomUsers: UserData[];
}

export default function RestaurantUserAvatars({
  restaurantId,
  type,
  count,
  randomUsers,
}: RestaurantUserAvatarsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const displayUsers = randomUsers.slice(0, 5);
  const label = type === "favorites" ? "Favorited" : "Visited";

  return (
    <>
      <button
        onClick={() => setDialogOpen(true)}
        className="flex items-center gap-2 transition-colors hover:text-foreground"
      >
        <span>
          {label} by {formatNumber(count)} users
        </span>
        {displayUsers.length > 0 && (
          <div className="flex items-center -space-x-2">
            {displayUsers.map((user, index) => (
              <div
                key={user.id}
                className={cn(
                  "relative rounded-full border-2 border-background ring-2 ring-background",
                  index > 0 && "-ml-2",
                )}
                style={{ zIndex: displayUsers.length - index }}
              >
                <UserAvatar
                  avatarUrl={user.avatarUrl}
                  size={24}
                  className="rounded-full"
                />
              </div>
            ))}
          </div>
        )}
      </button>
      <RestaurantUsersDialog
        restaurantId={restaurantId}
        type={type}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
