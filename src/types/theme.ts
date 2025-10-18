/**
 * Theme configuration interface
 */
export interface ThemeConfig {
  name?: string;
  colors?: {
    background?: string;
    foreground?: string;
    prompt?: string;
    error?: string;
    success?: string;
    info?: string;
    warning?: string;
    selection?: string;
    cursor?: string;
  };
  font?: {
    family?: string;
    size?: number;
    lineHeight?: number;
  };
}

/**
 * Complete theme with all properties defined
 */
export interface Theme extends Required<Omit<ThemeConfig, 'colors' | 'font'>> {
  colors: Required<NonNullable<ThemeConfig['colors']>>;
  font: Required<NonNullable<ThemeConfig['font']>>;
}

