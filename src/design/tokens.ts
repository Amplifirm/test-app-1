// HA tokens — ported verbatim from web prototype (drop web font fallbacks)
export const HA = {
  bg: '#0A0A0A',
  bgDeep: '#000000',
  surface: '#141414',
  surfaceHi: '#1E1E1E',
  surfaceLo: '#0B0B0B',

  ink: '#FAFAFA',
  inkMuted: '#A0A0A0',
  inkSoft: '#6B6B6B',
  inkDim: '#3A3A3A',

  stroke: 'rgba(255,255,255,0.08)',
  strokeBold: 'rgba(255,255,255,0.18)',
  strokeLime: 'rgba(200,255,62,0.35)',

  lime: '#C8FF3E',
  limeDeep: '#A8DD15',
  limeSoft: 'rgba(200,255,62,0.12)',
  limeText: '#0A0A0A',

  coral: '#FF5C39',
  coralSoft: 'rgba(255,92,57,0.16)',
} as const;

// Font family names match the loaded font keys in app/_layout.tsx
export const FONT = {
  display: 'Geist_700Bold',
  displayHeavy: 'Geist_800ExtraBold',
  body: 'Geist_400Regular',
  bodyMed: 'Geist_500Medium',
  bodyBold: 'Geist_600SemiBold',
  mono: 'GeistMono_500Medium',
  monoBold: 'GeistMono_600SemiBold',
} as const;

export const RADIUS = {
  chip: 12,
  card: 14,
  bigCard: 20,
  pill: 999,
} as const;
