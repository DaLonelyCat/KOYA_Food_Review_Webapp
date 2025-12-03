"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface RestaurantImageCarouselProps {
  images: string[];
  restaurantName: string;
}

export default function RestaurantImageCarousel({
  images,
  restaurantName,
}: RestaurantImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const isDragging = useRef(false);

  // Minimum swipe distance (in pixels) to trigger navigation
  const minSwipeDistance = 50;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const handleSwipe = (startX: number, endX: number) => {
    const distance = startX - endX;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  // Touch events for mobile
  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    handleSwipe(touchStartX.current, touchEndX.current);

    // Reset touch positions
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Mouse events for desktop
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    touchEndX.current = null;
    touchStartX.current = e.clientX;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    touchEndX.current = e.clientX;
  };

  const onMouseUp = () => {
    if (!isDragging.current) return;

    if (touchStartX.current !== null && touchEndX.current !== null) {
      handleSwipe(touchStartX.current, touchEndX.current);
    }

    isDragging.current = false;
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const onMouseLeave = () => {
    if (isDragging.current) {
      isDragging.current = false;
      touchStartX.current = null;
      touchEndX.current = null;
    }
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-muted">
      {/* Image Container with 4:3 aspect ratio */}
      <div
        className="relative aspect-[4/3] w-full cursor-grab active:cursor-grabbing touch-pan-y select-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      >
        {images.map((image, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 transition-opacity duration-300",
              index === currentIndex ? "opacity-100" : "opacity-0",
            )}
          >
            {image ? (
              <Image
                src={image}
                alt={`${restaurantName} - Image ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
                draggable={false}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <span className="text-6xl">🍽️</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "h-2 rounded-full transition-all",
                index === currentIndex
                  ? "w-8 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/75",
              )}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

