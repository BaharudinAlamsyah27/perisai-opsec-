import type { ExifData } from '../types';

export interface PatternAnalysis {
  id: string;
  exif?: Pick<ExifData, 'latitude' | 'longitude' | 'takenAt'>;
}

export interface PatternOptions {
  radiusMeters?: number;
  routineWindowMinutes?: number;
  minimumRoutinePhotos?: number;
  minimumRoutineDays?: number;
  minimumRepeatedTransitions?: number;
}

export interface PatternObservation {
  analysisId: string;
  clusterId: string;
  latitude: number;
  longitude: number;
  takenAt: string;
  timestamp: number;
  date: string;
  weekday: number;
  minuteOfDay: number;
}

export interface PatternCluster {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  photoCount: number;
  dayCount: number;
  medianMinuteOfDay: number;
  rangeStartMinute: number;
  rangeEndMinute: number;
  firstDay: string;
  lastDay: string;
  observationIds: string[];
}

export interface PatternRoutine {
  clusterId: string;
  photoCount: number;
  dayCount: number;
  medianMinuteOfDay: number;
  windowMinutes: number;
}

export interface PatternTransition {
  fromClusterId: string;
  toClusterId: string;
  count: number;
  dayCount: number;
  medianMinuteOfDay: number;
}

export interface PatternInsight {
  id: string;
  kind: 'routine' | 'transition';
  sourceClusterIds: string[];
  confidence: 'Tinggi' | 'Sedang' | 'Rendah';
  count: number;
  dayCount: number;
  medianMinuteOfDay: number;
}

export interface PatternAnalysisResult {
  radiusMeters: number;
  routineWindowMinutes: number;
  observations: PatternObservation[];
  clusters: PatternCluster[];
  routines: PatternRoutine[];
  transitions: PatternTransition[];
  insights: PatternInsight[];
  unmappableCount: number;
  readability: 'Tinggi' | 'Sedang' | 'Rendah';
}

interface ParsedObservation {
  analysisId: string;
  latitude: number;
  longitude: number;
  takenAt: string;
  timestamp: number;
  date: string;
  weekday: number;
  minuteOfDay: number;
  inputOrder: number;
}

interface WorkingCluster {
  members: ParsedObservation[];
  latitude: number;
  longitude: number;
}

const EARTH_RADIUS_METERS = 6_371_000;
const DEFAULT_RADIUS_METERS = 100;
const DEFAULT_ROUTINE_WINDOW_MINUTES = 60;
const DEFAULT_MINIMUM_ROUTINE_PHOTOS = 3;
const DEFAULT_MINIMUM_ROUTINE_DAYS = 2;
const DEFAULT_MINIMUM_REPEATED_TRANSITIONS = 2;

function isValidCoordinates(latitude: number | undefined, longitude: number | undefined): latitude is number {
  return typeof latitude === 'number' && Number.isFinite(latitude) && latitude >= -90 && latitude <= 90
    && typeof longitude === 'number' && Number.isFinite(longitude) && longitude >= -180 && longitude <= 180;
}

function parseTakenAt(value: string | undefined): Omit<ParsedObservation, 'analysisId' | 'latitude' | 'longitude' | 'inputOrder' | 'takenAt'> | null {
  if (!value) return null;
  const match = value.trim().match(/^(\d{4})[:-](\d{2})[:-](\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.\d+)?$/);
  if (!match) return null;
  const [, yearString, monthString, dayString, hourString, minuteString, secondString] = match;
  const year = Number(yearString);
  const month = Number(monthString);
  const day = Number(dayString);
  const hour = Number(hourString);
  const minute = Number(minuteString);
  const second = Number(secondString);
  const dateTime = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  if (dateTime.getUTCFullYear() !== year || dateTime.getUTCMonth() !== month - 1 || dateTime.getUTCDate() !== day
    || hour > 23 || minute > 59 || second > 59) return null;
  return {
    timestamp: dateTime.getTime(),
    date: `${yearString}-${monthString}-${dayString}`,
    weekday: dateTime.getUTCDay(),
    minuteOfDay: hour * 60 + minute,
  };
}

