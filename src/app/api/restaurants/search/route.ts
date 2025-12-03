"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get("q") || "";

  if (!query.trim()) {
    return NextResponse.json({ restaurants: [] });
  }

  const restaurants = await prisma.restaurant.findMany({
    where: {
      isActive: true,
      OR: [
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          address: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          city: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          cuisineType: {
            contains: query,
            mode: "insensitive",
          },
        },
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
      address: true,
      city: true,
      cuisineType: true,
      priceRange: true,
    },
    take: 10,
    orderBy: {
      name: "asc",
    },
  });

  return NextResponse.json({ restaurants });
}

