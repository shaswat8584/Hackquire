import React, { useState, useEffect } from 'react';
import { matchingAPI, teamAPI } from '../services/api';
import StudentCard from '../components/StudentCard';
import Modal from '../components/Modal';
import {
  Users,
  Search,
  Filter,
  Sparkles,
  SlidersHorizontal,
  X,
  ExternalLink,
  Clock,
  Briefcase,
  Send,
  Award,
} from 'lucide-react';

const SkillMatch = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skillFilter, setSkillFilter] = useState('');
  const [interestFilter, setInterestFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [minAvailability, setMinAvailability] = useState(0);

  // Profile modal state
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Invite modal state
  const [myTeams, setMyTeams] = useState([]);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [studentToInvite, setStudentToInvite] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [assignedRole, setAssignedRole] = useState('');
  const [inviteStatus, setInviteStatus] = useState('');

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (skillFilter) params.skill = skillFilter;
      if (interestFilter) params.interest = interestFilter;
      if (roleFilter) params.role = roleFilter;
      if (minAvailability > 0) params.minAvailability = minAvailability;

      const res = await matchingAPI.getRecommendedStudents(params);
      if (res.data?.recommendations) {
        setRecommendations(res.data.recommendations);
      }
    } catch (error) {
      console.error('[SkillMatch Fetch Error]', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [skillFilter, interestFilter, roleFilter, minAvailability]);

  // Load user teams for quick invites
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const res = await teamAPI.getAll({ filter: 'my' });
        if (res.data?.teams) {
          setMyTeams(res.data.teams);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadTeams();
  }, []);

  const handleOpenInvite = (student) => {
    setStudentToInvite(student);
    if (myTeams.length > 0) {
      setSelectedTeamId(myTeams[0]._id);
      setAssignedRole(student.preferredRoles?.[0] || 'Contributor');
    }
    setInviteModalOpen(true);
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!selectedTeamId || !studentToInvite) return;

    try {
      await teamAPI.invite(selectedTeamId, {
        userId: studentToInvite._id,
        role: assignedRole,
      });
      setInviteStatus(`Invitation successfully sent to ${studentToInvite.name}!`);
      setTimeout(() => {
        setInviteStatus('');
        setInviteModalOpen(false);
      }, 2000);
    } catch (error) {
      setInviteStatus(error.response?.data?.message || 'Failed to send invitation');
    }
  };

  const clearFilters = () => {
    setSkillFilter('');
    setInterestFilter('');
    setRoleFilter('');
    setMinAvailability(0);
  };

  const hasActiveFilters = skillFilter || interestFilter || roleFilter || minAvailability > 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Module Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Module 1 • Complementary Student Marketplace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            SkillMatch
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Find and connect with fellow students whose skills, interests, and availability complement your background for hackathons and projects.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/60 shrink-0">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-900">{recommendations.length} Students Found</div>
            <div className="text-[10px] text-slate-500 font-mono">Ranked by 60/20/20 Match</div>
          </div>
        </div>
      </div>

      {/* Filter Bar - Section 4 Spec */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-indigo-600" /> Filter Criteria
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Skill Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Skill</label>
            <input
              type="text"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              placeholder="e.g. React, Python, ML"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Interest Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Interest</label>
            <input
              type="text"
              value={interestFilter}
              onChange={(e) => setInterestFilter(e.target.value)}
              placeholder="e.g. AI, Web Development"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Role</label>
            <input
              type="text"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              placeholder="e.g. ML Developer, Frontend"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Availability Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Min Availability: {minAvailability > 0 ? `${minAvailability}h/wk` : 'Any'}
            </label>
            <select
              value={minAvailability}
              onChange={(e) => setMinAvailability(Number(e.target.value))}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value={0}>Any Availability</option>
              <option value={5}>At least 5 hrs/week</option>
              <option value={10}>At least 10 hrs/week</option>
              <option value={15}>At least 15 hrs/week</option>
              <option value={20}>At least 20 hrs/week</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student Cards Grid - Section 4 Spec */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No matching students found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Try adjusting your search criteria or resetting filters to discover more collaborators.
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((item, idx) => (
            <StudentCard
              key={item.student._id || idx}
              student={item.student}
              matchScore={item.matchScore}
              breakdown={item.breakdown}
              reasons={item.reasons}
              onViewProfile={(student) => setSelectedStudent(student)}
              onInvite={myTeams.length > 0 ? handleOpenInvite : undefined}
            />
          ))}
        </div>
      )}

      {/* Student Profile Modal */}
      <Modal
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        maxWidth="max-w-lg"
      >
        {selectedStudent && (
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-4">
                <img
                  src={selectedStudent.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt=""
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-100"
                />
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedStudent.name}</h3>
                  <p className="text-xs font-semibold text-indigo-600 mt-0.5">
                    {selectedStudent.preferredRoles?.join(' • ') || 'Student Developer'}
                  </p>
                  <p className="text-xs text-slate-400">{selectedStudent.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">About</h4>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl">
                  {selectedStudent.bio || 'No bio provided.'}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">Technical Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedStudent.skills || []).map((s, i) => (
                    <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-medium rounded-lg">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">Interests</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedStudent.interests || []).map((int, i) => (
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
                    {selectedStudent.availability || 10} hours / week
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Experience</span>
                  <span className="text-slate-800 font-bold text-sm mt-0.5 block">
                    {selectedStudent.experienceLevel || 'Intermediate'}
                  </span>
                </div>
              </div>

              {/* Portfolio / Projects */}
              {selectedStudent.portfolio && selectedStudent.portfolio.length > 0 && (
                <div className="pt-2">
                  <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2">Projects / Portfolio</h4>
                  <div className="space-y-2">
                    {selectedStudent.portfolio.map((item, i) => (
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
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
              {myTeams.length > 0 && (
                <button
                  onClick={() => {
                    const student = selectedStudent;
                    setSelectedStudent(null);
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

      {/* Quick Invite Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        maxWidth="max-w-md"
      >
        <div className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Invite {studentToInvite?.name} to Team
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Select one of your teams and designate their role.
          </p>

          {inviteStatus && (
            <div className="mb-4 p-3 bg-indigo-50 text-indigo-800 text-xs font-semibold rounded-xl">
              {inviteStatus}
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
                value={assignedRole}
                onChange={(e) => setAssignedRole(e.target.value)}
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
    </div>
  );
};

export default SkillMatch;
