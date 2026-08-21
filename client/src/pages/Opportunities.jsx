import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { matchingAPI, opportunityAPI } from '../services/api';
import OpportunityCard from '../components/OpportunityCard';
import Modal from '../components/Modal';
import {
  Compass,
  Plus,
  Filter,
  Search,
  X,
  Sparkles,
  Calendar,
  Clock,
  Briefcase,
  AlertCircle,
} from 'lucide-react';

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('All');
  const [skillFilter, setSkillFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Create Opportunity Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Project',
    requiredSkills: '',
    requiredRoles: '',
    duration: '4 weeks',
    requiredHours: 10,
    deadline: '',
  });
  const [createError, setCreateError] = useState('');
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // Apply Modal State
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [targetOpportunity, setTargetOpportunity] = useState(null);
  const [applyRole, setApplyRole] = useState('');
  const [applyMessage, setApplyMessage] = useState('');
  const [applyStatus, setApplyStatus] = useState('');
  const [applySubmitting, setApplySubmitting] = useState(false);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const params = {};
      if (typeFilter !== 'All') params.type = typeFilter;
      if (skillFilter) params.skill = skillFilter;
      if (roleFilter) params.role = roleFilter;

      const res = await matchingAPI.getRecommendedOpportunities(params);
      if (res.data?.recommendations) {
        setOpportunities(res.data.recommendations);
      }
    } catch (error) {
      console.error('[Opportunities Fetch Error]', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [typeFilter, skillFilter, roleFilter]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateSubmitting(true);

    try {
      const payload = {
        ...formData,
        requiredSkills: formData.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
        requiredRoles: formData.requiredRoles.split(',').map((r) => r.trim()).filter(Boolean),
        requiredHours: Number(formData.requiredHours),
      };

      await opportunityAPI.create(payload);
      setCreateSubmitting(false);
      setCreateModalOpen(false);
      setFormData({
        title: '',
        description: '',
        type: 'Project',
        requiredSkills: '',
        requiredRoles: '',
        duration: '4 weeks',
        requiredHours: 10,
        deadline: '',
      });
      fetchOpportunities();
    } catch (error) {
      setCreateSubmitting(false);
      setCreateError(error.response?.data?.message || 'Failed to post opportunity');
    }
  };

  const handleOpenApply = (opp) => {
    setTargetOpportunity(opp);
    setApplyRole(opp.requiredRoles?.[0] || 'Contributor');
    setApplyMessage('');
    setApplyStatus('');
    setApplyModalOpen(true);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!targetOpportunity) return;
    setApplySubmitting(true);

    try {
      await opportunityAPI.apply(targetOpportunity._id, {
        role: applyRole,
        message: applyMessage,
      });
      setApplySubmitting(false);
      setApplyStatus('Application submitted successfully!');
      setTimeout(() => {
        setApplyModalOpen(false);
        fetchOpportunities();
      }, 1500);
    } catch (error) {
      setApplySubmitting(false);
      setApplyStatus(error.response?.data?.message || 'Failed to apply');
    }
  };

  const types = ['All', 'Project', 'Internship', 'Hackathon', 'Competition'];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Module Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Module 2 • Student Opportunity Marketplace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            OpportunityHub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Discover student projects, hackathon teams, competitions, and internships with automated skill-match scoring.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Post Opportunity
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
        {/* Type Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                typeFilter === t
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {t === 'All' ? 'All Opportunities' : t}
            </button>
          ))}
        </div>

        {/* Skill & Role Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Filter by Skill</label>
            <input
              type="text"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              placeholder="e.g. React, Node.js, Python, PostgreSQL"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Filter by Role</label>
            <input
              type="text"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              placeholder="e.g. Frontend Developer, ML Developer, UI/UX"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Opportunity Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : opportunities.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
          <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No opportunities match your filters</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Try switching categories or posting a new student project.
          </p>
          <button
            onClick={() => {
              setTypeFilter('All');
              setSkillFilter('');
              setRoleFilter('');
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((item, idx) => (
            <OpportunityCard
              key={item.opportunity._id || idx}
              opportunity={item.opportunity}
              matchScore={item.matchScore}
              breakdown={item.breakdown}
              reasons={item.reasons}
              hasApplied={item.hasApplied}
              onApply={() => handleOpenApply(item.opportunity)}
            />
          ))}
        </div>
      )}

      {/* Post Opportunity Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        maxWidth="max-w-lg"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Post an Opportunity</h3>
              <p className="text-xs text-slate-500">Recruit peer talent for your project or hackathon</p>
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

          <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Opportunity Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. AI Campus Assistant"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Project">Project</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Internship">Internship</option>
                <option value="Competition">Competition</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Description *</label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the problem, goals, stack, and deliverables..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Required Skills * (comma separated)
              </label>
              <input
                type="text"
                required
                value={formData.requiredSkills}
                onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                placeholder="React, Node.js, Python, Machine Learning"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Required Roles * (comma separated)
              </label>
              <input
                type="text"
                required
                value={formData.requiredRoles}
                onChange={(e) => setFormData({ ...formData, requiredRoles: e.target.value })}
                placeholder="Frontend Developer, Backend Developer, ML Developer, UI/UX Designer"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Duration</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g. 4 weeks"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Required Commitment (hrs/wk)</label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={formData.requiredHours}
                  onChange={(e) => setFormData({ ...formData, requiredHours: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createSubmitting}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-200 disabled:opacity-50"
              >
                {createSubmitting ? 'Posting...' : 'Publish Listing'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Apply to Opportunity Modal */}
      <Modal
        isOpen={applyModalOpen && !!targetOpportunity}
        onClose={() => setApplyModalOpen(false)}
        maxWidth="max-w-md"
      >
        {targetOpportunity && (
          <div className="p-6 sm:p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Apply to {targetOpportunity.title}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Submit your interest to collaborate on this {targetOpportunity.type.toLowerCase()}.
            </p>

            {applyStatus && (
              <div className="mb-4 p-3 bg-indigo-50 text-indigo-800 text-xs font-semibold rounded-xl">
                {applyStatus}
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Applying for Role</label>
                <select
                  value={applyRole}
                  onChange={(e) => setApplyRole(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {(targetOpportunity.requiredRoles || ['Contributor']).map((r, i) => (
                    <option key={i} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Application Note / Message</label>
                <textarea
                  rows={3}
                  value={applyMessage}
                  onChange={(e) => setApplyMessage(e.target.value)}
                  placeholder="Share relevant experience or what you would love to build..."
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
                  disabled={applySubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-200 disabled:opacity-50"
                >
                  {applySubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Opportunities;
