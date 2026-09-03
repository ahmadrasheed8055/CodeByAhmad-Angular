/**
 * High-performance, ultra-compact vector avatars for FitJoin Trainers & Coaches.
 * Each avatar is uniquely designed (< 1.5 KB) with domain-specific gradients,
 * distinct character illustrations, hair styles, skin tones, and accessory details.
 */

export const TRAINER_AVATARS: Record<string, string> = {
  // 1. Marcus Vance — Weight Loss & Fat Loss (Athletic Male, Emerald-Charcoal gradient)
  'Marcus Vance': `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="bg_mv" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#87BF17"/>
      <stop offset="100%" stop-color="#1B3B0A"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="50" fill="url(#bg_mv)"/>
  <circle cx="50" cy="42" r="18" fill="#D4A373"/>
  <path d="M32 38 C32 26, 68 26, 68 38 C68 32, 62 25, 50 25 C38 25, 32 32, 32 38 Z" fill="#2B1D0C"/>
  <path d="M42 43 Q46 47 50 47 Q54 47 58 43" stroke="#2B1D0C" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <circle cx="43" cy="39" r="2" fill="#2B1D0C"/>
  <circle cx="57" cy="39" r="2" fill="#2B1D0C"/>
  <path d="M22 88 C22 66, 78 66, 78 88 Z" fill="#111827"/>
  <path d="M38 70 L50 82 L62 70" stroke="#87BF17" stroke-width="3" fill="none"/>
</svg>`)}`,

  // 2. Elena Rostova — Fitness & Bodybuilding (Athletic Female, Ocean Cyan gradient)
  'Elena Rostova': `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="bg_er" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06B6D4"/>
      <stop offset="100%" stop-color="#0E3A52"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="50" fill="url(#bg_er)"/>
  <path d="M28 42 C28 22, 72 22, 72 42 C72 58, 68 66, 68 66 C68 66, 60 50, 60 42 C60 28, 40 28, 40 42 C40 50, 32 66, 32 66 C32 66, 28 58, 28 42 Z" fill="#78350F"/>
  <circle cx="50" cy="44" r="17" fill="#FCD34D"/>
  <path d="M34 38 Q50 30 66 38" fill="#78350F"/>
  <circle cx="43" cy="42" r="2" fill="#3E2723"/>
  <circle cx="57" cy="42" r="2" fill="#3E2723"/>
  <path d="M44 49 Q50 54 56 49" stroke="#E11D48" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M24 88 C24 68, 76 68, 76 88 Z" fill="#0284C7"/>
  <circle cx="50" cy="22" r="7" fill="#78350F"/>
</svg>`)}`,

  // 3. Tariq Mahmood — Sports Conditioning (Dynamic Male, Amber-Orange gradient)
  'Tariq Mahmood': `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="bg_tm" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#7C2D12"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="50" fill="url(#bg_tm)"/>
  <circle cx="50" cy="42" r="18" fill="#C68642"/>
  <path d="M32 36 C32 24, 68 24, 68 36 C68 28, 60 22, 50 22 C40 22, 32 28, 32 36 Z" fill="#18181B"/>
  <path d="M35 48 C35 58, 65 58, 65 48 Z" fill="#18181B"/>
  <circle cx="43" cy="38" r="2" fill="#18181B"/>
  <circle cx="57" cy="38" r="2" fill="#18181B"/>
  <path d="M44 45 Q50 49 56 45" stroke="#FFFFFF" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <path d="M20 88 C20 64, 80 64, 80 88 Z" fill="#1E293B"/>
  <rect x="42" y="68" width="16" height="20" fill="#F59E0B" rx="3"/>
</svg>`)}`,

  // 4. Dr. Maya Patel — Clinical Nutrition & Diet (Female Specialist with Glasses, Indigo-Purple gradient)
  'Dr. Maya Patel': `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="bg_mp" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366F1"/>
      <stop offset="100%" stop-color="#312E81"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="50" fill="url(#bg_mp)"/>
  <path d="M30 40 C30 20, 70 20, 70 40 C70 65, 66 68, 66 68 C66 68, 60 48, 60 40 C60 28, 40 28, 40 40 C40 48, 34 68, 34 68 C34 68, 30 65, 30 40 Z" fill="#1E1B4B"/>
  <circle cx="50" cy="43" r="17" fill="#E0A96D"/>
  <rect x="36" y="38" width="11" height="8" rx="2" fill="none" stroke="#FFFFFF" stroke-width="2"/>
  <rect x="53" y="38" width="11" height="8" rx="2" fill="none" stroke="#FFFFFF" stroke-width="2"/>
  <line x1="47" y1="42" x2="53" y2="42" stroke="#FFFFFF" stroke-width="2"/>
  <circle cx="41.5" cy="42" r="1.5" fill="#1E1B4B"/>
  <circle cx="58.5" cy="42" r="1.5" fill="#1E1B4B"/>
  <path d="M44 50 Q50 54 56 50" stroke="#BE185D" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <path d="M22 88 C22 66, 78 66, 78 88 Z" fill="#FFFFFF"/>
  <path d="M42 66 L50 78 L58 66" fill="#6366F1"/>
