"use client";

// Organism · DeskNoteCard — the AI "Desk Note": a risk-first narrative over the
// quant. Presentational; the page supplies the note + loading state. Fails quiet
// (renders nothing on error) since it's supplementary to the hard numbers.

import { Panel, PanelHeader, Badge, Skeleton } from "@/components/ui";
import type { DeskNote } from "@/lib/types";

export function DeskNoteCard({
  note,
  isLoading,
  error,
  eyebrow = "AI Desk Note",
}: {
  note?: DeskNote;
  isLoading?: boolean;
  error?: { message: string } | null;
  eyebrow?: string;
}) {
  if (error) return null;

  const isAi = note?.source === "openai";

  return (
    <Panel>
      <PanelHeader
        eyebrow={eyebrow}
        title={!note ? "Reading the tape…" : note.headline}
        right={
          note ? (
            <Badge
              fg={isAi ? "text-ion" : "text-mute"}
              bg={isAi ? "bg-ion/10" : "bg-mute/5"}
              bd={isAi ? "border-ion/40" : "border-line-2"}
            >
              {isAi ? "✦ AI" : "auto"}
            </Badge>
          ) : null
        }
      />

      {isLoading || !note ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ) : (
        <>
          <p className="text-sm leading-relaxed text-mute">{note.summary}</p>
          <div className="mt-3 rounded-[var(--radius-panel)] border border-line border-l-2 border-l-brass bg-brass/5 px-3 py-2">
            <div className="eyebrow text-brass">Risk check</div>
            <p className="mt-0.5 text-xs leading-relaxed text-mute">{note.risks}</p>
          </div>
          <p className="mt-3 text-[0.66rem] leading-snug text-faint">
            {note.disclaimer}
            {note.model ? ` · ${note.model}` : ""}
          </p>
        </>
      )}
    </Panel>
  );
}
