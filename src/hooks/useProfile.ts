"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TravelerProfile,
  DEFAULT_PROFILE,
  getStoredProfile,
  saveStoredProfile,
  resetStoredProfile,
  PROFILE_EVENT_NAME,
} from "@/lib/profile";

export function useProfile() {
  const [profile, setProfile] = useState<TravelerProfile>(DEFAULT_PROFILE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setProfile(getStoredProfile());
    setIsLoaded(true);

    const handleUpdate = () => {
      setProfile(getStoredProfile());
    };

    window.addEventListener(PROFILE_EVENT_NAME, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(PROFILE_EVENT_NAME, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const updateProfile = useCallback((partial: Partial<TravelerProfile>) => {
    const updated = saveStoredProfile(partial);
    setProfile(updated);
    return updated;
  }, []);

  const resetProfile = useCallback(() => {
    const reset = resetStoredProfile();
    setProfile(reset);
    return reset;
  }, []);

  return {
    profile,
    isLoaded,
    updateProfile,
    resetProfile,
  };
}
