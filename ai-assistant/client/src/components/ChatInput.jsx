import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';

const ChatInput = ({ onSendMessage, disabled, placeholder = 'Ask anything about the platform...', suggestedQuestions = [] }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || disabled) return;

    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    if (disabled) return;
    onSendMessage(suggestion);
  };

  return (
    <div className="space-y-3">
      {/* Quick Prompt Suggestions */}
      {suggestedQuestions.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" /> Suggested:
          </span>
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => handleSelectSuggestion(q)}
              className="text-xs bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white px-3 py-1.5 rounded-full border border-slate-700/60 whitespace-nowrap transition-colors shrink-0 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <form
        onSubmit={handleSubmit}
        className="relative flex items-end gap-2 bg-slate-800/90 border border-slate-700/80 focus-within:border-indigo-500/80 focus-within:ring-2 focus-within:ring-indigo-500/20 rounded-2xl p-2 transition-all shadow-inner"
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={1000}
          className="flex-1 bg-transparent text-slate-100 placeholder-slate-400 text-xs sm:text-sm px-3 py-1.5 resize-none focus:outline-none max-h-32 disabled:opacity-50"
        />

        <div className="flex items-center gap-1.5 shrink-0 pb-0.5">
          {input.length > 800 && (
            <span className="text-[10px] text-amber-400 font-mono pr-1">
              {input.length}/1000
            </span>
          )}

          <button
            type="submit"
            disabled={!input.trim() || disabled}
            className="w-8 h-8 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-600/30"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
