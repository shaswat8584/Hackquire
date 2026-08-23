import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import { useConnection } from '../context/ConnectionContext';
import {
  LayoutDashboard,
  Users,
  Compass,
  Layers,
  UserCircle,
  Shield,
  FileText,
  MessageSquare,
  UserPlus,
  X,
  Sparkles,
  Bot,
} from 'lucide-react';


const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { totalUnreadCount } = useChat();
  const { pendingIncomingCount } = useConnection();

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Messages',
      path: '/messages',
      icon: MessageSquare,
      badge: totalUnreadCount > 0 ? (totalUnreadCount > 99 ? '99+' : `${totalUnreadCount}`) : null,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      name: 'SkillMatch',
      path: '/skillmatch',
      icon: Users,
      badge: '60/20/20',
      badgeColor: 'bg-indigo-100/80 text-indigo-700',
    },
    {
      name: 'Opportunities',
      path: '/opportunities',
      icon: Compass,
    },
    {
      name: 'TeamForge',
      path: '/teams',
      icon: Layers,
    },
    {
      name: 'My Network',
      path: '/network',
      icon: UserPlus,
      badge: pendingIncomingCount > 0 ? `${pendingIncomingCount}` : null,
      badgeColor: 'bg-indigo-600 text-white',
    },

    {
      name: 'My Profile',
      path: '/profile',
      icon: UserCircle,
    },
    {
      name: 'My Teams',
      path: '/teams?tab=my',
      icon: Shield,
    },
    {
      name: 'My Applications',
      path: '/dashboard?tab=applications',
      icon: FileText,
    },
  ];


  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-35 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 shadow-2xl lg:shadow-none transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:z-20 lg:self-start shrink-0 flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-1.5 overflow-y-auto">
          {/* Mobile close button */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 lg:hidden">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Navigation</span>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Main Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/dashboard?tab=applications'
                ? location.pathname === '/dashboard' && location.search.includes('tab=applications')
                : item.path === '/teams?tab=my'
                ? location.pathname === '/teams' && location.search.includes('tab=my')
                : location.pathname === item.path && !location.search.includes('tab=');

            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => onClose && onClose()}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                      item.badgeColor || 'bg-indigo-100/80 text-indigo-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Sidebar Footer AI Assistant Launcher */}
        <div className="p-3.5 m-3 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white border border-indigo-500/30 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-indigo-600/50 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold block leading-tight">AI Assistant</span>
                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Online Guide
                </span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
            Instant FAQ, role requirements & matchmaking guide.
          </p>
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open_ai_assistant'));
              if (onClose) onClose();
            }}
            className="w-full py-2 px-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30 hover:scale-[1.02]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask AI Assistant</span>
          </button>
        </div>
      </aside>

    </>
  );
};

export default Sidebar;
