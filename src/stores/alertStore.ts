import { create } from "zustand";
import type { Alert } from "@/types/layers";

const MAX_ALERTS = 100;

interface AlertStore {
  alerts: Alert[];
  unreadCount: number;
  addAlert: (alert: Alert) => void;
  clearAlerts: () => void;
  markAllRead: () => void;
}

export const useAlertStore = create<AlertStore>((set) => ({
  alerts: [],
  unreadCount: 0,

  addAlert: (alert) =>
    set((state) => {
      const newAlerts = [alert, ...state.alerts].slice(0, MAX_ALERTS);
      return { alerts: newAlerts, unreadCount: state.unreadCount + 1 };
    }),

  clearAlerts: () => set({ alerts: [], unreadCount: 0 }),

  markAllRead: () => set({ unreadCount: 0 }),
}));
