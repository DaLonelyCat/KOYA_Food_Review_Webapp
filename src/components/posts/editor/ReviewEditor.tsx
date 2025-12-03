"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
import SearchRestaurantDialog from "@/components/restaurants/SearchRestaurantDialog";
import { cn } from "@/lib/utils";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useDropzone } from "@uploadthing/react";
import { ImageIcon, Loader2, X, Star, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { ClipboardEvent, useEffect, useRef, useState } from "react";
import { useSubmitReviewMutation } from "./mutations";
import "./styles.css";
import useMediaUpload, { Attachment } from "./useMediaUpload";

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

interface ReviewEditorProps {
  initialRestaurant?: Restaurant | null;
  onRestaurantChange?: (restaurant: Restaurant | null) => void;
  onSuccess?: () => void;
}

export default function ReviewEditor({
  initialRestaurant = null,
  onRestaurantChange,
  onSuccess,
}: ReviewEditorProps = {}) {
  const { user } = useSession();
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(initialRestaurant || null);
  const [rating, setRating] = useState<number | null>(null);
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [input, setInput] = useState("");

  // Update selected restaurant when initialRestaurant changes
  useEffect(() => {
    if (initialRestaurant) {
      setSelectedRestaurant(initialRestaurant);
    }
  }, [initialRestaurant]);

  const mutation = useSubmitReviewMutation();

  const {
    startUpload,
    attachments,
    isUploading,
    uploadProgress,
    removeAttachment,
    reset: resetMediaUploads,
  } = useMediaUpload();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: startUpload,
  });

  const { onClick, ...rootProps } = getRootProps();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: selectedRestaurant
          ? "Write your review..."
          : "Choose a restaurant to review",
      }),
    ],
    editable: !!selectedRestaurant,
    onUpdate: ({ editor }) => {
      setInput(editor.getText({ blockSeparator: "\n" }));
    },
  });

  // Update input when editor is ready
  useEffect(() => {
    if (editor) {
      setInput(editor.getText({ blockSeparator: "\n" }));
    }
  }, [editor]);

  // Update editor editable state when restaurant selection changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(!!selectedRestaurant);
    }
  }, [editor, selectedRestaurant]);

  function onSubmit() {
    if (!selectedRestaurant || !editor) return;

    const content = editor.getText({ blockSeparator: "\n" });
    if (!content.trim()) return;

    mutation.mutate(
      {
        content,
        mediaIds: attachments.map((a) => a.mediaId).filter(Boolean) as string[],
        restaurantId: selectedRestaurant.id,
        rating: rating || undefined,
      },
      {
        onSuccess: () => {
          editor.commands.clearContent();
          setInput("");
          resetMediaUploads();
          setSelectedRestaurant(null);
          setRating(null);
          onSuccess?.();
        },
      },
    );
  }

  function onPaste(e: ClipboardEvent<HTMLInputElement>) {
    const files = Array.from(e.clipboardData.items)
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile()) as File[];
    startUpload(files);
  }

  function handleRestaurantSelect(restaurant: Restaurant) {
    setSelectedRestaurant(restaurant);
    onRestaurantChange?.(restaurant);
    editor?.commands.focus();
  }

  function handleRemoveRestaurant() {
    setSelectedRestaurant(null);
    onRestaurantChange?.(null);
    setRating(null);
    editor?.commands.clearContent();
    setInput("");
  }

  return (
    <>
      <div className="flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-sm">
        {!selectedRestaurant ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <Button
              onClick={() => setShowSearchDialog(true)}
              className="w-full sm:w-auto"
            >
              Choose Restaurant
            </Button>
            <p className="text-sm text-muted-foreground">
              Select a restaurant to write a review
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <button
                onClick={handleRemoveRestaurant}
                className="mt-1 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  {selectedRestaurant.imageUrl ? (
                    <Image
                      src={selectedRestaurant.imageUrl}
                      alt={selectedRestaurant.name}
                      width={64}
                      height={64}
                      className="size-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex size-16 items-center justify-center rounded-lg bg-muted">
                      <span className="text-2xl">🍽️</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{selectedRestaurant.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedRestaurant.city && selectedRestaurant.address
                        ? `${selectedRestaurant.address}, ${selectedRestaurant.city}`
                        : selectedRestaurant.city || selectedRestaurant.address || ""}
                    </p>
                    {selectedRestaurant.cuisineType && (
                      <p className="text-xs text-muted-foreground">
                        {selectedRestaurant.cuisineType}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm">Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setRating(rating === star ? null : star)
                        }
                        className="transition-colors"
                      >
                        <Star
                          size={20}
                          className={cn(
                            rating && star <= rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground",
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-5">
              <UserAvatar avatarUrl={user.avatarUrl} className="hidden sm:inline" />
              <div {...rootProps} className="w-full">
                <EditorContent
                  editor={editor}
                  className={cn(
                    "max-h-[20rem] w-full overflow-y-auto rounded-2xl bg-background px-5 py-3",
                    isDragActive && "outline-dashed",
                  )}
                  onPaste={onPaste}
                />
                <input {...getInputProps()} />
              </div>
            </div>
            {!!attachments.length && (
              <AttachmentPreviews
                attachments={attachments}
                removeAttachment={removeAttachment}
              />
            )}
            <div className="flex items-center justify-end gap-3">
              {isUploading && (
                <>
                  <span className="text-sm">{uploadProgress ?? 0}%</span>
                  <Loader2 className="size-5 animate-spin text-primary" />
                </>
              )}
              <AddAttachmentsButton
                onFilesSelected={startUpload}
                disabled={isUploading || attachments.length >= 5}
              />
              <LoadingButton
                onClick={onSubmit}
                loading={mutation.isPending}
                disabled={!input.trim() || isUploading}
                className="min-w-20"
              >
                Post Review
              </LoadingButton>
            </div>
          </>
        )}
      </div>
      <SearchRestaurantDialog
        open={showSearchDialog}
        onOpenChange={setShowSearchDialog}
        onSelect={handleRestaurantSelect}
      />
    </>
  );
}

interface AddAttachmentsButtonProps {
  onFilesSelected: (files: File[]) => void;
  disabled: boolean;
}

function AddAttachmentsButton({
  onFilesSelected,
  disabled,
}: AddAttachmentsButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-primary hover:text-primary"
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
      >
        <ImageIcon size={20} />
      </Button>
      <input
        type="file"
        accept="image/*, video/*"
        multiple
        ref={fileInputRef}
        className="sr-only hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) {
            onFilesSelected(files);
            e.target.value = "";
          }
        }}
      />
    </>
  );
}

