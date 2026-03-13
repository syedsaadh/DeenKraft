import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Browser, chromium } from 'playwright';
import type {
  SlideSchema,
  SlideElementSchema,
} from '../carousel-templates/carousel-template.entity';
import type { GeneratedSlide } from './carousel-project.entity';

@Injectable()
export class CarouselRendererService {
  async renderSlide(
    schema: SlideSchema,
    content: Record<string, string>,
    family?: string | null,
    slideType?: 'cover' | 'content' | 'end',
  ): Promise<Buffer> {
    const html = this.buildHtml(schema, content, family, slideType);
    let browser: Browser | null = null;

    try {
      browser = await chromium.launch({ headless: true });
      const page = await browser.newPage({
        viewport: { width: schema.width, height: schema.height },
      });

      await page.setContent(html, { waitUntil: 'networkidle' });
      return await page.screenshot({ type: 'png' });
    } catch {
      throw new InternalServerErrorException('Failed to render slide');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async renderAllSlides(
    slides: GeneratedSlide[],
    coverSchema: SlideSchema,
    contentSchema: SlideSchema,
    endSchema: SlideSchema,
    family?: string | null,
  ): Promise<Buffer[]> {
    let browser: Browser | null = null;

    try {
      browser = await chromium.launch({ headless: true });
      const buffers: Buffer[] = [];

      for (const slide of slides) {
        const schema = this.getSchemaForSlide(
          slide,
          coverSchema,
          contentSchema,
          endSchema,
        );
        const html = this.buildHtml(
          schema,
          slide.content,
          family,
          slide.slideType,
        );

        const page = await browser.newPage({
          viewport: { width: schema.width, height: schema.height },
        });

        await page.setContent(html, { waitUntil: 'networkidle' });
        buffers.push(await page.screenshot({ type: 'png' }));
        await page.close();
      }

      return buffers;
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;
      throw new InternalServerErrorException('Failed to render slides');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  private getSchemaForSlide(
    slide: GeneratedSlide,
    coverSchema: SlideSchema,
    contentSchema: SlideSchema,
    endSchema: SlideSchema,
  ): SlideSchema {
    switch (slide.slideType) {
      case 'cover':
        return coverSchema;
      case 'end':
        return endSchema;
      default:
        return contentSchema;
    }
  }

  // ---- HTML builders ----

  private buildHtml(
    schema: SlideSchema,
    content: Record<string, string>,
    family?: string | null,
    slideType?: 'cover' | 'content' | 'end',
  ): string {
    if (family && slideType) {
      switch (family) {
        case 'educational':
          return this.buildEducationalHtml(schema, content, slideType);
        case 'problem-solution':
          return this.buildProblemSolutionHtml(schema, content, slideType);
        case 'reflection':
          return this.buildReflectionHtml(schema, content, slideType);
      }
    }

    return this.buildGenericHtml(schema, content);
  }

  private wrapHtml(
    schema: SlideSchema,
    content: Record<string, string>,
    body: string,
    fontFamily = "'Segoe UI', system-ui, -apple-system, sans-serif",
  ): string {
    const bgColor = content.backgroundColor || schema.backgroundColor;
    const bgImage = content.backgroundImage || schema.backgroundImage;

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${schema.width}px;
    height: ${schema.height}px;
    background-color: ${bgColor};
    ${bgImage ? `background-image: url('${bgImage}'); background-size: cover;` : ''}
    position: relative;
    overflow: hidden;
    font-family: ${fontFamily};
  }
</style>
</head>
<body>
${body}
</body>
</html>`;
  }

  // ---- Educational family ----

  private buildEducationalHtml(
    schema: SlideSchema,
    content: Record<string, string>,
    slideType: 'cover' | 'content' | 'end',
  ): string {
    switch (slideType) {
      case 'cover':
        return this.buildEducationalCover(schema, content);
      case 'end':
        return this.buildEducationalEnd(schema, content);
      default:
        return this.buildEducationalContent(schema, content);
    }
  }

  private buildEducationalCover(
    schema: SlideSchema,
    content: Record<string, string>,
  ): string {
    const heading = this.esc(content.heading ?? '');
    const subheading = this.esc(content.subheading ?? '');
    const handle = this.esc(content.handle ?? '');

    const body = `
      <div style="position:absolute; top:0; left:80px; right:80px; height:4px; background-color:#2563eb;"></div>
      <div style="position:absolute; top:300px; left:80px; width:920px; display:flex; flex-direction:column; align-items:center; gap:24px;">
        <h1 style="font-size:52px; font-weight:bold; color:#1a1a1a; text-align:center; line-height:1.3;">${heading}</h1>
        ${subheading ? `<p style="font-size:26px; color:#666666; text-align:center; line-height:1.5;">${subheading}</p>` : ''}
      </div>
      ${handle ? `<p style="position:absolute; bottom:60px; left:80px; width:920px; text-align:center; font-size:20px; color:#999999;">${handle}</p>` : ''}
    `;

    return this.wrapHtml(schema, content, body);
  }

  private buildEducationalContent(
    schema: SlideSchema,
    content: Record<string, string>,
  ): string {
    const heading = this.esc(content.heading ?? '');
    const bodyText = this.esc(content.body ?? '');
    const slideNumber = this.esc(content.slideNumber ?? '');
    const stepNumber = this.esc(content.stepNumber ?? '');
    const hasStep = !!stepNumber;

    const body = `
      <div style="position:absolute; top:80px; left:80px; width:4px; height:920px; background-color:#2563eb; opacity:0.15;"></div>
      ${hasStep ? `<div style="position:absolute; top:80px; left:80px; font-size:72px; font-weight:bold; color:#2563eb; line-height:1; opacity:0.2;">${stepNumber}</div>` : ''}
      ${slideNumber ? `<div style="position:absolute; top:50px; right:80px; font-size:18px; font-weight:bold; color:#2563eb; background-color:#eff6ff; padding:6px 14px; border-radius:20px;">${slideNumber}</div>` : ''}
      <div style="position:absolute; top:${hasStep ? 180 : 100}px; left:100px; width:880px;">
        <h2 style="font-size:40px; font-weight:bold; color:#2563eb; line-height:1.3; margin-bottom:28px;">${heading}</h2>
        ${bodyText ? `<p style="font-size:28px; color:#333333; line-height:1.7;">${bodyText}</p>` : ''}
      </div>
    `;

    return this.wrapHtml(schema, content, body);
  }

  private buildEducationalEnd(
    schema: SlideSchema,
    content: Record<string, string>,
  ): string {
    const heading = this.esc(content.heading ?? '');
    const bodyText = this.esc(content.body ?? '');
    const ctaText = this.esc(content.ctaText ?? '');

    const body = `
      <div style="position:absolute; bottom:0; left:80px; right:80px; height:4px; background-color:#2563eb;"></div>
      <div style="position:absolute; top:340px; left:80px; width:920px; display:flex; flex-direction:column; align-items:center; gap:24px;">
        <h2 style="font-size:44px; font-weight:bold; color:#1a1a1a; text-align:center; line-height:1.3;">${heading}</h2>
        ${bodyText ? `<p style="font-size:26px; color:#666666; text-align:center; line-height:1.5;">${bodyText}</p>` : ''}
      </div>
      ${ctaText ? `<div style="position:absolute; bottom:120px; left:80px; width:920px; text-align:center;"><span style="font-size:24px; font-weight:bold; color:#2563eb; background-color:#eff6ff; padding:12px 32px; border-radius:28px;">${ctaText}</span></div>` : ''}
    `;

    return this.wrapHtml(schema, content, body);
  }

  // ---- Problem-Solution family ----

  private buildProblemSolutionHtml(
    schema: SlideSchema,
    content: Record<string, string>,
    slideType: 'cover' | 'content' | 'end',
  ): string {
    switch (slideType) {
      case 'cover':
        return this.buildPSCover(schema, content);
      case 'end':
        return this.buildPSEnd(schema, content);
      default:
        return this.buildPSContent(schema, content);
    }
  }

  private buildPSCover(
    schema: SlideSchema,
    content: Record<string, string>,
  ): string {
    const heading = this.esc(content.heading ?? '');
    const subheading = this.esc(content.subheading ?? '');
    const handle = this.esc(content.handle ?? '');

    const body = `
      <div style="position:absolute; top:0; left:0; right:0; height:6px; background:linear-gradient(90deg, #f59e0b 0%, #f59e0b 50%, #22c55e 50%, #22c55e 100%);"></div>
      <div style="position:absolute; top:200px; left:80px; width:920px; text-align:center;">
        <span style="font-size:14px; font-weight:bold; color:#1e1b4b; background-color:#f59e0b; padding:8px 20px; border-radius:4px; text-transform:uppercase; letter-spacing:2px;">Problem &rarr; Solution</span>
      </div>
      <h1 style="position:absolute; top:300px; left:80px; width:920px; font-size:48px; font-weight:bold; color:#f59e0b; text-align:center; line-height:1.4;">${heading}</h1>
      ${subheading ? `<p style="position:absolute; top:540px; left:80px; width:920px; font-size:26px; color:#a5b4fc; text-align:center; line-height:1.5;">${subheading}</p>` : ''}
      ${handle ? `<p style="position:absolute; bottom:60px; left:80px; width:920px; text-align:center; font-size:20px; color:#6366f1;">${handle}</p>` : ''}
    `;

    return this.wrapHtml(schema, content, body);
  }

  private buildPSContent(
    schema: SlideSchema,
    content: Record<string, string>,
  ): string {
    const label = content.label ?? '';
    const heading = this.esc(content.heading ?? '');
    const bodyText = this.esc(content.body ?? '');
    const slideNumber = this.esc(content.slideNumber ?? '');

    const lowerLabel = label.toLowerCase();
    const isSolution = lowerLabel.includes('solution') || lowerLabel.includes('fix') || lowerLabel.includes('answer');
    const isProblem = lowerLabel.includes('problem') || lowerLabel.includes('challenge') || lowerLabel.includes('issue');
    const labelColor = isSolution ? '#22c55e' : '#f59e0b';
    const accentColor = isSolution ? '#22c55e' : isProblem ? '#f59e0b' : '#a5b4fc';

    const body = `
      <div style="position:absolute; top:0; left:0; width:6px; height:100%; background-color:${accentColor}; opacity:0.3;"></div>
      ${label ? `<div style="position:absolute; top:80px; left:80px;"><span style="font-size:14px; font-weight:bold; color:#1e1b4b; background-color:${labelColor}; padding:6px 16px; border-radius:4px; text-transform:uppercase; letter-spacing:2px;">${this.esc(label)}</span></div>` : ''}
      <h2 style="position:absolute; top:160px; left:80px; width:920px; font-size:42px; font-weight:bold; color:#e2e8f0; line-height:1.3;">${heading}</h2>
      ${bodyText ? `<p style="position:absolute; top:320px; left:80px; width:920px; font-size:28px; color:#cbd5e1; line-height:1.7;">${bodyText}</p>` : ''}
      ${slideNumber ? `<p style="position:absolute; bottom:60px; right:80px; font-size:18px; color:#4f46e5; text-align:right;">${slideNumber}</p>` : ''}
    `;

    return this.wrapHtml(schema, content, body);
  }

  private buildPSEnd(
    schema: SlideSchema,
    content: Record<string, string>,
  ): string {
    const heading = this.esc(content.heading ?? '');
    const bodyText = this.esc(content.body ?? '');
    const ctaText = this.esc(content.ctaText ?? '');

    const body = `
      <div style="position:absolute; top:0; left:0; right:0; height:6px; background:linear-gradient(90deg, #22c55e, #10b981);"></div>
      <div style="position:absolute; top:230px; left:80px; width:920px; text-align:center;">
        <span style="font-size:14px; font-weight:bold; color:#1e1b4b; background-color:#22c55e; padding:8px 20px; border-radius:4px; text-transform:uppercase; letter-spacing:2px;">Key Takeaway</span>
      </div>
      <h2 style="position:absolute; top:320px; left:80px; width:920px; font-size:44px; font-weight:bold; color:#22c55e; text-align:center; line-height:1.3;">${heading}</h2>
      ${bodyText ? `<p style="position:absolute; top:500px; left:80px; width:920px; font-size:26px; color:#a5b4fc; text-align:center; line-height:1.5;">${bodyText}</p>` : ''}
      ${ctaText ? `<p style="position:absolute; bottom:120px; left:80px; width:920px; font-size:24px; font-weight:bold; color:#f59e0b; text-align:center;">${ctaText}</p>` : ''}
    `;

    return this.wrapHtml(schema, content, body);
  }

  // ---- Reflection family ----

  private buildReflectionHtml(
    schema: SlideSchema,
    content: Record<string, string>,
    slideType: 'cover' | 'content' | 'end',
  ): string {
    const font = 'Georgia, "Times New Roman", serif';
    switch (slideType) {
      case 'cover':
        return this.buildReflectionCover(schema, content, font);
      case 'end':
        return this.buildReflectionEnd(schema, content, font);
      default:
        return this.buildReflectionContent(schema, content, font);
    }
  }

  private buildReflectionCover(
    schema: SlideSchema,
    content: Record<string, string>,
    font: string,
  ): string {
    const heading = this.esc(content.heading ?? '');
    const subheading = this.esc(content.subheading ?? '');

    const body = `
      <div style="position:absolute; top:200px; left:50%; transform:translateX(-50%); width:60px; height:3px; background-color:#d97706;"></div>
      <h1 style="position:absolute; top:380px; left:80px; width:920px; font-size:44px; color:#fafaf9; text-align:center; line-height:1.5;">${heading}</h1>
      ${subheading ? `<p style="position:absolute; top:560px; left:80px; width:920px; font-size:24px; color:#a8a29e; text-align:center; line-height:1.5; font-style:italic;">${subheading}</p>` : ''}
      <div style="position:absolute; bottom:200px; left:50%; transform:translateX(-50%); width:60px; height:3px; background-color:#d97706;"></div>
    `;

    return this.wrapHtml(schema, content, body, font);
  }

  private buildReflectionContent(
    schema: SlideSchema,
    content: Record<string, string>,
    font: string,
  ): string {
    const heading = this.esc(content.heading ?? '');
    const bodyText = this.esc(content.body ?? '');
    const slideNumber = this.esc(content.slideNumber ?? '');

    const body = `
      <div style="position:absolute; top:200px; left:60px; width:3px; height:680px; background-color:#d97706; opacity:0.2;"></div>
      <div style="position:absolute; top:120px; left:80px; font-size:80px; color:#d97706; opacity:0.3; line-height:1;">&ldquo;</div>
      <h2 style="position:absolute; top:200px; left:80px; width:920px; font-size:38px; font-weight:bold; color:#d97706; line-height:1.4;">${heading}</h2>
      ${bodyText ? `<p style="position:absolute; top:380px; left:80px; width:920px; font-size:28px; color:#e7e5e4; line-height:1.8; font-style:italic;">${bodyText}</p>` : ''}
      ${slideNumber ? `<p style="position:absolute; bottom:60px; right:80px; font-size:16px; color:#57534e; text-align:right;">${slideNumber}</p>` : ''}
    `;

    return this.wrapHtml(schema, content, body, font);
  }

  private buildReflectionEnd(
    schema: SlideSchema,
    content: Record<string, string>,
    font: string,
  ): string {
    const heading = this.esc(content.heading ?? '');
    const bodyText = this.esc(content.body ?? '');
    const ctaText = this.esc(content.ctaText ?? '');

    const body = `
      <div style="position:absolute; top:250px; left:50%; transform:translateX(-50%); width:60px; height:3px; background-color:#d97706;"></div>
      <h2 style="position:absolute; top:360px; left:80px; width:920px; font-size:40px; color:#fafaf9; text-align:center; line-height:1.5;">${heading}</h2>
      ${bodyText ? `<p style="position:absolute; top:540px; left:80px; width:920px; font-size:24px; color:#a8a29e; text-align:center; line-height:1.5; font-style:italic;">${bodyText}</p>` : ''}
      ${ctaText ? `<p style="position:absolute; bottom:100px; left:80px; width:920px; font-size:22px; color:#d97706; text-align:center;">${ctaText}</p>` : ''}
      <div style="position:absolute; bottom:60px; left:50%; transform:translateX(-50%); width:60px; height:3px; background-color:#d97706;"></div>
    `;

    return this.wrapHtml(schema, content, body, font);
  }

  // ---- Generic (fallback) ----

  private buildGenericHtml(
    schema: SlideSchema,
    content: Record<string, string>,
  ): string {
    const elements = schema.elements
      .map((el) => this.buildElementHtml(el, content))
      .join('\n');

    return this.wrapHtml(schema, content, elements);
  }

  private buildElementHtml(
    element: SlideElementSchema,
    content: Record<string, string>,
  ): string {
    const value = content[element.key] ?? element.defaultValue ?? '';
    if (!value) return '';

    const style = this.buildCssFromStyle(element.style);

    if (element.type === 'text') {
      return `<div style="${style}">${this.esc(value)}</div>`;
    }

    if (element.type === 'image') {
      return `<img src="${this.esc(value)}" style="${style}" />`;
    }

    return '';
  }

  private buildCssFromStyle(style: Record<string, string | number>): string {
    const cssMap: Record<string, string> = { position: 'absolute' };

    for (const [key, val] of Object.entries(style)) {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();

      if (
        [
          'top',
          'left',
          'right',
          'bottom',
          'width',
          'height',
          'font-size',
          'padding',
        ].includes(cssKey)
      ) {
        cssMap[cssKey] = typeof val === 'number' ? `${val}px` : String(val);
      } else {
        cssMap[cssKey] = String(val);
      }
    }

    return Object.entries(cssMap)
      .map(([k, v]) => `${k}: ${v}`)
      .join('; ');
  }

  private esc(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/\n/g, '<br>');
  }
}
