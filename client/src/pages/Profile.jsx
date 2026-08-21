import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Clock,
  Briefcase,
  Award,
  Link as LinkIcon,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
  Sparkles,
} from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    profileImage: '',
    bio: '',
    skills: '',
    interests: '',
    preferredRoles: '',
    availability: 10,
    experienceLevel: 'Intermediate',
    portfolio: [],
  });

  const [portfolioItem, setPortfolioItem] = useState({
    title: '',
    link: '',
    description: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        profileImage: user.profileImage || '',
        bio: user.bio || '',
        skills: (user.skills || []).join(', '),
        interests: (user.interests || []).join(', '),
        preferredRoles: (user.preferredRoles || []).join(', '),
        availability: user.availability || 10,
        experienceLevel: user.experienceLevel || 'Intermediate',
        portfolio: user.portfolio || [],
      });
    }
  }, [user]);

  const handleAddPortfolio = () => {
    if (!portfolioItem.title) return;
    setFormData((prev) => ({
      ...prev,
      portfolio: [...prev.portfolio, portfolioItem],
    }));
    setPortfolioItem({ title: '', link: '', description: '' });
  };

  const handleRemovePortfolio = (index) => {
    setFormData((prev) => ({
      ...prev,
      portfolio: prev.portfolio.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);

    const payload = {
      name: formData.name,
      profileImage: formData.profileImage,
      bio: formData.bio,
      skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
      interests: formData.interests.split(',').map((i) => i.trim()).filter(Boolean),
      preferredRoles: formData.preferredRoles.split(',').map((r) => r.trim()).filter(Boolean),
      availability: Number(formData.availability),
      experienceLevel: formData.experienceLevel,
      portfolio: formData.portfolio,
    };

    const res = await updateUser(payload);
    setSaving(false);

    if (res.success) {
      setMessage('Profile updated successfully! Match scores have updated across all modules.');
      setTimeout(() => setMessage(''), 4000);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
            <User className="w-3.5 h-3.5" />
            <span>Shared Student Profile</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Update your skills, availability, and interests. These attributes power your match scores in SkillMatch, OpportunityHub, and TeamForge.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <img
            src={formData.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt=""
            className="w-16 h-16 rounded-full object-cover ring-4 ring-indigo-50 shrink-0"
          />
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-2 font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6 text-xs">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" /> Basic Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Profile Avatar Image URL</label>
              <input
                type="text"
                value={formData.profileImage}
                onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Bio / Student Elevator Pitch</label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        {/* Skills & Interests (60/20 weights) */}
        <div className="space-y-4 pt-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" /> Skills & Matching Data
          </h3>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Technical Skills <span className="font-normal text-slate-400">(60% algorithm weight • comma separated)</span>
            </label>
            <input
              type="text"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              placeholder="React, Node.js, Python, MongoDB, Tailwind CSS, Docker"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Domain Interests <span className="font-normal text-slate-400">(20% wt • comma separated)</span>
              </label>
              <input
                type="text"
                value={formData.interests}
                onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                placeholder="AI, Web Development, Fintech, HealthTech"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Preferred Roles (comma separated)</label>
              <input
                type="text"
                value={formData.preferredRoles}
                onChange={(e) => setFormData({ ...formData, preferredRoles: e.target.value })}
                placeholder="Frontend Developer, ML Developer, UI/UX Designer"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Availability & Experience */}
        <div className="space-y-4 pt-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" /> Availability & Experience
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
              <label className="block font-bold text-slate-700 mb-1">
                Weekly Availability: <span className="text-indigo-600 font-extrabold">{formData.availability} hrs/week</span>
              </label>
              <input
                type="range"
                min={2}
                max={40}
                step={1}
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: Number(e.target.value) })}
                className="w-full accent-indigo-600 mt-2"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Used for 20% availability matching score
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Experience Level</label>
              <select
                value={formData.experienceLevel}
                onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>
        </div>

        {/* Portfolio Section */}
        <div className="space-y-4 pt-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-600" /> Portfolio & Projects
          </h3>

          {/* Existing items */}
          <div className="space-y-2">
            {formData.portfolio.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between gap-3"
              >
                <div>
                  <h5 className="font-bold text-slate-900">{item.title}</h5>
                  <p className="text-slate-500 text-[11px] truncate max-w-md">{item.link}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemovePortfolio(idx)}
                  className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add item */}
          <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl space-y-3">
            <span className="font-bold text-slate-700 block">Add Portfolio Project</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={portfolioItem.title}
                onChange={(e) => setPortfolioItem({ ...portfolioItem, title: e.target.value })}
                placeholder="Project Title"
                className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl"
              />
              <input
                type="text"
                value={portfolioItem.link}
                onChange={(e) => setPortfolioItem({ ...portfolioItem, link: e.target.value })}
                placeholder="https://github.com/... or Demo URL"
                className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl"
              />
            </div>
            <textarea
              rows={2}
              value={portfolioItem.description}
              onChange={(e) => setPortfolioItem({ ...portfolioItem, description: e.target.value })}
              placeholder="Brief description of the project..."
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl"
            />
            <button
              type="button"
              onClick={handleAddPortfolio}
              className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Project
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Profile...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
