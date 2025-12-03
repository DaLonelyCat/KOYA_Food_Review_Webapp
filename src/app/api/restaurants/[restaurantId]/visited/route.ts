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

  const existing = await prisma.restaurantVisited.findUnique({
    where: {
      userId_restaurantId: {
        userId: user.id,
        restaurantId,
      },
    },
  });

  if (existing) {
    await prisma.restaurantVisited.delete({
      where: { id: existing.id },
    });
    return NextResponse.json({ visited: false });
  }

  await prisma.restaurantVisited.create({
    data: {
      userId: user.id,
      restaurantId,
    },
  });

  return NextResponse.json({ visited: true });
}

