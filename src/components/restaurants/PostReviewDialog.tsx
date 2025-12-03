"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ReviewEditor from "@/components/posts/editor/ReviewEditor";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  address: string | null;
  city: string | null;
  cuisineType: string | null;
  priceRange: number | null;
}

interface PostReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurant: Restaurant;
}

export default function PostReviewDialog({
  open,
  onOpenChange,
  restaurant,
}: PostReviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Post a Review</DialogTitle>
        </DialogHeader>
        <ReviewEditor
          initialRestaurant={restaurant}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

