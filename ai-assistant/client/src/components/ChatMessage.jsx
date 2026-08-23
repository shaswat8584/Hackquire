import React, { useState } from 'react';
import { Bot, User, Copy, Check } from 'lucide-react';

const ChatMessage = ({ message }) => {
  const isUser = message.sender === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to format basic markdown (bold text, bullets, paragraphs)
  const formatContent = (text) => {
    if (!text) return '';
    const lines = text.split('\n');

    return lines.map((line, idx) => {
      // Bullet list
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        const cleanLine = line.trim().substring(1).trim();
        return (
          <li key={idx} className="ml-4 list-disc text-slate-200 text-xs sm:text-sm my-0.5 leading-relaxed">
            {renderFormattedInline(cleanLine)}
          </li>
        );
      }

      // Empty line
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="text-xs sm:text-sm my-0.5 leading-relaxed">
          {renderFormattedInline(line)}
        </p>
      );
    });
  };

  // Helper for **bold** rendering
  const renderFormattedInline = (str) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} group`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-md ${
          isUser
            ? 'bg-gradient-to-tr from-indigo-500 to-sky-400 text-white'
            : 'bg-slate-800 border border-slate-700/80 text-indigo-400'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Bubble Container */}
      <div className={`max-w-[85%] sm:max-w-[75%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`relative px-4 py-3 rounded-2xl shadow-lg transition-all ${
            isUser
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-sm'
              : 'bg-slate-800/90 border border-slate-700/70 text-slate-200 rounded-tl-sm'
          }`}
        >
          {formatContent(message.text)}

          {/* Copy button for assistant responses */}
          {!isUser && (
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Copy answer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-[10px] text-slate-400 mt-1 px-1 font-mono">
          {message.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;
