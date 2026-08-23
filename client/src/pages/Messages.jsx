import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useConnection } from '../context/ConnectionContext';
import {
  MessageSquare,
  Users,
  Shield,
  Search,
  Send,
  Sparkles,
  Check,
  CheckCheck,
  Circle,
  Clock,
  ArrowLeft,
  UserPlus,
  UserCheck,
  Info,
  ExternalLink,
  Smile,
  Hash,
  Compass,
  Layers,
  ChevronRight,
  MoreVertical,
  Paperclip,
} from 'lucide-react';

const emojiList = ['👋', '🚀', '🔥', '💡', '🎉', '💻', '🤝', '⭐', '✨', '👍', '🎯', '🙌'];


const Messages = () => {
  const { id: paramConvId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    conversations,
    activeConversationId,
    activeConversation,
    messages,
    loadingConversations,
    loadingMessages,
    sendingMessage,
    selectConversation,
    startDirectChat,
    openTeamChat,
    sendMessage,
    sendTypingNotification,
    isUserOnline,
    activeTypingUsers,
  } = useChat();

  const {
    connections,
    sendRequest,
    acceptRequest,
    getConnectionStatus,
  } = useConnection();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'direct' | 'team' | 'friends'
  const [searchQuery, setSearchQuery] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [showInfoDrawer, setShowInfoDrawer] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMobileList, setShowMobileList] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Handle URL param or query initialization
  useEffect(() => {
    const directUserId = searchParams.get('user');
    const teamId = searchParams.get('team');

    if (directUserId) {
      startDirectChat(directUserId);
      setShowMobileList(false);
    } else if (teamId) {
      openTeamChat(teamId);
      setShowMobileList(false);
    } else if (paramConvId) {
      selectConversation(paramConvId);
      setShowMobileList(false);
    } else if (!activeConversationId && conversations.length > 0 && window.innerWidth >= 1024) {
      // Auto-select first conversation on desktop if none selected
      selectConversation(conversations[0]._id);
    }
  }, [paramConvId, searchParams, conversations.length]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTypingUsers]);

  // Determine peer user for 1-on-1 direct conversation
  const getDirectPeer = (conv) => {
    if (!conv || conv.type !== 'direct') return null;
    return conv.participants?.find((p) => p._id?.toString() !== user?._id?.toString());
  };

  const currentPeer = activeConversation ? getDirectPeer(activeConversation) : null;
  const isDirect = activeConversation?.type === 'direct';
  const isTeam = activeConversation?.type === 'team';

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    // Tab filter
    if (activeTab === 'direct' && conv.type !== 'direct') return false;
    if (activeTab === 'team' && conv.type !== 'team') return false;

    // Search query filter
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();

    if (conv.type === 'direct') {
      const peer = getDirectPeer(conv);
      return (
        peer?.name?.toLowerCase().includes(query) ||
        peer?.skills?.some((s) => s.toLowerCase().includes(query)) ||
        peer?.preferredRoles?.some((r) => r.toLowerCase().includes(query))
      );
    } else if (conv.type === 'team') {
      return (
        conv.team?.name?.toLowerCase().includes(query) ||
        conv.team?.description?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Filter friends list
  const filteredFriends = connections.accepted.filter((conn) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      conn.peer?.name?.toLowerCase().includes(q) ||
      conn.peer?.skills?.some((s) => s.toLowerCase().includes(q))
    );
  });

  const handleSelectChat = (convId) => {
    selectConversation(convId);
    setShowMobileList(false);
  };

  const handleStartChatWithFriend = async (friendId) => {
    await startDirectChat(friendId);
    setShowMobileList(false);
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const text = inputMessage.trim();
    if (!text || sendingMessage) return;

    setInputMessage('');
    setShowEmojiPicker(false);
    await sendMessage(text);
    inputRef.current?.focus();
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    sendTypingNotification();
  };

  const handleEmojiClick = (emoji) => {
    setInputMessage((prev) => prev + emoji);
    inputRef.current?.focus();
  };


  // Format message time
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date divider
  const formatDateDivider = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((acc, msg) => {
    const dateKey = new Date(msg.createdAt || Date.now()).toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(msg);
    return acc;
  }, {});

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
      <div className="flex-1 flex min-h-0 relative">
        {/* ================= LEFT SIDEBAR (CONVERSATIONS LIST) ================= */}
        <div
          className={`w-full lg:w-80 xl:w-96 border-r border-slate-200/80 bg-slate-50/70 flex flex-col shrink-0 transition-all duration-200 ${
            !showMobileList ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-200/80 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h1 className="text-base font-black text-slate-900 tracking-tight">Messages</h1>
              </div>

              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                {conversations.length} Active
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search conversations, skills, friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs border border-transparent focus:border-indigo-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 mt-3 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  activeTab === 'all'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('direct')}
                className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  activeTab === 'direct'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                1:1 Direct
              </button>
              <button
                onClick={() => setActiveTab('team')}
                className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  activeTab === 'team'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Squads
              </button>
              <button
                onClick={() => setActiveTab('friends')}
                className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'friends'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Network</span>
                {connections.counts.accepted > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                )}
              </button>
            </div>
          </div>

          {/* Conversations or Friends List Body */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {activeTab === 'friends' ? (
              /* Network / Friends View */
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Connected Peers ({filteredFriends.length})
                  </span>
                  <button
                    onClick={() => navigate('/dashboard?tab=network')}
                    className="text-[11px] text-indigo-600 hover:underline font-semibold"
                  >
                    Manage Requests
                  </button>
                </div>

                {filteredFriends.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <UserPlus className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700">No connected friends yet</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Connect with student developers from SkillMatch or Project squads!
                    </p>
                    <button
                      onClick={() => navigate('/skillmatch')}
                      className="mt-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-sm"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      Browse SkillMatch
                    </button>
                  </div>
                ) : (
                  filteredFriends.map((conn) => {
                    const peer = conn.peer;
                    const online = isUserOnline(peer?._id);
                    return (
                      <div
                        key={conn.connectionId}
                        className="bg-white p-3 rounded-2xl border border-slate-200/70 hover:border-indigo-200 hover:shadow-sm transition-all flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative shrink-0">
                            <img
                              src={peer?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                              alt={peer?.name}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200"
                            />
                            {online && (
                              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate">{peer?.name}</h4>
                            <p className="text-[11px] text-slate-500 truncate">
                              {peer?.preferredRoles?.[0] || peer?.skills?.[0] || 'Student Builder'}
                            </p>
                            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                              <Check className="w-2.5 h-2.5" /> Connected
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleStartChatWithFriend(peer?._id)}
                          className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1 shrink-0"
                          title="Open direct message"
                        >
                          <Send className="w-3 h-3" />
                          <span>Chat</span>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              /* Regular Conversations Feed */
              <>
                {loadingConversations && conversations.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading conversations...
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700">No conversations found</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Start a chat with a teammate or project squad.
                    </p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => {
                    const isSelected = activeConversationId?.toString() === conv._id?.toString();
                    const isDirectType = conv.type === 'direct';
                    const peer = isDirectType ? getDirectPeer(conv) : null;
                    const online = isDirectType && peer ? isUserOnline(peer._id) : false;

                    const title = isDirectType ? peer?.name || 'Student' : conv.team?.name || 'Team Squad';
                    const avatar = isDirectType ? peer?.profileImage : null;
                    const lastMsgText = conv.lastMessage?.text || 'No messages yet';
                    const unread = conv.unreadCount || 0;

                    return (
                      <div
                        key={conv._id}
                        onClick={() => handleSelectChat(conv._id)}
                        className={`p-3.5 transition-all cursor-pointer flex items-start gap-3 select-none ${
                          isSelected
                            ? 'bg-indigo-50/80 border-l-4 border-indigo-600'
                            : 'hover:bg-slate-100/70'
                        }`}
                      >
                        {/* Avatar / Icon */}
                        <div className="relative shrink-0 mt-0.5">
                          {isDirectType ? (
                            <img
                              src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                              alt={title}
                              className="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-sm"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-slate-800 text-white flex items-center justify-center font-bold shadow-sm">
                              <Shield className="w-5 h-5" />
                            </div>
                          )}

                          {online && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                          )}
                        </div>

                        {/* Title & Preview */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <h3
                              className={`text-xs truncate ${
                                isSelected || unread > 0
                                  ? 'font-bold text-slate-900'
                                  : 'font-semibold text-slate-800'
                              }`}
                            >
                              {title}
                            </h3>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {formatTime(conv.lastMessageAt || conv.updatedAt)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            {!isDirectType && (
                              <span className="text-[10px] font-bold text-indigo-600 uppercase bg-indigo-50 px-1 py-0.2 rounded shrink-0">
                                Squad
                              </span>
                            )}
                            <p
                              className={`truncate text-xs ${
                                unread > 0 ? 'font-bold text-slate-900' : 'text-slate-500'
                              }`}
                            >
                              {lastMsgText}
                            </p>
                          </div>
                        </div>

                        {/* Unread Badge Pill */}
                        {unread > 0 && (
                          <span className="mt-1 px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-black rounded-full shadow-sm shrink-0">
                            {unread}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </>
            )}
          </div>
        </div>

        {/* ================= CENTER / CHAT WINDOW CANVAS ================= */}
        <div
          className={`flex-1 flex flex-col bg-slate-50/50 min-w-0 transition-all duration-200 ${
            showMobileList ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {activeConversation ? (
            <>
              {/* Active Chat Header */}
              <div className="px-4 py-3 bg-white border-b border-slate-200/80 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setShowMobileList(true)}
                    className="p-1.5 -ml-1 text-slate-500 hover:text-slate-900 rounded-lg lg:hidden"
                    title="Back to conversations"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="relative shrink-0">
                    {isDirect ? (
                      <img
                        src={currentPeer?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                        <Shield className="w-5 h-5" />
                      </div>
                    )}
                    {isDirect && currentPeer && isUserOnline(currentPeer._id) && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-sm font-bold text-slate-900 truncate">
                      {isDirect ? currentPeer?.name : activeConversation.team?.name}
                    </h2>
                    <div className="flex items-center gap-2 text-[11px]">
                      {isDirect ? (
                        <span className="flex items-center gap-1 font-medium text-slate-500">
                          <Circle
                            className={`w-2 h-2 fill-current ${
                              isUserOnline(currentPeer?._id) ? 'text-emerald-500' : 'text-slate-300'
                            }`}
                          />
                          {isUserOnline(currentPeer?._id) ? 'Active now' : 'Offline'}
                          {currentPeer?.experienceLevel && (
                            <span className="text-slate-400">• {currentPeer.experienceLevel}</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-indigo-600 font-semibold flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {activeConversation.participants?.length || 0} squad members
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Header Actions */}
                <div className="flex items-center gap-2">
                  {isDirect && currentPeer && (
                    <button
                      onClick={() => navigate('/skillmatch')}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>SkillMatch</span>
                    </button>
                  )}

                  {isTeam && activeConversation.team?._id && (
                    <button
                      onClick={() => navigate('/teams')}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition-colors"
                    >
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Squad Roster</span>
                    </button>
                  )}

                  <button
                    onClick={() => setShowInfoDrawer(!showInfoDrawer)}
                    className={`p-2 rounded-xl text-slate-500 hover:text-slate-800 transition-colors ${
                      showInfoDrawer ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-100'
                    }`}
                    title="Toggle context drawer"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Message Feed Canvas */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {loadingMessages ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs">Loading messages...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400">
                    <div className="w-12 h-12 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-700">No messages yet</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      Send a message to introduce yourself, discuss hackathon ideas, or propose a project role!
                    </p>
                  </div>
                ) : (
                  Object.entries(groupedMessages).map(([dateLabel, msgs]) => (
                    <div key={dateLabel} className="space-y-3">
                      {/* Date Divider */}
                      <div className="flex items-center justify-center my-3">
                        <span className="px-3 py-1 bg-slate-200/80 text-slate-600 text-[10px] font-bold rounded-full uppercase tracking-wider shadow-xs">
                          {formatDateDivider(dateLabel)}
                        </span>
                      </div>

                      {/* Messages within Date Group */}
                      {msgs.map((msg) => {
                        const isMine =
                          msg.sender?._id?.toString() === user?._id?.toString() ||
                          msg.sender === user?._id?.toString();

                        const isReadByPeer = (msg.readBy || []).some(
                          (r) => r.user?._id?.toString() !== user?._id?.toString() && r.user !== user?._id?.toString()
                        );

                        return (
                          <div
                            key={msg._id}
                            className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                          >
                            {/* Peer Avatar in incoming team message */}
                            {!isMine && (
                              <img
                                src={
                                  msg.sender?.profileImage ||
                                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                                }
                                alt=""
                                className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0 mb-1"
                              />
                            )}

                            <div className={`max-w-[85%] sm:max-w-[70%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                              {/* Sender Name for incoming group messages */}
                              {!isMine && isTeam && (
                                <span className="text-[10px] font-bold text-slate-500 ml-2 mb-0.5">
                                  {msg.sender?.name || 'Teammate'}
                                </span>
                              )}

                              {/* Chat Bubble */}
                              <div
                                className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                                  isMine
                                    ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white rounded-br-xs'
                                    : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs'
                                }`}
                              >
                                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                              </div>

                              {/* Time & Read Status */}
                              <div className="flex items-center gap-1 mt-1 px-1">
                                <span className="text-[10px] text-slate-400">
                                  {formatTime(msg.createdAt)}
                                </span>
                                {isMine && (
                                  <span className="text-slate-400">
                                    {isReadByPeer ? (
                                      <CheckCheck className="w-3.5 h-3.5 text-indigo-500" />
                                    ) : (
                                      <Check className="w-3.5 h-3.5" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}

                {/* Typing Indicator */}
                {activeTypingUsers.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200/80 px-3.5 py-2 rounded-2xl w-fit shadow-xs animate-pulse">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                    <span className="text-[11px] font-medium">
                      {activeTypingUsers.map((t) => t.name).join(', ')} is typing...
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Footer Form */}
              <div className="p-3 sm:p-4 bg-white border-t border-slate-200/80 relative">

                {/* Emoji Picker Popup */}
                {showEmojiPicker && (
                  <div className="absolute bottom-16 left-4 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 grid grid-cols-6 gap-2 z-20 animate-fadeIn">
                    {emojiList.map((emoji, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleEmojiClick(emoji)}
                        className="text-lg hover:scale-125 transition-transform p-1"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
                    title="Add emoji"
                  >
                    <Smile className="w-5 h-5" />
                  </button>

                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={`Message ${isDirect ? currentPeer?.name || 'student' : 'squad channel'}...`}
                    value={inputMessage}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />

                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || sendingMessage}
                    className="p-2.5 sm:px-4 sm:py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-40 transition-all shadow-md shadow-indigo-200 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* Empty State when no conversation is selected */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/50">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white flex items-center justify-center shadow-xl shadow-indigo-200 mb-4 animate-bounce">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Your SkillBridge Messages</h2>
              <p className="text-xs text-slate-500 max-w-sm mb-6">
                Connect with matched peers, discuss hackathon ideas, and collaborate seamlessly in real-time.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => navigate('/skillmatch')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm inline-flex items-center gap-2"
                >
                  <Compass className="w-4 h-4" />
                  Explore SkillMatch
                </button>
                <button
                  onClick={() => navigate('/teams')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-2"
                >
                  <Layers className="w-4 h-4" />
                  View TeamForge
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ================= RIGHT CONTEXT DRAWER ================= */}
        {showInfoDrawer && activeConversation && (
          <div className="w-72 xl:w-80 border-l border-slate-200/80 bg-white p-5 flex flex-col overflow-y-auto shrink-0 animate-fadeIn">
            {isDirect && currentPeer ? (
              <div className="space-y-5">
                {/* Profile Snapshot */}
                <div className="text-center pb-4 border-b border-slate-100">
                  <img
                    src={currentPeer.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={currentPeer.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-indigo-100 mx-auto mb-2 shadow-sm"
                  />
                  <h3 className="text-sm font-bold text-slate-900">{currentPeer.name}</h3>
                  <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                    {currentPeer.preferredRoles?.[0] || currentPeer.experienceLevel || 'Student Developer'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{currentPeer.email}</p>
                </div>

                {/* Bio */}
                {currentPeer.bio && (
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">About</h4>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {currentPeer.bio}
                    </p>
                  </div>
                )}

                {/* Skills */}
                {currentPeer.skills?.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {currentPeer.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-md border border-indigo-100/60"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Availability */}
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Availability</h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{currentPeer.availability || 10} hours / week</span>
                  </div>
                </div>
              </div>
            ) : isTeam && activeConversation.team ? (
              <div className="space-y-5">
                <div className="pb-4 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-2 shadow-sm font-bold">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{activeConversation.team.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {activeConversation.team.description || 'Project collaboration squad.'}
                  </p>
                </div>

                {/* Squad Members Roster */}
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Squad Members ({activeConversation.participants?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {activeConversation.participants?.map((member) => (
                      <div
                        key={member._id}
                        className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={member.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{member.name}</p>
                            <span className="text-[10px] text-slate-400 truncate block">
                              {member.preferredRoles?.[0] || 'Member'}
                            </span>
                          </div>
                        </div>

                        {isUserOnline(member._id) && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
