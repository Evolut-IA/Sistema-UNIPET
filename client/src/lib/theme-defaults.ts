// Default theme values shared between App.tsx and ThemeEditor.tsx
// This ensures consistency across the entire application

export const DEFAULT_THEME = {
  // Foundation
  backgroundColor: "#faf9f7",
  textColor: "#1a1a1a",
  mutedBackgroundColor: "#e0e0e0", 
  mutedTextColor: "#1a1a1a",
  
  // Typography
  sansSerifFont: "DM Sans",
  serifFont: "Georgia",
  monospaceFont: "Fira Code",
  
  // Shape & Spacing
  borderRadius: "0.5",
  
  // Actions
  primaryBackground: "#277677",
  primaryText: "#ffffff",
  secondaryBackground: "#0f1419",
  secondaryText: "#ffffff",
  accentBackground: "#e3ecf6",
  accentText: "#277677",
  destructiveBackground: "#ef4444", // Fixed: Should be red, not teal
  destructiveText: "#ffffff",
  
  // Forms
  inputBackground: "#f7f9fa",
  inputBorder: "#e1eaef",
  focusBorder: "#277677",
  
  // Containers
  cardBackground: "#ffffff",
  cardText: "#1a1a1a",
  popoverBackground: "#ffffff",
  popoverText: "#1a1a1a",
  
  // Charts
  chart1Color: "#277677",
  chart2Color: "#10b981",
  chart3Color: "#f59e0b",
  chart4Color: "#22c55e",
  chart5Color: "#ef4444",
} as const;

// Function to apply theme settings to CSS variables
export const applyThemeToCSSVariables = (themeSettings: Record<string, any>) => {
  const root = document.documentElement;
  
  // Foundation
  root.style.setProperty('--background', themeSettings.backgroundColor || DEFAULT_THEME.backgroundColor);
  root.style.setProperty('--foreground', themeSettings.textColor || DEFAULT_THEME.textColor);
  root.style.setProperty('--muted', themeSettings.mutedBackgroundColor || DEFAULT_THEME.mutedBackgroundColor);
  root.style.setProperty('--muted-foreground', themeSettings.mutedTextColor || DEFAULT_THEME.mutedTextColor);
  
  // Typography
  root.style.setProperty('--font-sans', `'${themeSettings.sansSerifFont || DEFAULT_THEME.sansSerifFont}', sans-serif`);
  root.style.setProperty('--font-serif', `'${themeSettings.serifFont || DEFAULT_THEME.serifFont}', serif`);
  root.style.setProperty('--font-mono', `'${themeSettings.monospaceFont || DEFAULT_THEME.monospaceFont}', monospace`);
  
  // Shape & Spacing
  root.style.setProperty('--radius', `${themeSettings.borderRadius || DEFAULT_THEME.borderRadius}rem`);
  
  // Actions
  root.style.setProperty('--primary', themeSettings.primaryBackground || DEFAULT_THEME.primaryBackground);
  root.style.setProperty('--primary-foreground', themeSettings.primaryText || DEFAULT_THEME.primaryText);
  root.style.setProperty('--secondary', themeSettings.secondaryBackground || DEFAULT_THEME.secondaryBackground);
  root.style.setProperty('--secondary-foreground', themeSettings.secondaryText || DEFAULT_THEME.secondaryText);
  root.style.setProperty('--accent', themeSettings.accentBackground || DEFAULT_THEME.accentBackground);
  root.style.setProperty('--accent-foreground', themeSettings.accentText || DEFAULT_THEME.accentText);
  root.style.setProperty('--destructive', themeSettings.destructiveBackground || DEFAULT_THEME.destructiveBackground);
  root.style.setProperty('--destructive-foreground', themeSettings.destructiveText || DEFAULT_THEME.destructiveText);
  
  // Forms
  root.style.setProperty('--input', themeSettings.inputBackground || DEFAULT_THEME.inputBackground);
  root.style.setProperty('--border', themeSettings.inputBorder || DEFAULT_THEME.inputBorder);
  root.style.setProperty('--ring', themeSettings.focusBorder || DEFAULT_THEME.focusBorder);
  
  // Containers
  root.style.setProperty('--card', themeSettings.cardBackground || DEFAULT_THEME.cardBackground);
  root.style.setProperty('--card-foreground', themeSettings.cardText || DEFAULT_THEME.cardText);
  root.style.setProperty('--popover', themeSettings.popoverBackground || DEFAULT_THEME.popoverBackground);
  root.style.setProperty('--popover-foreground', themeSettings.popoverText || DEFAULT_THEME.popoverText);
  
  // Sidebar (additional mapping - uses card colors as base)
  root.style.setProperty('--sidebar', themeSettings.cardBackground || DEFAULT_THEME.cardBackground);
  root.style.setProperty('--sidebar-foreground', themeSettings.cardText || DEFAULT_THEME.cardText);
  root.style.setProperty('--sidebar-primary', themeSettings.primaryBackground || DEFAULT_THEME.primaryBackground);
  root.style.setProperty('--sidebar-primary-foreground', themeSettings.primaryText || DEFAULT_THEME.primaryText);
  root.style.setProperty('--sidebar-accent', themeSettings.accentBackground || DEFAULT_THEME.accentBackground);
  root.style.setProperty('--sidebar-accent-foreground', themeSettings.accentText || DEFAULT_THEME.accentText);
  root.style.setProperty('--sidebar-border', themeSettings.inputBorder || DEFAULT_THEME.inputBorder);
  root.style.setProperty('--sidebar-ring', themeSettings.focusBorder || DEFAULT_THEME.focusBorder);
  
  // Charts
  root.style.setProperty('--chart-1', themeSettings.chart1Color || DEFAULT_THEME.chart1Color);
  root.style.setProperty('--chart-2', themeSettings.chart2Color || DEFAULT_THEME.chart2Color);
  root.style.setProperty('--chart-3', themeSettings.chart3Color || DEFAULT_THEME.chart3Color);
  root.style.setProperty('--chart-4', themeSettings.chart4Color || DEFAULT_THEME.chart4Color);
  root.style.setProperty('--chart-5', themeSettings.chart5Color || DEFAULT_THEME.chart5Color);
};