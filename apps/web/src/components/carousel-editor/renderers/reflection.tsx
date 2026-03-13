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

const SERIF = 'Georgia, "Times New Roman", serif';

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
        fontFamily: SERIF,
      }}
    >
      {/* Decorative top amber line */}
      <div
        style={{
          position: "absolute",
          top: s(200, scale),
          left: "50%",
          transform: "translateX(-50%)",
          width: s(60, scale),
          height: s(3, scale),
          backgroundColor: "#d97706",
        }}
      />

      {/* Title */}
      <h1
        style={{
          position: "absolute",
          top: s(380, scale),
          left: s(80, scale),
          width: s(920, scale),
          fontSize: s(44, scale),
          color: "#fafaf9",
          textAlign: "center",
          lineHeight: 1.5,
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
            top: s(560, scale),
            left: s(80, scale),
            width: s(920, scale),
            fontSize: s(24, scale),
            color: "#a8a29e",
            textAlign: "center",
            lineHeight: 1.5,
            fontStyle: "italic",
            margin: 0,
          }}
        >
          {content.subheading}
        </p>
      )}

      {/* Decorative bottom amber line */}
      <div
        style={{
          position: "absolute",
          bottom: s(200, scale),
          left: "50%",
          transform: "translateX(-50%)",
          width: s(60, scale),
          height: s(3, scale),
          backgroundColor: "#d97706",
        }}
      />
    </div>
  );
}

function ContentSlide({
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
        fontFamily: SERIF,
      }}
    >
      {/* Left decorative accent */}
      <div
        style={{
          position: "absolute",
          top: s(200, scale),
          left: s(60, scale),
          width: s(3, scale),
          height: s(680, scale),
          backgroundColor: "#d97706",
          opacity: 0.2,
        }}
      />

      {/* Opening quote mark */}
      <div
        style={{
          position: "absolute",
          top: s(120, scale),
          left: s(80, scale),
          fontSize: s(80, scale),
          color: "#d97706",
          opacity: 0.3,
          lineHeight: 1,
        }}
      >
        &ldquo;
      </div>

      {/* Heading / thought */}
      <h2
        style={{
          position: "absolute",
          top: s(200, scale),
          left: s(80, scale),
          width: s(920, scale),
          fontSize: s(38, scale),
          fontWeight: "bold",
          color: "#d97706",
          lineHeight: 1.4,
          margin: 0,
        }}
      >
        {content.heading ?? ""}
      </h2>

      {/* Body / reflection */}
      {content.body && (
        <p
          style={{
            position: "absolute",
            top: s(380, scale),
            left: s(80, scale),
            width: s(920, scale),
            fontSize: s(28, scale),
            color: "#e7e5e4",
            lineHeight: 1.8,
            fontStyle: "italic",
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
            fontSize: s(16, scale),
            color: "#57534e",
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
        fontFamily: SERIF,
      }}
    >
      {/* Top center amber accent */}
      <div
        style={{
          position: "absolute",
          top: s(250, scale),
          left: "50%",
          transform: "translateX(-50%)",
          width: s(60, scale),
          height: s(3, scale),
          backgroundColor: "#d97706",
        }}
      />

      {/* Closing thought */}
      <h2
        style={{
          position: "absolute",
          top: s(360, scale),
          left: s(80, scale),
          width: s(920, scale),
          fontSize: s(40, scale),
          color: "#fafaf9",
          textAlign: "center",
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        {content.heading ?? ""}
      </h2>

      {/* Reflection body */}
      {content.body && (
        <p
          style={{
            position: "absolute",
            top: s(540, scale),
            left: s(80, scale),
            width: s(920, scale),
            fontSize: s(24, scale),
            color: "#a8a29e",
            textAlign: "center",
            lineHeight: 1.5,
            fontStyle: "italic",
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
            bottom: s(100, scale),
            left: s(80, scale),
            width: s(920, scale),
            fontSize: s(22, scale),
            color: "#d97706",
            textAlign: "center",
            margin: 0,
          }}
        >
          {content.ctaText}
        </p>
      )}

      {/* Bottom accent */}
      <div
        style={{
          position: "absolute",
          bottom: s(60, scale),
          left: "50%",
          transform: "translateX(-50%)",
          width: s(60, scale),
          height: s(3, scale),
          backgroundColor: "#d97706",
        }}
      />
    </div>
  );
}

export function ReflectionRenderer({
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
