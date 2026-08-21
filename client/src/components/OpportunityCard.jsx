import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, Briefcase, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import MatchScore from './MatchScore';

const OpportunityCard = ({
  opportunity,
  matchScore,
  breakdown,
  reasons,
  hasApplied,
  onApply,
}) => {
  if (!opportunity) return null;

  const getTypeBadge = (type) => {
    switch (type) {
      case 'Hackathon':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Internship':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Competition':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Project':
      default:
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  const formattedDeadline = opportunity.deadline
    ? new Date(opportunity.deadline).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Open';

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Type & Meta */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getTypeBadge(opportunity.type)}`}>
            {opportunity.type}
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            Deadline: {formattedDeadline}
          </span>
        </div>

        {/* Title */}
        <Link to={`/opportunities/${opportunity._id}`}>
          <h3 className="text-lg font-bold text-slate-900 hover:text-indigo-600 transition-colors mb-2 line-clamp-1">
            {opportunity.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {opportunity.description}
        </p>

        {/* Requirements Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4 p-2.5 bg-slate-50 rounded-xl text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Duration: <strong className="text-slate-800">{opportunity.duration || 'Flexible'}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span>Hours: <strong className="text-slate-800">{opportunity.requiredHours || 10}h/wk</strong></span>
          </div>
        </div>

        {/* Required Roles */}
        {(opportunity.requiredRoles || []).length > 0 && (
          <div className="mb-3">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Open Roles</p>
            <div className="flex flex-wrap gap-1.5">
              {opportunity.requiredRoles.map((role, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-sky-50 text-sky-700 text-[11px] font-medium rounded-md border border-sky-100"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Required Skills */}
        {(opportunity.requiredSkills || []).length > 0 && (
          <div className="mb-4">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Required Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {opportunity.requiredSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-medium rounded-md"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer: Match Score & Action Buttons */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        {matchScore !== undefined && (
          <MatchScore
            score={matchScore}
            breakdown={breakdown}
            reasons={reasons}
            showDetails={true}
          />
        )}

        <div className="flex items-center gap-2">
          <Link
            to={`/opportunities/${opportunity._id}`}
            className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors text-center"
          >
            View Details
          </Link>

          {hasApplied ? (
            <button
              disabled
              className="flex-1 py-2 px-3 bg-emerald-100 text-emerald-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1 cursor-default"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Applied
            </button>
          ) : (
            <button
              onClick={() => onApply && onApply(opportunity)}
              className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1 shadow-sm shadow-indigo-200"
            >
              Apply
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpportunityCard;
