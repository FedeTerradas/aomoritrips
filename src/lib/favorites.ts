/**
 * Módulo de persistencia y sincronización de Favoritos (AomoriTrips)
 * Almacenamiento seguro en LocalStorage con soporte SSR y sincronización entre componentes.
 */

const STORAGE_KEY = "aomoritrips_favorites";
export const FAVORITES_EVENT_NAME = "aomori-favorites-updated";

/**
 * Obtiene la lista de IDs de paquetes favoritos desde LocalStorage
 */
export function getStoredFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Error al leer favoritos de LocalStorage:", err);
    return [];
  }
}

/**
 * Comprueba si un ID específico está guardado como favorito
 */
export function isPackFavorite(packId: string): boolean {
  const current = getStoredFavorites();
  return current.includes(packId);
}

/**
 * Alterna el estado de favorito de un paquete y notifica al DOM
 * @returns true si ahora es favorito, false si fue removido
 */
export function togglePackFavorite(packId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const current = getStoredFavorites();
    const index = current.indexOf(packId);
    let updated: string[];
    let isNowFav: boolean;

    if (index >= 0) {
      updated = current.filter((id) => id !== packId);
      isNowFav = false;
    } else {
      updated = [...current, packId];
      isNowFav = true;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Despachar evento para sincronizar Navbar, HeroBanner y cards en tiempo real
    window.dispatchEvent(
      new CustomEvent(FAVORITES_EVENT_NAME, {
        detail: { packId, isFavorite: isNowFav, favorites: updated },
      })
    );

    return isNowFav;
  } catch (err) {
    console.error("Error al guardar favorito en LocalStorage:", err);
    return false;
  }
}

/**
 * Limpia todos los favoritos guardados
 */
export function clearAllFavorites(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent(FAVORITES_EVENT_NAME, {
        detail: { favorites: [] },
      })
    );
  } catch (err) {
    console.error("Error al limpiar favoritos:", err);
  }
}
