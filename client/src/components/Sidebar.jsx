import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Compass,
  Layers,
  UserCircle,
  Shield,
  FileText,
  X,
  Sparkles,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'SkillMatch',
      path: '/skillmatch',
      icon: Users,
      badge: '60/20/20',
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
                  <span className="text-[10px] bg-indigo-100/80 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-bold">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Sidebar Footer Info Card */}
        <div className="p-4 border-t border-slate-100 m-3 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-sky-50/50 to-slate-50 border-indigo-100/60">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-950 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Matching Engine</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Automatic 60% skills + 20% interest + 20% availability pairing.
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
