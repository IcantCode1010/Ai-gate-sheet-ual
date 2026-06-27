import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

function latestShiftForUser(shifts, userId) {
  return shifts.find(shift => shift.user_id === userId) || null;
}

function sortByLatestShift(a, b) {
  const aTime = a.latestShift?.updated_at || a.created_at || "";
  const bTime = b.latestShift?.updated_at || b.created_at || "";
  return bTime.localeCompare(aTime);
}

export function useDashboardData() {
  const [profiles, setProfiles] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = useCallback(async () => {
    setError("");

    const [profileResult, shiftResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, display_name, created_at")
        .order("display_name", { ascending: true }),
      supabase
        .from("shifts")
        .select("id, user_id, date, shift_type, coordinator_name, notes, entries, updated_at")
        .order("updated_at", { ascending: false })
        .limit(250),
    ]);

    if (profileResult.error || shiftResult.error) {
      setError(profileResult.error?.message || shiftResult.error?.message || "Dashboard failed to load.");
      setLoading(false);
      return;
    }

    setProfiles(profileResult.data || []);
    setShifts(shiftResult.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDashboardData();

    const channel = supabase
      .channel("hmc-dashboard-data")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, loadDashboardData)
      .on("postgres_changes", { event: "*", schema: "public", table: "shifts" }, loadDashboardData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadDashboardData]);

  const users = useMemo(() => {
    return profiles
      .map(profile => {
        const userShifts = shifts.filter(shift => shift.user_id === profile.id);
        const latestShift = latestShiftForUser(userShifts, profile.id);

        return {
          ...profile,
          shifts: userShifts,
          latestShift,
          totalCalls: userShifts.reduce((total, shift) => {
            return total + (Array.isArray(shift.entries) ? shift.entries.length : 0);
          }, 0),
        };
      })
      .sort(sortByLatestShift);
  }, [profiles, shifts]);

  return {
    users,
    shifts,
    loading,
    error,
    reload: loadDashboardData,
  };
}
