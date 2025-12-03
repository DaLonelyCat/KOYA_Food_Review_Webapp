"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getReviewDataInclude } from "@/lib/types";
import { createPostSchema } from "@/lib/validation";

export async function submitReview(input: {
  content: string;
  mediaIds: string[];
  restaurantId?: string;
  rating?: number;
}) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const { content, mediaIds, restaurantId, rating } = createPostSchema.parse(input);

  const newReview = await prisma.review.create({
    data: {
      content,
      userId: user.id,
      restaurantId: restaurantId || null,
      rating: rating || null,
      attachments: {
        connect: mediaIds.map((id) => ({ id })),
      },
    },
    include: getReviewDataInclude(user.id),
  });

  return newReview;
}

// Legacy export for backward compatibility
export const submitPost = submitReview;
