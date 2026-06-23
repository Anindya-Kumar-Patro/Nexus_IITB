"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteVenture } from "@/actions/ventures";

export function DeleteVentureButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-ink-2">Delete this venture?</span>
        <Button variant="danger" onClick={() => deleteVenture(id)}>
          Yes, delete
        </Button>
        <Button variant="ghost" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button variant="secondary" onClick={() => setConfirming(true)}>
      <Trash2 size={16} /> Delete
    </Button>
  );
}
