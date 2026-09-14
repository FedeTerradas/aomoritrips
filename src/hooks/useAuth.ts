"use client";

import { useState, useEffect, useCallback } from "react";

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
}

export interface UserStats {
  tripsCount: number;
  countriesCount: number;
  kilometersCount: string;
}

export interface AuthProfile {
  id: string;
  fullName: string;
  avatarKanji: string;
  statusLevel: string;
  passportNumberMasked: string;
  passportExpiry: string;
  nationality: string;
  preferredCurrency: string;
  preferredLanguage: string;
  paymentMethods?: Array<{
    id: string;
    cardBrand: string;
    last4: string;
    billingCycle: string;
    vaultToken: string;
    isDefault: boolean;
  }>;
}

const AUTH_EVENT_NAME = "aomori-auth-changed";

export function useAuth() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({
    tripsCount: 0,
    countriesCount: 0,
    kilometersCount: "0 km",
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setProfile(data.profile);
        if (data.stats) setStats(data.stats);
      } else {
        setUser(null);
        setProfile(null);
        setStats({ tripsCount: 0, countriesCount: 0, kilometersCount: "0 km" });
      }
    } catch (err) {
      console.warn("[useAuth] Error al consultar sesión:", err);
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();

    const handleAuthEvent = () => {
      fetchCurrentUser();
    };

    window.addEventListener(AUTH_EVENT_NAME, handleAuthEvent);
    return () => {
      window.removeEventListener(AUTH_EVENT_NAME, handleAuthEvent);
    };
  }, [fetchCurrentUser]);

  const notifyAuthChange = () => {
    window.dispatchEvent(new Event(AUTH_EVENT_NAME));
  };

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "No se pudo iniciar sesión");
    }
    setUser(data.user);
    setProfile(data.profile);
    notifyAuthChange();
    return data;
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "No se pudo registrar la cuenta");
    }
    setUser(data.user);
    setProfile(data.profile);
    notifyAuthChange();
    return data;
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setProfile(null);
    setStats({ tripsCount: 0, countriesCount: 0, kilometersCount: "0 km" });
    notifyAuthChange();
  };

  return {
    user,
    profile,
    stats,
    isLoading,
    login,
    register,
    logout,
    refetch: fetchCurrentUser,
  };
}
