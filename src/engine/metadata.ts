import exifr from 'exifr';
import { ExifData, Finding } from '../types';

/**
 * Normalizes latitude and longitude into decimal degrees, accounting for S/W hemispheres.
 */
export function normalizeCoordinates(
  lat?: number,
  lon?: number,
  latRef?: string,
  lonRef?: string
): { lat?: number; lon?: number } {
  if (lat === undefined || lon === undefined) {
    return { lat: undefined, lon: undefined };
  }

  let finalLat = lat;
  let finalLon = lon;

  if (latRef && latRef.toUpperCase().startsWith('S') && finalLat > 0) {
    finalLat = -finalLat;
  }
  if (lonRef && lonRef.toUpperCase().startsWith('W') && finalLon > 0) {
    finalLon = -finalLon;
  }

  return {
    lat: Number(finalLat.toFixed(6)),
    lon: Number(finalLon.toFixed(6)),
  };
}

/**
 * Parses raw metadata extracted from exifr into clean ExifData interface.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseRawExif(raw: Record<string, any> | null | undefined): ExifData {
  if (!raw) return {};

  const { lat, lon } = normalizeCoordinates(
    raw.latitude ?? raw.GPSLatitude,
    raw.longitude ?? raw.GPSLongitude,
    raw.GPSLatitudeRef,
    raw.GPSLongitudeRef
  );

  const rawTakenAt = raw.DateTimeOriginal ?? raw.CreateDate;
  const takenAt = rawTakenAt instanceof Date
    ? [
      `${rawTakenAt.getFullYear()}-${String(rawTakenAt.getMonth() + 1).padStart(2, '0')}-${String(rawTakenAt.getDate()).padStart(2, '0')}`,
      `${String(rawTakenAt.getHours()).padStart(2, '0')}:${String(rawTakenAt.getMinutes()).padStart(2, '0')}:${String(rawTakenAt.getSeconds()).padStart(2, '0')}`,
    ].join(' ')
    : rawTakenAt ? String(rawTakenAt).replace(/Z$/i, '').replace('T', ' ') : undefined;

  const altitude = typeof raw.GPSAltitude === 'number' ? Number(raw.GPSAltitude.toFixed(1)) : undefined;
  const direction = typeof raw.GPSImgDirection === 'number' ? Number(raw.GPSImgDirection.toFixed(1)) : undefined;

  return {
    latitude: lat,
    longitude: lon,
    altitude,
    direction,
    takenAt,
    make: raw.Make ? String(raw.Make).trim() : undefined,
    model: raw.Model ? String(raw.Model).trim() : undefined,
    software: raw.Software ? String(raw.Software).trim() : undefined,
    serialNumber: raw.SerialNumber || raw.BodySerialNumber ? String(raw.SerialNumber || raw.BodySerialNumber).trim() : undefined,
    lensModel: raw.LensModel ? String(raw.LensModel).trim() : undefined,
    artist: raw.Artist ? String(raw.Artist).trim() : undefined,
    copyright: raw.Copyright ? String(raw.Copyright).trim() : undefined,
  };
}

/**
 * Pure function mapping ExifData into an array of OPSEC Findings.
 * Independent of file reading for deterministic unit testing.
 */
