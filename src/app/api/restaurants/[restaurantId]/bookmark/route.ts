"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params: { restaurantId } }: { params: { restaurantId: string } },
) {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.restaurantBookmark.findUnique({
    where: {
      userId_restaurantId: {
        userId: user.id,
        restaurantId,
      },
    },
  });

  if (existing) {
    await prisma.restaurantBookmark.delete({
      where: { id: existing.id },
    });
    return NextResponse.json({ bookmarked: false });
  }

  await prisma.restaurantBookmark.create({
    data: {
      userId: user.id,
      restaurantId,
    },
  });

  return NextResponse.json({ bookmarked: true });
}