</svg>`)}`,

  // 5. David Kim — Powerlifting & Strength (Muscular Male, Crimson-Ruby gradient)
  'David Kim': `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="bg_dk" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EF4444"/>
      <stop offset="100%" stop-color="#450A0A"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="50" fill="url(#bg_dk)"/>
  <circle cx="50" cy="43" r="19" fill="#E8B482"/>
  <path d="M31 34 C31 22, 69 22, 69 34 C69 26, 62 20, 50 20 C38 20, 31 26, 31 34 Z" fill="#09090B"/>
  <circle cx="42" cy="40" r="2" fill="#09090B"/>
  <circle cx="58" cy="40" r="2" fill="#09090B"/>
  <path d="M44 48 Q50 51 56 48" stroke="#09090B" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M18 88 C18 62, 82 62, 82 88 Z" fill="#18181B"/>
  <circle cx="50" cy="74" r="5" fill="#EF4444"/>
</svg>`)}`,

  // 6. Sarah Jenkins — Mobility & Injury Recovery (Female Coach with Ponytail, Teal-Green gradient)
  'Sarah Jenkins': `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="bg_sj" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#14B8A6"/>
      <stop offset="100%" stop-color="#134E4A"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="50" fill="url(#bg_sj)"/>
  <circle cx="70" cy="30" r="9" fill="#9A3412"/>
  <circle cx="50" cy="43" r="17" fill="#FED7AA"/>
  <path d="M33 36 C33 24, 67 24, 67 36 C67 28, 58 22, 50 22 C42 22, 33 28, 33 36 Z" fill="#9A3412"/>
  <circle cx="43" cy="41" r="2" fill="#431407"/>
  <circle cx="57" cy="41" r="2" fill="#431407"/>
  <path d="M44 49 Q50 54 56 49" stroke="#E11D48" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path d="M22 88 C22 66, 78 66, 78 88 Z" fill="#0F766E"/>
  <path d="M42 66 L50 76 L58 66" fill="#CCFBF1"/>
</svg>`)}`,

  // 7. Liam Chen — Calisthenics & Bodyweight (Athletic Male with Modern Cut, Violet-Plum gradient)
  'Liam Chen': `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="bg_lc" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8B5CF6"/>
      <stop offset="100%" stop-color="#3B0764"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="50" fill="url(#bg_lc)"/>
  <circle cx="50" cy="42" r="17" fill="#FCD34D"/>
  <path d="M31 36 C31 22, 69 22, 69 36 C69 26, 60 18, 48 18 C38 18, 31 26, 31 36 Z" fill="#18181B"/>
  <circle cx="43" cy="40" r="2" fill="#18181B"/>
  <circle cx="57" cy="40" r="2" fill="#18181B"/>
  <path d="M45 47 Q50 51 55 47" stroke="#18181B" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path d="M22 88 C22 64, 78 64, 78 88 Z" fill="#2E1065"/>
  <line x1="32" y1="64" x2="68" y2="64" stroke="#8B5CF6" stroke-width="3"/>
</svg>`)}`,

  // 8. Jessica Chen — Yoga & Mindfulness (Serene Female Yogi with Bun, Rose-Purple gradient)
  'Jessica Chen': `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="bg_jc" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EC4899"/>
      <stop offset="100%" stop-color="#581C87"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="50" fill="url(#bg_jc)"/>
  <circle cx="50" cy="20" r="8" fill="#18181B"/>
  <circle cx="50" cy="43" r="17" fill="#FDE68A"/>
  <path d="M33 36 C33 24, 67 24, 67 36 C67 28, 58 24, 50 24 C42 24, 33 28, 33 36 Z" fill="#18181B"/>
  <circle cx="43" cy="41" r="2" fill="#18181B"/>
  <circle cx="57" cy="41" r="2" fill="#18181B"/>
  <path d="M44 49 Q50 54 56 49" stroke="#BE185D" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path d="M22 88 C22 66, 78 66, 78 88 Z" fill="#831843"/>
  <circle cx="50" cy="68" r="4" fill="#F472B6"/>
