export interface ColorToken {
  hex: string;
  rgb: string;
  classification: string;
  usageCount: number;
  evidence: string[];
}

export interface TypographyToken {
  tag: string;
  fontFamily: string;
  weight: string;
  size: string;
  lineHeight: string;
  letterSpacing: string;
  color: string;
}

export interface FontDefinition {
  family: string;
  source: string;
  weights: string[];
}

export interface IconDefinition {
  name?: string;
  library?: string;
  size: string;
  svgHtml?: string;
}

export interface SpacingToken {
  name: string;
  value: string;
}

export interface RadiusToken {
  name: string;
  value: string;
}

export interface ComponentDefinition {
  name: string;
  type: string;
  styles: Record<string, string>;
}

export interface ShadowToken {
  value: string;
  level: string;
}

export interface ButtonStyle {
  className: string;
  background: string;
  color: string;
  borderRadius: string;
  padding: string;
  fontSize: string;
  fontWeight: string;
  border: string;
}

export interface CSSVariable {
  name: string;
  value: string;
}

export interface ExtractedDesignSystem {
  metadata: {
    url: string;
    title: string;
    analyzedAt: string;
  };
  colors: ColorToken[];
  typography: TypographyToken[];
  fonts: FontDefinition[];
  icons: IconDefinition[];
  spacing: SpacingToken[];
  radius: RadiusToken[];
  components: ComponentDefinition[];
  shadows: ShadowToken[];
  buttonStyles: ButtonStyle[];
  cssVariables: CSSVariable[];
}
