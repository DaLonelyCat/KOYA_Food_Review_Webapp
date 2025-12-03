"use client";

import { Button } from "@/components/ui/button";
import PostReviewDialog from "@/components/restaurants/PostReviewDialog";
import { useState } from "react";

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

interface PostReviewButtonProps {
  restaurant: Restaurant;
}

export default function PostReviewButton({
  restaurant,
}: PostReviewButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Post a Review</Button>
      <PostReviewDialog
        open={open}
        onOpenChange={setOpen}
        restaurant={restaurant}
      />
    </>
  );
}

