import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { matchingAPI, opportunityAPI, teamAPI } from '../services/api';
import StudentCard from '../components/StudentCard';
import OpportunityCard from '../components/OpportunityCard';
import TeamCard from '../components/TeamCard';
import Modal from '../components/Modal';
import {
  Users,
  Compass,
  Layers,
  Sparkles,
  ArrowRight,
  Clock,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Send,
  Plus,
  X,
  ExternalLink,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const [recommendedStudents, setRecommendedStudents] = useState([]);
  const [recommendedOpportunities, setRecommendedOpportunities] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [myTeams, setMyTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick invite modal state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedStudentForInvite, setSelectedStudentForInvite] = useState(null);
  const [selectedStudentProfile, setSelectedStudentProfile] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [inviteRole, setInviteRole] = useState('');
  const [inviteFeedback, setInviteFeedback] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [studentsRes, oppsRes, appsRes, teamsRes] = await Promise.all([
          matchingAPI.getRecommendedStudents(),
          matchingAPI.getRecommendedOpportunities(),
          opportunityAPI.getMyApplications(),
          teamAPI.getAll({ filter: 'my' }),
        ]);

        if (studentsRes.data?.recommendations) {
          setRecommendedStudents(studentsRes.data.recommendations);
        }
        if (oppsRes.data?.recommendations) {
          setRecommendedOpportunities(oppsRes.data.recommendations);
        }
        if (appsRes.data?.applications) {
          setMyApplications(appsRes.data.applications);
        }
        if (teamsRes.data?.teams) {
          setMyTeams(teamsRes.data.teams);
        }
      } catch (error) {
        console.error('[Dashboard Data Error]', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleOpenInvite = (student) => {
    setSelectedStudentForInvite(student);
    if (myTeams.length > 0) {
      setSelectedTeamId(myTeams[0]._id);
      setInviteRole(student.preferredRoles?.[0] || 'Contributor');
    }
    setInviteModalOpen(true);
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!selectedTeamId || !selectedStudentForInvite) return;

    try {
      await teamAPI.invite(selectedTeamId, {
        userId: selectedStudentForInvite._id,
        role: inviteRole,
      });
      setInviteFeedback(`Invitation sent to ${selectedStudentForInvite.name}!`);
      setTimeout(() => {
        setInviteFeedback('');
        setInviteModalOpen(false);
      }, 2000);
    } catch (error) {
      setInviteFeedback(error.response?.data?.message || 'Failed to send invite');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Banner - Section 14 Spec */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-sky-400 mb-2 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> SkillBridge Unified Dashboard
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Welcome back, {user?.name || 'Student'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl">
            Find Your Next Opportunity, discover peers with complementary skills, and build high-impact teams.
          </p>

          {/* Quick Skill Chips */}
          {user?.skills && user.skills.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-5">
              <span className="text-[11px] font-semibold text-slate-400 mr-1">Your Skills:</span>
              {user.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 text-xs font-medium rounded-md"
                >
                  {skill}
                </span>
              ))}
              <span className="text-[11px] text-sky-400 font-semibold ml-2">
                ({user.availability || 10} hrs/wk)
              </span>
            </div>
          )}
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 3 Core Module Cards - Section 14 Spec */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Module 1: SkillMatch */}
        <Link
          to="/skillmatch"
          className="group bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                Module 1
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              SkillMatch
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-3 font-medium">Find teammates</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Discover students with complementary skills, matched using the 60/20/20 algorithm.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
            <span>Explore Recommendations</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Module 2: OpportunityHub */}
        <Link
          to="/opportunities"
          className="group bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-sky-300 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
                Module 2
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
              OpportunityHub
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-3 font-medium">Discover projects</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Explore hackathons, internships, and student projects with calculated fit scores.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-600">
            <span>Discover Opportunities</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Module 3: TeamForge */}
        <Link
          to="/teams"
          className="group bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                Module 3
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
              TeamForge
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-3 font-medium">Build your team</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Assemble project teams, identify missing role gaps, and auto-match candidates.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600">
            <span>Manage Teams</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Applications Tab / Section if activeTab === 'applications' */}
      {activeTab === 'applications' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900">My Submitted Applications</h2>
              <p className="text-xs text-slate-500 mt-0.5">Track opportunities you've applied to</p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              {myApplications.length} Applications
            </span>
          </div>

          {myApplications.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-800">No applications yet</h4>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Explore OpportunityHub to discover exciting projects and competitions.
              </p>
              <Link
                to="/opportunities"
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
              >
                Browse Opportunities
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myApplications.map((app, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
                      {app.type}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{app.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Applied for: <strong className="text-slate-700">{app.role}</strong> • Duration: {app.duration}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        app.status === 'accepted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {app.status}
                    </span>
                    <Link
                      to={`/opportunities/${app.opportunityId}`}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recommended For You Section - Section 14 Spec */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Recommended For You
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Personalized candidate teammates and opportunities ranked by the 60/20/20 matching algorithm
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-slate-200 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top 2 Student Recommendations */}
            {recommendedStudents.slice(0, 2).map((item, idx) => (
              <div key={idx} className="flex flex-col">
                <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 mb-2 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> Recommended Teammate
                </div>
                <StudentCard
                  student={item.student}
                  matchScore={item.matchScore}
                  breakdown={item.breakdown}
                  reasons={item.reasons}
                  onViewProfile={(student) => setSelectedStudentProfile(student)}
                  onInvite={myTeams.length > 0 ? handleOpenInvite : undefined}
                />
              </div>
            ))}

            {/* Top 1 Opportunity Recommendation */}
            {recommendedOpportunities.slice(0, 1).map((item, idx) => (
              <div key={idx} className="flex flex-col">
                <div className="text-[11px] font-bold uppercase tracking-wider text-sky-600 mb-2 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5" /> Recommended Project
                </div>
                <OpportunityCard
                  opportunity={item.opportunity}
                  matchScore={item.matchScore}
                  breakdown={item.breakdown}
                  reasons={item.reasons}
                  hasApplied={item.hasApplied}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Invite Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        maxWidth="max-w-md"
      >
        <div className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Invite {selectedStudentForInvite?.name} to Team
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Select one of your teams and designate their role.
          </p>

          {inviteFeedback && (
            <div className="mb-4 p-3 bg-indigo-50 text-indigo-800 text-xs font-semibold rounded-xl">
              {inviteFeedback}
            </div>
          )}

          <form onSubmit={handleSendInvite} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Team</label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                {myTeams.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assign Role</label>
              <input
                type="text"
                required
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                placeholder="e.g. ML Developer, Frontend Developer"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Send Invitation
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Student Profile Modal */}
      <Modal
        isOpen={!!selectedStudentProfile}
        onClose={() => setSelectedStudentProfile(null)}
        maxWidth="max-w-lg"
      >
        {selectedStudentProfile && (
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-4">
                <img
                  src={selectedStudentProfile.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt=""
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-100"
                />
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedStudentProfile.name}</h3>
                  <p className="text-xs font-semibold text-indigo-600 mt-0.5">
                    {selectedStudentProfile.preferredRoles?.join(' • ') || 'Student Developer'}
                  </p>
                  <p className="text-xs text-slate-400">{selectedStudentProfile.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentProfile(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">About</h4>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl">
                  {selectedStudentProfile.bio || 'No bio provided.'}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">Technical Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedStudentProfile.skills || []).map((s, i) => (
                    <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-medium rounded-lg">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">Interests</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedStudentProfile.interests || []).map((int, i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 font-medium rounded-lg">
                      {int}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Availability</span>
                  <span className="text-slate-800 font-bold text-sm mt-0.5 block">
                    {selectedStudentProfile.availability || 10} hours / week
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Experience</span>
                  <span className="text-slate-800 font-bold text-sm mt-0.5 block">
                    {selectedStudentProfile.experienceLevel || 'Intermediate'}
                  </span>
                </div>
              </div>

              {/* Portfolio / Projects */}
              {selectedStudentProfile.portfolio && selectedStudentProfile.portfolio.length > 0 && (
                <div className="pt-2">
                  <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2">Projects / Portfolio</h4>
                  <div className="space-y-2">
                    {selectedStudentProfile.portfolio.map((item, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{item.title}</span>
                          {item.link && (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-semibold"
                            >
                              Link <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-slate-600 text-[11px] mt-1">{item.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedStudentProfile(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
              {myTeams.length > 0 && (
                <button
                  onClick={() => {
                    const student = selectedStudentProfile;
                    setSelectedStudentProfile(null);
                    handleOpenInvite(student);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-200 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Invite to Team
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
