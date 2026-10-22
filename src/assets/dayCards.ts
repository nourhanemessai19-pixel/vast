// Visual day cards for Days of the Week (1 to 7)

const createDayCardSvg = (
  dayNum: number,
  dayNameAr: string,
  dayNameFr: string,
  phoneticNote: string,
  colorGradient: [string, string],
  accentColor: string,
  headerBg: string
): string => {
  const svgString = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 340" width="100%" height="100%">
  <defs>
    <linearGradient id="dayBgGrad${dayNum}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colorGradient[0]}" />
      <stop offset="100%" stop-color="${colorGradient[1]}" />
    </linearGradient>
    <linearGradient id="headerGrad${dayNum}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${accentColor}" />
      <stop offset="100%" stop-color="${headerBg}" />
    </linearGradient>
    <filter id="cardShadow${dayNum}" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-opacity="0.12"/>
    </filter>
  </defs>

  <!-- Card Background Outer Frame -->
  <rect x="12" y="12" width="396" height="316" rx="26" fill="url(#dayBgGrad${dayNum})" stroke="${accentColor}" stroke-width="2" stroke-opacity="0.25" filter="url(#cardShadow${dayNum})"/>

  <!-- Calendar Top Header Bar -->
  <path d="M 12 38 Q 12 12 38 12 L 382 12 Q 408 12 408 38 L 408 82 L 12 82 Z" fill="url(#headerGrad${dayNum})" />

  <!-- Calendar Rings / Hooks -->
  <rect x="75" y="6" width="16" height="18" rx="6" fill="#ffffff" opacity="0.9" stroke="#cbd5e1" stroke-width="1.5"/>
  <rect x="192" y="6" width="16" height="18" rx="6" fill="#ffffff" opacity="0.9" stroke="#cbd5e1" stroke-width="1.5"/>
  <rect x="309" y="6" width="16" height="18" rx="6" fill="#ffffff" opacity="0.9" stroke="#cbd5e1" stroke-width="1.5"/>

  <!-- Header Text -->
  <text x="385" y="52" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="900" fill="#ffffff" text-anchor="end">
    أيام الأسبوع
  </text>
  <text x="35" y="52" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#ffffff" opacity="0.9" text-anchor="start">
    Jour ${dayNum} / 7
  </text>

  <!-- Main Center Area: Calendar Sheet Container -->
  <rect x="28" y="96" width="364" height="216" rx="20" fill="#ffffff" fill-opacity="0.95" stroke="${accentColor}" stroke-width="1.5" stroke-opacity="0.2"/>

  <!-- Top Day Number Circle -->
  <g transform="translate(64, 142)">
    <circle cx="0" cy="0" r="24" fill="${accentColor}" fill-opacity="0.12" stroke="${accentColor}" stroke-width="2" stroke-opacity="0.4"/>
    <text x="0" y="8" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="900" fill="${accentColor}" text-anchor="middle">
      ${dayNum}
    </text>
  </g>

  <!-- Big Day Name (Arabic with Tashkeel) -->
  <text x="360" y="152" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="900" fill="#0f172a" text-anchor="end">
    ${dayNameAr}
  </text>

  <!-- French Translation -->
  <text x="360" y="186" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="700" fill="#475569" text-anchor="end">
    ${dayNameFr}
  </text>

  <!-- Divider Line -->
  <line x1="44" y1="206" x2="376" y2="206" stroke="${accentColor}" stroke-opacity="0.2" stroke-width="1.5" stroke-dasharray="4,4" />

  <!-- Week Sequence Dots Bar -->
  <g transform="translate(44, 222)">
    ${[1, 2, 3, 4, 5, 6, 7].map((num, idx) => {
      const isCurrent = num === dayNum;
      const isPast = num < dayNum;
      const dotX = idx * 47 + 22;
      const dotColor = isCurrent ? accentColor : isPast ? '#059669' : '#cbd5e1';
      const r = isCurrent ? 13 : 9;
      return `
        <circle cx="${dotX}" cy="16" r="${r}" fill="${dotColor}" opacity="${isCurrent ? 1 : isPast ? 0.7 : 0.4}" />
        <text x="${dotX}" y="${16 + (isCurrent ? 4 : 3)}" font-family="system-ui, -apple-system, sans-serif" font-size="${isCurrent ? 12 : 9}" font-weight="900" fill="#ffffff" text-anchor="middle">${num}</text>
      `;
    }).join('')}
  </g>

  <!-- Pronunciation / Phonetic Hint Box at Bottom -->
  <rect x="44" y="262" width="332" height="38" rx="12" fill="${accentColor}" fill-opacity="0.08" stroke="${accentColor}" stroke-width="1" stroke-opacity="0.2" />
  <text x="362" y="286" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="800" fill="${accentColor}" text-anchor="end">
    🔊 التقطيع: ${phoneticNote}
  </text>
</svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
};

export const dayCards: Record<string, string> = {
  sun: createDayCardSvg(1, 'الأَحَد', 'Dimanche', 'ا - لـْ - أ - حـَ - د', ['#f0fdf4', '#dcfce7'], '#059669', '#047857'),
  mon: createDayCardSvg(2, 'الإِثْنَيْن', 'Lundi', 'ا - لـْ - إ - ثـْ - نـَ - يـْ - ن', ['#eff6ff', '#dbeafe'], '#2563eb', '#1d4ed8'),
  tue: createDayCardSvg(3, 'الثُّلَاثَاء', 'Mardi', 'ا - لـثـُّ - لـَ - ا - ثـَ - ا - ء', ['#faf5ff', '#f3e8ff'], '#9333ea', '#7e22ce'),
  wed: createDayCardSvg(4, 'الأَرْبِعَاء', 'Mercredi', 'ا - لـْ - أ - رْ - بـِ - عـَ - ا - ء', ['#fff7ed', '#ffedd5'], '#ea580c', '#c2410c'),
  thu: createDayCardSvg(5, 'الخَمِيس', 'Jeudi', 'ا - لـْ - خـَ - مـِ - يـ - س', ['#ecfdf5', '#d1fae5'], '#0d9488', '#0f766e'),
  fri: createDayCardSvg(6, 'الجُمُعَة', 'Vendredi', 'ا - لـْ - جـُ - مـُ - عـَ - ة', ['#fdf2f8', '#fce7f3'], '#db2777', '#be185d'),
  sat: createDayCardSvg(7, 'السَّبْت', 'Samedi', 'ا - لـسـَّ - بـْ - ت', ['#f0f9ff', '#e0f2fe'], '#0284c7', '#0369a1'),
};