function radians(degrees: number): number {
  return degrees * Math.PI / 180;
}

export function haversineDistanceMeters(
  first: Pick<PatternObservation, 'latitude' | 'longitude'>,
  second: Pick<PatternObservation, 'latitude' | 'longitude'>
): number {
  const latitudeDelta = radians(second.latitude - first.latitude);
  const longitudeDelta = radians(second.longitude - first.longitude);
  const firstLatitude = radians(first.latitude);
  const secondLatitude = radians(second.latitude);
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(Math.min(1, haversine)));
}

function centroid(members: ParsedObservation[]): { latitude: number; longitude: number } {
  let x = 0;
  let y = 0;
  let z = 0;
  for (const item of members) {
    const latitude = radians(item.latitude);
    const longitude = radians(item.longitude);
    x += Math.cos(latitude) * Math.cos(longitude);
    y += Math.cos(latitude) * Math.sin(longitude);
    z += Math.sin(latitude);
  }
  const length = members.length || 1;
  x /= length;
  y /= length;
  z /= length;
  return {
    latitude: Math.atan2(z, Math.hypot(x, y)) * 180 / Math.PI,
    longitude: Math.atan2(y, x) * 180 / Math.PI,
  };
}

function circularDistanceMinutes(first: number, second: number): number {
  const difference = Math.abs(first - second) % 1440;
  return Math.min(difference, 1440 - difference);
}

function circularMedian(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  if (sorted.length === 0) return 0;
  let largestGap = -1;
  let gapIndex = 0;
  for (let index = 0; index < sorted.length; index++) {
    const next = sorted[(index + 1) % sorted.length] ?? sorted[index] ?? 0;
    const gap = ((next - (sorted[index] ?? 0)) + 1440) % 1440;
    if (gap > largestGap) {
      largestGap = gap;
      gapIndex = index;
    }
  }
  const arcStart = sorted[(gapIndex + 1) % sorted.length] ?? sorted[0] ?? 0;
  const unwrapped = values.map((value) => value < arcStart ? value + 1440 : value);
  return median(unwrapped) % 1440;
}

function circularTimeRange(values: number[]): { start: number; end: number } {
  const sorted = [...values].sort((a, b) => a - b);
  if (sorted.length < 2) return { start: sorted[0] ?? 0, end: sorted[0] ?? 0 };
  let largestGap = -1;
  let gapIndex = 0;
  for (let index = 0; index < sorted.length; index++) {
    const next = sorted[(index + 1) % sorted.length] ?? sorted[index];
    const gap = ((next - (sorted[index] ?? 0)) + 1440) % 1440;
    if (gap > largestGap) {
      largestGap = gap;
      gapIndex = index;
    }
  }
  return {
    start: sorted[(gapIndex + 1) % sorted.length] ?? sorted[0] ?? 0,
    end: sorted[gapIndex] ?? sorted[0] ?? 0,
  };
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const ordered = [...values].sort((a, b) => a - b);
  const middle = Math.floor(ordered.length / 2);
  const lower = ordered[middle - 1] ?? ordered[middle] ?? 0;
  const upper = ordered[middle] ?? lower;
  return Math.floor((lower + upper) / 2);
}

function confidenceForDayCount(dayCount: number): PatternInsight['confidence'] {
  if (dayCount >= 3) return 'Tinggi';
  if (dayCount === 2) return 'Sedang';
  return 'Rendah';
}

export function formatPatternTime(minuteOfDay: number): string {
  const normalized = ((Math.round(minuteOfDay) % 1440) + 1440) % 1440;
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  return `${String(hour).padStart(2, '0')}.${String(minute).padStart(2, '0')}`;
}

