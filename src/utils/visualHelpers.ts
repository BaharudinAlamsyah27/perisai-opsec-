import type { Category, Finding } from '../types';

export function getScoreTheme(score: number): {
  strokeColor: string;
  glowColor: string;
  textColor: string;
  levelBg: string;
} {
  if (score >= 75) {
    return {
      strokeColor: '#ef4444', // Red-500
      glowColor: 'rgba(239, 68, 68, 0.4)',
      textColor: 'text-rose-400',
      levelBg: 'bg-rose-950/60 border-rose-500/50 text-rose-300',
    };
  }
  if (score >= 50) {
    return {
      strokeColor: '#f97316', // Orange-500
      glowColor: 'rgba(249, 115, 22, 0.4)',
      textColor: 'text-orange-400',
      levelBg: 'bg-orange-950/60 border-orange-500/50 text-orange-300',
    };
  }
  if (score >= 25) {
    return {
      strokeColor: '#eab308', // Yellow-500
      glowColor: 'rgba(234, 179, 8, 0.4)',
      textColor: 'text-amber-400',
      levelBg: 'bg-amber-950/60 border-amber-500/50 text-amber-300',
    };
  }
  return {
    strokeColor: '#10b981', // Emerald-500
    glowColor: 'rgba(16, 185, 129, 0.4)',
    textColor: 'text-emerald-400',
    levelBg: 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300',
  };
}

export function calculateCategoryScores(findings: Finding[]): Record<Category, number> {
  const counts: Record<Category, number> = {
    lokasi: 0,
    identitas: 0,
    operasional: 0,
    teknis: 0,
  };

  const severityWeights: Record<string, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
    info: 0.5,
  };

  for (const f of findings) {
    const weight = severityWeights[f.severity] || 1;
    if (counts[f.category] !== undefined) {
      counts[f.category] += weight;
    }
  }

  // Normalize each axis to max 12 for radar polygon
  const maxCap = 12;
  return {
    lokasi: Math.min(1, counts.lokasi / maxCap),
    identitas: Math.min(1, counts.identitas / maxCap),
    operasional: Math.min(1, counts.operasional / maxCap),
    teknis: Math.min(1, counts.teknis / maxCap),
  };
}
