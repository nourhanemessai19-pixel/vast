#!/usr/bin/env python3
"""
VAST Clinical Mouth Articulation Video Generator
Generates high-definition clinical video demonstrations for Broca's aphasia therapy.
"""

import os
import subprocess
import json

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.join(BASE_DIR, 'public', 'videos', 'vast')
TMP_DIR = '/tmp/vast_build'

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(TMP_DIR, exist_ok=True)

# Mouth photographic image assets
MOUTH_IMAGES = {
    'base': os.path.join(BASE_DIR, 'src/assets/images/therapist_mouth_base_1788815071433.jpg'),
    'open': os.path.join(BASE_DIR, 'src/assets/images/therapist_mouth_open_1788815087711.jpg'),
    'round': os.path.join(BASE_DIR, 'src/assets/images/therapist_mouth_round_1788815102446.jpg'),
    'teeth': os.path.join(BASE_DIR, 'src/assets/images/therapist_mouth_teeth_1788815117305.jpg'),
    'f': os.path.join(BASE_DIR, 'src/assets/images/therapist_mouth_f_1788815129987.jpg'),
}

# Video specifications
VIDEO_ITEMS = [
    # 1. الأرقام
    {
        'id': 'num-1',
        'title': 'وَاحِدْ (1)',
        'category': 'الأرقام',
        'guide': 'ضم الشفتين (وَا) ◀ مخرج الحلق (حـِ) ◀ مخرج الأسنان (د)',
        'steps': [
            {'mouth': 'base', 'duration': 0.6, 'activeSyllable': 'استعداد', 'syllables': ['وَا', 'حـِ', 'دْ']},
            {'mouth': 'round', 'duration': 0.9, 'activeSyllable': 'وَا', 'syllables': ['وَا', 'حـِ', 'دْ'], 'activeIdx': 0},
            {'mouth': 'open', 'duration': 0.8, 'activeSyllable': 'حـِ', 'syllables': ['وَا', 'حـِ', 'دْ'], 'activeIdx': 1},
            {'mouth': 'teeth', 'duration': 0.8, 'activeSyllable': 'دْ', 'syllables': ['وَا', 'حـِ', 'دْ'], 'activeIdx': 2},
            {'mouth': 'base', 'duration': 0.6, 'activeSyllable': 'إتمام', 'syllables': ['وَا', 'حـِ', 'دْ']},
        ]
    },
    {
        'id': 'num-2',
        'title': 'إِثْنَانْ (2)',
        'category': 'الأرقام',
        'guide': 'الأسنان مع الثاء (إِثـْ) ◀ فتح الفم (نـَا) ◀ اللسان بالأسنان (ن)',
        'steps': [
            {'mouth': 'base', 'duration': 0.6, 'activeSyllable': 'استعداد', 'syllables': ['إِثـْ', 'نـَا', 'نْ']},
            {'mouth': 'teeth', 'duration': 0.9, 'activeSyllable': 'إِثـْ', 'syllables': ['إِثـْ', 'نـَا', 'نْ'], 'activeIdx': 0},
            {'mouth': 'open', 'duration': 0.9, 'activeSyllable': 'نـَا', 'syllables': ['إِثـْ', 'نـَا', 'نْ'], 'activeIdx': 1},
            {'mouth': 'teeth', 'duration': 0.8, 'activeSyllable': 'نْ', 'syllables': ['إِثـْ', 'نـَا', 'نْ'], 'activeIdx': 2},
            {'mouth': 'base', 'duration': 0.6, 'activeSyllable': 'إتمام', 'syllables': ['إِثـْ', 'نـَا', 'نْ']},
        ]
    },
    {
        'id': 'num-3',
        'title': 'ثَلَاثَة (3)',
        'category': 'الأرقام',
        'guide': 'اللسان بين الأسنان (ثـَ) ◀ فتح الفم (لَا) ◀ تكرار الثاء (ثـَ)',
        'steps': [
            {'mouth': 'base', 'duration': 0.6, 'activeSyllable': 'استعداد', 'syllables': ['ثـَ', 'لَا', 'ثـَ', 'ة']},
            {'mouth': 'teeth', 'duration': 0.8, 'activeSyllable': 'ثـَ', 'syllables': ['ثـَ', 'لَا', 'ثـَ', 'ة'], 'activeIdx': 0},
            {'mouth': 'open', 'duration': 0.8, 'activeSyllable': 'لَا', 'syllables': ['ثـَ', 'لَا', 'ثـَ', 'ة'], 'activeIdx': 1},
            {'mouth': 'teeth', 'duration': 0.8, 'activeSyllable': 'ثـَ', 'syllables': ['ثـَ', 'لَا', 'ثـَ', 'ة'], 'activeIdx': 2},
            {'mouth': 'open', 'duration': 0.7, 'activeSyllable': 'ة', 'syllables': ['ثـَ', 'لَا', 'ثـَ', 'ة'], 'activeIdx': 3},
            {'mouth': 'base', 'duration': 0.6, 'activeSyllable': 'إتمام', 'syllables': ['ثـَ', 'لَا', 'ثـَ', 'ة']},
        ]
    },
    {
        'id': 'num-5',
        'title': 'خَمْسَة (5)',
        'category': 'الأرقام',
        'guide': 'مخرج الخاء (خـَ) ◀ إطباق الشفتين الكامل (مـْ) ◀ صفير السين (سـَ)',
        'steps': [
            {'mouth': 'base', 'duration': 0.6, 'activeSyllable': 'استعداد', 'syllables': ['خـَ', 'مـْ', 'سـَ', 'ة']},
            {'mouth': 'open', 'duration': 0.8, 'activeSyllable': 'خـَ', 'syllables': ['خـَ', 'مـْ', 'سـَ', 'ة'], 'activeIdx': 0},
            {'mouth': 'base', 'duration': 0.8, 'activeSyllable': 'مـْ', 'syllables': ['خـَ', 'مـْ', 'سـَ', 'ة'], 'activeIdx': 1},
            {'mouth': 'teeth', 'duration': 0.8, 'activeSyllable': 'سـَ', 'syllables': ['خـَ', 'مـْ', 'سـَ', 'ة'], 'activeIdx': 2},
            {'mouth': 'open', 'duration': 0.7, 'activeSyllable': 'ة', 'syllables': ['خـَ', 'مـْ', 'سـَ', 'ة'], 'activeIdx': 3},
            {'mouth': 'base', 'duration': 0.6, 'activeSyllable': 'إتمام', 'syllables': ['خـَ', 'مـْ', 'سـَ', 'ة']},
        ]
    },

    # 2. أيام الأسبوع
    {
        'id': 'day-sun',
        'title': 'الأَحَدْ',
        'category': 'أيام الأسبوع',
        'guide': 'انفتاح الفم (أَ) ◀ خروج الحاء من الحلق (حـَ) ◀ مخرج الأسنان (د)',
        'steps': [
            {'mouth': 'base', 'duration': 0.6, 'activeSyllable': 'استعداد', 'syllables': ['أَ', 'حـَ', 'دْ']},
            {'mouth': 'open', 'duration': 0.9, 'activeSyllable': 'أَ', 'syllables': ['أَ', 'حـَ', 'دْ'], 'activeIdx': 0},
            {'mouth': 'open', 'duration': 0.8, 'activeSyllable': 'حـَ', 'syllables': ['أَ', 'حـَ', 'دْ'], 'activeIdx': 1},
            {'mouth': 'teeth', 'duration': 0.8, 'activeSyllable': 'دْ', 'syllables': ['أَ', 'حـَ', 'دْ'], 'activeIdx': 2},
            {'mouth': 'base', 'duration': 0.6, 'activeSyllable': 'إتمام', 'syllables': ['أَ', 'حـَ', 'دْ']},
        ]
    },
    {
        'id': 'day-mon',
        'title': 'الإِثْنَيْنْ',
        'category': 'أيام الأسبوع',
        'guide': 'ظهور الأسنان مع الثاء (إِثـْ) ◀ ابتسامة النون والياء (نـَيْ) ◀ إطباق النون (ن)',
        'steps': [
            {'mouth': 'base', 'duration': 0.6, 'activeSyllable': 'استعداد', 'syllables': ['إِثـْ', 'نـَيْ', 'نْ']},
            {'mouth': 'teeth', 'duration': 0.9, 'activeSyllable': 'إِثـْ', 'syllables': ['إِثـْ', 'نـَيْ', 'نْ'], 'activeIdx': 0},
            {'mouth': 'teeth', 'duration': 0.9, 'activeSyllable': 'نـَيْ', 'syllables': ['إِثـْ', 'نـَيْ', 'نْ'], 'activeIdx': 1},
            {'mouth': 'teeth', 'duration': 0.8, 'activeSyllable': 'نْ', 'syllables': ['إِثـْ', 'نـَيْ', 'نْ'], 'activeIdx': 2},
            {'mouth': 'base', 'duration': 0.6, 'activeSyllable': 'إتمام', 'syllables': ['إِثـْ', 'نـَيْ', 'نْ']},
        ]
    },
    {
        'id': 'day-fri',
        'title': 'الجُمُعَة',
        'category': 'أيام الأسبوع',
        'guide': 'ضم الشفتين (جـُ) ◀ ضم الشفتين مع الميم (مـُ) ◀ فتح الفم والعين (عـَ)',
        'steps': [
            {'mouth': 'base', 'duration': 0.6, 'activeSyllable': 'استعداد', 'syllables': ['جـُ', 'مـُ', 'عـَ', 'ة']},
            {'mouth': 'round', 'duration': 0.8, 'activeSyllable': 'جـُ', 'syllables': ['جـُ', 'مـُ', 'عـَ', 'ة'], 'activeIdx': 0},
            {'mouth': 'round', 'duration': 0.8, 'activeSyllable': 'مـُ', 'syllables': ['جـُ', 'مـُ', 'عـَ', 'ة'], 'activeIdx': 1},
            {'mouth': 'open', 'duration': 0.8, 'activeSyllable': 'عـَ', 'syllables': ['جـُ', 'مـُ', 'عـَ', 'ة'], 'activeIdx': 2},
            {'mouth': 'open', 'duration': 0.7, 'activeSyllable': 'ة', 'syllables': ['جـُ', 'مـُ', 'عـَ', 'ة'], 'activeIdx': 3},
            {'mouth': 'base', 'duration': 0.6, 'activeSyllable': 'إتمام', 'syllables': ['جـُ', 'مـُ', 'عـَ', 'ة']},
        ]
    },
    {
        'id': 'day-sat',
        'title': 'السَّبْتْ',
        'category': 'أيام الأسبوع',
        'guide': 'صفير السين والأسنان (سـَ) ◀ إطباق الشفتين التام (بـْ) ◀ انفجار التاء (ت)',
        'steps': [
            {'mouth': 'base', 'duration': 0.6, 'activeSyllable': 'استعداد', 'syllables': ['سـَ', 'بـْ', 'تْ']},
            {'mouth': 'teeth', 'duration': 0.9, 'activeSyllable': 'سـَ', 'syllables': ['سـَ', 'بـْ', 'تْ'], 'activeIdx': 0},
            {'mouth': 'base', 'duration': 0.8, 'activeSyllable': 'بـْ', 'syllables': ['سـَ', 'بـْ', 'تْ'], 'activeIdx': 1},
            {'mouth': 'teeth', 'duration': 0.8, 'activeSyllable': 'تْ', 'syllables': ['سـَ', 'بـْ', 'تْ'], 'activeIdx': 2},
            {'mouth': 'base', 'duration': 0.6, 'activeSyllable': 'إتمام', 'syllables': ['سـَ', 'بـْ', 'تْ']},
        ]
    },

    # 3. أشهر السنة
    {
        'id': 'm-1',
        'title': 'جَانْفِي',
        'category': 'أشهر السنة',
        'guide': 'فتح الفم (جـَا) ◀ اللسان بالأسنان (نـْ) ◀ الأسنان على الشفة السفلى (فـِ)',
        'steps': [
            {'mouth': 'base', 'duration': 0.6, 'activeSyllable': 'استعداد', 'syllables': ['جـَا', 'نـْ', 'فـِ', 'ي']},
            {'mouth': 'open', 'duration': 0.9, 'activeSyllable': 'جـَا', 'syllables': ['جـَا', 'نـْ', 'فـِ', 'ي'], 'activeIdx': 0},
            {'mouth': 'teeth', 'duration': 0.7, 'activeSyllable': 'نـْ', 'syllables': ['جـَا', 'نـْ', 'فـِ', 'ي'], 'activeIdx': 1},
            {'mouth': 'f', 'duration': 0.9, 'activeSyllable': 'فـِ', 'syllables': ['جـَا', 'نـْ', 'فـِ', 'ي'], 'activeIdx': 2},
            {'mouth': 'teeth', 'duration': 0.8, 'activeSyllable': 'ي', 'syllables': ['جـَا', 'نـْ', 'فـِ', 'ي'], 'activeIdx': 3},
            {'mouth': 'base', 'duration': 0.6, 'activeSyllable': 'إتمام', 'syllables': ['جـَا', 'نـْ', 'فـِ', 'ي']},
        ]
    },
    {
        'id': 'm-2',
        'title': 'فِيفْرِي',
        'category': 'أشهر السنة',
        'guide': 'الثنايا العليا على الشفة السفلى (فـِ) ◀ تكرار الفاء (فـْ) ◀ راء وياء',
        'steps': [
            {'mouth': 'base', 'duration': 0.6, 'activeSyllable': 'استعداد', 'syllables': ['فـِ', 'ي', 'فـْ', 'رِ', 'ي']},
            {'mouth': 'f', 'duration': 0.9, 'activeSyllable': 'فـِ', 'syllables': ['فـِ', 'ي', 'فـْ', 'رِ', 'ي'], 'activeIdx': 0},
            {'mouth': 'teeth', 'duration': 0.7, 'activeSyllable': 'ي', 'syllables': ['فـِ', 'ي', 'فـْ', 'رِ', 'ي'], 'activeIdx': 1},
            {'mouth': 'f', 'duration': 0.8, 'activeSyllable': 'فـْ', 'syllables': ['فـِ', 'ي', 'فـْ', 'رِ', 'ي'], 'activeIdx': 2},
            {'mouth': 'teeth', 'duration': 0.9, 'activeSyllable': 'رِي', 'syllables': ['فـِ', 'ي', 'فـْ', 'رِ', 'ي'], 'activeIdx': 3},
            {'mouth': 'base', 'duration': 0.6, 'activeSyllable': 'إتمام', 'syllables': ['فـِ', 'ي', 'فـْ', 'رِ', 'ي']},
        ]
    },
    {
        'id': 'm-3',
        'title': 'مَارِسْ',
        'category': 'أشهر السنة',
        'guide': 'إطباق الشفتين الكامل (مـَ) ◀ فتح الفم بالمد (ا) ◀ صفير السين والأسنان (س)',
        'steps': [
            {'mouth': 'base', 'duration': 0.6, 'activeSyllable': 'استعداد', 'syllables': ['مـَ', 'ا', 'رِ', 'سْ']},
            {'mouth': 'base', 'duration': 0.8, 'activeSyllable': 'مـَ', 'syllables': ['مـَ', 'ا', 'رِ', 'سْ'], 'activeIdx': 0},
            {'mouth': 'open', 'duration': 0.9, 'activeSyllable': 'ا', 'syllables': ['مـَ', 'ا', 'رِ', 'سْ'], 'activeIdx': 1},
            {'mouth': 'teeth', 'duration': 0.8, 'activeSyllable': 'رِ', 'syllables': ['مـَ', 'ا', 'رِ', 'سْ'], 'activeIdx': 2},
            {'mouth': 'teeth', 'duration': 0.8, 'activeSyllable': 'سْ', 'syllables': ['مـَ', 'ا', 'رِ', 'سْ'], 'activeIdx': 3},
            {'mouth': 'base', 'duration': 0.6, 'activeSyllable': 'إتمام', 'syllables': ['مـَ', 'ا', 'رِ', 'سْ']},
        ]
    },
    {
        'id': 'm-8',
        'title': 'أُوتْ',
        'category': 'أشهر السنة',
        'guide': 'ضم الشفتين وبروزهما (أُ) ◀ استمرار الواو المدية (و) ◀ انفجار التاء (ت)',
        'steps': [
            {'mouth': 'base', 'duration': 0.6, 'activeSyllable': 'استعداد', 'syllables': ['أُ', 'و', 'تْ']},
            {'mouth': 'round', 'duration': 0.9, 'activeSyllable': 'أُ', 'syllables': ['أُ', 'و', 'تْ'], 'activeIdx': 0},
            {'mouth': 'round', 'duration': 0.9, 'activeSyllable': 'و', 'syllables': ['أُ', 'و', 'تْ'], 'activeIdx': 1},
            {'mouth': 'teeth', 'duration': 0.8, 'activeSyllable': 'تْ', 'syllables': ['أُ', 'و', 'تْ'], 'activeIdx': 2},
            {'mouth': 'base', 'duration': 0.6, 'activeSyllable': 'إتمام', 'syllables': ['أُ', 'و', 'تْ']},
        ]
    },

    # 4. أفعال الحركة
    {
        'id': 'pray',
        'title': 'تُصَلِّي',
        'category': 'أفعال الحركة',
        'guide': 'ضم الشفتين للتاء (تـُ) ◀ تفخيم الصاد مع الأسنان (صـَ) ◀ تشديد اللام ومد الياء (لِّي)',
        'steps': [
            {'mouth': 'base', 'duration': 0.6, 'activeSyllable': 'استعداد', 'syllables': ['تـُ', 'صـَ', 'لـِّ', 'ي']},
            {'mouth': 'round', 'duration': 0.8, 'activeSyllable': 'تـُ', 'syllables': ['تـُ', 'صـَ', 'لـِّ', 'ي'], 'activeIdx': 0},
            {'mouth': 'teeth', 'duration': 0.8, 'activeSyllable': 'صـَ', 'syllables': ['تـُ', 'صـَ', 'لـِّ', 'ي'], 'activeIdx': 1},
            {'mouth': 'teeth', 'duration': 0.8, 'activeSyllable': 'لـِّ', 'syllables': ['تـُ', 'صـَ', 'لـِّ', 'ي'], 'activeIdx': 2},
            {'mouth': 'teeth', 'duration': 0.8, 'activeSyllable': 'ي', 'syllables': ['تـُ', 'صـَ', 'لـِّ', 'ي'], 'activeIdx': 3},
            {'mouth': 'base', 'duration': 0.6, 'activeSyllable': 'إتمام', 'syllables': ['تـُ', 'صـَ', 'لـِّ', 'ي']},
        ]
    },
    {
        'id': 'drink',
        'title': 'تَشْرَبْ',
        'category': 'أفعال الحركة',
        'guide': 'تاء لثوية (تـَ) ◀ تفشي الشين (شـْ) ◀ راء خفيفة ◀ إطباق الشفتين التام (بـْ)',
        'steps': [
            {'mouth': 'base', 'duration': 0.6, 'activeSyllable': 'استعداد', 'syllables': ['تـَ', 'شـْ', 'رَ', 'بْ']},
            {'mouth': 'teeth', 'duration': 0.8, 'activeSyllable': 'تـَ', 'syllables': ['تـَ', 'شـْ', 'رَ', 'بْ'], 'activeIdx': 0},
            {'mouth': 'teeth', 'duration': 0.8, 'activeSyllable': 'شـْ', 'syllables': ['تـَ', 'شـْ', 'رَ', 'بْ'], 'activeIdx': 1},
            {'mouth': 'open', 'duration': 0.7, 'activeSyllable': 'رَ', 'syllables': ['تـَ', 'شـْ', 'رَ', 'بْ'], 'activeIdx': 2},
            {'mouth': 'base', 'duration': 0.8, 'activeSyllable': 'بْ', 'syllables': ['تـَ', 'شـْ', 'رَ', 'بْ'], 'activeIdx': 3},
            {'mouth': 'base', 'duration': 0.6, 'activeSyllable': 'إتمام', 'syllables': ['تـَ', 'شـْ', 'رَ', 'بْ']},
        ]
    },
]

