"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EditorToolbarProps {
  title: string;
  status: string;
  onGenerate: () => void;
  onExport: () => void;
  generating: boolean;
  exporting: boolean;
  hasSlides: boolean;
}

export function EditorToolbar({
  title,
  status,
  onGenerate,
  onExport,
  generating,
  exporting,
  hasSlides,
}: EditorToolbarProps) {
  return (
    <div className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-sm font-semibold text-zinc-900 dark:text-white">
          {title}
        </h1>
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          {status}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onGenerate}
          disabled={generating}
        >
          {generating ? "Generating..." : "Regenerate"}
        </Button>
        <Button
          size="sm"
          onClick={onExport}
          disabled={exporting || !hasSlides}
        >
          {exporting ? "Exporting..." : "Export PNGs"}
        </Button>
      </div>
    </div>
  );
}
