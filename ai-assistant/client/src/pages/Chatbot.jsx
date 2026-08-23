import React, { useState } from 'react';
import ChatWindow from '../components/ChatWindow';
import { sendMessage } from '../services/api';
import { Sparkles, ArrowUpRight, BookOpen, Layers, Users, Compass } from 'lucide-react';

const initialMessages = [
  {
    id: 1,
    sender: 'assistant',
    text: "Hello! I'm the **SkillBridge AI Assistant**. How can I help you today? You can ask me about finding teammates on SkillMatch, creating teams in TeamForge, or posting opportunities!",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

const presetQuestions = [
  "How does the SkillMatch score get calculated?",
  "How do I create a team in TeamForge?",
  "How do I find candidates for missing roles?",
  "How can I post an opportunity?",
  "How do I invite a student to my team?",
  "Can I be in multiple teams simultaneously?",
  "How do I track my submitted applications?",
];

const Chatbot = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSendMessage = async (text) => {
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      const response = await sendMessage(text, 'skillbridge');

      const botMessage = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: response.answer || "I don't have enough information to answer that.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setError(err.message || 'Failed to get a response from the AI assistant.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages(initialMessages);
    setError(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-5rem)]">
      {/* Left Info Sidebar */}
      <div className="lg:col-span-4 space-y-6 hidden lg:flex flex-col justify-between overflow-y-auto pr-2">
        <div className="space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Standalone Service
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              AI FAQ Assistant
            </h1>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              An independent microservice providing grounded product answers for SkillBridge, universities, and student portals via Gemini.
            </p>
          </div>

          {/* Module Cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Configured Knowledge Base
            </h3>

            <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                <Users className="w-3.5 h-3.5" /> SkillMatch Engine
              </div>
              <p className="text-[11px] text-slate-400">
                60/20/20 compatibility model connecting students with complementary skills.
              </p>
            </div>

            <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                <Compass className="w-3.5 h-3.5" /> OpportunityHub
              </div>
              <p className="text-[11px] text-slate-400">
                Campus-wide projects, internships, hackathons, and competitions.
              </p>
            </div>

            <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Layers className="w-3.5 h-3.5" /> TeamForge
              </div>
              <p className="text-[11px] text-slate-400">
                Squad building, missing role alerts, and automatic candidate discovery.
              </p>
            </div>
          </div>
        </div>

        {/* Integration Callout */}
        <div className="p-4 bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/20 rounded-2xl text-xs space-y-2">
          <span className="text-[10px] font-bold uppercase text-indigo-300">REST API Endpoint</span>
          <div className="p-2 bg-slate-950 font-mono text-[11px] text-indigo-200 rounded-lg">
            POST /api/chat
          </div>
          <p className="text-[11px] text-slate-400">
            Easily consumable by any client with zero database dependencies.
          </p>
        </div>
      </div>

      {/* Right Chat Area */}
      <div className="lg:col-span-8 h-full">
        <ChatWindow
          messages={messages}
          loading={loading}
          error={error}
          onSendMessage={handleSendMessage}
          onClearChat={handleClearChat}
          title="SkillBridge AI Assistant"
          subtitle="Grounded Platform FAQ & Matchmaking Guide"
          suggestedQuestions={presetQuestions}
        />
      </div>
    </div>
  );
};

export default Chatbot;
