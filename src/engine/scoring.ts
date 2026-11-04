import { Finding, RiskLevel, Profile, Score, Severity, Category } from '../types';
import { isPublicContextFinding } from './rules';

export const BASE_PROBABILITY: Record<Severity, number> = {
  critical: 0.60,
  high: 0.40,
  medium: 0.20,
  low: 0.08,
  info: 0,
};

export const PROFILE_MULTIPLIERS: Record<Profile, Record<Category, number>> = {
  prajurit: {
    lokasi: 1.0,
    identitas: 1.2,
    operasional: 1.2,
    teknis: 1.0,
  },
  keluarga: {
    lokasi: 1.1,
    identitas: 1.0,
    operasional: 1.3,
    teknis: 1.0,
  },
  satuan: {
    lokasi: 1.3,
    identitas: 1.0,
    operasional: 1.2,
    teknis: 1.0,
  },
};

export function getRiskLevel(scoreValue: number): RiskLevel {
  if (scoreValue >= 75) return 'Kritis';
  if (scoreValue >= 50) return 'Tinggi';
  if (scoreValue >= 25) return 'Waspada';
  return 'Aman';
}

/**
 * Calculates OPSEC risk score using deterministic Noisy-OR formula.
 * Formula: score = round(100 * (1 - Prod(1 - min(1, p_i * m_i))))
 * Clamped between 0 and 100.
 */
export function calculateScore(findings: Finding[], profile: Profile = 'prajurit'): Score {
  if (!findings || findings.length === 0) {
    return {
      value: 0,
      level: 'Aman',
      findings: [],
    };
  }

  let productNoisyOr = 1.0;
  const multipliers = PROFILE_MULTIPLIERS[profile];
  let strongestPublicContextProbability = 0;

  for (const finding of findings) {
    const baseP = BASE_PROBABILITY[finding.severity] ?? 0;
    const categoryMult = multipliers[finding.category] ?? 1.0;
    const effectiveProbability = Math.min(1.0, Math.max(0, baseP * categoryMult));

    if (isPublicContextFinding(finding)) {
      // Multiple words from the same publication context are correlated signals;
      // count the strongest one once so repeated wording does not inflate risk.
      strongestPublicContextProbability = Math.max(strongestPublicContextProbability, effectiveProbability);
    } else {
      productNoisyOr *= (1.0 - effectiveProbability);
    }
  }

  productNoisyOr *= 1.0 - strongestPublicContextProbability;

  const rawScore = 100 * (1.0 - productNoisyOr);
  const clampedScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  return {
    value: clampedScore,
    level: getRiskLevel(clampedScore),
    findings,
  };
}

