"use client";

import { useEffect, useRef } from "react";
import type { CommandState, LayerId, VerifiedEvent } from "@/lib/command/types";
import { flyToLonLat, goToIndiaOverview, type CesiumNS } from "./cameraDirector";
import { bootstrapStaticLayers, syncCommandScene } from "./sceneSync";

export type GlobeSelection =
  | { kind: "sensor"; payload: CommandState["sensors"][number] }
  | { kind: "structure"; payload: CommandState["structures"][number] }
  | { kind: "event"; payload: VerifiedEvent }
  | { kind: "camera"; payload: CommandState["cameras"][number] }
  | null;

type Props = {
  state: CommandState;
  layers: Record<LayerId, boolean>;
  playbackMs: number | null;
  focusToken?: string;
  onSelect: (selection: GlobeSelection) => void;
};

export default function CesiumGlobe({ state, layers, playbackMs, focusToken, onSelect }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<import("cesium").Viewer | null>(null);
  const cesiumRef = useRef<CesiumNS | null>(null);
  const introDone = useRef(false);
  const lastCritical = useRef<string | null>(null);
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!hostRef.current || viewerRef.current) return;
    let cancelled = false;
    let resizeObs: ResizeObserver | null = null;

    (async () => {
      (window as unknown as { CESIUM_BASE_URL: string }).CESIUM_BASE_URL = "/cesium/";
      const Cesium = await import("cesium");
      if (cancelled || !hostRef.current) return;
      cesiumRef.current = Cesium;

      const credit = document.createElement("div");
      const viewer = new Cesium.Viewer(hostRef.current, {
        animation: false,
        timeline: false,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        baseLayerPicker: false,
        navigationHelpButton: false,
        fullscreenButton: false,
        infoBox: false,
        selectionIndicator: true,
        creditContainer: credit,
        terrain: undefined,
        skyAtmosphere: false,
      });
      viewer.imageryLayers.removeAll();
      viewer.imageryLayers.addImageryProvider(
        new Cesium.UrlTemplateImageryProvider({
          url: "https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
          credit: "CARTO",
        }),
      );
      viewer.scene.globe.enableLighting = true;
      viewer.scene.globe.atmosphereLightIntensity = 20;
      viewer.scene.globe.showGroundAtmosphere = true;
      viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString("#020817");
      viewer.scene.fog.enabled = true;
      viewer.scene.backgroundColor = Cesium.Color.fromCssColorString("#00010a");
      viewer.clock.shouldAnimate = true;
      if (viewer.scene.moon) {
        viewer.scene.moon.show = true;
      }
      if (viewer.cesiumWidget?.creditContainer) {
        (viewer.cesiumWidget.creditContainer as HTMLElement).style.display = "none";
      }

      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(40, 8, 18_000_000),
      });

      bootstrapStaticLayers(Cesium, viewer);
      viewer.selectedEntityChanged.addEventListener((entity) => {
        const kind = entity?.properties?.kind?.getValue?.() as GlobeSelection extends infer T
          ? T extends { kind: infer K }
            ? K
            : never
          : never;
        const payload = entity?.properties?.payload?.getValue?.();
        if (kind && payload) {
          onSelectRef.current({ kind, payload } as GlobeSelection);
          if (payload.lon && payload.lat) {
            flyToLonLat(Cesium, viewer, payload.lon, payload.lat, payload.heightM ? 720 : 520);
          } else if (payload.longitude && payload.latitude) {
            flyToLonLat(Cesium, viewer, payload.longitude, payload.latitude, 520);
          }
        }
      });

      viewerRef.current = viewer;
      if (!introDone.current) {
        introDone.current = true;
        goToIndiaOverview(Cesium, viewer);
      }

      resizeObs = new ResizeObserver(() => viewer.resize());
      resizeObs.observe(hostRef.current);
    })();

    return () => {
      cancelled = true;
      resizeObs?.disconnect();
      viewerRef.current?.destroy();
      viewerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;
    const Cesium = cesiumRef.current;
    if (!viewer || !Cesium) return;
    syncCommandScene(Cesium, viewer, state, { layers, playbackMs });
  }, [state, layers, playbackMs]);

  useEffect(() => {
    const viewer = viewerRef.current;
    const Cesium = cesiumRef.current;
    if (!viewer || !Cesium || !focusToken) return;
    const [kind, id] = focusToken.split(":");
    if (kind === "structure") {
      const s = state.structures.find((x) => x.id === id);
      if (s) flyToLonLat(Cesium, viewer, s.lon, s.lat, 760);
    }
  }, [focusToken, state.structures]);

  useEffect(() => {
    const viewer = viewerRef.current;
    const Cesium = cesiumRef.current;
    if (!viewer || !Cesium) return;
    const critical = [...state.events].reverse().find((e) => e.status === "CRITICAL");
    if (critical && critical.eventId !== lastCritical.current) {
      lastCritical.current = critical.eventId;
      flyToLonLat(Cesium, viewer, critical.longitude, critical.latitude, 640);
    }
  }, [state.events]);

  return <div ref={hostRef} className="godseye-canvas absolute inset-0" />;
}
