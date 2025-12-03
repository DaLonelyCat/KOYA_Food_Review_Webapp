"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import Post from "@/components/posts/Post";
import { ReviewsPage } from "@/lib/types";
import kyInstance from "@/lib/ky";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

interface RestaurantReviewsProps {
  restaurantId: string;
}

export default function RestaurantReviews({
  restaurantId,
}: RestaurantReviewsProps) {
  const { user } = useSession();
  const { ref, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useInfiniteQuery({
      queryKey: ["restaurant-reviews", restaurantId],
      queryFn: async ({ pageParam }) => {
        const searchParams = new URLSearchParams();
        if (pageParam) searchParams.set("cursor", pageParam as string);

        return kyInstance
          .get(`/api/restaurants/${restaurantId}/reviews?${searchParams}`)
          .json<ReviewsPage>();
      },
      initialPageParam: null as string | null,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const reviews = data?.pages.flatMap((page) => page.posts) ?? [];

  return (
    <div className="space-y-5">
      {reviews.length === 0 ? (
        <div className="rounded-2xl bg-card p-5 text-center text-muted-foreground">
          No reviews yet. Be the first to review!
        </div>
      ) : (
        <>
          {reviews.map((review) => (
            <Post key={review.id} post={review} />
          ))}
          {hasNextPage && (
            <div ref={ref} className="text-center">
              {isFetchingNextPage && (
                <p className="text-muted-foreground">Loading more reviews...</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
