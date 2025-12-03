"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getRestaurantDataSelect } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params: { restaurantId } }: { params: { restaurantId: string } },
) {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: {
      id: restaurantId,
    },
    select: getRestaurantDataSelect(user.id),
  });

  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
  }

  const restaurantInfo = {
    isBookmarkedByUser: restaurant.bookmarks.length > 0,
    isFavoritedByUser: restaurant.favorites.length > 0,
    isVisitedByUser: restaurant.visited.length > 0,
  };

  return NextResponse.json(restaurantInfo);
}

