"use client";

import { useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { eventsToCommandState } from "./normalize";
import type { CommandState, VerifiedEvent } from "./types";

function gatewayOrigin() {
  if (typeof window === "undefined") return "http://localhost:4000";
  return `http://${window.location.hostname || "localhost"}:4000`;
}

export function useCommandFeed(liveEvents: VerifiedEvent[]) {
  const [remote, setRemote] = useState<CommandState | null>(null);
  const [connected, setConnected] = useState(false);
  const [transport, setTransport] = useState<"socket" | "poll">("poll");

  useEffect(() => {
    const origin = gatewayOrigin();
    let socket: Socket | null = null;
    let cancelled = false;

    const pull = async () => {
      try {
        const res = await fetch(`${origin}/api/command-state`);
        if (!res.ok) throw new Error("command-state unavailable");
        const data = (await res.json()) as CommandState;
        if (!cancelled) {
          setRemote(data);
          setConnected(true);
        }
      } catch {
        if (!cancelled) setConnected(false);
      }
    };

    pull();

    try {
      socket = io(origin, {
        transports: ["websocket", "polling"],
        reconnectionAttempts: 8,
      });
      socket.on("connect", () => {
        setConnected(true);
        setTransport("socket");
      });
      socket.on("disconnect", () => {
        setTransport("poll");
      });
      socket.on("command:state", (data: CommandState) => {
        setRemote(data);
        setConnected(true);
        setTransport("socket");
      });
    } catch {
      setTimeout(() => setTransport("poll"), 0);
    }

    const poll = window.setInterval(() => {
      if (!socket?.connected) pull();
    }, 2500);

    return () => {
      cancelled = true;
      window.clearInterval(poll);
      socket?.disconnect();
    };
  }, []);

  const fallback = useMemo(() => eventsToCommandState(liveEvents), [liveEvents]);
  const state = remote && remote.structures?.length ? remote : fallback;

  return { state, connected, transport };
}
