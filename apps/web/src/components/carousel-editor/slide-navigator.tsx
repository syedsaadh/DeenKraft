"use client";

import type { CarouselTemplate, GeneratedSlide } from "@/lib/api-client";
import { SlideRenderer } from "./slide-renderer";
import { getSchemaForSlide, slideTypeLabel } from "./utils";

interface SlideNavigatorProps {
  slides: GeneratedSlide[];
  template: CarouselTemplate;
  activeIndex: number;
  onSelect: (index: number) => void;
  dirtyIndices?: Set<number>;
  family?: string | null;
}

export function SlideNavigator({
  slides,
  template,
  activeIndex,
  onSelect,
  dirtyIndices,
  family,
}: SlideNavigatorProps) {
  const thumbScale = 0.12;

  return (
    <div className="flex flex-col gap-2 overflow-y-auto p-3">
      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        Slides
      </p>
      {slides.map((slide, index) => {
        const schema = getSchemaForSlide(slide, template);
        const isActive = index === activeIndex;
        const isDirty = dirtyIndices?.has(index);

        return (
          <button
            key={index}
            onClick={() => onSelect(index)}
            className={`flex flex-col items-center gap-1 rounded-lg border p-2 transition-all ${
              isActive
                ? "border-zinc-900 bg-zinc-50 dark:border-white dark:bg-zinc-900"
                : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
            }`}
          >
            <div
              className="overflow-hidden rounded"
              style={{
                width: schema.width * thumbScale,
                height: schema.height * thumbScale,
              }}
            >
              <SlideRenderer
                schema={schema}
                content={slide.content}
                scale={thumbScale}
                family={family}
                slideType={slide.slideType}
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-zinc-500">
                {slideTypeLabel(slide, slides.length)}
              </span>
              {isDirty && (
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" title="Unsaved changes" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
