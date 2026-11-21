import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, MessageSquare, Briefcase, Sparkles } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import EmptyState from '../components/EmptyState';

export default function MessagesPage() {
  const { user } = useAuth();
  const { fetchUnreadCount } = useNotifications();
  const [searchParams] = useSearchParams();
  const requestedConvId = searchParams.get('conversation_id');

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);
  const isNearBottomRef = useRef(true);
  const shouldScrollToBottomRef = useRef(true);

  const scrollToBottom = (behavior = 'smooth') => {
    const container = messageContainerRef.current;
    if (container) {
      if (typeof container.scrollTo === 'function') {
        container.scrollTo({
          top: container.scrollHeight,
          behavior,
        });
      } else {
        container.scrollTop = container.scrollHeight;
      }
    }
  };

  const handleScroll = () => {
    const container = messageContainerRef.current;
    if (!container) return;
    const threshold = 120;
    const near = container.scrollHeight - container.scrollTop - container.clientHeight <= threshold;
    isNearBottomRef.current = near;
    setIsNearBottom((prev) => (prev !== near ? near : prev));
  };

  const handleSelectConv = (conv) => {
    if (activeConv?.id === conv.id) return;
    setActiveConv(conv);
  };

  const fetchConversations = async () => {
    try {
      const res = await api.get('/chat/conversations');
      const convList = res.data;
      setConversations(convList);

      if (convList.length > 0) {
        if (requestedConvId) {
          const found = convList.find((c) => c.id === Number(requestedConvId));
          setActiveConv(found || convList[0]);
        } else if (!activeConv) {
          setActiveConv(convList[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId) => {
    try {
      const res = await api.get(`/chat/conversations/${convId}/messages`);
      setMessages((prev) => {
        // Prevent re-rendering and jump if messages haven't changed
        if (
          prev.length === res.data.length &&
          prev.length > 0 &&
          prev[prev.length - 1]?.id === res.data[res.data.length - 1]?.id
        ) {
          return prev;
        }
        return res.data;
      });

      // Clear unread count for this conversation in the local sidebar
      setConversations((prev) =>
        prev.map((c) => (c.id === convId && c.unread_count > 0 ? { ...c, unread_count: 0 } : c))
      );

      // Refresh global message notification badges across Navbar and Sidebar
      if (typeof fetchUnreadCount === 'function') {
        fetchUnreadCount();
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [requestedConvId]);

  useEffect(() => {
    if (activeConv) {
      shouldScrollToBottomRef.current = true;
      isNearBottomRef.current = true;
      setIsNearBottom(true);
      fetchMessages(activeConv.id);
      const interval = setInterval(() => fetchMessages(activeConv.id), 5000);
      return () => clearInterval(interval);
    }
  }, [activeConv?.id]);

  useEffect(() => {
    if (messages.length === 0) return;
    if (shouldScrollToBottomRef.current || isNearBottomRef.current) {
      const behavior = shouldScrollToBottomRef.current ? 'auto' : 'smooth';
      const timer = setTimeout(() => {
        scrollToBottom(behavior);
        shouldScrollToBottomRef.current = false;
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;

    const content = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const res = await api.post(`/chat/conversations/${activeConv.id}/messages`, { content });
      shouldScrollToBottomRef.current = true;
      isNearBottomRef.current = true;
      setIsNearBottom(true);
      setMessages((prev) => [...prev, res.data]);

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConv.id
            ? { ...c, last_message: { content }, updated_at: new Date().toISOString() }
            : c
        )
      );
    } catch (err) {
      alert('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const isRecruiter = user?.role === 'RECRUITER';

  if (loading) {
    return <div className="max-w-[1280px] mx-auto py-16 text-center text-xs text-secondary animate-pulse">Loading messaging center...</div>;
  }

  if (conversations.length === 0) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 py-12">
        <EmptyState
          icon={MessageSquare}
          title="No Active Conversations"
          description={
            isRecruiter
              ? "When applicants connect or you initiate discussions with candidates, channels will appear here."
              : "When you apply for opportunities or reach out to recruiters, direct messaging will appear here."
          }
          actionLabel={isRecruiter ? "Review Dashboard" : "Find Opportunities"}
          actionLink={isRecruiter ? "/" : "/jobs"}
        />
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col md:flex-row h-[75vh]">
        
        {/* Left: Channels Sidebar */}
        <div className="w-full md:w-80 border-r border-[#E2E8F0] flex flex-col bg-[#F8FAFC]">
          <div className="p-4 border-b border-[#E2E8F0] bg-white">
            <h2 className="text-sm font-bold text-[#0F172A]">Direct Messages</h2>
            <p className="text-[11px] text-[#64748B]">Persistent recruiter-candidate channels</p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {conversations.map((conv) => {
              const isActive = activeConv?.id === conv.id;
              const otherParty = conv.other_party_name 
                || (isRecruiter ? conv.seeker_name : conv.recruiter_name)
                || conv.participant?.full_name 
                || 'Direct Channel';

              const lastMsgText = typeof conv.last_message === 'object' && conv.last_message !== null
                ? conv.last_message.content
                : (typeof conv.last_message === 'string' ? conv.last_message : 'Channel opened');

              const formattedTime = conv.updated_at 
                ? new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '';

              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConv(conv)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isActive ? 'bg-white border-l-4 border-l-[#4F46E5]' : 'hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <p className="font-bold text-xs text-[#0F172A] line-clamp-1">{otherParty}</p>
                      {conv.unread_count > 0 && !isActive && (
                        <span className="min-w-[16px] h-4 px-1 rounded-full bg-[#F97316] text-white text-[10px] font-bold inline-flex items-center justify-center flex-shrink-0 animate-pulse shadow-xs">
                          {conv.unread_count > 9 ? '9+' : conv.unread_count}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#64748B] flex-shrink-0">
                      {formattedTime}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#4F46E5] font-semibold mt-0.5 line-clamp-1">{conv.job_title || 'General Inquiry'}</p>
                  <p className="text-[11px] text-[#64748B] mt-1 line-clamp-1">{lastMsgText}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Message Window */}
        <div className="flex-1 flex flex-col bg-white relative">
          
          {/* Persistent Job Context Header */}
          {activeConv && (
            <div className="p-4 border-b border-[#E2E8F0] bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">
                  {activeConv.other_party_name 
                    || (isRecruiter ? activeConv.seeker_name : activeConv.recruiter_name)
                    || activeConv.participant?.full_name 
                    || 'Direct Channel'}
                </h3>
                <p className="text-xs text-[#4F46E5] font-semibold">
                  {activeConv.job_title || 'General Inquiry'} {activeConv.company_name ? `· ${activeConv.company_name}` : ''}
                </p>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFEFF] text-[#0E7490] border border-[#A5F3FC] text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#06B6D4]" />
                <span>Context Connected</span>
              </div>
            </div>
          )}

          {/* Messages Feed */}
          <div
            ref={messageContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-6 space-y-3 bg-[#F8FAFC]"
          >
            {messages.map((msg) => {
              const isMine = msg.sender_id === user?.id || msg.is_me;
              const msgTime = msg.created_at 
                ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                : '';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-md p-3.5 rounded-[14px] text-xs leading-relaxed ${
                      isMine
                        ? 'bg-[#4F46E5] text-white rounded-br-xs shadow-xs'
                        : 'bg-white text-[#0F172A] border border-[#E2E8F0] rounded-bl-xs shadow-xs'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-[#64748B] mt-1 px-1">
                    {msgTime}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Jump to latest button if user scrolled up */}
          {!isNearBottom && (
            <button
              type="button"
              onClick={() => {
                isNearBottomRef.current = true;
                setIsNearBottom(true);
                scrollToBottom('smooth');
              }}
              className="absolute bottom-20 right-8 bg-white border border-[#E2E8F0] shadow-md hover:bg-slate-50 text-[#4F46E5] text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer z-10"
            >
              <span>Jump to latest</span>
              <span>↓</span>
            </button>
          )}

          {/* Input Box */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-[#E2E8F0] bg-white flex items-center gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message or schedule inquiry..."
              className="flex-1 px-4 py-2.5 text-xs rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] focus-ring text-[#0F172A]"
            />
            <button
              type="submit"
              disabled={sending || !inputText.trim()}
              className="px-5 py-2.5 rounded-[10px] bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              Send
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
