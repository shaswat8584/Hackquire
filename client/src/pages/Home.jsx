import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Users,
  Compass,
  Layers,
  ArrowRight,
  CheckCircle2,
  Zap,
  Target,
  Clock,
  Shield,
} from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Intelligent Student Talent & Opportunity Exchange</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
              Connect. Collaborate.{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-sky-600 to-indigo-700 bg-clip-text text-transparent">
                Build Winning Teams.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed">
              SkillBridge unites student developers, designers, and creators with complementary skills, real-world projects, hackathons, and structured team formation—powered by an intelligent 60/20/20 matching algorithm.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                to="/register"
                className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
              >
                Join SkillBridge Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl border border-slate-200 transition-all text-center"
              >
                Sign In (Demo Accounts)
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Interconnected Modules Section */}
      <section className="py-16 bg-slate-50/80 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              One Unified Platform. Three Powerful Modules.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Shared authentication, student profiles, and matching engine connecting every step of your journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Module 1: SkillMatch */}
            <div className="bg-white rounded-2xl p-7 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5 ring-1 ring-indigo-100">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">1. SkillMatch</h3>
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-3">
                  Complementary Talent Discovery
                </p>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Find peers whose skills and interests perfectly complement yours. View compatibility percentages with clear, deterministic explanations.
                </p>
                <ul className="space-y-2 text-xs text-slate-600 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Skill & interest overlap breakdown</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Availability proximity matching</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Role & domain alignment filters</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/skillmatch"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-2"
              >
                Explore SkillMatch <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Module 2: OpportunityHub */}
            <div className="bg-white rounded-2xl p-7 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-5 ring-1 ring-sky-100">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">2. OpportunityHub</h3>
                <p className="text-xs font-semibold text-sky-600 uppercase tracking-wider mb-3">
                  Curated Projects & Hackathons
                </p>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Browse collegiate projects, national hackathons, research competitions, and internships tailored to your skillset.
                </p>
                <ul className="space-y-2 text-xs text-slate-600 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Automatic compatibility calculation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Missing skill identification</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Direct role application workflow</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/opportunities"
                className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 mt-2"
              >
                Explore Opportunities <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Module 3: TeamForge */}
            <div className="bg-white rounded-2xl p-7 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5 ring-1 ring-amber-100">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">3. TeamForge</h3>
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-3">
                  Role-Based Team Formation
                </p>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Define required role slots for your project. Easily spot missing roles and click "Find Candidates" to auto-match suitable peers.
                </p>
                <ul className="space-y-2 text-xs text-slate-600 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Visual role structure tree</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Missing role candidate matching</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Invitations and member assignment</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/teams"
                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 mt-2"
              >
                Explore TeamForge <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Matching Formula Explanation Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">
                Transparent & Intelligent
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-2 mb-4">
                The 60 / 20 / 20 Compatibility Engine
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                SkillBridge utilizes a clean, deterministic algorithm calculating exact compatibility without black-box AI uncertainties.
              </p>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0">
                    60%
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Technical Skill Compatibility</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Evaluates shared technical core competencies and complementary skill depth.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0">
                    20%
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Domain Interests & Roles</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Matches preferred project types, AI/FinTech/Web domain focus, and role affinities.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                    20%
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Availability Proximity</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Ensures balanced weekly hours commitment and realistic collaboration bandwidth.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Example Card */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-mono text-xs font-bold text-slate-200">Sample Match Output</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-xs font-mono font-bold border border-emerald-800">
                  92% Match
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="text-slate-400 text-[11px] uppercase tracking-wider font-sans font-bold">Why?</div>
                <div className="text-emerald-400 flex items-center gap-2">
                  <span>✓</span> Strong complementary technical skills
                </div>
                <div className="text-emerald-400 flex items-center gap-2">
                  <span>✓</span> Shared interest in AI
                </div>
                <div className="text-emerald-400 flex items-center gap-2">
                  <span>✓</span> Compatible availability (10 hrs/wk)
                </div>
                <div className="text-emerald-400 flex items-center gap-2">
                  <span>✓</span> Suitable for the required project role
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
