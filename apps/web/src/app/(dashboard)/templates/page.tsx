"use client";

import { useEffect, useState } from "react";
import { TemplateCard } from "@/components/template-card";
import { TemplateCardSkeleton } from "@/components/ui/skeleton";
import * as api from "@/lib/api-client";

const categories = ["all", "islamic", "educational", "brand"];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<api.CarouselTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .listTemplates({ category: category === "all" ? undefined : category })
      .then((res) => setTemplates(res.items))
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Failed to load templates",
        ),
      )
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-bold text-zinc-900 dark:text-white">
          Templates
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Browse carousel templates to get started
        </p>
      </div>

      {/* Category filter */}
      <div className="mb-6 flex gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
              category === cat
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <TemplateCardSkeleton key={i} />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <svg
            className="h-12 w-12 text-zinc-300 dark:text-zinc-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm10 0a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z"
            />
          </svg>
          <p className="text-zinc-500 dark:text-zinc-400">
            No templates found for this category.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </div>
  );
}
