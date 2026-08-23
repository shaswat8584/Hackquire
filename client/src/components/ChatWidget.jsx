import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { askAIAssistant } from '../services/aiAssistantApi';
import {
  Bot,
  X,
  Send,
  Sparkles,
  RotateCcw,
  User,
  ShieldCheck,
  ChevronDown,
  Minimize2,
  Maximize2,
} from 'lucide-react';


const initialMessages = [
  {
    id: 1,
    sender: 'assistant',
    text: "Hi there! I'm your **SkillBridge AI Assistant**. How can I help you find teammates, join opportunities, or form a project squad today?",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

const starterChips = [
  "How do I create a team?",
  "How to find candidates for a role?",
  "How to post an opportunity?",
  "How to invite a student to my team?",
  "Can I be in multiple teams?",
  "How to track my applications?",
];

const ChatWidget = () => {
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };
    window.addEventListener('open_ai_assistant', handleOpen);
    return () => window.removeEventListener('open_ai_assistant', handleOpen);
  }, []);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen, isMinimized]);



  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input.trim();
    if (!text || loading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await askAIAssistant(text);
      const botMessage = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: res.answer || "I don't have enough information to answer that.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setError(err.message || 'AI service unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages(initialMessages);
    setError(null);
  };

  // Inline formatting helper
  const renderFormattedInline = (str) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const renderContent = (text) => {
    const lines = (text || '').split('\n');
    return lines.map((line, idx) => {
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <li key={idx} className="ml-4 list-disc text-xs my-0.5 leading-relaxed">
            {renderFormattedInline(line.trim().substring(1).trim())}
          </li>
        );
      }
      if (!line.trim()) return <div key={idx} className="h-1.5" />;
      return (
        <p key={idx} className="text-xs my-0.5 leading-relaxed">
          {renderFormattedInline(line)}
        </p>
      );
    });
  };

  if (!isOpen) return null;

  const widgetContent = (
    <div className="fixed bottom-6 right-6 z-[9000] flex flex-col items-end animate-fadeIn">
      {/* Expanded Chat Drawer */}
      <div
        className={`bg-white border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-200 ease-out w-[calc(100vw-2rem)] sm:w-[380px] ${
          isMinimized ? 'h-14' : 'h-[520px] max-h-[80vh]'
        }`}
      >
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold flex items-center gap-1.5">
                SkillBridge AI Assistant
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </h3>
              <p className="text-[10px] text-slate-300">Instant FAQ & Match Guide</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {!isMinimized && messages.length > 1 && (
              <button
                onClick={handleClear}
                className="p-1 text-slate-300 hover:text-white rounded-lg transition-colors"
                title="Reset conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 text-slate-300 hover:text-white rounded-lg transition-colors"
              title={isMinimized ? 'Expand' : 'Minimize'}
            >
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-300 hover:text-white rounded-lg transition-colors"
              title="Close assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        {!isMinimized && (
          <>
            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] ${
                        isUser ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-indigo-700'
                      }`}
                    >
                      {isUser ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                    </div>

                    <div className={`max-w-[85%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`px-3.5 py-2.5 rounded-2xl shadow-sm ${
                          isUser
                            ? 'bg-indigo-600 text-white rounded-tr-sm'
                            : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-sm'
                        }`}
                      >
                        {renderContent(msg.text)}
                      </div>
                      <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 p-2.5 rounded-2xl w-fit">
                  <Bot className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                  <span>Thinking...</span>
                </div>
              )}

              {error && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                  {error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Starter Chips */}
            <div className="px-3 pt-2 pb-1 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {starterChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={loading}
                  onClick={() => handleSendMessage(chip)}
                  className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-full border border-slate-200/60 whitespace-nowrap transition-colors shrink-0 disabled:opacity-50"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-white flex items-center gap-2 border-t border-slate-100"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                disabled={loading}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center disabled:opacity-40 transition-colors shadow-sm shadow-indigo-200 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(widgetContent, document.body);
};


export default ChatWidget;
