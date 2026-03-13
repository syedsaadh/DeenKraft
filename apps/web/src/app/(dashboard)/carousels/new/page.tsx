"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TemplateCard } from "@/components/template-card";
import { TemplateCardSkeleton } from "@/components/ui/skeleton";
import * as api from "@/lib/api-client";

const TONE_PRESETS = [
  "Inspirational & warm",
  "Professional & authoritative",
  "Casual & friendly",
  "Educational & clear",
  "Bold & motivational",
];

const DENSITY_OPTIONS: {
  value: "minimal" | "moderate" | "detailed";
  label: string;
  description: string;
}[] = [
  { value: "minimal", label: "Minimal", description: "Short punchy phrases" },
  { value: "moderate", label: "Moderate", description: "1-3 clear sentences" },
  { value: "detailed", label: "Detailed", description: "Rich paragraphs with depth" },
];

const STEPS = [
  { number: 1, label: "Template" },
  { number: 2, label: "Details" },
  { number: 3, label: "Generate" },
];

function StepIndicator({
  currentStep,
  highestReached,
  onStepClick,
}: {
  currentStep: number;
  highestReached: number;
  onStepClick: (step: number) => void;
}) {
  return (
    <div className="mb-8 flex items-center justify-center">
      {STEPS.map((step, i) => {
        const isActive = step.number === currentStep;
        const isCompleted = step.number < currentStep;
        const isClickable = step.number <= highestReached && step.number !== currentStep;

        return (
          <div key={step.number} className="flex items-center">
            {/* Step circle + label */}
            <button
              type="button"
              onClick={() => isClickable && onStepClick(step.number)}
              disabled={!isClickable}
              className={`flex flex-col items-center gap-1.5 ${isClickable ? "cursor-pointer" : "cursor-default"}`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : isCompleted
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                      : "border-2 border-zinc-300 text-zinc-400 dark:border-zinc-600 dark:text-zinc-500"
                }`}
              >
                {isCompleted ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`text-xs font-medium ${
                  isActive
                    ? "text-zinc-900 dark:text-white"
                    : isCompleted
                      ? "text-zinc-600 dark:text-zinc-400"
                      : "text-zinc-400 dark:text-zinc-500"
                }`}
              >
                {step.label}
              </span>
            </button>

            {/* Connecting line */}
            {i < STEPS.length - 1 && (
              <div
                className={`mx-3 mb-5 h-0.5 w-16 sm:w-24 ${
                  step.number < currentStep
                    ? "bg-zinc-900 dark:bg-white"
                    : "bg-zinc-200 dark:bg-zinc-700"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function NewCarouselPage() {
  const router = useRouter();

  // Wizard state
  const [step, setStep] = useState(1);
  const [highestReached, setHighestReached] = useState(1);

  // Data
  const [templates, setTemplates] = useState<api.CarouselTemplate[]>([]);
  const [preferences, setPreferences] = useState<api.UserPreferences | null>(null);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  // Form fields
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("");
  const [audience, setAudience] = useState("");
  const [slideCount, setSlideCount] = useState(7);
  const [ctaGoal, setCtaGoal] = useState("");
  const [textDensity, setTextDensity] = useState<"minimal" | "moderate" | "detailed">("moderate");

  // Status
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.listTemplates({ page: 1, limit: 50 }),
      api.getPreferences().catch(() => null),
    ])
      .then(([res, prefs]) => {
        setTemplates(res.items);
        setPreferences(prefs);

        if (prefs?.preferredTemplateId) {
          const exists = res.items.some((t) => t.id === prefs.preferredTemplateId);
          if (exists) setSelectedTemplate(prefs.preferredTemplateId);
        }
        if (prefs?.preferredTone) setTone(prefs.preferredTone);
        if (prefs?.ctaStyle) setCtaGoal(prefs.ctaStyle);
        if (prefs?.preferredSlideCount) setSlideCount(prefs.preferredSlideCount);
        if (prefs?.textDensity) setTextDensity(prefs.textDensity);
      })
      .catch(() => {})
      .finally(() => setLoadingTemplates(false));
  }, []);

  function goToStep(target: number) {
    setStep(target);
    setHighestReached((prev) => Math.max(prev, target));
  }

  function handleTemplateSelect(templateId: string) {
    setSelectedTemplate(templateId);
    // Set slide count from template if no preference override
    const tmpl = templates.find((t) => t.id === templateId);
    if (tmpl && !preferences?.preferredSlideCount) {
      setSlideCount(tmpl.slideCount);
    }
    // Auto-advance to step 2
    goToStep(2);
  }

  function handleStep2Next() {
    if (!title.trim() || !topic.trim()) return;
    goToStep(3);
  }

  async function handleGenerate() {
    if (!selectedTemplate) return;
    setError("");
    setGenerating(true);

    try {
      const project = await api.createCarousel({
        title: title.trim(),
        topic: topic.trim(),
        templateId: selectedTemplate,
      });

      await api.generateContent(project.id, {
        topic: topic.trim(),
        slideCount,
        audience: audience.trim() || undefined,
        tone: tone.trim() || undefined,
        ctaGoal: ctaGoal.trim() || undefined,
        textDensity,
      });

      router.push(`/carousels/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create carousel");
      setGenerating(false);
    }
  }

  const selectedTemplateName = templates.find((t) => t.id === selectedTemplate)?.name;

  return (
    <div>
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-bold text-zinc-900 dark:text-white">
          New Carousel
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Choose a template, describe your content, and generate with AI
        </p>
      </div>

      <StepIndicator
        currentStep={step}
        highestReached={highestReached}
        onStepClick={goToStep}
      />

      {/* Step 1: Choose Template */}
      {step === 1 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-white">
            Choose a template
          </h2>

          {loadingTemplates ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <TemplateCardSkeleton key={i} />
              ))}
            </div>
          ) : templates.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 py-10 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <p className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">
                No templates available yet.
              </p>
              <Link
                href="/templates"
                className="text-sm font-medium text-zinc-900 hover:underline dark:text-white"
              >
                Browse templates
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  selected={selectedTemplate === template.id}
                  onClick={() => handleTemplateSelect(template.id)}
                />
              ))}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <Button
              disabled={!selectedTemplate}
              onClick={() => goToStep(2)}
            >
              Next
            </Button>
            <Button variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Describe Your Carousel */}
      {step === 2 && (
        <div className="mx-auto max-w-lg">
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-white">
            Describe your carousel
          </h2>

          <div className="flex flex-col gap-4">
            <Input
              id="title"
              label="Title"
              placeholder="e.g. Friday Sunnahs"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="topic"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Topic / Prompt <span className="text-red-500">*</span>
              </label>
              <textarea
                id="topic"
                rows={3}
                placeholder="e.g. 5 Sunnahs every Muslim should practice on Fridays, with Hadith references"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              disabled={!title.trim() || !topic.trim()}
              onClick={handleStep2Next}
            >
              Next
            </Button>
            <Button variant="secondary" onClick={() => goToStep(1)}>
              Back
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Generation Settings */}
      {step === 3 && (
        <div className="mx-auto max-w-lg">
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-white">
            Generation settings
          </h2>

          {/* Summary */}
          <div className="mb-5 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              <span className="font-medium text-zinc-900 dark:text-white">
                {selectedTemplateName}
              </span>
              {" "}— {topic.length > 80 ? topic.slice(0, 80) + "..." : topic}
            </p>
          </div>

          <div className="flex flex-col gap-5">
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

            {/* Text Density */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Text Density
              </label>
              <div className="grid grid-cols-3 gap-2">
                {DENSITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTextDensity(opt.value)}
                    disabled={generating}
                    className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${
                      textDensity === opt.value
                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                        : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600"
                    }`}
                  >
                    <span className={`block text-sm font-medium ${
                      textDensity === opt.value
                        ? ""
                        : "text-zinc-900 dark:text-white"
                    }`}>
                      {opt.label}
                    </span>
                    <span className={`block text-xs ${
                      textDensity === opt.value
                        ? "text-white/70 dark:text-zinc-900/60"
                        : "text-zinc-400 dark:text-zinc-500"
                    }`}>
                      {opt.description}
                    </span>
                  </button>
                ))}
              </div>
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
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <div className="mt-6 flex gap-3">
            <Button onClick={handleGenerate} disabled={generating}>
              {generating ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Generating...
                </span>
              ) : (
                "Generate with AI"
              )}
            </Button>
            <Button
              variant="secondary"
              onClick={() => goToStep(2)}
              disabled={generating}
            >
              Back
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
