import React from 'react';
import { Bot } from 'lucide-react';

const TypingIndicator = ({ assistantName = 'Assistant' }) => {
  return (
    <div className="flex items-start gap-3 animate-fadeIn">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
        <Bot className="w-4 h-4" />
      </div>

      {/* Bubble */}
      <div className="bg-slate-800 border border-slate-700/60 rounded-2xl rounded-tl-sm px-4 py-3 shadow-md flex items-center gap-1.5">
        <span className="text-xs text-slate-400 font-medium mr-1">{assistantName} is thinking</span>
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
};

export default TypingIndicator;
