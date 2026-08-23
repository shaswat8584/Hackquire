import React, { useState } from 'react';
import ChatWindow from '../components/ChatWindow';
import { sendMessage } from '../services/api';
import { GraduationCap, Landmark, Calendar, Award, BookOpen, Sparkles } from 'lucide-react';

const initialMessages = [
  {
    id: 1,
    sender: 'assistant',
    text: "Welcome to the **Apex University Student Portal**! I'm your AI Campus Assistant. Ask me about fall admission deadlines, scholarship requirements, course registration, or campus housing.",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

const universityQuestions = [
  "What are the application deadlines for fall admission?",
  "How do I apply for academic scholarships?",
  "When does course registration open for next semester?",
  "How do I request an official transcript?",
];

const UniversityDemo = () => {
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
      // Pass portalType: 'university' to use the university knowledge base
      const response = await sendMessage(text, 'university');

      const botMessage = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: response.answer || "I don't have enough information in the University knowledge base to answer that.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setError(err.message || 'Failed to connect to the University AI assistant.');
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-3">
              <GraduationCap className="w-3.5 h-3.5" /> Third-Party Demo
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Apex University Portal
            </h1>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              This demo proves that the exact same AI Assistant REST API can be integrated by universities and external EdTech platforms by swapping the knowledge base.
            </p>
          </div>

          {/* Highlights */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active University Knowledge Base
            </h3>

            <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <Landmark className="w-3.5 h-3.5" /> Admissions & Deadlines
              </div>
              <p className="text-[11px] text-slate-400">
                Early Action (Nov 1), Regular Decision (Jan 15), and international guidelines.
              </p>
            </div>

            <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Award className="w-3.5 h-3.5" /> Scholarships & Aid
              </div>
              <p className="text-[11px] text-slate-400">
                Merit-based scholarships, FAFSA submission, and need-based financial aid.
              </p>
            </div>

            <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                <Calendar className="w-3.5 h-3.5" /> Course Registration
              </div>
              <p className="text-[11px] text-slate-400">
                Senior, Junior, Sophomore, and Freshman enrollment windows.
              </p>
            </div>
          </div>
        </div>

        {/* Integration Code Snippet */}
        <div className="p-4 bg-slate-800/80 border border-slate-700/80 rounded-2xl text-xs space-y-2">
          <span className="text-[10px] font-bold uppercase text-slate-400">Plug & Play Integration</span>
          <pre className="p-2 bg-slate-950 font-mono text-[10px] text-emerald-400 rounded-lg overflow-x-auto">
{`// Calling from University Frontend:
POST /api/chat
{ "portalType": "university",
  "message": "When are deadlines?" }`}
          </pre>
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
          title="Apex University AI Assistant"
          subtitle="Admissions, Enrollment & Campus FAQ"
          suggestedQuestions={universityQuestions}
        />
      </div>
    </div>
  );
};

export default UniversityDemo;