interface AttachmentPreviewsProps {
  attachments: Attachment[];
  removeAttachment: (fileName: string) => void;
}

function AttachmentPreviews({
  attachments,
  removeAttachment,
}: AttachmentPreviewsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        attachments.length > 1 && "sm:grid sm:grid-cols-2",
      )}
    >
      {attachments.map((attachment) => (
        <AttachmentPreview
          key={attachment.file.name}
          attachment={attachment}
          onRemoveClick={() => removeAttachment(attachment.file.name)}
        />
      ))}
    </div>
  );
}

interface AttachmentPreviewProps {
  attachment: Attachment;
  onRemoveClick: () => void;
}

function AttachmentPreview({
  attachment: { file, mediaId, isUploading },
  onRemoveClick,
}: AttachmentPreviewProps) {
  const src = URL.createObjectURL(file);

  return (
    <div
      className={cn("relative mx-auto size-fit", isUploading && "opacity-50")}
    >
      {file.type.startsWith("image") ? (
        <Image
          src={src}
          alt="Attachment preview"
          width={500}
          height={500}
          className="size-fit max-h-[30rem] rounded-2xl"
        />
      ) : (
        <video controls className="size-fit max-h-[30rem] rounded-2xl">
          <source src={src} type={file.type} />
        </video>
      )}
      {!isUploading && (
        <button
          onClick={onRemoveClick}
          className="absolute right-3 top-3 rounded-full bg-foreground p-1.5 text-background transition-colors hover:bg-foreground/60"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
}

