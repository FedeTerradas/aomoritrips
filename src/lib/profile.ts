/**
 * Módulo de persistencia y configuración de Perfil de Viajero (AomoriTrips)
 * Basado en el prototipo Figma de la Unidad 4 (aomoritrips_perfil.png)
 * y cumplimiento de seguridad PCI-DSS v4.0.
 */

export interface PaymentCardInfo {
  id?: string;
  cardBrand: string;
  last4: string;
  billingCycle: string; // "Mensual" | "Por Reserva"
  vaultToken?: string;
  isDefault?: boolean;
}

export interface TravelerProfile {
  name: string;
  avatarKanji: string;
  statusLevel: string;
  tripsCount: number;
  countriesCount: number;
  kilometersCount: string;
  paymentMethod: PaymentCardInfo;
  paymentMethods?: PaymentCardInfo[];
  currency: string; // "USD" | "JPY" | "EUR" | "ARS"
  passport: {
    number: string;
    expiry: string;
    nationality: string;
  };
  language: "ES" | "EN" | "JA";
}

export const DEFAULT_PROFILE: TravelerProfile = {
  name: "Hana Yamamoto",
  avatarKanji: "花",
  statusLevel: "🌸 Viajero Sakura · Nv. 3",
  tripsCount: 7,
  countriesCount: 4,
  kilometersCount: "23k km",
  paymentMethod: {
    cardBrand: "Visa",
    last4: "4821",
    billingCycle: "Mensual",
    vaultToken: "tok_vault_visa_4821_default",
    isDefault: true,
  },
  paymentMethods: [
    {
      id: "pm_default_1",
      cardBrand: "Visa",
      last4: "4821",
      billingCycle: "Mensual",
      vaultToken: "tok_vault_visa_4821_default",
      isDefault: true,
    },
  ],
  currency: "USD",
  passport: {
    number: "ES · A4829311",
    expiry: "Jun 2030",
    nationality: "España",
  },
  language: "ES",
};

const STORAGE_KEY = "aomoritrips_profile";
export const PROFILE_EVENT_NAME = "aomori-profile-updated";

export function getStoredProfile(): TravelerProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      paymentMethod: {
        ...DEFAULT_PROFILE.paymentMethod,
        ...(parsed.paymentMethod || {}),
      },
      paymentMethods: parsed.paymentMethods || DEFAULT_PROFILE.paymentMethods,
      passport: {
        ...DEFAULT_PROFILE.passport,
        ...(parsed.passport || {}),
      },
    };
  } catch (err) {
    console.warn("Error al leer perfil de LocalStorage:", err);
    return DEFAULT_PROFILE;
  }
}

export function saveStoredProfile(
  updatedProfile: Partial<TravelerProfile>
): TravelerProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const current = getStoredProfile();
    const merged: TravelerProfile = {
      ...current,
      ...updatedProfile,
      paymentMethod: {
        ...current.paymentMethod,
        ...(updatedProfile.paymentMethod || {}),
      },
      paymentMethods: updatedProfile.paymentMethods || current.paymentMethods,
      passport: {
        ...current.passport,
        ...(updatedProfile.passport || {}),
      },
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));

    window.dispatchEvent(
      new CustomEvent(PROFILE_EVENT_NAME, {
        detail: { profile: merged },
      })
    );

    return merged;
  } catch (err) {
    console.error("Error al guardar perfil en LocalStorage:", err);
    return DEFAULT_PROFILE;
  }
}

export function resetStoredProfile(): TravelerProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent(PROFILE_EVENT_NAME, {
        detail: { profile: DEFAULT_PROFILE },
      })
    );
    return DEFAULT_PROFILE;
  } catch (err) {
    console.error("Error al resetear perfil:", err);
    return DEFAULT_PROFILE;
  }
}
