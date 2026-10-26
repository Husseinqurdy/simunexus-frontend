/** GSH design tokens — chanzo kimoja cha rangi, fonts na ukubwa. Zinatokana na logo. */
export const colors = {
  navy: '#0A1F6B', navyDeep: '#071650', navyMid: '#12348C',
  blue: '#0D52CE', blueDark: '#0A42A8', blueTint: '#EAF1FD', blueTint2: '#C4DBF1',
  orange: '#E37914', orangeText: '#B85F00', orangeTint: '#FFF3E6', amber: '#F5BA2E',
  success: '#137A4E', successTint: '#EDF8F1',
  warning: '#9A5B00', warningTint: '#FFF8E6',
  danger: '#B92D2D', dangerTint: '#FDEDED',
  bg: '#F5F7FC', surface: '#FFFFFF', border: '#DCE3F0', borderStrong: '#C3CEE2',
  text: '#0A1F4D', text2: '#3A4A70', textMuted: '#667697',
} as const

/** Ukubwa wa herufi (px): caption 12 · small 13 · body 14 · lead 16 · h3 18 · h2 20 · h1 24 */
export const fontSize = { caption: 12, small: 13, body: 14, lead: 16, h3: 18, h2: 20, h1: 24 } as const
export const radius = { sm: 6, md: 8, lg: 12, pill: 999 } as const
export const shadow = { card: '0 1px 3px rgba(10,31,107,.08)', pop: '0 12px 32px rgba(10,31,107,.14)' } as const
