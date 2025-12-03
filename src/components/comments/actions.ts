"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getCommentDataInclude, ReviewData } from "@/lib/types";
import { createCommentSchema } from "@/lib/validation";

export async function submitComment({
  review,
  content,
}: {
  review: ReviewData;
  content: string;
}) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const { content: contentValidated } = createCommentSchema.parse({ content });

  const [newComment] = await prisma.$transaction([
    prisma.comment.create({
      data: {
        content: contentValidated,
        reviewId: review.id,
        userId: user.id,
      },
      include: getCommentDataInclude(user.id),
    }),
    ...(review.user.id !== user.id
      ? [
          prisma.notification.create({
            data: {
              issuerId: user.id,
              recipientId: review.user.id,
              reviewId: review.id,
              type: "COMMENT",
            },
          }),
        ]
      : []),
  ]);

  return newComment;
}

// Legacy function signature for backward compatibility
export async function submitCommentLegacy({
  post,
  content,
}: {
  post: ReviewData;
  content: string;
}) {
  return submitComment({ review: post, content });
}

export async function deleteComment(id: string) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const comment = await prisma.comment.findUnique({
    where: { id },
  });

  if (!comment) throw new Error("Comment not found");

  if (comment.userId !== user.id) throw new Error("Unauthorized");

  const deletedComment = await prisma.comment.delete({
    where: { id },
    include: getCommentDataInclude(user.id),
  });

  return deletedComment;
}
