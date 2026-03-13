"use client";

import { useState } from "react";
import type {
  CarouselTemplate,
  GeneratedSlide,
  SlideElementSchema,
} from "@/lib/api-client";
import { getSchemaForSlide } from "./utils";

interface ContentEditorProps {
  slide: GeneratedSlide;
  template: CarouselTemplate;
  onChange: (key: string, value: string) => void;
  onRegenerate?: (instructions?: string) => void;
  regenerating?: boolean;
}

function isHidden(element: SlideElementSchema): boolean {
  const style = element.style as Record<string, unknown>;
  return style.display === "none";
}

function ElementField({
  element,
  value,
  onChange,
}: {
  element: SlideElementSchema;
  value: string;
  onChange: (value: string) => void;
}) {
  const isLong = element.key === "body";
  const isColor = element.key === "backgroundColor";

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {element.label}
      </label>
      {isColor ? (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={value || "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 w-9 shrink-0 cursor-pointer rounded border border-zinc-200 bg-transparent p-0.5 dark:border-zinc-700"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 flex-1 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          />
        </div>
      ) : isLong ? (
        <textarea
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
        />
      )}
    </div>
  );
}

export function ContentEditor({
  slide,
  template,
  onChange,
  onRegenerate,
  regenerating,
}: ContentEditorProps) {
  const [showRegen, setShowRegen] = useState(false);
  const [instructions, setInstructions] = useState("");
  const schema = getSchemaForSlide(slide, template);

  const handleRegenerate = () => {
    onRegenerate?.(instructions || undefined);
    setInstructions("");
    setShowRegen(false);
  };

  // Filter to visible text elements only
  const editableElements = schema.elements.filter(
    (el) => el.type === "text" && !isHidden(el),
  );

  return (
    <div className="flex flex-col gap-4 overflow-y-auto p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Slide {slide.slideIndex + 1}
          </p>
          <p className="mt-0.5 text-sm font-medium capitalize text-zinc-700 dark:text-zinc-300">
            {slide.slideType} slide
          </p>
        </div>
        {onRegenerate && (
          <button
            onClick={() => setShowRegen(!showRegen)}
            disabled={regenerating}
            className="rounded-md px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 dark:text-indigo-400 dark:hover:bg-indigo-950"
          >
            {regenerating ? "Regenerating..." : "Regenerate"}
          </button>
        )}
      </div>

      {showRegen && (
        <div className="flex flex-col gap-2 rounded-md border border-indigo-200 bg-indigo-50/50 p-3 dark:border-indigo-800 dark:bg-indigo-950/30">
          <textarea
            rows={2}
            placeholder="Optional instructions (e.g. make it shorter, change tone...)"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 dark:border-indigo-800 dark:bg-zinc-900 dark:text-white"
          />
          <div className="flex gap-2">
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="flex-1 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {regenerating ? "Regenerating..." : "Regenerate slide"}
            </button>
            <button
              onClick={() => setShowRegen(false)}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {editableElements.map((element) => (
        <ElementField
          key={element.key}
          element={element}
          value={slide.content[element.key] ?? element.defaultValue ?? ""}
          onChange={(value) => onChange(element.key, value)}
        />
      ))}
    </div>
  );
}
