import { useEffect, useRef, useState, useCallback } from "react";
import { useSheet } from "./useSheet";
import { supabase } from "../lib/supabase";

const DEBOUNCE_MS = 400;

export function useShiftSync(userId) {
  const sheetHook = useSheet();
  const { sheet, updateSheetField } = sheetHook;
  const [syncStatus, setSyncStatus] = useState("synced"); // 'synced' | 'syncing' | 'offline'
  const [shiftId, setShiftId] = useState(null);
  const debounceRef = useRef(null);
  const initializedRef = useRef(false);

  // On mount: load today's shift from Supabase
  useEffect(() => {
    if (!userId || initializedRef.current) return;
    initializedRef.current = true;

    async function loadTodayShift() {
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("shifts")
        .select("*")
        .eq("user_id", userId)
        .eq("date", today)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) { setSyncStatus("offline"); return; }

      if (data) {
        setShiftId(data.id);
        // Hydrate sheet from Supabase data
        updateSheetField("date", data.date);
        updateSheetField("shiftType", data.shift_type);
        updateSheetField("coordinatorName", data.coordinator_name);
        updateSheetField("notes", data.notes);
        updateSheetField("entries", data.entries || []);
      }
      setSyncStatus("synced");
    }

    loadTodayShift();
  }, [userId, updateSheetField]);

  // Debounced upsert on every sheet change
  useEffect(() => {
    if (!userId || !initializedRef.current) return;

    clearTimeout(debounceRef.current);
    setSyncStatus("syncing");

    debounceRef.current = setTimeout(async () => {
      const payload = {
        user_id: userId,
        date: sheet.date,
        shift_type: sheet.shiftType,
        coordinator_name: sheet.coordinatorName,
        notes: sheet.notes,
        entries: sheet.entries,
        updated_at: new Date().toISOString(),
      };

      if (shiftId) payload.id = shiftId;

      const { data, error } = await supabase
        .from("shifts")
        .upsert(payload)
        .select("id")
        .single();

      if (error) {
        setSyncStatus("offline");
      } else {
        if (!shiftId && data?.id) setShiftId(data.id);
        setSyncStatus("synced");
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [sheet, userId, shiftId]);

  // Reconnect sync
  useEffect(() => {
    function handleOnline() {
      setSyncStatus("syncing");
      // Trigger a re-sync by forcing a state touch via a no-op
      updateSheetField("notes", sheet.notes);
    }
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [sheet.notes, updateSheetField]);

  const loadShift = useCallback(async (id) => {
    const { data } = await supabase
      .from("shifts")
      .select("*")
      .eq("id", id)
      .single();
    if (!data) return;
    setShiftId(data.id);
    updateSheetField("date", data.date);
    updateSheetField("shiftType", data.shift_type);
    updateSheetField("coordinatorName", data.coordinator_name);
    updateSheetField("notes", data.notes);
    updateSheetField("entries", data.entries || []);
  }, [updateSheetField]);

  return { ...sheetHook, syncStatus, shiftId, loadShift };
}
