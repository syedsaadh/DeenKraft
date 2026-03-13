"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import * as api from "@/lib/api-client";
import { SlideNavigator } from "@/components/carousel-editor/slide-navigator";
import { InstagramPostPreview } from "@/components/carousel-editor/instagram-post-preview";
import { ContentEditor } from "@/components/carousel-editor/content-editor";
import { EditorToolbar } from "@/components/carousel-editor/editor-toolbar";
import { ExportDialog } from "@/components/carousel-editor/export-dialog";
import { GenerationForm } from "@/components/carousel-editor/generation-form";
import { ImagePanel } from "@/components/carousel-editor/image-panel";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function CarouselEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [project, setProject] = useState<api.CarouselProject | null>(null);
  const [template, setTemplate] = useState<api.CarouselTemplate | null>(null);
  const [preferences, setPreferences] = useState<api.UserPreferences | null>(
    null,
  );
  const [activeSlide, setActiveSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportUrls, setExportUrls] = useState<string[] | null>(null);
  const [regeneratingSlide, setRegeneratingSlide] = useState(false);
  const [showGenerationForm, setShowGenerationForm] = useState(false);
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [dirtyIndices, setDirtyIndices] = useState<Set<number>>(new Set());

  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const prevSlideRef = useRef(0);

  // Load project + template + user preferences
  useEffect(() => {
    async function load() {
      try {
        const [proj, prefs] = await Promise.all([
          api.getCarousel(id),
          api.getPreferences().catch(() => null),
        ]);
        setProject(proj);
        setPreferences(prefs);
        const tmpl = await api.getTemplate(proj.templateId);
        setTemplate(tmpl);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load project",
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  const hasSlides = !!(project?.slides && project.slides.length > 0);

  // ----- Save logic -----

  const saveSlide = useCallback(
    async (index: number) => {
      if (!project?.slides) return;
      setSaveStatus("saving");
      try {
        await api.updateSlide(
          project.id,
          index,
          project.slides[index].content,
        );
        setDirtyIndices((prev) => {
          const next = new Set(prev);
          next.delete(index);
          return next;
        });
        setSaveStatus("saved");
        // Reset to idle after 2 seconds
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => setSaveStatus("idle"), 2000);
      } catch {
        setSaveStatus("error");
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => setSaveStatus("idle"), 3000);
      }
    },
    [project],
  );

  // Auto-save previous slide when switching slides
  useEffect(() => {
    const prev = prevSlideRef.current;
    if (prev !== activeSlide && dirtyIndices.has(prev) && project?.slides) {
      saveSlide(prev);
    }
    prevSlideRef.current = activeSlide;
  }, [activeSlide, dirtyIndices, project, saveSlide]);

  // Ctrl+S / Cmd+S to save current slide
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (dirtyIndices.has(activeSlide)) {
          saveSlide(activeSlide);
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeSlide, dirtyIndices, saveSlide]);

  // Edit a field on the current slide (local state)
  const handleContentChange = useCallback(
    (key: string, value: string) => {
      if (!project?.slides) return;

      setProject((prev) => {
        if (!prev?.slides) return prev;

        const updated = [...prev.slides];
        updated[activeSlide] = {
          ...updated[activeSlide],
          content: { ...updated[activeSlide].content, [key]: value },
        };

        return { ...prev, slides: updated };
      });

      setDirtyIndices((prev) => new Set(prev).add(activeSlide));
    },
    [activeSlide],
  );

  // ----- Generation -----

  const handleGenerate = useCallback(
    async (params: {
      topic: string;
      slideCount: number;
      audience?: string;
      tone?: string;
      ctaGoal?: string;
    }) => {
      if (!project) return;
      setGenerating(true);
      setError("");

      try {
        const updated = await api.generateContent(project.id, params);
        setProject(updated);
        setActiveSlide(0);
        setDirtyIndices(new Set());
        setShowGenerationForm(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Generation failed");
      } finally {
        setGenerating(false);
      }
    },
    [project],
  );

  // Regenerate a single slide with AI
  const handleRegenerateSlide = useCallback(
    async (instructions?: string) => {
      if (!project) return;
      setRegeneratingSlide(true);
      setError("");

      try {
        // Save current content first so regen starts from latest
        if (project.slides && dirtyIndices.has(activeSlide)) {
          await api.updateSlide(
            project.id,
            activeSlide,
            project.slides[activeSlide].content,
          );
        }

        const updated = await api.regenerateSlide(
          project.id,
          activeSlide,
          instructions,
        );
        setProject(updated);
        setDirtyIndices((prev) => {
          const next = new Set(prev);
          next.delete(activeSlide);
          return next;
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Slide regeneration failed",
        );
      } finally {
        setRegeneratingSlide(false);
      }
    },
    [project, activeSlide, dirtyIndices],
  );

  // ----- Export -----

  const handleExport = useCallback(async () => {
    if (!project) return;
    setExporting(true);
    setError("");

    try {
      // Save all dirty slides first
      if (project.slides) {
        for (const index of dirtyIndices) {
          await api.updateSlide(
            project.id,
            index,
            project.slides[index].content,
          );
        }
        setDirtyIndices(new Set());
      }

      const result = await api.exportCarousel(project.id);
      setExportUrls(result.urls);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }, [project, dirtyIndices]);

  // ----- Render -----

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
        <p className="text-sm text-zinc-500">Loading editor...</p>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="text-sm text-zinc-500 hover:text-zinc-700"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  if (!project || !template) return null;

  // Show generation form: first time (no slides) OR user clicked "Regenerate All"
  const showForm = !hasSlides || showGenerationForm;

  if (showForm) {
    return (
      <div className="-m-6 flex h-screen flex-col">
        <EditorToolbar
          title={project.title}
          status={project.status}
          onGenerate={() => setShowGenerationForm(true)}
          onExport={handleExport}
          generating={generating}
          exporting={exporting}
          hasSlides={hasSlides}
        />

        {error && (
          <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex flex-1 items-center justify-center overflow-y-auto py-12">
          <GenerationForm
            topic={project.topic}
            template={template}
            generating={generating}
            onGenerate={handleGenerate}
            onCancel={
              hasSlides ? () => setShowGenerationForm(false) : undefined
            }
            savedPreferences={preferences}
          />
        </div>
      </div>
    );
  }

  const slides = project.slides ?? [];
  const currentSlide = slides[activeSlide];
  const currentDirty = dirtyIndices.has(activeSlide);

  return (
    <div className="-m-6 flex h-screen flex-col">
      <EditorToolbar
        title={project.title}
        status={project.status}
        onGenerate={() => setShowGenerationForm(true)}
        onExport={handleExport}
        generating={generating}
        exporting={exporting}
        hasSlides={hasSlides}
      />

      {error && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Slide navigator */}
        <div className="w-40 shrink-0 overflow-y-auto border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <SlideNavigator
            slides={slides}
            template={template}
            activeIndex={activeSlide}
            onSelect={setActiveSlide}
            dirtyIndices={dirtyIndices}
            family={template.family}
          />
        </div>

        {/* Center: Instagram preview */}
        {currentSlide && (
          <InstagramPostPreview
            slides={slides}
            activeIndex={activeSlide}
            onNavigate={setActiveSlide}
            template={template}
            family={template.family}
            projectTitle={project.title}
            instagramHandle={preferences?.instagramHandle}
          />
        )}

        {/* Right: Content editor */}
        <div className="flex w-72 shrink-0 flex-col border-l border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex-1 overflow-y-auto">
            {currentSlide && (
              <>
                <ContentEditor
                  slide={currentSlide}
                  template={template}
                  onChange={handleContentChange}
                  onRegenerate={handleRegenerateSlide}
                  regenerating={regeneratingSlide}
                />
                <div className="border-t border-zinc-200 dark:border-zinc-800">
                  <ImagePanel
                    projectId={project.id}
                    currentBackgroundImage={currentSlide.content.backgroundImage}
                    onSelectImage={(url) =>
                      handleContentChange("backgroundImage", url)
                    }
                    onClearBackground={() =>
                      handleContentChange("backgroundImage", "")
                    }
                  />
                </div>
              </>
            )}
          </div>
          <div className="shrink-0 border-t border-zinc-200 p-3 dark:border-zinc-800">
            <button
              onClick={() => saveSlide(activeSlide)}
              disabled={!currentDirty && saveStatus !== "idle"}
              className={`flex w-full items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                saveStatus === "saved"
                  ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400"
                  : saveStatus === "error"
                    ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400"
                    : currentDirty
                      ? "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                      : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
              }`}
            >
              {saveStatus === "saving" && (
                <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
              )}
              {saveStatus === "saving"
                ? "Saving..."
                : saveStatus === "saved"
                  ? "Saved"
                  : saveStatus === "error"
                    ? "Save failed"
                    : currentDirty
                      ? "Save slide"
                      : "No changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Export dialog */}
      {exportUrls && (
        <ExportDialog
          urls={exportUrls}
          onClose={() => setExportUrls(null)}
        />
      )}
    </div>
  );
}
