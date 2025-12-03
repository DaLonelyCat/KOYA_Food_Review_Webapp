"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getReviewDataInclude } from "@/lib/types";

export async function deleteReview(id: string) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const review = await prisma.review.findUnique({
    where: { id },
  });

  if (!review) throw new Error("Review not found");

  if (review.userId !== user.id) throw new Error("Unauthorized");

  const deletedReview = await prisma.review.delete({
    where: { id },
    include: getReviewDataInclude(user.id),
  });

  return deletedReview;
}

// Legacy export for backward compatibility
export const deletePost = deleteReview;
