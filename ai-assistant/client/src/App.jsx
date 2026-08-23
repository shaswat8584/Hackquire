import React, { useState, useEffect } from 'react';
import Chatbot from './pages/Chatbot';
import UniversityDemo from './pages/UniversityDemo';
import { checkHealth } from './services/api';
import { Bot, Sparkles, GraduationCap, Server, ShieldCheck, ExternalLink } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('skillbridge');
  const [health, setHealth] = useState({ status: 'checking' });

  useEffect(() => {
    const pingServer = async () => {
      const res = await checkHealth();
      setHealth(res);
    };
    pingServer();
    const interval = setInterval(pingServer, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-400 p-0.5 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-indigo-400">
              <Bot className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="font-black text-white text-base tracking-tight flex items-center gap-1.5">
              Gemini AI Assistant <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">API v1.0</span>
            </span>
            <p className="text-[10px] text-slate-400 hidden sm:block">Standalone Reusable Microservice</p>
          </div>
        </div>

        {/* Demo Tabs */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('skillbridge')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'skillbridge'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            SkillBridge FAQ
          </button>

          <button
            onClick={() => setActiveTab('university')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'university'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            University Demo
          </button>
        </div>

        {/* Health status badge */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
            <span
              className={`w-2 h-2 rounded-full ${
                health.status === 'ok' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
              }`}
            />
            {health.status === 'ok' ? 'API Port 5001: Online' : 'API Offline'}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {activeTab === 'skillbridge' ? <Chatbot /> : <UniversityDemo />}
      </main>
    </div>
  );
}

export default App;
