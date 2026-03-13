"use client";

import type { CarouselTemplate, GeneratedSlide } from "@/lib/api-client";
import { SlideRenderer } from "./slide-renderer";
import { getSchemaForSlide } from "./utils";

interface SlidePreviewProps {
  slide: GeneratedSlide;
  template: CarouselTemplate;
  family?: string | null;
}

export function SlidePreview({ slide, template, family }: SlidePreviewProps) {
  const schema = getSchemaForSlide(slide, template);
  const previewScale = 0.45;

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-900">
      <div
        className="rounded-lg shadow-2xl"
        style={{
          width: schema.width * previewScale,
          height: schema.height * previewScale,
        }}
      >
        <SlideRenderer
          schema={schema}
          content={slide.content}
          scale={previewScale}
          family={family}
          slideType={slide.slideType}
        />
      </div>
      <p className="mt-3 text-xs text-zinc-400">
        {schema.width} x {schema.height} &middot; Slide {slide.slideIndex + 1}
      </p>
    </div>
  );
}
