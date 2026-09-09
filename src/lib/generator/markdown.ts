import { ExtractedDesignSystem } from '../types';

export function generateMarkdown(system: ExtractedDesignSystem): string {
  const urlObj = new URL(system.metadata.url);
  const domain = urlObj.hostname.replace('www.', '');
  const domainDash = domain.replace('.', '-');

  let md = `---
name: design-${domainDash}
description: Design system extracted from ${domain} (${system.metadata.url}). Use when building UI that should match this brand's visual identity.
triggers:
  - "${domain}"
  - "${domainDash}"
  - "design like ${domain}"
source: ${system.metadata.url}
extractedAt: ${system.metadata.analyzedAt}
tags: ["auto-extracted", "design-system"]
---
# Design System Inspired by ${domain}

> Auto-extracted from \`${system.metadata.url}\` on ${new Date(system.metadata.analyzedAt).toISOString().split('T')[0]}

## 1. Visual Theme & Atmosphere

*(Automatically extracted CSS properties for ${domain})*

**Key Characteristics:**
`;

  if (system.fonts.length > 0) {
    md += `- Primary fonts detected: ${system.fonts.map(f => f.family).join(', ')}\n`;
  }
  const bgColors = system.colors.filter(c => c.classification === 'background');
  if (bgColors.length > 0) {
    md += `- Primary background: ${bgColors[0].hex}\n`;
  }
  md += `- ${system.shadows.length} shadow level(s) detected\n`;
  
  md += `\n## 2. Color Palette & Roles\n\n### Primary\n`;
  
  system.colors.forEach((c, idx) => {
    md += `- **Color ${idx + 1}** (\`${c.hex}\`)\n`;
  });

  md += `\n### Full Extracted Palette\n\n| # | Hex | RGB | Usage Count |\n|---|---|---|---|\n`;
  system.colors.forEach((c, idx) => {
    md += `| ${idx + 1} | \`${c.hex}\` | ${c.rgb} | ${c.usageCount} |\n`;
  });

  md += `\n## 3. Typography Rules\n\n### Type Hierarchy\n\n| Role | Font | Size | Weight | Line Height | Letter Spacing | Color |\n|---|---|---|---|---|---|---|\n`;
  system.typography.forEach(t => {
    md += `| ${t.tag.toUpperCase()} | ${t.fontFamily.split(',')[0]} | ${t.size} | ${t.weight} | ${t.lineHeight} | ${t.letterSpacing} | ${t.color} |\n`;
  });

  if (system.fonts && system.fonts.length > 0) {
    md += `\n### Font Sources\n\n| Family | Source |\n|---|---|\n`;
    system.fonts.forEach(f => {
      md += `| ${f.family} | \`${f.source}\` |\n`;
    });
  }

  if (system.icons && system.icons.length > 0) {
    md += `\n### Extracted Icons\n\n| Name | Library | Size | Raw HTML/Src |\n|---|---|---|---|\n`;
    system.icons.forEach(icon => {
      // Escape backticks and pipes in SVG html
      const safeHtml = (icon.svgHtml || '').replace(/\|/g, '\\|').replace(/`/g, '\\`');
      md += `| ${icon.name} | ${icon.library} | ${icon.size} | \`<div>${safeHtml}</div>\` |\n`;
    });
  }

  md += `\n## 4. Component Stylings\n\n`;
  system.buttonStyles.forEach(btn => {
    md += `### ${btn.className}\n\n\`\`\`css\n.${btn.className} {\n  background: ${btn.background};\n  color: ${btn.color};\n  border-radius: ${btn.borderRadius};\n  padding: ${btn.padding};\n  font-size: ${btn.fontSize};\n  font-weight: ${btn.fontWeight};\n  border: ${btn.border};\n}\n\`\`\`\n\n`;
  });

  md += `## 5. Layout Principles\n\n*(Not extracted in V1)*\n\n`;

  md += `## 6. Depth & Elevation\n\n| Level | Shadow | Usage |\n|---|---|---|\n`;
  system.shadows.forEach(s => {
    md += `| ${s.level} | \`${s.value}\` | Auto-detected shadow |\n`;
  });

  md += `\n## 7. Do's and Don'ts\n\n### Do\n`;
  if (bgColors.length > 0) md += `- Use \`${bgColors[0].hex}\` as the primary background color\n`;
  if (system.fonts.length > 0) md += `- Use \`${system.fonts[0].family}\` for headings\n`;
  md += `- Follow the extracted button styles closely\n`;

  md += `\n## 8. Responsive Behavior\n\n*(Not extracted in V1)*\n\n`;

  md += `## 9. Agent Prompt Guide\n\n### Quick Color Reference\n\n\`\`\`\n`;
  system.colors.slice(0, 4).forEach((c, i) => {
    md += `Color ${i + 1}: ${c.hex}\n`;
  });
  md += `\`\`\`\n\n`;

  md += `## 10. CSS Custom Properties\n\n> ${system.cssVariables.length} custom properties extracted from \`:root\` / \`html\` stylesheets.\n\n### Extracted Variables\n\n| Variable | Value |\n|---|---|\n`;
  system.cssVariables.slice(0, 50).forEach(v => {
    md += `| \`${v.name}\` | \`${v.value}\` |\n`;
  });

  return md;
}
