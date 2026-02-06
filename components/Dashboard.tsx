import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { PerformanceData } from '../types';
import { Activity, Zap, TrendingUp, Shield } from 'lucide-react';

interface DashboardProps {
  data: PerformanceData[];
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  return (
    <div className="h-full w-full p-6 overflow-y-auto">
      <header className="mb-8 border-b border-neon-blue/30 pb-4">
        <h2 className="text-3xl font-bold text-white tracking-widest uppercase">Fighter Status</h2>
        <p className="text-neon-blue text-sm mt-1">Bio-metrics & Performance History</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="hud-panel bg-hud-glass p-4 rounded-xl flex items-center space-x-4 border-l-4 border-neon-green">
          <div className="p-3 bg-neon-green/20 rounded-full">
            <Zap className="text-neon-green w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase">Avg Speed</p>
            <h3 className="text-2xl font-mono text-white">8.4 <span className="text-sm text-gray-500">m/s</span></h3>
          </div>
        </div>

        <div className="hud-panel bg-hud-glass p-4 rounded-xl flex items-center space-x-4 border-l-4 border-neon-red">
          <div className="p-3 bg-neon-red/20 rounded-full">
            <Activity className="text-neon-red w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase">Impact Force</p>
            <h3 className="text-2xl font-mono text-white">740 <span className="text-sm text-gray-500">PSI</span></h3>
          </div>
        </div>

        <div className="hud-panel bg-hud-glass p-4 rounded-xl flex items-center space-x-4 border-l-4 border-cyan-400">
          <div className="p-3 bg-cyan-400/20 rounded-full">
            <TrendingUp className="text-cyan-400 w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase">Accuracy</p>
            <h3 className="text-2xl font-mono text-white">92%</h3>
          </div>
        </div>

        <div className="hud-panel bg-hud-glass p-4 rounded-xl flex items-center space-x-4 border-l-4 border-purple-500">
          <div className="p-3 bg-purple-500/20 rounded-full">
            <Shield className="text-purple-500 w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase">Defense Rating</p>
            <h3 className="text-2xl font-mono text-white">A-</h3>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="hud-panel bg-hud-glass p-6 rounded-xl border border-white/5">
        <h3 className="text-lg text-white mb-4 font-mono">INTENSITY ANALYSIS</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ffff" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#00ffff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="day" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#000', border: '1px solid #00ffff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="intensity" stroke="#00ffff" fillOpacity={1} fill="url(#colorIntensity)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="hud-panel bg-hud-glass p-6 rounded-xl">
            <h4 className="text-neon-green mb-2 font-bold">RECENT ACTIVITY</h4>
            <ul className="space-y-2 text-sm text-gray-300 font-mono">
                <li className="flex justify-between border-b border-white/5 pb-2">
                    <span>Shadow Drill - H.I.I.T</span>
                    <span className="text-white">14:00 mins</span>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-2">
                    <span>Reaction Training</span>
                    <span className="text-white">08:30 mins</span>
                </li>
                 <li className="flex justify-between pb-2">
                    <span>AI Sparring Analysis</span>
                    <span className="text-white">Completed</span>
                </li>
            </ul>
        </div>

         <div className="hud-panel bg-hud-glass p-6 rounded-xl flex flex-col justify-center items-center text-center">
            <h4 className="text-neon-blue mb-2 font-bold">NEXT SESSION</h4>
            <p className="text-2xl font-bold text-white mb-2">SPEED & FOOTWORK</p>
            <button className="px-6 py-2 bg-neon-blue/20 text-neon-blue border border-neon-blue hover:bg-neon-blue hover:text-black transition-all rounded uppercase text-xs tracking-widest">
                Start Now
            </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
