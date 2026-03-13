"use client";

import type { SlideSchema } from "@/lib/api-client";
import { getFamilyRenderer } from "./renderers";

interface SlideRendererProps {
  schema: SlideSchema;
  content: Record<string, string>;
  scale?: number;
  family?: string | null;
  slideType?: "cover" | "content" | "end";
}

export function SlideRenderer({
  schema,
  content,
  scale = 1,
  family,
  slideType,
}: SlideRendererProps) {
  // Try family-specific renderer first
  const FamilyComponent = getFamilyRenderer(family);
  if (FamilyComponent && slideType) {
    return (
      <FamilyComponent
        content={content}
        slideType={slideType}
        schema={schema}
        scale={scale}
      />
    );
  }

  // Fallback: generic schema-based renderer
  const containerWidth = schema.width * scale;
  const containerHeight = schema.height * scale;

  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: containerWidth,
        height: containerHeight,
        backgroundColor: content.backgroundColor || schema.backgroundColor,
        backgroundImage: (content.backgroundImage || schema.backgroundImage)
          ? `url(${content.backgroundImage || schema.backgroundImage})`
          : undefined,
        backgroundSize: "cover",
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
      }}
    >
      {schema.elements.map((element) => {
        const value = content[element.key] ?? element.defaultValue ?? "";
        if (!value) return null;

        const style: React.CSSProperties = {
          position: "absolute",
        };

        for (const [key, val] of Object.entries(element.style)) {
          const pixelProps = [
            "fontSize",
            "top",
            "left",
            "right",
            "bottom",
            "width",
            "height",
            "padding",
          ];

          if (pixelProps.includes(key) && typeof val === "number") {
            (style as Record<string, unknown>)[key] = val * scale;
          } else {
            (style as Record<string, unknown>)[key] = val;
          }
        }

        if (element.type === "text") {
          return (
            <div
              key={element.key}
              style={style}
              className="whitespace-pre-wrap"
            >
              {value}
            </div>
          );
        }

        if (element.type === "image") {
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={element.key}
              src={value}
              alt={element.label}
              style={style}
            />
          );
        }

        return null;
      })}
    </div>
  );
}
