"use client";

import { Card } from "@/components/ui/card";
import type { CarouselTemplate } from "@/lib/api-client";

interface TemplateCardProps {
  template: CarouselTemplate;
  selected?: boolean;
  onClick?: () => void;
}

export function TemplateCard({ template, selected, onClick }: TemplateCardProps) {
  const schema = template.coverSlideSchema;

  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer transition-all hover:shadow-md ${
        selected
          ? "ring-2 ring-zinc-900 dark:ring-white"
          : "hover:border-zinc-300 dark:hover:border-zinc-700"
      }`}
    >
      {/* Mini preview */}
      <div
        className="mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-lg p-4"
        style={{ backgroundColor: schema.backgroundColor }}
      >
        <div className="text-center">
          {schema.elements
            .filter((el) => el.key === "heading" || el.key === "subheading")
            .slice(0, 2)
            .map((el) => (
              <p
                key={el.key}
                className="leading-tight"
                style={{
                  color: String(el.style.color ?? "#fff"),
                  fontSize: `${Math.min(Number(el.style.fontSize ?? 16) * 0.3, 16)}px`,
                  fontWeight: String(el.style.fontWeight ?? "normal"),
                }}
              >
                {el.label}
              </p>
            ))}
        </div>
      </div>

      <h3 className="mb-1 font-semibold text-zinc-900 dark:text-white">
        {template.name}
      </h3>
      <p className="mb-2 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
        {template.description}
      </p>
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
          {template.category}
        </span>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          {template.slideCount} slides
        </span>
      </div>
    </Card>
  );
}
