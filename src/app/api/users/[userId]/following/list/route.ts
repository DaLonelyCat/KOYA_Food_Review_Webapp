import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";

export async function GET(
  req: Request,
  { params: { userId } }: { params: { userId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const following = await prisma.follow.findMany({
      where: {
        followerId: userId,
      },
      select: {
        following: {
          select: getUserDataSelect(loggedInUser.id),
        },
      },
    });

    const users = following.map((follow) => follow.following);

    return Response.json(users);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

