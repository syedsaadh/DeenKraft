import type { CarouselTemplate, GeneratedSlide, SlideSchema } from "@/lib/api-client";

export function getSchemaForSlide(
  slide: GeneratedSlide,
  template: CarouselTemplate,
): SlideSchema {
  switch (slide.slideType) {
    case "cover":
      return template.coverSlideSchema;
    case "end":
      return template.endSlideSchema;
    default:
      return template.contentSlideSchema;
  }
}

export function slideTypeLabel(slide: GeneratedSlide, totalSlides: number): string {
  if (slide.slideType === "cover") return "Cover";
  if (slide.slideType === "end") return "End";
  // Content slides: show position relative to content slides only
  const contentIndex = slide.slideIndex; // 1-based within content range
  const contentCount = totalSlides - 2;
  return `${contentIndex}/${contentCount}`;
}
