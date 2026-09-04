"use client";

import { useState, useEffect, useRef } from "react";
import { Activity, ShieldAlert, History, Settings, CheckCircle2, AlertTriangle, MapPin, RadioTower, X, Fingerprint, Database, Maximize2, Server, Cpu, Network, Link, Check, Clock, Box as BoxIcon, FileText, Download, Sparkles, Coins, Mic, MicOff } from "lucide-react";
import Map, { Marker, MapRef } from "react-map-gl/maplibre";
import 'maplibre-gl/dist/maplibre-gl.css';
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Box, Environment, Grid, Line } from "@react-three/drei";

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
}

function InfraHealthView({ liveEvents }: { liveEvents: EventPayload[] }) {
  const hasCriticalEvent = liveEvents.some(evt => evt.status === 'CRITICAL');
  const bridgeHealth = hasCriticalEvent ? 24 : 98;
  const bridgeStatus = hasCriticalEvent ? "Critical Failure" : "Optimal";

  return (
    <div className="flex-1 p-8 bg-[#0a0a0a] overflow-y-auto">
      <h2 className="text-2xl font-bold text-white mb-6 border-b border-neutral-800 pb-4">Infrastructure Health Matrix</h2>
      <div className="grid grid-cols-2 gap-6">
        {[
          { name: "Downtown Bridge 01", health: bridgeHealth, lastCheck: "Live (Synced)", status: bridgeStatus },
          { name: "Sector 7 Residential", health: 92, lastCheck: "1 min ago", status: "Stable" },
          { name: "Metro Line B Tunnel", health: 100, lastCheck: "Live", status: "Optimal" },
          { name: "City Hall Foundation", health: 89, lastCheck: "5 mins ago", status: "Stable" }
        ].map((infra, idx) => (
          <div key={idx} className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">{infra.name}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${infra.health < 50 ? 'bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                {infra.status}
              </span>
            </div>
            <div className="flex-1 flex flex-col justify-end">
              <div className="flex justify-between text-xs text-neutral-400 mb-2 font-mono">
                <span>Structural Integrity</span>
                <span className={infra.health < 50 ? 'text-red-500' : 'text-green-400'}>{infra.health}%</span>
              </div>
              <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-800">
                <div className={`h-full ${infra.health < 50 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${infra.health}%` }}></div>
              </div>
              <div className="text-[10px] text-neutral-500 mt-4 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Last Twin Sync: {infra.lastCheck}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuditLedgerView({ liveEvents }: { liveEvents: EventPayload[] }) {
  return (
    <div className="flex-1 p-8 bg-[#0a0a0a] overflow-y-auto">
      <div className="flex justify-between items-end mb-6 border-b border-neutral-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Hyperledger Fabric Ledger</h2>
          <p className="text-sm text-neutral-500">Immutable Cryptographic Audit Trail</p>
        </div>
        <div className="flex items-center gap-2 text-green-500 text-sm font-bold bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/20">
          <Link className="w-4 h-4" /> Blocks Syncing Live
        </div>
      </div>
      
      <div className="space-y-4">
        {liveEvents.length === 0 ? (
          <div className="text-neutral-500 text-center py-10">Awaiting Genesis Block Events...</div>
        ) : (
          liveEvents.map((evt, idx) => (
            <div key={idx} className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex items-center gap-6">
              <div className="w-12 h-12 bg-neutral-950 rounded-lg border border-neutral-800 flex items-center justify-center">
                <Fingerprint className="w-6 h-6 text-neutral-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm font-bold text-white truncate max-w-md">Tx: {evt.ledgerHash || "0x98f3c... (Pending)"}</span>
                  {evt.ledgerHash && <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] px-2 py-0.5 rounded uppercase font-bold">Anchored</span>}
                </div>
                <div className="text-xs text-neutral-500 font-mono">
                  Payload ID: {evt.eventId} • Signed by: {evt.deviceId}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-neutral-400 mb-1">{new Date(evt.timestamp).toLocaleString()}</div>
                <div className="flex items-center justify-end gap-1 text-[10px] text-green-500 font-bold uppercase">
                  <Check className="w-3 h-3" /> PQC Verified
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function NetworkStatusView({ liveEvents }: { liveEvents: EventPayload[] }) {
  const uniqueDevices = new Set(liveEvents.map(e => e.deviceId)).size;
  
  return (
    <div className="flex-1 p-8 bg-[#0a0a0a] overflow-y-auto">
      <h2 className="text-2xl font-bold text-white mb-6 border-b border-neutral-800 pb-4">Mesh Network Topology</h2>
      
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Cpu className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{uniqueDevices}</div>
            <div className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Active Edge Nodes</div>
          </div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
            <Network className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{uniqueDevices > 0 ? 1 : 0}</div>
            <div className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Active BLE Meshes</div>
          </div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
            <Server className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">100.0%</div>
            <div className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Gateway Uptime</div>
          </div>
        </div>
      </div>

      <div className="w-full h-64 bg-neutral-900 border border-neutral-800 rounded-xl relative overflow-hidden flex flex-col items-center justify-center">
        {/* Decorative Network Diagram */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-700 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <Database className="w-16 h-16 text-neutral-600 z-10 mb-4" />
        <p className="text-neutral-400 font-mono text-sm z-10">Ingestion Gateway cluster routing traffic...</p>
      </div>
    </div>
  );
}

function TokenomicsView({ liveEvents }: { liveEvents: EventPayload[] }) {
  // Mock token increment based on live events length
  const totalTokensMinted = 452109 + (liveEvents.length * 15);
  
  return (
    <div className="flex-1 p-8 bg-[#0a0a0a] overflow-y-auto">
      <h2 className="text-2xl font-bold text-white mb-6 border-b border-neutral-800 pb-4">Citizen Tokenomics (DePIN)</h2>
      
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
            <Coins className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <div className="text-3xl font-bold text-white">{totalTokensMinted.toLocaleString()} <span className="text-sm text-yellow-500">SCT</span></div>
            <div className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Total Tokens Minted</div>
          </div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <div className="text-3xl font-bold text-white">12.50 <span className="text-sm text-yellow-500">SCT/hr</span></div>
            <div className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Current Network Reward Rate</div>
          </div>
        </div>
      </div>
      
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl relative overflow-hidden">
         <div className="absolute -right-10 -top-10 opacity-5">
           <Coins className="w-64 h-64 text-yellow-500" />
         </div>
         <h3 className="text-lg font-bold text-white mb-4 relative z-10">Why SecureCity Tokens (SCT)?</h3>
         <p className="text-neutral-400 text-sm leading-relaxed mb-4 relative z-10 max-w-3xl">
            To solve the "cold start" and user-adoption problem for a citizen sensor network, users must be incentivized to keep the app running in the background while draining a small amount of battery. 
         </p>
         <p className="text-neutral-400 text-sm leading-relaxed relative z-10 max-w-3xl">
            By acting as a <strong>Decentralized Physical Infrastructure Network (DePIN)</strong>, the system automatically mints and rewards SCT tokens to citizens via the Hyperledger Smart Contract for every hour they provide verified structural vibration data.
         </p>
      </div>
    </div>
  );
}

function DigitalTwinView({ liveEvents }: { liveEvents: EventPayload[] }) {
  const hasCriticalEvent = liveEvents.some(evt => evt.status === 'CRITICAL');

  return (
    <div className="flex-1 w-full h-full relative bg-[#050505]">
       <div className="absolute top-8 left-8 z-10 bg-neutral-900/80 p-6 rounded-xl border border-neutral-800 backdrop-blur shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-2">3D Digital Twin Viewer</h2>
          <p className="text-xs text-neutral-400 font-mono mb-4">Rendering Structural Finite Element Model (FEM)</p>
          <div className="flex gap-2">
             <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] uppercase font-bold rounded">Target: Bridge 01</span>
             <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] uppercase font-bold rounded">Sync: Live</span>
             {hasCriticalEvent ? (
               <>
                 <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] uppercase font-bold rounded animate-pulse">Critical Stress</span>
                 <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] uppercase font-bold rounded">AI Evacuation Active</span>
               </>
             ) : (
               <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase font-bold rounded">Structure Optimal</span>
             )}
          </div>
       </div>

       {/* WebXR 3D Canvas */}
       <Canvas camera={{ position: [8, 6, 8], fov: 45 }}>
          <color attach="background" args={["#050505"]} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
          <Environment preset="city" />
          <Grid infiniteGrid fadeDistance={40} fadeStrength={5} cellColor="#333" sectionColor="#666" />
          <OrbitControls makeDefault autoRotate autoRotateSpeed={0.5} />
          
          {/* Mock Bridge Structure */}
          <group position={[0, 1, 0]}>
             {/* Base pillars */}
             <Box args={[1.5, 4, 1.5]} position={[-3, 0, 0]}>
                <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
             </Box>
             <Box args={[1.5, 4, 1.5]} position={[3, 0, 0]}>
                <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
             </Box>
             {/* Main deck */}
             <Box args={[12, 0.5, 3]} position={[0, 2.25, 0]}>
                <meshStandardMaterial color="#444444" roughness={0.6} metalness={0.3} />
             </Box>
             {/* Stressed Zone (Glowing Red indicating the anomaly, or normal if safe) */}
             <Box args={[2.5, 0.6, 3.1]} position={[-1.5, 2.25, 0]}>
                {hasCriticalEvent ? (
                  <meshStandardMaterial color="#ff3333" emissive="#ff0000" emissiveIntensity={2} toneMapped={false} />
                ) : (
                  <meshStandardMaterial color="#444444" roughness={0.6} metalness={0.3} />
                )}
             </Box>
          </group>

          {/* Epic 10: AI Predictive Evacuation Vectors (Only show during CRITICAL event) */}
          {hasCriticalEvent && (
            <>
              {/* Optimal Clear Route (Cyan) */}
              <Line 
                 points={[[-5, 0.2, 2], [-2, 0.2, 5], [4, 0.2, 5], [8, 0.2, 2]]} 
                 color="#00ffff" 
                 lineWidth={3}
                 dashed={true}
                 dashScale={20}
                 dashSize={1}
                 dashOffset={0}
              />
              {/* Bottleneck Warning Route (Orange) */}
              <Line 
                 points={[[-4, 0.2, -2], [0, 0.2, -4], [4, 0.2, -4]]} 
                 color="#ff9900" 
                 lineWidth={3}
                 dashed={true}
                 dashScale={20}
              />
            </>
          )}
       </Canvas>
    </div>
  );
}

export default function AuthorityDashboard() {
  const [activeTab, setActiveTab] = useState('tactical');
  const [isEvidenceRoomOpen, setIsEvidenceRoomOpen] = useState(false);
  const [liveEvents, setLiveEvents] = useState<EventPayload[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventPayload | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [showSMS, setShowSMS] = useState(false);
  const [showAgenticWorkflow, setShowAgenticWorkflow] = useState(false);
  const [agenticLogs, setAgenticLogs] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const mapRef = useRef<MapRef>(null);

  // Poll the backend gateway for live events every 2 seconds
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/events");
        const data = await res.json();
        // Reverse array to show newest events at the top
        setLiveEvents(data.reverse());
      } catch (err) {
        console.error("Gateway offline or unreachable: ", err);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 2000);
    return () => clearInterval(interval);
  }, []);

  // Epic 13: 3D Drone Flight Hack
  // Animate the camera from standard top-down view into a 3D isometric drone flight over the coordinates
  useEffect(() => {
    if (activeTab === 'tactical' && liveEvents.length > 0 && liveEvents[0].status === 'CRITICAL' && mapRef.current) {
       mapRef.current.flyTo({
          center: [liveEvents[0].longitude || 77.2090, liveEvents[0].latitude || 28.6139],
          zoom: 17.5,
          pitch: 65,  // Tilt down into 3D view
          bearing: 45, // Rotate to look dynamic
          duration: 4000, // 4 second flight time
          essential: true
       });
    }

    // Phase 2: Trigger Mock SMS Notification & Agentic Workflow
    if (liveEvents.length > 0 && liveEvents[0].status === 'CRITICAL') {
      setShowSMS(true);
      setShowAgenticWorkflow(true);
      
      const t1 = setTimeout(() => setShowSMS(false), 10000);
      
      // Simulate Agentic AI autonomous actions
      setAgenticLogs([]);
      const agentActions = [
        "[Agent-1: Medical] Querying City Hospital ICU capacity... [OK] 42 beds reserved.",
        "[Agent-2: Traffic] Interfacing with Municipal Grid API... [OK] Re-routing traffic 5km away.",
        "[Agent-3: Insurance] Compiling evidence for Parametric Contract... [OK] Tx 0x8f2a submitted.",
        "[Agent-4: Drone Ops] Launching inspection swarm to GPS coordinates... [OK] Airborne (ETA 4m)."
      ];
      
      agentActions.forEach((log, index) => {
        setTimeout(() => {
          setAgenticLogs(prev => [...prev, log]);
        }, (index + 1) * 1500); // Stagger each action by 1.5 seconds
      });
      
      return () => {
         clearTimeout(t1);
      };
    }
  }, [liveEvents, activeTab]);

  const openEvidenceRoom = (evt: EventPayload) => {
    setSelectedEvent(evt);
    setGeneratedReport(null);
    setIsGeneratingReport(false);
    setIsEvidenceRoomOpen(true);
  };

  const generateAIReport = () => {
    setIsGeneratingReport(true);
    setGeneratedReport("");
    
    const isCyberThreat = selectedEvent && parseFloat(selectedEvent.twinCorrelation || "1.0") < 0.4;
    
    const naturalReport = `URGENT AI FORENSIC ANALYSIS
--------------------------------
Event ID: ${selectedEvent?.eventId}
Timestamp: ${new Date(selectedEvent?.timestamp || "").toLocaleString()}
Location: Downtown Bridge 01 (Demo Mode GPS)

ANALYSIS:
Edge AI has detected severe structural micro-fractures in the primary load-bearing pylon. The kinetic shockwave (Risk Score: ${selectedEvent?.finalRiskScore}) strongly correlates (${(parseFloat(selectedEvent?.twinCorrelation || "0") * 100).toFixed(1)}%) with a Class 4 structural failure in the Civil Engineering Twin Model. 

RECOMMENDED ACTION:
1. Immediate cessation of all civilian traffic.
2. Dispatch Structural Engineers to Pylon 3.
3. Deploy automated drone swarm for visual inspection.`;

    const cyberReport = `URGENT AI FORENSIC ANALYSIS: CYBER-PHYSICAL THREAT
------------------------------------------------
Event ID: ${selectedEvent?.eventId}
Timestamp: ${new Date(selectedEvent?.timestamp || "").toLocaleString()}
Location: Downtown Bridge 01 (Demo Mode GPS)

ANALYSIS:
CRITICAL ANOMALY. The physical sensors are registering extreme kinetic vibrations (Risk Score: ${selectedEvent?.finalRiskScore}), however, this data DOES NOT CORRELATE (${(parseFloat(selectedEvent?.twinCorrelation || "0") * 100).toFixed(1)}%) with any natural seismic or physics-based failure models. 

CONCLUSION: Suspected State-Sponsored Cyber Attack on the Bridge's Active Damping Systems. Hackers are artificially inducing resonant frequencies to collapse the structure.

RECOMMENDED ACTION:
1. Sever network connection to Bridge 01 Active Dampers immediately.
2. Deploy cyber-security response team.
3. Evacuate civilians from blast radius.`;

    const reportText = isCyberThreat ? cyberReport : naturalReport;

    let i = 0;
    const intervalId = setInterval(() => {
      setGeneratedReport(reportText.substring(0, i));
      i++;
      if (i > reportText.length) {
        clearInterval(intervalId);
        setIsGeneratingReport(false);
      }
    }, 15);
  };

  const startVoiceCommand = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice AI is not supported in this browser. Please use Chrome.");
      return;
    }
    
    setIsListening(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript.toLowerCase();
      console.log("Voice Command Received:", command);
      
      if (command.includes("tactical") || command.includes("map")) {
        setActiveTab("tactical");
      } else if (command.includes("health") || command.includes("infrastructure")) {
        setActiveTab("health");
      } else if (command.includes("ledger") || command.includes("audit") || command.includes("blockchain")) {
        setActiveTab("audit");
      } else if (command.includes("network") || command.includes("status")) {
        setActiveTab("network");
      } else if (command.includes("twin") || command.includes("3d") || command.includes("bridge")) {
        setActiveTab("digital-twin");
      } else if (command.includes("token") || command.includes("economy") || command.includes("reward")) {
        setActiveTab("tokenomics");
      }
      
      setIsListening(false);
    };
    
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  return (
    <div className="flex h-screen w-full bg-neutral-950 text-neutral-200 overflow-hidden font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-neutral-800 bg-neutral-950/50 backdrop-blur flex flex-col z-20">
        <div className="p-6 border-b border-neutral-800">
          <h1 className="text-xl font-bold text-white flex items-center gap-2 tracking-tight">
            <ShieldAlert className="w-5 h-5 text-orange-500" />
            NDMA Auth
          </h1>
          <p className="text-xs text-neutral-500 mt-1 uppercase tracking-widest font-semibold">Citizen Sensor Net</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('tactical')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'tactical' 
                ? 'bg-neutral-900 text-white border border-neutral-800 shadow-sm shadow-orange-500/10' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <MapPin className={`w-4 h-4 ${activeTab === 'tactical' ? 'text-orange-500' : ''}`} />
            <span className="font-medium text-sm">Tactical Command</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('infra')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'infra' 
                ? 'bg-neutral-900 text-white border border-neutral-800 shadow-sm shadow-orange-500/10' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Activity className={`w-4 h-4 ${activeTab === 'infra' ? 'text-orange-500' : ''}`} />
            <span className="font-medium text-sm">Infra Health</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('audit')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'audit' 
                ? 'bg-neutral-900 text-white border border-neutral-800 shadow-sm shadow-orange-500/10' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <History className={`w-4 h-4 ${activeTab === 'audit' ? 'text-orange-500' : ''}`} />
            <span className="font-medium text-sm">Audit & Ledger</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('network')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'network' 
                ? 'bg-neutral-900 text-white border border-neutral-800 shadow-sm shadow-orange-500/10' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <RadioTower className={`w-4 h-4 ${activeTab === 'network' ? 'text-orange-500' : ''}`} />
            <span className="font-medium text-sm">Network Status</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('digital-twin')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'digital-twin' 
                ? 'bg-neutral-900 text-white border border-neutral-800 shadow-sm shadow-orange-500/10' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <BoxIcon className={`w-4 h-4 ${activeTab === 'digital-twin' ? 'text-orange-500' : ''}`} />
            <span className="font-medium text-sm">3D Digital Twin</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('tokenomics')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'tokenomics' 
                ? 'bg-neutral-900 text-white border border-neutral-800 shadow-sm shadow-orange-500/10' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Coins className={`w-4 h-4 ${activeTab === 'tokenomics' ? 'text-orange-500' : ''}`} />
            <span className="font-medium text-sm">Citizen Tokenomics</span>
          </button>
        </nav>

        <div className="p-4 border-t border-neutral-800">
          <button className="w-full flex items-center gap-3 px-4 py-2 text-neutral-500 hover:text-neutral-300 transition-colors">
            <Settings className="w-4 h-4" />
            <span className="font-medium text-sm">Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col relative bg-[#0a0a0a]">
        {/* Top HUD */}
        <header className="absolute top-0 w-full p-6 flex justify-between items-center z-10 pointer-events-none">
          <div className="flex gap-4 pointer-events-auto">
            <div className="px-4 py-2 bg-neutral-900/80 backdrop-blur border border-neutral-800 rounded-full flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-green-400">System Normal</span>
            </div>
            <div className="px-4 py-2 bg-neutral-900/80 backdrop-blur border border-neutral-800 rounded-full flex items-center gap-2 shadow-lg">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Active Sensors:</span>
              <span className="text-xs font-bold text-white">{new Set(liveEvents.map(e => e.deviceId)).size}</span>
            </div>
          </div>
        </header>

        {/* Dynamic Views */}
        {activeTab === 'tactical' ? (
          <div className="flex-1 relative w-full h-full">
            <Map
              ref={mapRef}
              initialViewState={{
                longitude: 77.2090,
                latitude: 28.6139,
                zoom: 12
              }}
              maxZoom={19}
              mapStyle={{
                version: 8,
                sources: {
                  'osm': {
                    type: 'raster',
                    tiles: [
                      'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
                      'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
                      'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    ],
                    tileSize: 256,
                    attribution: '&copy; OpenStreetMap contributors'
                  }
                },
                layers: [
                  {
                    id: 'osm-layer',
                    type: 'raster',
                    source: 'osm',
                    minzoom: 0,
                    maxzoom: 19
                  }
                ]
              }}
              style={{ 
                width: '100%', 
                height: '100%',
                filter: 'invert(100%) hue-rotate(180deg) brightness(85%) contrast(90%)'
              }}
            >
              {/* Show a marker for the most recent CRITICAL event */}
              {liveEvents.length > 0 && liveEvents[0].status === 'CRITICAL' && (
                <Marker 
                  longitude={liveEvents[0].longitude || 77.2090} 
                  latitude={liveEvents[0].latitude || 28.6139} 
                  anchor="center"
                >
                   <button 
                     onClick={() => openEvidenceRoom(liveEvents[0])}
                     className="relative group cursor-pointer"
                   >
                     {/* Giant Expanding Blast Radius (Shockwave) */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/5 border border-red-500/20 rounded-full flex items-center justify-center animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-600/10 border border-red-500/30 rounded-full flex items-center justify-center animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite_1s]"></div>
                     
                     {/* Localized Event Pulse Rings */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-orange-500/20 rounded-full flex items-center justify-center z-10">
                        <div className="w-32 h-32 border border-orange-500/30 rounded-full flex items-center justify-center">
                           <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]">
                              <div className="w-6 h-6 bg-orange-500 rounded-full shadow-[0_0_30px_rgba(249,115,22,1)] transition-transform group-hover:scale-125"></div>
                           </div>
                        </div>
                     </div>
                     
                     {/* Marker Core */}
                     <div className="w-6 h-6 bg-orange-500 rounded-full shadow-[0_0_30px_rgba(249,115,22,1)] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform z-20"></div>
                   </button>
                </Marker>
              )}
            </Map>
          </div>
        ) : activeTab === 'digital-twin' ? (
          <DigitalTwinView liveEvents={liveEvents} />
        ) : activeTab === 'infra' ? (
          <InfraHealthView liveEvents={liveEvents} />
        ) : activeTab === 'audit' ? (
          <AuditLedgerView liveEvents={liveEvents} />
        ) : activeTab === 'network' ? (
          <NetworkStatusView liveEvents={liveEvents} />
        ) : activeTab === 'tokenomics' ? (
          <TokenomicsView liveEvents={liveEvents} />
        ) : null}

        {/* EVIDENCE ROOM MODAL */}
        {isEvidenceRoomOpen && selectedEvent && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm">
            <div className={`w-full max-w-4xl bg-neutral-900 border ${
               parseFloat(selectedEvent.twinCorrelation) < 0.4 ? 'border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.2)]' : 'border-neutral-700 shadow-2xl'
            } rounded-2xl flex flex-col max-h-full overflow-hidden animate-in zoom-in-95 duration-200`}>
              
              {/* Header */}
              <div className={`p-4 border-b ${parseFloat(selectedEvent.twinCorrelation) < 0.4 ? 'bg-red-950/50 border-red-900' : 'bg-neutral-950 border-neutral-800'} flex justify-between items-center`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${parseFloat(selectedEvent.twinCorrelation) < 0.4 ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-orange-500/20 text-orange-500 border border-orange-500/30'} flex items-center justify-center`}>
                    {parseFloat(selectedEvent.twinCorrelation) < 0.4 ? <AlertTriangle className="w-5 h-5 animate-pulse" /> : <Fingerprint className="w-5 h-5" />}
                  </div>
                  <div>
                    <h2 className={`text-lg font-bold ${parseFloat(selectedEvent.twinCorrelation) < 0.4 ? 'text-red-500' : 'text-white'}`}>
                      {parseFloat(selectedEvent.twinCorrelation) < 0.4 ? 'CYBER-PHYSICAL THREAT DETECTED' : 'EVIDENCE ROOM: ANOMALY'}
                    </h2>
                    <p className="text-xs text-neutral-400 font-mono">ID: {selectedEvent.eventId}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsEvidenceRoomOpen(false)}
                  className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body: The 3 Pillars of Evidence */}
              <div className="flex-1 p-6 grid grid-cols-3 gap-6 bg-neutral-900/30">
                
                {/* Pillar 1: Spatial/Multi-Device Evidence */}
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <Maximize2 className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">1. Spatial Correlation</h3>
                  </div>
                  <p className="text-xs text-neutral-400 mb-4">Simultaneous high-magnitude vector changes detected across a tightly packed cluster of devices.</p>
                  <div className="flex-1 border border-neutral-800 rounded-lg bg-neutral-900 flex items-center justify-center relative overflow-hidden">
                     <div className="absolute w-24 h-24 bg-blue-500/10 rounded-full border border-blue-500/20"></div>
                     <div className="flex gap-2">
                       <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,1)]"></span>
                       <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,1)]"></span>
                       <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,1)] mt-4"></span>
                     </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center px-3 py-2 bg-blue-500/10 text-blue-400 rounded text-xs font-bold">
                    <span>Contributing Devices:</span>
                    <span>1 (Demo)</span>
                  </div>
                </div>

                {/* Pillar 2: Physics/Twin Validation */}
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <Database className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">2. Twin Validation</h3>
                  </div>
                  <p className="text-xs text-neutral-400 mb-4">Vibration readings matched against the Civil Engineering finite element model for this structure.</p>
                  <div className="flex-1 border border-neutral-800 rounded-lg bg-neutral-900 flex flex-col items-center justify-center relative p-4 space-y-4">
                     <div className="w-full flex items-end justify-between h-16 gap-1 border-b border-neutral-700/50 pb-1">
                        <div className="w-1/6 h-full bg-neutral-700/50 rounded-t"></div>
                        <div className="w-1/6 h-3/4 bg-neutral-700/50 rounded-t"></div>
                        <div className="w-1/6 h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)] rounded-t"></div>
                        <div className="w-1/6 h-1/2 bg-neutral-700/50 rounded-t"></div>
                     </div>
                     <span className="text-[10px] font-mono text-neutral-500">Measured vs. Predicted Response</span>
                  </div>
                  <div className="mt-4 flex justify-between items-center px-3 py-2 bg-purple-500/10 text-purple-400 rounded text-xs font-bold">
                    <span>Physics Match:</span>
                    <span>{(parseFloat(selectedEvent.twinCorrelation) * 100).toFixed(1)}%</span>
                  </div>
                </div>

                {/* Pillar 3: Cryptographic Integrity */}
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <Fingerprint className="w-4 h-4 text-green-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">3. Crypto Audit</h3>
                  </div>
                  <p className="text-xs text-neutral-400 mb-4">Hardware-backed signatures verified. Payload anchored to the Hyperledger Permissioned Blockchain.</p>
                  <div className="flex-1 border border-neutral-800 rounded-lg bg-neutral-900 flex flex-col p-3 space-y-3 font-mono text-[10px] text-neutral-400">
                     <div>
                       <span className="text-neutral-500 block">Ledger Tx ID:</span>
                       <span className="text-green-400 truncate block">0x8f2a99c4d7b112e...</span>
                     </div>
                     <div>
                       <span className="text-neutral-500 block">Data Payload Hash:</span>
                       <span className="text-neutral-300 truncate block">{selectedEvent.ledgerHash.substring(0, 24)}...</span>
                     </div>
                     <div>
                       <span className="text-neutral-500 block">Signatures Verified:</span>
                       <span className="text-green-400">Passed</span>
                     </div>
                  </div>
                  <button className="mt-4 w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs font-bold transition-colors">
                    View on Ledger
                  </button>
                </div>

              </div>

              {/* GenAI Report Section */}
              <div className="px-6 pb-6">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 relative overflow-hidden">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-400" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wide">Generative AI Forensic Report</h3>
                    </div>
                    {!generatedReport && !isGeneratingReport && (
                      <button 
                        onClick={generateAIReport}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded flex items-center gap-2 transition-colors"
                      >
                        <FileText className="w-4 h-4" /> Generate Report
                      </button>
                    )}
                    {(generatedReport || isGeneratingReport) && (
                      <button 
                        className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded flex items-center gap-2 transition-colors"
                      >
                        <Download className="w-4 h-4" /> Export PDF
                      </button>
                    )}
                  </div>
                  
                  {(isGeneratingReport || generatedReport) && (
                    <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 font-mono text-xs text-neutral-300 whitespace-pre-wrap min-h-[100px]">
                      {generatedReport}
                      {isGeneratingReport && <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse"></span>}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-neutral-800 flex justify-between items-center bg-neutral-900">
                <div className="flex items-center gap-4">
                   <div className="text-sm">
                     <span className="text-neutral-500 uppercase font-bold mr-2">Final Risk Score:</span>
                     <span className="text-xl font-bold text-orange-500">{selectedEvent.finalRiskScore}</span>
                   </div>
                   <div className="px-3 py-1 bg-red-500/10 text-red-500 text-xs font-bold rounded-full border border-red-500/20">
                     ACTION REQUIRED
                   </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setIsEvidenceRoomOpen(false)} className="px-6 py-2 rounded font-bold text-sm bg-neutral-800 text-white hover:bg-neutral-700 transition-colors">
                    Dismiss
                  </button>
                  <button className="px-6 py-2 rounded font-bold text-sm bg-orange-600 text-white hover:bg-orange-500 transition-colors shadow-[0_0_15px_rgba(234,88,12,0.3)]">
                    Dispatch Emergency Services
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* MOCK SMS NOTIFICATION */}
      {showSMS && (
        <div className="absolute top-8 right-8 z-[100] animate-in slide-in-from-top-10 fade-in duration-300">
          <div className="w-80 bg-[#1c1c1e]/90 backdrop-blur-xl border border-neutral-700/50 rounded-2xl shadow-2xl p-4 flex gap-4">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
              <span className="text-white text-xl">💬</span>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-white font-semibold text-sm tracking-wide">NDMA Emergency</span>
                <span className="text-neutral-400 text-xs">now</span>
              </div>
              <p className="text-white/90 text-xs leading-snug">
                ⚠️ <span className="font-bold">CRITICAL ALERT:</span> Structural failure detected at Bridge 01. Immediate evacuation required.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AGENTIC AI AUTONOMOUS DISPATCHER UI */}
      {showAgenticWorkflow && (
        <div className="absolute bottom-8 right-8 z-[90] w-96 animate-in slide-in-from-bottom-10 fade-in duration-500">
          <div className="bg-[#0a0a0a]/95 backdrop-blur-xl border border-blue-500/30 rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.15)] overflow-hidden flex flex-col">
            <div className="bg-blue-900/20 border-b border-blue-500/20 p-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest">Agentic AI Swarm Active</h3>
              </div>
              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">AUTONOMOUS</span>
            </div>
            
            <div className="p-4 space-y-3 min-h-[160px] font-mono text-[10px]">
               {agenticLogs.length === 0 ? (
                 <div className="text-neutral-500 italic">Initializing autonomous agents...</div>
               ) : (
                 agenticLogs.map((log, i) => (
                   <div key={i} className="animate-in slide-in-from-left-2 fade-in duration-300">
                     <span className="text-blue-500 mr-2">❯</span>
                     <span className={log.includes("[OK]") ? "text-green-400" : "text-neutral-300"}>
                       {log.split("[OK]").map((part, index, array) => 
                          index === 0 && array.length > 1 ? (
                            <span key={index}>{part}<span className="text-green-500 font-bold bg-green-500/10 px-1 py-0.5 rounded ml-1">[OK]</span></span>
                          ) : (
                            <span key={index}>{part}</span>
                          )
                       )}
                     </span>
                   </div>
                 ))
               )}
            </div>
            
            {agenticLogs.length === 4 && (
              <div className="bg-green-900/20 border-t border-green-500/20 p-2 text-center">
                <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest flex justify-center items-center gap-2">
                  <CheckCircle2 className="w-3 h-3" /> All Agents Dispatched
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VOCAL AI COMMAND CENTER BUTTON */}
      <div className="absolute bottom-8 left-72 z-[100]">
        <button 
          onClick={startVoiceCommand}
          className={`flex items-center gap-3 px-6 py-4 rounded-full font-bold shadow-2xl transition-all duration-300 ${
            isListening 
              ? 'bg-red-500 text-white animate-pulse shadow-red-500/50' 
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
          }`}
        >
          {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          <span>{isListening ? "Listening..." : "Vocal AI Assistant"}</span>
        </button>
      </div>

      {/* Right Panel: Event Feed */}
      <aside className="w-80 border-l border-neutral-800 bg-neutral-950/50 backdrop-blur flex flex-col z-20">
        <div className="p-4 border-b border-neutral-800 flex justify-between items-center">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Live Event Feed</h2>
          <span className="text-[10px] bg-neutral-800 px-2 py-1 rounded-full text-neutral-400 font-mono">LIVE</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-neutral-800">
          
          {liveEvents.length === 0 ? (
             <div className="text-center text-neutral-500 text-sm mt-10">No anomalies detected. Listening...</div>
          ) : (
            liveEvents.map((evt, idx) => (
              <div 
                key={idx}
                onClick={() => evt.status === 'CRITICAL' && openEvidenceRoom(evt)}
                className={`p-4 rounded-xl relative overflow-hidden group ${
                  evt.status === 'CRITICAL' 
                    ? 'bg-orange-500/10 border border-orange-500/20 cursor-pointer hover:bg-orange-500/20' 
                    : 'bg-neutral-900 border border-neutral-800'
                }`}
              >
                {evt.status === 'CRITICAL' && <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {evt.status === 'CRITICAL' ? (
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-500"></span>
                    )}
                    <span className={`px-2 py-1 text-xs rounded-full font-bold
                    ${evt.status === 'CRITICAL' ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                    {evt.status}
                  </span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-white mb-1">
                  {evt.status === 'CRITICAL' ? 'Structural Anomaly Detected' : 'Minor Vibration Logged'}
                </h3>
                <p className="text-xs text-neutral-400 mb-3">Device: {evt.deviceId}</p>
                
                <div className="flex justify-between items-center text-[10px] font-mono">
                   <div className="flex items-center gap-1 text-green-400">
                     <CheckCircle2 className="w-3 h-3" />
                     Verified
                   </div>
                   <span className="text-neutral-500">Risk: {evt.finalRiskScore}</span>
                </div>
              </div>
            ))
          )}

        </div>
      </aside>

    </div>
  );
}