</svg>`)}`,

  // 9. Alex Rivera — Cardio & Endurance (Male Runner with Headband, Coral-Crimson gradient)
  'Alex Rivera': `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="bg_ar" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F43F5E"/>
      <stop offset="100%" stop-color="#881337"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="50" fill="url(#bg_ar)"/>
  <circle cx="50" cy="43" r="18" fill="#D97706"/>
  <path d="M32 34 C32 22, 68 22, 68 34 C68 26, 60 20, 50 20 C40 20, 32 26, 32 34 Z" fill="#451A03"/>
  <rect x="32" y="32" width="36" height="5" rx="2.5" fill="#FFFFFF"/>
  <circle cx="43" cy="41" r="2" fill="#451A03"/>
  <circle cx="57" cy="41" r="2" fill="#451A03"/>
  <path d="M45 48 Q50 52 55 48" stroke="#FFFFFF" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <path d="M20 88 C20 64, 80 64, 80 88 Z" fill="#BE123C"/>
  <line x1="50" y1="64" x2="50" y2="88" stroke="#FFFFFF" stroke-width="2"/>
</svg>`)}`,

  // 10. Amara Okafor — General Health & Longevity (Female Vitality Coach, Forest-Emerald gradient)
  'Amara Okafor': `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="bg_ao" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981"/>
      <stop offset="100%" stop-color="#064E3B"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="50" fill="url(#bg_ao)"/>
  <circle cx="50" cy="22" r="12" fill="#1C1917"/>
  <circle cx="50" cy="44" r="18" fill="#78350F"/>
  <circle cx="43" cy="41" r="2" fill="#1C1917"/>
  <circle cx="57" cy="41" r="2" fill="#1C1917"/>
  <path d="M44 50 Q50 56 56 50" stroke="#FDE047" stroke-width="2" fill="none" stroke-linecap="round"/>
  <circle cx="31" cy="46" r="4" fill="#FDE047"/>
  <circle cx="69" cy="46" r="4" fill="#FDE047"/>
  <path d="M22 88 C22 66, 78 66, 78 88 Z" fill="#047857"/>
  <circle cx="50" cy="72" r="5" fill="#FDE047"/>
</svg>`)}`
};

/**
 * Returns a high-speed, distinct vector avatar for a trainer.
 * Falls back to a deterministic themed SVG avatar based on name if not in the 10 preset list.
 */
export function getTrainerAvatar(username?: string, fallbackId?: number): string {
  if (!username) return 'img/avatar/default.png';
  
  if (TRAINER_AVATARS[username]) {
    return TRAINER_AVATARS[username];
  }

  // Case-insensitive check
  const match = Object.keys(TRAINER_AVATARS).find(k => k.toLowerCase() === username.toLowerCase());
  if (match && TRAINER_AVATARS[match]) {
    return TRAINER_AVATARS[match];
  }

  // Deterministic SVG generator for any other trainer
  const colors = ['#87BF17', '#06B6D4', '#F59E0B', '#6366F1', '#EF4444', '#14B8A6', '#8B5CF6', '#EC4899', '#F43F5E', '#10B981'];
  const colorIndex = (fallbackId || username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colors.length;
  const primaryColor = colors[colorIndex];
  const initials = username.split(' ').filter(Boolean).slice(0, 2).map(s => s[0].toUpperCase()).join('') || 'TR';

  return `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="bg_dyn" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primaryColor}"/>
      <stop offset="100%" stop-color="#111827"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="50" fill="url(#bg_dyn)"/>
  <circle cx="50" cy="40" r="18" fill="#FFFFFF" opacity="0.9"/>
  <path d="M22 88 C22 66, 78 66, 78 88 Z" fill="#FFFFFF" opacity="0.9"/>
  <text x="50" y="47" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#111827" text-anchor="middle">${initials}</text>
</svg>`)}`;
}
