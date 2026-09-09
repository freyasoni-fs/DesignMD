import { ExtractedDesignSystem } from '../types';

const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';

export async function analyzeWebsite(url: string): Promise<ExtractedDesignSystem> {
  // SSRF protection (basic check)
  try {
    const parsedUrl = new URL(url);
    if (['localhost', '127.0.0.1', '0.0.0.0'].includes(parsedUrl.hostname)) {
      throw new Error('Localhost URLs are not permitted.');
    }
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      throw new Error('Only HTTP/HTTPS protocols are permitted.');
    }
  } catch (e) {
    throw new Error('Invalid URL provided.');
  }

  let browser;
  if (isVercel) {
    const puppeteerCore = await import('puppeteer-core');
    const sparticuz = (await import('@sparticuz/chromium')).default;
    
    browser = await puppeteerCore.launch({
      args: sparticuz.args,
      executablePath: await sparticuz.executablePath(),
      headless: true,
    });
  } else {
    const puppeteer = await import('puppeteer-core');
    // Local fallback: usually requires standard puppeteer installed, but assuming Vercel deployment.
    browser = await puppeteer.launch({ headless: true });
  }
  
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Give JS-heavy frameworks (like Nike's React) a tiny bit of time to apply CSS
    if (!isVercel) {
      // playwright-core without standard playwright doesn't always have waitForTimeout directly on page,
      // but usually it does. To be safe across environments:
      await new Promise(r => setTimeout(r, 2000));
    }
  } catch (error: unknown) {
    if (error instanceof Error && !error.message.includes('Timeout')) {
      await browser.close();
      throw new Error(`Failed to load page: ${error.message}`);
    } else if (!(error instanceof Error)) {
      await browser.close();
      throw new Error(`Failed to load page: Unknown error`);
    }
    // If it's just a timeout, we proceed! The DOM is likely loaded enough to extract colors.
  }

  let rawData;
  try {
    rawData = await page.evaluate(() => {
      const rgbToHex = (rgbStr: string) => {
        const match = rgbStr.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!match) return rgbStr;
        return '#' + match.slice(1).map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('');
      };

      const colorsMap = new Map<string, { rgb: string, hex: string, count: number }>();
      const typography = new Map<string, { tag: string, fontFamily: string, weight: string, size: string, lineHeight: string, letterSpacing: string, color: string }>();
      const shadows = new Set<string>();
      const buttonStylesMap = new Map<string, { className: string, background: string, color: string, borderRadius: string, padding: string, fontSize: string, fontWeight: string, border: string }>();
      const cssVariables: { name: string, value: string }[] = [];
      const fontsMap = new Map<string, string>();

      const recordColor = (c: string) => {
        if (!c || c === 'rgba(0, 0, 0, 0)' || c === 'transparent') return;
        const hex = rgbToHex(c);
        if (!colorsMap.has(hex)) {
          colorsMap.set(hex, { rgb: c, hex, count: 1 });
        } else {
          colorsMap.get(hex)!.count++;
        }
      };

      // Extract CSS variables from :root/html
      const rootStyles = window.getComputedStyle(document.documentElement);
      for (let i = 0; i < rootStyles.length; i++) {
        const prop = rootStyles[i];
        if (prop.startsWith('--')) {
          cssVariables.push({ name: prop, value: rootStyles.getPropertyValue(prop).trim() });
        }
      }

      const elements = document.querySelectorAll('*');
      let btnIdx = 1;

      elements.forEach((el) => {
        const style = window.getComputedStyle(el);
        
        // Colors
        recordColor(style.backgroundColor);
        recordColor(style.color);
        recordColor(style.borderColor);

        // Fonts
        if (style.fontFamily) {
          const family = style.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
          if (!fontsMap.has(family)) fontsMap.set(family, 'System/Extracted');
        }

        // Shadows
        if (style.boxShadow && style.boxShadow !== 'none') {
          shadows.add(style.boxShadow);
        }

        // Typography
        const tag = el.tagName.toLowerCase();
        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'].includes(tag)) {
          if (!typography.has(tag)) {
            typography.set(tag, {
              tag,
              fontFamily: style.fontFamily,
              weight: style.fontWeight,
              size: style.fontSize,
              lineHeight: style.lineHeight,
              letterSpacing: style.letterSpacing,
              color: rgbToHex(style.color)
            });
          }
        }

        // Button styles
        if (tag === 'button' || (tag === 'a' && el.className.includes('btn')) || el.getAttribute('role') === 'button') {
          const key = `${style.backgroundColor}-${style.color}-${style.borderRadius}`;
          if (!buttonStylesMap.has(key)) {
            let btnClass = 'btn-primary';
            if (btnIdx > 1) btnClass = `btn-variant-${btnIdx}`;
            if (style.backgroundColor === 'rgba(0, 0, 0, 0)' || style.backgroundColor === 'transparent') btnClass = 'btn-ghost';
            if (parseInt(style.borderRadius, 10) > 24) btnClass = 'btn-pill';
            
            buttonStylesMap.set(key, {
              className: btnClass,
              background: rgbToHex(style.backgroundColor),
              color: rgbToHex(style.color),
              borderRadius: style.borderRadius,
              padding: style.padding,
              fontSize: style.fontSize,
              fontWeight: style.fontWeight,
              border: style.border
            });
            btnIdx++;
          }
        }
      });

      // Try to find font sources from Google Fonts
      const links = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
      links.forEach(link => {
        fontsMap.set('Google Fonts', (link as HTMLLinkElement).href);
      });

      // Try to find @font-face rules
      try {
        for (let i = 0; i < document.styleSheets.length; i++) {
          const sheet = document.styleSheets[i];
          try {
            const rules = sheet.cssRules;
            for (let j = 0; j < rules.length; j++) {
              const rule = rules[j];
              if (rule instanceof CSSFontFaceRule) {
                const family = rule.style.getPropertyValue('font-family').replace(/['"]/g, '').trim();
                const src = rule.style.getPropertyValue('src');
                const match = src.match(/url\(['"]?(.*?)['"]?\)/);
                if (match && match[1]) {
                  let url = match[1];
                  if (url.startsWith('/')) {
                    url = window.location.origin + url;
                  }
                  fontsMap.set(family, url);
                }
              }
            }
          } catch (e) {
            // Ignore cross-origin stylesheet access errors
          }
        }
      } catch (e) {}

      return {
        title: document.title,
        colors: Array.from(colorsMap.values()).sort((a, b) => b.count - a.count),
        typography: Array.from(typography.values()),
        shadows: Array.from(shadows),
        buttonStyles: Array.from(buttonStylesMap.values()),
        cssVariables,
        fonts: Array.from(fontsMap.entries()).map(([family, source]) => ({ family, source }))
      };
    });
  } finally {
    await browser.close();
  }

  // Normalize colors
  const colorTokens = rawData.colors.slice(0, 20).map((c, i) => {
    let role = 'block';
    if (i === 0) role = 'background';
    else if (i === 1) role = 'text-primary';
    else if (i === 2) role = 'primary-accent';
    return {
      hex: c.hex,
      rgb: c.rgb,
      classification: role,
      usageCount: c.count,
      evidence: []
    };
  });

  const system: ExtractedDesignSystem = {
    metadata: {
      url,
      title: rawData.title,
      analyzedAt: new Date().toISOString()
    },
    colors: colorTokens,
    typography: rawData.typography,
    fonts: rawData.fonts.map(f => ({ family: f.family, source: f.source, weights: [] })),
    icons: [],
    spacing: [],
    radius: [],
    components: [],
    shadows: rawData.shadows.map(s => ({ value: s, level: 'Low' })).slice(0, 5),
    buttonStyles: rawData.buttonStyles.slice(0, 5),
    cssVariables: rawData.cssVariables
  };

  return system;
}
