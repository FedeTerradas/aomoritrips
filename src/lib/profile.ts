/**
 * Módulo de persistencia y configuración de Perfil de Viajero (AomoriTrips)
 * Basado en el prototipo Figma de la Unidad 4 (aomoritrips_perfil.png)
 * y cumplimiento de seguridad PCI-DSS v4.0.
 */

export type BillingCycle = "Mensual" | "Por Reserva";
export type Currency = "USD" | "JPY" | "EUR" | "ARS";

export interface PaymentCardInfo {
  id?: string;
  cardBrand: string;
  last4: string;
  billingCycle: BillingCycle;
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
  paymentMethod: PaymentCardInfo | null;
  paymentMethods: PaymentCardInfo[];
  currency: Currency;
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
  paymentMethod: null,
  paymentMethods: [],
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

    // Sanitización de tarjetas mock históricas (Figma default)
    let paymentMethod: PaymentCardInfo | null = parsed.paymentMethod || null;
    let paymentMethods: PaymentCardInfo[] = Array.isArray(parsed.paymentMethods)
      ? parsed.paymentMethods
      : [];

    if (
      paymentMethod &&
      (paymentMethod.vaultToken === "tok_vault_visa_4821_default" ||
        paymentMethod.last4 === "4821")
    ) {
      paymentMethod = null;
    }

    paymentMethods = paymentMethods.filter(
      (pm: PaymentCardInfo) =>
        pm.vaultToken !== "tok_vault_visa_4821_default" && pm.last4 !== "4821"
    );

    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      paymentMethod,
      paymentMethods,
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

    let resolvedPaymentMethod: PaymentCardInfo | null = current.paymentMethod;
    if ("paymentMethod" in updatedProfile) {
      resolvedPaymentMethod = updatedProfile.paymentMethod ?? null;
    }

    const resolvedPaymentMethods: PaymentCardInfo[] =
      "paymentMethods" in updatedProfile &&
      Array.isArray(updatedProfile.paymentMethods)
        ? updatedProfile.paymentMethods
        : current.paymentMethods;

    const merged: TravelerProfile = {
      ...current,
      ...updatedProfile,
      paymentMethod: resolvedPaymentMethod,
      paymentMethods: resolvedPaymentMethods,
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

export function clearStoredPaymentMethods(): TravelerProfile {
  return saveStoredProfile({ paymentMethod: null, paymentMethods: [] });
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
