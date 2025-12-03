import { Prisma } from "@prisma/client";

export function getUserDataSelect(loggedInUserId: string) {
  return {
    id: true,
    username: true,
    displayName: true,
    avatarUrl: true,
    bio: true,
    createdAt: true,
    followers: {
      where: {
        followerId: loggedInUserId,
      },
      select: {
        followerId: true,
      },
    },
    _count: {
      select: {
        reviews: true,
        followers: true,
        following: true,
      },
    },
  } satisfies Prisma.UserSelect;
}

export type UserData = Prisma.UserGetPayload<{
  select: ReturnType<typeof getUserDataSelect>;
}>;

export function getReviewDataInclude(loggedInUserId: string) {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId),
    },
    restaurant: {
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
    },
    attachments: true,
    likes: {
      where: {
        userId: loggedInUserId,
      },
      select: {
        userId: true,
      },
    },
    bookmarks: {
      where: {
        userId: loggedInUserId,
      },
      select: {
        userId: true,
      },
    },
    _count: {
      select: {
        likes: true,
        comments: true,
      },
    },
  } satisfies Prisma.ReviewInclude;
}

export type ReviewData = Prisma.ReviewGetPayload<{
  include: ReturnType<typeof getReviewDataInclude>;
}>;

export interface ReviewsPage {
  posts: ReviewData[];
  nextCursor: string | null;
}

// Legacy exports for backward compatibility during migration
export type PostData = ReviewData;
export interface PostsPage extends ReviewsPage {}
export function getPostDataInclude(loggedInUserId: string) {
  return getReviewDataInclude(loggedInUserId);
}

export function getCommentDataInclude(loggedInUserId: string) {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId),
    },
  } satisfies Prisma.CommentInclude;
}

export type CommentData = Prisma.CommentGetPayload<{
  include: ReturnType<typeof getCommentDataInclude>;
}>;

export interface CommentsPage {
  comments: CommentData[];
  previousCursor: string | null;
}

export const notificationsInclude = {
  issuer: {
    select: {
      username: true,
      displayName: true,
      avatarUrl: true,
    },
  },
  review: {
    select: {
      content: true,
    },
  },
} satisfies Prisma.NotificationInclude;

export type NotificationData = Prisma.NotificationGetPayload<{
  include: typeof notificationsInclude;
}>;

export interface NotificationsPage {
  notifications: NotificationData[];
  nextCursor: string | null;
}

export interface FollowerInfo {
  followers: number;
  isFollowedByUser: boolean;
}

export interface LikeInfo {
  likes: number;
  isLikedByUser: boolean;
}

export interface BookmarkInfo {
  isBookmarkedByUser: boolean;
}

export interface NotificationCountInfo {
  unreadCount: number;
}

export function getRestaurantDataSelect(loggedInUserId: string) {
  return {
    id: true,
    name: true,
    slug: true,
    description: true,
    address: true,
    city: true,
    province: true,
    cuisineType: true,
    priceRange: true,
    imageUrl: true,
    latitude: true,
    longitude: true,
    createdAt: true,
    bookmarks: {
      where: {
        userId: loggedInUserId,
      },
      select: {
        userId: true,
      },
    },
    favorites: {
      where: {
        userId: loggedInUserId,
      },
      select: {
        userId: true,
      },
    },
    visited: {
      where: {
        userId: loggedInUserId,
      },
      select: {
        userId: true,
      },
    },
    _count: {
      select: {
        reviews: true,
        bookmarks: true,
        favorites: true,
        visited: true,
      },
    },
  } satisfies Prisma.RestaurantSelect;
}

export type RestaurantData = Prisma.RestaurantGetPayload<{
  select: ReturnType<typeof getRestaurantDataSelect>;
}>;

export interface RestaurantInfo {
  isBookmarkedByUser: boolean;
  isFavoritedByUser: boolean;
  isVisitedByUser: boolean;
}
