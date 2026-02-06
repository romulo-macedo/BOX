import React from 'react';
import { LayoutDashboard, Swords, MessageSquare, Settings } from 'lucide-react';
import { ViewMode } from '../types';

interface NavbarProps {
  currentView: ViewMode;
  setView: (view: ViewMode) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  const navItems: { id: ViewMode; icon: React.ReactNode; label: string }[] = [
    { id: 'DASHBOARD', icon: <LayoutDashboard size={24} />, label: 'Stats' },
    { id: 'TRAINING', icon: <Swords size={24} />, label: 'Train' },
    { id: 'CORNERMAN', icon: <MessageSquare size={24} />, label: 'AI Coach' },
    // { id: 'SETTINGS', icon: <Settings size={24} />, label: 'System' },
  ];

  return (
    <nav className="z-50 bg-black/90 border-t border-white/10 h-20 md:h-full md:w-24 md:border-t-0 md:border-r flex md:flex-col items-center justify-around md:justify-center md:space-y-12 shrink-0 backdrop-blur-lg">
        {navItems.map((item) => (
            <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`flex flex-col items-center justify-center w-full h-full md:h-auto space-y-1 transition-all duration-300 relative ${
                    currentView === item.id 
                    ? 'text-neon-green' 
                    : 'text-gray-500 hover:text-white'
                }`}
            >
                <div className={`p-3 rounded-xl transition-all ${currentView === item.id ? 'bg-neon-green/10 shadow-[0_0_15px_rgba(57,255,20,0.3)]' : ''}`}>
                    {item.icon}
                </div>
                <span className="text-[10px] uppercase tracking-wider font-bold">{item.label}</span>
                
                {/* Active Indicator Line */}
                {currentView === item.id && (
                    <div className="absolute top-0 md:top-auto md:right-0 w-full h-0.5 md:w-1 md:h-full bg-neon-green shadow-[0_0_10px_#39ff14]" />
                )}
            </button>
        ))}
    </nav>
  );
};

export default Navbar;
