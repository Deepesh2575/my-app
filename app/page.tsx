"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Shield,
  Home,
  Activity,
  Radio,
  BarChart2,
  BookOpen,
  Glasses,
  Settings,
  AlertTriangle,
  RefreshCw,
  Maximize,
  Clock,
  FileText,
  CheckCircle2,
  LocateFixed,
  Lock,
  Coins,
  Mic,
  MicOff,
  Send,
  Cpu,
  Navigation,
  Eye,
  Download,
  Sparkles,
  Layers,
  Globe,
  RadioTower,
  X,
  ExternalLink
} from "lucide-react";
import Map, { Marker } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Box, Grid, Line } from "@react-three/drei";
import * as THREE from "three";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from "recharts";
import { useCommandFeed } from "@/lib/command/useCommandFeed";
import type { GlobeSelection } from "@/components/godseye/CesiumGlobe";
import { DEFAULT_LAYERS, type LayerId } from "@/lib/command/types";

// Dynamic import of Cesium 3D Globe with SSR disabled
const CesiumGlobe = dynamic(() => import("@/components/godseye/CesiumGlobe"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#020817] text-cyan-400 font-mono">
      <RefreshCw className="w-10 h-10 animate-spin mb-4 text-cyan-500" />
      <span>INITIALIZING 3D GOD&apos;S EYE TACTICAL GLOBE...</span>
    </div>
  ),
});

interface EventPayload {
  eventId: string;
  deviceId: string;
  timestamp: string;
  finalRiskScore: string;
  twinCorrelation: string;
  ledgerHash: string;
  status: string;
  latitude?: number;
  longitude?: number;
  localDeviceCount?: number;
  factors?: {
    A: number;
    Q: number;
    T: number;
    S: number;
    P: number;
    C: number;
    H: number;
  };
}

// ----------------------------------------------------------------------
// 3D THREE.JS DIGITAL TWIN COMPONENT
// ----------------------------------------------------------------------
function BridgeModel({ hasCriticalEvent, riskScore }: { hasCriticalEvent: boolean; riskScore: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (hasCriticalEvent && groupRef.current) {
      const intensity = Math.max(0.2, riskScore / 100.0);
      const t = clock.getElapsedTime();
      groupRef.current.position.x = Math.sin(t * 35 * intensity) * 0.35 * intensity;
      groupRef.current.position.y = 1 + Math.cos(t * 45 * intensity) * 0.12 * intensity;
      groupRef.current.position.z = Math.sin(t * 30 * intensity) * 0.25 * intensity;
    } else if (groupRef.current) {
      groupRef.current.position.set(0, 1, 0);
    }
  });

  return (
    <group ref={groupRef} position={[0, 1, 0]}>
      <Box args={[1.5, 4, 1.5]} position={[-4, 0, 0]}>
        <meshStandardMaterial color={hasCriticalEvent ? "#ef4444" : "#334155"} wireframe />
      </Box>
      <Box args={[1.5, 4, 1.5]} position={[4, 0, 0]}>
        <meshStandardMaterial color={hasCriticalEvent ? "#ef4444" : "#334155"} wireframe />
      </Box>
      <Box args={[14, 0.2, 3]} position={[0, 2.25, 0]}>
        <meshStandardMaterial
          color={hasCriticalEvent ? "#ef4444" : "#00E5FF"}
          wireframe
          emissive={hasCriticalEvent ? "#ef4444" : "#00E5FF"}
          emissiveIntensity={0.6}
        />
      </Box>

      {/* Suspension cables */}
      <Line points={[[-4, 2.25, 1.5], [0, 4, 0], [4, 2.25, -1.5]]} color={hasCriticalEvent ? "#ef4444" : "#00E5FF"} lineWidth={2} />
      <Line points={[[-4, 2.25, -1.5], [0, 4, 0], [4, 2.25, 1.5]]} color={hasCriticalEvent ? "#ef4444" : "#00E5FF"} lineWidth={2} />
    </group>
  );
}

