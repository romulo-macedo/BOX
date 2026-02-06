import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, RefreshCw, Video, VideoOff, Activity } from 'lucide-react';
import { generateBoxingCombo } from '../services/geminiService';
import { Combo } from '../types';

const TrainingMode: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [combo, setCombo] = useState<Combo | null>(null);
  const [difficulty, setDifficulty] = useState('Beginner');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 min round
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleCamera = async () => {
    if (cameraActive) {
      setCameraActive(false);
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
      } catch (err) {
        console.error("Camera error:", err);
        alert("Camera permission denied or unavailable.");
      }
    }
  };

  const getNewCombo = async () => {
    setLoading(true);
    const newCombo = await generateBoxingCombo(difficulty, "Speed and Flow");
    setCombo(newCombo);
    setLoading(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="h-full w-full flex flex-col relative overflow-hidden">
      {/* Background Camera Feed */}
      <div className="absolute inset-0 z-0 bg-black">
        {cameraActive ? (
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline
            className="w-full h-full object-cover opacity-50 grayscale"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900/50">
            <p className="text-gray-600 font-mono text-sm">[ CAMERA OFFLINE ]</p>
          </div>
        )}
        {/* Grid Overlay */}
        <div className="absolute inset-0 z-10 bg-[linear-gradient(rgba(18,18,18,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none"></div>
      </div>

      {/* Main HUD Layer */}
      <div className="relative z-20 flex-1 flex flex-col p-6">
        
        {/* Top Bar */}
        <div className="flex justify-between items-start mb-8">
            <div className="hud-panel bg-black/80 px-6 py-2 rounded-br-2xl border-t border-l border-neon-blue">
                <h2 className="text-4xl font-bold text-neon-blue font-mono">{formatTime(timeLeft)}</h2>
                <p className="text-xs text-gray-400 uppercase tracking-widest">Round 1</p>
            </div>
            
            <div className="flex space-x-2">
                 <button 
                    onClick={toggleCamera}
                    className={`p-3 rounded-lg border transition-all ${cameraActive ? 'border-neon-red text-neon-red bg-neon-red/10' : 'border-gray-500 text-gray-500 bg-black/50'}`}
                >
                    {cameraActive ? <VideoOff /> : <Video />}
                </button>
            </div>
        </div>

        {/* Center: Combo Display */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-8">
            {loading ? (
                <div className="animate-pulse text-neon-green font-mono text-xl">
                    [ ACQUIRING TARGET DATA... ]
                </div>
            ) : combo ? (
                <div className="w-full max-w-2xl text-center">
                    <div className="hud-panel bg-black/60 backdrop-blur-md p-8 rounded-3xl border border-neon-green/30 shadow-[0_0_50px_rgba(57,255,20,0.1)]">
                        <h3 className="text-neon-green text-lg uppercase tracking-[0.3em] mb-4">{combo.name}</h3>
                        <div className="flex flex-wrap justify-center gap-4 mb-6">
                            {combo.sequence.map((move, idx) => (
                                <span key={idx} className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-2xl font-bold uppercase text-white animate-pulse-fast" style={{animationDelay: `${idx * 0.5}s`}}>
                                    {move}
                                </span>
                            ))}
                        </div>
                        <p className="text-gray-300 italic font-mono text-sm border-t border-gray-700 pt-4 mt-4">
                            "{combo.description}"
                        </p>
                    </div>
                </div>
            ) : (
                <div className="text-center opacity-70">
                    <Activity size={64} className="mx-auto text-gray-500 mb-4" />
                    <p className="text-xl uppercase tracking-widest">System Ready</p>
                </div>
            )}
        </div>

        {/* Bottom Controls */}
        <div className="flex justify-center items-end pb-8 gap-6">
            <div className="bg-black/80 backdrop-blur rounded-2xl p-2 flex items-center space-x-2 border border-gray-700">
                <select 
                    value={difficulty} 
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="bg-transparent text-white font-mono p-2 outline-none cursor-pointer"
                >
                    <option value="Beginner">Level 1: Rookie</option>
                    <option value="Intermediate">Level 2: Contender</option>
                    <option value="Advanced">Level 3: Champion</option>
                </select>
            </div>

            <button 
                onClick={getNewCombo}
                disabled={loading}
                className="hud-panel bg-neon-blue/20 hover:bg-neon-blue/40 text-neon-blue border border-neon-blue p-4 rounded-full transition-all active:scale-95"
            >
                <RefreshCw size={32} className={loading ? 'animate-spin' : ''} />
            </button>

            <button 
                onClick={() => setIsActive(!isActive)}
                className={`hud-panel p-6 rounded-full border-2 transition-all active:scale-95 ${isActive ? 'bg-neon-red/20 border-neon-red text-neon-red' : 'bg-neon-green/20 border-neon-green text-neon-green'}`}
            >
                {isActive ? <Square size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
            </button>
        </div>
      </div>
    </div>
  );
};

export default TrainingMode;
