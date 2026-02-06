import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, RefreshCw, Video, VideoOff, Activity, Trophy, Zap } from 'lucide-react';
import { generateBoxingCombo } from '../services/geminiService';
import { Combo } from '../types';

interface Target {
  id: number;
  type: 'LEFT' | 'RIGHT' | 'CENTER';
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  scale: number; // 0 to 1.5
  active: boolean;
  hit: boolean;
  timestamp: number;
  label: string;
}

const MOTION_THRESHOLD = 25; // Sensitivity of pixel change
const HIT_THRESHOLD = 20; // Number of pixels required to trigger hit

const TrainingMode: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [score, setScore] = useState(0);
  const [comboName, setComboName] = useState<string>("Freestyle");
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null); // For motion processing
  const prevFrameRef = useRef<ImageData | null>(null);
  const reqRef = useRef<number>(0);
  const targetsRef = useRef<Target[]>([]); // Ref for animation loop access

  // Sync ref with state
  useEffect(() => {
    targetsRef.current = targets;
  }, [targets]);

  // Start/Stop Loop
  useEffect(() => {
    if (isActive && cameraActive) {
      loop();
    } else {
      cancelAnimationFrame(reqRef.current);
    }
    return () => cancelAnimationFrame(reqRef.current);
  }, [isActive, cameraActive]);

  const toggleCamera = async () => {
    if (cameraActive) {
      setCameraActive(false);
      setIsActive(false);
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480, facingMode: 'user' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
      } catch (err) {
        console.error("Camera error:", err);
        alert("Camera permission denied. Ensure you are on HTTPS or localhost.");
      }
    }
  };

  const spawnAICombo = async () => {
    setLoading(true);
    const difficulty = score > 50 ? 'Intermediate' : 'Beginner';
    const newCombo = await generateBoxingCombo(difficulty, "Reflexes");
    
    setComboName(newCombo.name);
    
    // Convert text moves to targets
    const newTargets: Target[] = newCombo.sequence.map((move, index) => {
      let x = 50;
      let y = 50;
      
      // Basic mapping of moves to screen positions
      const m = move.toLowerCase();
      if (m.includes('jab') || m.includes('left')) { x = 30; y = 40; }
      else if (m.includes('cross') || m.includes('right')) { x = 70; y = 40; }
      else if (m.includes('hook')) { x = m.includes('left') ? 20 : 80; y = 50; }
      else if (m.includes('uppercut')) { x = m.includes('left') ? 40 : 60; y = 70; }
      
      return {
        id: Date.now() + index,
        type: x < 50 ? 'LEFT' : 'RIGHT',
        x,
        y,
        scale: 0.1,
        active: true,
        hit: false,
        timestamp: Date.now(),
        label: move
      };
    });

    // Stagger spawn
    newTargets.forEach((t, i) => {
      setTimeout(() => {
        if (!isActive) return;
        setTargets(prev => [...prev, t]);
      }, i * 1500); // 1.5s gap between punches
    });
    
    setLoading(false);
  };

  const loop = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!ctx || video.readyState !== 4) {
      reqRef.current = requestAnimationFrame(loop);
      return;
    }

    // 1. Draw small frame for motion detection
    const width = 100;
    const height = 75;
    ctx.drawImage(video, 0, 0, width, height);
    const currentFrame = ctx.getImageData(0, 0, width, height);
    
    // 2. Motion Detection Logic
    let motionMap: boolean[] = new Array(width * height).fill(false);
    
    if (prevFrameRef.current) {
      const prev = prevFrameRef.current.data;
      const curr = currentFrame.data;
      
      for (let i = 0; i < curr.length; i += 4) {
        // Compare RGB channels
        const rDiff = Math.abs(curr[i] - prev[i]);
        const gDiff = Math.abs(curr[i+1] - prev[i+1]);
        const bDiff = Math.abs(curr[i+2] - prev[i+2]);
        
        if (rDiff + gDiff + bDiff > MOTION_THRESHOLD) {
          const pixelIndex = i / 4;
          motionMap[pixelIndex] = true;
        }
      }
    }
    prevFrameRef.current = currentFrame;

    // 3. Update Targets & Check Collision
    setTargets(prevTargets => {
      return prevTargets.map(t => {
        if (!t.active || t.hit) return t;

        // Move target 'closer' (scale up)
        const newScale = t.scale + 0.02; // Speed of approach
        
        // Check Hit if close enough
        let isHit = false;
        if (newScale > 0.6 && newScale < 1.2) {
          // Map target DOM coordinates (%) to Canvas coordinates (px)
          // Video is mirrored usually, so x needs flip if using 'user' facing mode css transform
          // Assuming CSS scaleX(-1) on video, we mirror X logic here
          const canvasX = Math.floor(((100 - t.x) / 100) * width); 
          const canvasY = Math.floor((t.y / 100) * height);
          const radius = Math.floor((newScale * 15)); // Hit radius

          let motionPixels = 0;
          
          // Check pixels around target center
          for (let ky = -radius; ky <= radius; ky++) {
            for (let kx = -radius; kx <= radius; kx++) {
              const px = canvasX + kx;
              const py = canvasY + ky;
              if (px >= 0 && px < width && py >= 0 && py < height) {
                if (motionMap[py * width + px]) {
                  motionPixels++;
                }
              }
            }
          }

          if (motionPixels > HIT_THRESHOLD) {
            isHit = true;
            // Play sound?
          }
        }

        if (isHit) {
          setScore(s => s + 10);
        }

        return {
          ...t,
          scale: newScale,
          hit: isHit,
          active: newScale < 1.4 && !isHit // Deactivate if too big (miss) or hit
        };
      }).filter(t => t.scale < 1.5 && (!t.hit || t.scale < 1.5)); 
      // Keep hit targets briefly for explosion animation, remove missed targets
    });

    // Auto-spawn if empty and active
    if (targetsRef.current.filter(t => t.active).length === 0 && !loading && isActive) {
      spawnAICombo();
    }

    reqRef.current = requestAnimationFrame(loop);
  };

  return (
    <div className="h-full w-full flex flex-col relative overflow-hidden bg-black">
      {/* Hidden Processing Canvas */}
      <canvas ref={canvasRef} width="100" height="75" className="hidden absolute top-0 left-0" />

      {/* Background Camera Feed */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        {cameraActive ? (
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline
            className="w-full h-full object-cover scale-x-[-1]" // Mirror effect for user feel
          />
        ) : (
           <div className="text-center">
             <div className="mb-4 animate-pulse text-neon-red"><VideoOff size={48} className="mx-auto" /></div>
             <p className="text-gray-500 font-mono">CAMERA FEED REQUIRED FOR TARGETING SYSTEM</p>
           </div>
        )}
        {/* AR Overlay Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[length:50px_50px] pointer-events-none"></div>
      </div>

      {/* Game Layer (Targets) */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {targets.map(target => (
          <div
            key={target.id}
            className={`absolute flex items-center justify-center rounded-full transition-transform duration-75 shadow-[0_0_30px_currentColor]
              ${target.hit ? 'scale-[2] opacity-0 duration-300 bg-white' : ''}
            `}
            style={{
              left: `${target.x}%`,
              top: `${target.y}%`,
              width: '100px',
              height: '100px',
              transform: `translate(-50%, -50%) scale(${target.hit ? 2 : target.scale})`,
              backgroundColor: target.hit ? '#fff' : (target.type === 'LEFT' ? 'rgba(57, 255, 20, 0.4)' : 'rgba(0, 255, 255, 0.4)'),
              border: `2px solid ${target.type === 'LEFT' ? '#39ff14' : '#00ffff'}`,
              zIndex: Math.floor(target.scale * 100)
            }}
          >
             {target.hit ? (
               <div className="text-black font-bold text-lg animate-ping">HIT!</div>
             ) : (
               <div className="text-center">
                 <div className="w-2 h-2 bg-white rounded-full mx-auto mb-1 animate-pulse"></div>
                 <span className="text-[10px] font-mono bg-black/50 px-1 text-white">{target.label}</span>
               </div>
             )}
          </div>
        ))}
      </div>

      {/* HUD Layer */}
      <div className="relative z-20 flex-1 flex flex-col justify-between p-6 pointer-events-none">
        
        {/* Top HUD */}
        <div className="flex justify-between items-start pointer-events-auto">
            <div className="flex space-x-4">
               <div className="hud-panel bg-black/80 p-4 rounded-xl border-l-4 border-neon-green min-w-[150px]">
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Score</p>
                  <h2 className="text-4xl font-bold text-white font-mono flex items-center">
                    <Trophy className="w-6 h-6 text-yellow-400 mr-2" />
                    {score}
                  </h2>
               </div>
               
               <div className="hud-panel bg-black/80 p-4 rounded-xl border-l-4 border-neon-blue hidden md:block">
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Current Pattern</p>
                  <div className="text-xl text-neon-blue font-mono flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    {comboName}
                  </div>
               </div>
            </div>
            
            <button 
                onClick={toggleCamera}
                className={`p-3 rounded-lg border backdrop-blur-md transition-all ${cameraActive ? 'border-neon-red text-neon-red bg-black/80' : 'border-neon-green text-neon-green bg-neon-green/10 animate-pulse'}`}
            >
                {cameraActive ? <VideoOff /> : <Video />}
            </button>
        </div>

        {/* Center Notifications */}
        {!isActive && cameraActive && (
          <div className="self-center text-center pointer-events-auto">
             <div className="hud-panel bg-black/80 p-8 rounded-2xl border border-neon-green/30 backdrop-blur-xl">
               <Activity size={48} className="mx-auto text-neon-green mb-4" />
               <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-widest">ShadowBox AR</h3>
               <p className="text-gray-400 mb-6 max-w-md">
                 Targets will fly towards you. Punch (move fast) towards the targets when they get close to explode them.
               </p>
               <button 
                 onClick={() => setIsActive(true)}
                 className="bg-neon-green text-black font-bold py-3 px-8 rounded hover:bg-white transition-colors uppercase tracking-widest"
               >
                 Initialize Simulation
               </button>
             </div>
          </div>
        )}

        {/* Bottom HUD */}
        <div className="flex justify-between items-end pointer-events-auto">
           <div className="text-xs text-gray-500 font-mono">
             SYS.STATUS: {cameraActive ? 'ONLINE' : 'OFFLINE'} <br/>
             MOTION.SENS: {MOTION_THRESHOLD}%
           </div>
           
           {isActive && (
             <button 
              onClick={() => setIsActive(false)}
              className="bg-neon-red/20 border border-neon-red text-neon-red p-4 rounded-full hover:bg-neon-red hover:text-white transition-colors"
             >
               <Square fill="currentColor" />
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default TrainingMode;
