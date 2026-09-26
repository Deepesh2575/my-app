import type { LayerId, RiskStage } from "@/lib/command/types";
import { STAGE_COLOR } from "@/lib/command/types";

export type CesiumNS = typeof import("cesium");

export function stageColor(Cesium: CesiumNS, stage: RiskStage, alpha = 1) {
  return Cesium.Color.fromCssColorString(STAGE_COLOR[stage]).withAlpha(alpha);
}

export function applyLayerVisibility(
  viewer: import("cesium").Viewer,
  layers: Record<LayerId, boolean>,
) {
  const map: Record<string, LayerId> = {
    sensor: "sensors",
    zone: "heatmap",
    structure: "structures",
    fabric: "structures",
    event: "events",
    cam: "cameras",
    sat: "satellites",
    corr: "correlations",
  };
  for (const entity of viewer.entities.values) {
    const key = String(entity.id).split(":")[0];
    const layer = map[key];
    if (layer) entity.show = layers[layer];
  }
}

export function goToIndiaOverview(Cesium: CesiumNS, viewer: import("cesium").Viewer) {
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(77.209, 22.8, 1_650_000),
    orientation: {
      heading: Cesium.Math.toRadians(12),
      pitch: Cesium.Math.toRadians(-48),
      roll: 0,
    },
    duration: 3.4,
  });
}

export function flyToLonLat(
  Cesium: CesiumNS,
  viewer: import("cesium").Viewer,
  lon: number,
  lat: number,
  range = 980,
) {
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(lon, lat - 0.008, range),
    orientation: {
      heading: Cesium.Math.toRadians(18),
      pitch: Cesium.Math.toRadians(-32),
      roll: 0,
    },
    duration: 2.6,
  });
}
