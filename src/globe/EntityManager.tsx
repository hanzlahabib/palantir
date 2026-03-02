import { useEffect, useRef } from "react";
import * as Cesium from "cesium";
import { useEntityStore } from "@/stores/entityStore";

interface EntityManagerProps {
  viewer: Cesium.Viewer | null;
}

export default function EntityManager({ viewer }: EntityManagerProps) {
  const selectEntity = useEntityStore((s) => s.selectEntity);
  const handlerRef = useRef<Cesium.ScreenSpaceEventHandler | null>(null);

  useEffect(() => {
    if (!viewer) return;

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handlerRef.current = handler;

    // Left click — select entity
    handler.setInputAction(
      (click: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        const picked = viewer.scene.pick(click.position);
        if (Cesium.defined(picked) && picked.id) {
          const entity = picked.id as Cesium.Entity;
          const props = entity.properties;
          if (props) {
            const layerData = props.layerData?.getValue(Cesium.JulianDate.now());
            if (layerData) {
              selectEntity(layerData);
              return;
            }
          }
        }
        selectEntity(null);
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK
    );

    return () => {
      if (handlerRef.current && !handlerRef.current.isDestroyed()) {
        handlerRef.current.destroy();
        handlerRef.current = null;
      }
    };
  }, [viewer, selectEntity]);

  return null;
}
