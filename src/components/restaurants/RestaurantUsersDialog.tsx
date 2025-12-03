"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import FollowButton from "@/components/FollowButton";
import UserAvatar from "@/components/UserAvatar";
import UserTooltip from "@/components/UserTooltip";
import { UserData } from "@/lib/types";
import kyInstance from "@/lib/ky";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Link from "next/link";

interface RestaurantUsersDialogProps {
  restaurantId: string;
  type: "favorites" | "visited";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RestaurantUsersDialog({
  restaurantId,
  type,
  open,
  onOpenChange,
}: RestaurantUsersDialogProps) {
  const { user: loggedInUser } = useSession();
  const { data: users, isLoading } = useQuery<UserData[]>({
    queryKey: [`restaurant-${type}`, restaurantId],
    queryFn: () =>
      kyInstance
        .get(`/api/restaurants/${restaurantId}/${type}/list`)
        .json<UserData[]>(),
    enabled: open,
  });

  const title = type === "favorites" ? "Favorited by" : "Visited by";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] space-y-3 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin" />
            </div>
          ) : users && users.length > 0 ? (
            users.map((user) => {
              const followerInfo = {
                followers: user._count.followers,
                isFollowedByUser: user.followers.some(
                  ({ followerId }) => followerId === loggedInUser.id,
                ),
              };

              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-3"
                >
                  <UserTooltip user={user}>
                    <Link
                      href={`/users/${user.username}`}
                      className="flex items-center gap-3"
                      onClick={() => onOpenChange(false)}
                    >
                      <UserAvatar
                        avatarUrl={user.avatarUrl}
                        className="flex-none"
                      />
                      <div>
                        <p className="line-clamp-1 break-all font-semibold hover:underline">
                          {user.displayName}
                        </p>
                        <p className="line-clamp-1 break-all text-muted-foreground">
                          @{user.username}
                        </p>
                      </div>
                    </Link>
                  </UserTooltip>
                  {loggedInUser.id !== user.id && (
                    <FollowButton userId={user.id} initialState={followerInfo} />
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No users {type === "favorites" ? "favorited" : "visited"} this restaurant yet
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

