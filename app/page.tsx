"use client";

import { useState, useEffect, useRef } from "react";
import { Shield, Home, Activity, Radio, BarChart2, BookOpen, Glasses, Settings, AlertTriangle, RefreshCw, Maximize, Clock, FileText, CheckCircle2, LocateFixed, Lock } from "lucide-react";
import Map, { Marker } from "react-map-gl/maplibre";
import 'maplibre-gl/dist/maplibre-gl.css';
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Box, Grid, Line } from "@react-three/drei";
import * as THREE from "three";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

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

// ----------------------------------------------------------------------
// 3D MODEL COMPONENTS
// ----------------------------------------------------------------------
function BridgeModel({ hasCriticalEvent, riskScore }: { hasCriticalEvent: boolean, riskScore: number }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (hasCriticalEvent && groupRef.current) {
      const intensity = riskScore / 100.0;
      const t = clock.getElapsedTime();
      groupRef.current.position.x = Math.sin(t * 40 * intensity) * 0.4 * intensity;
      groupRef.current.position.y = 1 + Math.cos(t * 50 * intensity) * 0.1 * intensity;
      groupRef.current.position.z = Math.sin(t * 35 * intensity) * 0.2 * intensity;
    } else if (groupRef.current) {
      groupRef.current.position.set(0, 1, 0);
    }
  });

  return (
    <group ref={groupRef} position={[0, 1, 0]}>
       <Box args={[1.5, 4, 1.5]} position={[-4, 0, 0]}>
          <meshStandardMaterial color={hasCriticalEvent ? "#ff3333" : "#444"} wireframe />
       </Box>
       <Box args={[1.5, 4, 1.5]} position={[4, 0, 0]}>
          <meshStandardMaterial color={hasCriticalEvent ? "#ff3333" : "#444"} wireframe />
       </Box>
       <Box args={[14, 0.2, 3]} position={[0, 2.25, 0]}>
          <meshStandardMaterial color={hasCriticalEvent ? "#ef4444" : "#00E5FF"} wireframe emissive={hasCriticalEvent ? "#ef4444" : "#00E5FF"} emissiveIntensity={0.5} />
       </Box>
       
       {/* Suspension cables (simplified) */}
       <Line points={[[-4, 2.25, 1.5], [0, 4, 0], [4, 2.25, -1.5]]} color={hasCriticalEvent ? "#ff3333" : "#00E5FF"} lineWidth={2} />
       <Line points={[[-4, 2.25, -1.5], [0, 4, 0], [4, 2.25, 1.5]]} color={hasCriticalEvent ? "#ff3333" : "#00E5FF"} lineWidth={2} />
    </group>
  );
}

