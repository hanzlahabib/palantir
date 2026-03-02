import { useEffect, useRef, useCallback, useState } from "react";
import { useLayerStore } from "@/stores/layerStore";
import type { LayerId } from "@/types/layers";

interface UseDataLayerOptions<T> {
  layerId: LayerId;
  fetchFn: () => Promise<T[]>;
  intervalMs: number;
  enabled?: boolean;
}

export function useDataLayer<T>({ layerId, fetchFn, intervalMs, enabled }: UseDataLayerOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const layerEnabled = useLayerStore((s) => s.getLayer(layerId)?.enabled ?? false);
  const setLayerLoading = useLayerStore((s) => s.setLayerLoading);
  const updateEntityCount = useLayerStore((s) => s.updateEntityCount);
  const updateLastFetch = useLayerStore((s) => s.updateLastFetch);

  const isActive = enabled !== undefined ? enabled : layerEnabled;

  const fetchData = useCallback(async () => {
    try {
      setLayerLoading(layerId, true);
      const result = await fetchFn();
      setData(result);
      setError(null);
      updateEntityCount(layerId, result.length);
      updateLastFetch(layerId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fetch failed");
    } finally {
      setLayerLoading(layerId, false);
    }
  }, [layerId, fetchFn, setLayerLoading, updateEntityCount, updateLastFetch]);

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setData([]);
      updateEntityCount(layerId, 0);
      return;
    }

    fetchData();
    intervalRef.current = setInterval(fetchData, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, fetchData, intervalMs, layerId, updateEntityCount]);

  return { data, error, refetch: fetchData };
}
