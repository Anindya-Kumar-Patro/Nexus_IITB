"use client";

import { useTransition } from "react";
import { Check, X } from "lucide-react";
import { updateApplicationStatus } from "@/actions/applications";
import { Button } from "@/components/ui/button";

export function ApplicationActions({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <Button
        disabled={pending}
        onClick={() => startTransition(() => updateApplicationStatus(id, "accepted"))}
      >
        <Check size={16} /> Accept
      </Button>
      <Button
        variant="secondary"
        disabled={pending}
        onClick={() => startTransition(() => updateApplicationStatus(id, "rejected"))}
      >
        <X size={16} /> Reject
      </Button>
    </div>
  );
}