// @ts-nocheck
import { STAGE_STYLES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { VentureStage } from "@/types/database";

export function StageBadge({ stage }: { stage: VentureStage }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        STAGE_STYLES[stage],
      )}
    >
      {stage}
    </span>
  );
}
