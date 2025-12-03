"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { ReviewData } from "@/lib/types";
import { cn, formatRelativeDate } from "@/lib/utils";
import { Media } from "@prisma/client";
import { MessageSquare, Star, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Comments from "../comments/Comments";
import Linkify from "../Linkify";
import UserAvatar from "../UserAvatar";
import UserTooltip from "../UserTooltip";
import BookmarkButton from "./BookmarkButton";
import LikeButton from "./LikeButton";
import PostMoreButton from "./PostMoreButton";

interface PostProps {
  post: ReviewData;
}

export default function Post({ post }: PostProps) {
  const { user } = useSession();

  const [showComments, setShowComments] = useState(false);

  return (
    <article className="group/post space-y-3 rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <UserTooltip user={post.user}>
            <Link href={`/users/${post.user.username}`}>
              <UserAvatar avatarUrl={post.user.avatarUrl} />
            </Link>
          </UserTooltip>
          <div>
            <UserTooltip user={post.user}>
              <Link
                href={`/users/${post.user.username}`}
                className="block font-medium hover:underline"
              >
                {post.user.displayName}
              </Link>
            </UserTooltip>
            <Link
              href={`/posts/${post.id}`}
              className="block text-sm text-muted-foreground hover:underline"
              suppressHydrationWarning
            >
              {formatRelativeDate(post.createdAt)}
            </Link>
          </div>
        </div>
        {post.user.id === user.id && (
          <PostMoreButton
            post={post}
            className="opacity-0 transition-opacity group-hover/post:opacity-100"
          />
        )}
      </div>
      {post.restaurant && (
        <div className="flex items-start gap-3 rounded-lg border p-3">
          {post.restaurant.imageUrl ? (
            <Image
              src={post.restaurant.imageUrl}
              alt={post.restaurant.name}
              width={64}
              height={64}
              className="size-16 rounded-lg object-cover"
            />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-lg bg-muted">
              <span className="text-2xl">🍽️</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <Link
              href={`/restaurants/${post.restaurant.slug}`}
              className="font-semibold hover:underline"
            >
              {post.restaurant.name}
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {post.restaurant.city && (
                <>
                  <MapPin size={14} />
                  <span>
                    {post.restaurant.address
                      ? `${post.restaurant.address}, ${post.restaurant.city}`
                      : post.restaurant.city}
                  </span>
                </>
              )}
            </div>
            {post.restaurant.cuisineType && (
              <div className="text-xs text-muted-foreground">
                {post.restaurant.cuisineType}
              </div>
            )}
          </div>
          {post.rating !== null && (
            <div className="flex items-center gap-1">
              <Star className="size-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">
                {post.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      )}
      <Linkify>
        <div className="whitespace-pre-line break-words">{post.content}</div>
      </Linkify>
      {!!post.attachments.length && (
        <MediaPreviews attachments={post.attachments} />
      )}
      <hr className="text-muted-foreground" />
      <div className="flex justify-between gap-5">
        <div className="flex items-center gap-5">
          <LikeButton
            postId={post.id}
            initialState={{
              likes: post._count.likes,
              isLikedByUser: post.likes.some((like) => like.userId === user.id),
            }}
          />
          <CommentButton
            post={post}
            onClick={() => setShowComments(!showComments)}
          />
        </div>
        <BookmarkButton
          postId={post.id}
          initialState={{
            isBookmarkedByUser: post.bookmarks.some(
              (bookmark) => bookmark.userId === user.id,
            ),
          }}
        />
      </div>
      {showComments && <Comments review={post} />}
    </article>
  );
}

interface MediaPreviewsProps {
  attachments: Media[];
}

function MediaPreviews({ attachments }: MediaPreviewsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        attachments.length > 1 && "sm:grid sm:grid-cols-2",
      )}
    >
      {attachments.map((m) => (
        <MediaPreview key={m.id} media={m} />
      ))}
    </div>
  );
}

interface MediaPreviewProps {
  media: Media;
}

function MediaPreview({ media }: MediaPreviewProps) {
  if (media.type === "IMAGE") {
    // Ensure URL is absolute
    let imageUrl = media.url.startsWith("http")
      ? media.url
      : `https://${media.url}`;

    // Fix old transformed URLs: convert /a/{appId}/ back to /f/ for custom subdomains
    // UploadThing custom subdomains (*.ufs.sh) don't support /a/ format, only /f/
    if (imageUrl.includes(".ufs.sh/a/")) {
      // Extract the file key after /a/{appId}/
      const match = imageUrl.match(/\.ufs\.sh\/a\/[^/]+\/(.+)$/);
      if (match) {
        imageUrl = imageUrl.replace(/\.ufs\.sh\/a\/[^/]+\//, ".ufs.sh/f/");
      }
    }

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt="Attachment"
        className="mx-auto size-fit max-h-[30rem] rounded-2xl"
        loading="lazy"
        onError={(e) => {
          console.error(
            "Failed to load image:",
            imageUrl,
            "Original URL:",
            media.url,
          );
          // You could show a placeholder image here
        }}
      />
    );
  }

  if (media.type === "VIDEO") {
    return (
      <div>
        <video
          src={media.url}
          controls
          className="mx-auto size-fit max-h-[30rem] rounded-2xl"
        />
      </div>
    );
  }

  return <p className="text-destructive">Unsupported media type</p>;
}

interface CommentButtonProps {
  post: ReviewData;
  onClick: () => void;
}

function CommentButton({ post, onClick }: CommentButtonProps) {
  return (
    <button onClick={onClick} className="flex items-center gap-2">
      <MessageSquare className="size-5" />
      <span className="text-sm font-medium tabular-nums">
        {post._count.comments}{" "}
        <span className="hidden sm:inline">comments</span>
      </span>
    </button>
  );
}
