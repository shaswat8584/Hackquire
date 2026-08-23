import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useConnection } from '../context/ConnectionContext';
import { useChat } from '../context/ChatContext';
import { matchingAPI } from '../services/api';
import StudentCard from '../components/StudentCard';
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Clock,
  Search,
  MessageSquare,
  Sparkles,
  Compass,
  ArrowRight,
  Shield,
  CheckCircle2,
  Filter,
} from 'lucide-react';

const Network = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isUserOnline } = useChat();
  const {
    connections,
    loading: connectionsLoading,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    removeConnection,
    fetchConnections,
  } = useConnection();

  const [activeTab, setActiveTab] = useState('accepted'); // 'accepted' | 'incoming' | 'outgoing' | 'discover'
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedStudents, setSuggestedStudents] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  // Load recommended peers for discovery
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoadingSuggestions(true);
        const res = await matchingAPI.getRecommendedStudents();
        if (res.data?.recommendations) {
          setSuggestedStudents(res.data.recommendations);
        }
      } catch (err) {
        console.error('[Fetch Suggestions Error]', err);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchSuggestions();
  }, []);

  const handleAccept = async (connectionId) => {
    const res = await acceptRequest(connectionId);
    if (res.success) {
      setActionFeedback({ type: 'success', text: 'Connection accepted!' });
      setTimeout(() => setActionFeedback(null), 3000);
    }
  };

  const handleReject = async (connectionId) => {
    const res = await rejectRequest(connectionId);
    if (res.success) {
      setActionFeedback({ type: 'info', text: 'Connection request declined' });
      setTimeout(() => setActionFeedback(null), 3000);
    }
  };

  const handleCancel = async (connectionId) => {
    const res = await cancelRequest(connectionId);
    if (res.success) {
      setActionFeedback({ type: 'info', text: 'Connection request cancelled' });
      setTimeout(() => setActionFeedback(null), 3000);
    }
  };

  const handleRemove = async (connectionId) => {
    if (window.confirm('Are you sure you want to remove this connection?')) {
      const res = await removeConnection(connectionId);
      if (res.success) {
        setActionFeedback({ type: 'info', text: 'Connection removed' });
        setTimeout(() => setActionFeedback(null), 3000);
      }
    }
  };

  // Filter accepted friends
  const filteredFriends = connections.accepted.filter((conn) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const peer = conn.peer;
    return (
      peer?.name?.toLowerCase().includes(q) ||
      peer?.email?.toLowerCase().includes(q) ||
      peer?.skills?.some((s) => s.toLowerCase().includes(q)) ||
      peer?.preferredRoles?.some((r) => r.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-sky-400 mb-2 uppercase tracking-wider">
              <Users className="w-4 h-4" /> My Student Network
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Connections & Peers
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
              Connect with talented student developers, manage peer invitations, and collaborate on hackathons and projects.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/messages"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm backdrop-blur-sm"
            >
              <MessageSquare className="w-4 h-4 text-sky-300" />
              Open Messages
            </Link>
            <Link
              to="/skillmatch"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              <Sparkles className="w-4 h-4" />
              Discover Matches
            </Link>
          </div>
        </div>

        {/* Decorative Background Glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div
          onClick={() => setActiveTab('accepted')}
          className={`cursor-pointer bg-white rounded-2xl p-5 border transition-all ${
            activeTab === 'accepted'
              ? 'border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
              : 'border-slate-200/80 shadow-xs hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Connected Friends</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{connections.counts.accepted}</p>
          <p className="text-[11px] text-slate-400 mt-1">Active peer connections</p>
        </div>

        <div
          onClick={() => setActiveTab('incoming')}
          className={`cursor-pointer bg-white rounded-2xl p-5 border transition-all ${
            activeTab === 'incoming'
              ? 'border-amber-500 shadow-md ring-2 ring-amber-500/20'
              : 'border-slate-200/80 shadow-xs hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Requests Received</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-3xl font-black text-slate-900">{connections.counts.pendingIncoming}</p>
            {connections.counts.pendingIncoming > 0 && (
              <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                Action needed
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Pending invitations to accept</p>
        </div>

        <div
          onClick={() => setActiveTab('outgoing')}
          className={`cursor-pointer bg-white rounded-2xl p-5 border transition-all ${
            activeTab === 'outgoing'
              ? 'border-sky-500 shadow-md ring-2 ring-sky-500/20'
              : 'border-slate-200/80 shadow-xs hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Requests Sent</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{connections.counts.pendingOutgoing}</p>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting peer response</p>
        </div>
      </div>

      {/* Action Notification Feedback */}
      {actionFeedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-slate-100 text-slate-800 border border-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionFeedback.text}</span>
        </div>
      )}

      {/* Main Tab Bar & Search */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('accepted')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'accepted'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>All Friends ({connections.counts.accepted})</span>
            </button>

            <button
              onClick={() => setActiveTab('incoming')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'incoming'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Requests Received ({connections.counts.pendingIncoming})</span>
              {connections.counts.pendingIncoming > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('outgoing')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'outgoing'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sent Requests ({connections.counts.pendingOutgoing})</span>
            </button>

            <button
              onClick={() => setActiveTab('discover')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'discover'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Find Peers</span>
            </button>
          </div>

          {/* Search Box */}
          {activeTab === 'accepted' && (
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search friends by name, role, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Tab 1: Connected Friends */}
        {activeTab === 'accepted' && (
          <div>
            {filteredFriends.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800">
                  {searchQuery ? 'No matching friends found' : 'No connections yet'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {searchQuery
                    ? 'Try searching with different keywords.'
                    : 'Discover other students with matching skills in SkillMatch and start connecting!'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => setActiveTab('discover')}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-indigo-700 transition-colors inline-flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Discover Students
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredFriends.map((conn) => {
                  const peer = conn.peer;
                  const online = isUserOnline(peer?._id);

                  return (
                    <div
                      key={conn.connectionId}
                      className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-indigo-200 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Header: Avatar, Online Dot, Name */}
                        <div className="flex items-start gap-3.5 mb-3">
                          <div className="relative shrink-0">
                            <img
                              src={
                                peer?.profileImage ||
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                              }
                              alt=""
                              className="w-14 h-14 rounded-full object-cover border border-slate-200"
                            />
                            {online && (
                              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-base font-bold text-slate-900 truncate">{peer?.name}</h4>
                            <p className="text-xs text-indigo-600 font-semibold truncate mt-0.5">
                              {peer?.preferredRoles?.[0] || peer?.experienceLevel || 'Student Developer'}
                            </p>
                            <span className="text-[11px] text-slate-400 truncate block mt-0.5">
                              {peer?.email}
                            </span>
                          </div>
                        </div>

                        {/* Bio */}
                        {peer?.bio && (
                          <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                            {peer.bio}
                          </p>
                        )}

                        {/* Skills */}
                        {peer?.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {peer.skills.slice(0, 4).map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded-md"
                              >
                                {skill}
                              </span>
                            ))}
                            {peer.skills.length > 4 && (
                              <span className="text-[10px] text-slate-400 font-bold self-center">
                                +{peer.skills.length - 4}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/messages?user=${peer?._id}`)}
                          className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-200"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Message
                        </button>
                        <button
                          onClick={() => handleRemove(conn.connectionId)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Remove connection"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Incoming Requests */}
        {activeTab === 'incoming' && (
          <div>
            {connections.pendingIncoming.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100">
                <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800">No pending connection requests</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  When other student developers send you an invitation, it will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {connections.pendingIncoming.map((req) => (
                  <div
                    key={req.connectionId}
                    className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <img
                        src={
                          req.requester?.profileImage ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                        }
                        alt=""
                        className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {req.requester?.name}
                        </h4>
                        <p className="text-xs text-indigo-600 font-semibold truncate mt-0.5">
                          {req.requester?.preferredRoles?.[0] || 'Student Builder'}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                          {req.requester?.bio}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleAccept(req.connectionId)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <UserCheck className="w-4 h-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(req.connectionId)}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Outgoing Pending Requests */}
        {activeTab === 'outgoing' && (
          <div>
            {connections.pendingOutgoing.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100">
                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800">No outgoing requests</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  You don't have any pending requests sent to other students.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {connections.pendingOutgoing.map((req) => (
                  <div
                    key={req.connectionId}
                    className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={
                          req.recipient?.profileImage ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                        }
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {req.recipient?.name}
                        </h4>
                        <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> Awaiting approval
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCancel(req.connectionId)}
                      className="px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 font-bold bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                    >
                      Cancel Request
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Discover Peers via SkillMatch Recommendations */}
        {activeTab === 'discover' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recommended Teammates for You</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ranked by 60% skills + 20% interest + 20% availability matching engine
                </p>
              </div>

              <Link
                to="/skillmatch"
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
              >
                <span>Full SkillMatch Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loadingSuggestions ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 bg-slate-200 rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestedStudents.map((item, idx) => (
                  <StudentCard
                    key={idx}
                    student={item.student}
                    matchScore={item.matchScore}
                    breakdown={item.breakdown}
                    reasons={item.reasons}
                    onViewProfile={(student) => navigate('/skillmatch')}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Network;
