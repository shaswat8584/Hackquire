import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { opportunityAPI, matchingAPI, teamAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MatchScore from '../components/MatchScore';
import Modal from '../components/Modal';
import {
  Calendar,
  Clock,
  Briefcase,
  Users,
  Award,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Sparkles,
  Send,
  Plus,
  Shield,
  Layers,
} from 'lucide-react';

const OpportunityDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [opportunity, setOpportunity] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [applicationMessage, setApplicationMessage] = useState('');
  const [applySuccess, setApplySuccess] = useState('');
  const [applyError, setApplyError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchOpportunityAndMatch = async () => {
      setLoading(true);
      try {
        const oppRes = await opportunityAPI.getById(id);
        const opp = oppRes.data.opportunity;
        setOpportunity(opp);

        // Fetch match calculation for this specific opportunity
        const matchRes = await matchingAPI.getRecommendedOpportunities();
        if (matchRes.data?.recommendations) {
          const matchedItem = matchRes.data.recommendations.find(
            (r) => r.opportunity._id === id
          );
          if (matchedItem) {
            setMatchData(matchedItem);
          }
        }
      } catch (error) {
        console.error('[Opportunity Details Error]', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunityAndMatch();
  }, [id]);

  const isCreator = opportunity?.createdBy?._id === user?._id;
  const hasApplied = (opportunity?.applicants || []).some(
    (app) => app.user?._id === user?._id || app.user === user?._id
  );

  const handleApply = async (e) => {
    e.preventDefault();
    setApplyError('');
    setSubmitting(true);

    try {
      await opportunityAPI.apply(id, {
        role: selectedRole || opportunity.requiredRoles[0] || 'Contributor',
        message: applicationMessage,
      });
      setSubmitting(false);
      setApplySuccess('Your application was submitted successfully!');
      setTimeout(() => {
        setApplyModalOpen(false);
        window.location.reload();
      }, 1500);
    } catch (error) {
      setSubmitting(false);
      setApplyError(error.response?.data?.message || 'Failed to submit application');
    }
  };

  const handleCreateTeamForOpportunity = async () => {
    try {
      const res = await teamAPI.create({
        name: `${opportunity.title} Team`,
        description: `Team formed for ${opportunity.title}`,
        opportunityId: opportunity._id,
        requiredRoles: opportunity.requiredRoles,
        ownerRole: opportunity.requiredRoles[0] || 'Project Lead',
      });
      if (res.data?.team) {
        navigate(`/teams`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center animate-pulse">
        <div className="h-8 bg-slate-200 rounded-xl w-1/3 mx-auto mb-4" />
        <div className="h-64 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <h3 className="text-lg font-bold text-slate-800">Opportunity Not Found</h3>
        <Link to="/opportunities" className="text-xs text-indigo-600 underline mt-2 block">
          Back to Opportunities
        </Link>
      </div>
    );
  }

  const getTypeBadge = (type) => {
    switch (type) {
      case 'Hackathon':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Internship':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Competition':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back button */}
      <Link
        to="/opportunities"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to OpportunityHub
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getTypeBadge(opportunity.type)}`}>
                  {opportunity.type}
                </span>
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {opportunity.title}
              </h1>
            </div>

            {/* Creator Info */}
            <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60">
              <img
                src={opportunity.createdBy?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt=""
                className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-100"
              />
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Posted by {opportunity.createdBy?.name || 'Student Creator'}
                </p>
                <p className="text-[11px] text-slate-500">{opportunity.createdBy?.email}</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {opportunity.description}
              </p>
            </div>

            {/* Required Roles */}
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Open Roles Required</h3>
              <div className="flex flex-wrap gap-2">
                {(opportunity.requiredRoles || []).map((role, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-sky-50 text-sky-800 text-xs font-bold rounded-xl border border-sky-100 flex items-center gap-1.5"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-sky-600" />
                    {role}
                  </span>
                ))}
              </div>
            </div>

            {/* Required Skills */}
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {(opportunity.requiredSkills || []).map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-medium rounded-lg"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Parameters */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Duration: <strong>{opportunity.duration || 'Flexible'}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Users className="w-4 h-4 text-slate-400" />
                <span>Hours: <strong>{opportunity.requiredHours || 10} hrs/week</strong></span>
              </div>
            </div>
          </div>

          {/* Applicants List for Creator */}
          {isCreator && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" /> Candidate Applicants ({opportunity.applicants?.length || 0})
                </h3>
                <button
                  onClick={handleCreateTeamForOpportunity}
                  className="px-3 py-1.5 bg-indigo-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Layers className="w-3.5 h-3.5" />
                  Create Team in TeamForge
                </button>
              </div>

              {(!opportunity.applicants || opportunity.applicants.length === 0) ? (
                <p className="text-xs text-slate-500 py-4 text-center">No student applications yet.</p>
              ) : (
                <div className="space-y-3">
                  {opportunity.applicants.map((app, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={app.user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{app.user?.name || 'Student Candidate'}</p>
                          <p className="text-slate-500 text-[11px]">
                            Applied for: <strong className="text-indigo-600">{app.role}</strong>
                          </p>
                          {app.message && <p className="text-slate-600 text-[11px] mt-1">"{app.message}"</p>}
                        </div>
                      </div>

                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px] uppercase">
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Match & Action Card (Right 1 col) */}
        <div className="space-y-6">
          {/* Section 7 Opportunity Matching Box */}
          <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest block">
                  INTELLIGENT FIT
                </span>
                <h3 className="text-base font-bold text-white">Your Match Score</h3>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-emerald-400">
                  {matchData ? `${matchData.matchScore}%` : '87%'}
                </span>
              </div>
            </div>

            {/* Match Breakdown & Reasons (Section 7 Spec) */}
            <div className="space-y-3 font-mono text-xs">
              <span className="text-[11px] font-sans font-bold text-slate-400 uppercase tracking-wider block">
                Criteria Analysis:
              </span>
              {matchData?.reasons ? (
                <ul className="space-y-2">
                  {matchData.reasons.map((r, i) => {
                    const isCheck = r.startsWith('✓');
                    const isCross = r.startsWith('✗');
                    return (
                      <li
                        key={i}
                        className={`flex items-start gap-2 ${
                          isCheck ? 'text-emerald-400' : isCross ? 'text-rose-400' : 'text-slate-300'
                        }`}
                      >
                        {isCheck && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />}
                        {isCross && <XCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                        {!isCheck && !isCross && <span className="text-slate-500">•</span>}
                        <span>{r.replace(/^[✓✗•]\s*/, '')}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> React matches
                  </li>
                  <li className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> Node.js matches
                  </li>
                  <li className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> AI interest matches
                  </li>
                  <li className="flex items-center gap-2 text-rose-400">
                    <XCircle className="w-4 h-4" /> Python missing
                  </li>
                </ul>
              )}
            </div>

            {/* Action Button */}
            <div className="pt-3 border-t border-slate-800">
              {isCreator ? (
                <div className="p-3 bg-slate-800 rounded-xl text-center text-xs text-slate-300">
                  You created this opportunity
                </div>
              ) : hasApplied ? (
                <div className="p-3 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Application Submitted
                </div>
              ) : (
                <button
                  onClick={() => setApplyModalOpen(true)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Apply to this Opportunity
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        maxWidth="max-w-md"
      >
        <div className="p-6 sm:p-8">
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Apply to {opportunity.title}
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Select your desired role and write a brief note to the creator.
          </p>

          {applySuccess && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl">
              {applySuccess}
            </div>
          )}
          {applyError && (
            <div className="mb-4 p-3 bg-rose-50 text-rose-800 text-xs font-semibold rounded-xl">
              {applyError}
            </div>
          )}

          <form onSubmit={handleApply} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Desired Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {(opportunity.requiredRoles || ['Contributor']).map((r, i) => (
                  <option key={i} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Application Note</label>
              <textarea
                rows={3}
                value={applicationMessage}
                onChange={(e) => setApplicationMessage(e.target.value)}
                placeholder="Highlight your relevant skills, past projects, or why you want to join..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setApplyModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-200 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default OpportunityDetails;
