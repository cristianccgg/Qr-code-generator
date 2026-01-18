// SVG Templates para cada frame
// Placeholders: {WIDTH}, {HEIGHT}, {COLOR}, {TEXT}, {BG_COLOR}

export const FRAME_SVG_TEMPLATES: Record<string, string> = {
  'scan-me-basic': `
    <svg viewBox="0 0 {WIDTH} {HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect width="{WIDTH}" height="{HEIGHT}" fill="{BG_COLOR}" rx="16"/>

      <!-- Border -->
      <rect x="4" y="4" width="{BORDER_WIDTH}" height="{BORDER_HEIGHT}"
            fill="none" stroke="{COLOR}" stroke-width="3" rx="12"/>

      <!-- Text at bottom -->
      <text x="50%" y="{TEXT_Y}" text-anchor="middle"
            fill="{COLOR}" font-family="Arial, Helvetica, sans-serif"
            font-size="{FONT_SIZE}" font-weight="bold" letter-spacing="2">
        {TEXT}
      </text>
    </svg>
  `,

  'scan-to-pay': `
    <svg viewBox="0 0 {WIDTH} {HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect width="{WIDTH}" height="{HEIGHT}" fill="{BG_COLOR}" rx="16"/>

      <!-- Top bar with icon -->
      <rect x="0" y="0" width="{WIDTH}" height="{TOP_BAR_HEIGHT}" fill="{COLOR}" rx="16"
            style="clip-path: inset(0 0 50% 0 round 16px);"/>
      <rect x="0" y="{TOP_BAR_HALF}" width="{WIDTH}" height="{TOP_BAR_HALF}" fill="{COLOR}"/>

      <!-- Dollar icon -->
      <circle cx="{ICON_X}" cy="{ICON_Y}" r="{ICON_R}" fill="{BG_COLOR}"/>
      <text x="{ICON_X}" y="{ICON_TEXT_Y}" text-anchor="middle"
            fill="{COLOR}" font-family="Arial, Helvetica, sans-serif"
            font-size="{ICON_FONT}" font-weight="bold">$</text>

      <!-- Text at bottom -->
      <text x="50%" y="{TEXT_Y}" text-anchor="middle"
            fill="{COLOR}" font-family="Arial, Helvetica, sans-serif"
            font-size="{FONT_SIZE}" font-weight="bold" letter-spacing="1">
        {TEXT}
      </text>
    </svg>
  `,

  'menu-frame': `
    <svg viewBox="0 0 {WIDTH} {HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect width="{WIDTH}" height="{HEIGHT}" fill="{BG_COLOR}" rx="16"/>

      <!-- Top decorative bar -->
      <rect x="0" y="0" width="{WIDTH}" height="{TOP_BAR_HEIGHT}" fill="{COLOR}" rx="16"
            style="clip-path: inset(0 0 50% 0 round 16px);"/>
      <rect x="0" y="{TOP_BAR_HALF}" width="{WIDTH}" height="{TOP_BAR_HALF}" fill="{COLOR}"/>

      <!-- Fork and knife icons -->
      <g transform="translate({FORK_X}, {ICON_Y})" fill="{BG_COLOR}">
        <!-- Fork -->
        <path d="M-8,0 L-8,-12 M-4,0 L-4,-12 M0,0 L0,-12 M-4,0 L-4,8"
              stroke="{BG_COLOR}" stroke-width="2" fill="none" stroke-linecap="round"/>
      </g>
      <g transform="translate({KNIFE_X}, {ICON_Y})" fill="{BG_COLOR}">
        <!-- Knife -->
        <path d="M0,-12 C8,-12 8,0 0,0 L0,8"
              stroke="{BG_COLOR}" stroke-width="2" fill="none" stroke-linecap="round"/>
      </g>

      <!-- Text at bottom -->
      <text x="50%" y="{TEXT_Y}" text-anchor="middle"
            fill="{COLOR}" font-family="Arial, Helvetica, sans-serif"
            font-size="{FONT_SIZE}" font-weight="bold" letter-spacing="1">
        {TEXT}
      </text>
    </svg>
  `,

  'wifi-connect': `
    <svg viewBox="0 0 {WIDTH} {HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect width="{WIDTH}" height="{HEIGHT}" fill="{BG_COLOR}" rx="16"/>

      <!-- Top bar -->
      <rect x="0" y="0" width="{WIDTH}" height="{TOP_BAR_HEIGHT}" fill="{COLOR}" rx="16"
            style="clip-path: inset(0 0 50% 0 round 16px);"/>
      <rect x="0" y="{TOP_BAR_HALF}" width="{WIDTH}" height="{TOP_BAR_HALF}" fill="{COLOR}"/>

      <!-- WiFi icon -->
      <g transform="translate({ICON_X}, {ICON_Y})" fill="none" stroke="{BG_COLOR}" stroke-width="2.5" stroke-linecap="round">
        <path d="M-12,-6 Q0,-18 12,-6"/>
        <path d="M-8,-2 Q0,-10 8,-2"/>
        <path d="M-4,2 Q0,-2 4,2"/>
        <circle cx="0" cy="6" r="2" fill="{BG_COLOR}"/>
      </g>

      <!-- Text at bottom -->
      <text x="50%" y="{TEXT_Y}" text-anchor="middle"
            fill="{COLOR}" font-family="Arial, Helvetica, sans-serif"
            font-size="{FONT_SIZE}" font-weight="bold" letter-spacing="1">
        {TEXT}
      </text>
    </svg>
  `,

  'social-follow': `
    <svg viewBox="0 0 {WIDTH} {HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect width="{WIDTH}" height="{HEIGHT}" fill="{BG_COLOR}" rx="16"/>

      <!-- Top bar -->
      <rect x="0" y="0" width="{WIDTH}" height="{TOP_BAR_HEIGHT}" fill="{COLOR}" rx="16"
            style="clip-path: inset(0 0 50% 0 round 16px);"/>
      <rect x="0" y="{TOP_BAR_HALF}" width="{WIDTH}" height="{TOP_BAR_HALF}" fill="{COLOR}"/>

      <!-- Heart icon -->
      <g transform="translate({ICON_X}, {ICON_Y})">
        <path d="M0,4 C-5,-2 -12,-2 -12,4 C-12,10 0,16 0,16 C0,16 12,10 12,4 C12,-2 5,-2 0,4Z"
              fill="{BG_COLOR}"/>
      </g>

      <!-- Text at bottom -->
      <text x="50%" y="{TEXT_Y}" text-anchor="middle"
            fill="{COLOR}" font-family="Arial, Helvetica, sans-serif"
            font-size="{FONT_SIZE}" font-weight="bold" letter-spacing="1">
        {TEXT}
      </text>
    </svg>
  `,

  'minimal-border': `
    <svg viewBox="0 0 {WIDTH} {HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect width="{WIDTH}" height="{HEIGHT}" fill="{BG_COLOR}" rx="20"/>

      <!-- Border only -->
      <rect x="4" y="4" width="{BORDER_WIDTH}" height="{BORDER_HEIGHT}"
            fill="none" stroke="{COLOR}" stroke-width="4" rx="16"/>
    </svg>
  `,
};

