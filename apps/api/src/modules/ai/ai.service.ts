import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type {
  SlideElementSchema,
  SlideSchema,
  TextConstraint,
  TextConstraints,
} from '../carousel-templates/carousel-template.entity';
import type {
  BrandProfile,
  GeneratedSlide,
} from '../carousels/carousel-project.entity';

export type { GeneratedSlide };

export type TextDensity = 'minimal' | 'moderate' | 'detailed';

export interface GenerateCarouselInput {
  topic: string;
  slideCount: number;
  coverSchema: SlideSchema;
  contentSchema: SlideSchema;
  endSchema: SlideSchema;
  brandProfile?: BrandProfile;
  textConstraints?: TextConstraints;
  audience?: string;
  tone?: string;
  ctaGoal?: string;
  textDensity?: TextDensity;
}

export interface RegenerateSlideInput {
  topic: string;
  slideIndex: number;
  slideType: 'cover' | 'content' | 'end';
  schema: SlideSchema;
  currentContent: Record<string, string>;
  surroundingSlides: GeneratedSlide[];
  brandProfile?: BrandProfile;
  textConstraints?: TextConstraints;
  instructions?: string;
}

interface SlideValidationError {
  slideIndex: number;
  issues: string[];
}

interface ValidationResult {
  valid: boolean;
  slides: GeneratedSlide[];
  errors: SlideValidationError[];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly client: OpenAI;
  private readonly maxRetries = 1;

