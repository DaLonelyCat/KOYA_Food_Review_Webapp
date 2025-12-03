import { validateRequest } from "@/auth";
import Linkify from "@/components/Linkify";
import TrendsSidebar from "@/components/TrendsSidebar";
import RestaurantActionButton from "@/components/restaurants/RestaurantActionButton";
import RestaurantImageCarousel from "@/components/restaurants/RestaurantImageCarousel";
import RestaurantUserAvatars from "@/components/restaurants/RestaurantUserAvatars";
import RestaurantMenuButton from "@/components/restaurants/RestaurantMenuButton";
import prisma from "@/lib/prisma";
import {
  getRestaurantDataSelect,
  getUserDataSelect,
  RestaurantData,
  RestaurantInfo,
  UserData,
} from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { formatDate } from "date-fns";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { MapPin, Star } from "lucide-react";
import RestaurantReviews from "./RestaurantReviews";
import PostReviewButton from "./PostReviewButton";

function PriceRangeDisplay({ priceRange }: { priceRange: number }) {
  const dollarSigns = "$".repeat(priceRange);
  
  // Color mapping: 1 = green, 2 = yellow, 3 = orange, 4 = red
  const colorClasses = {
    1: "text-green-600 dark:text-green-400",
    2: "text-yellow-600 dark:text-yellow-400",
    3: "text-orange-600 dark:text-orange-400",
    4: "text-red-600 dark:text-red-400",
  };

  return (
    <span
      className={`text-lg font-semibold ${colorClasses[priceRange as keyof typeof colorClasses]}`}
    >
      {dollarSigns}
    </span>
  );
}

interface PageProps {
  params: { slug: string };
}

const getRestaurant = cache(async (slug: string, loggedInUserId: string) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: {
      slug,
    },
    select: getRestaurantDataSelect(loggedInUserId),
  });

  if (!restaurant) notFound();

  return restaurant;
});

export async function generateMetadata({
  params: { slug },
}: PageProps): Promise<Metadata> {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) return {};

  const restaurant = await getRestaurant(slug, loggedInUser.id);

  return {
    title: `${restaurant.name} - Koya`,
  };
}

export default async function Page({ params: { slug } }: PageProps) {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page.
      </p>
    );
  }

  const restaurant = await getRestaurant(slug, loggedInUser.id);

  const restaurantInfo: RestaurantInfo = {
    isBookmarkedByUser: restaurant.bookmarks.length > 0,
    isFavoritedByUser: restaurant.favorites.length > 0,
    isVisitedByUser: restaurant.visited.length > 0,
  };

  // Calculate average rating
  const reviews = await prisma.review.findMany({
    where: {
      restaurantId: restaurant.id,
      rating: { not: null },
    },
    select: {
      rating: true,
    },
  });

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      : null;

  // Fetch random users who favorited (max 5)
  const favoriteUsers = await prisma.restaurantFavorite.findMany({
    where: {
      restaurantId: restaurant.id,
    },
    select: {
      user: {
        select: getUserDataSelect(loggedInUser.id),
      },
    },
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
  });

  // Fetch random users who visited (max 5)
  const visitedUsers = await prisma.restaurantVisited.findMany({
    where: {
      restaurantId: restaurant.id,
    },
    select: {
      user: {
        select: getUserDataSelect(loggedInUser.id),
      },
    },
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
  });

  // Shuffle arrays to show random users
  const shuffledFavorites = favoriteUsers
    .map((f) => f.user)
    .sort(() => Math.random() - 0.5);
  const shuffledVisited = visitedUsers
    .map((v) => v.user)
    .sort(() => Math.random() - 0.5);

  // Placeholder images for carousel (max 5)
  // TODO: Replace with actual restaurant images from database when available
  const restaurantImages = restaurant.imageUrl
    ? [restaurant.imageUrl, ...Array(4).fill(null)]
    : Array(5).fill(null);

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        {/* Image Carousel Banner */}
        <RestaurantImageCarousel
          images={restaurantImages}
          restaurantName={restaurant.name}
        />
        <RestaurantProfile
          restaurant={restaurant}
          restaurantInfo={restaurantInfo}
          averageRating={averageRating}
          favoriteUsers={shuffledFavorites}
          visitedUsers={shuffledVisited}
        />
        <div className="flex items-center justify-between rounded-2xl bg-card p-5 shadow-sm">
          <h2 className="text-2xl font-bold">Reviews</h2>
          <PostReviewButton restaurant={restaurant} />
        </div>
        <RestaurantReviews restaurantId={restaurant.id} />
      </div>
      <TrendsSidebar />
    </main>
  );
}

interface RestaurantProfileProps {
  restaurant: RestaurantData;
  restaurantInfo: RestaurantInfo;
  averageRating: number | null;
  favoriteUsers: UserData[];
  visitedUsers: UserData[];
}

async function RestaurantProfile({
  restaurant,
  restaurantInfo,
  averageRating,
  favoriteUsers,
  visitedUsers,
}: RestaurantProfileProps) {
  return (
    <div className="h-fit w-full space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">{restaurant.name}</h1>
          {restaurant.city && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin size={16} />
              <a
                href={
                  restaurant.latitude && restaurant.longitude
                    ? `https://www.google.com/maps?q=${restaurant.latitude},${restaurant.longitude}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        restaurant.address
                          ? `${restaurant.address}, ${restaurant.city}${restaurant.province ? `, ${restaurant.province}` : ""}`
                          : `${restaurant.city}${restaurant.province ? `, ${restaurant.province}` : ""}`,
                      )}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-1 underline-offset-2 transition-colors hover:text-foreground"
              >
                {restaurant.address
                  ? `${restaurant.address}, ${restaurant.city}`
                  : restaurant.city}
                {restaurant.province && `, ${restaurant.province}`}
              </a>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {averageRating !== null && (
            <div className="flex items-center gap-2">
              <Star className="size-5 fill-yellow-400 text-yellow-400" />
              <span className="text-lg font-semibold">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground">
                ({restaurant._count.reviews} reviews)
              </span>
            </div>
          )}
          {restaurant.cuisineType && (
            <span className="rounded-full bg-muted px-3 py-1 text-sm">
              {restaurant.cuisineType}
            </span>
          )}
          {restaurant.priceRange && (
            <PriceRangeDisplay priceRange={restaurant.priceRange} />
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <RestaurantActionButton
            restaurantId={restaurant.id}
            action="bookmark"
            initialState={restaurantInfo}
          />
          <RestaurantActionButton
            restaurantId={restaurant.id}
            action="favorite"
            initialState={restaurantInfo}
          />
          <RestaurantActionButton
            restaurantId={restaurant.id}
            action="visited"
            initialState={restaurantInfo}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <RestaurantUserAvatars
          restaurantId={restaurant.id}
          type="favorites"
          count={restaurant._count.favorites}
          randomUsers={favoriteUsers}
        />
        <RestaurantUserAvatars
          restaurantId={restaurant.id}
          type="visited"
          count={restaurant._count.visited}
          randomUsers={visitedUsers}
        />
      </div>

      <RestaurantMenuButton />
    </div>
  );
}
