import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useConnection } from '../context/ConnectionContext';
import {
  User,
  Clock,
  Briefcase,
  Sparkles,
  ExternalLink,
  Send,
  Check,
  UserPlus,
  UserCheck,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import MatchScore from './MatchScore';

const StudentCard = ({
  student,
  matchScore,
  breakdown,
  reasons,
  onInvite,
  onViewProfile,
}) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const {
    getConnectionStatus,
    getConnectionId,
    sendRequest,
    acceptRequest,
  } = useConnection();

  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!student) return null;

  const isSelf = currentUser?._id === student._id || currentUser?.id === student._id;
  const status = getConnectionStatus(student._id);
  const connectionId = getConnectionId(student._id);

  const handleSendConnection = async () => {
    setActionLoading(true);
    const res = await sendRequest(student._id);
    setActionLoading(false);
    if (!res.success) {
      setFeedback(res.message);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleAcceptConnection = async () => {
    if (!connectionId) return;
    setActionLoading(true);
    const res = await acceptRequest(connectionId);
    setActionLoading(false);
    if (!res.success) {
      setFeedback(res.message);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleDirectMessage = () => {
    navigate(`/messages?user=${student._id}`);
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
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 truncate">{student.name}</h3>
              {isSelf && (
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                  You
                </span>
              )}
            </div>
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

        {feedback && (
          <div className="text-[11px] text-rose-600 bg-rose-50 p-2 rounded-lg text-center">
            {feedback}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewProfile && onViewProfile(student)}
            className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors text-center"
          >
            View Profile
          </button>

          {/* If Invite is requested (from TeamForge candidate modal) */}
          {onInvite ? (
            <button
              onClick={() => onInvite(student)}
              className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-200"
            >
              <Send className="w-3.5 h-3.5" />
              Invite
            </button>
          ) : !isSelf ? (
            /* Connection / Message Action buttons */
            status === 'accepted' ? (
              <button
                onClick={handleDirectMessage}
                className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-200"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Message
              </button>
            ) : status === 'pending_received' ? (
              <button
                onClick={handleAcceptConnection}
                disabled={actionLoading}
                className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                Accept
              </button>
            ) : status === 'pending_sent' ? (
              <button
                disabled
                className="flex-1 py-2 px-3 bg-slate-100 text-slate-500 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-not-allowed border border-slate-200/60"
              >
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                Requested
              </button>
            ) : (
              <button
                onClick={handleSendConnection}
                disabled={actionLoading}
                className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-200 disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    Connect
                  </>
                )}
              </button>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default StudentCard;