export function renderPatternInsight(
  insight: PatternInsight,
  clusters: PatternCluster[],
  labels: Record<string, string> = {}
): string {
  const labelFor = (clusterId: string) => labels[clusterId] || clusters.find((cluster) => cluster.id === clusterId)?.label || 'Lokasi';
  if (insight.kind === 'routine') {
    return `Pihak luar dapat melihat bahwa titik ${labelFor(insight.sourceClusterIds[0] ?? '')} dikunjungi berulang sekitar ${formatPatternTime(insight.medianMinuteOfDay)} selama ${insight.dayCount} hari berbeda.`;
  }
  const [fromId, toId] = insight.sourceClusterIds;
  return `Urutan kunjungan ${labelFor(fromId ?? '')} → ${labelFor(toId ?? '')} tercatat ${insight.count} kali pada ${insight.dayCount} hari berbeda; pihak luar dapat menyimpulkan adanya urutan kunjungan yang berulang.`;
}

export function analyzePatterns(analyses: PatternAnalysis[], options: PatternOptions = {}): PatternAnalysisResult {
  const radiusMeters = Number.isFinite(options.radiusMeters) && (options.radiusMeters ?? 0) > 0
    ? options.radiusMeters ?? DEFAULT_RADIUS_METERS : DEFAULT_RADIUS_METERS;
  const routineWindowMinutes = Number.isFinite(options.routineWindowMinutes) && (options.routineWindowMinutes ?? 0) >= 0
    ? options.routineWindowMinutes ?? DEFAULT_ROUTINE_WINDOW_MINUTES : DEFAULT_ROUTINE_WINDOW_MINUTES;
  const minimumRoutinePhotos = options.minimumRoutinePhotos ?? DEFAULT_MINIMUM_ROUTINE_PHOTOS;
  const minimumRoutineDays = options.minimumRoutineDays ?? DEFAULT_MINIMUM_ROUTINE_DAYS;
  const minimumRepeatedTransitions = options.minimumRepeatedTransitions ?? DEFAULT_MINIMUM_REPEATED_TRANSITIONS;

  const observations: ParsedObservation[] = [];
  let unmappableCount = 0;
  analyses.forEach((analysis, inputOrder) => {
    const latitude = analysis.exif?.latitude;
    const longitude = analysis.exif?.longitude;
    const takenAt = parseTakenAt(analysis.exif?.takenAt);
    if (!isValidCoordinates(latitude, longitude) || !takenAt) {
      unmappableCount++;
      return;
    }
    observations.push({
      analysisId: analysis.id,
      latitude: latitude as number,
      longitude: longitude as number,
      takenAt: analysis.exif?.takenAt ?? '',
      inputOrder,
      ...takenAt,
    });
  });
  observations.sort((a, b) => a.timestamp - b.timestamp || a.inputOrder - b.inputOrder || a.analysisId.localeCompare(b.analysisId));

  const workingClusters: WorkingCluster[] = [];
  for (const observation of observations) {
    let nearest: WorkingCluster | undefined;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const cluster of workingClusters) {
      const distance = haversineDistanceMeters(observation, cluster);
      if (distance <= radiusMeters && distance < nearestDistance) {
        nearest = cluster;
        nearestDistance = distance;
      }
    }
    if (nearest) {
      nearest.members.push(observation);
      Object.assign(nearest, centroid(nearest.members));
    } else {
      workingClusters.push({ members: [observation], latitude: observation.latitude, longitude: observation.longitude });
    }
  }

  const clusters: PatternCluster[] = workingClusters.map((workingCluster, index) => {
    const members = workingCluster.members;
    const dayValues = [...new Set(members.map(({ date }) => date))].sort();
    const times = members.map(({ minuteOfDay }) => minuteOfDay);
    const timeRange = circularTimeRange(times);
    return {
      id: `cluster-${index + 1}`,
      label: `Lokasi ${index + 1}`,
      latitude: workingCluster.latitude,
      longitude: workingCluster.longitude,
      photoCount: members.length,
      dayCount: dayValues.length,
      medianMinuteOfDay: circularMedian(times),
      rangeStartMinute: timeRange.start,
      rangeEndMinute: timeRange.end,
      firstDay: dayValues[0] ?? '',
      lastDay: dayValues[dayValues.length - 1] ?? '',
      observationIds: members.map(({ analysisId }) => analysisId),
    };
  });

  const observationsWithClusters: PatternObservation[] = observations.map((observation) => {
    const cluster = clusters.find((candidate) => candidate.observationIds.includes(observation.analysisId));
    return {
      analysisId: observation.analysisId,
      clusterId: cluster?.id ?? '',
      latitude: observation.latitude,
      longitude: observation.longitude,
      takenAt: observation.takenAt,
      timestamp: observation.timestamp,
      date: observation.date,
      weekday: observation.weekday,
      minuteOfDay: observation.minuteOfDay,
    };
  });

  const routines: PatternRoutine[] = clusters.flatMap((cluster) => {
    const clusterObservations = observationsWithClusters.filter(({ clusterId }) => clusterId === cluster.id);
    const recurring = clusterObservations.filter((observation) =>
      circularDistanceMinutes(observation.minuteOfDay, cluster.medianMinuteOfDay) <= routineWindowMinutes
    );
    const recurringDays = new Set(recurring.map(({ date }) => date));
    return recurring.length >= minimumRoutinePhotos && recurringDays.size >= minimumRoutineDays
      ? [{ clusterId: cluster.id, photoCount: recurring.length, dayCount: recurringDays.size, medianMinuteOfDay: circularMedian(recurring.map(({ minuteOfDay }) => minuteOfDay)), windowMinutes: routineWindowMinutes }]
      : [];
  });

  const transitionCounts = new Map<string, { fromClusterId: string; toClusterId: string; days: Set<string>; times: number[] }>();
  const byDate = new Map<string, PatternObservation[]>();
  for (const observation of observationsWithClusters) {
    const dayObservations = byDate.get(observation.date) ?? [];
    dayObservations.push(observation);
    byDate.set(observation.date, dayObservations);
  }
  for (const [date, dayObservations] of byDate) {
    dayObservations.sort((a, b) => a.timestamp - b.timestamp || a.analysisId.localeCompare(b.analysisId));
    const seenOnDay = new Set<string>();
    for (let index = 0; index < dayObservations.length - 1; index++) {
      const current = dayObservations[index];
      const next = dayObservations[index + 1];
      if (!current || !next || current.clusterId === next.clusterId) continue;
      const key = `${current.clusterId}->${next.clusterId}`;
      if (seenOnDay.has(key)) continue;
      seenOnDay.add(key);
      const entry = transitionCounts.get(key) ?? {
        fromClusterId: current.clusterId,
        toClusterId: next.clusterId,
        days: new Set<string>(),
        times: [],
      };
      entry.days.add(date);
      entry.times.push(current.minuteOfDay);
      transitionCounts.set(key, entry);
    }
  }

  const transitions: PatternTransition[] = [...transitionCounts.values()]
    .filter(({ days }) => days.size >= minimumRepeatedTransitions)
    .map(({ fromClusterId, toClusterId, days, times }) => ({
      fromClusterId,
      toClusterId,
      count: days.size,
      dayCount: days.size,
      medianMinuteOfDay: circularMedian(times),
    }))
    .sort((a, b) => a.fromClusterId.localeCompare(b.fromClusterId) || a.toClusterId.localeCompare(b.toClusterId));

  const insights: PatternInsight[] = [
    ...routines.map((routine) => ({
      id: `routine-${routine.clusterId}`,
      kind: 'routine' as const,
      sourceClusterIds: [routine.clusterId],
      confidence: confidenceForDayCount(routine.dayCount),
      count: routine.photoCount,
      dayCount: routine.dayCount,
      medianMinuteOfDay: routine.medianMinuteOfDay,
    })),
    ...transitions.map((transition) => ({
      id: `transition-${transition.fromClusterId}-${transition.toClusterId}`,
      kind: 'transition' as const,
      sourceClusterIds: [transition.fromClusterId, transition.toClusterId],
      confidence: confidenceForDayCount(transition.dayCount),
      count: transition.count,
      dayCount: transition.dayCount,
      medianMinuteOfDay: transition.medianMinuteOfDay,
    })),
  ];
  const readability = routines.length >= 2 ? 'Tinggi' : routines.length === 1 ? 'Sedang' : 'Rendah';

  return {
    radiusMeters,
    routineWindowMinutes,
    observations: observationsWithClusters,
    clusters,
    routines,
    transitions,
    insights,
    unmappableCount,
    readability,
  };
}
