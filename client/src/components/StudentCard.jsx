import React, { useState } from 'react';
import { User, Clock, Briefcase, Sparkles, ExternalLink, Send, Check } from 'lucide-react';
import MatchScore from './MatchScore';

const StudentCard = ({
  student,
  matchScore,
  breakdown,
  reasons,
  onInvite,
  onViewProfile,
}) => {
  const [connected, setConnected] = useState(false);

  if (!student) return null;

  const handleConnect = () => {
    setConnected(true);
    setTimeout(() => setConnected(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Header: Avatar, Name, Role */}
        <div className="flex items-start gap-3.5 mb-4">
          <img
            src={student.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={student.name}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-indigo-50 border border-slate-200 shrink-0"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
            }}
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900 truncate">{student.name}</h3>
            <p className="text-xs font-semibold text-indigo-600 truncate mt-0.5">
              {student.preferredRoles && student.preferredRoles.length > 0
                ? student.preferredRoles.join(' • ')
                : student.experienceLevel || 'Student Developer'}
            </p>
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {student.availability || 10} hrs/week
              </span>
              <span>•</span>
              <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium text-[10px]">
                {student.experienceLevel || 'Intermediate'}
              </span>
            </div>
          </div>
        </div>

        {/* Bio */}
        {student.bio && (
          <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
            {student.bio}
          </p>
        )}

        {/* Skills */}
        <div className="mb-3">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {(student.skills || []).slice(0, 5).map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-md border border-indigo-100/60"
              >
                {skill}
              </span>
            ))}
            {(student.skills || []).length > 5 && (
              <span className="text-[11px] text-slate-400 font-medium self-center">
                +{student.skills.length - 5}
              </span>
            )}
          </div>
        </div>

        {/* Interests */}
        {(student.interests || []).length > 0 && (
          <div className="mb-4">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Interests</p>
            <div className="flex flex-wrap gap-1.5">
              {student.interests.slice(0, 4).map((interest, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-medium rounded-md"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer: Match Score & Action Buttons */}
      <div className="pt-3 border-t border-slate-100 space-y-3">
        {matchScore !== undefined && (
          <MatchScore
            score={matchScore}
            breakdown={breakdown}
            reasons={reasons}
            showDetails={true}
          />
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewProfile && onViewProfile(student)}
            className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors text-center"
          >
            View Profile
          </button>

          {onInvite ? (
            <button
              onClick={() => onInvite(student)}
              className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-200"
            >
              <Send className="w-3.5 h-3.5" />
              Invite
            </button>
          ) : (
            <button
              onClick={handleConnect}
              className={`flex-1 py-2 px-3 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                connected
                  ? 'bg-emerald-500 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200'
              }`}
            >
              {connected ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Connected
                </>
              ) : (
                'Connect'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentCard;
