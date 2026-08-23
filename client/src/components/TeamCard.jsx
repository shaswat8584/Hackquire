import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, AlertCircle, CheckCircle2, Clock, UserMinus, Shield, MessageSquare } from 'lucide-react';

const TeamCard = ({
  team,
  currentUserId,
  onFindCandidates,
  onInviteMember,
  onUpdateMember,
  onLeaveTeam,
}) => {
  const navigate = useNavigate();
  if (!team) return null;


  const isOwner = team.owner?._id === currentUserId || team.owner === currentUserId;
  const isMember = (team.members || []).some(
    (m) => (m.user?._id === currentUserId || m.user === currentUserId) && m.status === 'accepted'
  );

  // Group accepted members by role
  const acceptedMembers = (team.members || []).filter((m) => m.status === 'accepted');
  const pendingMembers = (team.members || []).filter((m) => m.status === 'pending');

  // Compute filled and missing roles based on requiredRoles
  const requiredRoles = team.requiredRoles && team.requiredRoles.length > 0
    ? team.requiredRoles
    : ['Frontend Developer', 'Backend Developer', 'UI/UX Designer'];

  // Map each required role to its assigned member if any
  const roleSlots = requiredRoles.map((role) => {
    const assigned = acceptedMembers.find((m) => m.role.toLowerCase() === role.toLowerCase());
    return {
      role,
      assignedUser: assigned ? assigned.user : null,
      isFilled: !!assigned,
    };
  });

  // Also include any members with custom roles not in requiredRoles list
  const otherMembers = acceptedMembers.filter(
    (m) => !requiredRoles.some((r) => r.toLowerCase() === m.role.toLowerCase())
  );

  const missingRoles = roleSlots.filter((slot) => !slot.isFilled);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
      {/* Team Header */}
      <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900">{team.name}</h3>
            {isOwner && (
              <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-200/60 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Owner
              </span>
            )}
          </div>
          {team.opportunity && (
            <p className="text-xs font-semibold text-sky-600 mt-0.5">
              Project: {team.opportunity.title || 'Linked Opportunity'}
            </p>
          )}
          {team.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{team.description}</p>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60 shrink-0 whitespace-nowrap">
          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{acceptedMembers.length} active</span>
        </div>
      </div>

      {/* Role Structure Tree (Section 8 Spec) */}
      <div className="mb-5 bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs shadow-inner">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <span>TEAM STRUCTURE</span>
        </div>

        <div className="space-y-2.5">
          {roleSlots.map((slot, idx) => (
            <div key={idx} className="leading-tight">
              <div className="font-semibold text-slate-300">{slot.role}</div>
              <div className="pl-4 flex items-center justify-between text-slate-200 mt-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">└──</span>
                  {slot.isFilled ? (
                    <span className="text-emerald-400 font-medium">
                      {slot.assignedUser?.name || 'Assigned Student'}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">Available</span>
                  )}
                </div>

                {!slot.isFilled && isOwner && (
                  <button
                    onClick={() => onFindCandidates && onFindCandidates(team, slot.role)}
                    className="text-[10px] text-sky-400 hover:text-sky-300 underline font-sans"
                  >
                    Find Candidate
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Additional members outside primary role slots */}
          {otherMembers.map((m, idx) => (
            <div key={`other-${idx}`} className="leading-tight">
              <div className="font-semibold text-slate-300">{m.role}</div>
              <div className="pl-4 flex items-center gap-2 text-emerald-400 font-medium mt-0.5">
                <span className="text-slate-500">└──</span>
                <span>{m.user?.name || 'Student'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Missing Role Warning Alerts (Section 8 Spec) */}
      {missingRoles.length > 0 && (
        <div className="space-y-2 mb-5">
          {missingRoles.map((slot, idx) => (
            <div
              key={idx}
              className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2 text-amber-800 font-medium">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>⚠ {slot.role} Needed</span>
              </div>
              <button
                onClick={() => onFindCandidates && onFindCandidates(team, slot.role)}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-sm"
              >
                Find Candidates
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pending Invitations Section */}
      {pendingMembers.length > 0 && (
        <div className="mb-4 p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs">
          <p className="font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" /> Pending Invitations ({pendingMembers.length})
          </p>
          <div className="space-y-1.5">
            {pendingMembers.map((m, idx) => {
              const isInvitedUser = m.user?._id === currentUserId;
              return (
                <div key={idx} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200/50">
                  <div className="flex items-center gap-2">
                    <img
                      src={m.user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt=""
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-medium text-slate-800">{m.user?.name}</span>
                    <span className="text-slate-400">({m.role})</span>
                  </div>

                  {isInvitedUser && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onUpdateMember && onUpdateMember(team._id, { userId: currentUserId, action: 'accept' })}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => onUpdateMember && onUpdateMember(team._id, { userId: currentUserId, action: 'reject' })}
                        className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[11px] font-semibold"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {!isInvitedUser && isOwner && (
                    <button
                      onClick={() => onUpdateMember && onUpdateMember(team._id, { userId: m.user?._id, action: 'remove' })}
                      className="text-rose-600 hover:text-rose-700 text-[11px] font-semibold"
                    >
                      Cancel Invite
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        {(isOwner || isMember) && (
          <button
            onClick={() => navigate(`/messages?team=${team._id}`)}
            className="flex-1 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-indigo-200/80"
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
            Team Chat
          </button>
        )}

        {isOwner ? (
          <button
            onClick={() => onInviteMember && onInviteMember(team)}
            className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-200"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Invite Member
          </button>
        ) : isMember ? (
          <button
            onClick={() => onLeaveTeam && onLeaveTeam(team._id)}
            className="flex-1 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-rose-200"
          >
            <UserMinus className="w-3.5 h-3.5" />
            Leave Team
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default TeamCard;

