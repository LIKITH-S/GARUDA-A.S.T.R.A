export const COLORS = {
  // Brand Colors
  primary: '#f6be39',          // Garuda Gold
  primaryContainer: '#d4a017', // Garuda Gold Dark
  secondary: '#4cd7f6',         // AI Cyan Light
  secondaryContainer: '#03b5d3',// AI Cyan
  
  // Tactical Dark Surface Tiers
  background: '#17130a',        // Deepest space background
  surfaceDim: '#17130a',
  surface: '#17130a',
  
  // Containers
  surfaceLowest: '#120e06',
  surfaceLow: '#201b12',
  surfaceContainer: '#241f16',
  surfaceHigh: '#2f2920',
  surfaceHighest: '#3a342a',
  
  // Outline
  outline: '#9b8f7a',
  outlineVariant: '#4f4634',
  
  // Text and Badges
  onBackground: '#ece1d3',
  onSurface: '#ece1d3',
  onSurfaceVariant: '#d3c5ae',
  onPrimary: '#402d00',
  onPrimaryContainer: '#503a00',
  onSecondary: '#003640',
  onSecondaryContainer: '#00424e',
  
  // Statuses & Errors
  error: '#ffb4ab',
  onInverseSurface: '#353026',
  inverseSurface: '#ece1d3',
  inversePrimary: '#795900',
  errorContainer: '#93000a',
  onError: '#690005',
  onErrorContainer: '#ffdad6',
  
  // Fixed variants
  primaryFixed: '#ffdfa0',
  primaryFixedDim: '#f6be39',
  secondaryFixed: '#acedff',
  secondaryFixedDim: '#4cd7f6',
  tertiary: '#a9c7ff',
  tertiaryContainer: '#72a9ff',
  tertiaryFixed: '#d6e3ff',
  tertiaryFixedDim: '#a9c7ff',
  onTertiary: '#003062',
  onTertiaryContainer: '#003d7a',
};

export const SPACING = {
  unit: 4,
  stackGap: 12,
  containerPadding: 16,
  gutter: 16,
  touchTargetMin: 48,
};

export const ROUNDED = {
  sm: 4,
  DEFAULT: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const TYPOGRAPHY = {
  displayLg: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700' as const,
    letterSpacing: -0.64,
  },
  headlineMd: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600' as const,
  },
  headlineSm: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as const,
  },
  headlineSmMobile: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  bodyLg: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '400' as const,
  },
  bodyMd: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  labelCaps: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700' as const,
    letterSpacing: 0.6,
    textTransform: 'uppercase' as const,
  },
  dataMono: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
  },
};