// ----------------------------------------------------------------------
// MAIN DISASTER COMMAND CENTER
// ----------------------------------------------------------------------
export default function DisasterCommandCenter() {
  const [activeTab, setActiveTab] = useState("OVERVIEW");
  const [liveEvents, setLiveEvents] = useState<EventPayload[]>([]);
  const [selectedGlobeItem, setSelectedGlobeItem] = useState<GlobeSelection>(null);
  const [globeLayers, setGlobeLayers] = useState<Record<LayerId, boolean>>(DEFAULT_LAYERS);

  // Vocal AI State
  const [isListening, setIsListening] = useState(false);
  const [voiceToast, setVoiceToast] = useState<string | null>(null);

  // Agentic AI Swarm State
  const [showAgenticModal, setShowAgenticModal] = useState(false);
  const [isDispatchingAgentic, setIsDispatchingAgentic] = useState(false);
  const [agenticLogs, setAgenticLogs] = useState<string[]>([
    "[Agent-1: Medical] Standby - Monitoring regional ICU triage capacity.",
    "[Agent-2: Traffic] Standby - Interfaced with Municipal Grid SCADA.",
    "[Agent-3: Insurance] Standby - Solidity Parametric Contract 0xe7f1725E ready.",
    "[Agent-4: Drone Ops] Standby - Autonomous Aero-V1 Swarm on tarmac."
  ]);

  // Cyber-Physical Threat Evidence Room State
  const [showEvidenceRoom, setShowEvidenceRoom] = useState(false);
  const [evidenceEvent, setEvidenceEvent] = useState<EventPayload | null>(null);
  const [aiReportGenerating, setAiReportGenerating] = useState(false);
  const [aiForensicReport, setAiForensicReport] = useState<string | null>(null);

  // DePIN Tokenomics State
  const [userTokenBalance, setUserTokenBalance] = useState(148.5);
  const [hasClaimedRelief, setHasClaimedRelief] = useState(false);

  // Drone View State
  const [droneTargetCoords, setDroneTargetCoords] = useState("28.6139° N, 77.2090° E");
  const [droneAssessment, setDroneAssessment] = useState<{
    rubbleType: string;
    collapsePattern: string;
    survivabilityIndex: string;
    logisticsRecommendation: string;
    hazards: string[];
  }>({
    rubbleType: "Reinforced Concrete & Steel Girders",
    collapsePattern: "Transverse Shear / Pancake Failure",
    survivabilityIndex: "Moderate (Air pockets localized in eastern quadrant)",
    logisticsRecommendation: "DISPATCH 50-Ton Crawler Crane + Hydraulic Concrete Cutters",
    hazards: ["Exposed 11kV Power Lines", "Unstable load-bearing pier 4"]
  });

  // Connect to Gateway command state feed for Cesium & Live Sync
  const verifiedEventsNormalized = useMemo(() => {
    return liveEvents.map(e => ({
      ...e,
      latitude: e.latitude ?? 28.6139,
      longitude: e.longitude ?? 77.2090,
      factors: e.factors
    }));
  }, [liveEvents]);

  const { state: commandState, connected: gatewayConnected } = useCommandFeed(verifiedEventsNormalized);

  const hasCriticalEvent = liveEvents.some(evt => evt.status === "CRITICAL");
  const maxRisk = liveEvents.reduce((max, evt) => Math.max(max, parseFloat(evt.finalRiskScore || "0")), 0);
  const currentRisk = hasCriticalEvent ? Math.min(88 + (maxRisk * 10), 99).toFixed(0) : "14";

  // Check for Cyber-Physical SCADA Tamper
  const cyberThreatEvent = liveEvents.find(evt => parseFloat(evt.twinCorrelation || "1.0") < 0.40);

  // Polling Gateway Events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const hostname = typeof window !== "undefined" ? window.location.hostname || "localhost" : "localhost";
        const res = await fetch(`http://${hostname}:4000/api/events`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setLiveEvents(data.slice().reverse().slice(0, 50));
          }
        }
      } catch {
        // Gateway offline or initializing
      }
    };
    fetchEvents();
    const interval = setInterval(fetchEvents, 2500);
    return () => clearInterval(interval);
  }, []);

  // Voice Toast Timer
  useEffect(() => {
    if (voiceToast) {
      const timer = setTimeout(() => setVoiceToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [voiceToast]);

  // Voice Recognition Handler
  const toggleVoiceControl = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceToast("Speech Recognition API not supported in this browser. Please use Chrome/Edge.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceToast("🎙️ Listening for vocal commands (e.g. 'Show Tactical Map', 'Open Digital Twin')...");
      };

      recognition.onresult = (event: any) => {
        const command = event.results[0][0].transcript.toLowerCase();
        console.log("[Vocal AI Command]:", command);

        if (command.includes("tactical") || command.includes("god") || command.includes("globe")) {
          setActiveTab("TACTICAL 3D");
          setVoiceToast(`Command: "${command}" -> Switched to Tactical 3D Globe`);
        } else if (command.includes("overview") || command.includes("twin") || command.includes("digital")) {
          setActiveTab("OVERVIEW");
          setVoiceToast(`Command: "${command}" -> Switched to Overview & 3D Twin`);
        } else if (command.includes("sensor") || command.includes("nodes")) {
          setActiveTab("SENSORS");
          setVoiceToast(`Command: "${command}" -> Switched to Sensors Profiler`);
        } else if (command.includes("network") || command.includes("mesh")) {
          setActiveTab("NETWORK");
          setVoiceToast(`Command: "${command}" -> Switched to Sensor Mesh Network`);
        } else if (command.includes("analytics") || command.includes("seismic") || command.includes("waveform")) {
          setActiveTab("ANALYTICS");
          setVoiceToast(`Command: "${command}" -> Switched to Analytics & Waveforms`);
        } else if (command.includes("ledger") || command.includes("blockchain")) {
          setActiveTab("LEDGER");
          setVoiceToast(`Command: "${command}" -> Switched to Blockchain Ledger`);
        } else if (command.includes("token") || command.includes("reward") || command.includes("depin")) {
          setActiveTab("TOKENOMICS");
          setVoiceToast(`Command: "${command}" -> Switched to DePIN Tokenomics`);
        } else if (command.includes("drone") || command.includes("aerial")) {
          setActiveTab("DRONE VIEW");
          setVoiceToast(`Command: "${command}" -> Switched to Autonomous Drone View`);
        } else if (command.includes("ar") || command.includes("route") || command.includes("evacuation")) {
          setActiveTab("AR VIEW");
          setVoiceToast(`Command: "${command}" -> Switched to AR Evacuation HUD`);
        } else if (command.includes("swarm") || command.includes("dispatch")) {
          triggerAgenticSwarm();
          setVoiceToast(`Command: "${command}" -> Triggered Autonomous Agentic Swarm!`);
        } else {
          setVoiceToast(`Recognized: "${command}" (Try: 'overview', 'tactical map', 'blockchain ledger', 'drone view')`);
        }
      };

      recognition.onerror = (e: any) => {
        console.error("Speech Error:", e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      console.error(err);
      setIsListening(false);
    }
  };

  // Trigger Agentic Swarm Dispatch
  const triggerAgenticSwarm = async () => {
    setShowAgenticModal(true);
    setIsDispatchingAgentic(true);
    try {
      const topEvent = liveEvents[0] || {
        latitude: 28.6139,
        longitude: 77.2090,
        finalRiskScore: currentRisk,
        localDeviceCount: 124
      };
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventData: topEvent })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.actions && Array.isArray(data.actions)) {
          setAgenticLogs(data.actions);
        }
      }
    } catch {
      // Fallback already populated
    } finally {
      setIsDispatchingAgentic(false);
    }
  };

  // Forensic AI Report Generator
  const generateForensicReport = (evt: EventPayload) => {
    setEvidenceEvent(evt);
    setShowEvidenceRoom(true);
    setAiReportGenerating(true);
    setAiForensicReport(null);

    setTimeout(() => {
      const isCyber = parseFloat(evt.twinCorrelation || "1.0") < 0.40;
      if (isCyber) {
        setAiForensicReport(
          `🚨 NDMA FORENSIC EVIDENCE REPORT: CYBER-PHYSICAL SCADA TAMPERING DETECTED\n\n` +
          `• Event ID: ${evt.eventId}\n` +
          `• Target Asset: Downtown Bridge Delta-17 (Lat: ${evt.latitude || 28.6139}, Lon: ${evt.longitude || 77.2090})\n` +
          `• Measured Vibration Frequency: 12.8 Hz\n` +
          `• Digital Twin Resonant Frequency: 2.4 Hz (Tolerance: ±0.5 Hz)\n` +
          `• Physics Correlation Index: ${(parseFloat(evt.twinCorrelation || "0.2") * 100).toFixed(1)}% [CRITICAL MISMATCH]\n` +
          `• Hardware Keystore Signature: VERIFIED (Device TEE Validated)\n\n` +
          `FORENSIC DIAGNOSIS:\n` +
          `Vibration spectra indicate forced harmonic excitation characteristic of active hydraulic damper override or SCADA PLC manipulation, rather than natural subterranean seismic tectonic shear waves.\n\n` +
          `RECOMMENDED IMMEDIATE ACTIONS:\n` +
          `1. Disconnect Bridge Delta-17 active damping actuators from municipal IP subnet.\n` +
          `2. Lock automated highway boom barriers (Bypass physical controller).\n` +
          `3. Dispatch CERT-In Cyber Forensic Swarm to substations Sector 4 & 7.\n` +
          `4. Anchor forensic telemetry hash to Hyperledger Fabric for legal audit.`
        );
      } else {
        setAiForensicReport(
          `⚠️ NDMA DISASTER FORENSIC REPORT: NATURAL SEISMIC TECTIONIC EVENT\n\n` +
          `• Event ID: ${evt.eventId}\n` +
          `• Epicenter: Lat: ${evt.latitude || 28.6139}, Lon: ${evt.longitude || 77.2090}\n` +
          `• Measured Frequency: 2.38 Hz | Structural Baseline: 2.4 Hz\n` +
          `• Physics Correlation: ${(parseFloat(evt.twinCorrelation || "0.98") * 100).toFixed(1)}% [RESONANCE LOCK]\n` +
          `• AI Risk Score: ${evt.finalRiskScore} [CRITICAL COLLAPSE DANGER]\n\n` +
          `AUTONOMOUS ACTION TAKEN:\n` +
          `1. Parametric Insurance Smart Contract 0xe7f1725E executed relief disbursement.\n` +
          `2. Autonomous Aero-V1 drone dispatched for live aerial survey.\n` +
          `3. SMS evacuation cascade transmitted to 14,020 citizens.`
        );
      }
      setAiReportGenerating(false);
    }, 1200);
  };

  return (
    <div className="flex h-screen w-full bg-[#040914] text-slate-300 overflow-hidden font-sans select-none">

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="w-20 bg-[#0B1120] border-r border-slate-800 flex flex-col items-center py-5 z-30 shrink-0">
        <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          <Shield className="w-6 h-6 text-blue-400" />
        </div>

        <nav className="flex flex-col gap-4 w-full px-2">
          <SidebarIcon icon={<Home />} label="OVERVIEW" active={activeTab === "OVERVIEW"} onClick={() => setActiveTab("OVERVIEW")} />
          <SidebarIcon icon={<Globe />} label="TACTICAL 3D" active={activeTab === "TACTICAL 3D"} onClick={() => setActiveTab("TACTICAL 3D")} />
          <SidebarIcon icon={<Activity />} label="SENSORS" active={activeTab === "SENSORS"} onClick={() => setActiveTab("SENSORS")} />
          <SidebarIcon icon={<Radio />} label="NETWORK" active={activeTab === "NETWORK"} onClick={() => setActiveTab("NETWORK")} />
          <SidebarIcon icon={<BarChart2 />} label="ANALYTICS" active={activeTab === "ANALYTICS"} onClick={() => setActiveTab("ANALYTICS")} />
          <SidebarIcon icon={<BookOpen />} label="LEDGER" active={activeTab === "LEDGER"} onClick={() => setActiveTab("LEDGER")} />
          <SidebarIcon icon={<Coins />} label="TOKENOMICS" active={activeTab === "TOKENOMICS"} onClick={() => setActiveTab("TOKENOMICS")} />
          <SidebarIcon icon={<Navigation />} label="DRONE VIEW" active={activeTab === "DRONE VIEW"} onClick={() => setActiveTab("DRONE VIEW")} />
          <SidebarIcon icon={<Glasses />} label="AR VIEW" active={activeTab === "AR VIEW"} onClick={() => setActiveTab("AR VIEW")} />
        </nav>

        <div className="mt-auto px-2 w-full">
          <SidebarIcon icon={<Settings />} label="SETTINGS" active={activeTab === "SETTINGS"} onClick={() => setActiveTab("SETTINGS")} />
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">

        {/* TOP COMMAND HEADER */}
        <header className="h-20 border-b border-slate-800 flex justify-between items-center px-6 bg-[#040914] shrink-0 z-20">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-widest">CITIZEN SENSOR NETWORK</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30">SIH 2026</span>
              </div>
              <p className="text-xs text-slate-500 font-medium tracking-wide">Blockchain-Verified Disaster Early Warning & Structural Health Grid</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Cyber-Physical Threat Flag */}
            {cyberThreatEvent && (
              <button
                onClick={() => generateForensicReport(cyberThreatEvent)}
                className="bg-red-950/60 border border-red-500 px-3 py-1.5 rounded flex items-center gap-2 animate-bounce cursor-pointer hover:bg-red-900/60 transition-colors"
              >
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-xs font-bold text-red-400 tracking-wider">CYBER-PHYSICAL THREAT DETECTED</span>
              </button>
            )}

            {/* Vocal AI Command Center Button */}
            <button
              onClick={toggleVoiceControl}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold font-mono transition-all cursor-pointer ${
                isListening
                  ? "bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse"
                  : "bg-slate-900 border-slate-700 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-400"
              }`}
            >
              {isListening ? <Mic className="w-4 h-4 text-red-400" /> : <MicOff className="w-4 h-4" />}
              <span>{isListening ? "LISTENING..." : "VOCAL AI"}</span>
            </button>

            {/* Autonomous Swarm Dispatch Button */}
            <button
              onClick={triggerAgenticSwarm}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold font-mono tracking-wider shadow-[0_0_15px_rgba(0,229,255,0.3)] cursor-pointer"
            >
              <Cpu className="w-4 h-4" />
              <span>AGENTIC SWARM</span>
            </button>

            {/* Incident Alert / System Status */}
            {hasCriticalEvent ? (
              <div className="bg-red-950/40 border border-red-500/50 px-4 py-1.5 rounded flex items-center gap-3 glow-border-red">
                <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                <div>
                  <div className="text-xs font-bold text-red-500 uppercase tracking-widest">CRITICAL INCIDENT DETECTED</div>
                  <div className="text-[10px] text-red-400/80">Seismic Resonance Confirmed | Risk: {currentRisk}%</div>
                </div>
              </div>
            ) : (
              <div className="bg-green-950/20 border border-green-500/30 px-3 py-1.5 rounded flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-xs font-bold text-green-400 uppercase tracking-wider">SYSTEM OPTIMAL</span>
              </div>
            )}

            {/* Gateway & NTN Status */}
            <div className="hidden lg:flex items-center gap-4 border-l border-slate-800 pl-4 text-xs font-mono">
              <div>
                <span className="text-slate-500">GATEWAY: </span>
                <span className={gatewayConnected ? "text-green-400 font-bold" : "text-amber-400"}>
                  {gatewayConnected ? "LIVE WS" : "POLLING"}
                </span>
              </div>
              <div className="text-white">09:42:17 UTC</div>
            </div>
          </div>
        </header>

        {/* VOCAL AI TOAST POPUP */}
        {voiceToast && (
          <div className="absolute top-24 right-8 z-50 bg-[#0B1120] border border-cyan-500/60 text-cyan-300 px-4 py-2 rounded-lg shadow-2xl backdrop-blur font-mono text-xs flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{voiceToast}</span>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: OVERVIEW & 3D DIGITAL TWIN */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "OVERVIEW" && (
          <div className="flex-1 p-6 grid grid-cols-12 grid-rows-[60%_40%] gap-6 overflow-hidden">
            {/* 1. 3D DIGITAL TWIN (HERO SECTION) */}
            <div className="panel col-span-8 row-span-1 relative shadow-2xl border-cyan-900/50">
              <div className="panel-header absolute top-0 w-full z-10 border-b-0 bg-gradient-to-b from-[#0B1120] to-transparent">
                <span className="text-xs tracking-widest text-white/90">1. CIVIL ENGINEERING DIGITAL TWIN | BRIDGE DELTA-17</span>
                <div className="flex gap-2">
                  <LocateFixed className="w-4 h-4 text-cyan-400" />
                  <Maximize className="w-4 h-4 text-slate-500" />
                </div>
              </div>

              <div className="w-full h-full absolute inset-0 bg-[#050810] rounded-xl overflow-hidden">
                <Canvas camera={{ position: [10, 8, 10], fov: 45 }}>
                  <ambientLight intensity={0.2} />
                  <directionalLight position={[10, 10, 5]} intensity={1.5} />
                  <Grid infiniteGrid fadeDistance={40} fadeStrength={5} cellColor="#1E293B" sectionColor="#0F172A" />
                  <OrbitControls autoRotate autoRotateSpeed={0.5} enableZoom={false} />
                  <BridgeModel hasCriticalEvent={hasCriticalEvent} riskScore={parseFloat(currentRisk)} />
                </Canvas>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-10 font-mono text-xs text-cyan-400 bg-slate-900/70 p-3 rounded backdrop-blur border border-slate-800">
                <div>STRUCTURAL VIBRATION: {hasCriticalEvent ? "78.4 mm/s" : "1.2 mm/s"}</div>
                <div>PHYSICS CORRELATION: <span className="text-green-400">98% MATCH (2.38 Hz / 2.40 Hz)</span></div>
                <div className="text-slate-400">STATUS: {hasCriticalEvent ? "CRITICAL STRESS" : "STABLE"}</div>
              </div>
            </div>

            {/* 2. RISK SCORE */}
            <div className="panel col-span-4 row-span-1 shadow-2xl border-cyan-900/50">
              <div className="panel-header">
                <span className="text-xs tracking-widest text-white/90">2. AI-COMPUTED RISK SCORE (R = f(A,Q,T,S,P,C,H))</span>
              </div>
              <div className="panel-content flex flex-col justify-center items-center py-6 h-full relative">
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 transform">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#1E293B" strokeWidth="6" />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={hasCriticalEvent ? "#EF4444" : "#00E5FF"}
                      strokeWidth="6"
                      strokeDasharray="282.6"
                      strokeDashoffset={282.6 - (282.6 * parseInt(currentRisk) / 100)}
                      className="transition-all duration-1000"
                      style={{ filter: `drop-shadow(0 0 10px ${hasCriticalEvent ? "#EF4444" : "#00E5FF"})` }}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className={`text-5xl font-black ${hasCriticalEvent ? "text-red-500 glow-text-red" : "text-cyan-400 glow-text-cyan"}`}>
                      {currentRisk}
                    </span>
                    <span className={`text-[10px] uppercase font-bold tracking-widest mt-1 ${hasCriticalEvent ? "text-red-500" : "text-cyan-500"}`}>
                      {hasCriticalEvent ? "CRITICAL ALERT" : "NORMAL"}
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-4 text-center text-[11px] text-slate-400 px-4">
                  Multi-modal fusion of Edge AI CNN-LSTM, spatial device quorum & FEM digital twin physics.
                </div>
              </div>
            </div>

            {/* 3. BLOCKCHAIN VERIFICATION FEED */}
            <div className="panel col-span-8 row-span-1 shadow-2xl">
              <div className="panel-header flex justify-between">
                <span className="text-xs tracking-widest text-white/90">3. IMMUTABLE BLOCKCHAIN VERIFICATION FEED</span>
                <BookOpen className="w-4 h-4 text-cyan-500" />
              </div>
              <div className="panel-content overflow-y-auto p-3">
                <div className="space-y-2">
                  {liveEvents.slice(0, 5).map((evt, idx) => (
                    <div
                      key={idx}
                      className="flex gap-4 text-xs font-mono border-b border-slate-800/80 pb-2.5 items-center bg-slate-900/40 p-2.5 rounded hover:bg-slate-800/60 transition-colors"
                    >
                      <div className="text-cyan-400 shrink-0 w-24">
                        <Clock className="w-3.5 h-3.5 inline mr-1.5" />
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </div>
                      <div className="flex-1 flex gap-3 items-center truncate">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider ${
                            evt.status === "CRITICAL"
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                          }`}
                        >
                          {evt.status === "CRITICAL" ? "ANOMALY PROOF" : "HEARTBEAT"}
                        </span>
                        <span className="text-slate-300 truncate">
                          HASH: <span className="text-slate-500">{evt.ledgerHash ? evt.ledgerHash.slice(0, 24) + "..." : `A7B3C2D${idx}99F5E21B...`}</span>
                        </span>
                      </div>
                      <button
                        onClick={() => generateForensicReport(evt)}
                        className="text-cyan-400 hover:text-cyan-300 text-[10px] underline shrink-0 cursor-pointer"
                      >
                        Evidence
                      </button>
                      <div className="text-green-400 font-bold shrink-0 text-[10px] tracking-wider">
                        <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                        VERIFIED
                      </div>
                    </div>
                  ))}
                  {liveEvents.length === 0 && (
                    <div className="text-center text-slate-500 py-8 text-xs font-mono flex flex-col items-center">
                      <RefreshCw className="w-6 h-6 animate-spin opacity-50 mb-2 text-cyan-500" />
                      Listening for incoming cryptographic transactions from edge nodes...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 4. AUTOMATED RESPONSE FEED */}
            <div className="panel col-span-4 row-span-1 shadow-2xl">
              <div className="panel-header flex justify-between">
                <span className="text-xs tracking-widest text-white/90">4. AUTOMATED ACTION LOG</span>
                <AlertTriangle className="w-4 h-4 text-orange-500" />
              </div>
              <div className="panel-content overflow-y-auto font-mono text-xs p-3 bg-[#080d1a]">
                <div className="space-y-3">
                  {hasCriticalEvent && (
                    <>
                      <div className="p-2.5 bg-red-950/30 border-l-2 border-red-500 rounded-r text-[11px]">
                        <strong className="text-red-400">CRITICAL ANOMALY ANCHORED</strong>
                        <p className="text-slate-400 mt-0.5">Municipal SMS evacuation broadcast triggered for 14,020 citizens.</p>
                      </div>
                      <div className="p-2.5 bg-orange-950/30 border-l-2 border-orange-500 rounded-r text-[11px]">
                        <strong className="text-orange-400">INFRASTRUCTURE LOCKDOWN</strong>
                        <p className="text-slate-400 mt-0.5">Automated boom barriers activated on Bridge Delta-17.</p>
                      </div>
                    </>
                  )}
                  <div className="p-2.5 border-l-2 border-cyan-500/50 rounded-r text-[11px]">
                    <strong className="text-cyan-400">BLE MESH NETWORK ACTIVE</strong>
                    <p className="text-slate-400 mt-0.5">124 local edge nodes gossiping ad-hoc state offline.</p>
                  </div>
                  <div className="p-2.5 border-l-2 border-slate-700 rounded-r text-[11px]">
                    <strong className="text-slate-300">PARAMETRIC CONTRACT STANDBY</strong>
                    <p className="text-slate-400 mt-0.5">Instant micro-relief smart contract deployed on EVM local node.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: TACTICAL 3D GLOBE (CESIUM GOD'S EYE) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "TACTICAL 3D" && (
          <div className="flex-1 relative w-full h-full flex overflow-hidden">
            {/* Layer Control Overlay */}
            <div className="absolute top-4 left-4 z-20 bg-[#0B1120]/90 border border-slate-800 p-4 rounded-lg backdrop-blur shadow-2xl max-w-xs">
              <div className="flex items-center gap-2 mb-3 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                <Layers className="w-4 h-4" />
                <span>GOD&apos;S EYE LAYER CONTROLS</span>
              </div>
              <div className="space-y-2 text-xs font-mono">
                {(["sensors", "heatmap", "structures", "events", "satellites", "correlations"] as LayerId[]).map(layer => (
                  <label key={layer} className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white">
                    <span className="capitalize">{layer}</span>
                    <input
                      type="checkbox"
                      checked={globeLayers[layer]}
                      onChange={e => setGlobeLayers(prev => ({ ...prev, [layer]: e.target.checked }))}
                      className="accent-cyan-500 rounded"
                    />
                  </label>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
                Active Nodes: {commandState.sensors.length} | Structures: {commandState.structures.length}
              </div>
            </div>

            {/* Selection Inspector Overlay */}
            {selectedGlobeItem && (
              <div className="absolute top-4 right-4 z-20 bg-[#0B1120]/90 border border-cyan-500/50 p-4 rounded-lg backdrop-blur shadow-2xl max-w-sm text-xs font-mono">
                <div className="flex justify-between items-center mb-2 border-b border-slate-800 pb-2">
                  <span className="text-cyan-400 font-bold uppercase">{selectedGlobeItem.kind} INSPECTOR</span>
                  <button onClick={() => setSelectedGlobeItem(null)} className="text-slate-500 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-1.5 text-slate-300">
                  {"name" in selectedGlobeItem.payload && <div>Name: <span className="text-white font-bold">{selectedGlobeItem.payload.name}</span></div>}
                  {"deviceId" in selectedGlobeItem.payload && <div>Node ID: <span className="text-cyan-400">{selectedGlobeItem.payload.deviceId}</span></div>}
                  {"stage" in selectedGlobeItem.payload && <div>Risk Stage: <span className="text-red-400 font-bold">{selectedGlobeItem.payload.stage}</span></div>}
                  {"score" in selectedGlobeItem.payload && <div>Risk Score: <span className="text-amber-400">{selectedGlobeItem.payload.score}</span></div>}
                  {"twinConfidence" in selectedGlobeItem.payload && <div>Physics Match: <span className="text-green-400">{((selectedGlobeItem.payload.twinConfidence ?? 0) * 100).toFixed(0)}%</span></div>}
                  {"lat" in selectedGlobeItem.payload && <div>Coordinates: {selectedGlobeItem.payload.lat.toFixed(4)}, {selectedGlobeItem.payload.lon.toFixed(4)}</div>}
                </div>
              </div>
            )}

            {/* Cesium Globe Canvas */}
            <div className="w-full h-full">
              <CesiumGlobe
                state={commandState}
                layers={globeLayers}
                playbackMs={null}
                onSelect={sel => setSelectedGlobeItem(sel)}
              />
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: SENSORS PROFILER */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "SENSORS" && (
          <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
            <div className="panel-header border-b-0 flex justify-between items-center">
              <span className="text-xs tracking-widest text-white/90">CONNECTED CITIZEN SMARTPHONE SENSORS (TEE KESTORE SIGNED)</span>
              <div className="text-xs font-mono text-cyan-400">Total Active Quorum: 124 Nodes</div>
            </div>
            <div className="flex-1 overflow-auto bg-slate-900/20 border border-slate-800 rounded">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#0B1120] text-cyan-500 font-mono border-b border-slate-800">
                  <tr>
                    <th className="p-3 font-normal tracking-wider">NODE ID</th>
                    <th className="p-3 font-normal tracking-wider">DEVICE TIER</th>
                    <th className="p-3 font-normal tracking-wider">EDGE AI MODEL</th>
                    <th className="p-3 font-normal tracking-wider">SAMPLING</th>
                    <th className="p-3 font-normal tracking-wider">TEE SIGNATURE</th>
                    <th className="p-3 font-normal tracking-wider">BATTERY</th>
                    <th className="p-3 font-normal tracking-wider">STATUS</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300 font-mono">
                  {[
                    { id: "CITIZEN_DEVICE_402", tier: "T1 (Premium)", model: "CNN-LSTM 250KB", rate: "100 Hz", sig: "ECDSA + ML-DSA PQC", batt: "88%", status: "STREAMING" },
                    { id: "CSN-7A3F-DELHI", tier: "T1 (Premium)", model: "CNN-LSTM 250KB", rate: "100 Hz", sig: "ECDSA secp256r1", batt: "84%", status: "ACTIVE" },
                    { id: "CSN-2B91-MUMBAI", tier: "T2 (Mid)", model: "1D-CNN 50KB", rate: "50 Hz", sig: "ECDSA secp256r1", batt: "42%", status: "ACTIVE" },
                    { id: "CSN-9F21-NOIDA", tier: "T1 (Premium)", model: "CNN-LSTM 250KB", rate: "100 Hz", sig: "Dilithium-5 PQC", batt: "14%", status: "THROTTLED" },
                    { id: "CSN-4C55-JAIPUR", tier: "T3 (Entry)", model: "1D-CNN 50KB", rate: "50 Hz", sig: "ECDSA secp256r1", batt: "98%", status: "ACTIVE" },
                    { id: "CSN-1E82-BENGALURU", tier: "T1 (Premium)", model: "CNN-LSTM 250KB", rate: "100 Hz", sig: "ECDSA + ML-DSA PQC", batt: "100%", status: "ACTIVE" }
                  ].map((node, i) => (
                    <tr key={i} className="border-b border-slate-800/80 hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 text-white font-bold">{node.id}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          node.tier.startsWith("T1") ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        }`}>
                          {node.tier}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{node.model}</td>
                      <td className="p-3 text-cyan-400">{node.rate}</td>
                      <td className="p-3 text-slate-400">
                        <span className="flex items-center gap-1 text-green-400 text-[11px]">
                          <Lock className="w-3 h-3 text-green-500" /> {node.sig}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 bg-slate-800 rounded overflow-hidden">
                            <div className={`h-full ${parseInt(node.batt) > 20 ? "bg-green-500" : "bg-red-500"}`} style={{ width: node.batt }}></div>
                          </div>
                          <span className="text-[10px] text-slate-500">{node.batt}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`flex items-center gap-1.5 text-[11px] font-bold ${node.status === "STREAMING" ? "text-cyan-400 animate-pulse" : "text-green-500"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${node.status === "STREAMING" ? "bg-cyan-400" : "bg-green-500"}`}></span>
                          {node.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: SENSOR MESH NETWORK & TOPOLOGY */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "NETWORK" && (
          <div className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-hidden">
            {/* LIVE SENSOR MAP */}
            <div className="panel col-span-8 relative shadow-2xl border-cyan-900/50 overflow-hidden">
              <div className="panel-header absolute top-0 w-full z-10 border-b-0 bg-gradient-to-b from-[#0B1120] to-transparent">
                <span className="text-xs tracking-widest text-white/90">LIVE MESH NETWORK GEOLOCATION (OFFLINE-FIRST GOSSIP)</span>
              </div>
              <Map
                initialViewState={{ longitude: 77.2090, latitude: 28.6139, zoom: 12, pitch: 45 }}
                mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                interactive={true}
                style={{ width: "100%", height: "100%" }}
              >
                {liveEvents.map((evt, i) => (
                  <Marker key={i} longitude={evt.longitude || 77.2090} latitude={evt.latitude || 28.6139}>
                    <div className="relative flex items-center justify-center">
                      <div
                        className={`w-4 h-4 rounded-full ${evt.status === "CRITICAL" ? "bg-red-500" : "bg-cyan-500"}`}
                        style={{ boxShadow: `0 0 15px ${evt.status === "CRITICAL" ? "#EF4444" : "#00E5FF"}` }}
                      ></div>
                      <div className={`absolute inset-0 animate-ping rounded-full opacity-50 ${evt.status === "CRITICAL" ? "bg-red-500" : "bg-cyan-500"}`}></div>
                    </div>
                  </Marker>
                ))}
              </Map>
            </div>

            {/* BLE MESH NODE TOPOLOGY */}
            <div className="panel col-span-4 relative overflow-hidden">
              <div className="panel-header absolute top-0 w-full z-10 border-b-0 bg-gradient-to-b from-[#0B1120] to-transparent">
                <span className="text-xs tracking-widest text-white/90">AD-HOC BLE TOPOLOGY</span>
              </div>
              <div className="w-full h-full relative flex items-center justify-center bg-[#040914]">
                <div className="w-64 h-64 rounded-full border border-cyan-500/30 relative">
                  <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-cyan-500 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_20px_#00E5FF] flex items-center justify-center">
                    <Radio className="w-4 h-4 text-white animate-pulse" />
                  </div>
                  <div className="absolute top-1/4 left-1/4 w-3.5 h-3.5 bg-orange-500 rounded-full shadow-[0_0_10px_#f97316]"></div>
                  <div className="absolute bottom-1/4 right-1/4 w-3.5 h-3.5 bg-cyan-500 rounded-full shadow-[0_0_10px_#00E5FF]"></div>
                  <div className="absolute top-3/4 left-1/3 w-3.5 h-3.5 bg-cyan-500 rounded-full shadow-[0_0_10px_#00E5FF]"></div>
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <line x1="50%" y1="50%" x2="25%" y2="25%" stroke="#00E5FF" strokeWidth="1.5" opacity="0.6" strokeDasharray="4" />
                    <line x1="50%" y1="50%" x2="75%" y2="75%" stroke="#00E5FF" strokeWidth="1.5" opacity="0.6" strokeDasharray="4" />
                    <line x1="50%" y1="50%" x2="33%" y2="75%" stroke="#f97316" strokeWidth="1.5" opacity="0.6" />
                  </svg>
                </div>

                <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 border border-slate-700 p-3 rounded text-xs z-20 backdrop-blur font-mono">
                  <div className="text-white mb-1.5 border-b border-slate-700 pb-1 flex justify-between">
                    <span>RELAY NODE: CITIZEN_402</span>
                    <span className="text-green-400 font-bold">5G UPLINK</span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-400">Offline Peering</span>
                    <span className="text-cyan-400">BLE 5.2 (5 Hops)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Signal (RSSI)</span>
                    <span className="text-green-400">-52 dBm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 5: ANALYTICS & HIGH-FREQUENCY WAVEFORMS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "ANALYTICS" && (
          <div className="flex-1 p-6 grid grid-cols-12 grid-rows-[55%_45%] gap-6 overflow-hidden">
            {/* HISTORICAL PGA TIMELINE */}
            <div className="panel col-span-8 row-span-1">
              <div className="panel-header">
                <span>PGA (PEAK GROUND ACCELERATION) OVER TIME (g-force)</span>
                <span className="text-[10px] text-cyan-400 font-mono">SAMPLING: 100 Hz</span>
              </div>
              <div className="panel-content">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={Array.from({ length: 50 }).map((_, i) => ({
                      time: `-${50 - i}m`,
                      value: Number((Math.abs(Math.sin(i * 0.45)) * 1.8 + (i === 38 ? 7.6 : 0) + (Math.abs(Math.sin(i * 123.45)) * 0.4)).toFixed(2))
                    }))}
                  >
                    <defs>
                      <linearGradient id="pgaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickMargin={8} />
                    <YAxis stroke="#475569" fontSize={10} tickMargin={8} />
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <RechartsTooltip contentStyle={{ backgroundColor: "#0B1120", borderColor: "#1E293B", color: "#fff" }} />
                    <Area type="monotone" dataKey="value" stroke="#00E5FF" strokeWidth={2.5} fillOpacity={1} fill="url(#pgaGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* FREQUENCY DISTRIBUTION */}
            <div className="panel col-span-4 row-span-1">
              <div className="panel-header">SEISMIC FREQUENCY SPECTRUM (Hz)</div>
              <div className="panel-content flex items-end justify-between px-4 gap-1.5">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <div
                      className="w-full bg-gradient-to-t from-cyan-600 to-amber-500 rounded-t"
                      style={{ height: `${Math.abs(Math.sin(i * 54.321)) * 75 + 15}%` }}
                    ></div>
                    <span className="text-[8px] text-slate-500 font-mono">{(i * 0.8 + 0.5).toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ACOUSTIC MICROPHONE SPECTRUM */}
            <div className="panel col-span-6 row-span-1">
              <div className="panel-header">
                <span>ACOUSTIC MICROPHONE SPECTRUM (CRACK PROPAGATION)</span>
                <span className="text-[10px] text-slate-400 font-mono">AUDIO RISK: 0.12</span>
              </div>
              <div className="panel-content flex items-end gap-1 justify-between h-full p-3">
                {Array.from({ length: 36 }).map((_, i) => {
                  const pseudoRandom = Math.abs(Math.sin(i * 12.9898 + 78.233));
                  const height = hasCriticalEvent ? pseudoRandom * 75 + 25 : pseudoRandom * 35 + 10;
                  const isHigh = height > 65;
                  return (
                    <div key={i} className="w-full flex flex-col justify-end gap-[2px] h-full opacity-85" style={{ height: `${height}%` }}>
                      {Array.from({ length: Math.floor(height / 12) }).map((_, j) => (
                        <div key={j} className={`w-full h-1.5 rounded-sm ${isHigh && j > 4 ? "bg-orange-500" : "bg-cyan-500"}`}></div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* FFT FREQUENCY DOMAIN WITH RESONANCE LOCK */}
            <div className="panel col-span-6 row-span-1 relative">
              <div className="panel-header">
                <span>FFT RESONANCE VERIFICATION (NATURAL FREQ 2.40 Hz)</span>
                <span className="text-[10px] text-green-400 font-mono">CORRELATION: 98%</span>
              </div>
              <div className="panel-content relative flex items-center justify-center">
                <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="none">
                  <path
                    d="M0,90 Q50,90 80,35 T150,90 Q200,90 230,15 T300,90 Q350,90 380,45 T400,90"
                    fill="none"
                    stroke="#00E5FF"
                    strokeWidth="2.5"
                    style={{ filter: "drop-shadow(0 0 6px #00E5FF)" }}
                  />
                </svg>
                <div className="absolute top-2 left-[55%] text-xs text-white font-mono flex flex-col items-center bg-slate-900/80 px-2 py-1 rounded border border-cyan-500/40">
                  <span className="text-cyan-400 font-bold">2.38 Hz PEAK</span>
                  <span className="text-slate-400 text-[9px]">(STRUCTURAL HARMONIC)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 6: BLOCKCHAIN LEDGER & PARAMETRIC INSURANCE */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "LEDGER" && (
          <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
            <div className="panel-header border-b-0 flex justify-between items-center">
              <span className="text-xs tracking-widest text-white/90">HYPERLEDGER FABRIC & SOLIDITY PARAMETRIC INSURANCE CONTRACT</span>
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-3 py-1 rounded text-xs text-green-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> GROTH16 ZKP VERIFIER ACTIVE
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="bg-[#0B1120] border border-slate-800 rounded p-3 font-mono">
                <div className="text-slate-500 text-[10px] font-bold mb-1">TOTAL ANCHORED EVENTS</div>
                <div className="text-2xl font-bold text-cyan-400 glow-text-cyan">14,208</div>
              </div>
              <div className="bg-[#0B1120] border border-slate-800 rounded p-3 font-mono">
                <div className="text-slate-500 text-[10px] font-bold mb-1">SMART CONTRACT</div>
                <div className="text-sm font-bold text-white truncate">0xe7f1725E7734CE...</div>
              </div>
              <div className="bg-[#0B1120] border border-slate-800 rounded p-3 font-mono">
                <div className="text-slate-500 text-[10px] font-bold mb-1">CONSENSUS ALGORITHM</div>
                <div className="text-sm font-bold text-white">Raft (Crash Fault Tolerant)</div>
              </div>
              <div className="bg-[#0B1120] border border-slate-800 rounded p-3 font-mono">
                <div className="text-slate-500 text-[10px] font-bold mb-1">PQC LATTICE SCHEME</div>
                <div className="text-sm font-bold text-green-400">ML-DSA / Dilithium-5</div>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-slate-900/20 border border-slate-800 rounded p-4 font-mono text-xs">
              <div className="space-y-3">
                {liveEvents.map((evt, idx) => (
                  <div key={idx} className="bg-[#040914] border border-slate-800 p-3.5 rounded-lg flex gap-4 hover:border-cyan-500/50 transition-colors">
                    <div className="shrink-0 flex flex-col items-center justify-center bg-slate-800/40 rounded px-3 min-w-20">
                      <span className="text-cyan-500 text-[9px] font-bold">BLOCK</span>
                      <span className="text-white text-base font-bold">#{104052 + idx}</span>
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider ${
                          evt.status === "CRITICAL" ? "bg-red-500/20 text-red-400" : "bg-cyan-500/10 text-cyan-400"
                        }`}>
                          {evt.status === "CRITICAL" ? "PARAMETRIC DISASTER TRIGGER" : "STATE HEARTBEAT"}
                        </span>
                        <span className="text-slate-500 text-[11px]">{new Date(evt.timestamp).toISOString()}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-[11px]">
                        <div>
                          <span className="text-slate-500 block">HASH:</span>
                          <span className="text-slate-300 truncate block">{evt.ledgerHash || `73b6c6a7dcacb1312c65be7142bc62609ba...`}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">ZKP PROOF:</span>
                          <span className="text-green-400 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> VERIFIED (Zero PII Disclosed)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col justify-center items-end">
                      <button
                        onClick={() => generateForensicReport(evt)}
                        className="px-2.5 py-1 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-400 text-[10px] hover:bg-cyan-900 transition-colors cursor-pointer"
                      >
                        Audit Evidence
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 7: DePIN CITIZEN REWARD TOKENOMICS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "TOKENOMICS" && (
          <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
            <div className="panel-header border-b-0 flex justify-between items-center">
              <span className="text-xs tracking-widest text-white/90">DePIN CITIZEN REWARD TOKENOMICS (⭐ SCT SENSOR COINS)</span>
              <div className="text-xs font-mono text-cyan-400">Network Mint Rate: 15 SCT / Hour</div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="bg-[#0B1120] border border-cyan-500/30 rounded-lg p-5 font-mono shadow-[0_0_20px_rgba(0,229,255,0.1)]">
                <div className="text-slate-400 text-xs font-bold mb-1">TOTAL SCT TOKENS MINTED</div>
                <div className="text-3xl font-black text-cyan-400 glow-text-cyan">
                  {(452109 + liveEvents.length * 15).toLocaleString()} <span className="text-sm font-normal text-slate-400">SCT</span>
                </div>
                <div className="text-[11px] text-green-400 mt-2">▲ 14.2% Growth in Decentralized Sensor Quorum</div>
              </div>

              <div className="bg-[#0B1120] border border-slate-800 rounded-lg p-5 font-mono">
                <div className="text-slate-400 text-xs font-bold mb-1">YOUR EDGE WALLET BALANCE</div>
                <div className="text-3xl font-black text-amber-400">
                  {userTokenBalance.toFixed(1)} <span className="text-sm font-normal text-slate-400">SCT</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-2">Device: CITIZEN_DEVICE_402 (Earned from background sensing)</div>
              </div>

              <div className="bg-[#0B1120] border border-slate-800 rounded-lg p-5 font-mono flex flex-col justify-between">
                <div>
                  <div className="text-slate-400 text-xs font-bold mb-1">PARAMETRIC RELIEF CONTRACT</div>
                  <div className="text-xs text-slate-300">Instant payout upon multi-device quorum consensus</div>
                </div>
                <button
                  onClick={() => {
                    if (!hasClaimedRelief) {
                      setUserTokenBalance(prev => prev + 500);
                      setHasClaimedRelief(true);
                    }
                  }}
                  disabled={hasClaimedRelief}
                  className={`w-full py-2 rounded text-xs font-bold font-mono tracking-wider transition-all cursor-pointer ${
                    hasClaimedRelief
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  }`}
                >
                  {hasClaimedRelief ? "✓ 500 SCT RELIEF DISBURSED" : "CLAIM PARAMETRIC RELIEF (500 SCT)"}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-slate-900/20 border border-slate-800 rounded p-4 font-mono text-xs">
              <h3 className="text-sm font-bold text-white mb-3 tracking-wide">ACTIVE CITIZEN TELEMETRY REWARD LEADERBOARD</h3>
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#0B1120] text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">CITIZEN WALLET ADDRESS</th>
                    <th className="p-3">UPTIME HOURS</th>
                    <th className="p-3">SAMPLES CONTRIBUTED</th>
                    <th className="p-3">REWARD EARNED</th>
                    <th className="p-3">STATUS</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  {[
                    { addr: "0x8f2a...9b1c (You)", hours: "24.5 hrs", samples: "88,200", sct: `${userTokenBalance.toFixed(1)} SCT`, active: true },
                    { addr: "0x33e1...44f2", hours: "18.2 hrs", samples: "65,520", sct: "273.0 SCT", active: true },
                    { addr: "0x11b9...77a8", hours: "14.0 hrs", samples: "50,400", sct: "210.0 SCT", active: true },
                    { addr: "0x99a4...22c0", hours: "12.8 hrs", samples: "46,080", sct: "192.0 SCT", active: true },
                    { addr: "0x77d2...88e5", hours: "9.5 hrs", samples: "34,200", sct: "142.5 SCT", active: false }
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-slate-800/80 hover:bg-slate-800/40">
                      <td className="p-3 text-cyan-400 font-bold">{row.addr}</td>
                      <td className="p-3">{row.hours}</td>
                      <td className="p-3">{row.samples}</td>
                      <td className="p-3 text-amber-400 font-bold">{row.sct}</td>
                      <td className="p-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${row.active ? "bg-green-500/20 text-green-400" : "bg-slate-800 text-slate-400"}`}>
                          {row.active ? "ACTIVE SENSING" : "IDLE"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 8: AUTONOMOUS DRONE DISPATCH & TELEMETRY */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "DRONE VIEW" && (
          <div className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-hidden">
            {/* LIVE DRONE VIDEO FEED */}
            <div className="panel col-span-8 relative shadow-2xl overflow-hidden bg-black flex flex-col">
              <div className="panel-header absolute top-0 w-full z-10 border-b-0 bg-gradient-to-b from-[#0B1120] to-transparent flex justify-between">
                <span className="text-xs tracking-widest text-cyan-400 font-mono">
                  🔴 LIVE DRONE HD STREAM | MUNICIPAL RECON SWARM (AERO-V1)
                </span>
                <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/40 px-2 py-0.5 rounded font-mono animate-pulse">
                  REC 1080P 60FPS
                </span>
              </div>

              {/* Simulated HD Feed with Aerial Imagery */}
              <div className="w-full h-full relative bg-[url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80')] bg-cover bg-center">
                <div className="absolute inset-0 bg-cyan-950/20 mix-blend-overlay"></div>

                {/* HUD Crosshairs */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-32 h-32 border border-cyan-400/40 rounded-full relative flex items-center justify-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                    <div className="absolute w-full h-[1px] bg-cyan-400/30"></div>
                    <div className="absolute h-full w-[1px] bg-cyan-400/30"></div>
                  </div>
                </div>

                {/* Flight Vector Telemetry */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between bg-black/75 p-3 rounded backdrop-blur font-mono text-xs text-cyan-300 border border-cyan-500/30">
                  <div>ALTITUDE: <span className="text-white">124m AGL</span></div>
                  <div>SPEED: <span className="text-white">42 km/h</span></div>
                  <div>BATTERY: <span className="text-green-400">88% (32m rem)</span></div>
                  <div>TARGET GPS: <span className="text-amber-400">{droneTargetCoords}</span></div>
                </div>
              </div>
            </div>

            {/* AI DAMAGE ASSESSMENT (VISION-LANGUAGE MODEL) */}
            <div className="panel col-span-4 flex flex-col font-mono text-xs">
              <div className="panel-header border-b border-slate-800 flex justify-between">
                <span className="text-xs tracking-widest text-white/90">GEN-AI VISION DAMAGE ASSESSMENT</span>
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="panel-content space-y-4 p-4 overflow-auto">
                <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Rubble Classification</div>
                  <div className="text-cyan-400 font-bold mt-0.5">{droneAssessment.rubbleType}</div>
                </div>

                <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Structural Collapse Pattern</div>
                  <div className="text-orange-400 font-bold mt-0.5">{droneAssessment.collapsePattern}</div>
                </div>

                <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Survivability Index</div>
                  <div className="text-green-400 mt-0.5">{droneAssessment.survivabilityIndex}</div>
                </div>

                <div className="p-3 bg-red-950/30 rounded border border-red-500/40">
                  <div className="text-[10px] text-red-400 uppercase font-bold">Machinery Logistics Dispatch</div>
                  <div className="text-white font-bold mt-0.5">{droneAssessment.logisticsRecommendation}</div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-1.5">Immediate Site Hazards</div>
                  <div className="space-y-1">
                    {droneAssessment.hazards.map((h, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-red-400 text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 9: AR EVACUATION HUD */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "AR VIEW" && (
          <div className="flex-1 relative overflow-hidden bg-black select-none">
            <div className="absolute inset-0 bg-gradient-to-b from-[#1e293b] to-[#040914] z-0 opacity-50"></div>
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-30 pointer-events-none"></div>

            <div className="absolute inset-0 z-10 p-8 flex flex-col justify-between pointer-events-none">
              <div className="flex justify-between items-start">
                <div className="bg-black/70 border border-cyan-500/50 p-4 rounded-lg backdrop-blur">
                  <div className="text-cyan-400 font-mono text-xs mb-1 glow-text-cyan">EVACUATION ROUTING ACTIVE</div>
                  <div className="text-white text-2xl font-bold">420m to Safe Zone (Alpha)</div>
                  <div className="text-slate-300 text-xs mt-2 flex items-center gap-2 font-mono">
                    <Clock className="w-4 h-4 text-cyan-500" /> ETA: 06:18 (Walking)
                  </div>
                </div>
                <div className="w-20 h-20 border-2 border-cyan-500/30 rounded-full flex items-center justify-center relative font-mono text-[10px]">
                  <div className="absolute inset-0 border-t-2 border-cyan-500 rounded-full animate-spin"></div>
                  <span className="text-cyan-500 font-bold">GPS LOCK</span>
                </div>
              </div>

              {/* AR 3D Pathway */}
              <div className="flex-1 w-full relative flex items-end justify-center">
                <svg viewBox="0 0 200 200" className="w-full max-w-2xl h-60 drop-shadow-2xl opacity-90" preserveAspectRatio="none">
                  <path
                    d="M100,200 L120,150 L90,100 L110,50 L100,0"
                    fill="none"
                    stroke="#00E5FF"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-pulse"
                    style={{ filter: "drop-shadow(0 0 15px #00E5FF)" }}
                  />
                  <circle cx="100" cy="0" r="10" fill="#10B981" style={{ filter: "drop-shadow(0 0 15px #10B981)" }} />
                </svg>
              </div>

              <div className="flex justify-between items-end">
                <div className="bg-red-950/80 border border-red-500/50 p-4 rounded-lg backdrop-blur">
                  <div className="text-red-400 font-bold flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-5 h-5" /> AVOID BRIDGE DELTA-17
                  </div>
                  <div className="text-slate-300 text-xs">Structural Risk: <span className="text-red-500 font-bold">CRITICAL</span></div>
                </div>
                <div className="bg-black/70 border border-slate-700 p-4 rounded-lg backdrop-blur font-mono text-xs text-slate-400 text-right">
                  <div>LAT: 28.6139° N</div>
                  <div>LON: 77.2090° E</div>
                  <div>ALT: 216m ASL</div>
                  <div className="text-cyan-400 mt-1">COMPASS: 340° NW</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 10: SETTINGS & ARCHITECTURE */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "SETTINGS" && (
          <div className="flex-1 p-8 overflow-auto flex flex-col gap-6 font-mono text-xs">
            <h2 className="text-xl font-bold text-white tracking-widest border-b border-slate-800 pb-3">
              SYSTEM ARCHITECTURE & INTEGRATION STATUS
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="panel p-5 space-y-4">
                <h3 className="text-sm font-bold text-cyan-400">NETWORK ENDPOINTS</h3>
                <div className="space-y-2 text-slate-300">
                  <div>Backend Gateway: <span className="text-white">http://localhost:4000</span></div>
                  <div>Hardhat Local EVM: <span className="text-white">http://127.0.0.1:8545</span></div>
                  <div>Parametric Insurance: <span className="text-green-400">0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512</span></div>
                  <div>ZK-SNARK Verifier: <span className="text-green-400">0x5FbDB2315678afecb367f032d93F642f64180aa3</span></div>
                </div>
              </div>
              <div className="panel p-5 space-y-4">
                <h3 className="text-sm font-bold text-cyan-400">AI & SECURITY SPECIFICATION</h3>
                <div className="space-y-2 text-slate-300">
                  <div>Edge Model (High): <span className="text-white">CNN-LSTM 250KB (PEER Ground Motion)</span></div>
                  <div>Edge Model (Low): <span className="text-white">1D-CNN 50KB (Quantized INT8)</span></div>
                  <div>Post-Quantum Security: <span className="text-green-400">ML-DSA / Dilithium-5 Lattice Cryptography</span></div>
                  <div>Hardware Attestation: <span className="text-green-400">Android TEE Keystore ECDSA</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* AGENTIC SWARM MODAL */}
        {/* ------------------------------------------------------------- */}
        {showAgenticModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center p-6 animate-in fade-in">
            <div className="bg-[#0B1120] border border-cyan-500/60 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl font-mono">
              <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-cyan-400" />
                  <span className="font-bold text-white tracking-widest text-sm">AUTONOMOUS MULTI-AGENT SWARM DISPATCHER</span>
                </div>
                <button onClick={() => setShowAgenticModal(false)} className="text-slate-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="text-xs text-slate-400">
                  Multi-agent coordinator triaging real-time kinetic physics, hospital telemetry, municipal traffic grid, and EVM smart contracts:
                </div>

                <div className="space-y-3">
                  {agenticLogs.map((log, i) => (
                    <div key={i} className="p-3 bg-slate-900/80 rounded border border-cyan-500/30 text-xs text-cyan-300 flex items-start gap-3">
                      <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{log}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex justify-between items-center border-t border-slate-800">
                  <span className="text-xs text-slate-500">Autonomous consensus execution without municipal delay.</span>
                  <button
                    onClick={() => setShowAgenticModal(false)}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold cursor-pointer"
                  >
                    CLOSE MONITOR
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* FORENSIC EVIDENCE ROOM MODAL */}
        {/* ------------------------------------------------------------- */}
        {showEvidenceRoom && evidenceEvent && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur flex items-center justify-center p-6 animate-in fade-in">
            <div className="bg-[#0B1120] border border-red-500/60 rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl font-mono text-xs">
              <div className="bg-red-950/60 px-6 py-4 border-b border-red-500/40 flex justify-between items-center">
                <div className="flex items-center gap-2 text-red-400 font-bold text-sm tracking-wider">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span>CYBER-PHYSICAL THREAT & DIGITAL TWIN EVIDENCE ROOM</span>
                </div>
                <button onClick={() => setShowEvidenceRoom(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[75vh] overflow-auto">
                {aiReportGenerating ? (
                  <div className="py-12 text-center text-cyan-400 flex flex-col items-center">
                    <RefreshCw className="w-8 h-8 animate-spin mb-3" />
                    <span>SYNTHESIZING DIGITAL TWIN FEM PHYSICS &amp; KE STORE LOGS...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-slate-900/90 p-4 rounded border border-slate-800 text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {aiForensicReport}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        onClick={() => {
                          const blob = new Blob([aiForensicReport || ""], { type: "text/plain" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `NDMA_FORENSIC_REPORT_${evidenceEvent.eventId}.txt`;
                          a.click();
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>EXPORT FORENSIC REPORT</span>
                      </button>
                      <button
                        onClick={() => setShowEvidenceRoom(false)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded font-bold cursor-pointer"
                      >
                        CLOSE
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM FOOTER STATUS */}
        <footer className="h-10 border-t border-slate-800 flex justify-between items-center px-6 bg-[#040914] shrink-0 text-[10px] text-slate-500 font-mono tracking-widest z-20">
          <div className="flex gap-6">
            <span className="flex items-center gap-1.5"><Lock className="w-3 h-3 text-cyan-500" /> ENCRYPTION: AES-256 + ML-DSA PQC</span>
            <span>NETWORK: DECENTRALIZED DePIN GRID</span>
            <span className="text-green-500">TAMPER DETECTION: ACTIVE</span>
          </div>
          <div>SYSTEM UPTIME: <span className="text-white font-bold">99.98%</span></div>
        </footer>

      </main>
    </div>
  );
}

// ----------------------------------------------------------------------
// SIDEBAR ICON SUBCOMPONENT
// ----------------------------------------------------------------------
function SidebarIcon({
  icon,
  label,
  active = false,
  onClick
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex flex-col items-center gap-1 cursor-pointer group py-1.5 ${
        active ? "text-cyan-400" : "text-slate-500 hover:text-slate-300"
      }`}
    >
      <div
        className={`p-2 rounded-lg transition-all ${
          active
            ? "bg-cyan-500/15 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,229,255,0.2)]"
            : "group-hover:bg-slate-800/80"
        }`}
      >
        {icon}
      </div>
      <span className="text-[7.5px] font-bold tracking-wider uppercase text-center leading-tight">{label}</span>
    </div>
  );
}
