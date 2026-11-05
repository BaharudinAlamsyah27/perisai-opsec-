export type Severity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export type Category = 'lokasi' | 'identitas' | 'operasional' | 'teknis';

export type Source = 'metadata' | 'ocr' | 'caption' | 'correction' | 'combo';

export interface BoundingBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface Finding {
  id: string;
  ruleId: string;
  category: Category;
  severity: Severity;
  source: Source;
  evidence: string;
  reason: string;
  recommendation: string;
  bbox?: BoundingBox;
  range?: { start: number; end: number };
  ignoredReason?: string;
}

export type RiskLevel = 'Aman' | 'Waspada' | 'Tinggi' | 'Kritis';

export interface Score {
  value: number;
  level: RiskLevel;
  findings: Finding[];
}

export type Profile = 'prajurit' | 'keluarga' | 'satuan';

export interface ExifData {
  latitude?: number;
  longitude?: number;
  altitude?: number;
  direction?: number;
  takenAt?: string;
  make?: string;
  model?: string;
  software?: string;
  serialNumber?: string;
  lensModel?: string;
  artist?: string;
  copyright?: string;
}

export interface OcrWord {
  text: string;
  conf: number;
  bbox: BoundingBox;
}

export interface AnalysisLog {
  timestamp: string;
  source: 'SYSTEM' | 'EXIF' | 'OCR' | 'RULES' | 'COMBO';
  message: string;
  level: 'info' | 'warn' | 'crit';
}

export interface AnalysisFile {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  size: number;
  type: string;
  exif?: ExifData;
  ocrWords?: OcrWord[];
  ocrStatus?: 'recognized' | 'empty' | 'error' | 'skipped';
  ocrDurationMs?: number;
  ocrProgress?: number;
  logs?: AnalysisLog[];
  score?: Score;
  ignoredFindings?: Finding[];
  correctedOcrText?: string;
  status: 'idle' | 'analyzing' | 'done' | 'error';
  errorMessage?: string;
}

