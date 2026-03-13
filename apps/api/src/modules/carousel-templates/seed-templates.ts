import type { SlideSchema, TextConstraints } from './carousel-template.entity';

/* ------------------------------------------------------------------ */
/*  1. Islamic Wisdom — dark theme, centered text, gold accent        */
/* ------------------------------------------------------------------ */

const islamicCover: SlideSchema = {
  width: 1080,
  height: 1080,
  backgroundColor: '#1a1a2e',
  padding: 60,
  elements: [
    {
      type: 'text',
      key: 'heading',
      label: 'Title',
      style: {
        fontSize: 56,
        fontWeight: 'bold',
        color: '#e8d5a3',
        top: 340,
        left: 60,
        width: 960,
        textAlign: 'center',
        lineHeight: 1.3,
      },
    },
    {
      type: 'text',
      key: 'subheading',
      label: 'Subtitle',
      style: {
        fontSize: 28,
        color: '#a0a0b8',
        top: 560,
        left: 60,
        width: 960,
        textAlign: 'center',
        lineHeight: 1.5,
      },
    },
    {
      type: 'text',
      key: 'handle',
      label: 'Handle',
      defaultValue: '@deenkraft',
      style: {
        fontSize: 20,
        color: '#666680',
        bottom: 60,
        left: 60,
        width: 960,
        textAlign: 'center',
      },
    },
  ],
};

const islamicContent: SlideSchema = {
  width: 1080,
  height: 1080,
  backgroundColor: '#1a1a2e',
  padding: 60,
  elements: [
    {
      type: 'text',
      key: 'heading',
      label: 'Heading',
      style: {
        fontSize: 44,
        fontWeight: 'bold',
        color: '#e8d5a3',
        top: 120,
        left: 60,
        width: 960,
        textAlign: 'left',
        lineHeight: 1.3,
      },
    },
    {
      type: 'text',
      key: 'body',
      label: 'Body Text',
      style: {
        fontSize: 28,
        color: '#d0d0e0',
        top: 300,
        left: 60,
        width: 960,
        textAlign: 'left',
        lineHeight: 1.7,
      },
    },
    {
      type: 'text',
      key: 'slideNumber',
      label: 'Slide Number',
      style: {
        fontSize: 20,
        color: '#666680',
        bottom: 60,
        right: 60,
        textAlign: 'right',
      },
    },
  ],
};

const islamicEnd: SlideSchema = {
  width: 1080,
  height: 1080,
  backgroundColor: '#1a1a2e',
  padding: 60,
  elements: [
    {
      type: 'text',
      key: 'heading',
      label: 'Closing Title',
      style: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#e8d5a3',
        top: 340,
        left: 60,
        width: 960,
        textAlign: 'center',
        lineHeight: 1.3,
      },
    },
    {
      type: 'text',
      key: 'body',
      label: 'Closing Message',
      style: {
        fontSize: 28,
        color: '#a0a0b8',
        top: 520,
        left: 60,
        width: 960,
        textAlign: 'center',
        lineHeight: 1.5,
      },
    },
    {
      type: 'text',
      key: 'ctaText',
      label: 'Call to Action',
      defaultValue: 'Save & Share',
      style: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#e8d5a3',
        bottom: 120,
        left: 60,
        width: 960,
        textAlign: 'center',
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  2. Clean Educational — light theme, numbered slides               */
/* ------------------------------------------------------------------ */

const eduCover: SlideSchema = {
  width: 1080,
  height: 1080,
  backgroundColor: '#ffffff',
  padding: 60,
  elements: [
    {
      type: 'text',
      key: 'heading',
      label: 'Title',
      style: {
        fontSize: 52,
        fontWeight: 'bold',
        color: '#1a1a1a',
        top: 300,
        left: 80,
        width: 920,
        textAlign: 'center',
        lineHeight: 1.3,
      },
    },
    {
      type: 'text',
      key: 'subheading',
      label: 'Subtitle',
      style: {
        fontSize: 26,
        color: '#666666',
        top: 540,
        left: 80,
        width: 920,
        textAlign: 'center',
        lineHeight: 1.5,
      },
    },
    {
      type: 'text',
      key: 'handle',
      label: 'Handle',
      defaultValue: '@deenkraft',
      style: {
        fontSize: 20,
        color: '#999999',
        bottom: 60,
        left: 80,
        width: 920,
        textAlign: 'center',
      },
    },
  ],
};

const eduContent: SlideSchema = {
  width: 1080,
  height: 1080,
  backgroundColor: '#ffffff',
  padding: 60,
  elements: [
    {
      type: 'text',
      key: 'heading',
      label: 'Heading',
      style: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#2563eb',
        top: 100,
        left: 80,
        width: 920,
        textAlign: 'left',
        lineHeight: 1.3,
      },
    },
    {
      type: 'text',
      key: 'body',
      label: 'Body Text',
      style: {
        fontSize: 28,
        color: '#333333',
        top: 260,
        left: 80,
        width: 920,
        textAlign: 'left',
        lineHeight: 1.7,
      },
    },
    {
      type: 'text',
      key: 'slideNumber',
      label: 'Slide Number',
      style: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2563eb',
        top: 60,
        right: 80,
        textAlign: 'right',
      },
    },
  ],
};

