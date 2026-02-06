import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, AlertTriangle } from 'lucide-react';
import { getCornermanAdvice } from '../services/geminiService';
import { ChatMessage } from '../types';

const Cornerman: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: "I'm in your corner, kid. What do we need to work on? Defense? Speed? Or just surviving the next round?", timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Prepare history for API
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const responseText = await getCornermanAdvice(history, userMsg.text);

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, botMsg]);
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex-none mb-4 flex items-center space-x-2">
        <Bot className="text-neon-green" />
        <h2 className="text-2xl font-bold text-white tracking-wider">AI CORNERMAN</h2>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] p-4 rounded-xl backdrop-blur-sm border ${
                msg.role === 'user' 
                  ? 'bg-neon-blue/10 border-neon-blue/30 text-right' 
                  : 'bg-zinc-900/80 border-neon-green/30 text-left'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1 text-xs opacity-50 uppercase tracking-widest">
                {msg.role === 'model' && <Bot size={12} />}
                <span>{msg.role === 'user' ? 'FIGHTER' : 'COACH MICKEY'}</span>
                {msg.role === 'user' && <User size={12} />}
              </div>
              <p className="text-lg leading-relaxed text-gray-100">{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && (
           <div className="flex justify-start">
             <div className="bg-zinc-900/80 border border-neon-green/30 p-4 rounded-xl flex items-center space-x-2">
               <div className="w-2 h-2 bg-neon-green rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-neon-green rounded-full animate-bounce delay-100"></div>
               <div className="w-2 h-2 bg-neon-green rounded-full animate-bounce delay-200"></div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex-none flex items-center space-x-2 bg-hud-glass p-2 rounded-xl border border-white/10">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask for strategy, drills, or motivation..."
          className="flex-1 bg-transparent border-none text-white focus:ring-0 placeholder-gray-500 font-mono text-lg p-2 outline-none"
        />
        <button 
          onClick={handleSend}
          disabled={loading}
          className="p-3 bg-neon-green/20 text-neon-green rounded-lg hover:bg-neon-green hover:text-black transition-colors disabled:opacity-50"
        >
          <Send size={24} />
        </button>
      </div>
      
      <div className="mt-2 flex items-center justify-center text-xs text-gray-500 space-x-1">
        <AlertTriangle size={12} />
        <span>AI advice is for simulation only. Consult a real professional for physical training.</span>
      </div>
    </div>
  );
};

export default Cornerman;
