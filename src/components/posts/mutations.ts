import { ReviewsPage } from "@/lib/types";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "../ui/use-toast";
import { deleteReview } from "./actions";

export function useDeleteReviewMutation() {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const router = useRouter();
  const pathname = usePathname();

  const mutation = useMutation({
    mutationFn: deleteReview,
    onSuccess: async (deletedReview) => {
      const queryFilter: QueryFilters = { queryKey: ["review-feed"] };

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<ReviewsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.filter((p) => p.id !== deletedReview.id),
            })),
          };
        },
      );

      toast({
        description: "Review deleted",
      });

      if (pathname === `/posts/${deletedReview.id}`) {
        router.push(`/users/${deletedReview.user.username}`);
      }
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to delete review. Please try again.",
      });
    },
  });

  return mutation;
}

// Legacy export for backward compatibility
export const useDeletePostMutation = useDeleteReviewMutation;
