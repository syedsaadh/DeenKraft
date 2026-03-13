import type { ComponentType } from "react";
import type { SlideSchema } from "@/lib/api-client";
import { EducationalRenderer } from "./educational";
import { ProblemSolutionRenderer } from "./problem-solution";
import { ReflectionRenderer } from "./reflection";

export interface FamilyRendererProps {
  content: Record<string, string>;
  slideType: "cover" | "content" | "end";
  schema: SlideSchema;
  scale?: number;
}

const FAMILY_RENDERERS: Record<string, ComponentType<FamilyRendererProps>> = {
  educational: EducationalRenderer,
  "problem-solution": ProblemSolutionRenderer,
  reflection: ReflectionRenderer,
};

export function getFamilyRenderer(
  family: string | null | undefined,
): ComponentType<FamilyRendererProps> | null {
  if (!family) return null;
  return FAMILY_RENDERERS[family] ?? null;
}
