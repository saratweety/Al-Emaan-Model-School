"use client";

import { useSyncExternalStore } from "react";

let isOpen = false;
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

export function toggleMobileSidebar() {
  isOpen = !isOpen;
  emitChange();
}

export function closeMobileSidebar() {
  if (!isOpen) return;
  isOpen = false;
  emitChange();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useMobileSidebarOpen() {
  return useSyncExternalStore(subscribe, () => isOpen, () => false);
}
