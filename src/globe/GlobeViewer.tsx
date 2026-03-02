import { useEffect, useRef, useCallback } from "react";
import * as Cesium from "cesium";
import { TILE_CONFIG, DEFAULT_CAMERA } from "@/config/constants";
import { useCameraStore } from "@/stores/cameraStore";
import { cartesianToGeo } from "@/utils/coordinateUtils";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

interface GlobeViewerProps {
  onViewerReady?: (viewer: Cesium.Viewer) => void;
}

export default function GlobeViewer({ onViewerReady }: GlobeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const setCamera = useCameraStore((s) => s.setCamera);

  const initViewer = useCallback(async () => {
    if (!containerRef.current || viewerRef.current) return;

    const viewer = new Cesium.Viewer(containerRef.current, {
      animation: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      navigationHelpButton: false,
      requestRenderMode: false,
      msaaSamples: 4,
      orderIndependentTranslucency: true,
      contextOptions: {
        webgl: {
          alpha: false,
          antialias: true,
          preserveDrawingBuffer: false,
        },
      },
    });

    viewerRef.current = viewer;

    // Remove default imagery
    viewer.imageryLayers.removeAll();

    // Scene configuration
    const scene = viewer.scene;
    scene.globe.enableLighting = true;
    scene.globe.showGroundAtmosphere = true;
    if (scene.skyAtmosphere) scene.skyAtmosphere.show = true;
    scene.fog.enabled = true;
    scene.fog.density = 2.0e-4;
    scene.globe.depthTestAgainstTerrain = false;
    scene.highDynamicRange = false;
    scene.backgroundColor = Cesium.Color.BLACK;

    // Performance
    scene.globe.tileCacheSize = 100;
    scene.globe.maximumScreenSpaceError = 2;

    // Load Google Photorealistic 3D Tiles
    if (GOOGLE_API_KEY) {
      try {
        const tileset = await Cesium.Cesium3DTileset.fromUrl(
          `https://tile.googleapis.com/v1/3dtiles/root.json?key=${GOOGLE_API_KEY}`,
          {
            maximumScreenSpaceError: TILE_CONFIG.maximumScreenSpaceError,
            skipLevelOfDetail: TILE_CONFIG.skipLevelOfDetail,
            dynamicScreenSpaceError: TILE_CONFIG.dynamicScreenSpaceError,
          }
        );
        scene.primitives.add(tileset);
      } catch (e) {
        console.warn("Failed to load Google 3D Tiles:", e);
        // Fallback: add basic imagery
        viewer.imageryLayers.addImageryProvider(
          await Cesium.TileMapServiceImageryProvider.fromUrl(
            Cesium.buildModuleUrl("Assets/Textures/NaturalEarthII")
          )
        );
      }
    } else {
      // No API key — use default Earth imagery
      viewer.imageryLayers.addImageryProvider(
        await Cesium.TileMapServiceImageryProvider.fromUrl(
          Cesium.buildModuleUrl("Assets/Textures/NaturalEarthII")
        )
      );
    }

    // Initial camera position
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(
        DEFAULT_CAMERA.longitude,
        DEFAULT_CAMERA.latitude,
        DEFAULT_CAMERA.height
      ),
    });

    // Camera change listener — update store
    viewer.camera.changed.addEventListener(() => {
      const pos = viewer.camera.positionCartographic;
      setCamera({
        longitude: Cesium.Math.toDegrees(pos.longitude),
        latitude: Cesium.Math.toDegrees(pos.latitude),
        height: pos.height,
        heading: Cesium.Math.toDegrees(viewer.camera.heading),
        pitch: Cesium.Math.toDegrees(viewer.camera.pitch),
        roll: Cesium.Math.toDegrees(viewer.camera.roll),
      });
    });
    viewer.camera.percentageChanged = 0.01;

    // Mouse move — update coordinates under cursor
    const handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
    handler.setInputAction(
      (movement: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
        const cartesian = viewer.camera.pickEllipsoid(
          movement.endPosition,
          scene.globe.ellipsoid
        );
        if (cartesian) {
          const geo = cartesianToGeo(cartesian);
          setCamera({
            longitude: geo.longitude,
            latitude: geo.latitude,
          });
        }
      },
      Cesium.ScreenSpaceEventType.MOUSE_MOVE
    );

    onViewerReady?.(viewer);

    return () => {
      handler.destroy();
    };
  }, [onViewerReady, setCamera]);

  useEffect(() => {
    initViewer();
    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [initViewer]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
    />
  );
}
