"use client";

import { Checkbox } from "@/components/ui/checkbox";

export function SaveAsDefaultTrigger({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
}) {
  return (
    <div
      data-save-default
      className="flex items-center gap-1 shrink-0 pl-0.5"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={(c) => onCheckedChange(c === true)}
      />
      <span className="text-[10px] sm:text-xs text-muted-foreground leading-tight select-none whitespace-nowrap">
        Save as default
      </span>
    </div>
  );
}
