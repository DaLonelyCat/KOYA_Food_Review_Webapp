"use client";

import kyInstance from "@/lib/ky";
import { RestaurantInfo } from "@/lib/types";
import { QueryKey, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Heart, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface RestaurantActionButtonProps {
  restaurantId: string;
  action: "bookmark" | "favorite" | "visited";
  initialState: RestaurantInfo;
}

export default function RestaurantActionButton({
  restaurantId,
  action,
  initialState,
}: RestaurantActionButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const queryKey: QueryKey = ["restaurant-info", restaurantId];

  const { data } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await kyInstance
        .get(`/api/restaurants/${restaurantId}`)
        .json<RestaurantInfo>();
      return response;
    },
    initialData: initialState,
    staleTime: Infinity,
  });

  const isActive =
    action === "bookmark"
      ? data.isBookmarkedByUser
      : action === "favorite"
        ? data.isFavoritedByUser
        : data.isVisitedByUser;

  const { mutate } = useMutation({
    mutationFn: () =>
      kyInstance.post(`/api/restaurants/${restaurantId}/${action}`),
    onMutate: async () => {
      const actionName =
        action === "bookmark"
          ? "bookmarked"
          : action === "favorite"
            ? "favorited"
            : "marked as visited";

      toast({
        description: `Restaurant ${isActive ? "un" : ""}${actionName}`,
      });

      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<RestaurantInfo>(queryKey);

      queryClient.setQueryData<RestaurantInfo>(queryKey, () => {
        if (action === "bookmark") {
          return {
            ...previousState!,
            isBookmarkedByUser: !previousState?.isBookmarkedByUser,
          };
        } else if (action === "favorite") {
          return {
            ...previousState!,
            isFavoritedByUser: !previousState?.isFavoritedByUser,
          };
        } else {
          return {
            ...previousState!,
            isVisitedByUser: !previousState?.isVisitedByUser,
          };
        }
      });

      return { previousState };
    },
    onError(error, variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState);
      console.error(error);
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again.",
      });
    },
  });

  const icons = {
    bookmark: Bookmark,
    favorite: Heart,
    visited: CheckCircle2,
  };

  const labels = {
    bookmark: "Bookmark",
    favorite: "Favorite",
    visited: "Visited",
  };

  const Icon = icons[action];

  return (
    <button
      onClick={() => mutate()}
      className={cn(
        "flex items-center gap-2 rounded-lg border px-4 py-2 transition-colors",
        isActive
          ? "border-primary bg-primary/10 text-primary"
          : "border-border hover:bg-accent",
      )}
    >
      <Icon
        className={cn(
          "size-5",
          isActive && action === "bookmark" && "fill-primary text-primary",
          isActive && action === "favorite" && "fill-primary text-primary",
          isActive && action === "visited" && "text-primary",
        )}
      />
      <span className="text-sm font-medium">{labels[action]}</span>
    </button>
  );
}

