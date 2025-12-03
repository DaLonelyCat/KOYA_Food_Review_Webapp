"use client";

import { useState, useRef } from "react";
import { Menu } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

export default function RestaurantMenuButton() {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setMousePosition({ x, y });
    setZoom(2.5); // Zoom level when hovering
  };

  const handleMouseLeave = () => {
    setZoom(1);
    setMousePosition({ x: 50, y: 50 }); // Reset to center
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-accent"
      >
        <Menu className="size-5" />
        <span className="text-sm font-medium">Menu</span>
      </button>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            // Reset zoom when dialog closes
            setZoom(1);
            setMousePosition({ x: 50, y: 50 });
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Menu</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center">
            <div
              ref={imageContainerRef}
              className="relative h-[600px] w-full cursor-zoom-in overflow-hidden rounded-lg bg-muted"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div
                className="relative h-full w-full"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                }}
              >
                <Image
                  src="/location_placeholder.png"
                  alt="Restaurant menu"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
