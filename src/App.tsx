import { useCallback, useRef, useState } from "react";
import * as Cesium from "cesium";
import GlobeViewer from "@/globe/GlobeViewer";
import PostProcessing from "@/globe/PostProcessing";
import TopBar from "@/hud/TopBar";
import BottomBar from "@/hud/BottomBar";
import ClassifiedWatermark from "@/hud/ClassifiedWatermark";
import LayerPanel from "@/hud/LayerPanel";
import EntityInspector from "@/hud/EntityInspector";
import AlertFeed from "@/hud/AlertFeed";
import CommandConsole from "@/hud/CommandConsole";
import BootSequence from "@/hud/BootSequence";
import SatelliteLayer from "@/layers/SatelliteLayer";
import FlightLayer from "@/layers/FlightLayer";
import SeismicLayer from "@/layers/SeismicLayer";
import MilitaryFlightLayer from "@/layers/MilitaryFlightLayer";
import IntelLayer from "@/layers/IntelLayer";
import MaritimeLayer from "@/layers/MaritimeLayer";
import CCTVLayer from "@/layers/CCTVLayer";
import TrafficLayer from "@/layers/TrafficLayer";
import ConflictLayer from "@/layers/ConflictLayer";
import InfrastructureLayer from "@/layers/InfrastructureLayer";
import CameraController from "@/globe/CameraController";
import EntityManager from "@/globe/EntityManager";
import DataFreshness from "@/hud/DataFreshness";
import ThreatGauge from "@/hud/ThreatGauge";
import MiniMap from "@/hud/MiniMap";
import DetectionMode from "@/hud/DetectionMode";
import CameraPresets from "@/hud/CameraPresets";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { Toaster } from "sonner";

export default function App() {
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const [viewer, setViewer] = useState<Cesium.Viewer | null>(null);
  const [booted, setBooted] = useState(false);

  const handleViewerReady = useCallback((v: Cesium.Viewer) => {
    viewerRef.current = v;
    setViewer(v);
  }, []);

  // Global keyboard shortcuts
  useKeyboardShortcuts(viewer);

  if (!booted) {
    return <BootSequence onComplete={() => setBooted(true)} />;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg-primary">
      {/* 3D Globe */}
      <GlobeViewer onViewerReady={handleViewerReady} />

      {/* Post-processing shaders */}
      <PostProcessing viewer={viewer} />

      {/* Globe controllers */}
      <CameraController viewer={viewer} />
      <EntityManager viewer={viewer} />

      {/* Data Layers */}
      <SatelliteLayer viewer={viewer} />
      <FlightLayer viewer={viewer} />
      <SeismicLayer viewer={viewer} />
      <MilitaryFlightLayer viewer={viewer} />
      <IntelLayer viewer={viewer} />
      <MaritimeLayer viewer={viewer} />
      <CCTVLayer viewer={viewer} />
      <TrafficLayer viewer={viewer} />
      <ConflictLayer viewer={viewer} />
      <InfrastructureLayer viewer={viewer} />

      {/* HUD Overlays */}
      <TopBar />
      <BottomBar />
      <LayerPanel />
      <EntityInspector />
      <AlertFeed />
      <CommandConsole />
      <DetectionMode />
      <DataFreshness />
      <ThreatGauge />
      <MiniMap />
      <CameraPresets viewer={viewer} />
      <ClassifiedWatermark />

      {/* Scanline overlay */}
      <div className="scanline-overlay" />

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          className: "font-mono text-xs bg-bg-panel border border-border-dim text-text-primary",
        }}
        theme="dark"
      />
    </div>
  );
}
