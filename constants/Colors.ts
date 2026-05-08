// ─── Color Palette ───────────────────────────────────────────────────────────
// Construction professional theme: Deep Orange + Dark Navy

export const Colors = {
  // Primary Brand
  primary: '#E65100',       // Deep construction orange
  primaryDark: '#BF360C',
  primaryLight: '#FF8A65',

  // Backgrounds
  bgDark: '#0D1B2A',        // Deep navy
  bgCard: '#1A2940',        // Card background (dark)
  bgCardLight: '#F5F5F5',   // Card background (light)
  bgScreen: '#F0F2F5',      // Screen background (light)

  // Text
  textPrimary: '#0D1B2A',
  textSecondary: '#546E7A',
  textLight: '#FFFFFF',
  textMuted: '#90A4AE',

  // Status Colors
  income: '#2E7D32',        // Green for income
  incomeLight: '#E8F5E9',
  expense: '#C62828',       // Red for expense
  expenseLight: '#FFEBEE',
  warning: '#F57F17',
  warningLight: '#FFFDE7',
  info: '#1565C0',
  infoLight: '#E3F2FD',

  // Project Status
  active: '#2E7D32',
  completed: '#1565C0',
  onHold: '#F57F17',

  // UI Elements
  border: '#CFD8DC',
  borderDark: '#37474F',
  shadow: 'rgba(0,0,0,0.12)',
  overlay: 'rgba(0,0,0,0.5)',

  // Dark mode specific
  dark: {
    bg: '#0D1B2A',
    card: '#1A2940',
    surface: '#243447',
    text: '#ECEFF1',
    textSecondary: '#90A4AE',
    border: '#37474F',
  },

  // Light mode specific
  light: {
    bg: '#F0F2F5',
    card: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#0D1B2A',
    textSecondary: '#546E7A',
    border: '#CFD8DC',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};
