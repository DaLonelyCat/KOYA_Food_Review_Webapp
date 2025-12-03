import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";

export async function GET(
  req: Request,
  { params: { restaurantId } }: { params: { restaurantId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favorites = await prisma.restaurantFavorite.findMany({
      where: {
        restaurantId,
      },
      select: {
        user: {
          select: getUserDataSelect(loggedInUser.id),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const users = favorites.map((favorite) => favorite.user);

    return Response.json(users);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

