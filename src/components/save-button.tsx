// @ts-nocheck
"use client";

import { useState, useTransition } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toggleBookmark } from "@/actions/bookmarks";
import { AuthModal } from "@/components/auth-modal";
import { cn } from "@/lib/utils";

export function SaveButton({
  ventureId,
  initialSaved,
  isAuthed,
}: {
  ventureId: string;
  initialSaved: boolean;
  isAuthed: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [authOpen, setAuthOpen] = useState(false);
  const [, startTransition] = useTransition();

  const onClick = () => {
    if (!isAuthed) {
      setAuthOpen(true);
      return;
    }
    const wasSaved = saved;
    setSaved(!wasSaved);
    startTransition(() => {
      toggleBookmark(ventureId, wasSaved);
    });
  };

  return (
    <>
      <button
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition",
          saved
            ? "border-brand-600 bg-brand-50 text-brand-800"
            : "border-line bg-white text-ink-2 hover:bg-brand-50",
        )}
      >
        {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        {saved ? "Saved" : "Save"}
      </button>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}