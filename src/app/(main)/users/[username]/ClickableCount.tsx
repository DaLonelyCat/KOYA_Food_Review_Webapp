"use client";

import FollowersFollowingDialog from "@/components/FollowersFollowingDialog";
import { formatNumber } from "@/lib/utils";
import { useState } from "react";

interface ClickableCountProps {
  userId: string;
  count: number;
  type: "followers" | "following";
}

export default function ClickableCount({
  userId,
  count,
  type,
}: ClickableCountProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hover:underline cursor-pointer"
      >
        <span className="capitalize">{type}: </span>
        <span className="font-semibold">{formatNumber(count)}</span>
      </button>
      <FollowersFollowingDialog
        userId={userId}
        type={type}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}

