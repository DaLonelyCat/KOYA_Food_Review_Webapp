"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getReviewDataInclude, ReviewsPage } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params: { restaurantId } }: { params: { restaurantId: string } },
) {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const cursor = searchParams.get("cursor");

  const reviews = await prisma.review.findMany({
    where: {
      restaurantId,
    },
    include: getReviewDataInclude(user.id),
    take: 10,
    ...(cursor && {
      skip: 1,
      cursor: {
        id: cursor,
      },
    }),
    orderBy: {
      createdAt: "desc",
    },
  });

  const nextCursor = reviews.length === 10 ? reviews[reviews.length - 1].id : null;

  const response: ReviewsPage = {
    posts: reviews,
    nextCursor,
  };

  return NextResponse.json(response);
}

