// Clean visual number cards (1 to 10) with Latin numerals only and visual counting units

const createNumberSvg = (
  num: number,
  wordAr: string,
  wordFr: string,
  colorGradient: [string, string],
  accentColor: string
): string => {
  // Generate dot grid for visual counting
  const dots: string[] = [];
  const totalDots = num;
  const cols = totalDots > 6 ? 5 : totalDots > 4 ? 4 : totalDots > 2 ? 3 : totalDots;
  const dotSize = totalDots > 6 ? 14 : 18;
  const spacingX = totalDots > 6 ? 36 : 46;
  const spacingY = 32;

  const rows = Math.ceil(totalDots / cols);
  const startY = 245 - ((rows - 1) * spacingY) / 2;

  for (let i = 0; i < totalDots; i++) {
    const row = Math.floor(i / cols);
    const colInThisRow = i % cols;
    const itemsInRow = row === rows - 1 ? (totalDots % cols === 0 ? cols : totalDots % cols) : cols;
    const rowStartX = 200 - ((itemsInRow - 1) * spacingX) / 2;
    const cx = rowStartX + colInThisRow * spacingX;
    const cy = startY + row * spacingY;

    dots.push(`
      <circle cx="${cx}" cy="${cy}" r="${dotSize}" fill="${accentColor}" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))" />
      <circle cx="${cx - 3}" cy="${cy - 3}" r="${dotSize * 0.35}" fill="#ffffff" opacity="0.6" />
    `);
  }

  const svgString = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad${num}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colorGradient[0]}" />
      <stop offset="100%" stop-color="${colorGradient[1]}" />
    </linearGradient>
    <filter id="shadow${num}" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.08"/>
    </filter>
  </defs>

  <!-- Card Background -->
  <rect x="10" y="10" width="380" height="300" rx="28" fill="url(#bgGrad${num})" stroke="${accentColor}" stroke-width="2.5" stroke-opacity="0.3" filter="url(#shadow${num})"/>

  <!-- Top Badges -->
  <rect x="30" y="24" width="70" height="32" rx="12" fill="${accentColor}" fill-opacity="0.15" />
  <text x="65" y="45" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="900" fill="${accentColor}" text-anchor="middle"># ${num}</text>

  <rect x="290" y="24" width="80" height="32" rx="12" fill="${accentColor}" fill-opacity="0.15" />
  <text x="330" y="45" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="900" fill="${accentColor}" text-anchor="middle">العدد ${num}</text>

  <!-- Large Centered Latin Numeral -->
  <g transform="translate(200, 115)">
    <circle cx="0" cy="-5" r="46" fill="#ffffff" fill-opacity="0.6" stroke="${accentColor}" stroke-width="2" stroke-opacity="0.2"/>
    <text x="0" y="22" font-family="system-ui, -apple-system, sans-serif" font-size="82" font-weight="900" fill="${accentColor}" text-anchor="middle" letter-spacing="-2">
      ${num}
    </text>
  </g>

  <!-- Arabic Word and French Word -->
  <text x="350" y="165" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="900" fill="#0f172a" text-anchor="end">
    ${wordAr}
  </text>
  <text x="50" y="165" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" fill="#475569" text-anchor="start">
    ${wordFr}
  </text>

  <!-- Visual Counting Unit Container -->
  <rect x="25" y="178" width="350" height="112" rx="18" fill="#ffffff" fill-opacity="0.85" stroke="${accentColor}" stroke-width="1.5" stroke-opacity="0.25"/>

  <!-- Visual Counting Dots -->
  ${dots.join('')}
</svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
};

export const numberCards: Record<number, string> = {
  1: createNumberSvg(1, 'وَاحِد', 'Un', ['#f0fdf4', '#dcfce7'], '#059669'),
  2: createNumberSvg(2, 'اِثْنَان', 'Deux', ['#eff6ff', '#dbeafe'], '#2563eb'),
  3: createNumberSvg(3, 'ثَلَاثَة', 'Trois', ['#faf5ff', '#f3e8ff'], '#9333ea'),
  4: createNumberSvg(4, 'أَرْبَعَة', 'Quatre', ['#fff7ed', '#ffedd5'], '#ea580c'),
  5: createNumberSvg(5, 'خَمْسَة', 'Cinq', ['#ecfdf5', '#d1fae5'], '#0d9488'),
  6: createNumberSvg(6, 'سِتَّة', 'Six', ['#fdf2f8', '#fce7f3'], '#db2777'),
  7: createNumberSvg(7, 'سَبْعَة', 'Sept', ['#f0fdfa', '#ccfbf1'], '#0f766e'),
  8: createNumberSvg(8, 'ثَمَانِيَة', 'Huit', ['#fefce8', '#fef08a'], '#ca8a04'),
  9: createNumberSvg(9, 'تِسْعَة', 'Neuf', ['#eef2ff', '#e0e7ff'], '#4f46e5'),
  10: createNumberSvg(10, 'عَشَرَة', 'Dix', ['#f8fafc', '#e2e8f0'], '#0f172a'),
};
