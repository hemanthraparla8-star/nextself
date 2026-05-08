export const colors = {
  background: '#FEF7FF',
  surface: '#FFFFFF',
  surfaceLight: '#F8F1FC',
  surfaceMuted: '#F3EBF6',
  surfaceHigh: '#EDE6F0',
  surfaceHighest: '#E7E0EA',
  surfaceGlass: 'rgba(255, 255, 255, 0.86)',
  primary: '#6E47B7',
  primaryLight: '#B28BFF',
  primaryDark: '#45178D',
  primaryGlow: 'rgba(178, 139, 255, 0.22)',
  secondary: '#7E5CE2',
  secondaryGlow: 'rgba(126, 92, 226, 0.13)',
  accent: '#24C89A',
  accentDark: '#006C51',
  accentGlow: 'rgba(36, 200, 154, 0.12)',
  warning: '#FF8B5F',
  warningGlow: 'rgba(255, 139, 95, 0.15)',
  error: '#BA1A1A',
  errorGlow: 'rgba(255, 218, 214, 0.62)',
  textPrimary: '#1D1A21',
  textSecondary: '#4A4452',
  textMuted: '#7B7483',
  border: '#CCC3D4',
  borderLight: '#E7E0EA',
  shadow: '#201A28',
};

export const gradients = {
  primary: ['#7E5CE2', '#6E47B7'],
  softPrimary: ['#F8F1FC', '#EBDDFF'],
  accent: ['#69FBCA', '#24C89A'],
  purpleGreen: ['#D3BBFF', '#69FBCA'],
  dark: ['#FFFFFF', '#FEF7FF'],
  glow: ['rgba(178,139,255,0.32)', 'rgba(178,139,255,0)'],
  card: ['rgba(255,255,255,0.96)', 'rgba(248,241,252,0.82)'],
  cameraOverlay: ['rgba(29,26,33,0.04)', 'rgba(29,26,33,0.56)'],
};

export const radii = {
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
};

export const shadows = {
  glass: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.06,
    shadowRadius: 34,
    elevation: 4,
  },
  lifted: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.08,
    shadowRadius: 40,
    elevation: 6,
  },
};

export const typography = {
  headlineFamily: 'serif',
  bodyFamily: undefined,
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
    letterSpacing: 0,
  },
  sectionTitle: {
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '700',
    letterSpacing: 0,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
};