export function mapExifToFindings(exif: ExifData): Finding[] {
  const findings: Finding[] = [];

  // 1. GPS Coordinates (Critical)
  if (exif.latitude !== undefined && exif.longitude !== undefined) {
    findings.push({
      id: 'finding-meta-gps',
      ruleId: 'meta-gps',
      category: 'lokasi',
      severity: 'critical',
      source: 'metadata',
      evidence: `Koordinat: ${exif.latitude.toFixed(6)}, ${exif.longitude.toFixed(6)}`,
      reason: 'Foto memuat koordinat satelit GPS yang dapat mengungkap lokasi pangkalan, pos jaga, atau rumah dinas secara presisi.',
      recommendation: 'Hapus koordinat GPS dari metadata foto sebelum mengunggah, atau gunakan fitur "Versi Aman".',
    });
  }

  // 2. Altitude or Camera Direction (Medium)
  if (exif.altitude !== undefined || exif.direction !== undefined) {
    const details = [
      exif.altitude !== undefined ? `Ketinggian: ${exif.altitude} m` : null,
      exif.direction !== undefined ? `Arah bidik: ${exif.direction}°` : null,
    ].filter(Boolean).join(' • ');

    findings.push({
      id: 'finding-meta-gps-extra',
      ruleId: 'meta-gps-extra',
      category: 'lokasi',
      severity: 'medium',
      source: 'metadata',
      evidence: details,
      reason: 'Data ketinggian dan arah bidik kamera memudahkan triangulasi visual dan pemetaan kontur taktis sekitar pos.',
      recommendation: 'Bersihkan data orientasi dan navigasi tambahan dari metadata berkas.',
    });
  }

  // 3. Taken At Timestamp (Medium)
  if (exif.takenAt) {
    findings.push({
      id: 'finding-meta-taken-at',
      ruleId: 'meta-taken-at',
      category: 'operasional',
      severity: 'medium',
      source: 'metadata',
      evidence: `Waktu pengambilan: ${exif.takenAt}`,
      reason: 'Waktu pengambilan foto dapat membocorkan linimasa jadwal apel, waktu pergantian pos jaga, atau pola pergerakan pasukan.',
      recommendation: 'Hapus tanggal dan jam pembuatan asli sebelum membagikan foto.',
    });
  }

  // 4. Device Make & Model (Low)
  if (exif.make || exif.model) {
    const deviceName = [exif.make, exif.model].filter(Boolean).join(' ');
    findings.push({
      id: 'finding-meta-device',
      ruleId: 'meta-device',
      category: 'teknis',
      severity: 'low',
      source: 'metadata',
      evidence: `Perangkat: ${deviceName}`,
      reason: 'Identitas perangkat kamera/HP memudahkan profiling perangkat keras dan potensi eksploitasi celah keamanan spesifik.',
      recommendation: 'Bersihkan informasi pabrikan dan model kamera dari berkas.',
    });
  }

  // 5. Serial Number (Medium)
  if (exif.serialNumber) {
    findings.push({
      id: 'finding-meta-serial',
      ruleId: 'meta-serial',
      category: 'teknis',
      severity: 'medium',
      source: 'metadata',
      evidence: `Nomor seri: ${exif.serialNumber}`,
      reason: 'Nomor seri perangkat bersifat unik dan dapat digunakan untuk menghubungkan berbagai foto ke satu personel atau inventaris dinas.',
      recommendation: 'Hapus nomor seri kamera/lensa dari metadata berkas.',
    });
  }

  // 6. Artist / Copyright (Medium)
  if (exif.artist || exif.copyright) {
    const creator = [exif.artist, exif.copyright].filter(Boolean).join(' / ');
    findings.push({
      id: 'finding-meta-artist',
      ruleId: 'meta-artist',
      category: 'identitas',
      severity: 'medium',
      source: 'metadata',
      evidence: `Pembuat/Hak Cipta: ${creator}`,
      reason: 'Nama pemilik perangkat atau hak cipta foto dapat membocorkan identitas personel pengambil foto.',
      recommendation: 'Hapus data kepemilikan dan nama fotografer dari metadata.',
    });
  }

  // 7. Software (Info)
  if (exif.software) {
    findings.push({
      id: 'finding-meta-software',
      ruleId: 'meta-software',
      category: 'teknis',
      severity: 'info',
      source: 'metadata',
      evidence: `Perangkat lunak pengolah: ${exif.software}`,
      reason: 'Informasi software penyunting atau versi OS yang digunakan pada perangkat.',
      recommendation: 'Informasi software tidak membocorkan lokasi, tetapi disarankan tetap dibersihkan.',
    });
  }

  return findings;
}

/**
 * Reads metadata from a browser File or Blob using exifr.
 */
export async function readMetadataFromFile(file: File | Blob): Promise<{ exif: ExifData; findings: Finding[] }> {
  try {
    const raw = await exifr.parse(file, {
      tiff: true,
      xmp: true,
      icc: false,
      iptc: true,
      jfif: true,
      gps: true,
    });

    const exif = parseRawExif(raw);
    const findings = mapExifToFindings(exif);

    return { exif, findings };
  } catch {
    // If file has no EXIF or unreadable, return empty
    return {
      exif: {},
      findings: [],
    };
  }
}

