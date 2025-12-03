"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getRestaurantDataSelect, RestaurantData } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params: { slug } }: { params: { slug: string } },
) {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: {
      slug,
    },
    select: getRestaurantDataSelect(user.id),
  });

  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
  }

  return NextResponse.json(restaurant);
}

