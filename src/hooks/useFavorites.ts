"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getStoredFavorites,
  togglePackFavorite,
  isPackFavorite,
  clearAllFavorites,
  FAVORITES_EVENT_NAME,
} from "@/lib/favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Carga inicial segura para SSR / hidratación
    setFavorites(getStoredFavorites());
    setIsLoaded(true);

    const handleUpdate = () => {
      setFavorites(getStoredFavorites());
    };

    window.addEventListener(FAVORITES_EVENT_NAME, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(FAVORITES_EVENT_NAME, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const toggleFavorite = useCallback((packId: string) => {
    return togglePackFavorite(packId);
  }, []);

  const checkIsFavorite = useCallback(
    (packId: string) => {
      if (!isLoaded) return false;
      return favorites.includes(packId);
    },
    [favorites, isLoaded]
  );

  return {
    favorites,
    isLoaded,
    favoritesCount: favorites.length,
    toggleFavorite,
    isFavorite: checkIsFavorite,
    clearFavorites: clearAllFavorites,
  };
}
