"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ClothingItem,
  FeedbackStats,
  OutfitMemory,
  TripPlan,
  SetUserResult,
  StyleInspo,
  UserProfile,
  WeatherData,
} from "./types";
const emptyUser: UserProfile = {
  name: "",
  email: "",
  avatar: "",
  preferredStyles: [],
  location: "New York",
  temperatureUnit: "celsius",
  joinDate: new Date().toISOString().slice(0, 10),
};

function patchBodyFromClothing(updates: Partial<ClothingItem>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (updates.name !== undefined) body.name = updates.name;
  if (updates.category !== undefined) body.category = updates.category;
  if (updates.color !== undefined) body.color = updates.color;
  if (updates.colorHex !== undefined) body.colorHex = updates.colorHex;
  if (updates.season !== undefined) body.season = updates.season;
  if (updates.style !== undefined) body.style = updates.style;
  if (updates.imageUrl !== undefined) body.imageUrl = updates.imageUrl;
  if (updates.warmthLevel !== undefined) body.warmthLevel = updates.warmthLevel;
  if (updates.waterproof !== undefined) body.waterproof = updates.waterproof;
  if (updates.favorite !== undefined) body.favorite = updates.favorite;
  if (updates.photoCapturedAt !== undefined) body.photoCapturedAt = updates.photoCapturedAt;
  if (updates.photoLat !== undefined) body.photoLat = updates.photoLat;
  if (updates.photoLng !== undefined) body.photoLng = updates.photoLng;
  if (updates.photoPlaceLabel !== undefined) body.photoPlaceLabel = updates.photoPlaceLabel;
  return body;
}

interface AppState {
  hydrated: boolean;
  user: UserProfile;
  wardrobe: ClothingItem[];
  memories: OutfitMemory[];
  trips: TripPlan[];
  inspirations: StyleInspo[];
  feedbackStats: FeedbackStats;
  isOnboarded: boolean;

  reset: () => void;
  bootstrap: () => Promise<void>;

  setUser: (user: Partial<UserProfile>) => Promise<SetUserResult>;
  setOnboarded: (v: boolean) => void;

  addClothingItem: (
    item: Omit<ClothingItem, "id" | "dateAdded" | "wearCount">
  ) => Promise<void>;
  removeClothingItem: (id: string) => Promise<void>;
  updateClothingItem: (id: string, updates: Partial<ClothingItem>) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;

  addMemory: (memory: Omit<OutfitMemory, "id">) => Promise<void>;
  removeMemory: (id: string) => Promise<void>;

  addTrip: (trip: Omit<TripPlan, "id">) => Promise<void>;
  updateTrip: (id: string, updates: Partial<TripPlan>) => Promise<void>;
  removeTrip: (id: string) => Promise<void>;

  submitOutfitFeedback: (input: {
    liked: boolean;
    itemIds: string[];
    weather: WeatherData;
  }) => Promise<boolean>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      user: emptyUser,
      wardrobe: [],
      memories: [],
      trips: [],
      inspirations: [],
      feedbackStats: { total: 0, thumbsUp: 0 },
      isOnboarded: false,

      reset: () =>
        set({
          hydrated: false,
          user: emptyUser,
          wardrobe: [],
          memories: [],
          trips: [],
          inspirations: [],
          feedbackStats: { total: 0, thumbsUp: 0 },
        }),

