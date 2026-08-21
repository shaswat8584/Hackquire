import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { teamAPI, matchingAPI, opportunityAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TeamCard from '../components/TeamCard';
import MatchScore from '../components/MatchScore';
import Modal from '../components/Modal';
import {
  Layers,
  Plus,
  Users,
  Search,
  AlertCircle,
  CheckCircle2,
  X,
  Send,
  UserCheck,
  Shield,
  Sparkles,
  Briefcase,
} from 'lucide-react';

const TeamForge = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'all';

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(defaultTab); // 'all' | 'my'

  // Create Team Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [myOpportunities, setMyOpportunities] = useState([]);
  const [newTeamData, setNewTeamData] = useState({
    name: '',
    description: '',
    opportunityId: '',
    requiredRoles: 'Frontend Developer, Backend Developer, UI/UX Designer',
    ownerRole: 'Team Lead',
  });
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState('');

  // Find Candidates Modal (Section 8 Spec)
  const [candidateModalOpen, setCandidateModalOpen] = useState(false);
  const [selectedTeamForCandidates, setSelectedTeamForCandidates] = useState(null);
  const [targetRoleToFind, setTargetRoleToFind] = useState('');
  const [candidateResults, setCandidateResults] = useState([]);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [candidateInviteStatus, setCandidateInviteStatus] = useState({});

  // Direct Invite Modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedTeamForInvite, setSelectedTeamForInvite] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [inviteUserId, setInviteUserId] = useState('');
  const [inviteRole, setInviteRole] = useState('');
  const [inviteFeedback, setInviteFeedback] = useState('');

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await teamAPI.getAll({ filter: activeTab === 'my' ? 'my' : undefined });
      if (res.data?.teams) {
        setTeams(res.data.teams);
      }
    } catch (error) {
      console.error('[Fetch Teams Error]', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [activeTab]);

  // Load user's created opportunities for linking
  useEffect(() => {
    const loadOpps = async () => {
      try {
        const res = await opportunityAPI.getAll();
        if (res.data?.opportunities) {
          const mine = res.data.opportunities.filter(
            (o) => o.createdBy?._id === user?._id || o.createdBy === user?._id
          );
          setMyOpportunities(mine);
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (user) loadOpps();
  }, [user]);

  const handleCreateTeamSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateSubmitting(true);

    try {
      await teamAPI.create({
        name: newTeamData.name,
        description: newTeamData.description,
        opportunityId: newTeamData.opportunityId || undefined,
        requiredRoles: newTeamData.requiredRoles.split(',').map((r) => r.trim()).filter(Boolean),
        ownerRole: newTeamData.ownerRole || 'Team Lead',
      });
      setCreateSubmitting(false);
      setCreateModalOpen(false);
      setNewTeamData({
        name: '',
        description: '',
        opportunityId: '',
        requiredRoles: 'Frontend Developer, Backend Developer, UI/UX Designer',
        ownerRole: 'Team Lead',
      });
      fetchTeams();
    } catch (error) {
      setCreateSubmitting(false);
      setCreateError(error.response?.data?.message || 'Failed to create team');
    }
  };

  // Trigger Find Candidates Modal (Section 8 Spec)
  const handleFindCandidates = async (team, role) => {
    setSelectedTeamForCandidates(team);
    setTargetRoleToFind(role);
    setCandidateModalOpen(true);
    setCandidateLoading(true);
    setCandidateInviteStatus({});

    try {
      const existingUserIds = (team.members || []).map((m) => m.user?._id || m.user);
      const res = await matchingAPI.getCandidatesForRole({
        role,
        requiredSkills: team.opportunity?.requiredSkills || [],
        requiredHours: team.opportunity?.requiredHours || 10,
        excludeUserIds: existingUserIds,
      });

      if (res.data?.candidates) {
        setCandidateResults(res.data.candidates);
      }
    } catch (error) {
      console.error('[Candidate Matching Error]', error);
    } finally {
      setCandidateLoading(false);
    }
  };

  const handleInviteCandidateFromModal = async (candidate) => {
    if (!selectedTeamForCandidates) return;
    try {
      await teamAPI.invite(selectedTeamForCandidates._id, {
        userId: candidate._id,
        role: targetRoleToFind,
      });
      setCandidateInviteStatus((prev) => ({
        ...prev,
        [candidate._id]: 'Invited successfully!',
      }));
      fetchTeams();
    } catch (error) {
      setCandidateInviteStatus((prev) => ({
        ...prev,
        [candidate._id]: error.response?.data?.message || 'Failed to invite',
      }));
    }
  };

  const handleOpenDirectInvite = async (team) => {
    setSelectedTeamForInvite(team);
    setInviteFeedback('');
    setInviteRole(team.requiredRoles?.[0] || 'Contributor');
    setInviteModalOpen(true);

    try {
      const res = await matchingAPI.getRecommendedStudents();
      if (res.data?.recommendations) {
        setAllStudents(res.data.recommendations.map((r) => r.student));
        if (res.data.recommendations.length > 0) {
          setInviteUserId(res.data.recommendations[0].student._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendDirectInvite = async (e) => {
    e.preventDefault();
    if (!selectedTeamForInvite || !inviteUserId) return;

    try {
      await teamAPI.invite(selectedTeamForInvite._id, {
        userId: inviteUserId,
        role: inviteRole,
      });
      setInviteFeedback('Invitation sent successfully!');
      setTimeout(() => {
        setInviteModalOpen(false);
        fetchTeams();
      }, 1500);
    } catch (error) {
      setInviteFeedback(error.response?.data?.message || 'Failed to send invite');
    }
  };

  const handleUpdateMember = async (teamId, data) => {
    try {
      await teamAPI.updateMember(teamId, data);
      fetchTeams();
    } catch (error) {
      console.error(error);
    }
  };

  const handleLeaveTeam = async (teamId) => {
    if (window.confirm('Are you sure you want to leave this team?')) {
      try {
        await teamAPI.leave(teamId);
        fetchTeams();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to leave team');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Module 3 • Role-Based Team Formation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            TeamForge
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Build project squads, define required role hierarchies, spot missing talent gaps, and auto-match candidate students.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create Team
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          All Active Teams
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'my'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          My Teams & Invites
        </button>
      </div>

      {/* Team Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-96 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : teams.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No teams found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            {activeTab === 'my'
              ? "You haven't created or joined any teams yet."
              : 'Be the first to create a team and start recruiting!'}
          </p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
          >
            Create a Team
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map((team) => (
            <TeamCard
              key={team._id}
              team={team}
              currentUserId={user?._id}
              onFindCandidates={handleFindCandidates}
              onInviteMember={handleOpenDirectInvite}
              onUpdateMember={handleUpdateMember}
              onLeaveTeam={handleLeaveTeam}
            />
          ))}
        </div>
      )}

      {/* Find Candidates Modal (Section 8 Spec) */}
      <Modal
        isOpen={candidateModalOpen}
        onClose={() => setCandidateModalOpen(false)}
        maxWidth="max-w-2xl"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-sky-600 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> Matching Engine
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">
                Find Candidates for: <span className="text-indigo-600">{targetRoleToFind}</span>
              </h3>
              <p className="text-xs text-slate-500">
                Targeted candidates ranked by technical fit and availability
              </p>
            </div>
            <button
              onClick={() => setCandidateModalOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {candidateLoading ? (
            <div className="space-y-3 animate-pulse py-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-slate-100 rounded-xl" />
              ))}
            </div>
          ) : candidateResults.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching candidate profiles found outside your team.
            </div>
          ) : (
            <div className="space-y-3">
              {candidateResults.map((item) => {
                const cand = item.candidate;
                const feedback = candidateInviteStatus[cand._id];

                return (
                  <div
                    key={cand._id}
                    className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={cand.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-100 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{cand.name}</h4>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                            {item.matchScore}% Match
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {cand.skills?.slice(0, 4).join(', ')} • {cand.availability || 10} hrs/wk
                        </p>

                        {/* Reason bullets */}
                        <div className="mt-1.5 space-y-0.5">
                          {(item.reasons || []).slice(0, 2).map((r, ri) => (
                            <p key={ri} className="text-[10px] text-slate-600 font-mono">
                              {r}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {feedback ? (
                        <span className="text-xs font-bold text-emerald-600">{feedback}</span>
                      ) : (
                        <button
                          onClick={() => handleInviteCandidateFromModal(cand)}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
                        >
                          <Send className="w-3 h-3" />
                          Invite
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => setCandidateModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Create Team Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        maxWidth="max-w-lg"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Create Project Team</h3>
              <p className="text-xs text-slate-500">Define required roles and squad structure</p>
            </div>
            <button onClick={() => setCreateModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {createError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{createError}</span>
            </div>
          )}

          <form onSubmit={handleCreateTeamSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Team Name *</label>
              <input
                type="text"
                required
                value={newTeamData.name}
                onChange={(e) => setNewTeamData({ ...newTeamData, name: e.target.value })}
                placeholder="e.g. AI Campus Assistant Squad"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Description / Mission</label>
              <textarea
                rows={2}
                value={newTeamData.description}
                onChange={(e) => setNewTeamData({ ...newTeamData, description: e.target.value })}
                placeholder="What is this team building together?"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            {myOpportunities.length > 0 && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Link to Opportunity (Optional)</label>
                <select
                  value={newTeamData.opportunityId}
                  onChange={(e) => setNewTeamData({ ...newTeamData, opportunityId: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="">None (Standalone Team)</option>
                  {myOpportunities.map((o) => (
                    <option key={o._id} value={o._id}>
                      {o.title} ({o.type})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Required Role Slots * (comma separated)
              </label>
              <input
                type="text"
                required
                value={newTeamData.requiredRoles}
                onChange={(e) => setNewTeamData({ ...newTeamData, requiredRoles: e.target.value })}
                placeholder="Frontend Developer, Backend Developer, ML Developer, UI/UX Designer"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Your Role in the Team</label>
              <input
                type="text"
                value={newTeamData.ownerRole}
                onChange={(e) => setNewTeamData({ ...newTeamData, ownerRole: e.target.value })}
                placeholder="e.g. Frontend Developer, Team Lead"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createSubmitting}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-200 disabled:opacity-50"
              >
                {createSubmitting ? 'Creating...' : 'Form Team'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Direct Invite Modal */}
      <Modal
        isOpen={inviteModalOpen && !!selectedTeamForInvite}
        onClose={() => setInviteModalOpen(false)}
        maxWidth="max-w-md"
      >
        {selectedTeamForInvite && (
          <div className="p-6 sm:p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Invite to {selectedTeamForInvite.name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">Choose a student to add to your team</p>

            {inviteFeedback && (
              <div className="mb-4 p-3 bg-indigo-50 text-indigo-800 text-xs font-semibold rounded-xl">
                {inviteFeedback}
              </div>
            )}

            <form onSubmit={handleSendDirectInvite} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Student</label>
                <select
                  value={inviteUserId}
                  onChange={(e) => setInviteUserId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {allStudents.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.preferredRoles?.[0] || 'Developer'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assign Role</label>
                <input
                  type="text"
                  required
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  placeholder="e.g. Backend Developer"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-200 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Send Invite
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TeamForge;