def make_overlay_svg(item, step, width=854, height=480):
    active_idx = step.get('activeIdx', -1)
    syllables = step.get('syllables', [])
    
    # Syllable chips
    chips_svg = []
    total_sylls = len(syllables)
    chip_w = min(110, int(520 / max(total_sylls, 1)))
    start_x = width / 2 + (total_sylls * chip_w) / 2 - chip_w / 2
    
    for i, s in enumerate(syllables):
        cx = start_x - (i * (chip_w + 8))
        cy = 400
        is_active = (i == active_idx)
        bg_col = "#0ea5e9" if is_active else "#1e293b"
        border_col = "#38bdf8" if is_active else "#334155"
        text_col = "#ffffff" if is_active else "#94a3b8"
        font_weight = "bold" if is_active else "normal"
        scale = "transform='scale(1.08)'" if is_active else ""
        
        chip = f"""
        <g {scale}>
            <rect x="{cx - chip_w/2}" y="{cy - 22}" width="{chip_w}" height="44" rx="10" fill="{bg_col}" stroke="{border_col}" stroke-width="2.5" opacity="0.95"/>
            <text x="{cx}" y="{cy + 7}" font-family="KacstTitle, KacstBook, sans-serif" font-size="22" font-weight="{font_weight}" fill="{text_col}" text-anchor="middle" direction="rtl">{s}</text>
        </g>
        """
        chips_svg.append(chip)
        
    chips_markup = "\n".join(chips_svg)
    
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}">
      <defs>
        <linearGradient id="topG" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#020617" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#020617" stop-opacity="0.0"/>
        </linearGradient>
        <linearGradient id="bottomG" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#020617" stop-opacity="0.0"/>
          <stop offset="25%" stop-color="#020617" stop-opacity="0.85"/>
          <stop offset="100%" stop-color="#020617" stop-opacity="0.98"/>
        </linearGradient>
        <linearGradient id="goldG" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0284c7"/>
          <stop offset="100%" stop-color="#06b6d4"/>
        </linearGradient>
      </defs>

      <!-- Top Gradient Header -->
      <rect x="0" y="0" width="{width}" height="100" fill="url(#topG)" />
      
      <!-- Top Badges -->
      <g>
        <rect x="{width - 240}" y="16" width="220" height="34" rx="17" fill="#0f172a" stroke="#0ea5e9" stroke-width="1.5" opacity="0.9"/>
        <circle cx="{width - 32}" cy="33" r="5" fill="#38bdf8"/>
        <text x="{width - 50}" y="39" font-family="KacstTitle, sans-serif" font-size="14" fill="#38bdf8" text-anchor="end">بروتوكول VAST للنطق</text>

        <rect x="20" y="16" width="130" height="34" rx="17" fill="#0f172a" stroke="#334155" stroke-width="1.5" opacity="0.9"/>
        <text x="85" y="39" font-family="KacstBook, sans-serif" font-size="13" fill="#94a3b8" text-anchor="middle">{item['category']}</text>
      </g>

      <!-- Bottom Gradient Overlay Box -->
      <rect x="0" y="270" width="{width}" height="210" fill="url(#bottomG)" />

      <!-- Word Main Title -->
      <text x="{width / 2}" y="345" font-family="KacstTitle, sans-serif" font-size="38" font-weight="bold" fill="#ffffff" text-anchor="middle" direction="rtl">{item['title']}</text>

      <!-- Syllables Breakdown -->
      {chips_markup}

      <!-- Articulatory Clinical Hint -->
      <text x="{width / 2}" y="455" font-family="KacstBook, sans-serif" font-size="14" fill="#38bdf8" text-anchor="middle" direction="rtl">{item['guide']}</text>
    </svg>"""
    return svg

def build_video_for_item(item):
    item_id = item['id']
    print(f"==> Generating VAST video for: {item['title']} ({item_id})")
    
    # We will generate video segment for each step then concatenate
    segment_files = []
    
    for idx, step in enumerate(item['steps']):
        mouth_type = step['mouth']
        mouth_img = MOUTH_IMAGES[mouth_type]
        duration = step['duration']
        
        overlay_svg = make_overlay_svg(item, step)
        svg_path = os.path.join(TMP_DIR, f"{item_id}_step_{idx}.svg")
        with open(svg_path, 'w', encoding='utf-8') as f:
            f.write(overlay_svg)
            
        segment_mp4 = os.path.join(TMP_DIR, f"{item_id}_seg_{idx}.mp4")
        
        # ffmpeg command to scale mouth image, overlay SVG without audio track
        cmd = [
            'ffmpeg', '-y',
            '-loop', '1', '-i', mouth_img,
            '-loop', '1', '-i', svg_path,
            '-filter_complex',
            f"[0:v]scale=854:480:force_original_aspect_ratio=increase,crop=854:480[bg];"
            f"[bg][1:v]overlay=0:0:shortest=1[v]",
            '-map', '[v]',
            '-c:v', 'libx264',
            '-preset', 'ultrafast',
            '-tune', 'stillimage',
            '-crf', '24',
            '-an',
            '-t', str(duration),
            '-pix_fmt', 'yuv420p',
            segment_mp4
        ]
        
        res = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
        if res.returncode != 0:
            print(f"Error rendering segment {idx}:", res.stderr.decode('utf-8', errors='ignore')[-300:])
            return False
            
        segment_files.append(segment_mp4)

    # Concat segments into final mp4
    concat_txt = os.path.join(TMP_DIR, f"{item_id}_concat.txt")
    with open(concat_txt, 'w') as f:
        for seg in segment_files:
            f.write(f"file '{seg}'\n")
            
    final_output = os.path.join(OUTPUT_DIR, f"{item_id}.mp4")
    concat_cmd = [
        'ffmpeg', '-y',
        '-f', 'concat', '-safe', '0', '-i', concat_txt,
        '-c', 'copy',
        final_output
    ]
    
    res = subprocess.run(concat_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    if res.returncode != 0:
        print("Error concatenating:", res.stderr.decode('utf-8', errors='ignore')[-300:])
        return False
        
    size_kb = os.path.getsize(final_output) / 1024
    print(f"✓ Video ready: {final_output} ({size_kb:.1f} KB)")
    return True

def main():
    success_count = 0
    for item in VIDEO_ITEMS:
        if build_video_for_item(item):
            success_count += 1
            
    print(f"\n==========================================")
    print(f"All done! Successfully generated {success_count}/{len(VIDEO_ITEMS)} VAST videos.")
    print(f"Location: {OUTPUT_DIR}")
    print(f"==========================================")

if __name__ == '__main__':
    main()