const eduEnd: SlideSchema = {
  width: 1080,
  height: 1080,
  backgroundColor: '#ffffff',
  padding: 60,
  elements: [
    {
      type: 'text',
      key: 'heading',
      label: 'Closing Title',
      style: {
        fontSize: 44,
        fontWeight: 'bold',
        color: '#1a1a1a',
        top: 340,
        left: 80,
        width: 920,
        textAlign: 'center',
        lineHeight: 1.3,
      },
    },
    {
      type: 'text',
      key: 'body',
      label: 'Closing Message',
      style: {
        fontSize: 26,
        color: '#666666',
        top: 500,
        left: 80,
        width: 920,
        textAlign: 'center',
        lineHeight: 1.5,
      },
    },
    {
      type: 'text',
      key: 'ctaText',
      label: 'Call to Action',
      defaultValue: 'Follow for more',
      style: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2563eb',
        bottom: 120,
        left: 80,
        width: 920,
        textAlign: 'center',
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  3. Bold Brand — vivid gradient, large headings, CTA-focused       */
/* ------------------------------------------------------------------ */

const brandCover: SlideSchema = {
  width: 1080,
  height: 1080,
  backgroundColor: '#0f172a',
  padding: 60,
  elements: [
    {
      type: 'text',
      key: 'heading',
      label: 'Title',
      style: {
        fontSize: 60,
        fontWeight: 'bold',
        color: '#f8fafc',
        top: 300,
        left: 60,
        width: 960,
        textAlign: 'center',
        lineHeight: 1.2,
      },
    },
    {
      type: 'text',
      key: 'subheading',
      label: 'Subtitle',
      style: {
        fontSize: 30,
        color: '#94a3b8',
        top: 560,
        left: 60,
        width: 960,
        textAlign: 'center',
        lineHeight: 1.4,
      },
    },
    {
      type: 'text',
      key: 'handle',
      label: 'Handle',
      defaultValue: '@deenkraft',
      style: {
        fontSize: 22,
        color: '#64748b',
        bottom: 60,
        left: 60,
        width: 960,
        textAlign: 'center',
      },
    },
  ],
};

const brandContent: SlideSchema = {
  width: 1080,
  height: 1080,
  backgroundColor: '#0f172a',
  padding: 60,
  elements: [
    {
      type: 'text',
      key: 'heading',
      label: 'Heading',
      style: {
        fontSize: 46,
        fontWeight: 'bold',
        color: '#38bdf8',
        top: 120,
        left: 60,
        width: 960,
        textAlign: 'left',
        lineHeight: 1.3,
      },
    },
    {
      type: 'text',
      key: 'body',
      label: 'Body Text',
      style: {
        fontSize: 28,
        color: '#cbd5e1',
        top: 300,
        left: 60,
        width: 960,
        textAlign: 'left',
        lineHeight: 1.7,
      },
    },
    {
      type: 'text',
      key: 'slideNumber',
      label: 'Slide Number',
      style: {
        fontSize: 20,
        color: '#475569',
        bottom: 60,
        right: 60,
        textAlign: 'right',
      },
    },
  ],
};

const brandEnd: SlideSchema = {
  width: 1080,
  height: 1080,
  backgroundColor: '#0f172a',
  padding: 60,
  elements: [
    {
      type: 'text',
      key: 'heading',
      label: 'Closing Title',
      style: {
        fontSize: 50,
        fontWeight: 'bold',
        color: '#f8fafc',
        top: 300,
        left: 60,
        width: 960,
        textAlign: 'center',
        lineHeight: 1.3,
      },
    },
    {
      type: 'text',
      key: 'body',
      label: 'Closing Message',
      style: {
        fontSize: 28,
        color: '#94a3b8',
        top: 480,
        left: 60,
        width: 960,
        textAlign: 'center',
        lineHeight: 1.5,
      },
    },
    {
      type: 'text',
      key: 'ctaText',
      label: 'Call to Action',
      defaultValue: 'Link in bio',
      style: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#38bdf8',
        bottom: 120,
        left: 60,
        width: 960,
        textAlign: 'center',
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  4. Minimal Dua — white background, serif font, Arabic + English   */
/* ------------------------------------------------------------------ */

const duaCover: SlideSchema = {
  width: 1080,
  height: 1080,
  backgroundColor: '#ffffff',
  padding: 80,
  elements: [
    {
      type: 'text',
      key: 'heading',
      label: 'Title',
      style: {
        fontSize: 38,
        color: '#1a1a1a',
        top: 420,
        left: 80,
        width: 920,
        textAlign: 'center',
        lineHeight: 1.6,
        fontFamily: 'Georgia, "Times New Roman", serif',
      },
    },
    {
      type: 'text',
      key: 'handle',
      label: 'Handle',
      defaultValue: '@deenkraft',
      style: {
        fontSize: 18,
        color: '#999999',
        bottom: 60,
        left: 80,
        width: 920,
        textAlign: 'center',
        fontFamily: 'Georgia, "Times New Roman", serif',
      },
    },
  ],
};

const duaContent: SlideSchema = {
  width: 1080,
  height: 1080,
  backgroundColor: '#ffffff',
  padding: 80,
  elements: [
    {
      type: 'text',
      key: 'arabicText',
      label: 'Arabic Text',
      style: {
        fontSize: 48,
        color: '#1a1a1a',
        top: 300,
        left: 80,
        width: 920,
        textAlign: 'center',
        lineHeight: 1.8,
        fontFamily: '"Scheherazade New", "Traditional Arabic", "Amiri", serif',
      },
    },
    {
      type: 'text',
      key: 'transliteration',
      label: 'Transliteration',
      style: {
        fontSize: 30,
        color: '#1a1a1a',
        top: 500,
        left: 80,
        width: 920,
        textAlign: 'center',
        lineHeight: 1.5,
        fontFamily: 'Georgia, "Times New Roman", serif',
      },
    },
    {
      type: 'text',
      key: 'translation',
      label: 'English Translation',
      style: {
        fontSize: 28,
        color: '#333333',
        top: 600,
        left: 80,
        width: 920,
        textAlign: 'center',
        lineHeight: 1.5,
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontStyle: 'italic',
      },
    },
    {
      type: 'text',
      key: 'handle',
      label: 'Handle',
      defaultValue: '@deenkraft',
      style: {
        fontSize: 16,
        color: '#aaaaaa',
        top: 690,
        left: 80,
        width: 920,
        textAlign: 'center',
        fontFamily: 'Georgia, "Times New Roman", serif',
      },
    },
  ],
};

const duaEnd: SlideSchema = {
  width: 1080,
  height: 1080,
  backgroundColor: '#ffffff',
  padding: 80,
  elements: [
    {
      type: 'text',
      key: 'heading',
      label: 'Closing Title',
      style: {
        fontSize: 36,
        color: '#1a1a1a',
        top: 400,
        left: 80,
        width: 920,
        textAlign: 'center',
        lineHeight: 1.5,
        fontFamily: 'Georgia, "Times New Roman", serif',
      },
    },
    {
      type: 'text',
      key: 'body',
      label: 'Closing Message',
      style: {
        fontSize: 24,
        color: '#666666',
        top: 530,
        left: 80,
        width: 920,
        textAlign: 'center',
        lineHeight: 1.5,
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontStyle: 'italic',
      },
    },
    {
      type: 'text',
      key: 'handle',
      label: 'Handle',
      defaultValue: '@deenkraft',
      style: {
        fontSize: 18,
        color: '#999999',
        bottom: 60,
        left: 80,
        width: 920,
        textAlign: 'center',
        fontFamily: 'Georgia, "Times New Roman", serif',
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  5. Tweet Thread — Twitter/X post screenshot style                  */
/* ------------------------------------------------------------------ */

const tweetCover: SlideSchema = {
  width: 1080,
  height: 1080,
  backgroundColor: '#0a0a0a',
  padding: 80,
  elements: [
    {
      type: 'text',
      key: 'backgroundColor',
      label: 'Background Color',
      defaultValue: '#0a0a0a',
      style: { display: 'none' },
    },
    {
      type: 'text',
      key: 'profileInitial',
      label: 'Profile Initial',
      defaultValue: 'D',
      style: {
        top: 100,
        left: 80,
        width: 72,
        height: 72,
        borderRadius: '50%',
        backgroundColor: '#1d9bf0',
        color: '#ffffff',
        fontSize: 32,
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      },
    },
    {
      type: 'text',
      key: 'displayName',
      label: 'Display Name',
      defaultValue: 'DeenKraft',
      style: {
        top: 102,
        left: 172,
        fontSize: 28,
        fontWeight: 'bold',
        color: '#e7e9ea',
        lineHeight: 1.3,
      },
    },
    {
      type: 'text',
      key: 'handle',
      label: 'Handle',
      defaultValue: '@deenkraft',
      style: {
        top: 138,
        left: 172,
        fontSize: 22,
        color: '#71767b',
        lineHeight: 1.3,
      },
    },
    {
      type: 'text',
      key: 'heading',
      label: 'Tweet Text',
      style: {
        top: 240,
        left: 80,
        width: 920,
        fontSize: 44,
        fontWeight: 'bold',
        color: '#e7e9ea',
        lineHeight: 1.5,
        textAlign: 'left',
      },
    },
    {
      type: 'text',
      key: 'subheading',
      label: 'Subtitle',
      style: {
        top: 560,
        left: 80,
        width: 920,
        fontSize: 26,
        color: '#71767b',
        textAlign: 'left',
        lineHeight: 1.4,
      },
    },
  ],
};

const tweetContent: SlideSchema = {
  width: 1080,
  height: 1080,
  backgroundColor: '#0a0a0a',
  padding: 80,
  elements: [
    {
      type: 'text',
      key: 'backgroundColor',
      label: 'Background Color',
      defaultValue: '#0a0a0a',
      style: { display: 'none' },
    },
    {
      type: 'text',
      key: 'profileInitial',
      label: 'Profile Initial',
      defaultValue: 'D',
      style: {
        top: 100,
        left: 80,
        width: 72,
        height: 72,
        borderRadius: '50%',
        backgroundColor: '#1d9bf0',
        color: '#ffffff',
        fontSize: 32,
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      },
    },
    {
      type: 'text',
      key: 'displayName',
      label: 'Display Name',
      defaultValue: 'DeenKraft',
      style: {
        top: 102,
        left: 172,
        fontSize: 28,
        fontWeight: 'bold',
        color: '#e7e9ea',
        lineHeight: 1.3,
      },
    },
    {
      type: 'text',
      key: 'handle',
      label: 'Handle',
      defaultValue: '@deenkraft',
      style: {
        top: 138,
        left: 172,
        fontSize: 22,
        color: '#71767b',
        lineHeight: 1.3,
      },
    },
    {
      type: 'text',
      key: 'heading',
      label: 'Tweet Heading',
      style: {
        top: 240,
        left: 80,
        width: 920,
        fontSize: 40,
        fontWeight: 'bold',
        color: '#e7e9ea',
        lineHeight: 1.4,
        textAlign: 'left',
      },
    },
    {
      type: 'text',
      key: 'body',
      label: 'Tweet Body',
      style: {
        top: 400,
        left: 80,
        width: 920,
        fontSize: 32,
        color: '#e7e9ea',
        lineHeight: 1.6,
        textAlign: 'left',
      },
    },
    {
      type: 'text',
      key: 'slideNumber',
      label: 'Slide Number',
      style: {
        fontSize: 20,
        color: '#3e4144',
        bottom: 60,
        right: 80,
        textAlign: 'right',
      },
    },
  ],
};

const tweetEnd: SlideSchema = {
  width: 1080,
  height: 1080,
  backgroundColor: '#0a0a0a',
  padding: 80,
  elements: [
    {
      type: 'text',
      key: 'backgroundColor',
      label: 'Background Color',
      defaultValue: '#0a0a0a',
      style: { display: 'none' },
    },
    {
      type: 'text',
      key: 'profileInitial',
      label: 'Profile Initial',
      defaultValue: 'D',
      style: {
        top: 100,
        left: 80,
        width: 72,
        height: 72,
        borderRadius: '50%',
        backgroundColor: '#1d9bf0',
        color: '#ffffff',
        fontSize: 32,
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      },
    },
    {
      type: 'text',
      key: 'displayName',
      label: 'Display Name',
      defaultValue: 'DeenKraft',
      style: {
        top: 102,
        left: 172,
        fontSize: 28,
        fontWeight: 'bold',
        color: '#e7e9ea',
        lineHeight: 1.3,
      },
    },
    {
      type: 'text',
      key: 'handle',
      label: 'Handle',
      defaultValue: '@deenkraft',
      style: {
        top: 138,
        left: 172,
        fontSize: 22,
        color: '#71767b',
        lineHeight: 1.3,
      },
    },
    {
      type: 'text',
      key: 'heading',
      label: 'Closing Tweet',
      style: {
        top: 260,
        left: 80,
        width: 920,
        fontSize: 44,
        fontWeight: 'bold',
        color: '#e7e9ea',
        lineHeight: 1.5,
        textAlign: 'left',
      },
    },
    {
      type: 'text',
      key: 'body',
      label: 'Closing Message',
      style: {
        top: 520,
        left: 80,
        width: 920,
        fontSize: 28,
        color: '#71767b',
        lineHeight: 1.5,
        textAlign: 'left',
      },
    },
    {
      type: 'text',
      key: 'ctaText',
      label: 'Call to Action',
      defaultValue: 'Follow + Repost',
      style: {
        top: 700,
        left: 80,
        width: 920,
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1d9bf0',
        textAlign: 'left',
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  6. Step by Step — educational numbered steps, emerald green          */
/* ------------------------------------------------------------------ */

const stepCover: SlideSchema = {
  width: 1080,
  height: 1080,
  backgroundColor: '#f0fdf4',
  padding: 80,
  elements: [
    {
      type: 'text',
      key: 'heading',
      label: 'Title',
      style: {
        fontSize: 52,
        fontWeight: 'bold',
        color: '#065f46',
        top: 320,
        left: 80,
        width: 920,
        textAlign: 'center',
        lineHeight: 1.3,
      },
    },
    {
      type: 'text',
      key: 'subheading',
      label: 'Subtitle',
      style: {
        fontSize: 26,
        color: '#64748b',
        top: 540,
        left: 80,
        width: 920,
        textAlign: 'center',
        lineHeight: 1.5,
      },
    },
    {
      type: 'text',
      key: 'handle',
      label: 'Handle',
      defaultValue: '@deenkraft',
      style: {
        fontSize: 20,
        color: '#94a3b8',
        bottom: 60,
        left: 80,
        width: 920,
        textAlign: 'center',
      },
    },
  ],
};

const stepContent: SlideSchema = {
  width: 1080,
  height: 1080,
  backgroundColor: '#f0fdf4',
  padding: 80,
  elements: [
    {
      type: 'text',
      key: 'stepNumber',
      label: 'Step Number',
      style: {
        fontSize: 72,
        fontWeight: 'bold',
        color: '#059669',
        top: 80,
        left: 80,
        lineHeight: 1,
      },
    },
    {
      type: 'text',
      key: 'heading',
      label: 'Heading',
      style: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#065f46',
        top: 200,
        left: 80,
        width: 920,
        lineHeight: 1.3,
      },
    },
    {
      type: 'text',
      key: 'body',
      label: 'Body Text',
      style: {
        fontSize: 28,
        color: '#334155',
        top: 340,
        left: 80,
        width: 920,
        lineHeight: 1.7,
      },
    },
    {
      type: 'text',
      key: 'slideNumber',
      label: 'Slide Number',
      style: {
        fontSize: 18,
        color: '#94a3b8',
        bottom: 60,
        right: 80,
        textAlign: 'right',
      },
    },
  ],
};

const stepEnd: SlideSchema = {
  width: 1080,
  height: 1080,
  backgroundColor: '#f0fdf4',
  padding: 80,
  elements: [
    {
      type: 'text',
      key: 'heading',
      label: 'Closing Title',
      style: {
        fontSize: 44,
        fontWeight: 'bold',
        color: '#065f46',
        top: 340,
        left: 80,
        width: 920,
        textAlign: 'center',
        lineHeight: 1.3,
      },
    },
    {
      type: 'text',
      key: 'body',
      label: 'Closing Message',
      style: {
        fontSize: 26,
        color: '#64748b',
        top: 500,
        left: 80,
        width: 920,
        textAlign: 'center',
        lineHeight: 1.5,
      },
    },
    {
      type: 'text',
      key: 'ctaText',
      label: 'Call to Action',
      defaultValue: 'Save this for later',
      style: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#059669',
        bottom: 120,
        left: 80,
        width: 920,
        textAlign: 'center',
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  7. Problem → Solution — dark indigo, amber problems, green fixes   */
/* ------------------------------------------------------------------ */

const psCover: SlideSchema = {
  width: 1080,
  height: 1080,
  backgroundColor: '#1e1b4b',
  padding: 80,
  elements: [
    {
      type: 'text',
      key: 'heading',
      label: 'Problem Hook',
      style: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#f59e0b',
        top: 300,
        left: 80,
        width: 920,
        textAlign: 'center',
        lineHeight: 1.4,
      },
    },
    {
      type: 'text',
      key: 'subheading',
      label: 'Subtitle',
      style: {
        fontSize: 26,
        color: '#a5b4fc',
        top: 540,
        left: 80,
        width: 920,
        textAlign: 'center',
        lineHeight: 1.5,
      },
    },
    {
      type: 'text',
      key: 'handle',
      label: 'Handle',
      defaultValue: '@deenkraft',
      style: {
        fontSize: 20,
        color: '#6366f1',
        bottom: 60,
        left: 80,
        width: 920,
        textAlign: 'center',
      },
    },
  ],
};

const psContent: SlideSchema = {
  width: 1080,
  height: 1080,
  backgroundColor: '#1e1b4b',
  padding: 80,
  elements: [
    {
      type: 'text',
      key: 'label',
      label: 'Section Label',
      style: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#f59e0b',
        top: 80,
        left: 80,
        textTransform: 'uppercase',
        letterSpacing: '2px',
      },
    },
    {
      type: 'text',
      key: 'heading',
      label: 'Heading',
      style: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#e2e8f0',
        top: 160,
        left: 80,
        width: 920,
        lineHeight: 1.3,
      },
    },
    {
      type: 'text',
      key: 'body',
      label: 'Body Text',
      style: {
        fontSize: 28,
        color: '#cbd5e1',
        top: 320,
        left: 80,
        width: 920,
        lineHeight: 1.7,
      },
    },
    {
      type: 'text',
      key: 'slideNumber',
      label: 'Slide Number',
      style: {
        fontSize: 18,
        color: '#4f46e5',
        bottom: 60,
        right: 80,
        textAlign: 'right',
      },
    },
  ],
};

const psEnd: SlideSchema = {
  width: 1080,
  height: 1080,
  backgroundColor: '#1e1b4b',
  padding: 80,
  elements: [
    {
      type: 'text',
      key: 'heading',
      label: 'Solution Summary',
      style: {
        fontSize: 44,
        fontWeight: 'bold',
        color: '#22c55e',
        top: 320,
        left: 80,
        width: 920,
        textAlign: 'center',
        lineHeight: 1.3,
      },
    },
    {
      type: 'text',
      key: 'body',
      label: 'Takeaway',
      style: {
        fontSize: 26,
        color: '#a5b4fc',
        top: 500,
        left: 80,
        width: 920,
        textAlign: 'center',
        lineHeight: 1.5,
      },
    },
    {
      type: 'text',
      key: 'ctaText',
      label: 'Call to Action',
      defaultValue: 'Share with someone who needs this',
      style: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f59e0b',
        bottom: 120,
        left: 80,
        width: 920,
        textAlign: 'center',
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  8. Daily Reflection — warm dark, serif, introspective              */
/* ------------------------------------------------------------------ */

const reflectCover: SlideSchema = {
  width: 1080,
  height: 1080,
  backgroundColor: '#1c1917',
  padding: 80,
  elements: [
    {
      type: 'text',
      key: 'heading',
      label: 'Title',
      style: {
        fontSize: 44,
        color: '#fafaf9',
        top: 380,
        left: 80,
        width: 920,
        textAlign: 'center',
        lineHeight: 1.5,
        fontFamily: 'Georgia, "Times New Roman", serif',
      },
    },
    {
      type: 'text',
      key: 'subheading',
      label: 'Subtitle',
      style: {
        fontSize: 24,
        color: '#a8a29e',
        top: 560,
        left: 80,
        width: 920,
        textAlign: 'center',
        lineHeight: 1.5,
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontStyle: 'italic',
      },
    },
  ],
};

const reflectContent: SlideSchema = {
  width: 1080,
  height: 1080,
  backgroundColor: '#1c1917',
  padding: 80,
  elements: [
    {
      type: 'text',
      key: 'heading',
      label: 'Thought',
      style: {
        fontSize: 38,
        fontWeight: 'bold',
        color: '#d97706',
        top: 200,
        left: 80,
        width: 920,
        lineHeight: 1.4,
        fontFamily: 'Georgia, "Times New Roman", serif',
      },
    },
    {
      type: 'text',
      key: 'body',
      label: 'Reflection',
      style: {
        fontSize: 28,
        color: '#e7e5e4',
        top: 380,
        left: 80,
        width: 920,
        lineHeight: 1.8,
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontStyle: 'italic',
      },
    },
    {
      type: 'text',
      key: 'slideNumber',
      label: 'Slide Number',
      style: {
        fontSize: 16,
        color: '#57534e',
        bottom: 60,
        right: 80,
        textAlign: 'right',
        fontFamily: 'Georgia, "Times New Roman", serif',
      },
    },
  ],
};

const reflectEnd: SlideSchema = {
  width: 1080,
  height: 1080,
  backgroundColor: '#1c1917',
  padding: 80,
  elements: [
    {
      type: 'text',
      key: 'heading',
      label: 'Closing Thought',
      style: {
        fontSize: 40,
        color: '#fafaf9',
        top: 360,
        left: 80,
        width: 920,
        textAlign: 'center',
        lineHeight: 1.5,
        fontFamily: 'Georgia, "Times New Roman", serif',
      },
    },
    {
      type: 'text',
      key: 'body',
      label: 'Reflection',
      style: {
        fontSize: 24,
        color: '#a8a29e',
        top: 540,
        left: 80,
        width: 920,
        textAlign: 'center',
        lineHeight: 1.5,
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontStyle: 'italic',
      },
    },
    {
      type: 'text',
      key: 'ctaText',
      label: 'Call to Action',
      defaultValue: 'What do you think? Comment below',
      style: {
        fontSize: 22,
        color: '#d97706',
        bottom: 100,
        left: 80,
        width: 920,
        textAlign: 'center',
        fontFamily: 'Georgia, "Times New Roman", serif',
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  Text constraints per template family                               */
/* ------------------------------------------------------------------ */

const defaultConstraints: TextConstraints = {
  heading: { maxWords: 8, maxChars: 60 },
  subheading: { maxWords: 12, maxChars: 80 },
  body: { maxWords: 40, maxChars: 280 },
};

const educationalConstraints: TextConstraints = {
  heading: { maxWords: 8, maxChars: 60 },
  subheading: { maxWords: 12, maxChars: 80 },
  body: { maxWords: 35, maxChars: 250 },
  stepNumber: { maxChars: 10 },
};

const problemSolutionConstraints: TextConstraints = {
  heading: { maxWords: 10, maxChars: 70 },
  subheading: { maxWords: 15, maxChars: 100 },
  body: { maxWords: 40, maxChars: 300 },
  label: { maxWords: 3, maxChars: 20 },
};

const reflectionConstraints: TextConstraints = {
  heading: { maxWords: 10, maxChars: 80 },
  subheading: { maxWords: 12, maxChars: 80 },
  body: { maxWords: 50, maxChars: 350 },
};

const duaConstraints: TextConstraints = {
  heading: { maxWords: 8, maxChars: 60 },
  arabicText: { maxChars: 200 },
  transliteration: { maxChars: 200 },
  translation: { maxWords: 30, maxChars: 200 },
};

const tweetConstraints: TextConstraints = {
  heading: { maxWords: 15, maxChars: 120 },
  body: { maxWords: 50, maxChars: 280 },
};

/* ------------------------------------------------------------------ */
/*  Seed data array                                                    */
/* ------------------------------------------------------------------ */

export const SEED_TEMPLATES: Partial<
  import('./carousel-template.entity').CarouselTemplate
>[] = [
  {
    name: 'Islamic Wisdom',
    description:
      'Dark-themed carousel with gold accents. Perfect for Islamic quotes, Hadith reminders, and Sunnah series.',
    category: 'islamic',
    family: 'wisdom',
    slideCount: 7,
    coverSlideSchema: islamicCover,
    contentSlideSchema: islamicContent,
    endSlideSchema: islamicEnd,
    textConstraints: defaultConstraints,
    isPublic: true,
  },
  {
    name: 'Clean Educational',
    description:
      'Light, minimal design with blue accents. Great for tips, how-tos, and numbered educational content.',
    category: 'educational',
    family: 'educational',
    slideCount: 7,
    coverSlideSchema: eduCover,
    contentSlideSchema: eduContent,
    endSlideSchema: eduEnd,
    textConstraints: educationalConstraints,
    isPublic: true,
  },
  {
    name: 'Bold Brand',
    description:
      'Dark slate theme with bright cyan accents. Ideal for brand announcements, product highlights, and bold statements.',
    category: 'brand',
    family: 'brand',
    slideCount: 7,
    coverSlideSchema: brandCover,
    contentSlideSchema: brandContent,
    endSlideSchema: brandEnd,
    textConstraints: defaultConstraints,
    isPublic: true,
  },
  {
    name: 'Minimal Dua',
    description:
      'Clean white background with serif typography. Designed for duas and Islamic supplications with Arabic text, transliteration, and English translation.',
    category: 'islamic',
    family: 'dua',
    slideCount: 7,
    coverSlideSchema: duaCover,
    contentSlideSchema: duaContent,
    endSlideSchema: duaEnd,
    textConstraints: duaConstraints,
    isPublic: true,
  },
  {
    name: 'Tweet Thread',
    description:
      'Twitter/X post screenshot style with configurable background. Perfect for threads, hot takes, and viral-style carousel content.',
    category: 'brand',
    family: 'tweet',
    slideCount: 7,
    coverSlideSchema: tweetCover,
    contentSlideSchema: tweetContent,
    endSlideSchema: tweetEnd,
    textConstraints: tweetConstraints,
    isPublic: true,
  },
  {
    name: 'Step by Step',
    description:
      'Fresh green-themed educational carousel with large step numbers. Ideal for tutorials, how-to guides, and numbered learning content.',
    category: 'educational',
    family: 'educational',
    slideCount: 6,
    coverSlideSchema: stepCover,
    contentSlideSchema: stepContent,
    endSlideSchema: stepEnd,
    textConstraints: educationalConstraints,
    isPublic: true,
  },
  {
    name: 'Problem → Solution',
    description:
      'Dark indigo theme with amber problem highlights and green solution accents. Structured as problem-then-solution flow.',
    category: 'educational',
    family: 'problem-solution',
    slideCount: 6,
    coverSlideSchema: psCover,
    contentSlideSchema: psContent,
    endSlideSchema: psEnd,
    textConstraints: problemSolutionConstraints,
    isPublic: true,
  },
  {
    name: 'Daily Reflection',
    description:
      'Warm dark theme with serif typography and amber accents. Designed for personal reflections, journal-style posts, and thoughtful content.',
    category: 'islamic',
    family: 'reflection',
    slideCount: 5,
    coverSlideSchema: reflectCover,
    contentSlideSchema: reflectContent,
    endSlideSchema: reflectEnd,
    textConstraints: reflectionConstraints,
    isPublic: true,
  },
];