      bootstrap: async () => {
        const controller = new AbortController();
        const timeoutMs = 25_000;
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const res = await fetch("/api/me", {
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          });
          if (!res.ok) {
            set({ hydrated: true });
            return;
          }
          const data = (await res.json()) as {
            user: UserProfile;
            wardrobe: ClothingItem[];
            memories: OutfitMemory[];
            trips: TripPlan[];
            inspirations: StyleInspo[];
            feedbackStats?: FeedbackStats;
          };
          set({
            user: data.user,
            wardrobe: data.wardrobe,
            memories: data.memories,
            trips: data.trips,
            inspirations: data.inspirations,
            feedbackStats: data.feedbackStats ?? { total: 0, thumbsUp: 0 },
            hydrated: true,
          });
        } catch {
          set({ hydrated: true });
        } finally {
          clearTimeout(timeoutId);
        }
      },

      setOnboarded: (v) => set({ isOnboarded: v }),

      setUser: async (updates) => {
        const payload = Object.fromEntries(
          Object.entries({
            name: updates.name,
            email: updates.email,
            location: updates.location,
            latitude: updates.latitude,
            longitude: updates.longitude,
            temperatureUnit: updates.temperatureUnit,
            preferredStyles: updates.preferredStyles,
          }).filter(([, v]) => v !== undefined)
        );
        const res = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          let message = `Could not save profile (${res.status}).`;
          try {
            const err = (await res.json()) as { error?: string };
            if (typeof err.error === "string" && err.error.trim()) {
              message = err.error.trim();
            } else if (res.status === 401) {
              message =
                "Not signed in or session expired. Sign out and sign in again. On Vercel, set AUTH_URL to this exact site URL (no trailing slash) and redeploy.";
            } else if (res.status === 400) {
              message = "Invalid profile data. Check your inputs and try again.";
            } else if (res.status >= 500) {
              message = "Server error while saving. Try again in a moment.";
            }
          } catch {
            if (res.status === 401) {
              message =
                "Session not accepted by the server. Sign out, sign in again, and verify AUTH_URL on Vercel matches this domain.";
            }
          }
          console.error("Profile update failed:", res.status, message);
          return { ok: false, error: message };
        }
        const data = (await res.json()) as { user: UserProfile };
        set({ user: data.user });
        return { ok: true };
      },

      addClothingItem: async (item) => {
        const res = await fetch("/api/wardrobe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: item.name,
            category: item.category,
            color: item.color,
            colorHex: item.colorHex,
            season: item.season,
            style: item.style,
            imageUrl: item.imageUrl,
            warmthLevel: item.warmthLevel,
            waterproof: item.waterproof,
            favorite: item.favorite ?? false,
            ...(item.photoCapturedAt && { photoCapturedAt: item.photoCapturedAt }),
            ...(item.photoLat != null && { photoLat: item.photoLat }),
            ...(item.photoLng != null && { photoLng: item.photoLng }),
            ...(item.photoPlaceLabel && { photoPlaceLabel: item.photoPlaceLabel }),
          }),
        });
        if (!res.ok) return;
        const data = (await res.json()) as { item: ClothingItem };
        set((s) => ({ wardrobe: [data.item, ...s.wardrobe] }));
      },

      removeClothingItem: async (id) => {
        const res = await fetch(`/api/wardrobe/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) return;
        set((s) => ({ wardrobe: s.wardrobe.filter((i) => i.id !== id) }));
      },

      updateClothingItem: async (id, updates) => {
        const res = await fetch(`/api/wardrobe/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(patchBodyFromClothing(updates)),
        });
        if (!res.ok) return;
        const data = (await res.json()) as { item: ClothingItem };
        set((s) => ({
          wardrobe: s.wardrobe.map((i) => (i.id === id ? data.item : i)),
        }));
      },

      toggleFavorite: async (id) => {
        const item = get().wardrobe.find((i) => i.id === id);
        if (!item) return;
        await get().updateClothingItem(id, { favorite: !item.favorite });
      },

      addMemory: async (memory) => {
        const res = await fetch("/api/memories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            outfit: memory.outfit,
            photoUrl: memory.photoUrl,
            location: memory.location,
            locationCoords: memory.locationCoords,
            weather: memory.weather,
            date: memory.date,
            mood: memory.mood,
            notes: memory.notes,
          }),
        });
        if (!res.ok) return;
        const data = (await res.json()) as { memory: OutfitMemory };
        set((s) => ({ memories: [data.memory, ...s.memories] }));
      },

      removeMemory: async (id) => {
        const res = await fetch(`/api/memories/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) return;
        set((s) => ({ memories: s.memories.filter((m) => m.id !== id) }));
      },

      addTrip: async (trip) => {
        const res = await fetch("/api/trips", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(trip),
        });
        if (!res.ok) return;
        const data = (await res.json()) as { trip: TripPlan };
        set((s) => ({ trips: [...s.trips, data.trip] }));
      },

      updateTrip: async (id, updates) => {
        const res = await fetch(`/api/trips/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(updates),
        });
        if (!res.ok) return;
        const data = (await res.json()) as { trip: TripPlan };
        set((s) => ({
          trips: s.trips.map((t) => (t.id === id ? data.trip : t)),
        }));
      },

      removeTrip: async (id) => {
        const res = await fetch(`/api/trips/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) return;
        set((s) => ({ trips: s.trips.filter((t) => t.id !== id) }));
      },

      submitOutfitFeedback: async ({ liked, itemIds, weather }) => {
        const res = await fetch("/api/outfit-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ liked, itemIds, weather }),
        });
        if (!res.ok) return false;
        const data = (await res.json()) as { feedbackStats: FeedbackStats };
        set({ feedbackStats: data.feedbackStats });
        return true;
      },
    }),
    {
      name: "stylesense-ui",
      partialize: (state) => ({ isOnboarded: state.isOnboarded }),
    }
  )
);
