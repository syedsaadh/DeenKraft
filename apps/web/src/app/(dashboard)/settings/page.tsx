"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as api from "@/lib/api-client";
import type {
  UserProfile,
  UserPreferences,
  CarouselTemplate,
} from "@/lib/api-client";

const TONE_PRESETS = [
  "Inspirational & warm",
  "Professional & authoritative",
  "Casual & friendly",
  "Educational & clear",
  "Bold & motivational",
];

const TEXT_DENSITY_OPTIONS: {
  value: UserPreferences["textDensity"];
  label: string;
  description: string;
}[] = [
  { value: "minimal", label: "Minimal", description: "Short, punchy text" },
  { value: "moderate", label: "Moderate", description: "Balanced content" },
  { value: "detailed", label: "Detailed", description: "In-depth text" },
];

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [templates, setTemplates] = useState<CarouselTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [preferredTemplateId, setPreferredTemplateId] = useState("");
  const [preferredTone, setPreferredTone] = useState("");
  const [preferredSlideCount, setPreferredSlideCount] = useState(7);
  const [ctaStyle, setCtaStyle] = useState("");
  const [textDensity, setTextDensity] =
    useState<UserPreferences["textDensity"]>(undefined);
  const [instagramHandle, setInstagramHandle] = useState("");

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [profileRes, prefsRes, templatesRes] = await Promise.all([
          api.getMe(),
          api.getPreferences(),
          api.listTemplates({ limit: 100 }),
        ]);

        setProfile(profileRes);
        setTemplates(templatesRes.items);

        setPreferredTemplateId(prefsRes.preferredTemplateId ?? "");
        setPreferredTone(prefsRes.preferredTone ?? "");
        setPreferredSlideCount(prefsRes.preferredSlideCount ?? 7);
        setCtaStyle(prefsRes.ctaStyle ?? "");
        setTextDensity(prefsRes.textDensity);
        setInstagramHandle(prefsRes.instagramHandle ?? "");
      } catch {
        setToast({ type: "error", message: "Failed to load settings" });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setToast(null);

    try {
      const updated = await api.updatePreferences({
        preferredTemplateId: preferredTemplateId || undefined,
        preferredTone: preferredTone || undefined,
        preferredSlideCount,
        ctaStyle: ctaStyle || undefined,
        textDensity,
        instagramHandle: instagramHandle || undefined,
      });

      setPreferredTemplateId(updated.preferredTemplateId ?? "");
      setPreferredTone(updated.preferredTone ?? "");
      setPreferredSlideCount(updated.preferredSlideCount ?? 7);
      setCtaStyle(updated.ctaStyle ?? "");
      setTextDensity(updated.textDensity);
      setInstagramHandle(updated.instagramHandle ?? "");

      setToast({ type: "success", message: "Preferences saved" });
    } catch (err) {
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to save",
      });
    } finally {
      setSaving(false);
    }
  }, [preferredTemplateId, preferredTone, preferredSlideCount, ctaStyle, textDensity, instagramHandle]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-zinc-500">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Manage your account and generation defaults
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`rounded-lg px-4 py-3 text-sm font-medium ${
            toast.type === "success"
              ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
              : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Account Section */}
      {profile && (
        <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Account
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Your account information
          </p>

          <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Name
              </dt>
              <dd className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">
                {profile.name}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Email
              </dt>
              <dd className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">
                {profile.email}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Member since
              </dt>
              <dd className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">
                {new Date(profile.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </dd>
            </div>
          </dl>
        </section>
      )}

      {/* Generation Defaults Section */}
      <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Generation Defaults
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          These preferences pre-fill the carousel generation form
        </p>

        <div className="mt-6 flex max-w-lg flex-col gap-5">
          {/* Instagram Handle */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="pref-instagram"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Instagram Handle
            </label>
            <div className="flex items-center">
              <span className="flex h-10 items-center rounded-l-lg border border-r-0 border-zinc-300 bg-zinc-50 px-3 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                @
              </span>
              <input
                id="pref-instagram"
                type="text"
                placeholder="yourhandle"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value.replace(/^@/, ""))}
                maxLength={30}
                className="h-10 flex-1 rounded-r-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
              />
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Used as the account name in the Instagram preview
            </p>
          </div>

          {/* Preferred Template */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="pref-template"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Preferred Template
            </label>
            <select
              id="pref-template"
              value={preferredTemplateId}
              onChange={(e) => setPreferredTemplateId(e.target.value)}
              className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
            >
              <option value="">No default</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Preferred Tone */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="pref-tone"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Preferred Tone
            </label>
            <input
              id="pref-tone"
              type="text"
              placeholder="e.g. Inspirational & warm"
              value={preferredTone}
              onChange={(e) => setPreferredTone(e.target.value)}
              className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
            />
            <div className="flex flex-wrap gap-1.5">
              {TONE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setPreferredTone(preset)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                    preferredTone === preset
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Slide Count */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="pref-slides"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Preferred Slide Count
            </label>
            <div className="flex items-center gap-3">
              <input
                id="pref-slides"
                type="range"
                min={3}
                max={15}
                value={preferredSlideCount}
                onChange={(e) =>
                  setPreferredSlideCount(Number(e.target.value))
                }
                className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-zinc-200 accent-zinc-900 dark:bg-zinc-700 dark:accent-white"
              />
              <span className="w-8 text-center text-sm font-semibold text-zinc-900 dark:text-white">
                {preferredSlideCount}
              </span>
            </div>
          </div>

          {/* CTA Style */}
          <Input
            id="pref-cta"
            label="CTA Style"
            placeholder="e.g. Follow for daily Islamic reminders"
            value={ctaStyle}
            onChange={(e) => setCtaStyle(e.target.value)}
          />

          {/* Text Density */}
          <fieldset className="flex flex-col gap-1.5">
            <legend className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Text Density
            </legend>
            <div className="mt-1 flex gap-3">
              {TEXT_DENSITY_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex flex-1 cursor-pointer flex-col items-center rounded-lg border-2 px-3 py-3 text-center transition-colors ${
                    textDensity === opt.value
                      ? "border-zinc-900 bg-zinc-50 dark:border-white dark:bg-zinc-800"
                      : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="textDensity"
                    value={opt.value}
                    checked={textDensity === opt.value}
                    onChange={() => setTextDensity(opt.value)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">
                    {opt.label}
                  </span>
                  <span className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    {opt.description}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Save */}
          <div className="pt-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving...
                </span>
              ) : (
                "Save preferences"
              )}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
