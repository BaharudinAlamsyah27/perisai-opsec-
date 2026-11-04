import type { Finding } from '../types';
import comboGroupsData from '../data/combo-groups.json';

const comboGroups: Record<string, string> = comboGroupsData;

/**
 * Checks co-occurrence of operational elements (e.g. {satuan, lokasi, waktu/jadwal, pergerakan}).
 * If >= 3 distinct operational groups appear across findings, synthesizes a critical finding:
 * "Pola Penugasan Terbaca" with critical severity.
 */
export function applyComboBoost(findings: Finding[]): Finding[] {
  if (!findings || findings.length === 0) return [];

  // Define the critical operational combo groups from PRD §7
  const TARGET_OPERATIONAL_GROUPS = new Set(['satuan', 'lokasi', 'jadwal', 'pergerakan']);

  // Collect distinct operational groups present in the input findings
  const detectedGroups = new Set<string>();

  for (const f of findings) {
    const dikGroup = f.ruleId.startsWith('dik-satuan-') ? 'satuan'
      : f.ruleId.startsWith('dik-lokasi-') ? 'lokasi'
        : f.ruleId.startsWith('dik-kegiatan-') ? 'pergerakan' : undefined;
    const group = dikGroup ?? comboGroups[f.ruleId];
    if (group && TARGET_OPERATIONAL_GROUPS.has(group)) {
      detectedGroups.add(group);
    }
  }

  // If >= 3 distinct operational groups are found, add synthetic combo finding
  if (detectedGroups.size >= 3) {
    const groupList = Array.from(detectedGroups).join(', ');
    const syntheticFinding: Finding = {
      id: 'combo-pola-penugasan',
      ruleId: 'combo-pola-penugasan',
      category: 'operasional',
      severity: 'critical',
      source: 'combo',
      evidence: `Kombinasi elemen: ${groupList}`,
      reason:
        'Pola Penugasan Terbaca: Muncul kombinasi kritis dari unsur satuan, lokasi, waktu/jadwal, atau pergerakan yang memungkinkan pihak luar merekonstruksi agenda operasi militer.',
      recommendation:
        'Segera pisahkan atau batalkan unggahan konten ini. Informasi gabungan ini memberikan gambaran operasi yang utuh kepada musuh/pihak luar.',
    };

    return [syntheticFinding, ...findings];
  }

  return findings;
}
