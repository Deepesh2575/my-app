import type { CommandState, LayerId, RiskStage } from "@/lib/command/types";
import { applyLayerVisibility, flyToLonLat, stageColor, type CesiumNS } from "./cameraDirector";

type SceneOpts = {
  layers: Record<LayerId, boolean>;
  playbackMs: number | null;
};

function pulseSize(base: number, speed = 3.2) {
  return base + Math.sin(Date.now() / 1000 * speed) * (base * 0.35);
}

function addCityFabric(Cesium: CesiumNS, viewer: import("cesium").Viewer) {
  if (viewer.entities.getById("fabric:seed")) return;
  viewer.entities.add({ id: "fabric:seed", show: false });
  const origin: [number, number][] = [
    [77.209, 28.6139],
    [77.2295, 28.6129],
    [72.8777, 19.076],
  ];
  origin.forEach((center, cluster) => {
    for (let i = 0; i < 18; i++) {
      const ang = (i / 18) * Math.PI * 2;
      const r = 0.006 + (i % 4) * 0.0024;
      const lon = center[0] + Math.cos(ang) * r;
      const lat = center[1] + Math.sin(ang) * r * 0.82;
      const h = 18 + ((i + cluster) % 8) * 11;
      viewer.entities.add({
        id: `fabric:${cluster}-${i}`,
        position: Cesium.Cartesian3.fromDegrees(lon, lat, h / 2),
        box: {
          dimensions: new Cesium.Cartesian3(28 + (i % 3) * 10, 24 + (i % 2) * 8, h),
          material: Cesium.Color.fromCssColorString("#16324a").withAlpha(0.78),
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString("#4fd2ff").withAlpha(0.18),
        },
      });
    }
  });
}

function addSatellites(Cesium: CesiumNS, viewer: import("cesium").Viewer) {
  if (viewer.entities.getById("sat:0")) return;
  for (let i = 0; i < 6; i++) {
    viewer.entities.add({
      id: `sat:${i}`,
      position: new Cesium.CallbackProperty((time) => {
        const t = Cesium.JulianDate.toDate(time || Cesium.JulianDate.now()).getTime() / 1000;
        const lon = ((t * 8 + i * 60) % 360) - 180;
        const lat = Math.sin(t / 40 + i) * 42;
        return Cesium.Cartesian3.fromDegrees(lon, lat, 560000);
      }, false) as unknown as import("cesium").PositionProperty,
      point: {
        pixelSize: 7,
        color: Cesium.Color.fromCssColorString("#7dd3fc"),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 1,
      },
      label: {
        text: `LEO-${3140 + i}`,
        font: "10px monospace",
        fillColor: Cesium.Color.fromCssColorString("#a5f3fc"),
        pixelOffset: new Cesium.Cartesian2(12, -10),
        scaleByDistance: new Cesium.NearFarScalar(1e6, 1, 8e6, 0),
      },
      path: {
        leadTime: 0,
        trailTime: 1800,
        width: 1.2,
        material: Cesium.Color.fromCssColorString("#22d3ee").withAlpha(0.35),
      },
    });
  }
}

export function bootstrapStaticLayers(Cesium: CesiumNS, viewer: import("cesium").Viewer) {
  addCityFabric(Cesium, viewer);
  addSatellites(Cesium, viewer);
}

