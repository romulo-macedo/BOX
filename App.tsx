import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import TrainingMode from './components/TrainingMode';
import Cornerman from './components/Cornerman';
import { ViewMode, PerformanceData } from './types';

// Mock Data
const MOCK_DATA: PerformanceData[] = [
  { day: 'Mon', intensity: 65, accuracy: 80 },
  { day: 'Tue', intensity: 75, accuracy: 85 },
  { day: 'Wed', intensity: 50, accuracy: 70 },
  { day: 'Thu', intensity: 90, accuracy: 92 },
  { day: 'Fri', intensity: 85, accuracy: 88 },
  { day: 'Sat', intensity: 95, accuracy: 90 },
  { day: 'Sun', intensity: 40, accuracy: 95 },
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('TRAINING');

  const renderView = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard data={MOCK_DATA} />;
      case 'TRAINING':
        return <TrainingMode />;
      case 'CORNERMAN':
        return <Cornerman />;
      default:
        return <Dashboard data={MOCK_DATA} />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-hud-black text-white overflow-hidden selection:bg-neon-green selection:text-black font-sans relative">
      
      {/* Background Ambience / Scanlines */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 animate-scanline scanline-overlay"></div>
      
      {/* Navigation - Bottom on Mobile, Left on Desktop */}
      <div className="order-2 md:order-1 flex-none">
        <Navbar currentView={currentView} setView={setCurrentView} />
      </div>

      {/* Main Content Area */}
      <main className="order-1 md:order-2 flex-1 relative z-10 overflow-hidden flex flex-col">
        {/* Top Header Decor */}
        <div className="h-1 w-full bg-gradient-to-r from-neon-green via-neon-blue to-neon-red opacity-50"></div>
        
        <div className="flex-1 overflow-hidden relative">
            {renderView()}
        </div>
      </main>

    </div>
  );
};

export default App;
