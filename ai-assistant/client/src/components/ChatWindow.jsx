import React, { useEffect, useRef } from 'react';
import { Bot, RotateCcw, Sparkles, ShieldCheck, AlertCircle } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';

const ChatWindow = ({
  messages = [],
  loading = false,
  error = null,
  onSendMessage,
  onClearChat,
  title = 'SkillBridge AI Assistant',
  subtitle = 'Official FAQ & Support Service',
  suggestedQuestions = [],
}) => {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  return (
    <div className="flex flex-col h-full bg-slate-900/90 border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
      {/* Header */}
      <div className="px-6 py-4 bg-slate-800/60 border-b border-slate-700/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-indigo-400">
                <Bot className="w-5 h-5" />
              </div>
            </div>
            {/* Live Indicator */}
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
              {title}
              <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] rounded-full font-medium">
                Gemini Powered
              </span>
            </h2>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>
        </div>

        {/* Clear Chat Button */}
        {messages.length > 1 && (
          <button
            onClick={onClearChat}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors text-xs flex items-center gap-1"
            title="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {/* Welcome Intro Banner if only 1 welcome message */}
        {messages.length <= 1 && (
          <div className="p-4 bg-gradient-to-r from-indigo-950/40 via-slate-800/40 to-slate-900 border border-indigo-500/20 rounded-2xl text-xs space-y-2 mb-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-wider text-[10px]">
              <Sparkles className="w-3.5 h-3.5" /> Grounded Knowledge Base
            </div>
            <p className="text-slate-300">
              I can answer all questions regarding platform features, the 60/20/20 matching algorithm, team management, and opportunities!
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {loading && <TypingIndicator assistantName={title.split(' ')[0]} />}

        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-2xl flex items-center gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-800/40 border-t border-slate-700/60 shrink-0">
        <ChatInput
          onSendMessage={onSendMessage}
          disabled={loading}
          suggestedQuestions={suggestedQuestions}
        />
        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 px-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" /> Grounded in product knowledge
          </span>
          <span>Press Enter to send</span>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
