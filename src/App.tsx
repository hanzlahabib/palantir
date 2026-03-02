import { useCallback, useRef } from "react";
import * as Cesium from "cesium";
import GlobeViewer from "@/globe/GlobeViewer";
import TopBar from "@/hud/TopBar";
import BottomBar from "@/hud/BottomBar";
import ClassifiedWatermark from "@/hud/ClassifiedWatermark";
import { Toaster } from "sonner";

export default function App() {
  const viewerRef = useRef<Cesium.Viewer | null>(null);

  const handleViewerReady = useCallback((viewer: Cesium.Viewer) => {
    viewerRef.current = viewer;
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg-primary">
      {/* 3D Globe */}
      <GlobeViewer onViewerReady={handleViewerReady} />

      {/* HUD Overlays */}
      <TopBar />
      <BottomBar />
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