export function syncCommandScene(
  Cesium: CesiumNS,
  viewer: import("cesium").Viewer,
  state: CommandState,
  opts: SceneOpts,
) {
  const cutoff = opts.playbackMs;
  const events = cutoff
    ? state.events.filter((e) => new Date(e.timestamp).getTime() <= cutoff)
    : state.events;
  const visibleIds = new Set<string>(["fabric:seed"]);

  state.structures.forEach((s) => {
    const zoneId = `zone:${s.id}`;
    const structId = `structure:${s.id}`;
    visibleIds.add(zoneId);
    visibleIds.add(structId);
    const radius = Math.max(120, s.radiusM);
    const zone = viewer.entities.getById(zoneId);
    const material = new Cesium.ColorMaterialProperty(
      new Cesium.CallbackProperty(() => {
        const pulse = s.stage === "CRITICAL" ? 0.18 + Math.sin(Date.now() / 420) * 0.1 : 0.12;
        return stageColor(Cesium, s.stage as RiskStage, pulse);
      }, false),
    );
    if (!zone) {
      viewer.entities.add({
        id: zoneId,
        position: Cesium.Cartesian3.fromDegrees(s.lon, s.lat),
        ellipse: {
          semiMajorAxis: radius,
          semiMinorAxis: radius,
          material,
          height: 2,
          outline: true,
          outlineColor: stageColor(Cesium, s.stage as RiskStage, 0.55),
        },
        properties: { kind: "structure", payload: s },
      });
    } else if (zone.ellipse) {
      zone.position = new Cesium.ConstantPositionProperty(Cesium.Cartesian3.fromDegrees(s.lon, s.lat));
      zone.ellipse.outlineColor = new Cesium.ConstantProperty(stageColor(Cesium, s.stage as RiskStage, 0.55));
    }

    const height = s.heightM;
    const box = viewer.entities.getById(structId);
    const glow = stageColor(Cesium, s.stage as RiskStage, s.stage === "CRITICAL" ? 0.95 : 0.82);
    if (!box) {
      viewer.entities.add({
        id: structId,
        name: s.name,
        position: Cesium.Cartesian3.fromDegrees(s.lon, s.lat, height / 2),
        box: {
          dimensions: new Cesium.Cartesian3(
            s.kind === "bridge" ? 160 : 48,
            s.kind === "bridge" ? 28 : 42,
            height,
          ),
          material: glow,
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString("#e0f2fe").withAlpha(0.35),
        },
        label: {
          text: s.name,
          font: "11px monospace",
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 3,
          pixelOffset: new Cesium.Cartesian2(0, -28),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        properties: { kind: "structure", payload: s },
      });
    } else {
      box.position = new Cesium.ConstantPositionProperty(
        Cesium.Cartesian3.fromDegrees(s.lon, s.lat, height / 2),
      );
      if (box.box) box.box.material = glow as unknown as import("cesium").MaterialProperty;
    }
  });

  state.sensors.forEach((sensor) => {
    if (cutoff && new Date(sensor.lastSeen).getTime() > cutoff) return;
    const id = `sensor:${sensor.deviceId}`;
    visibleIds.add(id);
    const color = stageColor(Cesium, sensor.stage as RiskStage);
    let entity = viewer.entities.getById(id);
    if (!entity) {
      entity = viewer.entities.add({
        id,
        position: Cesium.Cartesian3.fromDegrees(sensor.lon, sensor.lat, sensor.alt || 22),
        point: {
          pixelSize: new Cesium.CallbackProperty(() => pulseSize(sensor.stage === "CRITICAL" ? 14 : 9), false),
          color,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 1,
          scaleByDistance: new Cesium.NearFarScalar(400, 1.4, 1.2e6, 0.35),
        },
        properties: { kind: "sensor", payload: sensor },
      });
    } else {
      entity.position = new Cesium.ConstantPositionProperty(
        Cesium.Cartesian3.fromDegrees(sensor.lon, sensor.lat, sensor.alt || 22),
      );
      if (entity.point) entity.point.color = new Cesium.ConstantProperty(color);
    }
  });

  events.slice(-80).forEach((evt) => {
    const id = `event:${evt.eventId}`;
    visibleIds.add(id);
    const stage = (evt.status as RiskStage) || "NORMAL";
    if (!viewer.entities.getById(id)) {
      viewer.entities.add({
        id,
        position: Cesium.Cartesian3.fromDegrees(evt.longitude, evt.latitude, 40),
        billboard: {
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        },
        point: {
          pixelSize: 11,
          color: stageColor(Cesium, stage),
          outlineColor: Cesium.Color.WHITE,
        },
        label: {
          text: `${stage} · ${String(evt.ledgerHash || "").slice(0, 8)}`,
          font: "10px monospace",
          fillColor: Cesium.Color.fromCssColorString("#d1faff"),
          pixelOffset: new Cesium.Cartesian2(0, -18),
          showBackground: true,
          backgroundColor: Cesium.Color.fromCssColorString("#041018").withAlpha(0.72),
          scaleByDistance: new Cesium.NearFarScalar(500, 1, 80000, 0),
        },
        properties: { kind: "event", payload: evt },
      });
    }
  });

  state.correlations.forEach((link, idx) => {
    if (cutoff) {
      const evt = events.find((e) => e.eventId === link.eventId);
      if (!evt) return;
    }
    const id = `corr:${link.eventId}-${idx}`;
    visibleIds.add(id);
    if (!viewer.entities.getById(id)) {
      viewer.entities.add({
        id,
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArrayHeights([
            link.from.lon,
            link.from.lat,
            40,
            link.to.lon,
            link.to.lat,
            40,
          ]),
          width: 2,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.25,
            color: Cesium.Color.fromCssColorString("#22d3ee").withAlpha(0.85),
          }),
        },
      });
    }
  });

  state.cameras.forEach((cam) => {
    const id = `cam:${cam.id}`;
    visibleIds.add(id);
    if (!viewer.entities.getById(id)) {
      viewer.entities.add({
        id,
        position: Cesium.Cartesian3.fromDegrees(cam.lon, cam.lat, 28),
        point: {
          pixelSize: 8,
          color: Cesium.Color.fromCssColorString("#f472b6"),
        },
        label: {
          text: cam.name,
          font: "10px monospace",
          fillColor: Cesium.Color.fromCssColorString("#fbcfe8"),
          pixelOffset: new Cesium.Cartesian2(10, 0),
        },
        properties: { kind: "camera", payload: cam },
      });
    }
  });

  for (let i = 0; i < 6; i++) visibleIds.add(`sat:${i}`);
  for (const entity of [...viewer.entities.values]) {
    const prefix = String(entity.id).split(":")[0];
    if (prefix === "fabric") continue;
    if (!visibleIds.has(String(entity.id)) && ["sensor", "event", "corr", "zone", "structure", "cam"].includes(prefix)) {
      viewer.entities.remove(entity);
    }
  }

  applyLayerVisibility(viewer, opts.layers);
}

export { flyToLonLat };
