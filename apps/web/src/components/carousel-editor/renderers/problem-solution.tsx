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
      {/* Diagonal accent stripe */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: s(6, scale),
          background: "linear-gradient(90deg, #f59e0b 0%, #f59e0b 50%, #22c55e 50%, #22c55e 100%)",
        }}
      />

      {/* Problem icon badge */}
      <div
        style={{
          position: "absolute",
          top: s(200, scale),
          left: s(80, scale),
          width: s(920, scale),
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontSize: s(14, scale),
            fontWeight: "bold",
            color: "#1e1b4b",
            backgroundColor: "#f59e0b",
            padding: `${s(8, scale)}px ${s(20, scale)}px`,
            borderRadius: s(4, scale),
            textTransform: "uppercase",
            letterSpacing: s(2, scale),
          }}
        >
          Problem &rarr; Solution
        </span>
      </div>

      {/* Heading */}
      <h1
        style={{
          position: "absolute",
          top: s(300, scale),
          left: s(80, scale),
          width: s(920, scale),
          fontSize: s(48, scale),
          fontWeight: "bold",
          color: "#f59e0b",
          textAlign: "center",
          lineHeight: 1.4,
          margin: 0,
        }}
      >
        {content.heading ?? ""}
      </h1>

      {/* Subtitle */}
      {content.subheading && (
        <p
          style={{
            position: "absolute",
            top: s(540, scale),
            left: s(80, scale),
            width: s(920, scale),
            fontSize: s(26, scale),
            color: "#a5b4fc",
            textAlign: "center",
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          {content.subheading}
        </p>
      )}

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
            color: "#6366f1",
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
  const label = content.label ?? "";
  const isProblem =
    label.toLowerCase().includes("problem") ||
    label.toLowerCase().includes("challenge") ||
    label.toLowerCase().includes("issue");
  const isSolution =
    label.toLowerCase().includes("solution") ||
    label.toLowerCase().includes("fix") ||
    label.toLowerCase().includes("answer");

  const labelColor = isSolution ? "#22c55e" : "#f59e0b";
  const accentColor = isSolution ? "#22c55e" : isProblem ? "#f59e0b" : "#a5b4fc";

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
      {/* Top accent bar matching label type */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: s(6, scale),
          height: "100%",
          backgroundColor: accentColor,
          opacity: 0.3,
        }}
      />

      {/* Label badge */}
      {label && (
        <div
          style={{
            position: "absolute",
            top: s(80, scale),
            left: s(80, scale),
          }}
        >
          <span
            style={{
              fontSize: s(14, scale),
              fontWeight: "bold",
              color: "#1e1b4b",
              backgroundColor: labelColor,
              padding: `${s(6, scale)}px ${s(16, scale)}px`,
              borderRadius: s(4, scale),
              textTransform: "uppercase",
              letterSpacing: s(2, scale),
            }}
          >
            {label}
          </span>
        </div>
      )}

      {/* Heading */}
      <h2
        style={{
          position: "absolute",
          top: s(160, scale),
          left: s(80, scale),
          width: s(920, scale),
          fontSize: s(42, scale),
          fontWeight: "bold",
          color: "#e2e8f0",
          lineHeight: 1.3,
          margin: 0,
        }}
      >
        {content.heading ?? ""}
      </h2>

      {/* Body */}
      {content.body && (
        <p
          style={{
            position: "absolute",
            top: s(320, scale),
            left: s(80, scale),
            width: s(920, scale),
            fontSize: s(28, scale),
            color: "#cbd5e1",
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          {content.body}
        </p>
      )}

      {/* Slide number */}
      {content.slideNumber && (
        <p
          style={{
            position: "absolute",
            bottom: s(60, scale),
            right: s(80, scale),
            fontSize: s(18, scale),
            color: "#4f46e5",
            margin: 0,
            textAlign: "right",
          }}
        >
          {content.slideNumber}
        </p>
      )}
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
      {/* Success gradient bar at top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: s(6, scale),
          background: "linear-gradient(90deg, #22c55e, #10b981)",
        }}
      />

      {/* Solution checkmark badge */}
      <div
        style={{
          position: "absolute",
          top: s(230, scale),
          left: s(80, scale),
          width: s(920, scale),
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontSize: s(14, scale),
            fontWeight: "bold",
            color: "#1e1b4b",
            backgroundColor: "#22c55e",
            padding: `${s(8, scale)}px ${s(20, scale)}px`,
            borderRadius: s(4, scale),
            textTransform: "uppercase",
            letterSpacing: s(2, scale),
          }}
        >
          Key Takeaway
        </span>
      </div>

      {/* Heading */}
      <h2
        style={{
          position: "absolute",
          top: s(320, scale),
          left: s(80, scale),
          width: s(920, scale),
          fontSize: s(44, scale),
          fontWeight: "bold",
          color: "#22c55e",
          textAlign: "center",
          lineHeight: 1.3,
          margin: 0,
        }}
      >
        {content.heading ?? ""}
      </h2>

      {/* Body */}
      {content.body && (
        <p
          style={{
            position: "absolute",
            top: s(500, scale),
            left: s(80, scale),
            width: s(920, scale),
            fontSize: s(26, scale),
            color: "#a5b4fc",
            textAlign: "center",
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          {content.body}
        </p>
      )}

      {/* CTA */}
      {(content.ctaText ?? "") && (
        <p
          style={{
            position: "absolute",
            bottom: s(120, scale),
            left: s(80, scale),
            width: s(920, scale),
            fontSize: s(24, scale),
            fontWeight: "bold",
            color: "#f59e0b",
            textAlign: "center",
            margin: 0,
          }}
        >
          {content.ctaText}
        </p>
      )}
    </div>
  );
}

export function ProblemSolutionRenderer({
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
