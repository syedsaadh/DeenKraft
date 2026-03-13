"use client";

import type { SlideSchema } from "@/lib/api-client";
import type { FamilyRendererProps } from "./index";

function s(value: number, scale: number): number {
  return value * scale;
}

interface SlideProps {
  content: Record<string, string>;
  schema: SlideSchema;
  scale: number;
}

function CoverSlide({
  content,
  schema,
  scale,
}: SlideProps) {
  const bgColor = content.backgroundColor || schema.backgroundColor;

  return (
    <div
      style={{
        width: s(schema.width, scale),
        height: s(schema.height, scale),
        backgroundColor: bgColor,
        backgroundImage: (content.backgroundImage || schema.backgroundImage)
          ? `url(${content.backgroundImage || schema.backgroundImage})`
          : undefined,
        backgroundSize: "cover",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Top accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: s(80, scale),
          right: s(80, scale),
          height: s(4, scale),
          backgroundColor: "#2563eb",
        }}
      />

      {/* Centered content block */}
      <div
        style={{
          position: "absolute",
          top: s(300, scale),
          left: s(80, scale),
          width: s(920, scale),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: s(24, scale),
        }}
      >
        <h1
          style={{
            fontSize: s(52, scale),
            fontWeight: "bold",
            color: "#1a1a1a",
            textAlign: "center",
            lineHeight: 1.3,
            margin: 0,
          }}
        >
          {content.heading ?? ""}
        </h1>
        {content.subheading && (
          <p
            style={{
              fontSize: s(26, scale),
              color: "#666666",
              textAlign: "center",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {content.subheading}
          </p>
        )}
      </div>

      {/* Handle */}
      {(content.handle ?? "") && (
        <p
          style={{
            position: "absolute",
            bottom: s(60, scale),
            left: s(80, scale),
            width: s(920, scale),
            textAlign: "center",
            fontSize: s(20, scale),
            color: "#999999",
            margin: 0,
          }}
        >
          {content.handle}
        </p>
      )}
    </div>
  );
}

function ContentSlide({
  content,
  schema,
  scale,
}: SlideProps) {
  const bgColor = content.backgroundColor || schema.backgroundColor;
  const hasStepNumber = !!content.stepNumber;

  return (
    <div
      style={{
        width: s(schema.width, scale),
        height: s(schema.height, scale),
        backgroundColor: bgColor,
        backgroundImage: (content.backgroundImage || schema.backgroundImage)
          ? `url(${content.backgroundImage || schema.backgroundImage})`
          : undefined,
        backgroundSize: "cover",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Left accent bar */}
      <div
        style={{
          position: "absolute",
          top: s(80, scale),
          left: s(80, scale),
          width: s(4, scale),
          height: s(920, scale),
          backgroundColor: "#2563eb",
          opacity: 0.15,
        }}
      />

      {/* Step number (for step-by-step variant) */}
      {hasStepNumber && (
        <div
          style={{
            position: "absolute",
            top: s(80, scale),
            left: s(80, scale),
            fontSize: s(72, scale),
            fontWeight: "bold",
            color: "#2563eb",
            lineHeight: 1,
            opacity: 0.2,
          }}
        >
          {content.stepNumber}
        </div>
      )}

      {/* Slide number badge */}
      {content.slideNumber && (
        <div
          style={{
            position: "absolute",
            top: s(50, scale),
            right: s(80, scale),
            fontSize: s(18, scale),
            fontWeight: "bold",
            color: "#2563eb",
            backgroundColor: "#eff6ff",
            padding: `${s(6, scale)}px ${s(14, scale)}px`,
            borderRadius: s(20, scale),
          }}
        >
          {content.slideNumber}
        </div>
      )}

      {/* Main content */}
      <div
        style={{
          position: "absolute",
          top: hasStepNumber ? s(180, scale) : s(100, scale),
          left: s(100, scale),
          width: s(880, scale),
        }}
      >
        <h2
          style={{
            fontSize: s(40, scale),
            fontWeight: "bold",
            color: "#2563eb",
            lineHeight: 1.3,
            margin: 0,
            marginBottom: s(28, scale),
          }}
        >
          {content.heading ?? ""}
        </h2>
        {content.body && (
          <p
            style={{
              fontSize: s(28, scale),
              color: "#333333",
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            {content.body}
          </p>
        )}
      </div>
    </div>
  );
}

function EndSlide({
  content,
  schema,
  scale,
}: SlideProps) {
  const bgColor = content.backgroundColor || schema.backgroundColor;

  return (
    <div
      style={{
        width: s(schema.width, scale),
        height: s(schema.height, scale),
        backgroundColor: bgColor,
        backgroundImage: (content.backgroundImage || schema.backgroundImage)
          ? `url(${content.backgroundImage || schema.backgroundImage})`
          : undefined,
        backgroundSize: "cover",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Bottom accent line */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: s(80, scale),
          right: s(80, scale),
          height: s(4, scale),
          backgroundColor: "#2563eb",
        }}
      />

      {/* Centered content */}
      <div
        style={{
          position: "absolute",
          top: s(340, scale),
          left: s(80, scale),
          width: s(920, scale),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: s(24, scale),
        }}
      >
        <h2
          style={{
            fontSize: s(44, scale),
            fontWeight: "bold",
            color: "#1a1a1a",
            textAlign: "center",
            lineHeight: 1.3,
            margin: 0,
          }}
        >
          {content.heading ?? ""}
        </h2>
        {content.body && (
          <p
            style={{
              fontSize: s(26, scale),
              color: "#666666",
              textAlign: "center",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {content.body}
          </p>
        )}
      </div>

      {/* CTA */}
      {(content.ctaText ?? "") && (
        <div
          style={{
            position: "absolute",
            bottom: s(120, scale),
            left: s(80, scale),
            width: s(920, scale),
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontSize: s(24, scale),
              fontWeight: "bold",
              color: "#2563eb",
              backgroundColor: "#eff6ff",
              padding: `${s(12, scale)}px ${s(32, scale)}px`,
              borderRadius: s(28, scale),
            }}
          >
            {content.ctaText}
          </span>
        </div>
      )}
    </div>
  );
}

export function EducationalRenderer({
  content,
  slideType,
  schema,
  scale = 1,
}: FamilyRendererProps) {
  switch (slideType) {
    case "cover":
      return <CoverSlide content={content} schema={schema} scale={scale} />;
    case "end":
      return <EndSlide content={content} schema={schema} scale={scale} />;
    default:
      return <ContentSlide content={content} schema={schema} scale={scale} />;
  }
}
