import templates from '../data/brief-templates.json';
import type { Finding, RiskLevel, Score } from '../types';

export type BriefGroup = 'SIAPA' | 'DI MANA' | 'KAPAN' | 'APA' | 'POLA';
export type BriefCertainty = 'Tinggi' | 'Sedang' | 'Rendah';

export interface BriefStatement {
  text: string;
  findingIds: string[];
  certainty?: BriefCertainty;
}

export interface BriefConclusionGroup {
  group: BriefGroup;
  statements: BriefStatement[];
}

export interface IntelBrief {
  score: number;
  level: RiskLevel;
  summary: BriefStatement | null;
  emptyStatus: string | null;
  conclusions: BriefConclusionGroup[];
  impacts: BriefStatement[];
  mitigations: Array<BriefStatement & { severity: Finding['severity'] }>;
  decision: string;
  note: string;
}

const OCR_HIGH_CONFIDENCE = 85;
const SEVERITY_ORDER: Record<Finding['severity'], number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};

type ConclusionTemplate = { group: BriefGroup; template: string };
const conclusionTemplates = templates.conclusions as Record<string, ConclusionTemplate>;
const impactTemplates = templates.impacts as Record<string, string>;

function plainEvidence(finding: Finding): string {
  return finding.evidence
    .replace(/\s*\(keyakinan \d+%\)$/i, '')
    .replace(/^(?:Koordinat|Waktu pengambilan|Perangkat|Nomor seri|Pembuat\/Hak Cipta|Perangkat lunak pengolah):\s*/i, '')
    .trim();
}

function certaintyFor(finding: Finding): BriefCertainty {
  if (finding.source === 'metadata' || finding.source === 'caption') return 'Tinggi';
  if (finding.source === 'combo') return 'Rendah';
  const confidence = finding.evidence.match(/keyakinan (\d+)%/i);
  const value = confidence ? Number(confidence[1]) : 0;
  if (value >= OCR_HIGH_CONFIDENCE) return 'Tinggi';
  if (value >= 70) return 'Sedang';
  return 'Rendah';
}

function weekdayForEvidence(evidence: string): string {
  const match = evidence.match(/(\d{4})[-:](\d{2})[-:](\d{2})/);
  if (!match) return 'hari tidak diketahui';
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (date.getUTCFullYear() !== Number(year) || date.getUTCMonth() !== Number(month) - 1 || date.getUTCDate() !== Number(day)) {
    return 'hari tidak diketahui';
  }
  return ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][date.getUTCDay()];
}

function fillTemplate(template: string, finding: Finding): string {
  return template
    .split('{{evidence}}').join(plainEvidence(finding))
    .split('{{weekday}}').join(weekdayForEvidence(finding.evidence));
}

function statement(text: string, findingIds: string[], certainty?: BriefCertainty): BriefStatement {
  return { text, findingIds: [...new Set(findingIds)], ...(certainty ? { certainty } : {}) };
}

export function createIntelBrief(score: Score): IntelBrief {
  const findings = score.findings;
  const summary = findings.length
    ? statement(templates.summary.replace('{{level}}', score.level).replace('{{score}}', String(score.value)), findings.map(({ id }) => id))
    : null;

  const conclusions = (templates.groups as BriefGroup[]).map((group) => ({
    group,
    statements: findings.flatMap((finding) => {
      const template = conclusionTemplates[finding.ruleId];
      return template?.group === group
        ? [statement(fillTemplate(template.template, finding), [finding.id], certaintyFor(finding))]
        : [];
    }),
  })).filter(({ statements: items }) => items.length > 0);

  const categoryRank = new Map<string, number>();
  for (const finding of findings) {
    const current = categoryRank.get(finding.category) ?? Number.POSITIVE_INFINITY;
    categoryRank.set(finding.category, Math.min(current, SEVERITY_ORDER[finding.severity]));
  }
  const impacts = [...categoryRank.entries()]
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3)
    .flatMap(([category]) => impactTemplates[category]
      ? [statement(impactTemplates[category], findings.filter((finding) => finding.category === category).map(({ id }) => id), 'Rendah')]
      : []);

  const uniqueMitigations = new Map<string, { recommendation: string; findingIds: string[]; severity: Finding['severity'] }>();
  for (const finding of [...findings].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])) {
    const recommendation = finding.recommendation.trim();
    if (!recommendation) continue;
    const existing = uniqueMitigations.get(recommendation);
    if (existing) existing.findingIds.push(finding.id);
    else uniqueMitigations.set(recommendation, { recommendation, findingIds: [finding.id], severity: finding.severity });
  }

  return {
    score: score.value,
    level: score.level,
    summary,
    emptyStatus: findings.length ? null : templates.emptyStatus,
    conclusions,
    impacts,
    mitigations: [...uniqueMitigations.values()].map(({ recommendation, findingIds, severity }) => ({
      ...statement(recommendation, findingIds), severity,
    })),
    decision: templates.decisions[score.level],
    note: templates.note,
  };
}
