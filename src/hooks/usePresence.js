import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

export function usePresence(presencePayload) {
  const [users, setUsers] = useState([]);
  const channelRef = useRef(null);
  const trackTimeoutRef = useRef(null);

  useEffect(() => {
    const channel = supabase.channel("hmc-status-board", {
      config: { presence: { key: presencePayload?.userId || "anon" } },
    });

    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const all = Object.values(state).flat();
      setUsers(all);
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED" && presencePayload?.userId) {
        await channel.track(presencePayload);
      }
    });

    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-track when payload changes (debounced 1s)
  useEffect(() => {
    if (!presencePayload?.userId || !channelRef.current) return;
    clearTimeout(trackTimeoutRef.current);
    trackTimeoutRef.current = setTimeout(() => {
      channelRef.current.track(presencePayload);
    }, 1000);
    return () => clearTimeout(trackTimeoutRef.current);
  }, [presencePayload]);

  return users;
}