export interface FrameSVGParams {
  width: number;
  height: number;
  color: string;
  text: string;
  backgroundColor: string;
}

/**
 * Genera el SVG de un frame con los parámetros dados
 */
export function generateFrameSVG(frameId: string, params: FrameSVGParams): string {
  const template = FRAME_SVG_TEMPLATES[frameId];
  if (!template) return '';

  const { width, height, color, text, backgroundColor } = params;

  // Calcular valores derivados
  const topBarHeight = Math.round(height * 0.12);
  const fontSize = Math.round(width * 0.06);
  const iconFontSize = Math.round(width * 0.08);
  const textY = Math.round(height * 0.94);
  const iconY = Math.round(topBarHeight * 0.6);
  const iconX = Math.round(width * 0.5);
  const iconR = Math.round(topBarHeight * 0.35);

  return template
    .replace(/{WIDTH}/g, String(width))
    .replace(/{HEIGHT}/g, String(height))
    .replace(/{COLOR}/g, color)
    .replace(/{TEXT}/g, text)
    .replace(/{BG_COLOR}/g, backgroundColor)
    .replace(/{TOP_BAR_HEIGHT}/g, String(topBarHeight))
    .replace(/{TOP_BAR_HALF}/g, String(Math.round(topBarHeight / 2)))
    .replace(/{FONT_SIZE}/g, String(fontSize))
    .replace(/{ICON_FONT}/g, String(iconFontSize))
    .replace(/{TEXT_Y}/g, String(textY))
    .replace(/{ICON_X}/g, String(iconX))
    .replace(/{ICON_Y}/g, String(iconY))
    .replace(/{ICON_R}/g, String(iconR))
    .replace(/{ICON_TEXT_Y}/g, String(iconY + iconR * 0.35))
    .replace(/{FORK_X}/g, String(iconX - 15))
    .replace(/{KNIFE_X}/g, String(iconX + 15))
    .replace(/{BORDER_WIDTH}/g, String(width - 8))
    .replace(/{BORDER_HEIGHT}/g, String(height - 8));
}
