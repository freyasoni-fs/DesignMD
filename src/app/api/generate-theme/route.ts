import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { markdown } = await req.json();

    if (!markdown || typeof markdown !== 'string') {
      return new NextResponse(JSON.stringify({ error: 'Missing markdown content' }), { status: 400 });
    }

    // Parse the markdown
    const colors: { hex: string, role: string }[] = [];
    const typography: { tag: string, family: string, size: string, weight: string }[] = [];
    const cssVars: { name: string, value: string }[] = [];
    const components: string[] = [];
    
    // Extract primary colors
    const colorRegex = /- \*\*Color \d+\*\* \(`(#[0-9a-fA-F]+)`\)/g;
    let match;
    let colorIdx = 1;
    while ((match = colorRegex.exec(markdown)) !== null) {
      colors.push({ hex: match[1], role: colorIdx === 1 ? 'background' : colorIdx === 2 ? 'primary' : `accent-${colorIdx}` });
      colorIdx++;
    }

    // Extract typography
    const typoRegex = /\|\s*(H[1-6]|P|SPAN|A)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/gi;
    while ((match = typoRegex.exec(markdown)) !== null) {
      typography.push({
        tag: match[1].toLowerCase(),
        family: match[2].trim(),
        size: match[3].trim(),
        weight: match[4].trim(),
      });
    }

    // Extract raw CSS variables
    const cssVarRegex = /\|\s*`(--[^`]+)`\s*\|\s*`([^`]+)`\s*\|/g;
    while ((match = cssVarRegex.exec(markdown)) !== null) {
      cssVars.push({ name: match[1], value: match[2] });
    }

    // Extract component blocks
    const componentRegex = /```css\n(\.[^{]+{[^}]+})\n```/g;
    while ((match = componentRegex.exec(markdown)) !== null) {
      components.push(match[1]);
    }

    // Generate globals.css
    let css = `/* Auto-generated theme from DesignMD */\n\n:root {\n`;
    colors.forEach(c => {
      css += `  --color-${c.role}: ${c.hex};\n`;
    });
    cssVars.forEach(v => {
      css += `  ${v.name}: ${v.value};\n`;
    });
    css += `}\n\nbody {\n  background-color: var(--color-background);\n  color: var(--color-primary);\n}\n\n`;
    
    typography.forEach(t => {
      css += `${t.tag} {\n  font-family: ${t.family}, sans-serif;\n  font-size: ${t.size};\n  font-weight: ${t.weight};\n}\n\n`;
    });

    components.forEach(c => {
      css += `${c}\n\n`;
    });

    // Generate tailwind.config.ts
    let tailwindColors = ``;
    colors.forEach(c => {
      tailwindColors += `        '${c.role}': '${c.hex}',\n`;
    });

    let tailwind = `import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {\n${tailwindColors}      },
    },
  },
  plugins: [],
};
export default config;
`;

    return new NextResponse(JSON.stringify({ css, tailwind }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Theme generation failed:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Error' }), { status: 500 });
  }
}