// ----------------------------------------------------------------------
// MAIN DASHBOARD
// ----------------------------------------------------------------------
export default function DisasterCommandCenter() {
  const [activeTab, setActiveTab] = useState("OVERVIEW");
  const [liveEvents, setLiveEvents] = useState<EventPayload[]>([]);
  const hasCriticalEvent = liveEvents.some(evt => evt.status === 'CRITICAL');
  const maxRisk = liveEvents.reduce((max, evt) => Math.max(max, parseFloat(evt.finalRiskScore || "0")), 0);
  const currentRisk = hasCriticalEvent ? Math.min(87 + (maxRisk * 10), 99).toFixed(0) : "12";

  // Polling Gateway
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const hostname = window.location.hostname || 'localhost';
        const res = await fetch(`http://${hostname}:4000/api/events`);
        const data = await res.json();
        setLiveEvents(data.reverse().slice(0, 50));
      } catch {
        // Fallback for visual testing
      }
    };
    fetchEvents();
    const interval = setInterval(fetchEvents, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#040914] text-slate-300 overflow-hidden font-sans">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-20 bg-[#0B1120] border-r border-slate-800 flex flex-col items-center py-6 z-20">
        <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-8">
          <Shield className="w-6 h-6 text-blue-400" />
        </div>
        
        <nav className="flex flex-col gap-6 w-full px-4">
          <SidebarIcon icon={<Home />} label="OVERVIEW" active={activeTab === "OVERVIEW"} onClick={() => setActiveTab("OVERVIEW")} />
          <SidebarIcon icon={<Activity />} label="SENSORS" active={activeTab === "SENSORS"} onClick={() => setActiveTab("SENSORS")} />
          <SidebarIcon icon={<Radio />} label="NETWORK" active={activeTab === "NETWORK"} onClick={() => setActiveTab("NETWORK")} />
          <SidebarIcon icon={<BarChart2 />} label="ANALYTICS" active={activeTab === "ANALYTICS"} onClick={() => setActiveTab("ANALYTICS")} />
          <SidebarIcon icon={<BookOpen />} label="LEDGER" active={activeTab === "LEDGER"} onClick={() => setActiveTab("LEDGER")} />
          <SidebarIcon icon={<Glasses />} label="AR VIEW" active={activeTab === "AR VIEW"} onClick={() => setActiveTab("AR VIEW")} />
        </nav>
        
        <div className="mt-auto px-4 w-full">
          <SidebarIcon icon={<Settings />} label="SETTINGS" active={activeTab === "SETTINGS"} onClick={() => setActiveTab("SETTINGS")} />
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* HEADER */}
        <header className="h-20 border-b border-slate-800 flex justify-between items-center px-6 bg-[#040914] shrink-0">
          <div>
            <h1 className="text-lg font-bold text-white tracking-widest">CITIZEN SENSOR NETWORK</h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide">Disaster Response Command Center</p>
          </div>
          
          <div className="flex items-center gap-6">
            {hasCriticalEvent ? (
              <div className="bg-red-950/40 border border-red-500/50 px-4 py-2 rounded-md flex items-center gap-3 glow-border-red">
                <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
                <div>
                  <div className="text-sm font-bold text-red-500 uppercase tracking-widest">MAJOR INCIDENT DETECTED</div>
                  <div className="text-[10px] text-red-400/80">Seismic Event Confirmed | Infrastructure Risk: HIGH</div>
                </div>
                <div className="ml-4 text-red-500 font-mono text-sm tracking-wider glow-text-red">LIVE 00:15:42</div>
              </div>
            ) : (
              <div className="bg-green-950/20 border border-green-500/30 px-4 py-2 rounded-md flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <div className="text-sm font-bold text-green-500 uppercase tracking-widest">SYSTEM OPTIMAL</div>
              </div>
            )}
            
            <div className="flex items-center gap-4 border-l border-slate-800 pl-6">
              <div className="text-xs text-slate-400">Command Unit Alpha <span className="ml-1">▼</span></div>
              <div className="font-mono text-sm text-white">09:42:17 UTC</div>
            </div>
          </div>
        </header>

        {/* CONTENT TABS */}
        {activeTab === "OVERVIEW" && (
        <div className="flex-1 p-6 grid grid-cols-12 grid-rows-[60%_40%] gap-6 overflow-hidden">
          
          {/* 1. 3D DIGITAL TWIN (Hero Section) */}
          <div className="panel col-span-8 row-span-1 relative shadow-2xl border-cyan-900/50">
            <div className="panel-header absolute top-0 w-full z-10 border-b-0 bg-gradient-to-b from-[#0B1120] to-transparent">
              <span className="text-sm tracking-widest text-white/90">1. CIVIL ENGINEERING DIGITAL TWIN | BRIDGE DELTA-17</span>
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
            
            {/* Overlay Text */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-10 font-mono text-xs text-cyan-400 bg-slate-900/50 p-3 rounded backdrop-blur">
               <div>STRUCTURAL VIBRATION: {hasCriticalEvent ? '78.4 mm/s' : '1.2 mm/s'}</div>
               <div>PHYSICS MODEL ALIGNMENT: <span className="text-green-400">98% MATCH</span></div>
               <div className="text-slate-400">STATUS: {hasCriticalEvent ? 'CRITICAL STRESS' : 'STABLE'}</div>
            </div>
          </div>

          {/* 2. RISK SCORE (Main Metric) */}
          <div className="panel col-span-4 row-span-1 shadow-2xl border-cyan-900/50">
            <div className="panel-header">
              <span className="text-sm tracking-widest text-white/90">2. AI-COMPUTED RISK SCORE</span>
            </div>
            <div className="panel-content flex flex-col justify-center items-center py-6 h-full relative">
               
               {/* Critical Ring */}
               <div className="relative w-48 h-48 flex items-center justify-center">
                 <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 transform">
                   <circle cx="50" cy="50" r="45" fill="none" stroke="#1E293B" strokeWidth="6" />
                   <circle cx="50" cy="50" r="45" fill="none" stroke={hasCriticalEvent ? "#EF4444" : "#00E5FF"} strokeWidth="6" strokeDasharray="282.6" strokeDashoffset={282.6 - (282.6 * parseInt(currentRisk) / 100)} className="transition-all duration-1000" style={{ filter: `drop-shadow(0 0 10px ${hasCriticalEvent ? '#EF4444' : '#00E5FF'})` }} />
                 </svg>
                 <div className="absolute flex flex-col items-center">
                   <span className={`text-6xl font-black ${hasCriticalEvent ? 'text-red-500 glow-text-red' : 'text-cyan-400 glow-text-cyan'}`}>{currentRisk}</span>
                   <span className={`text-[12px] uppercase font-bold tracking-widest mt-2 ${hasCriticalEvent ? 'text-red-500' : 'text-cyan-500'}`}>
                     {hasCriticalEvent ? 'CRITICAL ALERT' : 'NORMAL'}
                   </span>
                 </div>
               </div>

               <div className="absolute bottom-6 text-center text-xs text-slate-400 px-6">
                 Score computed by fusing Edge AI outputs with spatial consistency and digital twin physics.
               </div>
            </div>
          </div>

          {/* 3. HYPERLEDGER FEED (Blockchain Proof) */}
          <div className="panel col-span-8 row-span-1 shadow-2xl">
            <div className="panel-header">
              <span className="text-sm tracking-widest text-white/90">3. BLOCKCHAIN VERIFICATION LEDGER (HYPERLEDGER)</span>
              <BookOpen className="w-4 h-4 text-cyan-500" />
            </div>
            <div className="panel-content overflow-y-auto p-4">
              <div className="space-y-4">
                {liveEvents.slice(0, 6).map((evt, idx) => (
                  <div key={idx} className="flex gap-4 text-sm font-mono border-b border-slate-800/80 pb-3 items-center bg-slate-900/30 p-3 rounded hover:bg-slate-800/50 transition-colors">
                    <div className="text-cyan-400 shrink-0 w-28">
                      <Clock className="w-4 h-4 inline mr-2"/>
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </div>
                    <div className="flex-1 flex gap-4 items-center">
                      <span className={`px-3 py-1 rounded text-[10px] font-bold tracking-wider ${evt.status === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'}`}>
                        {evt.status === 'CRITICAL' ? 'ANOMALY PROOF' : 'HEARTBEAT'}
                      </span>
                      <span className="text-slate-300 truncate">
                        HASH: <span className="text-slate-500">{evt.ledgerHash || `A7B3C2D${idx}99F5E21B...`}</span>
                      </span>
                    </div>
                    <div className="text-green-400 font-bold shrink-0 text-xs tracking-wider">
                       <CheckCircle2 className="w-4 h-4 inline mr-1" />
                       VERIFIED
                    </div>
                  </div>
                ))}
                {liveEvents.length === 0 && (
                   <div className="text-center text-slate-500 py-10 text-sm font-mono flex flex-col items-center">
                      <RefreshCw className="w-8 h-8 animate-spin opacity-50 mb-4 text-cyan-500" />
                      Waiting for incoming cryptographic transactions from sensors...
                   </div>
                )}
              </div>
            </div>
          </div>

          {/* 4. COMMAND FEED (Actionable Output) */}
          <div className="panel col-span-4 row-span-1 shadow-2xl">
            <div className="panel-header">
              <span className="text-sm tracking-widest text-white/90">4. AUTOMATED RESPONSE LOG</span>
              <AlertTriangle className="w-4 h-4 text-orange-500" />
            </div>
            <div className="panel-content overflow-y-auto font-mono text-xs p-4 bg-[#080d1a]">
              <div className="space-y-6 pt-2">
                 {hasCriticalEvent && (
                   <>
                     <div className="flex gap-4 items-start p-3 bg-red-950/20 border-l-2 border-red-500 rounded-r">
                       <span className="text-red-500 shrink-0 mt-0.5">●</span>
                       <div className="flex-1 text-red-400">
                         <strong className="text-sm text-red-300">CRITICAL ANOMALY VERIFIED</strong><br/>
                         <span className="text-slate-400 block mt-1 leading-relaxed">Dispatching SMS evacuation alerts to 14,020 citizens in a 5km radius via Smart City Grid.</span>
                       </div>
                     </div>
                     <div className="flex gap-4 items-start p-3 bg-orange-950/20 border-l-2 border-orange-500 rounded-r">
                       <span className="text-orange-500 shrink-0 mt-0.5">●</span>
                       <div className="flex-1 text-orange-400">
                         <strong className="text-sm text-orange-300">INFRASTRUCTURE LOCKDOWN</strong><br/>
                         <span className="text-slate-400 block mt-1 leading-relaxed">Bridge Delta-17 automated boom barriers activated. Traffic halted.</span>
                       </div>
                     </div>
                   </>
                 )}
                 <div className="flex gap-4 items-start p-3 border-l-2 border-cyan-500/50">
                   <span className="text-cyan-500 shrink-0 mt-0.5">●</span>
                   <div className="flex-1 text-cyan-400">
                     <strong className="text-sm text-cyan-300">MESH NETWORK STABLE</strong><br/>
                     <span className="text-slate-400 block mt-1 leading-relaxed">124 local edge nodes actively gossiping state offline.</span>
                   </div>
                 </div>
                 <div className="flex gap-4 items-start p-3 border-l-2 border-slate-700">
                   <span className="text-slate-500 shrink-0 mt-0.5">●</span>
                   <div className="flex-1 text-slate-300">
                     <strong className="text-sm text-slate-300">CIVIL TWIN SYNC</strong><br/>
                     <span className="text-slate-400 block mt-1 leading-relaxed">Physics matrices updated for Sector 4 structures. Baseline recalibrated.</span>
                   </div>
                 </div>
              </div>
            </div>
          </div>
          
        </div>
        )}

        {activeTab === "ANALYTICS" && (
          <div className="flex-1 p-8 overflow-auto flex flex-col gap-6">
             <div className="flex justify-between items-center">
               <h2 className="text-2xl font-bold text-white tracking-wider">HISTORICAL SEISMIC DATA VISUALIZATION</h2>
               <div className="bg-[#0B1120] border border-slate-800 px-4 py-2 rounded text-xs flex gap-4">
                 <span className="text-cyan-400">Node: CSN-7A3F</span>
                 <span className="text-slate-500">Last 24 Hours</span>
               </div>
             </div>
             
             <div className="panel flex-1 min-h-[400px]">
               <div className="panel-header">
                 <span>PGA (PEAK GROUND ACCELERATION) OVER TIME</span>
               </div>
               <div className="panel-content">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={Array.from({length: 60}).map((_, i) => ({ time: `-${60-i}m`, value: Math.abs(Math.sin(i * 0.5)) * 2 + (i === 45 ? 8 : 0) + (Math.abs(Math.sin(i*123.45))) }))}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" stroke="#475569" fontSize={10} tickMargin={10} />
                      <YAxis stroke="#475569" fontSize={10} tickMargin={10} />
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#0B1120', borderColor: '#1E293B', color: '#fff' }} />
                      <Area type="monotone" dataKey="value" stroke="#00E5FF" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
             </div>
             
             <div className="grid grid-cols-2 gap-6 h-64">
               <div className="panel">
                 <div className="panel-header">FREQUENCY DISTRIBUTION</div>
                 <div className="panel-content flex items-end justify-between px-8 gap-2">
                    {Array.from({length: 20}).map((_, i) => (
                       <div key={i} className="w-full bg-orange-500 rounded-t" style={{ height: `${Math.abs(Math.sin(i * 54.321)) * 80 + 10}%`, opacity: 0.8 }}></div>
                    ))}
                 </div>
               </div>
               <div className="panel">
                 <div className="panel-header">ANOMALY DETECTIONS</div>
                 <div className="panel-content p-6">
                    <div className="text-4xl font-black text-red-500 mb-2">3</div>
                    <div className="text-slate-400 text-sm mb-4">Critical Threshold Crossings in last 24h</div>
                    <div className="w-full bg-slate-800 rounded-full h-2 mb-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                    <div className="text-xs text-slate-500">Risk Profile: ELEVATED</div>
                 </div>
               </div>
             </div>
          </div>
        )}
        
        {activeTab === "NETWORK" && (
          <div className="flex-1 relative w-full h-full flex flex-col">
             <div className="absolute top-4 left-4 z-10 bg-[#0B1120]/90 border border-slate-800 p-4 rounded-lg backdrop-blur shadow-2xl">
                <h2 className="text-lg font-bold text-cyan-400 tracking-wider mb-2">LIVE SENSOR MESH MAP</h2>
                <div className="text-xs text-slate-400 font-mono space-y-1">
                  <div>Active Nodes: <span className="text-white">124</span></div>
                  <div>Network Health: <span className="text-green-400">98.2%</span></div>
                  <div>Last Sync: <span className="text-white">0s ago</span></div>
                </div>
             </div>
             
             <Map
                initialViewState={{ longitude: 77.2090, latitude: 28.6139, zoom: 12, pitch: 45 }}
                mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                interactive={true}
                style={{ width: '100%', height: '100%' }}
             >
                {/* LIVE NODES FROM BACKEND */}
                {liveEvents.map((evt, i) => (
                   <Marker key={i} longitude={evt.longitude || 77.2090} latitude={evt.latitude || 28.6139}>
                       <div className="relative flex items-center justify-center">
                           <div className={`w-3 h-3 rounded-full ${evt.status === 'CRITICAL' ? 'bg-red-500' : 'bg-cyan-500'}`}
                                style={{ boxShadow: `0 0 10px ${evt.status === 'CRITICAL' ? '#EF4444' : '#00E5FF'}` }}>
                           </div>
                           <div className={`absolute inset-0 animate-ping rounded-full opacity-50 ${evt.status === 'CRITICAL' ? 'bg-red-500' : 'bg-cyan-500'}`}></div>
                       </div>
                   </Marker>
                ))}
             </Map>
          </div>
        )}
        
        {activeTab === "ANALYTICS" && (
          <div className="flex-1 p-6 grid grid-cols-12 grid-rows-2 gap-6 overflow-hidden">
            {/* SEISMIC WAVEFORM */}
            <div className="panel col-span-12 row-span-1">
              <div className="panel-header">
                <span className="text-sm tracking-widest text-white/90">HIGH-FREQUENCY SEISMIC WAVEFORM</span>
                <div className="flex gap-2"><RefreshCw className="w-4 h-4 text-slate-500"/><Maximize className="w-4 h-4 text-slate-500"/></div>
              </div>
              <div className="panel-content flex flex-col relative">
                   <svg viewBox="0 0 400 100" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                      <path d="M0,50 L20,50 L30,20 L40,80 L50,40 L60,90 L70,10 L80,50 L100,50 L110,30 L120,70 L130,50 L150,50 L160,10 L170,90 L180,30 L190,60 L200,50 L220,50 L230,20 L240,80 L250,50 L270,50 L280,10 L290,90 L300,50 L320,50 L330,30 L340,70 L350,50 L370,50 L380,20 L390,80 L400,50" 
                            fill="none" stroke={hasCriticalEvent ? "#EF4444" : "#3B82F6"} strokeWidth="2" 
                            style={{ filter: `drop-shadow(0 0 4px ${hasCriticalEvent ? '#EF4444' : '#3B82F6'})` }} />
                   </svg>
                   <div className="absolute inset-0 border-b border-t border-slate-800 opacity-50 flex flex-col justify-between py-2 pointer-events-none">
                      <span className="text-[10px] text-slate-600 pl-2">10.0g</span>
                      <span className="text-[10px] text-slate-600 pl-2">5.0g</span>
                      <span className="text-[10px] text-slate-600 pl-2">0.0g</span>
                   </div>
              </div>
            </div>

            {/* ACOUSTIC SPECTRUM */}
            <div className="panel col-span-6 row-span-1">
              <div className="panel-header">
                <span className="text-sm tracking-widest text-white/90">ACOUSTIC SPECTRUM ANALYZER</span>
              </div>
              <div className="panel-content flex items-end gap-1 justify-between h-full pt-4 p-4">
                {Array.from({length: 40}).map((_, i) => {
                  const pseudoRandom = Math.abs(Math.sin(i * 12.9898 + 78.233));
                  const height = hasCriticalEvent ? pseudoRandom * 80 + 20 : pseudoRandom * 40 + 10;
                  const isHigh = height > 70;
                  return (
                    <div key={i} className="w-full flex flex-col justify-end gap-[2px] h-full opacity-80" style={{ height: `${height}%` }}>
                      {Array.from({length: Math.floor(height / 10)}).map((_, j) => (
                        <div key={j} className={`w-full h-2 rounded-sm ${isHigh && j > 5 ? 'bg-orange-500 glow-border-red' : 'bg-cyan-500'}`}></div>
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* FFT ANALYSIS */}
            <div className="panel col-span-6 row-span-1">
              <div className="panel-header">
                <span className="text-sm tracking-widest text-white/90">FFT FREQUENCY DOMAIN</span>
              </div>
              <div className="panel-content relative">
                 <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="none">
                    <path d="M0,90 Q50,90 80,40 T150,90 Q200,90 230,20 T300,90 Q350,90 380,50 T400,90" 
                          fill="none" stroke="#00E5FF" strokeWidth="2" 
                          style={{ filter: 'drop-shadow(0 0 4px #00E5FF)' }} />
                 </svg>
                 {hasCriticalEvent && (
                   <>
                     <div className="absolute top-4 left-[20%] text-xs text-white flex flex-col items-center">
                       <span>12.8 Hz</span>
                       <span className="text-slate-400 text-[10px]">(STRUCTURAL)</span>
                     </div>
                     <div className="absolute top-0 left-[55%] text-xs text-white flex flex-col items-center">
                       <span>6.2 Hz</span>
                       <span className="text-slate-400 text-[10px]">(PGA)</span>
                     </div>
                   </>
                 )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "NETWORK" && (
          <div className="flex-1 p-6 grid grid-cols-12 grid-rows-2 gap-6 overflow-hidden">
            {/* LIVE SENSOR MAP */}
            <div className="panel col-span-8 row-span-2 relative shadow-2xl border-cyan-900/50 overflow-hidden">
              <div className="panel-header absolute top-0 w-full z-10 border-b-0 bg-gradient-to-b from-[#0B1120] to-transparent">
                <span className="text-sm tracking-widest text-white/90">LIVE MESH NETWORK GEOLOCATION</span>
              </div>
              <Map
                  initialViewState={{ longitude: 77.2090, latitude: 28.6139, zoom: 12, pitch: 45 }}
                  mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                  interactive={true}
                  style={{ width: '100%', height: '100%' }}
              >
                  {liveEvents.map((evt, i) => (
                     <Marker key={i} longitude={evt.longitude || 77.2090} latitude={evt.latitude || 28.6139}>
                         <div className="relative flex items-center justify-center">
                             <div className={`w-4 h-4 rounded-full ${evt.status === 'CRITICAL' ? 'bg-red-500' : 'bg-cyan-500'}`}
                                  style={{ boxShadow: `0 0 15px ${evt.status === 'CRITICAL' ? '#EF4444' : '#00E5FF'}` }}>
                             </div>
                             <div className={`absolute inset-0 animate-ping rounded-full opacity-50 ${evt.status === 'CRITICAL' ? 'bg-red-500' : 'bg-cyan-500'}`}></div>
                         </div>
                     </Marker>
                  ))}
              </Map>
            </div>

            {/* BLE MESH TOPOLOGY */}
            <div className="panel col-span-4 row-span-2 relative overflow-hidden">
              <div className="panel-header absolute top-0 w-full z-10 border-b-0 bg-gradient-to-b from-[#0B1120] to-transparent">
                <span className="text-sm tracking-widest text-white/90">NODE TOPOLOGY</span>
              </div>
              <div className="w-full h-full relative flex items-center justify-center bg-[#040914]">
                 <div className="w-64 h-64 rounded-full border border-cyan-500/30 relative">
                    <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-cyan-500 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_20px_#00E5FF] pulse-ring flex items-center justify-center">
                       <Radio className="w-3 h-3 text-white" />
                    </div>
                    <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-orange-500 rounded-full shadow-[0_0_10px_#f97316]"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-cyan-500 rounded-full shadow-[0_0_10px_#00E5FF]"></div>
                    <div className="absolute top-3/4 left-1/3 w-3 h-3 bg-cyan-500 rounded-full shadow-[0_0_10px_#00E5FF]"></div>
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                       <line x1="50%" y1="50%" x2="25%" y2="25%" stroke="#00E5FF" strokeWidth="1.5" opacity="0.6" strokeDasharray="4" />
                       <line x1="50%" y1="50%" x2="75%" y2="75%" stroke="#00E5FF" strokeWidth="1.5" opacity="0.6" strokeDasharray="4" />
                       <line x1="50%" y1="50%" x2="33%" y2="75%" stroke="#f97316" strokeWidth="1.5" opacity="0.6" />
                    </svg>
                 </div>
                 
                 <div className="absolute bottom-6 left-6 right-6 bg-slate-900/90 border border-slate-700 p-4 rounded text-sm z-20 backdrop-blur">
                    <div className="text-white font-mono mb-2 border-b border-slate-700 pb-2">NODE: CSN-7A3F</div>
                    <div className="flex justify-between items-center mb-1">
                       <span className="text-slate-400">Connection</span>
                       <span className="text-green-400 font-bold">ACTIVE P2P</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-slate-400">Signal (RSSI)</span>
                       <span className="text-cyan-400 font-mono">-62 dBm</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "AR VIEW" && (
          <div className="flex-1 relative overflow-hidden bg-black">
             {/* Full screen AR View simulation */}
             <div className="absolute inset-0 bg-gradient-to-b from-[#1e293b] to-[#040914] z-0 opacity-50"></div>
             
             {/* Simulated Camera Feed Background */}
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-30 pointer-events-none"></div>

             {/* AR HUD Overlay */}
             <div className="absolute inset-0 z-10 p-8 flex flex-col justify-between pointer-events-none">
                 <div className="flex justify-between items-start">
                     <div className="bg-black/60 border border-cyan-500/50 p-4 rounded backdrop-blur">
                         <div className="text-cyan-400 font-mono text-sm mb-1 glow-text-cyan">EVACUATION ROUTING ACTIVE</div>
                         <div className="text-white text-2xl font-bold">420m to Safe Zone (Alpha)</div>
                         <div className="text-slate-300 text-sm mt-2 flex items-center gap-2">
                             <Clock className="w-4 h-4 text-cyan-500" /> ETA: 06:18 (Walking)
                         </div>
                     </div>
                     <div className="w-24 h-24 border-2 border-cyan-500/30 rounded-full flex items-center justify-center relative">
                         <div className="absolute inset-0 border-t-2 border-cyan-500 rounded-full animate-spin"></div>
                         <span className="text-cyan-500 font-bold">GPS SYNC</span>
                     </div>
                 </div>

                 {/* AR Path Graphic in Center */}
                 <div className="flex-1 w-full relative flex items-end justify-center perspective-1000">
                     <svg viewBox="0 0 200 200" className="w-full max-w-3xl h-64 transform rotateX-60 drop-shadow-2xl opacity-80" preserveAspectRatio="none">
                         {/* Glowing Path */}
                         <path d="M100,200 L120,150 L90,100 L110,50 L100,0" fill="none" stroke="#00E5FF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse" style={{ filter: 'drop-shadow(0 0 15px #00E5FF)' }} />
                         {/* Floating Waypoint */}
                         <circle cx="100" cy="0" r="12" fill="#10B981" style={{ filter: 'drop-shadow(0 0 20px #10B981)' }} />
                     </svg>
                 </div>

                 <div className="flex justify-between items-end">
                     <div className="bg-red-950/80 border border-red-500/50 p-4 rounded backdrop-blur">
                         <div className="text-red-400 font-bold flex items-center gap-2 mb-2">
                             <AlertTriangle className="w-5 h-5" /> AVOID BRIDGE DELTA-17
                         </div>
                         <div className="text-slate-300 text-sm">Structural Risk: <span className="text-red-500 font-bold">CRITICAL</span></div>
                     </div>
                     <div className="bg-black/60 border border-slate-700 p-4 rounded backdrop-blur font-mono text-xs text-slate-400 text-right">
                         <div>LAT: 28.6139° N</div>
                         <div>LON: 77.2090° E</div>
                         <div>ALT: 216m ASL</div>
                         <div className="text-cyan-500 mt-2">COMPASS: 340° NW</div>
                     </div>
                 </div>
             </div>
          </div>
        )}

        {activeTab === "SENSORS" && (
          <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
             <div className="panel-header border-b-0">
               <span className="text-sm tracking-widest text-white/90">CONNECTED SMARTPHONE EDGE NODES (DEVICE PROFILER)</span>
             </div>
             <div className="flex-1 overflow-auto bg-slate-900/20 border border-slate-800 rounded">
                <table className="w-full text-left border-collapse text-sm">
                   <thead className="bg-[#0B1120] text-cyan-500 font-mono text-xs border-b border-slate-800">
                      <tr>
                         <th className="p-4 font-normal tracking-wider">NODE ID</th>
                         <th className="p-4 font-normal tracking-wider">DEVICE TIER</th>
                         <th className="p-4 font-normal tracking-wider">AI MODEL</th>
                         <th className="p-4 font-normal tracking-wider">SAMPLING RATE</th>
                         <th className="p-4 font-normal tracking-wider">BATTERY</th>
                         <th className="p-4 font-normal tracking-wider">STATUS</th>
                      </tr>
                   </thead>
                   <tbody className="text-slate-300">
                      {[
                        { id: "CSN-7A3F", tier: "HIGH", model: "Medium (CNN-LSTM)", rate: "100Hz", batt: "84%", status: "ACTIVE" },
                        { id: "CSN-2B91", tier: "MID", model: "Tiny (1D-CNN)", rate: "50Hz", batt: "42%", status: "ACTIVE" },
                        { id: "CSN-9F21", tier: "HIGH", model: "Medium (CNN-LSTM)", rate: "100Hz", batt: "12%", status: "THROTTLED" },
                        { id: "CSN-4C55", tier: "LOW", model: "Tiny (1D-CNN)", rate: "50Hz", batt: "98%", status: "ACTIVE" },
                        { id: "CSN-1E82", tier: "HIGH", model: "Medium (CNN-LSTM)", rate: "100Hz", batt: "100%", status: "ACTIVE" }
                      ].map((node, i) => (
                         <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                            <td className="p-4 font-mono text-white">{node.id}</td>
                            <td className="p-4">
                               <span className={`px-2 py-1 rounded text-xs font-bold ${node.tier === 'HIGH' ? 'bg-green-500/20 text-green-400' : node.tier === 'MID' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                  {node.tier}
                               </span>
                            </td>
                            <td className="p-4 text-slate-400">{node.model}</td>
                            <td className="p-4 text-cyan-400">{node.rate}</td>
                            <td className="p-4">
                               <div className="flex items-center gap-2">
                                  <div className="w-16 h-2 bg-slate-800 rounded overflow-hidden">
                                     <div className={`h-full ${parseInt(node.batt) > 20 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: node.batt }}></div>
                                  </div>
                                  <span className="text-xs text-slate-500">{node.batt}</span>
                               </div>
                            </td>
                            <td className="p-4">
                               <span className={`flex items-center gap-2 text-xs font-bold ${node.status === 'ACTIVE' ? 'text-green-500' : 'text-orange-500'}`}>
                                  <span className={`w-2 h-2 rounded-full ${node.status === 'ACTIVE' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
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

        {activeTab === "LEDGER" && (
          <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
             <div className="panel-header border-b-0 flex justify-between items-center">
               <span className="text-sm tracking-widest text-white/90">HYPERLEDGER FABRIC - IMMUTABLE VERIFICATION LEDGER</span>
               <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-3 py-1 rounded text-xs text-green-400">
                  <CheckCircle2 className="w-3 h-3" /> ZKP VALIDATION ACTIVE
               </div>
             </div>
             
             <div className="grid grid-cols-3 gap-6 mb-2">
                <div className="bg-[#0B1120] border border-slate-800 rounded p-4">
                   <div className="text-slate-500 text-xs font-bold mb-1">TOTAL VERIFIED EVENTS</div>
                   <div className="text-3xl font-mono text-cyan-400 glow-text-cyan">14,208</div>
                </div>
                <div className="bg-[#0B1120] border border-slate-800 rounded p-4">
                   <div className="text-slate-500 text-xs font-bold mb-1">NETWORK CONSENSUS</div>
                   <div className="text-3xl font-mono text-white">Raft (Crash Fault Tolerant)</div>
                </div>
                <div className="bg-[#0B1120] border border-slate-800 rounded p-4">
                   <div className="text-slate-500 text-xs font-bold mb-1">AVERAGE BLOCK LATENCY</div>
                   <div className="text-3xl font-mono text-white">1.2<span className="text-sm text-slate-500 ml-1">seconds</span></div>
                </div>
             </div>

             <div className="flex-1 overflow-auto bg-slate-900/20 border border-slate-800 rounded p-4">
                <div className="space-y-4">
                  {liveEvents.length > 0 ? liveEvents.map((evt, idx) => (
                    <div key={idx} className="bg-[#040914] border border-slate-700/50 p-4 rounded-lg flex gap-6 hover:border-cyan-500/50 transition-colors group">
                       <div className="shrink-0 flex flex-col items-center justify-center bg-slate-800/50 rounded p-3 min-w-24">
                          <span className="text-cyan-500 text-[10px] font-bold mb-1">BLOCK</span>
                          <span className="text-white font-mono text-lg">#{104052 + idx}</span>
                       </div>
                       
                       <div className="flex-1 flex flex-col justify-center">
                          <div className="flex items-center gap-3 mb-2">
                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${evt.status === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                                {evt.status === 'CRITICAL' ? 'ANOMALY DETECTED' : 'HEARTBEAT'}
                             </span>
                             <span className="text-slate-500 text-xs font-mono">{new Date(evt.timestamp).toISOString()}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                             <div>
                                <span className="text-slate-500 block mb-0.5">ECDSA SIGNATURE:</span>
                                <span className="text-slate-300 truncate block w-48">SIG_{evt.ledgerHash || `A7B3C2D${idx}99F5E21B`}</span>
                             </div>
                             <div>
                                <span className="text-slate-500 block mb-0.5">ZKP PROOF (LOCATION):</span>
                                <span className="text-green-400 flex items-center gap-1"><Lock className="w-3 h-3" /> VERIFIED (Delhi NCR Zone)</span>
                             </div>
                          </div>
                       </div>
                       
                       <div className="shrink-0 flex flex-col justify-center items-end text-xs font-mono">
                          <div className="text-slate-500 mb-1">NODE PUBKEY</div>
                          <div className="text-slate-300 group-hover:text-cyan-400 transition-colors">0x7F2A...9B1C</div>
                       </div>
                    </div>
                  )) : (
                    <div className="text-center text-slate-500 py-20 font-mono text-sm">
                       <RefreshCw className="w-10 h-10 animate-spin opacity-50 mb-4 mx-auto text-cyan-500" />
                       Awaiting cryptographically signed blocks from gateway...
                    </div>
                  )}
                </div>
             </div>
          </div>
        )}

        {(!["OVERVIEW", "ANALYTICS", "NETWORK", "AR VIEW", "SENSORS", "LEDGER"].includes(activeTab)) && (
           <div className="flex-1 flex items-center justify-center flex-col">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                 <Settings className="w-8 h-8 text-slate-500" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-widest">{activeTab} MODULE</h2>
              <p className="text-slate-500 mt-2">Section under construction for the SIH 2026 Pitch.</p>
           </div>
        )}

        {/* FOOTER */}
        <footer className="h-10 border-t border-slate-800 flex justify-between items-center px-6 bg-[#040914] shrink-0 text-[10px] text-slate-500 font-mono tracking-widest">
          <div className="flex gap-6">
            <span className="flex items-center gap-2"><Lock className="w-3 h-3 text-cyan-500"/> ENCRYPTED CHANNEL: AES-256</span>
            <span>NETWORK: CSN-MIL-01</span>
            <span className="text-green-500">STATUS: SECURE</span>
          </div>
          <div>SYSTEM UPTIME: <span className="text-white font-bold">99.98%</span></div>
        </footer>

      </main>
    </div>
  );
}

// Subcomponent for Sidebar Icons
function SidebarIcon({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`flex flex-col items-center gap-1 cursor-pointer group ${active ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}>
      <div className={`p-2 rounded-lg transition-all ${active ? 'bg-cyan-500/10 border border-cyan-500/30' : 'group-hover:bg-slate-800'}`}>
        {icon}
      </div>
      <span className="text-[8px] font-bold tracking-wider">{label}</span>
    </div>
  );
}
