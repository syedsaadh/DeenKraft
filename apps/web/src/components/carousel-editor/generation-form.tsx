"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CarouselTemplate, UserPreferences } from "@/lib/api-client";

const TONE_PRESETS = [
  "Inspirational & warm",
  "Professional & authoritative",
  "Casual & friendly",
  "Educational & clear",
  "Bold & motivational",
];

interface GenerationFormProps {
  topic: string;
  template: CarouselTemplate;
  generating: boolean;
  onGenerate: (params: {
    topic: string;
    slideCount: number;
    audience?: string;
    tone?: string;
    ctaGoal?: string;
  }) => void;
  onCancel?: () => void;
  savedPreferences?: UserPreferences | null;
}

export function GenerationForm({
  topic: initialTopic,
  template,
  generating,
  onGenerate,
  onCancel,
  savedPreferences,
}: GenerationFormProps) {
  const [topic, setTopic] = useState(initialTopic);
  const [slideCount, setSlideCount] = useState(
    savedPreferences?.preferredSlideCount ?? template.slideCount,
  );
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState(savedPreferences?.preferredTone ?? "");
  const [ctaGoal, setCtaGoal] = useState(savedPreferences?.ctaStyle ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const next: Record<string, string> = {};

    if (!topic.trim()) {
      next.topic = "Topic is required";
    }
    if (slideCount < 3 || slideCount > 15) {
      next.slideCount = "Slide count must be between 3 and 15";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    onGenerate({
      topic: topic.trim(),
      slideCount,
      audience: audience.trim() || undefined,
      tone: tone.trim() || undefined,
      ctaGoal: ctaGoal.trim() || undefined,
    });
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="mb-6 text-center">
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl"
          style={{ backgroundColor: template.coverSlideSchema.backgroundColor }}
        >
          <svg
            className="h-7 w-7 text-white/80"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
          Generate carousel content
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Using{" "}
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            {template.name}
          </span>{" "}
          template
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Topic */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="gen-topic"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Topic / Prompt <span className="text-red-500">*</span>
          </label>
          <textarea
            id="gen-topic"
            rows={3}
            placeholder="e.g. 5 Sunnahs every Muslim should practice on Fridays, with Hadith references"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={generating}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
          />
          {errors.topic && (
            <p className="text-sm text-red-600">{errors.topic}</p>
          )}
        </div>

        {/* Audience */}
        <Input
          id="gen-audience"
          label="Target Audience"
          placeholder="e.g. Young Muslim professionals aged 20-35"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          disabled={generating}
        />

        {/* Tone */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="gen-tone"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Tone
          </label>
          <input
            id="gen-tone"
            type="text"
            placeholder="e.g. Inspirational & warm"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            disabled={generating}
            className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
          />
          <div className="flex flex-wrap gap-1.5">
            {TONE_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setTone(preset)}
                disabled={generating}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                  tone === preset
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* CTA Goal */}
        <Input
          id="gen-cta"
          label="CTA Goal"
          placeholder="e.g. Follow for daily Islamic reminders"
          value={ctaGoal}
          onChange={(e) => setCtaGoal(e.target.value)}
          disabled={generating}
        />

        {/* Slide Count */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="gen-slides"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Number of Slides
          </label>
          <div className="flex items-center gap-3">
            <input
              id="gen-slides"
              type="range"
              min={3}
              max={15}
              value={slideCount}
              onChange={(e) => setSlideCount(Number(e.target.value))}
              disabled={generating}
              className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-zinc-200 accent-zinc-900 dark:bg-zinc-700 dark:accent-white"
            />
            <span className="w-8 text-center text-sm font-semibold text-zinc-900 dark:text-white">
              {slideCount}
            </span>
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            1 cover + {slideCount - 2} content + 1 end slide
          </p>
          {errors.slideCount && (
            <p className="text-sm text-red-600">{errors.slideCount}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={generating} className="flex-1">
            {generating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Generating...
              </span>
            ) : (
              "Generate with AI"
            )}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={generating}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
