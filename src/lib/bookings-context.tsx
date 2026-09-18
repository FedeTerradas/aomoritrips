/**
 * BookingsContext — Fuente única de verdad para reservas.
 *
 * Elimina el doble-fetch entre WalletView y ProfileView:
 * ambas consumen el mismo estado reactivo y las estadísticas
 * (trips, nivel, km) se calculan siempre sobre los mismos datos.
 *
 * Regla de negocio acordada:
 *   - Solo reservas con status "CONFIRMED" cuentan para stats de nivel.
 *   - Las canceladas se muestran en historial pero no suman métricas.
 */

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

export type BookingStatus = "CONFIRMED" | "PENDING" | "CANCELLED";

export interface BookingData {
  id: string;
  bookingCode: string;
  packId: string;
  packTitle: string;
  travelerName: string;
  travelerEmail: string;
  travelersCount: number;
  travelDate: string;
  seasonSelected: string;
  totalPriceUsd: number;
  status: BookingStatus;
  qrData: string;
  createdAt: string;
}

interface BookingsContextValue {
  /** Lista completa de reservas (CONFIRMED + CANCELLED + PENDING) */
  bookings: BookingData[];
  /** Solo las confirmadas — usadas para stats de nivel y badge */
  confirmedCount: number;
  isLoading: boolean;
  cancelFeedback: string;
  /** Re-fetcha desde la API */
  refresh: () => Promise<void>;
  /** Cancela una reserva y actualiza el estado local optimísticamente */
  cancelBooking: (bookingId: string) => Promise<void>;
}

const BookingsContext = createContext<BookingsContextValue | null>(null);

export function BookingsProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelFeedback, setCancelFeedback] = useState("");

  const confirmedCount = bookings.filter(
    (b) => b.status === "CONFIRMED"
  ).length;

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/bookings");
      const json = await res.json();
      if (json.success && json.data) {
        setBookings(json.data);
      }
    } catch (e) {
      console.error("[BookingsContext] Error al cargar reservas:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const cancelBooking = useCallback(async (bookingId: string) => {
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const json = await res.json();
      if (json.success) {
        // Actualización optimística: no re-fetchea, solo muta el estado local
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId ? { ...b, status: "CANCELLED" } : b
          )
        );
        setCancelFeedback("Reserva cancelada exitosamente");
      } else {
        setCancelFeedback(json.error || "Error al cancelar");
      }
    } catch (e) {
      console.error("[BookingsContext] Error al cancelar:", e);
      setCancelFeedback("Error de conexión al cancelar");
    } finally {
      setTimeout(() => setCancelFeedback(""), 4000);
    }
  }, []);

  return (
    <BookingsContext.Provider
      value={{
        bookings,
        confirmedCount,
        isLoading,
        cancelFeedback,
        refresh,
        cancelBooking,
      }}
    >
      {children}
    </BookingsContext.Provider>
  );
}

/** Hook de consumo. Lanza si se usa fuera del provider. */
export function useBookings(): BookingsContextValue {
  const ctx = useContext(BookingsContext);
  if (!ctx) {
    throw new Error("useBookings debe usarse dentro de <BookingsProvider>");
  }
  return ctx;
}
