import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, MessageSquare, Briefcase, Sparkles } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/EmptyState';

export default function MessagesPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const requestedConvId = searchParams.get('conversation_id');

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

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
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [requestedConvId]);

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv.id);
      const interval = setInterval(() => fetchMessages(activeConv.id), 5000);
      return () => clearInterval(interval);
    }
  }, [activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;

    const content = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const res = await api.post(`/chat/conversations/${activeConv.id}/messages`, { content });
      setMessages((prev) => [...prev, res.data]);
    } catch (err) {
      alert('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="max-w-[1280px] mx-auto py-16 text-center text-xs text-secondary animate-pulse">Loading messaging center...</div>;
  }

  if (conversations.length === 0) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 py-12">
        <EmptyState
          icon={MessageSquare}
          title="No Active Conversations"
          description="When you apply for opportunities or reach out to recruiters, direct messaging will appear here."
          actionLabel="Find Opportunities"
          actionLink="/jobs"
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
              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConv(conv)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isActive ? 'bg-white border-l-4 border-l-[#4F46E5]' : 'hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-xs text-[#0F172A] line-clamp-1">{conv.other_party_name}</p>
                    <span className="text-[10px] text-[#64748B] flex-shrink-0">
                      {new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#4F46E5] font-semibold mt-0.5 line-clamp-1">{conv.job_title}</p>
                  <p className="text-[11px] text-[#64748B] mt-1 line-clamp-1">{conv.last_message || 'Channel opened'}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Message Window */}
        <div className="flex-1 flex flex-col bg-white">
          
          {/* Persistent Job Context Header */}
          {activeConv && (
            <div className="p-4 border-b border-[#E2E8F0] bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">{activeConv.other_party_name}</h3>
                <p className="text-xs text-[#4F46E5] font-semibold">{activeConv.job_title} · {activeConv.company_name}</p>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFEFF] text-[#0E7490] border border-[#A5F3FC] text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#06B6D4]" />
                <span>Context Connected</span>
              </div>
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-[#F8FAFC]">
            {messages.map((msg) => {
              const isMine = msg.sender_id === user?.id;
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
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

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
