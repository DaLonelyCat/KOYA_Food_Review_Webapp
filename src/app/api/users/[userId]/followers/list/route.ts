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

    const followers = await prisma.follow.findMany({
      where: {
        followingId: userId,
      },
      select: {
        follower: {
          select: getUserDataSelect(loggedInUser.id),
        },
      },
    });

    const users = followers.map((follow) => follow.follower);

    return Response.json(users);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

