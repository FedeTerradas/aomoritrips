"use client";

import { useState, useEffect, useCallback } from "react";

export interface BucketListItem {
  id: string;
  itemType: string;
  refId: string;
  title: string;
  imageUrl?: string;
  notes?: string;
}

export function useBucketList() {
  const [items, setItems] = useState<BucketListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const getSessionToken = () => {
    if (typeof window === "undefined") return "";
    let token = localStorage.getItem("aomori_session_token");
    if (!token) {
      token = "sess_" + Math.random().toString(36).substring(2, 12);
      localStorage.setItem("aomori_session_token", token);
    }
    return token;
  };

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = getSessionToken();
      const res = await fetch("/api/bucket-list", {
        headers: {
          "x-session-token": token,
        },
      });
      const json = await res.json();
      if (json.success) {
        setItems(json.data);
      }
    } catch (e) {
      console.error("Error fetching bucket list:", e);
    } finally {
      setIsLoading(false);
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = async (params: {
    itemType: string;
    refId: string;
    title: string;
    imageUrl?: string;
    notes?: string;
  }) => {
    try {
      const token = getSessionToken();
      const res = await fetch("/api/bucket-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-token": token,
        },
        body: JSON.stringify(params),
      });
      const json = await res.json();
      if (json.success) {
        setItems((prev) => [json.data, ...prev]);
        return json.data;
      }
    } catch (e) {
      console.error("Error adding to bucket list:", e);
    }
  };

  const removeItem = async (id: string) => {
    try {
      const token = getSessionToken();
      const res = await fetch(`/api/bucket-list/${id}`, {
        method: "DELETE",
        headers: {
          "x-session-token": token,
        },
      });
      const json = await res.json();
      if (json.success) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (e) {
      console.error("Error removing from bucket list:", e);
    }
  };

  const removeByRefId = async (refId: string) => {
    const item = items.find((i) => i.refId === refId);
    if (item) {
      await removeItem(item.id);
    }
  };

  const isInList = useCallback(
    (refId: string) => {
      return items.some((item) => item.refId === refId);
    },
    [items]
  );

  return {
    items,
    isLoading,
    isLoaded,
    addItem,
    removeItem,
    removeByRefId,
    isInList,
    fetchItems,
  };
}
