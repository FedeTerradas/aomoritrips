"use client";

import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import type { TravelerProfile } from "@/lib/profile";
import type { UserSession, UserStats } from "@/hooks/useAuth";

export interface TravelerDisplayData {
  isGuest: boolean;
  displayName: string;
  displayAvatar: string;
  displayTrips: number;
  displayCountries: number;
  displayKilometers: string;
  displayLevel: string;
  profile: TravelerProfile;
  updateProfile: (partial: Partial<TravelerProfile>) => TravelerProfile;
  resetProfile: () => TravelerProfile;
  isLoaded: boolean;
  user: UserSession | null;
  stats: UserStats;
}

/**
 * Hook unificado de presentación y métricas de viajero.
 * Elimina duplicación de lógica entre WalletView y ProfileView (Fowler Refactoring).
 */
export function useTravelerDisplay(
  bookingsCount: number = 0
): TravelerDisplayData {
  const { profile, updateProfile, resetProfile, isLoaded } = useProfile();
  const { user, stats } = useAuth();

  const isGuest =
    !user &&
    (!profile.name ||
      profile.name === "Hana Yamamoto" ||
      profile.name === "Invitado");

  const displayName = user ? user.name : isGuest ? "Invitado" : profile.name;

  const displayAvatar = user
    ? user.name.charAt(0).toUpperCase()
    : isGuest
      ? "客"
      : profile.avatarKanji || "花";

  const displayTrips = user ? stats.tripsCount : bookingsCount;

  const displayCountries = user
    ? stats.countriesCount
    : bookingsCount > 0
      ? 1
      : 0;

  const displayKilometers = user
    ? stats.kilometersCount
    : bookingsCount > 0
      ? `${(bookingsCount * 1.4).toFixed(1)}k km`
      : "0 km";

  const displayLevel = user
    ? stats.tripsCount === 0
      ? "🌱 Nuevo Viajero · Nv. 1"
      : stats.tripsCount <= 2
        ? "🌸 Viajero Sakura · Nv. 2"
        : "🏮 Explorador Nebuta · Nv. 3"
    : bookingsCount === 0
      ? "🌱 Modo Explorador Invitado"
      : "🌸 Viajero Sakura · Nv. 2";

  return {
    isGuest,
    displayName,
    displayAvatar,
    displayTrips,
    displayCountries,
    displayKilometers,
    displayLevel,
    profile,
    updateProfile,
    resetProfile,
    isLoaded,
    user,
    stats,
  };
}
