"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDebounce } from "@/lib/hooks";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  address: string | null;
  city: string | null;
  cuisineType: string | null;
  priceRange: number | null;
}

interface SearchRestaurantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (restaurant: Restaurant) => void;
}

export default function SearchRestaurantDialog({
  open,
  onOpenChange,
  onSelect,
}: SearchRestaurantDialogProps) {
  const [query, setQuery] = useState("");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setRestaurants([]);
      return;
    }

    setIsLoading(true);
    fetch(`/api/restaurants/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((res) => res.json())
      .then((data) => {
        setRestaurants(data.restaurants || []);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [debouncedQuery]);

  function handleSelect(restaurant: Restaurant) {
    onSelect(restaurant);
    setQuery("");
    setRestaurants([]);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Search Restaurant</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search restaurants..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
          {isLoading && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          )}
          {!isLoading && restaurants.length === 0 && query && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No restaurants found
            </div>
          )}
          {!isLoading && restaurants.length > 0 && (
            <div className="max-h-[400px] space-y-2 overflow-y-auto">
              {restaurants.map((restaurant) => (
                <button
                  key={restaurant.id}
                  onClick={() => handleSelect(restaurant)}
                  className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent"
                >
                  {restaurant.imageUrl ? (
                    <Image
                      src={restaurant.imageUrl}
                      alt={restaurant.name}
                      width={48}
                      height={48}
                      className="size-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
                      <span className="text-lg">🍽️</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{restaurant.name}</div>
                    <div className="truncate text-sm text-muted-foreground">
                      {restaurant.city && restaurant.address
                        ? `${restaurant.address}, ${restaurant.city}`
                        : restaurant.city || restaurant.address || ""}
                    </div>
                    {restaurant.cuisineType && (
                      <div className="text-xs text-muted-foreground">
                        {restaurant.cuisineType}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

