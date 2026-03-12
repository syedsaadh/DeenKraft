import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Browser, chromium } from 'playwright';

@Injectable()
export class TemplateRendererService {
  async renderHtmlToPng(html: string): Promise<Buffer> {
    let browser: Browser | null = null;

    try {
      browser = await chromium.launch({ headless: true });

      const page = await browser.newPage({
        viewport: { width: 1080, height: 1920 },
      });

      await page.setContent(html, { waitUntil: 'networkidle' });

      return await page.screenshot({ type: 'png' });
    } catch {
      throw new InternalServerErrorException(
        'Failed to render template preview image',
      );
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}
