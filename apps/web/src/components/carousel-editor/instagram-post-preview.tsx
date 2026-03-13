"use client";

import type { CarouselTemplate, GeneratedSlide } from "@/lib/api-client";
import { SlideRenderer } from "./slide-renderer";
import { getSchemaForSlide } from "./utils";

interface InstagramPostPreviewProps {
  slides: GeneratedSlide[];
  activeIndex: number;
  onNavigate: (index: number) => void;
  template: CarouselTemplate;
  family?: string | null;
  projectTitle: string;
  instagramHandle?: string;
}

const POST_WIDTH = 420;

export function InstagramPostPreview({
  slides,
  activeIndex,
  onNavigate,
  template,
  family,
  projectTitle,
  instagramHandle,
}: InstagramPostPreviewProps) {
  const handle = instagramHandle || "deenkraft";
  const currentSlide = slides[activeIndex];
  const schema = getSchemaForSlide(currentSlide, template);
  const scale = POST_WIDTH / schema.width;
  const imageHeight = schema.height * scale;

  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < slides.length - 1;

  return (
    <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto bg-zinc-100 p-4 dark:bg-zinc-900">
      <div
        className="shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
        style={{ width: POST_WIDTH }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400" />
          <span className="flex-1 text-sm font-semibold text-zinc-900 dark:text-white">
            {handle}
          </span>
          <button className="text-zinc-500 dark:text-zinc-400" aria-label="More">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
        </div>

        {/* Image area */}
        <div
          className="relative overflow-hidden bg-zinc-50 dark:bg-zinc-900"
          style={{ width: POST_WIDTH, height: imageHeight }}
        >
          <SlideRenderer
            schema={schema}
            content={currentSlide.content}
            scale={scale}
            family={family}
            slideType={currentSlide.slideType}
          />

          {/* Prev arrow */}
          {canGoPrev && (
            <button
              onClick={() => onNavigate(activeIndex - 1)}
              className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow transition-colors hover:bg-white dark:bg-black/50 dark:hover:bg-black/70"
              aria-label="Previous slide"
            >
              <svg className="h-4 w-4 text-zinc-800 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Next arrow */}
          {canGoNext && (
            <button
              onClick={() => onNavigate(activeIndex + 1)}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow transition-colors hover:bg-white dark:bg-black/50 dark:hover:bg-black/70"
              aria-label="Next slide"
            >
              <svg className="h-4 w-4 text-zinc-800 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Slide indicator dots */}
          {slides.length > 1 && (
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1">
              {slides.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${
                    i === activeIndex
                      ? "bg-blue-500"
                      : "bg-white/60"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Action bar */}
        <div className="flex items-center px-4 py-3">
          <div className="flex flex-1 items-center gap-4">
            {/* Heart */}
            <svg className="h-6 w-6 text-zinc-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            {/* Comment */}
            <svg className="h-6 w-6 text-zinc-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9 9 0 10-9-9c0 1.488.36 2.89 1 4.127L3 21l4.873-1c1.236.64 2.64 1 4.127 1z" />
            </svg>
            {/* Share / Send */}
            <svg className="h-6 w-6 text-zinc-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 12L3 21l18-9L3 3l3 9zm0 0h6" />
            </svg>
          </div>
          {/* Bookmark */}
          <svg className="h-6 w-6 text-zinc-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>
        </div>

        {/* Likes, caption, comments */}
        <div className="px-4 pb-4">
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">
            1,234 likes
          </p>

          <p className="mt-1 text-sm text-zinc-900 dark:text-white">
            <span className="font-semibold">{handle}</span>{" "}
            <span className="text-zinc-700 dark:text-zinc-300">{projectTitle}</span>
          </p>

          <p className="mt-1 cursor-pointer text-sm text-zinc-400 dark:text-zinc-500">
            View all 47 comments
          </p>

          <div className="mt-1 space-y-0.5 text-sm">
            <p className="text-zinc-900 dark:text-white">
              <span className="font-semibold">ummabdullah_</span>{" "}
              <span className="text-zinc-700 dark:text-zinc-300">
                MashaAllah, this is beautiful!
              </span>
            </p>
            <p className="text-zinc-900 dark:text-white">
              <span className="font-semibold">brother_imran</span>{" "}
              <span className="text-zinc-700 dark:text-zinc-300">
                JazakAllah Khair for sharing
              </span>
            </p>
          </div>

          <p className="mt-2 text-[10px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            2 hours ago
          </p>
        </div>
      </div>
    </div>
  );
}
