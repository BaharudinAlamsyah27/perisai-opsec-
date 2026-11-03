import { describe, it, expect } from 'vitest';
import {
  mapExifToFindings,
  normalizeCoordinates,
  parseRawExif,
} from '../../src/engine/metadata';
import { ExifData } from '../../src/types';

describe('Metadata Engine', () => {
  describe('normalizeCoordinates', () => {
    it('returns undefined when either latitude or longitude is missing', () => {
      expect(normalizeCoordinates(undefined, 110.123)).toEqual({ lat: undefined, lon: undefined });
      expect(normalizeCoordinates(-7.123, undefined)).toEqual({ lat: undefined, lon: undefined });
    });

    it('correctly converts South and West coordinates to negative values', () => {
      const result = normalizeCoordinates(7.5561234, 110.8316456, 'S', 'W');
      expect(result.lat).toBe(-7.556123);
      expect(result.lon).toBe(-110.831646);
    });

    it('keeps already negative coordinates negative and formats to 6 decimals', () => {
      const result = normalizeCoordinates(-6.2087654, 106.8455987, 'S', 'E');
      expect(result.lat).toBe(-6.208765);
      expect(result.lon).toBe(106.845599);
    });
  });

  describe('parseRawExif', () => {
    it('returns empty object when raw exif is null or undefined', () => {
      expect(parseRawExif(null)).toEqual({});
      expect(parseRawExif(undefined)).toEqual({});
    });

    it('parses raw exifr dictionary into structured ExifData', () => {
      const raw = {
        latitude: -7.5561,
        longitude: 110.8316,
        GPSAltitude: 125.45,
        GPSImgDirection: 180.2,
        DateTimeOriginal: new Date(2026, 10, 3, 5, 12, 0),
        Make: 'Samsung',
        Model: 'Galaxy S23',
        SerialNumber: 'SN-FIKTIF-001',
        Software: 'OneUI 6.0',
        Artist: 'Kopda Fiktif',
      };

      const parsed = parseRawExif(raw);
      expect(parsed.latitude).toBe(-7.5561);
      expect(parsed.longitude).toBe(110.8316);
      expect(parsed.altitude).toBe(125.5);
      expect(parsed.direction).toBe(180.2);
      expect(parsed.takenAt).toBe('2026-11-03 05:12:00');
      expect(parsed.make).toBe('Samsung');
      expect(parsed.model).toBe('Galaxy S23');
      expect(parsed.serialNumber).toBe('SN-FIKTIF-001');
      expect(parsed.software).toBe('OneUI 6.0');
      expect(parsed.artist).toBe('Kopda Fiktif');
    });

    it('formats EXIF timestamps without claiming a timezone', () => {
      const parsed = parseRawExif({ DateTimeOriginal: '2026-11-03T05:12:00Z' });
      expect(parsed.takenAt).toBe('2026-11-03 05:12:00');
      expect(parsed.takenAt).not.toContain('Z');
    });
  });

  describe('mapExifToFindings (Mock EXIF objects)', () => {
    it('returns empty findings for clean EXIF data', () => {
      const cleanExif: ExifData = {};
      const findings = mapExifToFindings(cleanExif);
      expect(findings).toEqual([]);
    });

    it('detects GPS coordinates as critical location finding', () => {
      const exifWithGPS: ExifData = {
        latitude: -7.5561,
        longitude: 110.8316,
      };

      const findings = mapExifToFindings(exifWithGPS);
      expect(findings).toHaveLength(1);
      expect(findings[0].ruleId).toBe('meta-gps');
      expect(findings[0].category).toBe('lokasi');
      expect(findings[0].severity).toBe('critical');
      expect(findings[0].evidence).toContain('-7.556100');
      expect(findings[0].reason).toContain('pos jaga');
    });

    it('detects altitude and camera direction as medium location finding', () => {
      const exifExtra: ExifData = {
        altitude: 450.5,
        direction: 95.0,
      };

      const findings = mapExifToFindings(exifExtra);
      expect(findings).toHaveLength(1);
      expect(findings[0].ruleId).toBe('meta-gps-extra');
      expect(findings[0].category).toBe('lokasi');
      expect(findings[0].severity).toBe('medium');
      expect(findings[0].evidence).toContain('450.5 m');
      expect(findings[0].evidence).toContain('95°');
    });

    it('detects takenAt as medium operational finding', () => {
      const exifTime: ExifData = {
        takenAt: '2026-11-03 05:12:00',
      };

      const findings = mapExifToFindings(exifTime);
      expect(findings).toHaveLength(1);
      expect(findings[0].ruleId).toBe('meta-taken-at');
      expect(findings[0].category).toBe('operasional');
      expect(findings[0].severity).toBe('medium');
    });

    it('detects make, model, serialNumber, artist, and software', () => {
      const fullExif: ExifData = {
        latitude: -6.2,
        longitude: 106.8,
        make: 'Canon',
        model: 'EOS 5D',
        serialNumber: 'CANON-12345',
        artist: 'Pratu Sutrisno',
        software: 'Lightroom v12',
      };

      const findings = mapExifToFindings(fullExif);
      const ruleIds = findings.map((f) => f.ruleId);

      expect(ruleIds).toContain('meta-gps');
      expect(ruleIds).toContain('meta-device');
      expect(ruleIds).toContain('meta-serial');
      expect(ruleIds).toContain('meta-artist');
      expect(ruleIds).toContain('meta-software');

      const serialFinding = findings.find((f) => f.ruleId === 'meta-serial');
      expect(serialFinding?.severity).toBe('medium');
      expect(serialFinding?.category).toBe('teknis');

      const artistFinding = findings.find((f) => f.ruleId === 'meta-artist');
      expect(artistFinding?.severity).toBe('medium');
      expect(artistFinding?.category).toBe('identitas');
    });
  });
});