  constructor(private readonly configService: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY', ''),
    });
  }

  async generateCarouselContent(
    input: GenerateCarouselInput,
  ): Promise<GeneratedSlide[]> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const raw = await this.callOpenAI(input, attempt);
        const parsed = this.parseResponse(raw);
        const validated = this.validateAndNormalize(parsed, input);

        if (!validated.valid) {
          const summary = validated.errors
            .flatMap((e) => e.issues.map((i) => `slide ${e.slideIndex}: ${i}`))
            .join('; ');

          if (attempt < this.maxRetries) {
            this.logger.warn(
              `Generation attempt ${attempt + 1} failed validation: ${summary}. Retrying...`,
            );
            continue;
          }

          this.logger.error(
            `Generation failed validation after ${attempt + 1} attempts: ${summary}`,
          );
          throw new InternalServerErrorException(
            'AI generated content that does not match the template structure. Please try again.',
          );
        }

        this.logger.log(
          `Content generated successfully on attempt ${attempt + 1}: ${validated.slides.length} slides`,
        );
        return validated.slides;
      } catch (error) {
        lastError = error as Error;
        if (error instanceof InternalServerErrorException) {
          if (attempt >= this.maxRetries) throw error;
          continue;
        }
        // OpenAI SDK / network errors — retry
        if (attempt < this.maxRetries) {
          this.logger.warn(
            `Generation attempt ${attempt + 1} threw: ${(error as Error).message}. Retrying...`,
          );
          continue;
        }
      }
    }

    throw new InternalServerErrorException(
      `AI generation failed: ${lastError?.message ?? 'Unknown error'}`,
    );
  }

  // ---------------------------------------------------------------------------
  // Single-slide regeneration
  // ---------------------------------------------------------------------------

  async regenerateSlideContent(
    input: RegenerateSlideInput,
  ): Promise<Record<string, string>> {
    const systemPrompt = this.buildSlideRegenSystemPrompt(input);
    const userPrompt = this.buildSlideRegenUserPrompt(input);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const temperature = attempt === 0 ? 0.7 : 0.85;

        const response = await this.client.chat.completions.create({
          model: 'gpt-4o',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature,
          max_tokens: 600,
        });

        const usage = response.usage;
        if (usage) {
          this.logger.debug(
            `OpenAI slide regen usage — prompt: ${usage.prompt_tokens}, completion: ${usage.completion_tokens}`,
          );
        }

        const raw = response.choices[0]?.message?.content;
        if (!raw) {
          throw new InternalServerErrorException(
            'AI returned empty response for slide regeneration',
          );
        }

        const content = this.parseSlideRegenResponse(raw, input);

        this.logger.log(
          `Slide ${input.slideIndex} regenerated on attempt ${attempt + 1}`,
        );
        return content;
      } catch (error) {
        lastError = error as Error;
        if (
          error instanceof InternalServerErrorException &&
          attempt >= this.maxRetries
        ) {
          throw error;
        }
        if (attempt < this.maxRetries) {
          this.logger.warn(
            `Slide regen attempt ${attempt + 1} failed: ${(error as Error).message}. Retrying...`,
          );
          continue;
        }
      }
    }

    throw new InternalServerErrorException(
      `Slide regeneration failed: ${lastError?.message ?? 'Unknown error'}`,
    );
  }

  private buildSlideRegenSystemPrompt(input: RegenerateSlideInput): string {
    const sections: string[] = [];

    sections.push(
      'You are a professional Instagram carousel content writer. Your job is to regenerate the content for ONE specific slide in an existing carousel.',
    );

    sections.push(`Rules:
- Write engaging, concise text optimized for Instagram carousel format.
- Maintain consistency with the surrounding slides in tone and style.
- Return ONLY a JSON object with the slide content keys. No wrapper, no "slides" array.
- Every field must be a non-empty string.
- Do NOT include any keys that are not listed below.`);

    if (input.brandProfile) {
      const bp = input.brandProfile;
      sections.push(`Brand guidelines:
- Brand name: "${bp.brandName}"
- Tone: ${bp.tone}
- CTA style: ${bp.ctaStyle}`);
    }

    if (input.textConstraints) {
      const schemaKeys = input.schema.elements.map((e) => e.key);
      const relevantConstraints = Object.entries(input.textConstraints).filter(
        ([key]) => schemaKeys.includes(key),
      );
      if (relevantConstraints.length > 0) {
        const lines = relevantConstraints.map(([key, c]) => {
          const parts: string[] = [];
          if (c.maxWords) parts.push(`max ${c.maxWords} words`);
          if (c.maxChars) parts.push(`max ${c.maxChars} characters`);
          if (c.minWords) parts.push(`min ${c.minWords} words`);
          return `  "${key}": ${parts.join(', ')}`;
        });
        sections.push(
          `Text length constraints (STRICTLY enforced):\n${lines.join('\n')}`,
        );
      }
    }

    const elementDesc = input.schema.elements
      .filter((e) => (e.style as Record<string, unknown>).display !== 'none')
      .map((e) => `  "${e.key}" — ${e.label}`)
      .join('\n');

    sections.push(`Output JSON keys for this slide:\n${elementDesc}`);

    return sections.join('\n\n');
  }

  private buildSlideRegenUserPrompt(input: RegenerateSlideInput): string {
    const lines: string[] = [];

    lines.push(`Carousel topic: "${input.topic}"`);
    lines.push(
      `Regenerate slide ${input.slideIndex} (type: ${input.slideType}).`,
    );

    // Surrounding context
    const prev = input.surroundingSlides.find(
      (s) => s.slideIndex === input.slideIndex - 1,
    );
    const next = input.surroundingSlides.find(
      (s) => s.slideIndex === input.slideIndex + 1,
    );

    if (prev) {
      lines.push('');
      lines.push(
        `Previous slide (${prev.slideType}): ${JSON.stringify(prev.content)}`,
      );
    }
    if (next) {
      lines.push(
        `Next slide (${next.slideType}): ${JSON.stringify(next.content)}`,
      );
    }

    lines.push('');
    lines.push(`Current content: ${JSON.stringify(input.currentContent)}`);

    // Default values for this schema
    const defaults = input.schema.elements.filter((e) => e.defaultValue);
    if (defaults.length > 0) {
      lines.push('');
      lines.push('Default values to preserve:');
      for (const el of defaults) {
        lines.push(`  "${el.key}": "${el.defaultValue}"`);
      }
    }

    if (input.instructions) {
      lines.push('');
      lines.push(`User instructions: ${input.instructions}`);
    } else {
      lines.push('');
      lines.push(
        'Rewrite this slide with fresh content that fits naturally between the surrounding slides.',
      );
    }

    return lines.join('\n');
  }

  private parseSlideRegenResponse(
    raw: string,
    input: RegenerateSlideInput,
  ): Record<string, string> {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new InternalServerErrorException(
        'AI returned invalid JSON for slide regeneration',
      );
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new InternalServerErrorException(
        'AI returned non-object for slide regeneration',
      );
    }

    const obj = parsed as Record<string, unknown>;

    // If AI wrapped it in { content: {...} }, unwrap
    const content =
      obj.content &&
      typeof obj.content === 'object' &&
      !Array.isArray(obj.content)
        ? (obj.content as Record<string, unknown>)
        : obj;

    const result: Record<string, string> = {};

    for (const el of input.schema.elements) {
      const value = content[el.key] as string | undefined;
      if (value !== undefined && value !== null && String(value).trim()) {
        result[el.key] = String(value);
      } else if (el.defaultValue) {
        result[el.key] = el.defaultValue;
      } else if ((el.style as Record<string, unknown>).display !== 'none') {
        result[el.key] = input.currentContent[el.key] ?? '';
      }
    }

    // Enforce text constraints
    if (input.textConstraints) {
      for (const [key, value] of Object.entries(result)) {
        const constraint = input.textConstraints[key];
        if (!constraint || !value) continue;
        const issues: string[] = [];
        result[key] = this.enforceConstraint(value, constraint, key, issues);
        if (issues.length > 0) {
          this.logger.debug(`Slide regen constraint fix: ${issues.join('; ')}`);
        }
      }
    }

    return result;
  }

  // ---------------------------------------------------------------------------
  // OpenAI call (full carousel)
  // ---------------------------------------------------------------------------

  private async callOpenAI(
    input: GenerateCarouselInput,
    attempt: number,
  ): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(input);
    const userPrompt = this.buildUserPrompt(input);

    // Slightly raise temperature on retry to get different output
    const temperature = attempt === 0 ? 0.7 : 0.85;

    // Scale max_tokens with slide count and density
    const density: TextDensity =
      input.textDensity ?? input.brandProfile?.textDensity ?? 'moderate';
    const tokensPerSlide = density === 'detailed' ? 400 : density === 'minimal' ? 150 : 250;
    const maxTokens = Math.min(8192, input.slideCount * tokensPerSlide + 500);

    const response = await this.client.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
    });

    const usage = response.usage;
    if (usage) {
      this.logger.debug(
        `OpenAI usage — prompt: ${usage.prompt_tokens}, completion: ${usage.completion_tokens}, total: ${usage.total_tokens}`,
      );
    }

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new InternalServerErrorException('AI returned empty response');
    }

    return content;
  }

  // ---------------------------------------------------------------------------
  // Prompt construction
  // ---------------------------------------------------------------------------

  private buildSystemPrompt(input: GenerateCarouselInput): string {
    const sections: string[] = [];

    // Resolve effective density
    const density: TextDensity =
      input.textDensity ?? input.brandProfile?.textDensity ?? 'moderate';

    // Role
    sections.push(
      'You are a professional Instagram carousel content writer. Your job is to generate structured slide content as a JSON object.',
    );

    // Core rules — adapt writing style guidance based on density
    const writingStyle =
      density === 'detailed'
        ? 'Write rich, substantive text. Each body field should be a full paragraph (3-5 sentences). Provide explanations, examples, or evidence — not just headlines.'
        : density === 'minimal'
          ? 'Write extremely concise text. Short punchy phrases.'
          : 'Write clear, informative text at moderate length. 1-3 sentences per body field.';

    sections.push(`Rules:
- ${writingStyle}
- Use clear language that hooks readers and keeps them swiping.
- Number content slides naturally (e.g. "1. Topic", "2. Topic").
- The cover slide must hook the reader into swiping.
- The end slide must include a call to action.
- Return ONLY valid JSON. No markdown, no code fences, no commentary.
- Every content field must be a non-empty string.
- Do NOT include any keys that are not listed in the slide structure.`);

    // Text density (always included)
    const densityRules: Record<TextDensity, string> = {
      minimal:
        'MINIMAL density: Headings max 5 words. Body max 15-20 words per field. Short punchy phrases only.',
      moderate:
        'MODERATE density: Headings max 8 words. Body 25-40 words per field. 1-3 clear sentences.',
      detailed:
        'DETAILED density: Headings max 12 words. Body 50-100 words per field. Write 3-5 full sentences with substance, examples, and depth. Do NOT be brief — the user explicitly wants long, rich content.',
    };
    sections.push(`Text density: ${densityRules[density]}`);

    // Brand context
    if (input.brandProfile) {
      const bp = input.brandProfile;
      sections.push(`Brand guidelines:
- Brand name: "${bp.brandName}" — use naturally in handle fields, cover, and CTA.
- Tone: ${input.tone ?? bp.tone}
- CTA style: ${input.ctaGoal ?? bp.ctaStyle}`);
    } else {
      // No brand profile — use per-generation overrides if provided
      const contextLines: string[] = [];
      if (input.tone) contextLines.push(`- Tone: ${input.tone}`);
      if (input.ctaGoal)
        contextLines.push(`- CTA goal for end slide: ${input.ctaGoal}`);
      if (contextLines.length > 0) {
        sections.push(`Content guidelines:\n${contextLines.join('\n')}`);
      }
    }

    // Audience
    if (input.audience) {
      sections.push(`Target audience: ${input.audience}
Adjust vocabulary, references, and complexity to match this audience.`);
    }

    // Text constraints (scaled by density)
    if (input.textConstraints) {
      const lines = Object.entries(input.textConstraints).map(([key, c]) => {
        const scaled = this.scaleConstraint(c, density);
        const parts: string[] = [];
        if (scaled.maxWords) parts.push(`max ${scaled.maxWords} words`);
        if (scaled.maxChars) parts.push(`max ${scaled.maxChars} characters`);
        if (scaled.minWords) parts.push(`min ${scaled.minWords} words`);
        return `  "${key}": ${parts.join(', ')}`;
      });
      sections.push(
        `Text length constraints (STRICTLY enforced — violating these will reject the output):\n${lines.join('\n')}`,
      );
    }

    // Output schema
    sections.push(`Output JSON schema:
{
  "slides": [
    { "slideIndex": 0, "slideType": "cover", "content": { ...cover keys } },
    { "slideIndex": 1, "slideType": "content", "content": { ...content keys } },
    ...
    { "slideIndex": N, "slideType": "end", "content": { ...end keys } }
  ]
}`);

    return sections.join('\n\n');
  }

  private buildUserPrompt(input: GenerateCarouselInput): string {
    const coverDesc = this.describeElements(input.coverSchema.elements);
    const contentDesc = this.describeElements(input.contentSchema.elements);
    const endDesc = this.describeElements(input.endSchema.elements);

    const contentSlideCount = input.slideCount - 2;

    const lines: string[] = [
      `Generate a ${input.slideCount}-slide Instagram carousel about: "${input.topic}"`,
      '',
      'Slide structure:',
      `  Slide 0 (cover) — keys: ${coverDesc}`,
      `  Slides 1–${input.slideCount - 2} (content, ${contentSlideCount} slides) — keys: ${contentDesc}`,
      `  Slide ${input.slideCount - 1} (end) — keys: ${endDesc}`,
    ];

    // Default values hint
    const defaults = this.collectDefaults(input);
    if (defaults.length > 0) {
      lines.push('');
      lines.push(
        'Default values (use these unless the topic suggests otherwise):',
      );
      for (const d of defaults) {
        lines.push(`  "${d.key}": "${d.defaultValue}" (${d.slideType})`);
      }
    }

    lines.push('');
    lines.push(
      `For content slides, set "slideNumber" to "1/${contentSlideCount}", "2/${contentSlideCount}", etc.`,
    );

    return lines.join('\n');
  }

  private describeElements(elements: SlideElementSchema[]): string {
    return elements
      .map((e) => {
        const parts = [e.key];
        if (e.label !== e.key) parts.push(`(${e.label})`);
        return parts.join(' ');
      })
      .join(', ');
  }

  private collectDefaults(
    input: GenerateCarouselInput,
  ): { key: string; defaultValue: string; slideType: string }[] {
    const result: { key: string; defaultValue: string; slideType: string }[] =
      [];
    const schemas: [string, SlideSchema][] = [
      ['cover', input.coverSchema],
      ['content', input.contentSchema],
      ['end', input.endSchema],
    ];
    for (const [slideType, schema] of schemas) {
      for (const el of schema.elements) {
        if (el.defaultValue) {
          result.push({
            key: el.key,
            defaultValue: el.defaultValue,
            slideType,
          });
        }
      }
    }
    return result;
  }

  // ---------------------------------------------------------------------------
  // Response parsing
  // ---------------------------------------------------------------------------

  private parseResponse(raw: string): GeneratedSlide[] {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new InternalServerErrorException('AI returned invalid JSON');
    }

    // Handle both { slides: [...] } and direct array
    if (Array.isArray(parsed)) {
      return parsed as GeneratedSlide[];
    }

    const obj = parsed as Record<string, unknown>;
    if (obj.slides && Array.isArray(obj.slides)) {
      return obj.slides as GeneratedSlide[];
    }

    throw new InternalServerErrorException(
      'AI response missing "slides" array',
    );
  }

  // ---------------------------------------------------------------------------
  // Validation & normalization
  // ---------------------------------------------------------------------------

  validateAndNormalize(
    slides: GeneratedSlide[],
    input: GenerateCarouselInput,
  ): ValidationResult {
    const errors: SlideValidationError[] = [];
    const normalized: GeneratedSlide[] = [];

    // 1. Slide count check
    if (slides.length !== input.slideCount) {
      // If AI returned more slides, truncate. If fewer, that's an error.
      if (slides.length < input.slideCount) {
        errors.push({
          slideIndex: -1,
          issues: [
            `Expected ${input.slideCount} slides but got ${slides.length}`,
          ],
        });
        return { valid: false, slides: [], errors };
      }
      // Truncate extra slides (keep first N)
      slides = slides.slice(0, input.slideCount);
    }

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const slideErrors: string[] = [];

      // 2. Determine expected slide type from position
      let expectedType: 'cover' | 'content' | 'end';
      if (i === 0) {
        expectedType = 'cover';
      } else if (i === slides.length - 1) {
        expectedType = 'end';
      } else {
        expectedType = 'content';
      }

      // 3. Fix slideType if AI got it wrong
      const actualType = slide.slideType;
      if (!['cover', 'content', 'end'].includes(actualType)) {
        slideErrors.push(
          `Invalid slideType "${actualType}", corrected to "${expectedType}"`,
        );
      } else if (actualType !== expectedType) {
        slideErrors.push(
          `slideType "${actualType}" at index ${i}, corrected to "${expectedType}"`,
        );
      }

      // 4. Validate content is an object
      if (!slide.content || typeof slide.content !== 'object') {
        slideErrors.push('Missing or invalid content object');
        errors.push({ slideIndex: i, issues: slideErrors });
        // Can't recover this slide
        normalized.push({
          slideIndex: i,
          slideType: expectedType,
          content: {},
        });
        continue;
      }

      // 5. Get expected keys from the schema for this position
      const schema = this.getSchemaForType(expectedType, input);
      const allKeys = schema.elements.map((e) => e.key);

      // 6. Build normalized content: only keys from the schema
      const normalizedContent: Record<string, string> = {};

      for (const el of schema.elements) {
        const value = slide.content[el.key];
        if (value !== undefined && value !== null && String(value).trim()) {
          normalizedContent[el.key] = String(value);
        } else if (el.defaultValue) {
          // Fill with template default
          normalizedContent[el.key] = el.defaultValue;
        } else if ((el.style as Record<string, unknown>).display === 'none') {
          // Hidden elements (e.g. backgroundColor) — skip without error
          if (el.defaultValue) {
            normalizedContent[el.key] = el.defaultValue;
          }
        } else {
          slideErrors.push(`Missing content for key "${el.key}"`);
          normalizedContent[el.key] = '';
        }
      }

      // 7. Warn about extra keys AI produced (stripped)
      const extraKeys = Object.keys(slide.content).filter(
        (k) => !allKeys.includes(k),
      );
      if (extraKeys.length > 0) {
        slideErrors.push(`Stripped extra keys: ${extraKeys.join(', ')}`);
      }

      // 8. Enforce text constraints (scaled by density)
      if (input.textConstraints) {
        const effDensity: TextDensity =
          input.textDensity ?? input.brandProfile?.textDensity ?? 'moderate';
        for (const [key, value] of Object.entries(normalizedContent)) {
          const constraint = input.textConstraints[key];
          if (!constraint || !value) continue;

          const scaled = this.scaleConstraint(constraint, effDensity);
          const constrained = this.enforceConstraint(
            value,
            scaled,
            key,
            slideErrors,
          );
          normalizedContent[key] = constrained;
        }
      }

      // Only log soft issues (type corrections, extra keys) but don't fail
      if (slideErrors.length > 0) {
        this.logger.debug(
          `Slide ${i} normalization: ${slideErrors.join('; ')}`,
        );
      }

      normalized.push({
        slideIndex: i,
        slideType: expectedType,
        content: normalizedContent,
      });
    }

    // Hard failure: only if content is fundamentally broken
    const hardErrors = errors.filter((e) =>
      e.issues.some(
        (i) =>
          i.includes('Expected') || i.includes('Missing or invalid content'),
      ),
    );

    return {
      valid: hardErrors.length === 0,
      slides: normalized,
      errors,
    };
  }

  private getSchemaForType(
    type: 'cover' | 'content' | 'end',
    input: GenerateCarouselInput,
  ): SlideSchema {
    switch (type) {
      case 'cover':
        return input.coverSchema;
      case 'content':
        return input.contentSchema;
      case 'end':
        return input.endSchema;
    }
  }

  private scaleConstraint(
    constraint: TextConstraint,
    density: TextDensity,
  ): TextConstraint {
    if (density === 'moderate') return constraint;

    const factor = density === 'detailed' ? 2.5 : 0.7;
    const scaled: TextConstraint = {};
    if (constraint.maxWords)
      scaled.maxWords = Math.round(constraint.maxWords * factor);
    if (constraint.maxChars)
      scaled.maxChars = Math.round(constraint.maxChars * factor);
    if (constraint.minWords) scaled.minWords = constraint.minWords;
    return scaled;
  }

  private enforceConstraint(
    value: string,
    constraint: TextConstraint,
    key: string,
    issues: string[],
  ): string {
    let result = value;

    // Enforce maxChars by truncating
    if (constraint.maxChars && result.length > constraint.maxChars) {
      issues.push(
        `"${key}" exceeds ${constraint.maxChars} chars (${result.length}), truncated`,
      );
      result = result.slice(0, constraint.maxChars).trimEnd();
      // Try to break at last word boundary
      const lastSpace = result.lastIndexOf(' ');
      if (lastSpace > constraint.maxChars * 0.7) {
        result = result.slice(0, lastSpace);
      }
    }

    // Enforce maxWords by trimming words
    if (constraint.maxWords) {
      const words = result.split(/\s+/).filter(Boolean);
      if (words.length > constraint.maxWords) {
        issues.push(
          `"${key}" exceeds ${constraint.maxWords} words (${words.length}), trimmed`,
        );
        result = words.slice(0, constraint.maxWords).join(' ');
      }
    }

    return result;
  }
}
