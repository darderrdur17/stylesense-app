"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ClothingItem,
  OutfitMemory,
  TripPlan,
  UserProfile,
  StyleInspo,
} from "./types";
import {
  sampleWardrobe,
  sampleMemories,
  sampleTrips,
  sampleInspirations,
  sampleUser,
} from "./data";
import { generateId } from "./utils";

interface AppState {
  user: UserProfile;
  wardrobe: ClothingItem[];
  memories: OutfitMemory[];
  trips: TripPlan[];
  inspirations: StyleInspo[];
  isOnboarded: boolean;

  setUser: (user: Partial<UserProfile>) => void;
  setOnboarded: (v: boolean) => void;

  addClothingItem: (item: Omit<ClothingItem, "id" | "dateAdded" | "wearCount">) => void;
  removeClothingItem: (id: string) => void;
  updateClothingItem: (id: string, updates: Partial<ClothingItem>) => void;
  toggleFavorite: (id: string) => void;

  addMemory: (memory: Omit<OutfitMemory, "id">) => void;
  removeMemory: (id: string) => void;

  addTrip: (trip: Omit<TripPlan, "id">) => void;
  updateTrip: (id: string, updates: Partial<TripPlan>) => void;
  removeTrip: (id: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: sampleUser,
      wardrobe: sampleWardrobe,
      memories: sampleMemories,
      trips: sampleTrips,
      inspirations: sampleInspirations,
      isOnboarded: false,

      setUser: (updates) =>
        set((s) => ({ user: { ...s.user, ...updates } })),

      setOnboarded: (v) => set({ isOnboarded: v }),

      addClothingItem: (item) =>
        set((s) => ({
          wardrobe: [
            ...s.wardrobe,
            {
              ...item,
              id: generateId(),
              dateAdded: new Date().toISOString().split("T")[0],
              wearCount: 0,
            },
          ],
        })),

      removeClothingItem: (id) =>
        set((s) => ({
          wardrobe: s.wardrobe.filter((i) => i.id !== id),
        })),

      updateClothingItem: (id, updates) =>
        set((s) => ({
          wardrobe: s.wardrobe.map((i) =>
            i.id === id ? { ...i, ...updates } : i
          ),
        })),

      toggleFavorite: (id) =>
        set((s) => ({
          wardrobe: s.wardrobe.map((i) =>
            i.id === id ? { ...i, favorite: !i.favorite } : i
          ),
        })),

      addMemory: (memory) =>
        set((s) => ({
          memories: [{ ...memory, id: generateId() }, ...s.memories],
        })),

      removeMemory: (id) =>
        set((s) => ({
          memories: s.memories.filter((m) => m.id !== id),
        })),

      addTrip: (trip) =>
        set((s) => ({
          trips: [...s.trips, { ...trip, id: generateId() }],
        })),

      updateTrip: (id, updates) =>
        set((s) => ({
          trips: s.trips.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      removeTrip: (id) =>
        set((s) => ({
          trips: s.trips.filter((t) => t.id !== id),
        })),
    }),
    {
      name: "stylesense-storage",
    }
  )
);
