import {
  type CommandState,
  type RiskStage,
  type VerifiedEvent,
  FALLBACK_CAMERAS,
  FALLBACK_STRUCTURES,
} from "./types";

export function classifyStageFromScore(score: number): RiskStage {
  if (score >= 0.75) return "CRITICAL";
  if (score >= 0.55) return "WARNING";
  if (score >= 0.35) return "WATCH";
  return "NORMAL";
}

export function asStage(status: string | undefined, score: number): RiskStage {
  if (status === "NORMAL" || status === "WATCH" || status === "WARNING" || status === "CRITICAL") {
    if (status === "NORMAL" && score >= 0.35) return classifyStageFromScore(score);
    return status;
  }
  return classifyStageFromScore(score);
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    0.5 -
    Math.cos(dLat) / 2 +
    (Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * (1 - Math.cos(dLon))) / 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

export function eventsToCommandState(events: VerifiedEvent[]): CommandState {
  const latest = events.slice(-250);
  const sensors = new Map<string, CommandState["sensors"][number]>();

  for (const evt of latest) {
    const score = Number(evt.finalRiskScore || 0);
    const lat = Number(evt.latitude ?? 28.6139);
    const lon = Number(evt.longitude ?? 77.209);
    sensors.set(evt.deviceId, {
      deviceId: evt.deviceId,
      lat,
      lon,
      alt: 18,
      trust: Number(evt.factors?.T ?? 0.7),
      anomaly: score,
      signature: evt.ledgerHash ? "valid" : "queued",
      lastSeen: evt.timestamp,
      structureId: evt.structureId,
      stage: asStage(String(evt.status), score),
    });
  }

  const structures = FALLBACK_STRUCTURES.map((asset) => {
    const related = latest.filter((evt) => {
      if (evt.structureId === asset.id) return true;
      return haversineKm(asset.lat, asset.lon, Number(evt.latitude), Number(evt.longitude)) <= asset.radiusM / 1000;
    });
    const maxScore = related.reduce((m, evt) => Math.max(m, Number(evt.finalRiskScore || 0)), 0);
    const last = related[related.length - 1];
    return {
      ...asset,
      stage: classifyStageFromScore(maxScore),
      score: maxScore,
      twinConfidence: last ? Number(last.twinCorrelation || asset.twinConfidence) : asset.twinConfidence,
      verifiedSensorCount: new Set(related.map((e) => e.deviceId)).size,
      lastUpdate: last?.timestamp || null,
      factors: last?.factors || null,
    };
  });

  const correlations: CommandState["correlations"] = [];
  for (const evt of latest) {
    const count = Number(evt.localDeviceCount || 0);
    if (count < 2) continue;
    for (let i = 0; i < Math.min(count, 4); i++) {
      correlations.push({
        eventId: evt.eventId,
        fromDeviceId: evt.deviceId,
        toDeviceId: `${evt.deviceId}-mesh-${i}`,
        from: { lat: Number(evt.latitude), lon: Number(evt.longitude) },
        to: {
          lat: Number(evt.latitude) + Math.sin(i * 1.7) * 0.005,
          lon: Number(evt.longitude) + Math.cos(i * 1.3) * 0.005,
        },
      });
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    sensors: Array.from(sensors.values()),
    structures,
    events: latest.map((evt) => ({
      ...evt,
      latitude: Number(evt.latitude ?? 28.6139),
      longitude: Number(evt.longitude ?? 77.209),
      status: asStage(String(evt.status), Number(evt.finalRiskScore || 0)),
    })),
    correlations,
    cameras: FALLBACK_CAMERAS,
    stats: {
      eventCount: latest.length,
      sensorCount: sensors.size,
      criticalCount: latest.filter((e) => asStage(String(e.status), Number(e.finalRiskScore || 0)) === "CRITICAL").length,
    },
  };
}
